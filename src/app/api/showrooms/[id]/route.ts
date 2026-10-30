import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  loadManagedBrandsByShowroom,
  serializeShowroom,
  showroomInclude,
  slugify,
  uniqueShowroomSlug,
} from "@/lib/showroom-admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const showroom = await db.showroom.findUnique({ where: { id } });
    if (!showroom) {
      return NextResponse.json({ error: "Showroom not found." }, { status: 404 });
    }

    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const address = String(body.address ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim();
    const mapsUrl = String(body.mapsUrl ?? "").trim();
    const openingTime = String(body.openingTime ?? "").trim();
    const closingTime = String(body.closingTime ?? "").trim();
    const description = String(body.description ?? "").trim();
    const brandIds = Array.isArray(body.brandIds)
      ? body.brandIds.filter((v: unknown): v is string => typeof v === "string")
      : null;

    if (!name || !address || !phone) {
      return NextResponse.json(
        { error: "Name, location, and phone number are required." },
        { status: 400 }
      );
    }

    const duplicate = await db.showroom.findFirst({
      where: { name: { equals: name, mode: "insensitive" }, NOT: { id } },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "Another showroom already uses that name." },
        { status: 409 }
      );
    }

    const slug = await uniqueShowroomSlug(slugify(name), id);
    const resolvedMapsUrl =
      mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(address)}`;

    await db.$transaction(async (tx) => {
      await tx.showroom.update({
        where: { id },
        data: {
          name,
          slug,
          address,
          phone,
          email: email || showroom.email,
          mapsUrl: resolvedMapsUrl,
          openingTime: openingTime || showroom.openingTime,
          closingTime: closingTime || showroom.closingTime,
          description: description || showroom.description,
          ...(brandIds ? { brandsManaged: true } : {}),
        },
      });

      if (brandIds) {
        const validBrands = await tx.brand.findMany({
          where: { id: { in: brandIds } },
          select: { id: true },
        });
        const validIds = validBrands.map((b) => b.id);

        await tx.showroomBrand.deleteMany({ where: { showroomId: id } });
        if (validIds.length > 0) {
          await tx.showroomBrand.createMany({
            data: validIds.map((brandId) => ({ showroomId: id, brandId })),
          });
        }
      }
    });

    const [updated, managedBrands] = await Promise.all([
      db.showroom.findUnique({
        where: { id },
        include: showroomInclude,
      }),
      loadManagedBrandsByShowroom(),
    ]);

    if (!updated) {
      return NextResponse.json({ error: "Showroom not found." }, { status: 404 });
    }

    return NextResponse.json({
      showroom: serializeShowroom(
        updated,
        managedBrands?.get(updated.id) ?? (managedBrands ? [] : null)
      ),
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
