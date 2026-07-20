"use client";

import PageContainer from "@/components/layout/page-container";
import { MOCK_SHOWROOMS } from "@/constants/mock-data";
import { MapPin, Phone, Clock, Check, X } from "lucide-react";

export default function ShowroomsPage() {
  const comparisonData = [
    { brand: "Nike", kickSports: true, store: false, mall: false },
    { brand: "Skechers", kickSports: true, store: false, mall: false },
    { brand: "Puma", kickSports: false, store: true, mall: false },
    { brand: "Jockey", kickSports: false, store: true, mall: false },
    { brand: "Asics", kickSports: false, store: false, mall: true },
    { brand: "Joybean", kickSports: false, store: false, mall: true },
  ];

  return (
    <div className="flex flex-col w-full bg-background min-h-screen py-space-6">
      <PageContainer className="flex flex-col gap-space-12">
        {/* Header */}
        <div className="flex flex-col gap-space-2 max-w-xl">
          <span className="text-label-small font-bold text-accent uppercase tracking-wider">
            Locations
          </span>
          <h1 className="text-page-title font-bold tracking-tight text-primary">
            Our Showrooms in Bhuj
          </h1>
          <p className="text-body text-foreground/60 leading-relaxed">
            FootCare operates three independent physical showrooms in Bhuj, each containing a tailored selection of lifestyle and sportswear brands.
          </p>
        </div>

        {/* Showrooms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-8">
          {MOCK_SHOWROOMS.map((showroom) => (
            <div
              key={showroom.id}
              className="bg-card border border-border rounded-card overflow-hidden shadow-soft-md flex flex-col justify-between hover:shadow-soft-lg transition-all group"
            >
              {/* Banner */}
              <div
                className="h-48 w-full flex items-center justify-center text-white p-space-6 relative"
                style={{ background: showroom.heroImage }}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <h3 className="text-body-large font-bold tracking-tight text-center relative z-10">
                  {showroom.name}
                </h3>
              </div>

              {/* Info */}
              <div className="p-space-6 flex flex-col gap-space-4 flex-grow justify-between">
                <div className="flex flex-col gap-space-3 text-caption text-foreground/80">
                  <p className="leading-relaxed text-foreground/60">
                    {showroom.description}
                  </p>
                  <div className="flex gap-2 items-start mt-2">
                    <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>{showroom.address}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Phone className="h-4 w-4 text-accent shrink-0" />
                    <span>{showroom.phone}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Clock className="h-4 w-4 text-accent shrink-0" />
                    <span>Open: {showroom.openingTime} – {showroom.closingTime}</span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="pt-space-4 border-t border-border mt-space-4 flex flex-col gap-space-2">
                  <div className="flex items-center justify-between text-label-small font-medium mb-1">
                    <span className="text-foreground/50">Exclusive Brands:</span>
                    <span className="text-accent font-bold">{showroom.brands.join(" • ")}</span>
                  </div>
                  <div className="flex gap-2 w-full">
                    <a
                      href={`tel:${showroom.phone.replace(/\s+/g, "")}`}
                      className="flex items-center justify-center gap-1.5 flex-1 bg-primary text-primary-foreground font-semibold py-2.5 rounded-button text-caption hover:bg-accent hover:text-accent-foreground transition-all"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call Store
                    </a>
                    <a
                      href={showroom.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 flex-1 border border-border font-semibold py-2.5 rounded-button text-caption hover:bg-secondary transition-all"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      Directions
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Brand Showroom Comparison Table */}
        <div className="bg-card border border-border rounded-card p-space-6 shadow-soft-sm flex flex-col gap-space-4">
          <div>
            <h2 className="text-section-title font-bold text-primary tracking-tight">
              Compare Showroom Availability
            </h2>
            <p className="text-caption text-foreground/60 leading-relaxed mt-1">
              Certain brands and collections are targeted to specific locations. Review availability before visiting.
            </p>
          </div>

          <div className="overflow-x-auto w-full border border-border rounded-input">
            <table className="w-full border-collapse text-left text-body">
              <thead>
                <tr className="bg-secondary text-foreground border-b border-border text-caption font-semibold uppercase">
                  <th className="p-space-4 font-bold">Brand</th>
                  <th className="p-space-4 font-bold text-center">Kick Sports (Nr. Honest)</th>
                  <th className="p-space-4 font-bold text-center">Foot Care Store (Mandvi Octroi)</th>
                  <th className="p-space-4 font-bold text-center">Foot Care Mall (Jay Nagar)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-caption">
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-space-4 font-semibold text-primary">{row.brand}</td>
                    <td className="p-space-4 text-center">
                      {row.kickSports ? (
                        <Check className="h-5 w-5 text-success mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-error mx-auto" />
                      )}
                    </td>
                    <td className="p-space-4 text-center">
                      {row.store ? (
                        <Check className="h-5 w-5 text-success mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-error mx-auto" />
                      )}
                    </td>
                    <td className="p-space-4 text-center">
                      {row.mall ? (
                        <Check className="h-5 w-5 text-success mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-error mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
