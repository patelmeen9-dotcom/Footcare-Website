import { PrismaClient } from "@prisma/client";
import { canonicalizeBrandName, showroomNameForBrand, SHOWROOM_NAMES } from "../src/lib/catalog-mapping";

const db = new PrismaClient();

async function mergeMisspelledSkechers() {
  const correct = await db.brand.findFirst({
    where: { name: { equals: "SKECHERS", mode: "insensitive" } },
  });
  const misspelled = await db.brand.findMany({
    where: {
      OR: [
        { name: { equals: "SEKCHERS", mode: "insensitive" } },
        { name: { equals: "Sketchers", mode: "insensitive" } },
      ],
      NOT: correct ? { id: correct.id } : undefined,
    },
  });

  if (!correct && misspelled.length === 1) {
    await db.brand.update({
      where: { id: misspelled[0].id },
      data: { name: "SKECHERS", slug: "skechers" },
    });
    console.log(`Renamed ${misspelled[0].name} to SKECHERS`);
    return;
  }

  if (!correct) {
    console.log("No SKECHERS brand found to merge into.");
    return;
  }

  for (const wrong of misspelled) {
    if (wrong.id === correct.id) continue;

    await db.product.updateMany({
      where: { brandId: wrong.id },
      data: { brandId: correct.id },
    });
    await db.promotion.updateMany({
      where: { brandId: wrong.id },
      data: { brandId: correct.id },
    });

    const wrongLinks = await db.showroomBrand.findMany({ where: { brandId: wrong.id } });
    for (const link of wrongLinks) {
      await db.showroomBrand.upsert({
        where: {
          showroomId_brandId: { showroomId: link.showroomId, brandId: correct.id },
        },
        update: {},
        create: { showroomId: link.showroomId, brandId: correct.id },
      });
    }
    await db.showroomBrand.deleteMany({ where: { brandId: wrong.id } });
    await db.brand.delete({ where: { id: wrong.id } });
    console.log(`Merged ${wrong.name} into SKECHERS`);
  }

  if (correct.name !== "SKECHERS") {
    await db.brand.update({
      where: { id: correct.id },
      data: { name: "SKECHERS" },
    });
    console.log("Normalized SKECHERS spelling on the canonical brand");
  }
}

async function reassignProducts() {
  const showrooms = await db.showroom.findMany();
  const byName = new Map(showrooms.map((s) => [s.name, s]));

  const kick = byName.get(SHOWROOM_NAMES.KICK_SPORTS);
  const store = byName.get(SHOWROOM_NAMES.STORE);
  const mall = byName.get(SHOWROOM_NAMES.MALL);
  if (!kick || !store || !mall) {
    throw new Error("One of the three showrooms is missing.");
  }

  const products = await db.product.findMany({
    include: { brand: true },
  });

  const counts = { kick: 0, store: 0, mall: 0 };

  for (const product of products) {
    const canonical = canonicalizeBrandName(product.brand.name);
    if (canonical !== product.brand.name) {
      // Brand record should already be merged; keep product brandId as-is.
    }
    const showroomName = showroomNameForBrand(product.brand.name);
    const showroom =
      showroomName === SHOWROOM_NAMES.KICK_SPORTS
        ? kick
        : showroomName === SHOWROOM_NAMES.STORE
          ? store
          : mall;
    if (product.showroomId !== showroom.id) {
      await db.product.update({
        where: { id: product.id },
        data: { showroomId: showroom.id },
      });
    }
    if (showroom.id === kick.id) counts.kick += 1;
    else if (showroom.id === store.id) counts.store += 1;
    else counts.mall += 1;
  }

  const brands = await db.brand.findMany();
  await db.showroomBrand.deleteMany();

  for (const brand of brands) {
    const showroomName = showroomNameForBrand(brand.name);
    const showroom =
      showroomName === SHOWROOM_NAMES.KICK_SPORTS
        ? kick
        : showroomName === SHOWROOM_NAMES.STORE
          ? store
          : mall;
    await db.showroomBrand.create({
      data: { showroomId: showroom.id, brandId: brand.id },
    });
  }

  await db.showroom.updateMany({
    where: { id: { in: [kick.id, store.id, mall.id] } },
    data: { brandsManaged: true },
  });

  console.log(
    `Products: Kick Sports ${counts.kick}, Store ${counts.store}, Mall ${counts.mall}`
  );
}

async function main() {
  await mergeMisspelledSkechers();
  await reassignProducts();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
