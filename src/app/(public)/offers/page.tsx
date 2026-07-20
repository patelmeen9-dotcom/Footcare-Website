import PageContainer from "@/components/layout/page-container";
import { Percent, Clock, MapPin, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OffersPage() {
  const activeOffers = [
    {
      id: "promo-1",
      name: "Monsoon Sports Splash",
      type: "SHOWROOM",
      discount: "Flat 20% OFF",
      scope: "Nike Footwear",
      showroom: "Footcare Kick Sports",
      description: "Gear up with original Pegasus, Downshifter, and Air Max models at a flat 20% discount. Available in-store only.",
      duration: "Expires: July 31, 2026",
      bgGradient: "from-[#2F3C8F] via-[#222c6b] to-[#161c47]",
    },
    {
      id: "promo-2",
      name: "Skechers Comfort Week",
      type: "BRAND",
      discount: "15% OFF",
      scope: "All Skechers Models",
      showroom: "Foot Care Store",
      description: "Experience absolute walking luxury. Get 15% discount on Arch Fit and Go Walk footwear models.",
      duration: "Expires: July 28, 2026",
      bgGradient: "from-[#1c2456] via-[#101533] to-[#05060f]",
    },
    {
      id: "promo-3",
      name: "Jockey Leisure Campaign",
      type: "GLOBAL",
      discount: "Up to 10% OFF",
      scope: "Jockey Athleisure Wear",
      showroom: "Foot Care Mall",
      description: "Upgrade your casual style with authentic track pants, t-shirts, and active innerwear collections.",
      duration: "Expires: August 05, 2026",
      bgGradient: "from-[#3b4cb5] via-[#242f72] to-[#12173a]",
    },
  ];

  return (
    <div className="flex flex-col w-full bg-background min-h-screen py-space-6">
      <PageContainer className="flex flex-col gap-space-12 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-space-2 text-center items-center">
          <span className="text-label-small font-bold text-accent uppercase tracking-wider">
            Promotions
          </span>
          <h1 className="text-page-title font-bold tracking-tight text-primary">
            Active Store Offers
          </h1>
          <p className="text-body text-foreground/60 max-w-lg leading-relaxed mt-2">
            Discounts and showroom-exclusive offers are updated weekly. Check below before making your purchase.
          </p>
        </div>

        {/* Offers list */}
        <div className="flex flex-col gap-space-8">
          {activeOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-card border border-border rounded-card overflow-hidden shadow-soft-md flex flex-col md:flex-row hover:shadow-soft-lg transition-all"
            >
              {/* Left Column Accent Badge */}
              <div
                className={`p-space-8 text-white flex flex-col items-center justify-center text-center md:w-64 bg-gradient-to-br ${offer.bgGradient} shrink-0 gap-space-2`}
              >
                <Percent className="h-10 w-10 text-white/90" />
                <div>
                  <span className="text-hero font-extrabold tracking-tight leading-none">
                    {offer.discount.split(" ")[0]}
                  </span>
                  <p className="text-label-small font-bold uppercase tracking-wider text-white/80 mt-1">
                    {offer.discount.split(" ").slice(1).join(" ")}
                  </p>
                </div>
              </div>

              {/* Right Column Info */}
              <div className="p-space-6 flex flex-col justify-between flex-grow gap-space-4">
                <div className="flex flex-col gap-space-2">
                  <div className="flex items-center gap-space-2 text-label-small font-bold uppercase tracking-wider text-accent">
                    <Tag className="h-3.5 w-3.5" />
                    <span>{offer.scope}</span>
                  </div>
                  <h3 className="text-body-large font-bold text-foreground">
                    {offer.name}
                  </h3>
                  <p className="text-caption text-foreground/75 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                <div className="border-t border-border pt-space-4 mt-space-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-3">
                  <div className="flex flex-col gap-1 text-label-small text-foreground/60">
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-accent" />
                      {offer.showroom}
                    </span>
                    <span className="flex items-center gap-1.5 text-foreground/40 font-mono">
                      <Clock className="h-3.5 w-3.5 text-accent" />
                      {offer.duration}
                    </span>
                  </div>

                  <Link
                    href={`/products?showroom=${encodeURIComponent(offer.showroom)}`}
                    className="flex items-center gap-1 text-caption font-bold text-primary hover:text-accent transition-colors"
                  >
                    View Models
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
