import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/dashboard
 * Returns real counts for the admin dashboard KPIs from Prisma.
 */
export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        productCount: 0,
        brandCount: 0,
        showroomCount: 0,
        promotionCount: 0,
        brandBreakdown: [],
        showroomBreakdown: [],
      });
    }

    const [productCount, brandCount, showroomCount, promotionCount, brandBreakdown, showroomBreakdown] =
      await Promise.all([
        db.product.count({ where: { status: "ACTIVE" } }),
        db.brand.count({ where: { active: true } }),
        db.showroom.count(),
        db.promotion.count({ where: { active: true } }),
        // Brand breakdown: name + product count
        db.brand.findMany({
          where: { active: true },
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: {
                products: { where: { status: "ACTIVE", available: true } },
              },
            },
          },
        }),
        // Showroom breakdown: name + product count
        db.showroom.findMany({
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: {
                products: { where: { status: "ACTIVE", available: true } },
              },
            },
          },
        }),
      ]);

    return NextResponse.json({
      productCount,
      brandCount,
      showroomCount,
      promotionCount,
      brandBreakdown: brandBreakdown.map((b) => ({
        id: b.id,
        name: b.name,
        productCount: b._count.products,
      })),
      showroomBreakdown: showroomBreakdown.map((s) => ({
        id: s.id,
        name: s.name,
        productCount: s._count.products,
      })),
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
