import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/brands
 * Returns all active brands with their real product counts from the database.
 */
export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ brands: [] });
    }

    const brands = await db.brand.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: {
              where: { status: "ACTIVE", available: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      brands: brands.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        logo: b.logo,
        banner: b.banner,
        description: b.description,
        productCount: b._count.products,
      })),
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
