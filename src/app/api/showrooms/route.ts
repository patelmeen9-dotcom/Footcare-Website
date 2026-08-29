import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/showrooms
 * Returns all showrooms from the database with product counts per showroom.
 */
export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ showrooms: [] });
    }

    const showrooms = await db.showroom.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: {
              where: { status: "ACTIVE", available: true },
            },
          },
        },
        products: {
          where: { status: "ACTIVE", available: true },
          select: {
            brand: { select: { name: true } },
          },
          distinct: ["brandId"],
        },
      },
    });

    return NextResponse.json({
      showrooms: showrooms.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        address: s.address,
        phone: s.phone,
        email: s.email,
        mapsUrl: s.mapsUrl,
        openingTime: s.openingTime,
        closingTime: s.closingTime,
        heroImage: s.heroImage,
        description: s.description,
        productCount: s._count.products,
        // Derive distinct brand names from real products in this showroom
        brands: [...new Set(s.products.map((p) => p.brand.name))].sort(),
      })),
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
