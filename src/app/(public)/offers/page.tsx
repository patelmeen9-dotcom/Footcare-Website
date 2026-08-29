"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/layout/page-container";
import { Percent, Clock, MapPin, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OffersPage() {
  const [activeOffers, setActiveOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await fetch("/api/promotions");

        if (res.ok) {
          const data = await res.json();

          // Use ONLY promotions returned by the database/API.
          // No mock or dummy fallback.
          setActiveOffers(data.promotions || []);
        } else {
          console.error("Failed to fetch promotions:", res.status);
          setActiveOffers([]);
        }
      } catch (err) {
        console.error("Failed to fetch promotions:", err);
        setActiveOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

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
            Discounts and showroom-exclusive offers are updated weekly. Check
            below before making your purchase.
          </p>
        </div>

        {/* Offers list */}
        <div className="flex flex-col gap-space-8">
          {loading ? (
            <div className="text-center py-space-12 text-foreground/50">
              Loading offers...
            </div>
          ) : activeOffers.length === 0 ? (
            <div className="text-center py-space-12 border border-border rounded-card bg-card">
              <Percent className="h-10 w-10 mx-auto text-foreground/30 mb-space-3" />

              <h2 className="text-body-large font-bold text-foreground">
                No Active Offers
              </h2>

              <p className="text-caption text-foreground/50 mt-1">
                There are currently no active promotions available.
              </p>
            </div>
          ) : (
            activeOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-card border border-border rounded-card overflow-hidden shadow-soft-md flex flex-col md:flex-row hover:shadow-soft-lg transition-all"
              >
                {/* Left Column Accent Badge */}
                <div
                  className={`p-space-8 text-white flex flex-col items-center justify-center text-center md:w-64 bg-gradient-to-br ${offer.bgGradient ||
                    "from-[#2F3C8F] via-[#222c6b] to-[#161c47]"
                    } shrink-0 gap-space-2`}
                >
                  <Percent className="h-10 w-10 text-white/90" />

                  <div>
                    <span className="text-hero font-extrabold tracking-tight leading-none">
                      {offer.discount
                        ? String(offer.discount).split(" ")[0]
                        : "Offer"}
                    </span>

                    <p className="text-label-small font-bold uppercase tracking-wider text-white/80 mt-1">
                      {offer.discount
                        ? String(offer.discount)
                          .split(" ")
                          .slice(1)
                          .join(" ")
                        : ""}
                    </p>
                  </div>
                </div>

                {/* Right Column Info */}
                <div className="p-space-6 flex flex-col justify-between flex-grow gap-space-4">
                  <div className="flex flex-col gap-space-2">
                    <div className="flex items-center gap-space-2 text-label-small font-bold uppercase tracking-wider text-accent">
                      <Tag className="h-3.5 w-3.5" />

                      <span>
                        {offer.scope || offer.type || "Special Offer"}
                      </span>
                    </div>

                    <h3 className="text-body-large font-bold text-foreground">
                      {offer.name || offer.title}
                    </h3>

                    <p className="text-caption text-foreground/75 leading-relaxed">
                      {offer.description || ""}
                    </p>
                  </div>

                  <div className="border-t border-border pt-space-4 mt-space-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-3">
                    <div className="flex flex-col gap-1 text-label-small text-foreground/60">
                      {(offer.showroom || offer.showroomName) && (
                        <span className="flex items-center gap-1.5 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-accent" />

                          {offer.showroom || offer.showroomName}
                        </span>
                      )}

                      {(offer.duration ||
                        offer.endDate ||
                        offer.expiresAt) && (
                          <span className="flex items-center gap-1.5 text-foreground/40 font-mono">
                            <Clock className="h-3.5 w-3.5 text-accent" />

                            {offer.duration ||
                              `Expires: ${new Date(
                                offer.endDate || offer.expiresAt
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}`}
                          </span>
                        )}
                    </div>

                    <Link
                      href={`/products${offer.showroom || offer.showroomName
                          ? `?showroom=${encodeURIComponent(
                            offer.showroom || offer.showroomName
                          )}`
                          : ""
                        }`}
                      className="flex items-center gap-1 text-caption font-bold text-primary hover:text-accent transition-colors"
                    >
                      View Models
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PageContainer>
    </div>
  );
}