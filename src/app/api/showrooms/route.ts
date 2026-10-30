import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  loadManagedBrandsByShowroom,
  serializeShowroom,
  showroomInclude,
  slugify,
  uniqueShowroomSlug,
} from "@/lib/showroom-admin";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ showrooms: [] });
    }

    const [showrooms, managedBrands] = await Promise.all([
      db.showroom.findMany({
        orderBy: { name: "asc" },
        include: showroomInclude,
      }),
      loadManagedBrandsByShowroom(),
    ]);

    return NextResponse.json({
      showrooms: showrooms.map((showroom) =>
        serializeShowroom(showroom, managedBrands?.get(showroom.id) ?? (managedBrands ? [] : null))
      ),
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const address = String(body.address ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim();
    const mapsUrl = String(body.mapsUrl ?? "").trim();
    const openingTime = String(body.openingTime ?? "10:00 AM").trim();
    const closingTime = String(body.closingTime ?? "09:00 PM").trim();
    const description = String(body.description ?? "").trim();
    const brandIds = Array.isArray(body.brandIds)
      ? body.brandIds.filter((v: unknown): v is string => typeof v === "string")
      : [];

    if (!name || !address || !phone) {
      return NextResponse.json(
        { error: "Name, location, and phone number are required." },
        { status: 400 }
      );
    }

    const duplicate = await db.showroom.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "A showroom with that name already exists." },
        { status: 409 }
      );
    }

    const slug = await uniqueShowroomSlug(slugify(name));
    const resolvedMapsUrl =
      mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(address)}`;

    const validBrands = brandIds.length
      ? await db.brand.findMany({ where: { id: { in: brandIds } }, select: { id: true } })
      : [];

    const created = await db.showroom.create({
      data: {
        name,
        slug,
        address,
        phone,
        email: email || "footcarebhuj@gmail.com",
        mapsUrl: resolvedMapsUrl,
        openingTime: openingTime || "10:00 AM",
        closingTime: closingTime || "09:00 PM",
        description: description || `${name} showroom`,
        heroImage: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
        brandsManaged: true,
        brandLinks: {
          create: validBrands.map((b) => ({ brandId: b.id })),
        },
      },
      include: showroomInclude,
    });

    const managedBrands = await loadManagedBrandsByShowroom();
    return NextResponse.json(
      {
        showroom: serializeShowroom(
          created,
          managedBrands?.get(created.id) ?? (managedBrands ? [] : null)
        ),
      },
      { status: 201 }
    );
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
