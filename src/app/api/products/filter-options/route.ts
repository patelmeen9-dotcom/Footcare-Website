import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/products/filter-options
 *
 * Returns distinct non-null, non-empty values for the three Excel-sourced
 * Product fields used as filters:
 *   - division        (Excel: DIVISION)
 *   - productCategory (Excel: PRODUCT CATEGORY)
 *   - subCategory     (Excel: PRODUCT TYPE / CATEGORY)
 *
 * All deduplication and null-filtering happens at the database level via
 * Prisma distinct queries — no product rows are loaded into memory.
 */
export async function GET() {
  try {
    const hasDatabase = !!process.env.DATABASE_URL;

    if (!hasDatabase) {
      return NextResponse.json({
        divisions: [],
        productCategories: [],
        productTypes: [],
      });
    }

    const baseWhere = { status: "ACTIVE", available: true };

    const [divisionRows, productCategoryRows, subCategoryRows] = await Promise.all([
      db.product.findMany({
        where: { ...baseWhere, division: { not: null } },
        select: { division: true },
        distinct: ["division"],
        orderBy: { division: "asc" },
      }),
      db.product.findMany({
        where: { ...baseWhere, productCategory: { not: null } },
        select: { productCategory: true },
        distinct: ["productCategory"],
        orderBy: { productCategory: "asc" },
      }),
      db.product.findMany({
        where: { ...baseWhere, subCategory: { not: null } },
        select: { subCategory: true },
        distinct: ["subCategory"],
        orderBy: { subCategory: "asc" },
      }),
    ]);

    // Filter out nulls, empty strings, and whitespace-only strings
    const clean = (val: string | null | undefined): string | null => {
      if (!val) return null;
      const t = val.trim();
      return t.length > 0 ? t : null;
    };

    const divisions = divisionRows
      .map((r) => clean(r.division))
      .filter((v): v is string => v !== null);

    const productCategories = productCategoryRows
      .map((r) => clean(r.productCategory))
      .filter((v): v is string => v !== null);

    const productTypes = subCategoryRows
      .map((r) => clean(r.subCategory))
      .filter((v): v is string => v !== null);

    return NextResponse.json({ divisions, productCategories, productTypes });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
