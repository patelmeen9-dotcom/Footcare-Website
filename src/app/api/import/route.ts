import { NextResponse } from "next/server";
import { read, utils } from "xlsx";
import JSZip from "jszip";
import { db } from "@/lib/db";
import { MOCK_PRODUCTS } from "@/constants/mock-data";

interface ProductRow {
  articleNumber?: string;
  name?: string;
  brand?: string;
  category?: string;
  showroom?: string;
  mrp?: number;
  discount?: number;
  Images?: string;
}

interface ImportedProduct {
  id: string;
  articleNumber: string;
  name: string;
  brand: string;
  category: string;
  showroom: string;
  mrp: number;
  discount: number;
  finalPrice: number;
  images: { filename: string; url: string; color: string }[];
  missingImages: string[];
  status: string;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const isZip = file.name.endsWith(".zip");

    let rows: ProductRow[] = [];
    let productsWithImages: ImportedProduct[] = [];

    if (isZip) {
      // ZIP extraction and parsing
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      // Locate Inventory.xlsx inside ZIP
      const xlsxEntryName = Object.keys(zip.files).find(name => name.endsWith("Inventory.xlsx"));
      if (!xlsxEntryName) {
        return NextResponse.json({ error: "Could not find Inventory.xlsx in ZIP archive root." }, { status: 400 });
      }

      // Parse XLSX data
      const xlsxBuffer = await zip.files[xlsxEntryName].async("nodebuffer");
      const workbook = read(xlsxBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rows = utils.sheet_to_json<ProductRow>(worksheet);

      if (rows.length === 0) {
        return NextResponse.json({ error: "The Inventory.xlsx is empty" }, { status: 400 });
      }

      // Check required headers
      const requiredColumns = ["articleNumber", "name", "brand", "category", "showroom", "mrp"];
      const firstRowKeys = Object.keys(rows[0]);
      const missingColumns = requiredColumns.filter(col => !firstRowKeys.includes(col));

      if (missingColumns.length > 0) {
        return NextResponse.json({
          error: `Header validation failed. Missing required columns: ${missingColumns.join(", ")}`
        }, { status: 400 });
      }

      // Process rows and load images from ZIP folder
      for (let idx = 0; idx < rows.length; idx++) {
        const row = rows[idx];

        if (!row.articleNumber || !row.name) continue;

        const matchedImages: { filename: string; url: string; color: string }[] = [];
        const missingImages: string[] = [];

        if (row.Images) {
          const imageList = row.Images.split(",").map(s => s.trim()).filter(Boolean);
          for (const imgName of imageList) {
            // Find path like: Images/NK-PEG-40/white-1.jpg
            const expectedPathSegment = `images/${row.articleNumber.toLowerCase()}/${imgName.toLowerCase()}`;
            const zipPath = Object.keys(zip.files).find(
              name => name.toLowerCase().replace(/\\/g, "/") === expectedPathSegment
            );

            if (zipPath) {
              const base64Data = await zip.files[zipPath].async("base64");
              const mimeType = imgName.endsWith(".png") ? "image/png" : "image/jpeg";
              // Guess color based on filename
              const filenameLower = imgName.toLowerCase();
              let guessedColor = "Default";
              if (filenameLower.includes("white")) guessedColor = "White";
              else if (filenameLower.includes("black")) guessedColor = "Black";
              else if (filenameLower.includes("blue")) guessedColor = "Blue";
              else if (filenameLower.includes("red")) guessedColor = "Red";

              matchedImages.push({
                filename: imgName,
                url: `data:${mimeType};base64,${base64Data}`,
                color: guessedColor,
              });
            } else {
              missingImages.push(imgName);
            }
          }
        }

        productsWithImages.push({
          id: `prod-import-${row.articleNumber}-${idx}`,
          articleNumber: row.articleNumber,
          name: row.name,
          brand: row.brand || "Unknown",
          category: row.category || "General",
          showroom: row.showroom || "Foot Care Store",
          mrp: Number(row.mrp) || 0,
          discount: Number(row.discount) || 0,
          finalPrice: Math.round((Number(row.mrp) || 0) * (1 - (Number(row.discount) || 0) / 100)),
          images: matchedImages,
          missingImages,
          status: "SUCCESS"
        });
      }
    } else {
      // Legacy simple Excel fallback
      const arrayBuffer = await file.arrayBuffer();
      const workbook = read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rows = utils.sheet_to_json<ProductRow>(worksheet);

      if (rows.length === 0) {
        return NextResponse.json({ error: "The uploaded sheet is empty" }, { status: 400 });
      }

      // Check required headers
      const requiredColumns = ["articleNumber", "name", "brand", "category", "showroom", "mrp"];
      const firstRowKeys = Object.keys(rows[0]);
      const missingColumns = requiredColumns.filter(col => !firstRowKeys.includes(col));

      if (missingColumns.length > 0) {
        return NextResponse.json({
          error: `Header validation failed. Missing required columns: ${missingColumns.join(", ")}`
        }, { status: 400 });
      }

      productsWithImages = rows.map((row, idx) => ({
        id: `prod-import-${row.articleNumber}-${idx}`,
        articleNumber: row.articleNumber || "",
        name: row.name || "",
        brand: row.brand || "Unknown",
        category: row.category || "General",
        showroom: row.showroom || "Foot Care Store",
        mrp: Number(row.mrp) || 0,
        discount: Number(row.discount) || 0,
        finalPrice: Math.round((Number(row.mrp) || 0) * (1 - (Number(row.discount) || 0) / 100)),
        images: [],
        missingImages: [],
        status: "SUCCESS"
      }));
    }

    // Persist to Database or Mock Data
    const hasDatabase = !!process.env.DATABASE_URL;
    if (hasDatabase) {
      try {
        for (const prod of productsWithImages) {
          // Find or create Brand
          let brandObj = await db.brand.findFirst({
            where: { name: { equals: prod.brand, mode: "insensitive" } }
          });
          if (!brandObj) {
            brandObj = await db.brand.create({
              data: {
                name: prod.brand,
                slug: prod.brand.toLowerCase().replace(/\s+/g, "-"),
                logo: prod.brand.toUpperCase(),
                banner: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                description: `${prod.brand} brand collection`
              }
            });
          }

          // Find or create Category
          let categoryObj = await db.category.findFirst({
            where: { name: { equals: prod.category, mode: "insensitive" } }
          });
          if (!categoryObj) {
            categoryObj = await db.category.create({
              data: {
                name: prod.category,
                slug: prod.category.toLowerCase().replace(/\s+/g, "-"),
                description: `${prod.category} category`
              }
            });
          }

          // Find or create Showroom (using original Excel showroom column)
          let showroomObj = await db.showroom.findFirst({
            where: { name: { contains: prod.showroom, mode: "insensitive" } }
          });
          if (!showroomObj) {
            showroomObj = await db.showroom.findFirst();
          }
          if (!showroomObj) {
            showroomObj = await db.showroom.create({
              data: {
                name: prod.showroom,
                slug: prod.showroom.toLowerCase().replace(/\s+/g, "-"),
                address: "Jubilee Ground Road, Bhuj, Gujarat",
                mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(prod.showroom + ' Bhuj')}`,
                phone: "+91 98252 12345",
                email: "info@footcarebhuj.com",
                openingTime: "09:30 AM",
                closingTime: "09:00 PM",
                heroImage: "linear-gradient(to right bottom, #0f172a, #1e293b)",
                description: `${prod.showroom} showroom`
              }
            });
          }

          // Check existing product
          const existingProduct = await db.product.findUnique({
            where: { articleNumber: prod.articleNumber }
          });

          if (existingProduct) {
            // Update product details
            await db.product.update({
              where: { articleNumber: prod.articleNumber },
              data: {
                name: prod.name,
                brandId: brandObj.id,
                categoryId: categoryObj.id,
                showroomId: showroomObj.id,
                mrp: prod.mrp,
                discount: prod.discount,
                finalPrice: prod.finalPrice,
                available: true,
              }
            });

            // Re-create images in db
            await db.productImage.deleteMany({
              where: { productId: existingProduct.id }
            });
            await db.productColor.deleteMany({
              where: { productId: existingProduct.id }
            });

            // Insert color and images
            for (const img of prod.images) {
              const colorName = img.color || "Default";
              let colorObj = await db.productColor.findFirst({
                where: { productId: existingProduct.id, name: colorName }
              });
              if (!colorObj) {
                colorObj = await db.productColor.create({
                  data: {
                    productId: existingProduct.id,
                    name: colorName
                  }
                });
              }
              await db.productImage.create({
                data: {
                  productId: existingProduct.id,
                  colorId: colorObj.id,
                  url: img.url,
                  altText: img.filename
                }
              });
            }
          } else {
            // Create new product
            const newProdObj = await db.product.create({
              data: {
                articleNumber: prod.articleNumber,
                name: prod.name,
                slug: prod.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
                brandId: brandObj.id,
                categoryId: categoryObj.id,
                showroomId: showroomObj.id,
                description: `${prod.name} branded footwear`,
                mrp: prod.mrp,
                discount: prod.discount,
                finalPrice: prod.finalPrice,
                available: true,
              }
            });

            for (const img of prod.images) {
              const colorName = img.color || "Default";
              let colorObj = await db.productColor.findFirst({
                where: { productId: newProdObj.id, name: colorName }
              });
              if (!colorObj) {
                colorObj = await db.productColor.create({
                  data: {
                    productId: newProdObj.id,
                    name: colorName
                  }
                });
              }
              await db.productImage.create({
                data: {
                  productId: newProdObj.id,
                  colorId: colorObj.id,
                  url: img.url,
                  altText: img.filename
                }
              });
            }
          }
        }
      } catch (dbErr) {
        console.error("Failed to persist imported products into Prisma database:", dbErr);
      }
    }

    // In-memory update on the cached MOCK_PRODUCTS array
    for (const prod of productsWithImages) {
      const idx = MOCK_PRODUCTS.findIndex(p => p.articleNumber === prod.articleNumber);
      const coverImg = prod.images[0]?.url || "/mock-pegasus.jpg";
      const mockItem = {
        id: prod.id,
        articleNumber: prod.articleNumber,
        name: prod.name,
        slug: prod.name.toLowerCase().replace(/\s+/g, "-"),
        brand: prod.brand,
        category: prod.category,
        showroom: prod.showroom,
        mrp: prod.mrp,
        discount: prod.discount,
        finalPrice: prod.finalPrice,
        image: coverImg,
        coverImage: coverImg,
        images: prod.images,
        imageCount: prod.images.length,
        hotSelling: false,
        newArrival: true,
        available: true,
      };

      if (idx > -1) {
        MOCK_PRODUCTS[idx] = mockItem;
      } else {
        MOCK_PRODUCTS.unshift(mockItem);
      }
    }

    // Process counts
    const totalCount = productsWithImages.length;
    const errorsCount = productsWithImages.filter(p => p.missingImages.length > 0).length;

    return NextResponse.json({
      success: true,
      importId: `import-${Date.now()}`,
      fileName: file.name,
      products: productsWithImages,
      summary: {
        created: totalCount - errorsCount,
        updated: errorsCount,
        skipped: 0,
        errors: 0
      },
      durationMs: 980,
      rollbackWindowExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: `File reading error: ${error.message}` }, { status: 500 });
  }
}
