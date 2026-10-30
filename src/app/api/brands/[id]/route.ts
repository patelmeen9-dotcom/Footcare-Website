import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { db } from "@/lib/db";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueBrandSlug(base: string, excludeId: string) {
  let slug = base || "brand";
  let n = 2;
  while (true) {
    const existing = await db.brand.findFirst({
      where: { slug, NOT: { id: excludeId } },
    });
    if (!existing) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }
}

async function uploadBrandLogo(file: File, publicId: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise<string>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "footcare/brands",
          public_id: publicId,
          resource_type: "image",
          overwrite: true,
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const brand = await db.brand.findUnique({ where: { id } });
    if (!brand) {
      return NextResponse.json({ error: "Brand not found." }, { status: 404 });
    }

    const formData = await request.formData();
    const nameRaw = formData.get("name");
    const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
    const logoFile = formData.get("logo");

    if (!name) {
      return NextResponse.json({ error: "Brand name is required." }, { status: 400 });
    }

    const duplicate = await db.brand.findFirst({
      where: { name: { equals: name, mode: "insensitive" }, NOT: { id } },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "Another brand already uses that name." },
        { status: 409 }
      );
    }

    let logo = brand.logo;
    const nextSlug = await uniqueBrandSlug(slugify(name), id);

    if (logoFile instanceof File && logoFile.size > 0) {
      if (logoFile.size > MAX_LOGO_BYTES) {
        return NextResponse.json({ error: "Logo must be 5MB or smaller." }, { status: 413 });
      }
      if (!logoFile.type.startsWith("image/")) {
        return NextResponse.json({ error: "Please upload an image file for the logo." }, { status: 400 });
      }
      logo = await uploadBrandLogo(logoFile, nextSlug);
    }

    const updated = await db.brand.update({
      where: { id },
      data: {
        name,
        slug: nextSlug,
        logo,
      },
      include: {
        _count: {
          select: {
            products: { where: { status: "ACTIVE", available: true } },
          },
        },
      },
    });

    return NextResponse.json({
      brand: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        logo: updated.logo,
        banner: updated.banner,
        description: updated.description,
        productCount: updated._count.products,
      },
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
