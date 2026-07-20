import PageContainer from "@/components/layout/page-container";
import { ShieldCheck, Award, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full bg-background min-h-screen py-space-6">
      <PageContainer className="flex flex-col gap-space-12 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-space-2 text-center items-center">
          <span className="text-label-small font-bold text-accent uppercase tracking-wider">
            Our Story
          </span>
          <h1 className="text-page-title font-bold tracking-tight text-primary">
            About FootCare Bhuj
          </h1>
          <p className="text-body text-foreground/60 max-w-lg leading-relaxed mt-2">
            Bridging the gap between digital discovery and high-end local retail footwear since our inception.
          </p>
        </div>

        {/* Mission / Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-8 mt-space-4">
          <div className="bg-card border border-border p-space-6 rounded-card shadow-soft-sm">
            <h2 className="text-body-large font-bold text-accent mb-2">Our Mission</h2>
            <p className="text-caption text-foreground/80 leading-relaxed">
              To deliver premium quality footwear and apparel from top global brands to the people of Bhuj and surrounding Kutch regions, supported by highly personalized and expert physical store service.
            </p>
          </div>
          <div className="bg-card border border-border p-space-6 rounded-card shadow-soft-sm">
            <h2 className="text-body-large font-bold text-accent mb-2">Our Vision</h2>
            <p className="text-caption text-foreground/80 leading-relaxed">
              To grow our network and innovate our digital offerings, making it effortless for catalog discovery while evolving into a full e-commerce solution in the future.
            </p>
          </div>
        </div>

        {/* Story details */}
        <div className="flex flex-col gap-space-4 leading-relaxed text-body text-foreground/85">
          <h2 className="text-section-title font-bold text-primary">Our Journey</h2>
          <p>
            Established as a dedicated local family business in Bhuj, Gujarat, FootCare began with a simple goal: to make authentic branded shoes accessible locally. Over the years, we expanded from a single store to three specialized showrooms carrying diverse athletic and casual footwear segments.
          </p>
          <p>
            We realized that our customers appreciate browsing catalogs online to check designs, color options, and size availability before coming to purchase. Hence, this platform serves as an interactive digital window showcasing active inventories in real-time.
          </p>
        </div>

        {/* Why Choose Us */}
        <div className="bg-secondary/40 rounded-card p-space-8 flex flex-col gap-space-6">
          <h2 className="text-section-title font-bold text-primary text-center">Why Choose FootCare</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-6 mt-2">
            <div className="flex flex-col gap-space-2 text-center items-center">
              <ShieldCheck className="h-6 w-6 text-accent" />
              <h3 className="text-body font-bold text-foreground">100% Genuine Products</h3>
              <p className="text-caption text-foreground/60 leading-relaxed max-w-xs">
                Zero duplicates. We acquire stock exclusively from verified global brand distributors.
              </p>
            </div>
            <div className="flex flex-col gap-space-2 text-center items-center">
              <Award className="h-6 w-6 text-accent" />
              <h3 className="text-body font-bold text-foreground">Curated Selections</h3>
              <p className="text-caption text-foreground/60 leading-relaxed max-w-xs">
                Specialized store managers catalog items that perfectly suit local lifestyle choices.
              </p>
            </div>
            <div className="flex flex-col gap-space-2 text-center items-center">
              <MapPin className="h-6 w-6 text-accent" />
              <h3 className="text-body font-bold text-foreground">Three Retail Spots</h3>
              <p className="text-caption text-foreground/60 leading-relaxed max-w-xs">
                Located conveniently across key locations in Bhuj for quick trial and collections.
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
