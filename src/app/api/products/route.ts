import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const brand = searchParams.get("brand") || "";
    const category = searchParams.get("category") || "";
    const showroom = searchParams.get("showroom") || "";
    const sortBy = searchParams.get("sortBy") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 50;
    const offset = (page - 1) * limit;

    // New filter dimensions (comma-separated multi-select support)
    const divisionParam = searchParams.get("division") || "";
    const productCategoryParam = searchParams.get("productCategory") || "";
    const productTypeParam = searchParams.get("productType") || "";

    const splitFilter = (raw: string) =>
      raw
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

    const divisions = splitFilter(divisionParam);
    const productCategories = splitFilter(productCategoryParam);
    const productTypes = splitFilter(productTypeParam);

    // Check if database URL is set
    const hasDatabase = !!process.env.DATABASE_URL;

    if (hasDatabase) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereClause: any = {
          status: "ACTIVE",
          available: true,
        };

        if (query) {
          whereClause.OR = [
            { name: { contains: query, mode: "insensitive" } },
            { articleNumber: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ];
        }

        if (brand) {
          whereClause.brand = { name: { equals: brand, mode: "insensitive" } };
        }

        // Legacy category filter — maps to the Category relation (unchanged)
        if (category) {
          whereClause.category = { name: { equals: category, mode: "insensitive" } };
        }

        if (showroom) {
          whereClause.showroom = { name: { contains: showroom, mode: "insensitive" } };
        }

        // New: Excel-field filters (each multi-select = OR within the group,
        // groups are combined with AND via top-level whereClause)
        if (divisions.length > 0) {
          whereClause.division = {
            in: divisions,
            mode: "insensitive",
          };
        }

        if (productCategories.length > 0) {
          whereClause.productCategory = {
            in: productCategories,
            mode: "insensitive",
          };
        }

        if (productTypes.length > 0) {
          whereClause.subCategory = {
            in: productTypes,
            mode: "insensitive",
          };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const orderBy: any = {};
        if (sortBy === "priceAsc") {
          orderBy.finalPrice = "asc";
        } else if (sortBy === "priceDesc") {
          orderBy.finalPrice = "desc";
        } else if (sortBy === "discount") {
          orderBy.discount = "desc";
        } else if (sortBy === "name") {
          orderBy.name = "asc";
        } else {
          orderBy.createdAt = "desc";
        }

        const [products, totalItems] = await Promise.all([
          db.product.findMany({
            where: whereClause,
            orderBy,
            skip: offset,
            take: limit,
            include: {
              brand: { select: { name: true, slug: true } },
              category: { select: { name: true, slug: true } },
              showroom: { select: { name: true, slug: true } },
              images: { select: { url: true, altText: true }, orderBy: { displayOrder: "asc" } },
            },
          }),
          db.product.count({ where: whereClause }),
        ]);

        return NextResponse.json({
          products: products.map((p) => {
            const firstImg = p.images[0]?.url || "";
            return {
              id: p.id,
              articleNumber: p.articleNumber,
              name: p.name,
              slug: p.slug,
              brand: p.brand.name,
              category: p.category.name,
              showroom: p.showroom.name,
              mrp: Number(p.mrp),
              discount: Number(p.discount),
              finalPrice: Number(p.finalPrice),
              image: firstImg,
              coverImage: firstImg,
              images: p.images.map((img) => ({ filename: img.altText || "image.jpg", url: img.url })),
              imageCount: p.images.length,
              hotSelling: p.hotSelling,
              hotSellingBadge: p.hotSellingBadge,
              newArrival: p.newArrival,
              available: p.available,
            };
          }),
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems,
          },
        });
      } catch (dbError) {
        console.warn("Database query failed:", dbError);
      }
    }

    return NextResponse.json({
      products: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
      },
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// POST endpoint to handle creation and sync of manual products in dev/production
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, articleNumber, name, brand, category, showroom, mrp, discount, available, images } = body;

    const finalPrice = Math.round(mrp * (1 - discount / 100));
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const coverImage = images?.[0]?.url || "/mock-pegasus.jpg";

    const hasDatabase = !!process.env.DATABASE_URL;
    if (hasDatabase) {
      try {
        // Locate relations or create them
        let brandObj = await db.brand.findFirst({ where: { name: { equals: brand, mode: "insensitive" } } });
        if (!brandObj) {
          brandObj = await db.brand.create({
            data: {
              name: brand,
              slug: brand.toLowerCase(),
              logo: brand.toUpperCase(),
              banner: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
              description: `${brand} brand`,
            },
          });
        }

        let categoryObj = await db.category.findFirst({ where: { name: { equals: category, mode: "insensitive" } } });
        if (!categoryObj) {
          categoryObj = await db.category.create({
            data: { name: category, slug: category.toLowerCase(), description: `${category} category` },
          });
        }

        let showroomObj = await db.showroom.findFirst({ where: { name: { contains: showroom, mode: "insensitive" } } });
        if (!showroomObj) {
          showroomObj = await db.showroom.findFirst();
        }
        if (!showroomObj) {
          showroomObj = await db.showroom.create({
            data: {
              name: showroom,
              slug: showroom.toLowerCase(),
              address: "Jubilee Ground Road, Bhuj",
              mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(showroom + " Bhuj")}`,
              phone: "+91 98252 12345",
              email: "info@footcare.com",
              openingTime: "09:30 AM",
              closingTime: "09:00 PM",
              heroImage: "linear-gradient(to right bottom, #0f172a, #1e293b)",
              description: `${showroom}`,
            },
          });
        }

        // Check if updating existing
        const existing = await db.product.findFirst({ where: { OR: [{ id }, { articleNumber }] } });

        if (existing) {
          await db.product.update({
            where: { id: existing.id },
            data: { articleNumber, name, mrp, discount, finalPrice, available },
          });
          await db.productImage.deleteMany({ where: { productId: existing.id } });
          await db.productColor.deleteMany({ where: { productId: existing.id } });

          if (images && images.length > 0) {
            for (const img of images) {
              const colorName = img.color || "Default";
              let colorObj = await db.productColor.findFirst({ where: { productId: existing.id, name: colorName } });
              if (!colorObj) {
                colorObj = await db.productColor.create({ data: { productId: existing.id, name: colorName } });
              }
              await db.productImage.create({
                data: { productId: existing.id, colorId: colorObj.id, url: img.url, altText: img.filename },
              });
            }
          }
          return NextResponse.json({ success: true, id: existing.id });
        } else {
          const product = await db.product.create({
            data: {
              articleNumber,
              name,
              slug,
              brandId: brandObj.id,
              categoryId: categoryObj.id,
              showroomId: showroomObj.id,
              description: `${name} branded shoes`,
              mrp,
              discount,
              finalPrice,
              available,
            },
          });

          if (images && images.length > 0) {
            for (const img of images) {
              const colorName = img.color || "Default";
              let colorObj = await db.productColor.findFirst({ where: { productId: product.id, name: colorName } });
              if (!colorObj) {
                colorObj = await db.productColor.create({ data: { productId: product.id, name: colorName } });
              }
              await db.productImage.create({
                data: { productId: product.id, colorId: colorObj.id, url: img.url, altText: img.filename },
              });
            }
          }

          return NextResponse.json({ success: true, id: product.id });
        }
      } catch (dbErr) {
        console.error("Prisma POST fail:", dbErr);
      }
    }

    // Log unused variable to satisfy linter
    void coverImage;
    return NextResponse.json({ error: "No database connection" }, { status: 500 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE endpoint
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    const hasDatabase = !!process.env.DATABASE_URL;
    if (hasDatabase) {
      try {
        await db.product.delete({ where: { id } });
        return NextResponse.json({ success: true });
      } catch (dbErr) {
        console.error("Prisma DELETE failed:", dbErr);
      }
    }

    return NextResponse.json({ error: "No database connection" }, { status: 500 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
