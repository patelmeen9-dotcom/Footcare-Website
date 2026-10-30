"use client";

import { useEffect, useState } from "react";
import { Edit, Loader2, Plus, X } from "lucide-react";

interface ShowroomRow {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  mapsUrl: string;
  openingTime: string;
  closingTime: string;
  description: string;
  productCount: number;
  brands: string[];
  brandIds: string[];
}

interface BrandOption {
  id: string;
  name: string;
}

const emptyForm = {
  name: "",
  address: "",
  phone: "",
  email: "",
  mapsUrl: "",
  openingTime: "10:00 AM",
  closingTime: "09:00 PM",
  description: "",
  brandIds: [] as string[],
};

export default function AdminShowroomsPage() {
  const [showrooms, setShowrooms] = useState<ShowroomRow[]>([]);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ShowroomRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [showroomRes, brandRes] = await Promise.all([
        fetch("/api/showrooms"),
        fetch("/api/brands"),
      ]);
      const showroomData = await showroomRes.json();
      const brandData = await brandRes.json();
      if (showroomRes.ok) setShowrooms(showroomData.showrooms || []);
      if (brandRes.ok) setBrands(brandData.brands || []);
    } catch (err) {
      console.error("Failed to load showrooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setIsCreating(true);
    setEditing(null);
    setForm(emptyForm);
    setError("");
  };

  const openEdit = (showroom: ShowroomRow) => {
    setIsCreating(false);
    setEditing(showroom);
    setForm({
      name: showroom.name,
      address: showroom.address,
      phone: showroom.phone,
      email: showroom.email,
      mapsUrl: showroom.mapsUrl,
      openingTime: showroom.openingTime,
      closingTime: showroom.closingTime,
      description: showroom.description,
      brandIds: [...showroom.brandIds],
    });
    setError("");
  };

  const closeModal = () => {
    setEditing(null);
    setIsCreating(false);
    setError("");
  };

  const toggleBrand = (id: string) => {
    setForm((prev) => ({
      ...prev,
      brandIds: prev.brandIds.includes(id)
        ? prev.brandIds.filter((brandId) => brandId !== id)
        : [...prev.brandIds, id],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(isCreating ? "/api/showrooms" : `/api/showrooms/${editing?.id}`, {
        method: isCreating ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save showroom.");
        return;
      }
      await load();
      closeModal();
    } catch (err) {
      console.error("Showroom save failed:", err);
      setError("Could not save showroom.");
    } finally {
      setSaving(false);
    }
  };

  const modalOpen = isCreating || !!editing;

  return (
    <div className="flex flex-col gap-space-8 w-full max-w-6xl">
      <div className="flex items-center justify-between border-b border-border pb-space-4">
        <div>
          <h1 className="text-page-title font-bold text-primary tracking-tight">Showrooms</h1>
          <p className="text-caption text-foreground/50">
            Edit imported locations or add a showroom. Choose which brands each store carries for the public comparison table.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-space-6 py-space-3 rounded-button text-caption hover:bg-accent hover:text-accent-foreground"
        >
          <Plus className="h-4 w-4" />
          Add Showroom
        </button>
      </div>

      <div className="bg-card border border-border rounded-card shadow-soft-sm overflow-hidden">
        <table className="w-full text-left text-caption">
          <thead className="bg-secondary/40 text-foreground/60 uppercase text-label-small">
            <tr>
              <th className="p-space-4">Showroom</th>
              <th className="p-space-4">Phone</th>
              <th className="p-space-4">Brands</th>
              <th className="p-space-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-space-8 text-center text-foreground/50">
                  Loading showrooms...
                </td>
              </tr>
            ) : showrooms.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-space-8 text-center text-foreground/50">
                  No showrooms yet. Import inventory or add one manually.
                </td>
              </tr>
            ) : (
              showrooms.map((showroom) => (
                <tr key={showroom.id} className="hover:bg-secondary/10">
                  <td className="p-space-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-foreground">{showroom.name}</span>
                      <span className="text-[11px] text-foreground/50 max-w-xs">{showroom.address}</span>
                    </div>
                  </td>
                  <td className="p-space-4 text-foreground/70">{showroom.phone}</td>
                  <td className="p-space-4 text-foreground/70 max-w-xs">
                    {showroom.brands.length > 0 ? showroom.brands.join(", ") : "—"}
                  </td>
                  <td className="p-space-4 text-right">
                    <button
                      onClick={() => openEdit(showroom)}
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

      {modalOpen && (
        <div className="fixed inset-0 z-modal bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl border border-border p-8 rounded-card shadow-soft-lg flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeModal} className="absolute top-6 right-6 p-1 text-foreground/50 hover:text-foreground">
              <X className="h-6 w-6" />
            </button>
            <div>
              <h2 className="text-section-title font-bold text-primary tracking-tight">
                {isCreating ? "Add Showroom" : "Edit Showroom"}
              </h2>
              <p className="text-caption text-foreground/50 mt-0.5">
                These details appear on the homepage, showrooms page, contact page, and product pages.
              </p>
            </div>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-space-4">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-label-small font-bold text-foreground/60 uppercase">Showroom Name</label>
                <input
                  required
                  className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-label-small font-bold text-foreground/60 uppercase">Location / Address</label>
                <input
                  required
                  className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-label-small font-bold text-foreground/60 uppercase">Phone</label>
                <input
                  required
                  className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-label-small font-bold text-foreground/60 uppercase">Email</label>
                <input
                  className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-label-small font-bold text-foreground/60 uppercase">Google Maps URL</label>
                <input
                  className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption"
                  value={form.mapsUrl}
                  onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })}
                  placeholder="Leave blank to generate from the address"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-label-small font-bold text-foreground/60 uppercase">Opening Time</label>
                <input
                  className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption"
                  value={form.openingTime}
                  onChange={(e) => setForm({ ...form, openingTime: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-label-small font-bold text-foreground/60 uppercase">Closing Time</label>
                <input
                  className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption"
                  value={form.closingTime}
                  onChange={(e) => setForm({ ...form, closingTime: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-label-small font-bold text-foreground/60 uppercase">Description</label>
                <textarea
                  rows={3}
                  className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-label-small font-bold text-foreground/60 uppercase">Brands in this showroom</label>
                {brands.length === 0 ? (
                  <p className="text-caption text-foreground/40">No brands yet. Import inventory or add brand logos first.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-border rounded-card p-3 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                      <label key={brand.id} className="flex items-center gap-2 text-caption cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.brandIds.includes(brand.id)}
                          onChange={() => toggleBrand(brand.id)}
                        />
                        {brand.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {error && <p className="text-caption text-red-600 md:col-span-2">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="md:col-span-2 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-button text-caption hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Showroom
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
