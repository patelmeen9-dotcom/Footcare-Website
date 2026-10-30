"use client";

import { useEffect, useState } from "react";
import { Edit, Loader2, Upload, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

interface BrandRow {
  id: string;
  name: string;
  slug: string;
  logo: string;
  productCount: number;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BrandRow | null>(null);
  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadBrands = async () => {
    try {
      const res = await fetch("/api/brands");
      const data = await res.json();
      if (res.ok) {
        setBrands(data.brands || []);
      }
    } catch (err) {
      console.error("Failed to load brands:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBrands();
  }, []);

  const openEdit = (brand: BrandRow) => {
    setEditing(brand);
    setName(brand.name);
    setLogoFile(null);
    setLogoPreview(null);
    setError("");
  };

  const closeEdit = () => {
    setEditing(null);
    setLogoFile(null);
    setLogoPreview(null);
    setError("");
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (logoFile) formData.append("logo", logoFile);

      const res = await fetch(`/api/brands/${editing.id}`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not save brand.");
        return;
      }

      await loadBrands();
      closeEdit();
    } catch (err) {
      console.error("Brand save failed:", err);
      setError("Could not save brand.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-space-8 w-full max-w-6xl">
      <div className="flex items-center justify-between border-b border-border pb-space-4">
        <div>
          <h1 className="text-page-title font-bold text-primary tracking-tight">Brands</h1>
          <p className="text-caption text-foreground/50">
            Rename imported brands and upload a logo. Logos appear on the homepage, brands page, and product listings.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-card shadow-soft-sm overflow-hidden">
        <table className="w-full text-left text-caption">
          <thead className="bg-secondary/40 text-foreground/60 uppercase text-label-small">
            <tr>
              <th className="p-space-4">Brand</th>
              <th className="p-space-4">Products</th>
              <th className="p-space-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={3} className="p-space-8 text-center text-foreground/50">
                  Loading brands...
                </td>
              </tr>
            ) : brands.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-space-8 text-center text-foreground/50">
                  No brands yet. Import inventory to create them.
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-secondary/10">
                  <td className="p-space-4">
                    <div className="flex items-center gap-3">
                      <BrandLogo logo={brand.logo} name={brand.name} className="h-12 w-12 rounded-button border border-border" />
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{brand.name}</span>
                        <span className="font-mono text-[11px] text-foreground/40">{brand.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-space-4 text-foreground/70">{brand.productCount}</td>
                  <td className="p-space-4 text-right">
                    <button
                      onClick={() => openEdit(brand)}
                      className="inline-flex items-center gap-1.5 text-caption font-semibold text-primary hover:underline"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-modal bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg border border-border p-8 rounded-card shadow-soft-lg flex flex-col gap-6 relative">
            <button onClick={closeEdit} className="absolute top-6 right-6 p-1 text-foreground/50 hover:text-foreground">
              <X className="h-6 w-6" />
            </button>
            <div>
              <h2 className="text-section-title font-bold text-primary tracking-tight">Edit Brand</h2>
              <p className="text-caption text-foreground/50 mt-0.5">
                Changing the name updates every product linked to this brand. A later import using the old Excel name will create a new brand.
              </p>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-space-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-small font-bold text-foreground/60 uppercase">Brand Name</label>
                <input
                  type="text"
                  required
                  className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-small font-bold text-foreground/60 uppercase">Logo</label>
                <div className="flex items-center gap-4">
                  <BrandLogo
                    logo={logoPreview || editing.logo}
                    name={name || editing.name}
                    className="h-20 w-20 rounded-card border border-border"
                  />
                  <label className="flex items-center gap-2 border border-border bg-secondary/20 px-4 py-2.5 rounded-button text-caption font-semibold cursor-pointer hover:bg-secondary">
                    <Upload className="h-4 w-4" />
                    {logoFile ? logoFile.name : "Upload image"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </label>
                </div>
                <p className="text-[11px] text-foreground/40">PNG, JPG, WebP, or SVG. Any ratio is fine.</p>
              </div>

              {error && <p className="text-caption text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-button text-caption hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Brand
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
