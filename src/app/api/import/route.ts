import { NextResponse } from "next/server";
import { read, utils } from "xlsx";
import JSZip from "jszip";
import { v2 as cloudinary } from "cloudinary";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { serializeProductSnapshot, type ProductSnapshot } from "@/lib/import-snapshot";
//import { serializeProductSnapshot, type ImportSnapshot } from "@/lib/import-snapshot";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// One row of the Excel sheet, using the REAL column headers from FOOTCARE SITE.xlsx
interface ExcelRow {
  STORE?: string;
  BRAND?: string;
  DIVISION?: string;
  "PRODUCT NAME"?: string;
  "PRODUCT ARTICLE"?: string | number;
  "PRODUCT CATEGORY"?: string;
  "PRODUCT TYPE"?: string;
  COLOR?: string;
  GENDER?: string;
  "SIZE UK"?: string | number;
  "SIZE US"?: string | number;
  UNIT?: string | number;
  MRP?: string | number;
  DISCOUNT?: string | number;
  "SPECIAL CATEGORY"?: string;
  CATEGORY?: string;
}

interface MatchedImage {
  filename: string;
  articleNumber: string;
  imageIndex: number;
}

interface ColorGroup {
  colorName: string;
  sizes: Set<string>;
}

interface ProductGroup {
  articleNumber: string;
  name: string;
  brand: string;
  category: string;
  showroom: string;
  gender: string;
  productType: string;
  mrp: number;
  discount: number;
  division: string;
  productCategory: string;
  subCategory: string;
  colors: Map<string, ColorGroup>;
  images: MatchedImage[];
}

interface RowIssue {
  articleNumber: string;
  message: string;
}

const REQUIRED_COLUMNS = [
  "STORE",
  "BRAND",
  "PRODUCT NAME",
  "PRODUCT ARTICLE",
  "PRODUCT CATEGORY",
  "COLOR",
  "MRP",
];

// The exact showroom names as they exist (or should exist) in the database.
// STORE column values from Excel are mapped to one of these three via mapShowroom().
const SHOWROOM_NAMES = {
  KICK_SPORTS: "Footcare Kick Sports",
  MALL: "Foot Care Mall",
  STORE: "Foot Care Store",
} as const;

// Normalizes text used for matching (article numbers, color names) so that
// "PUMA Black-Pro Blue" and "puma black-pro blue " are treated as the same thing.
function normalizeForMatch(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Maps the Excel STORE column value (e.g. "kickSports", "store", "Mall")
// to the real showroom name. Checks the most distinctive word first so
// none of the three can accidentally match each other.
function mapShowroom(store: string): string {
  const s = store.toLowerCase().trim();

  if (s.includes("mall")) return SHOWROOM_NAMES.MALL;
  if (s.includes("kick") || s.includes("sport")) return SHOWROOM_NAMES.KICK_SPORTS;
  if (s.includes("store")) return SHOWROOM_NAMES.STORE;

  return SHOWROOM_NAMES.STORE; // Default fallback only if STORE column is blank/unrecognized
}

// Parses an image filename like:
//   30933601_PUMA Black-Pro Blue_01.png
// into { articleNumber: "30933601", imageIndex: 1 }
// Only the segment before the FIRST underscore (article number) and the
// segment after the LAST underscore (image index, for ordering) are used.
// Everything in between — color text, etc. — is ignored for matching.
function parseImageFilename(filename: string): MatchedImage | null {
  const baseName = filename.replace(/\.[^/.]+$/, "").trim();

  // Article number = the leading run of digits (all your examples fit this).
  const articleMatch = baseName.match(/^(\d+)/);
  if (!articleMatch) return null;
  const articleNumber = articleMatch[1];

  // Everything after the article, with a single leading separator stripped.
  const remainder = baseName
    .slice(articleNumber.length)
    .replace(/^[_\-]/, "")
    .trim();

  // Figure out the image index, if any. It's the last "_"- or "-"-separated
  // segment, and it only counts if it's purely digits.
  let imageIndex = 0;
  const lastSep = Math.max(remainder.lastIndexOf("_"), remainder.lastIndexOf("-"));
  const tail = lastSep === -1 ? remainder : remainder.slice(lastSep + 1).trim();

  if (tail !== "" && /^\d+$/.test(tail)) {
    imageIndex = parseInt(tail, 10);
  }

  return { filename, articleNumber, imageIndex };
}

async function uploadToCloudinary(buffer: Buffer, folder: string, publicId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder, public_id: publicId, resource_type: "image", overwrite: true },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
}

// Real showroom details, used ONLY if a showroom needs to be auto-created
// because it doesn't already exist in the database. These match the real
// addresses/hours/descriptions from MOCK_SHOWROOMS so a fresh database
// gets accurate showroom info instead of placeholder text.
const SHOWROOM_DEFAULTS: Record<
  string,
  {
    slug: string;
    address: string;
    mapsUrl: string;
    phone: string;
    email: string;
    openingTime: string;
    closingTime: string;
    heroImage: string;
    description: string;
  }
> = {
  [SHOWROOM_NAMES.KICK_SPORTS]: {
    slug: "kick-sports",
    address: "9A Royal plaza, Near Honest Hotel, College Road, Bhuj, Gujarat 370001",
    mapsUrl: "https://maps.google.com/?q=Footcare+Kick+Sports+College+Road+Bhuj",
    phone: "+91 98794 59303",
    email: "footcarebhuj@gmail.com",
    openingTime: "09:30 AM",
    closingTime: "09:00 PM",
    heroImage: "linear-gradient(to right bottom, #0f172a, #1e293b)",
    description:
      "Our athletic-focused showroom carrying the latest activewear and premium running ranges from Nike and Skechers.",
  },
  [SHOWROOM_NAMES.STORE]: {
    slug: "foot-care-store",
    address: "Opp. Mandvi Octroi, College Bhuj, Gujarat 370001, India",
    mapsUrl: "https://maps.google.com/?q=Foot+Care+Store+Station+Road+Bhuj",
    phone: "+91 98794 59303",
    email: "footcarebhuj@gmail.com",
    openingTime: "10:00 AM",
    closingTime: "09:30 PM",
    heroImage: "linear-gradient(to right bottom, #1e1b4b, #312e81)",
    description:
      "Our flagship retail store featuring comfort, casual, and lifestyle footwear collections including Puma and Jockey comfort wear.",
  },
  [SHOWROOM_NAMES.MALL]: {
    slug: "foot-care-mall",
    address: "Near Jay nagar Bus stop, Patel Tower 3, Near K.D Hero, Bhuj, Gujarat 370001",
    mapsUrl: "https://maps.google.com/?q=Royal+Arcade+Air+Force+Road+Bhuj",
    phone: "+91 98794 59303",
    email: "footcarebhuj@gmail.com",
    openingTime: "10:00 AM",
    closingTime: "10:00 PM",
    heroImage: "linear-gradient(to right bottom, #1c1917, #44403c)",
    description:
      "An upscale shopping experience displaying premium apparel, accessories, and formal shoes for the whole family.",
  },
};

const MAX_IMPORT_BYTES = 100 * 1024 * 1024;

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_IMPORT_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 100MB." },
        { status: 413 }
      );
    }

    if (!file.name.endsWith(".zip")) {
      return NextResponse.json(
        { error: "Please upload a .zip file containing your Inventory Excel sheet and product images folder." },
        { status: 400 }
      );
    }

    // ---------- 1. Extract ZIP ----------
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const xlsxEntryName = Object.keys(zip.files).find(
      (name) => name.toLowerCase().endsWith(".xlsx") && !zip.files[name].dir
    );
    if (!xlsxEntryName) {
      return NextResponse.json(
        { error: "Could not find an Excel (.xlsx) file inside the ZIP." },
        { status: 400 }
      );
    }

    // ---------- 2. Parse Excel ----------
    const xlsxBuffer = await zip.files[xlsxEntryName].async("nodebuffer");
    const workbook = read(xlsxBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = utils.sheet_to_json<ExcelRow>(worksheet, { defval: "" });

    if (rows.length === 0) {
      return NextResponse.json({ error: "The Excel sheet is empty." }, { status: 400 });
    }

    const firstRowKeys = Object.keys(rows[0]);
    const missingColumns = REQUIRED_COLUMNS.filter((col) => !firstRowKeys.includes(col));
    if (missingColumns.length > 0) {
      return NextResponse.json(
        { error: `Missing required column(s) in Excel: ${missingColumns.join(", ")}` },
        { status: 400 }
      );
    }

    // ---------- 3. Group rows: PRODUCT ARTICLE -> COLOR -> sizes ----------
    const productGroups = new Map<string, ProductGroup>();
    const rowIssues: RowIssue[] = [];

    for (const row of rows) {
      const articleNumber = String(row["PRODUCT ARTICLE"] ?? "").trim();
      const name = String(row["PRODUCT NAME"] ?? "").trim();
      const colorName = String(row.COLOR ?? "").trim();

      if (!articleNumber || !name || !colorName) {
        rowIssues.push({
          articleNumber: articleNumber || "(blank)",
          message: "Row skipped: missing PRODUCT ARTICLE, PRODUCT NAME, or COLOR.",
        });
        continue;
      }

      let group = productGroups.get(articleNumber);
      if (!group) {
        group = {
          articleNumber,
          name,
          brand: String(row.BRAND ?? "Unknown").trim(),
          category: String(row["PRODUCT CATEGORY"] ?? "General").trim(),
          showroom: mapShowroom(String(row.STORE ?? "")),
          gender: String(row.GENDER ?? "").trim(),
          productType: String(row["PRODUCT TYPE"] ?? "").trim(),
          mrp: parseFloat(String(row.MRP).replace(/,/g, "")) || 0,
          discount: parseFloat(String(row.DISCOUNT).replace(/%/g, "")) || 0,
          division: String(row.DIVISION ?? "").trim(),
          productCategory: String(row["PRODUCT CATEGORY"] ?? "").trim(),
          subCategory: String(row.CATEGORY ?? row["PRODUCT TYPE"] ?? "").trim(),
          colors: new Map(),
          images: [],
        };
        productGroups.set(articleNumber, group);
      }

      let colorGroup = group.colors.get(normalizeForMatch(colorName));
      if (!colorGroup) {
        colorGroup = { colorName, sizes: new Set() };
        group.colors.set(normalizeForMatch(colorName), colorGroup);
      }

      // Sizes can be numeric (shoes: 7, 8, 9) or text (apparel: S, M, L, XL)
      const sizeUk = row["SIZE UK"];
      if (sizeUk !== undefined && sizeUk !== "") {
        colorGroup.sizes.add(String(sizeUk).trim());
      }
    }

    // ---------- 4. Match images in ZIP to product + color ----------
    const imageFileEntries = Object.keys(zip.files).filter((name) => {
      const entry = zip.files[name];
      return !entry.dir && /\.(png|jpe?g|webp)$/i.test(name);
    });

    const unmatchedImages: string[] = [];

    for (const entryPath of imageFileEntries) {
      const filename = entryPath.split("/").pop() || entryPath;
      const parsed = parseImageFilename(filename);

      if (!parsed) {
        unmatchedImages.push(filename);
        continue;
      }

      const group = productGroups.get(parsed.articleNumber);
      if (!group) {
        unmatchedImages.push(filename);
        continue;
      }

      group.images.push(parsed);
    }

    // ---------- 5. Save to database ----------
    const created: string[] = [];
    const updated: string[] = [];
    const updatedSnapshots: ProductSnapshot[] = [];
    const failed: { articleNumber: string; reason: string }[] = [];

    for (const group of productGroups.values()) {
      try {
        // Find or create Brand
        let brandObj = await db.brand.findFirst({
          where: { name: { equals: group.brand, mode: "insensitive" } },
        });
        if (!brandObj) {
          brandObj = await db.brand.create({
            data: {
              name: group.brand,
              slug: slugify(group.brand),
              logo: group.brand.toUpperCase(),
              banner: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
              description: `${group.brand} brand collection`,
            },
          });
        }

        // Find or create Category
        let categoryObj = await db.category.findFirst({
          where: { name: { equals: group.category, mode: "insensitive" } },
        });
        if (!categoryObj) {
          categoryObj = await db.category.create({
            data: {
              name: group.category,
              slug: slugify(group.category),
              description: `${group.category} category`,
            },
          });
        }

        // Find or create Showroom - match by EXACT name only. We never fall
        // back to "just grab any showroom", because that was the bug that
        // caused every product to land in the same showroom regardless of
        // its real STORE value.
        let showroomObj = await db.showroom.findFirst({
          where: { name: { equals: group.showroom, mode: "insensitive" } },
        });
        if (!showroomObj) {
          const defaults = SHOWROOM_DEFAULTS[group.showroom] || SHOWROOM_DEFAULTS[SHOWROOM_NAMES.STORE];
          showroomObj = await db.showroom.create({
            data: {
              name: group.showroom,
              slug: defaults.slug,
              address: defaults.address,
              mapsUrl: defaults.mapsUrl,
              phone: defaults.phone,
              email: defaults.email,
              openingTime: defaults.openingTime,
              closingTime: defaults.closingTime,
              heroImage: defaults.heroImage,
              description: defaults.description,
            },
          });
        }

        const finalPrice = Math.round(group.mrp * (1 - group.discount / 100));
        const existingProduct = await db.product.findUnique({
          where: { articleNumber: group.articleNumber },
          include: {
            colors: { orderBy: { displayOrder: "asc" } },
            sizes: true,
            images: { include: { color: true }, orderBy: { displayOrder: "asc" } },
          },
        });

        let productId: string;

        if (existingProduct) {
          updatedSnapshots.push(serializeProductSnapshot(existingProduct));
          await db.product.update({
            where: { articleNumber: group.articleNumber },
            data: {
              name: group.name,
              brandId: brandObj.id,
              categoryId: categoryObj.id,
              showroomId: showroomObj.id,
              mrp: group.mrp,
              discount: group.discount,
              division: group.division,
              productCategory: group.productCategory,
              subCategory: group.subCategory,
              finalPrice,
              available: true,
            },
          });
          productId = existingProduct.id;

          // Wipe old colors/sizes/images for this product so the re-import is clean
          await db.productImage.deleteMany({ where: { productId } });
          await db.productSize.deleteMany({ where: { productId } });
          await db.productColor.deleteMany({ where: { productId } });

          updated.push(group.articleNumber);
        } else {
          const newProduct = await db.product.create({
            data: {
              articleNumber: group.articleNumber,
              name: group.name,
              slug: slugify(group.name) + "-" + group.articleNumber,
              brandId: brandObj.id,
              categoryId: categoryObj.id,
              showroomId: showroomObj.id,
              description: `${group.name} by ${group.brand}`,
              mrp: group.mrp,
              discount: group.discount,
              division: group.division,
              productCategory: group.productCategory,
              subCategory: group.subCategory,
              finalPrice,
              available: true,
            },
          });
          productId = newProduct.id;
          created.push(group.articleNumber);
        }

        // ---------- Images for this product (matched by ARTICLE only) ----------
        // Upload each article-matched image to Cloudinary exactly ONCE per
        // article, regardless of how many colors this product has. The
        // resulting URLs are then attached to every color below, since
        // matching no longer distinguishes by color.
        const articleImages: { url: string; imageIndex: number }[] = [];
        for (const img of [...group.images].sort((a, b) => a.imageIndex - b.imageIndex)) {
          const entryKey = imageFileEntries.find((p) => (p.split("/").pop() || p) === img.filename);
          if (!entryKey) continue;

          const imageBuffer = await zip.files[entryKey].async("nodebuffer");
          const publicId = `${group.articleNumber}_${img.imageIndex}`;

          const cloudinaryUrl = await uploadToCloudinary(imageBuffer, "footcare/products", publicId);
          articleImages.push({ url: cloudinaryUrl, imageIndex: img.imageIndex });
        }

        // ---------- Colors, sizes, images (per color) ----------
        let colorDisplayOrder = 0;
        for (const colorGroup of group.colors.values()) {
          const colorObj = await db.productColor.create({
            data: {
              productId,
              name: colorGroup.colorName,
              displayOrder: colorDisplayOrder++,
            },
          });

          // Sizes belong to the whole product in the current schema, so we
          // add every distinct size seen across all colors of this product,
          // skipping any size already added by a previous color in this loop.
          for (const size of colorGroup.sizes) {
            const existingSize = await db.productSize.findFirst({
              where: { productId, value: size },
            });
            if (!existingSize) {
              await db.productSize.create({ data: { productId, value: size } });
            }
          }

          // Attach the same article-level image set to this color.
          let imageDisplayOrder = 0;
          for (const img of articleImages) {
            await db.productImage.create({
              data: {
                productId,
                colorId: colorObj.id,
                url: img.url,
                altText: `${group.name} - ${colorGroup.colorName}`,
                displayOrder: imageDisplayOrder++,
              },
            });
          }
        }
      } catch (err) {
        const error = err as Error;
        failed.push({ articleNumber: group.articleNumber, reason: error.message });
      }
    }

    // ---------- 6. Record import history ----------
    const durationMs = Date.now() - startTime;
    const status =
      failed.length > 0 && created.length === 0 && updated.length === 0 ? "FAILED" : "SUCCESS";
    const rollbackWindowExpiry =
      status === "SUCCESS" ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

    const history = await recordImportHistory({
      zipFileName: file.name,
      status,
      summaryCreated: created.length,
      summaryUpdated: updated.length,
      summaryErrors: failed.length,
      summarySkipped: rowIssues.length,
      durationMs,
      rollbackWindowExpiry,
      snapshot: {
        createdArticleNumbers: created,
        updatedProducts: updatedSnapshots,
      },
    });

    return NextResponse.json({
      success: true,
      importId: history?.id ?? null,
      fileName: file.name,
      summary: {
        created: created.length,
        updated: updated.length,
        skipped: rowIssues.length,
        errors: failed.length,
      },
      createdArticles: created,
      updatedArticles: updated,
      failedArticles: failed,
      rowIssues,
      unmatchedImages,
      durationMs,
      rollbackWindowExpiry,
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: `Import failed: ${error.message}` }, { status: 500 });
  }
}

async function resolveImportUserId(): Promise<string | null> {
  const session = await getSession();
  if (session?.id) {
    const sessionUser = await db.user.findUnique({ where: { id: session.id } });
    if (sessionUser) return sessionUser.id;
  }
  const firstUser = await db.user.findFirst();
  return firstUser?.id ?? null;
}

async function recordImportHistory(data: {
  zipFileName: string;
  status: string;
  summaryCreated: number;
  summaryUpdated: number;
  summaryErrors: number;
  summarySkipped: number;
  durationMs: number;
  rollbackWindowExpiry: Date | null;
  snapshot?: Prisma.InputJsonValue;
}) {
  try {
    const userId = await resolveImportUserId();
    return await db.importHistory.create({
      data: {
        zipFileName: data.zipFileName,
        userId: userId ?? undefined,
        status: data.status,
        summaryCreated: data.summaryCreated,
        summaryUpdated: data.summaryUpdated,
        summaryErrors: data.summaryErrors,
        summarySkipped: data.summarySkipped,
        durationMs: data.durationMs,
        rollbackWindowExpiry: data.rollbackWindowExpiry,
        snapshot: data.snapshot,
      },
    });
  } catch (historyErr) {
    console.error("Failed to write import history:", historyErr);
    return null;
  }
}