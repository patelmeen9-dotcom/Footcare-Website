import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MOCK_PRODUCTS } from "@/constants/mock-data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const hasDatabase = !!process.env.DATABASE_URL;

    if (hasDatabase) {
      try {
        const product = await db.product.findUnique({
          where: { slug },
          include: {
            brand: true,
            category: true,
            showroom: true,
            colors: {
              include: {
                images: true,
              },
            },
            sizes: true,
            images: true,
          },
        });

        if (product) {
          const firstImg = product.images[0]?.url || "";
          return NextResponse.json({
            id: product.id,
            articleNumber: product.articleNumber,
            name: product.name,
            slug: product.slug,
            description: product.description,
            material: product.material,
            careInstructions: product.careInstructions,
            mrp: Number(product.mrp),
            discount: Number(product.discount),
            finalPrice: Number(product.finalPrice),
            available: product.available,
            hotSelling: product.hotSelling,
            hotSellingBadge: product.hotSellingBadge,
            newArrival: product.newArrival,
            brand: product.brand,
            category: product.category,
            showroom: product.showroom,
            colors: product.colors.map((c) => ({
              id: c.id,
              name: c.name,
            })),
            sizes: product.sizes.map((s) => s.value),
            coverImage: firstImg,
            images: product.images.map((i) => ({
              id: i.id,
              url: i.url,
              colorId: i.colorId,
              color: product.colors.find((c) => c.id === i.colorId)?.name || "Default",
              altText: i.altText || product.name,
            })),
            imageCount: product.images.length,
          });
        }
      } catch (dbError) {
        console.warn("Database lookup failed, falling back to mock details:", dbError);
      }
    }

    // Fallback Mock Details
    const mockProduct = MOCK_PRODUCTS.find((p) => p.slug === slug);
    if (!mockProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Identify cover image and mapped gallery images
    const coverImg = mockProduct.images?.[0]?.url || mockProduct.coverImage || mockProduct.image || "/mock-pegasus.jpg";
    const mappedImages = mockProduct.images && mockProduct.images.length > 0
      ? mockProduct.images
      : [{ filename: "cover.jpg", url: coverImg, color: "Default" }];

    // Generate colorway IDs mapped to color names
    const uniqueColors = Array.from(new Set(mappedImages.map((img) => img.color || "Default")));
    const colors = uniqueColors.map((colorName, idx) => ({
      id: `color-${idx}`,
      name: colorName,
    }));

    // Build standard detail view images structure
    const images = mappedImages.map((img, idx) => {
      const colorObj = colors.find((c) => c.name === (img.color || "Default")) || colors[0];
      return {
        id: `img-${idx}`,
        url: img.url,
        colorId: colorObj.id,
        color: img.color || "Default",
        altText: `${mockProduct.name} ${img.color || "Default"} View ${idx + 1}`,
      };
    });

    const sizes = ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];

    return NextResponse.json({
      ...mockProduct,
      coverImage: coverImg,
      images,
      imageCount: mappedImages.length,
      description: `The ${mockProduct.name} represents a benchmark in style, performance, and everyday durability. Fabricated with breathable mesh upper, structured heel overlay support, and high-performance cushioning, it delivers ultimate walking and athletic comfort. Perfect for running tracks, daily commute, or active gym sessions.`,
      material: "Premium Breathable Synthetic Mesh / Textured Rubber Sole",
      careInstructions: "Wipe clean with a damp cloth. Air dry away from direct sunlight. Do not machine wash.",
      brand: { name: mockProduct.brand, slug: mockProduct.brand.toLowerCase() },
      category: { name: mockProduct.category, slug: mockProduct.category.toLowerCase().replace(/\s+/g, "-") },
      showroom: {
        name: mockProduct.showroom,
        slug: mockProduct.showroom.toLowerCase().replace(/\s+/g, "-"),
        address: "Jubilee Ground Road, Bhuj, Gujarat",
        phone: "+91 98252 12345",
        mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(mockProduct.showroom)}`,
        openingTime: "09:30 AM",
        closingTime: "09:00 PM",
      },
      colors,
      sizes,
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
