import { Prisma } from "@prisma/client";

export type ProductSnapshot = {
  articleNumber: string;
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  showroomId: string;
  description: string;
  material: string | null;
  careInstructions: string | null;
  mrp: number;
  discount: number;
  finalPrice: number;
  available: boolean;
  hotSelling: boolean;
  hotSellingBadge: string | null;
  featured: boolean;
  newArrival: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  division: string | null;
  productCategory: string | null;
  subCategory: string | null;
  status: string;
  colors: { name: string; displayOrder: number }[];
  sizes: { value: string; stock: number }[];
  images: { url: string; colorName: string; displayOrder: number; altText: string | null }[];
};

export type ImportSnapshot = {
  createdArticleNumbers: string[];
  updatedProducts: ProductSnapshot[];
};

type ProductWithRelations = {
  articleNumber: string;
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  showroomId: string;
  description: string;
  material: string | null;
  careInstructions: string | null;
  mrp: Prisma.Decimal | number;
  discount: Prisma.Decimal | number;
  finalPrice: Prisma.Decimal | number;
  available: boolean;
  hotSelling: boolean;
  hotSellingBadge: string | null;
  featured: boolean;
  newArrival: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  division: string | null;
  productCategory: string | null;
  subCategory: string | null;
  status: string;
  colors: { name: string; displayOrder: number }[];
  sizes: { value: string; stock: number }[];
  images: { url: string; displayOrder: number; altText: string | null; color: { name: string } }[];
};

export function serializeProductSnapshot(product: ProductWithRelations): ProductSnapshot {
  return {
    articleNumber: product.articleNumber,
    name: product.name,
    slug: product.slug,
    brandId: product.brandId,
    categoryId: product.categoryId,
    showroomId: product.showroomId,
    description: product.description,
    material: product.material,
    careInstructions: product.careInstructions,
    mrp: Number(product.mrp),
    discount: Number(product.discount),
    finalPrice: Number(product.finalPrice),
    available: product.available,
    hotSelling: product.hotSelling,
    hotSellingBadge: product.hotSellingBadge,
    featured: product.featured,
    newArrival: product.newArrival,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    division: product.division,
    productCategory: product.productCategory,
    subCategory: product.subCategory,
    status: product.status,
    colors: product.colors.map((c) => ({ name: c.name, displayOrder: c.displayOrder })),
    sizes: product.sizes.map((s) => ({ value: s.value, stock: s.stock })),
    images: product.images.map((img) => ({
      url: img.url,
      colorName: img.color.name,
      displayOrder: img.displayOrder,
      altText: img.altText,
    })),
  };
}

export function parseImportSnapshot(value: unknown): ImportSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<ImportSnapshot>;
  if (!Array.isArray(raw.createdArticleNumbers) || !Array.isArray(raw.updatedProducts)) {
    return null;
  }
  return {
    createdArticleNumbers: raw.createdArticleNumbers.filter((v): v is string => typeof v === "string"),
    updatedProducts: raw.updatedProducts as ProductSnapshot[],
  };
}
