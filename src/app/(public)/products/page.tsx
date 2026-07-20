"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import PageContainer from "@/components/layout/page-container";
import { Search, MapPin, SlidersHorizontal, ArrowUpDown, RefreshCw, X, ChevronLeft, ChevronRight } from "lucide-react";
import { MOCK_BRANDS, MOCK_SHOWROOMS } from "@/constants/mock-data";

interface Product {
  id: string;
  articleNumber: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  showroom: string;
  mrp: number;
  discount: number;
  finalPrice: number;
  image: string;
  coverImage?: string;
  images?: { filename: string; url: string; color?: string }[];
  imageCount?: number;
  hotSelling: boolean;
  hotSellingBadge?: string;
  newArrival: boolean;
  available: boolean;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL state defaults
  const queryParam = searchParams.get("query") || "";
  const brandParam = searchParams.get("brand") || "";
  const categoryParam = searchParams.get("category") || "";
  const showroomParam = searchParams.get("showroom") || "";

  // Component states
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);

  const [searchVal, setSearchVal] = useState(queryParam);
  const [selectedBrand, setSelectedBrand] = useState(brandParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedShowroom, setSelectedShowroom] = useState(showroomParam);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync inputs with URL changes (e.g. searching from Home page)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchVal(queryParam);
      setSelectedBrand(brandParam);
      setSelectedCategory(categoryParam);
      setSelectedShowroom(showroomParam);
      setPage(1);
    }, 0);
    return () => clearTimeout(timer);
  }, [queryParam, brandParam, categoryParam, showroomParam]);

  useEffect(() => {
    const fetchProducts = async () => {
      await Promise.resolve();
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchVal) params.append("query", searchVal);
        if (selectedBrand) params.append("brand", selectedBrand);
        if (selectedCategory) params.append("category", selectedCategory);
        if (selectedShowroom) params.append("showroom", selectedShowroom);
        if (sortBy) params.append("sortBy", sortBy);
        params.append("page", String(page));

        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
        }
      } catch (err) {
        console.error("Error fetching catalogue products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchVal, selectedBrand, selectedCategory, selectedShowroom, sortBy, page]);

  const handleResetFilters = () => {
    setSearchVal("");
    setSelectedBrand("");
    setSelectedCategory("");
    setSelectedShowroom("");
    setSortBy("newest");
    setPage(1);
    router.push("/products");
  };

  const categoriesList = [
    "Running Shoes",
    "Casual Shoes",
    "Sports Shoes",
    "Sandals",
    "Apparel",
    "Accessories",
  ];

  return (
    <div className="flex flex-col w-full bg-background min-h-screen py-space-6 pb-24 md:pb-space-12">
      <PageContainer className="flex flex-col gap-space-8">
        {/* Header */}
        <div className="flex flex-col gap-space-2 max-w-xl">
          <span className="text-label-small font-bold text-accent uppercase tracking-wider bg-accent/10 px-3 py-1 rounded-full w-max">
            FootCare Catalogue
          </span>
          <h1 className="text-page-title font-bold tracking-tight text-primary">
            Explore Footwear & Apparel
          </h1>
          <p className="text-body text-foreground/60 leading-relaxed">
            Browse our catalog. Check pricing and stock availability, and visit our showroom to try them on.
          </p>
        </div>

        {/* Catalog Control Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-4 border-b border-border pb-space-4">
          {/* Live Search Bar */}
          <div className="relative w-full md:max-w-md bg-card border border-border p-space-2.5 rounded-input shadow-soft-sm flex items-center gap-space-3">
            <Search className="h-5 w-5 text-foreground/30 shrink-0 ml-1" />
            <input
              type="text"
              placeholder="Search by product, article number, brand..."
              className="w-full outline-none text-caption bg-transparent placeholder:text-foreground/30 text-foreground"
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
                setPage(1);
              }}
            />
            {searchVal && (
              <button onClick={() => setSearchVal("")} className="text-foreground/40 hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-space-3">
            {/* Mobile Filters Toggle Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex md:hidden items-center justify-center gap-2 border border-border bg-card p-space-3 rounded-button text-caption font-semibold text-foreground hover:bg-secondary"
            >
              <SlidersHorizontal className="h-4 w-4 text-accent" />
              Filters
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 border border-border bg-card p-space-2.5 rounded-button shadow-soft-sm">
              <ArrowUpDown className="h-4 w-4 text-foreground/40" />
              <select
                className="outline-none text-caption text-foreground bg-transparent font-medium"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
              >
                <option value="newest">Sort: New Arrivals</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="discount">Discount Percentage</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Catalogue Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-8 items-start">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden md:flex flex-col gap-space-6 bg-card border border-border p-space-6 rounded-card shadow-soft-sm sticky top-24">
            <div className="flex items-center justify-between border-b border-border pb-space-3">
              <h2 className="text-body font-bold text-primary tracking-tight">Filters</h2>
              <button
                onClick={handleResetFilters}
                className="text-label-small font-semibold text-accent hover:underline flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Reset
              </button>
            </div>

            {/* Brands Filter */}
            <div className="flex flex-col gap-space-2">
              <span className="text-label-small font-bold text-foreground/50 uppercase tracking-wider">Brand</span>
              <div className="flex flex-col gap-2">
                {MOCK_BRANDS.map((b) => (
                  <label key={b.id} className="flex items-center gap-2 text-caption text-foreground/80 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="accent-primary rounded h-4 w-4"
                      checked={selectedBrand.toLowerCase() === b.name.toLowerCase()}
                      onChange={() => {
                        setSelectedBrand(selectedBrand.toLowerCase() === b.name.toLowerCase() ? "" : b.name);
                        setPage(1);
                      }}
                    />
                    <span>{b.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Categories Filter */}
            <div className="flex flex-col gap-space-2">
              <span className="text-label-small font-bold text-foreground/50 uppercase tracking-wider">Category</span>
              <div className="flex flex-col gap-2">
                {categoriesList.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 text-caption text-foreground/80 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="accent-primary rounded h-4 w-4"
                      checked={selectedCategory.toLowerCase() === cat.toLowerCase()}
                      onChange={() => {
                        setSelectedCategory(selectedCategory.toLowerCase() === cat.toLowerCase() ? "" : cat);
                        setPage(1);
                      }}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Showrooms Filter */}
            <div className="flex flex-col gap-space-2">
              <span className="text-label-small font-bold text-foreground/50 uppercase tracking-wider">Showroom</span>
              <div className="flex flex-col gap-2">
                {MOCK_SHOWROOMS.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-caption text-foreground/80 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="accent-primary rounded h-4 w-4"
                      checked={selectedShowroom.toLowerCase() === s.name.toLowerCase()}
                      onChange={() => {
                        setSelectedShowroom(selectedShowroom.toLowerCase() === s.name.toLowerCase() ? "" : s.name);
                        setPage(1);
                      }}
                    />
                    <span>
                      {s.name.includes("Kick Sports")
                        ? "Kick Sports"
                        : s.name.includes("Store")
                        ? "Store"
                        : s.name.includes("Mall")
                        ? "Mall"
                        : s.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid Panel */}
          <div className="md:col-span-3 flex flex-col gap-space-8">
            {loading ? (
              // Shimmer Loading States (PRD Section 35)
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-card p-space-6 flex flex-col gap-4 animate-pulse">
                    <div className="h-48 w-full bg-secondary rounded-card" />
                    <div className="h-4 w-1/3 bg-secondary rounded" />
                    <div className="h-6 w-3/4 bg-secondary rounded" />
                    <div className="h-4 w-1/2 bg-secondary rounded" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-6">
                  {products.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/products/${prod.slug}`}
                      className="bg-card border border-border rounded-card overflow-hidden shadow-soft-sm hover:shadow-soft-md hover:translate-y-[-1px] transition-all group flex flex-col justify-between"
                    >
                      <div className="relative h-56 w-full bg-slate-100 flex items-center justify-center text-slate-400 select-none overflow-hidden">
                        {prod.coverImage || prod.image ? (
                          <img src={prod.coverImage || prod.image} alt={prod.name} className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-500" />
                        ) : (
                          <span className="text-caption font-medium uppercase tracking-widest text-foreground/30">{prod.brand} Image</span>
                        )}
                        {prod.discount > 0 && (
                          <span className="absolute top-4 left-4 bg-accent text-accent-foreground font-bold text-label-small px-3 py-1 rounded-full">
                            {prod.discount}% OFF
                          </span>
                        )}
                        {prod.hotSelling && (
                          <span className="absolute top-4 right-4 bg-primary text-primary-foreground font-bold text-label-small px-3 py-1 rounded-full uppercase">
                            {prod.hotSellingBadge || "TRENDING"}
                          </span>
                        )}
                      </div>

                      <div className="p-space-6 flex flex-col gap-space-3">
                        <div className="flex items-center justify-between text-label-small text-foreground/50 font-medium">
                          <span>{prod.category}</span>
                          <span>{prod.brand}</span>
                        </div>
                        <div>
                          <h3 className="text-body-large font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {prod.name}
                          </h3>
                          <span className="text-label-small text-foreground/40 font-mono">Art: {prod.articleNumber}</span>
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
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            {prod.showroom.split(" ").slice(1).join(" ")}
                          </span>
                          <span className="text-success font-bold uppercase">
                            In Stock
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-space-4">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="p-space-2 border border-border rounded-button hover:bg-secondary disabled:opacity-disabled transition-colors"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-caption font-medium text-foreground/70 px-space-3">
                      Page {page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                      disabled={page === pagination.totalPages}
                      className="p-space-2 border border-border rounded-button hover:bg-secondary disabled:opacity-disabled transition-colors"
                      aria-label="Next Page"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              // Empty State (PRD Section 34)
              <div className="bg-card border border-border p-space-12 rounded-card text-center flex flex-col items-center justify-center gap-space-3">
                <span className="text-section-title font-bold text-primary">No Products Found</span>
                <p className="text-caption text-foreground/50 max-w-xs leading-relaxed">
                  We couldn&apos;t find a matching product. Try checking your spelling or clear search filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-primary text-primary-foreground font-semibold px-space-6 py-space-2.5 rounded-button text-caption hover:bg-accent hover:text-accent-foreground transition-all mt-4"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </PageContainer>

      {/* Mobile Filters Overlay Dialog */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-modal bg-black/50 md:hidden flex justify-end">
          <div className="bg-card w-80 h-full flex flex-col p-space-6 shadow-soft-lg animate-fade-in relative z-20 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-space-3 mb-space-4">
              <h2 className="text-body-large font-bold text-primary">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} className="p-1">
                <X className="h-5 w-5 text-foreground/60" />
              </button>
            </div>

            <div className="flex flex-col gap-space-6 flex-grow">
              {/* Brands Filter */}
              <div className="flex flex-col gap-space-2">
                <span className="text-label-small font-bold text-foreground/50 uppercase tracking-wider">Brand</span>
                <div className="flex flex-col gap-2">
                  {MOCK_BRANDS.map((b) => (
                    <label key={b.id} className="flex items-center gap-2 text-caption text-foreground/80 cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-primary rounded h-4 w-4"
                        checked={selectedBrand.toLowerCase() === b.name.toLowerCase()}
                        onChange={() => {
                          setSelectedBrand(selectedBrand.toLowerCase() === b.name.toLowerCase() ? "" : b.name);
                          setPage(1);
                        }}
                      />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories Filter */}
              <div className="flex flex-col gap-space-2">
                <span className="text-label-small font-bold text-foreground/50 uppercase tracking-wider">Category</span>
                <div className="flex flex-col gap-2">
                  {categoriesList.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 text-caption text-foreground/80 cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-primary rounded h-4 w-4"
                        checked={selectedCategory.toLowerCase() === cat.toLowerCase()}
                        onChange={() => {
                          setSelectedCategory(selectedCategory.toLowerCase() === cat.toLowerCase() ? "" : cat);
                          setPage(1);
                        }}
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Showrooms Filter */}
              <div className="flex flex-col gap-space-2">
                <span className="text-label-small font-bold text-foreground/50 uppercase tracking-wider">Showroom</span>
                <div className="flex flex-col gap-2">
                  {MOCK_SHOWROOMS.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-caption text-foreground/80 cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-primary rounded h-4 w-4"
                        checked={selectedShowroom.toLowerCase() === s.name.toLowerCase()}
                        onChange={() => {
                          setSelectedShowroom(selectedShowroom.toLowerCase() === s.name.toLowerCase() ? "" : s.name);
                          setPage(1);
                        }}
                      />
                      <span>
                        {s.name.includes("Kick Sports")
                          ? "Kick Sports"
                          : s.name.includes("Store")
                          ? "Store"
                          : s.name.includes("Mall")
                          ? "Mall"
                          : s.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-space-4 mt-space-6 flex gap-space-2">
              <button
                onClick={() => {
                  handleResetFilters();
                  setShowMobileFilters(false);
                }}
                className="flex-1 border border-border font-semibold py-2 rounded-button text-caption text-foreground"
              >
                Reset
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 bg-primary text-primary-foreground font-semibold py-2 rounded-button text-caption hover:bg-accent hover:text-accent-foreground"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground/60">
        Loading Catalogue...
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
