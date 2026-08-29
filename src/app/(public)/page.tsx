"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  Phone,
  ShieldCheck,
  Award,
  Users,
  ChevronRight,
  Percent,
  ArrowRight,
} from "lucide-react";
import PageContainer from "@/components/layout/page-container";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  banner: string;
  description: string;
  productCount: number;
}

interface Showroom {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  mapsUrl: string;
  heroImage: string;
  description: string;
  brands: string[];
}

interface Division {
  name: string;
  count: number;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);

  // Fetch new arrivals
  useEffect(() => {
    const fetch6 = async () => {
      try {
        const res = await fetch("/api/products?sortBy=newest");
        if (res.ok) {
          const data = await res.json();
          setNewArrivals((data.products || []).slice(0, 6));
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetch6();
  }, []);

  // Fetch active promotions
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await fetch("/api/promotions");
        if (res.ok) {
          const data = await res.json();
          setPromotions(data.promotions || []);
        } else {
          setPromotions([]);
        }
      } catch {
        setPromotions([]);
      }
    };
    fetchPromos();
  }, []);

  // Fetch real brands
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
      }
    };
    fetchBrands();
  }, []);

  // Fetch real showrooms
  useEffect(() => {
    const fetchShowrooms = async () => {
      try {
        const res = await fetch("/api/showrooms");
        if (res.ok) {
          const data = await res.json();
          setShowrooms(data.showrooms || []);
        }
      } catch (err) {
        console.error("Failed to fetch showrooms:", err);
      }
    };
    fetchShowrooms();
  }, []);

  // Fetch distinct product divisions for "Shop by Category" section
  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const res = await fetch("/api/products/filter-options");
        if (res.ok) {
          const data = await res.json();
          // Build division list — counts will be derived per-division from products
          setDivisions(
            (data.divisions || []).map((name: string, idx: number) => ({
              name,
              count: null, // fetched lazily below if needed
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch divisions:", err);
      }
    };
    fetchDivisions();
  }, []);

  // Gradient palette for division cards (cycles if more than palette length)
  const divisionGradients = [
    "from-[#2F3C8F] to-[#1d2558]",
    "from-[#1c2456] to-[#0c0f24]",
    "from-[#3a4ab1] to-[#242e6f]",
    "from-[#4a5ce4] to-[#2F3C8F]",
    "from-[#131926] to-[#1e293b]",
    "from-[#383d47] to-[#121212]",
  ];

  return (
    <div className="flex flex-col w-full bg-background min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative w-full h-[85vh] flex items-center justify-center bg-gradient-to-br from-[#10143a] via-[#1a2254] to-black text-white px-space-4 overflow-hidden rounded-b-hero">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,212,10,0.12)_0,transparent_60%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-3xl gap-space-4">
          <span className="text-accent tracking-widest font-semibold uppercase text-label-small bg-accent/10 px-space-3 py-1 rounded-full backdrop-blur-sm animate-fade-in">
            Original Premium Brands Only
          </span>

          <h1 className="text-hero md:text-[5rem] font-bold tracking-tight leading-none">
            Footwear &amp; <br className="hidden sm:inline" />
            Apparel Catalogue
          </h1>

          <p className="text-body-large md:text-subtitle text-white/70 max-w-xl leading-relaxed">
            Discover 100% authentic models from Nike, Skechers, Puma, Jockey,
            and Asics across our physical showrooms in Bhuj.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-space-4 mt-space-6 w-full max-w-md justify-center">
            <Link href="/products" className="btn-pill btn-primary">
              Explore Catalogue
              <span className="btn-primary-icon bg-black/12">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>

            <Link
              href="/showrooms"
              className="btn-pill border border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10"
            >
              Find Showrooms
              <span className="btn-primary-icon bg-white/20">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Search Bar */}
      <PageContainer as="section" className="relative z-20 mt-[-32px]">
        <div className="w-full max-w-2xl mx-auto bg-card text-card-foreground p-space-3 rounded-input shadow-soft-lg border border-border flex items-center gap-space-3">
          <Search className="h-5 w-5 text-foreground/40 shrink-0 ml-space-2" />

          <input
            type="text"
            placeholder="Search by product, article number, brand..."
            className="w-full outline-none text-body bg-transparent placeholder:text-foreground/30 text-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Link
            href={`/products?query=${encodeURIComponent(searchQuery)}`}
            className="bg-primary text-primary-foreground font-medium px-space-4 py-space-2.5 rounded-button hover:bg-accent hover:text-accent-foreground transition-all shrink-0 text-caption"
          >
            Find
          </Link>
        </div>
      </PageContainer>

      {/* 3. Promotional Offers Bar — only shown when real promotions exist */}
      {promotions.length > 0 && (
        <PageContainer as="section" className="py-space-6">
          <div className="relative overflow-hidden bg-gradient-to-r from-[#2F3C8F] to-[#1c2456] rounded-card p-space-6 text-white flex flex-col md:flex-row items-center justify-between gap-space-4">
            <div className="flex items-center gap-space-4">
              <div className="bg-accent/20 text-accent p-space-3 rounded-full shrink-0">
                <Percent className="h-6 w-6" />
              </div>
              <div>
                <span className="text-label-small font-bold uppercase tracking-wider text-white/80">
                  Active Showroom Promotion
                </span>
                <h2 className="text-section-title font-bold leading-tight">
                  {promotions[0].title}
                </h2>
              </div>
            </div>
            <Link
              href="/offers"
              className="bg-accent text-accent-foreground font-bold px-space-6 py-space-3 rounded-button shadow-soft-sm hover:bg-accent-hover transition-colors"
            >
              View Active Offers
            </Link>
          </div>
        </PageContainer>
      )}

      {/* 4. Featured Brands — from /api/brands */}
      <PageContainer as="section" className="py-space-8 flex flex-col gap-space-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-label-small text-accent font-semibold uppercase tracking-wider">
              Partners
            </span>
            <h2 className="text-section-title font-bold tracking-tight text-primary">
              Shop by Brand
            </h2>
          </div>
          <Link
            href="/brands"
            className="text-caption font-semibold text-accent flex items-center gap-1 hover:underline"
          >
            View All Brands
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-space-4">
          {brands.length === 0 ? (
            // Loading shimmer
            [...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-card border border-border rounded-card animate-pulse" />
            ))
          ) : (
            brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/products?brand=${encodeURIComponent(brand.name)}`}
                className="flex flex-col justify-between p-space-6 bg-card border border-border rounded-card hover:border-accent hover:shadow-soft-md transition-all group h-40"
              >
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold tracking-tighter text-body text-primary group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  {brand.logo?.substring(0, 2) || brand.name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-body font-bold text-foreground">{brand.name}</h3>
                  <span className="text-label-small text-foreground/40 font-medium">
                    {brand.productCount} Products
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </PageContainer>

      {/* 5. New Arrivals — from /api/products */}
      <PageContainer as="section" className="py-space-8 flex flex-col gap-space-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-label-small text-accent font-semibold uppercase tracking-wider">
              Just In
            </span>
            <h2 className="text-section-title font-bold tracking-tight text-primary">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/products?sortBy=newest"
            className="text-caption font-semibold text-accent flex items-center gap-1 hover:underline"
          >
            View Catalog
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-6">
          {newArrivals.length === 0 ? (
            <p className="text-caption text-foreground/40 col-span-3">
              No new arrivals found in the catalogue yet.
            </p>
          ) : (
            newArrivals.map((prod) => (
              <Link
                key={prod.id}
                href={`/products/${prod.slug}`}
                className="bg-card border border-border rounded-card overflow-hidden shadow-soft-sm hover:shadow-soft-md transition-all group flex flex-col justify-between"
              >
                <div className="relative h-60 w-full bg-slate-100 flex items-center justify-center text-slate-400 select-none overflow-hidden">
                  {prod.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-caption font-medium uppercase tracking-widest">
                      {prod.brand} Product Image
                    </span>
                  )}
                  {prod.discount > 0 && (
                    <span className="absolute top-4 left-4 bg-accent text-accent-foreground font-bold text-label-small px-3 py-1 rounded-full">
                      {prod.discount}% OFF
                    </span>
                  )}
                  <span className="absolute top-4 right-4 bg-accent text-accent-foreground font-bold text-label-small px-3 py-1 rounded-full">
                    NEW
                  </span>
                </div>

                <div className="p-space-6 flex flex-col gap-space-3">
                  <div className="flex items-center justify-between text-label-small text-foreground/50 font-medium">
                    <span>{prod.category}</span>
                    <span>{prod.brand}</span>
                  </div>
                  <div>
                    <h3 className="text-body-large font-bold text-foreground group-hover:text-accent transition-colors truncate">
                      {prod.name}
                    </h3>
                    <span className="text-label-small text-foreground/40 font-mono">
                      Art: {prod.articleNumber}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-body-large font-bold text-foreground">
                      ₹{prod.finalPrice}
                    </span>
                    {prod.discount > 0 && (
                      <span className="text-caption text-foreground/40 line-through">
                        ₹{prod.mrp}
                      </span>
                    )}
                  </div>
                  <div className="border-t border-border pt-space-3 mt-space-2 flex items-center justify-between text-label-small text-foreground/60">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-accent" />
                      {prod.showroom}
                    </span>
                    <span className="text-success font-bold uppercase">In Stock</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </PageContainer>

      {/* 6. Shop by Division — from /api/products/filter-options */}
      {divisions.length > 0 && (
        <PageContainer as="section" className="py-space-8 flex flex-col gap-space-4">
          <div>
            <span className="text-label-small text-accent font-semibold uppercase tracking-wider">
              Collections
            </span>
            <h2 className="text-section-title font-bold tracking-tight text-primary">
              Shop by Division
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-6">
            {divisions.map((div, idx) => (
              <Link
                key={div.name}
                href={`/products?division=${encodeURIComponent(div.name)}`}
                className={`relative overflow-hidden h-40 bg-gradient-to-br ${divisionGradients[idx % divisionGradients.length]} rounded-card p-space-6 flex flex-col justify-between text-white shadow-soft-sm group hover:scale-[1.01] transition-transform`}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                <div className="relative z-10">
                  <h3 className="text-body-large font-bold">{div.name}</h3>
                </div>
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-label-small text-white/80 font-medium">Browse Products</span>
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </PageContainer>
      )}

      {/* 7. Featured Showrooms — from /api/showrooms */}
      <PageContainer as="section" className="py-space-8 flex flex-col gap-space-6">
        <div>
          <span className="text-label-small text-accent font-semibold uppercase tracking-wider">
            Locations
          </span>
          <h2 className="text-section-title font-bold tracking-tight text-primary">
            Our Showrooms in Bhuj
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-8">
          {showrooms.length === 0 ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-card border border-border rounded-card animate-pulse" />
            ))
          ) : (
            showrooms.map((showroom) => (
              <div
                key={showroom.id}
                className="bg-card border border-border rounded-card overflow-hidden shadow-soft-md flex flex-col justify-between hover:shadow-soft-lg transition-all"
              >
                <div
                  className="h-44 w-full flex items-center justify-center text-white font-bold select-none p-space-4 text-center"
                  style={{ background: showroom.heroImage || "linear-gradient(135deg,#1e3c72,#2a5298)" }}
                >
                  <h3 className="text-body-large font-bold tracking-tight">{showroom.name}</h3>
                </div>

                <div className="p-space-6 flex flex-col gap-space-4 flex-grow justify-between">
                  <div className="flex flex-col gap-space-2 text-caption text-foreground/80">
                    <p className="line-clamp-2 leading-relaxed text-foreground/60">
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
                  </div>

                  <div className="flex flex-col gap-space-3 pt-space-4 border-t border-border">
                    {showroom.brands.length > 0 && (
                      <div className="flex justify-between text-label-small">
                        <span className="font-semibold text-foreground/50">Brands:</span>
                        <span className="text-accent font-bold">{showroom.brands.join(" • ")}</span>
                      </div>
                    )}
                    <div className="flex gap-2 w-full mt-2">
                      <a
                        href={`tel:${showroom.phone.replace(/\s+/g, "")}`}
                        className="flex items-center justify-center gap-2 flex-1 bg-primary text-primary-foreground font-semibold py-space-2.5 rounded-button text-caption hover:bg-accent hover:text-accent-foreground transition-colors text-center"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Call Store
                      </a>
                      <a
                        href={showroom.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 flex-1 border border-border font-semibold py-space-2.5 rounded-button text-caption hover:bg-secondary transition-colors text-center"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Directions
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PageContainer>

      {/* 8. Why Choose FootCare — static marketing copy, not business data */}
      <section className="bg-secondary/50 py-space-12 rounded-t-hero">
        <PageContainer className="grid grid-cols-1 md:grid-cols-3 gap-space-8">
          <div className="flex flex-col gap-space-2 text-center items-center">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-space-2">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-body font-bold text-foreground">100% Authentic Brands</h3>
            <p className="text-caption text-foreground/60 max-w-xs">
              Every single pair and piece of apparel in our digital catalog is
              sourced directly from original manufacturers.
            </p>
          </div>
          <div className="flex flex-col gap-space-2 text-center items-center">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-space-2">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-body font-bold text-foreground">Expert Staff Assistance</h3>
            <p className="text-caption text-foreground/60 max-w-xs">
              Our showroom representatives are trained to help you discover
              the exact fitting and style for your needs.
            </p>
          </div>
          <div className="flex flex-col gap-space-2 text-center items-center">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-space-2">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-body font-bold text-foreground">Serving Bhuj for Years</h3>
            <p className="text-caption text-foreground/60 max-w-xs">
              Built on local trust, FootCare has been the premium footwear
              shopping choice for thousands of loyal customers.
            </p>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}