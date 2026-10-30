import { db } from "@/lib/db";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function uniqueShowroomSlug(base: string, excludeId?: string) {
  let slug = base || "showroom";
  let n = 2;
  while (true) {
    const existing = await db.showroom.findFirst({
      where: excludeId ? { slug, NOT: { id: excludeId } } : { slug },
    });
    if (!existing) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }
}

type ShowroomRecord = {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  mapsUrl: string;
  openingTime: string;
  closingTime: string;
  heroImage: string;
  description: string;
  brandsManaged: boolean;
  _count: { products: number };
  products: { brandId: string; brand: { name: string } }[];
  brandLinks: { brand: { id: string; name: string } }[];
};

export function serializeShowroom(s: ShowroomRecord) {
  const managedBrands = s.brandLinks
    .map((link) => ({ id: link.brand.id, name: link.brand.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const derivedBrands = [
    ...new Map(
      s.products.map((p) => [p.brandId, { id: p.brandId, name: p.brand.name }])
    ).values(),
  ].sort((a, b) => a.name.localeCompare(b.name));

  const brands = s.brandsManaged ? managedBrands : derivedBrands;

  return {
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
    brandsManaged: s.brandsManaged,
    brands: brands.map((b) => b.name),
    brandIds: brands.map((b) => b.id),
  };
}

export const showroomInclude = {
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
      brandId: true,
      brand: { select: { name: true } },
    },
    distinct: ["brandId" as const],
  },
  brandLinks: {
    include: { brand: { select: { id: true, name: true } } },
  },
};
