"use client";

import { ShoppingBag, Percent, MapPin, Tag, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { MOCK_BRANDS, MOCK_SHOWROOMS, MOCK_PRODUCTS } from "@/constants/mock-data";

export default function AdminDashboardPage() {
  const kpis = [
    { name: "Total Catalog Items", value: MOCK_PRODUCTS.length, icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
    { name: "Active Promotions", value: 3, icon: Percent, color: "text-orange-600 bg-orange-50" },
    { name: "Showrooms Managed", value: MOCK_SHOWROOMS.length, icon: MapPin, color: "text-emerald-600 bg-emerald-50" },
    { name: "Registered Brands", value: MOCK_BRANDS.length, icon: Tag, color: "text-indigo-600 bg-indigo-50" },
  ];

  return (
    <div className="flex flex-col gap-space-8 w-full max-w-6xl">
      {/* Title block */}
      <div>
        <h1 className="text-page-title font-bold text-primary tracking-tight">Admin Dashboard</h1>
        <p className="text-caption text-foreground/50">
          Overview of catalogue stats, active promotions, and import history logs.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-card border border-border p-space-6 rounded-card shadow-soft-sm flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-label-small font-bold text-foreground/50 uppercase tracking-wider">{kpi.name}</span>
                <span className="text-[1.75rem] font-extrabold text-foreground leading-none mt-1">{kpi.value}</span>
              </div>
              <div className={`p-space-3 rounded-full shrink-0 ${kpi.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics chart and details mock layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-8 items-start">
        {/* Left Column: Brand counts (Linear bar list) */}
        <div className="lg:col-span-2 bg-card border border-border p-space-6 rounded-card shadow-soft-sm flex flex-col gap-space-6">
          <div>
            <h3 className="text-body-large font-bold text-foreground tracking-tight">Catalog Items by Brand</h3>
            <p className="text-label-small text-foreground/45">Distribution of shoes and apparel catalogued.</p>
          </div>

          <div className="flex flex-col gap-space-4">
            {MOCK_BRANDS.map((brand) => {
              const percentage = Math.round((brand.productCount / 500) * 100); // normalized bar
              return (
                <div key={brand.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-caption font-semibold">
                    <span className="text-foreground">{brand.name}</span>
                    <span className="text-foreground/60">{brand.productCount} Items ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Showroom counts and quick actions */}
        <div className="flex flex-col gap-space-6">
          {/* Showroom counts */}
          <div className="bg-card border border-border p-space-6 rounded-card shadow-soft-sm flex flex-col gap-space-4">
            <h3 className="text-body-large font-bold text-foreground tracking-tight">Products by Location</h3>
            <div className="flex flex-col gap-space-3 text-caption text-foreground/75">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#2F3C8F]" />
                  Kick Sports
                </span>
                <span className="font-bold">235 Items</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#4a5ce4]" />
                  Store
                </span>
                <span className="font-bold">142 Items</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-accent" />
                  Mall
                </span>
                <span className="font-bold">123 Items</span>
              </div>
            </div>
          </div>

          {/* Quick links block */}
          <div className="bg-card border border-border p-space-6 rounded-card shadow-soft-sm flex flex-col gap-space-3">
            <h3 className="text-body font-bold text-foreground">Quick Admin Operations</h3>
            <Link
              href="/admin/import"
              className="flex items-center justify-between text-caption font-semibold p-space-3 rounded-button border border-border hover:bg-secondary text-primary transition-colors"
            >
              Run Excel Inventory Import
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center justify-between text-caption font-semibold p-space-3 rounded-button border border-border hover:bg-secondary text-primary transition-colors"
            >
              Add/Edit Products manually
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
