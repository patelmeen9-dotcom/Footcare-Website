"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageContainer from "@/components/layout/page-container";
import { ArrowRight } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  banner: string;
  description: string;
  productCount: number;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("/api/brands");
        if (res.ok) {
          const data = await res.json();
          setBrands(data.brands || []);
        }
      } catch (err) {
        console.error("Failed to fetch brands:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  return (
    <div className="flex flex-col w-full bg-background min-h-screen py-space-6">
      <PageContainer className="flex flex-col gap-space-8">
        {/* Header */}
        <div className="flex flex-col gap-space-2 max-xl">
          <span className="text-label-small font-bold text-accent uppercase tracking-wider">
            Premium Partners
          </span>
          <h1 className="text-page-title font-bold tracking-tight text-primary">
            Our Official Brands
          </h1>
          <p className="text-body text-foreground/60 leading-relaxed">
            We partner directly with international retail brands to ensure that you get authentic products and the latest seasonal releases.
          </p>
        </div>

        {/* Brands List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-72 bg-card border border-border rounded-card animate-pulse" />
            ))}
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-space-12 text-foreground/40 text-body">
            No brands are currently in the catalogue.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-8">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="bg-card border border-border rounded-card overflow-hidden shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between group"
              >
                {/* Banner with gradient */}
                <div
                  className="h-48 w-full flex items-center justify-center text-white font-bold select-none relative"
                  style={{ background: brand.banner || "linear-gradient(135deg,#1e3c72,#2a5298)" }}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                  <h2 className="text-[3rem] font-extrabold tracking-tighter uppercase relative z-10">
                    {brand.name}
                  </h2>
                </div>

                {/* Info */}
                <div className="p-space-6 flex flex-col gap-space-4 flex-grow justify-between">
                  <div className="flex flex-col gap-space-2">
                    <span className="text-label-small font-semibold text-accent uppercase">
                      {brand.productCount} Items Available
                    </span>
                    <p className="text-caption text-foreground/75 leading-relaxed">
                      {brand.description}
                    </p>
                  </div>

                  <div className="pt-space-4 border-t border-border flex items-center justify-between mt-space-4">
                    <span className="text-label-small text-foreground/40 font-mono">100% Original Sourced</span>
                    <Link
                      href={`/products?brand=${encodeURIComponent(brand.name)}`}
                      className="flex items-center gap-1.5 text-caption font-bold text-primary group-hover:text-accent transition-colors"
                    >
                      Browse Collections
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
