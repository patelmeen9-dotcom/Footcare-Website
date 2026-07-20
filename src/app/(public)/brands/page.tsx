"use client";

import Link from "next/link";
import { MOCK_BRANDS } from "@/constants/mock-data";
import PageContainer from "@/components/layout/page-container";
import { ArrowRight } from "lucide-react";

export default function BrandsPage() {
  return (
    <div className="flex flex-col w-full bg-background min-h-screen py-space-6">
      <PageContainer className="flex flex-col gap-space-8">
        {/* Header */}
        <div className="flex flex-col gap-space-2 max-w-xl">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-8">
          {MOCK_BRANDS.map((brand) => (
            <div
              key={brand.id}
              className="bg-card border border-border rounded-card overflow-hidden shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between group"
            >
              {/* Logo Box with Gradient */}
              <div
                className="h-48 w-full flex items-center justify-center text-white font-bold select-none relative"
                style={{ background: brand.banner }}
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
      </PageContainer>
    </div>
  );
}
