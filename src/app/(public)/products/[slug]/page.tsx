"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageContainer from "@/components/layout/page-container";
import { MapPin, Phone, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  finalPrice: number;
  image: string;
  coverImage?: string;
}

interface ProductImage {
  id: string;
  url: string;
  colorId: string;
  altText?: string;
}

interface ProductColor {
  id: string;
  name: string;
}

interface Showroom {
  name: string;
  slug: string;
  address: string;
  phone: string;
  mapsUrl: string;
  openingTime: string;
  closingTime: string;
}

interface ProductDetails {
  id: string;
  articleNumber: string;
  name: string;
  slug: string;
  description: string;
  material?: string;
  careInstructions?: string;
  mrp: number;
  discount: number;
  finalPrice: number;
  available: boolean;
  hotSelling: boolean;
  brand: { name: string; slug: string };
  category: { name: string; slug: string };
  showroom: Showroom;
  colors: ProductColor[];
  sizes: string[];
  images: ProductImage[];
  coverImage?: string;
  imageCount?: number;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          document.title = `${data.name} | FootCare Bhuj`;

          // Default selection to first color
          if (data.colors && data.colors.length > 0) {
            setSelectedColor(data.colors[0].id);
          }
          if (data.sizes && data.sizes.length > 0) {
            setSelectedSize(data.sizes[0]);
          }

          // Fetch related products from same brand/category
          const relRes = await fetch(`/api/products?brand=${encodeURIComponent(data.brand.name)}&limit=3`);
          if (relRes.ok) {
            const relData = await relRes.json();
            setRelatedProducts(relData.products?.filter((p: RelatedProduct) => p.slug !== slug) || []);
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProductDetails();
  }, [slug]);

  // Filter images based on color-switching choice (PRD Section 58)
  const colorFilteredImages = product?.images.filter((img) => img.colorId === selectedColor) || [];

  const galleryImages = colorFilteredImages.length > 0 ? colorFilteredImages : (product?.images || []);

  const activeImage = galleryImages[activeImageIndex] || galleryImages[0] || (product?.coverImage ? { url: product.coverImage, altText: product.name } : null);

  if (loading) {
    return (
      <PageContainer className="py-space-12 flex flex-col gap-space-8 animate-pulse">
        <div className="h-6 w-24 bg-secondary rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-12">
          <div className="h-[450px] bg-secondary rounded-card" />
          <div className="flex flex-col gap-space-4">
            <div className="h-4 w-1/4 bg-secondary rounded" />
            <div className="h-10 w-3/4 bg-secondary rounded" />
            <div className="h-6 w-1/3 bg-secondary rounded" />
            <div className="h-20 w-full bg-secondary rounded" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!product) {
    return (
      <PageContainer className="py-space-24 text-center flex flex-col items-center gap-space-4">
        <h1 className="text-section-title font-bold text-primary">Product Not Found</h1>
        <p className="text-caption text-foreground/50 max-w-xs leading-relaxed">
          The product you are looking for does not exist or may have been archived by the administrator.
        </p>
        <button
          onClick={() => router.push("/products")}
          className="bg-primary text-primary-foreground font-semibold px-space-6 py-2.5 rounded-button text-caption hover:bg-accent hover:text-accent-foreground transition-all"
        >
          Back to Catalogue
        </button>
      </PageContainer>
    );
  }

  return (
    <div className="bg-background w-full min-h-screen py-space-6 pb-24">
      <PageContainer className="flex flex-col gap-space-12">
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-caption font-semibold text-foreground/60 hover:text-primary w-max transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {/* Core details layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-12 items-start">
          {/* 1. Swipeable Product Gallery */}
          <div className="flex flex-col gap-space-4">
            <div className="relative aspect-square w-full bg-slate-100 rounded-card overflow-hidden shadow-soft-sm flex items-center justify-center text-slate-400 select-none border border-border">
              {activeImage ? (
                <img
                  src={activeImage.url}
                  alt={activeImage.altText || product.name}
                  className="object-cover w-full h-full animate-fade-in"
                />
              ) : (
                <span className="text-caption uppercase tracking-widest text-foreground/30">No Image Available</span>
              )}

              {/* Badges */}
              {product.discount > 0 && (
                <span className="absolute top-6 left-6 bg-accent text-accent-foreground font-bold text-label-small px-3 py-1 rounded-full">
                  {product.discount}% OFF
                </span>
              )}
              {product.hotSelling && (
                <span className="absolute top-6 right-6 bg-primary text-primary-foreground font-bold text-label-small px-3 py-1 rounded-full">
                  POPULAR
                </span>
              )}
            </div>

            {/* Thumbnail selector */}
            {galleryImages.length > 1 && (
              <div className="flex gap-space-3 overflow-x-auto py-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-16 w-16 rounded-button overflow-hidden border-2 shrink-0 bg-slate-50 transition-all ${
                      idx === activeImageIndex ? "border-primary scale-[1.03]" : "border-border"
                    }`}
                  >
                    <img src={img.url} alt="thumbnail" className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Product Specs and Details */}
          <div className="flex flex-col gap-space-6">
            {/* Header info */}
            <div className="flex flex-col gap-space-1">
              <span className="text-label-small font-bold text-primary uppercase tracking-wider">
                {product.brand.name} • {product.category.name}
              </span>
              <h1 className="text-page-title md:text-[2.25rem] font-bold tracking-tight text-foreground leading-tight">
                {product.name}
              </h1>
              <span className="text-label-small text-foreground/40 font-mono mt-1">Article Code: {product.articleNumber}</span>
            </div>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-space-3">
              <span className="text-[2rem] font-extrabold text-foreground leading-none">
                ₹{product.finalPrice}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-body-large text-foreground/45 line-through leading-none">
                    ₹{product.mrp}
                  </span>
                  <span className="text-caption font-bold text-accent uppercase leading-none">
                    Save ₹{product.mrp - product.finalPrice}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-caption text-foreground/80 leading-relaxed">
              {product.description}
            </p>

            {/* Product Color switching */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex flex-col gap-space-2">
                <span className="text-label-small font-bold text-foreground/50 uppercase tracking-wider">Colorways</span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => {
                        setSelectedColor(color.id);
                        setActiveImageIndex(0); // reset index
                      }}
                      className={`text-caption font-semibold px-space-4 py-2 rounded-button border transition-all ${
                        selectedColor === color.id
                          ? "bg-primary text-primary-foreground border-primary shadow-soft-sm"
                          : "border-border text-foreground hover:bg-secondary"
                      }`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes section */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="flex flex-col gap-space-2">
                <span className="text-label-small font-bold text-foreground/50 uppercase tracking-wider">Select Size</span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`text-caption font-mono font-bold w-12 h-12 flex items-center justify-center rounded-button border transition-all ${
                        selectedSize === size
                          ? "bg-primary text-primary-foreground border-primary shadow-soft-sm"
                          : "border-border text-foreground hover:bg-secondary"
                      }`}
                    >
                      {size.replace("UK ", "")}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Store Finder Card (PRD Section 59) */}
            <div className="bg-card border border-border p-space-6 rounded-card shadow-soft-md flex flex-col gap-space-4">
              <div className="flex items-start gap-space-3">
                <div className="bg-accent/15 text-accent p-space-3 rounded-full shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-label-small font-bold uppercase tracking-wider text-accent leading-none">
                    Available At
                  </span>
                  <h3 className="text-body font-bold text-foreground mt-1">
                    {product.showroom.name}
                  </h3>
                  <p className="text-caption text-foreground/60 leading-relaxed mt-0.5">
                    {product.showroom.address}
                  </p>
                  <span className="text-label-small text-success font-bold uppercase tracking-wider block mt-2">
                    ● Open now (Closes at {product.showroom.closingTime})
                  </span>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="flex gap-space-3 pt-space-3 border-t border-border mt-2">
                <a
                  href={`tel:${product.showroom.phone.replace(/\s+/g, "")}`}
                  className="flex items-center justify-center gap-2 flex-1 bg-accent text-accent-foreground font-bold py-space-3 rounded-button text-caption hover:bg-accent-hover transition-colors shadow-soft-sm text-center"
                >
                  <Phone className="h-4 w-4" />
                  Call Showroom
                </a>
                <a
                  href={product.showroom.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 flex-1 border border-border font-semibold py-space-3 rounded-button text-caption hover:bg-secondary transition-colors text-center"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  Get Directions
                </a>
              </div>
            </div>

            {/* Material and Care list */}
            {(product.material || product.careInstructions) && (
              <div className="flex flex-col gap-space-3 border-t border-border pt-space-6 mt-2">
                {product.material && (
                  <div className="flex flex-col gap-1">
                    <span className="text-label-small font-bold text-foreground/50 uppercase tracking-wider">Composition</span>
                    <span className="text-caption text-foreground/80">{product.material}</span>
                  </div>
                )}
                {product.careInstructions && (
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-label-small font-bold text-foreground/50 uppercase tracking-wider">Care Guide</span>
                    <span className="text-caption text-foreground/80">{product.careInstructions}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. Related Products section */}
        {relatedProducts.length > 0 && (
          <div className="flex flex-col gap-space-6 border-t border-border pt-space-12 mt-space-6">
            <h2 className="text-section-title font-bold text-primary tracking-tight">
              Recommended Collection
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-6">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="bg-card border border-border rounded-card overflow-hidden shadow-soft-sm hover:shadow-soft-md transition-all group flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full bg-slate-100 flex items-center justify-center text-slate-400 select-none overflow-hidden">
                    {p.coverImage || p.image ? (
                      <img src={p.coverImage || p.image} alt={p.name} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-caption font-medium uppercase tracking-widest text-foreground/30">{p.brand} Image</span>
                    )}
                  </div>
                  <div className="p-space-4 flex flex-col gap-space-2">
                    <span className="text-label-small text-foreground/40 font-medium uppercase">{p.brand}</span>
                    <h3 className="text-caption font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    <span className="text-caption font-bold text-foreground">₹{p.finalPrice}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
