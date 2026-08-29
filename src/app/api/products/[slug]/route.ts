import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const hasDatabase = !!process.env.DATABASE_URL;

    if (hasDatabase) {
      try {
        const product = await db.product.findUnique({
          where: { slug },
          include: {
            brand: true,
            category: true,
            showroom: true,
            colors: {
              include: {
                images: true,
              },
            },
            sizes: true,
            images: true,
          },
        });

        if (product) {
          const firstImg = product.images[0]?.url || "";
          return NextResponse.json({
            id: product.id,
            articleNumber: product.articleNumber,
            name: product.name,
            slug: product.slug,
            description: product.description,
            material: product.material,
            careInstructions: product.careInstructions,
            mrp: Number(product.mrp),
            discount: Number(product.discount),
            finalPrice: Number(product.finalPrice),
            available: product.available,
            hotSelling: product.hotSelling,
            hotSellingBadge: product.hotSellingBadge,
            newArrival: product.newArrival,
            brand: product.brand,
            category: product.category,
            showroom: product.showroom,
            colors: product.colors.map((c) => ({
              id: c.id,
              name: c.name,
            })),
            sizes: product.sizes.map((s) => s.value),
            coverImage: firstImg,
            images: product.images.map((i) => ({
              id: i.id,
              url: i.url,
              colorId: i.colorId,
              color: product.colors.find((c) => c.id === i.colorId)?.name || "Default",
              altText: i.altText || product.name,
            })),
            imageCount: product.images.length,
          });
        }
      } catch (dbError) {
        console.warn("Database lookup failed:", dbError);
      }
    }

    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
