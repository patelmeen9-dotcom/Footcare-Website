import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const hasDatabase = !!process.env.DATABASE_URL;
    if (!hasDatabase) {
      return NextResponse.json({ promotions: [] });
    }

    const promotions = await db.promotion.findMany({
      include: {
        showroom: { select: { name: true } },
        brand: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const mappedPromotions = promotions.map((p) => {
      let durationStr = "Expires: " + new Date(p.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

      return {
        id: p.id,
        name: p.name,
        type: p.type as "SHOWROOM" | "BRAND" | "GLOBAL",
        discount: p.discountPercentage ? `Flat ${p.discountPercentage}% OFF` : "Discount",
        scope: p.brand?.name || "All Items",
        showroom: p.showroom?.name || "Global",
        description: p.description || "",
        duration: durationStr,
        active: p.active,
      };
    });

    return NextResponse.json({ promotions: mappedPromotions });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, type, discount, scope, showroom, description, duration, active } = body;

    const hasDatabase = !!process.env.DATABASE_URL;
    if (!hasDatabase) {
      return NextResponse.json({ error: "No database connection" }, { status: 500 });
    }

    // Extract discount percentage from string like "Flat 20% OFF"
    const discountMatch = discount.match(/\d+/);
    const discountPercentage = discountMatch ? parseFloat(discountMatch[0]) : 0;

    let showroomObj = null;
    if (showroom && showroom !== "Global") {
      showroomObj = await db.showroom.findFirst({ where: { name: { contains: showroom, mode: "insensitive" } } });
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

    const existing = await db.promotion.findUnique({
      where: { id: id || "invalid-uuid" }
    }).catch(() => null);
    if (existing || id && id.length > 10 && !id.startsWith("promo-")) {
      await db.promotion.update({
        where: { id },
        data: {
          name,
          type,
          description,
          discountPercentage,
          active,
          showroomId: showroomObj?.id || null,
        }
      });
      return NextResponse.json({ success: true, id });
    } else {
      const promotion = await db.promotion.create({
        data: {
          name,
          slug,
          type,
          description,
          bannerImage: "/promo-placeholder.jpg",
          discountPercentage,
          active,
          showroomId: showroomObj?.id || null,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
        }
      });
      return NextResponse.json({ success: true, id: promotion.id });
    }

  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing promotion ID" }, { status: 400 });
    }

    const hasDatabase = !!process.env.DATABASE_URL;
    if (hasDatabase) {
      await db.promotion.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
