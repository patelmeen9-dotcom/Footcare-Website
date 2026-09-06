import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { parseImportSnapshot, type ProductSnapshot } from "@/lib/import-snapshot";

export async function POST(request: Request) {
  try {
    const { importId } = await request.json();

    if (!importId) {
      return NextResponse.json({ error: "Missing Import ID" }, { status: 400 });
    }

    const record = await db.importHistory.findUnique({ where: { id: importId } });
    if (!record) {
      return NextResponse.json({ error: "Import log not found." }, { status: 404 });
    }

    if (record.status !== "SUCCESS") {
      return NextResponse.json(
        { error: "Only a successful import can be reverted." },
        { status: 400 }
      );
    }

    if (record.rollbackWindowExpiry && record.rollbackWindowExpiry < new Date()) {
      return NextResponse.json(
        { error: "The 24-hour revert window for this import has expired." },
        { status: 400 }
      );
    }

    const latestSuccess = await db.importHistory.findFirst({
      where: { status: "SUCCESS" },
      orderBy: { date: "desc" },
    });
    if (!latestSuccess || latestSuccess.id !== record.id) {
      return NextResponse.json(
        { error: "Only the most recent successful import can be reverted." },
        { status: 400 }
      );
    }

    const snapshot = parseImportSnapshot(record.snapshot);
    if (!snapshot) {
      return NextResponse.json(
        { error: "This import has no restore snapshot, so it cannot be reverted." },
        { status: 400 }
      );
    }

    await db.$transaction(
      async (tx) => {
        if (snapshot.createdArticleNumbers.length > 0) {
          await tx.product.deleteMany({
            where: { articleNumber: { in: snapshot.createdArticleNumbers } },
          });
        }

        for (const prev of snapshot.updatedProducts) {
          await restoreProduct(tx, prev);
        }

        await tx.importHistory.update({
          where: { id: record.id },
          data: { status: "ROLLED_BACK", rollbackWindowExpiry: null },
        });
      },
      { timeout: 60000 }
    );

    return NextResponse.json({
      success: true,
      message: "Import reverted. Created products were removed and updated products were restored.",
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function restoreProduct(tx: Prisma.TransactionClient, prev: ProductSnapshot) {
  const existing = await tx.product.findUnique({
    where: { articleNumber: prev.articleNumber },
  });

  const productData = {
    name: prev.name,
    slug: prev.slug,
    brandId: prev.brandId,
    categoryId: prev.categoryId,
    showroomId: prev.showroomId,
    description: prev.description,
    material: prev.material,
    careInstructions: prev.careInstructions,
    mrp: prev.mrp,
    discount: prev.discount,
    finalPrice: prev.finalPrice,
    available: prev.available,
    hotSelling: prev.hotSelling,
    hotSellingBadge: prev.hotSellingBadge,
    featured: prev.featured,
    newArrival: prev.newArrival,
    seoTitle: prev.seoTitle,
    seoDescription: prev.seoDescription,
    division: prev.division,
    productCategory: prev.productCategory,
    subCategory: prev.subCategory,
    status: prev.status,
  };

  const productId = existing
    ? (
        await tx.product.update({
          where: { id: existing.id },
          data: productData,
        })
      ).id
    : (
        await tx.product.create({
          data: {
            articleNumber: prev.articleNumber,
            ...productData,
          },
        })
      ).id;

  await tx.productImage.deleteMany({ where: { productId } });
  await tx.productSize.deleteMany({ where: { productId } });
  await tx.productColor.deleteMany({ where: { productId } });

  const colorIds = new Map<string, string>();
  for (const color of prev.colors) {
    const created = await tx.productColor.create({
      data: {
        productId,
        name: color.name,
        displayOrder: color.displayOrder,
      },
    });
    colorIds.set(color.name, created.id);
  }

  for (const size of prev.sizes) {
    await tx.productSize.create({
      data: {
        productId,
        value: size.value,
        stock: size.stock,
      },
    });
  }

  for (const image of prev.images) {
    const colorId = colorIds.get(image.colorName);
    if (!colorId) continue;
    await tx.productImage.create({
      data: {
        productId,
        colorId,
        url: image.url,
        displayOrder: image.displayOrder,
        altText: image.altText,
      },
    });
  }
}
