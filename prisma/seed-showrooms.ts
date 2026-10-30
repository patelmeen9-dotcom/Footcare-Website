import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const SHOWROOMS = [
  {
    name: "Footcare Kick Sports",
    slug: "kick-sports",
    address: "9A Royal plaza, Near Honest Hotel, College Road, Bhuj, Gujarat 370001",
    mapsUrl: "https://maps.google.com/?q=Footcare+Kick+Sports+College+Road+Bhuj",
    phone: "+91 98794 59303",
    email: "footcarebhuj@gmail.com",
    openingTime: "09:30 AM",
    closingTime: "09:00 PM",
    heroImage: "linear-gradient(to right bottom, #0f172a, #1e293b)",
    description:
      "Our athletic-focused showroom carrying the latest activewear and premium running ranges from Nike and Skechers.",
    brandNames: ["Nike", "SKECHERS"],
  },
  {
    name: "Foot Care Store",
    slug: "foot-care-store",
    address: "Opp. Mandvi Octroi, College Bhuj, Gujarat 370001, India",
    mapsUrl: "https://maps.google.com/?q=Foot+Care+Store+Station+Road+Bhuj",
    phone: "+91 98794 59303",
    email: "footcarebhuj@gmail.com",
    openingTime: "10:00 AM",
    closingTime: "09:30 PM",
    heroImage: "linear-gradient(to right bottom, #1e1b4b, #312e81)",
    description:
      "Our flagship retail store featuring comfort, casual, and lifestyle footwear collections including Puma and Jockey comfort wear.",
    brandNames: ["Puma", "JOCKEY"],
  },
  {
    name: "Foot Care Mall",
    slug: "foot-care-mall",
    address: "Near Jay nagar Bus stop, Patel Tower 3, Near K.D Hero, Bhuj, Gujarat 370001",
    mapsUrl: "https://maps.google.com/?q=Royal+Arcade+Air+Force+Road+Bhuj",
    phone: "+91 98794 59303",
    email: "footcarebhuj@gmail.com",
    openingTime: "10:00 AM",
    closingTime: "10:00 PM",
    heroImage: "linear-gradient(to right bottom, #1c1917, #44403c)",
    description:
      "An upscale shopping experience displaying premium apparel, accessories, and formal shoes for the whole family.",
    brandNames: ["ASICS"],
  },
];

async function findExisting(name: string, slug: string) {
  return (
    (await db.showroom.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    })) || (await db.showroom.findUnique({ where: { slug } }))
  );
}

async function main() {
  const allBrands = await db.brand.findMany({ select: { id: true, name: true } });

  for (const data of SHOWROOMS) {
    const { brandNames, ...fields } = data;
    const existing = await findExisting(data.name, data.slug);

    const showroom = existing
      ? await db.showroom.update({
          where: { id: existing.id },
          data: { ...fields, active: true },
        })
      : await db.showroom.create({
          data: { ...fields, active: true, brandsManaged: true },
        });

    const brandIds = allBrands
      .filter((b) => brandNames.some((n) => n.toLowerCase() === b.name.toLowerCase()))
      .map((b) => b.id);

    await db.showroomBrand.deleteMany({ where: { showroomId: showroom.id } });
    if (brandIds.length > 0) {
      await db.showroomBrand.createMany({
        data: brandIds.map((brandId) => ({ showroomId: showroom.id, brandId })),
      });
    }

    await db.showroom.update({
      where: { id: showroom.id },
      data: { brandsManaged: true },
    });

    console.log(`Upserted ${showroom.name} (${showroom.slug}) with ${brandIds.length} brands`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
