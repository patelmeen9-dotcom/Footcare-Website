"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Calendar, MapPin } from "lucide-react";

interface PromotionMock {
  id: string;
  name: string;
  type: "SHOWROOM" | "BRAND" | "GLOBAL";
  discount: string;
  scope: string;
  showroom: string;
  description: string;
  duration: string;
  active: boolean;
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<PromotionMock[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbShowrooms, setDbShowrooms] = useState<{ id: string; name: string }[]>([]);

  // Fetch promotions on mount
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await fetch("/api/promotions");
        if (res.ok) {
          const data = await res.json();
          setPromotions(data.promotions || []);
        }
      } catch (err) {
        console.error("Failed to fetch promotions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
    // Fetch showrooms from DB for the dropdown
    fetch("/api/showrooms").then((r) => r.json()).then((d) => setDbShowrooms(d.showrooms || [])).catch(() => {});
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionMock | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    type: "SHOWROOM" as "SHOWROOM" | "BRAND" | "GLOBAL",
    discount: "",
    scope: "",
    showroom: "Footcare Kick Sports",
    description: "",
    duration: "",
    active: true,
  });

  const handleEditClick = (p: PromotionMock) => {
    setEditingPromotion(p);
    setFormData({ ...p });
    setIsEditing(true);
  };

  const handleAddNewClick = () => {
    setEditingPromotion(null);
    setFormData({
      id: "",
      name: "",
      type: "SHOWROOM",
      discount: "",
      scope: "",
      showroom: "Footcare Kick Sports",
      description: "",
      duration: "",
      active: true,
    });
    setIsEditing(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("Are you sure you want to delete this promotion?")) {
      try {
        const res = await fetch(`/api/promotions?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          setPromotions(promotions.filter((p) => p.id !== id));
        }
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    const p = promotions.find(p => p.id === id);
    if (!p) return;
    
    try {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...p, active: !p.active }),
      });
      if (res.ok) {
        setPromotions(promotions.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
      }
    } catch (err) {
      console.error("Failed to toggle", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        const data = await res.json();
        
        if (editingPromotion) {
          setPromotions(promotions.map((p) => (p.id === formData.id ? { ...formData } : p)));
        } else {
          setPromotions([{ ...formData, id: data.id || formData.id }, ...promotions]);
        }
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to save", err);
    }
  };

  return (
    <div className="flex flex-col gap-space-8 w-full max-w-6xl">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-border pb-space-4">
        <div>
          <h1 className="text-page-title font-bold text-primary tracking-tight">Promotions & Banners</h1>
          <p className="text-caption text-foreground/50">
            Schedule store discounts, brand campaigns, and active banner announcements.
          </p>
        </div>
        <button
          onClick={handleAddNewClick}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-space-6 py-space-3 rounded-button text-caption hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer shadow-soft-sm"
        >
          <Plus className="h-4 w-4" />
          Schedule Promo
        </button>
      </div>

      {/* Promotions List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-6">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className={`bg-card border rounded-card p-space-6 shadow-soft-sm flex flex-col justify-between hover:shadow-soft-md transition-all ${
              promo.active ? "border-border" : "border-border/40 opacity-60"
            }`}
          >
            <div className="flex flex-col gap-space-2">
              <div className="flex items-center justify-between">
                <span className="bg-accent/15 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {promo.type}
                </span>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={promo.active}
                    onChange={() => handleToggleActive(promo.id)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:height-4 after:width-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div>
                <h3 className="text-body font-bold text-foreground">{promo.name}</h3>
                <span className="text-label-small text-primary font-bold">{promo.discount} • {promo.scope}</span>
              </div>

              <p className="text-caption text-foreground/75 leading-relaxed mt-2">{promo.description}</p>
            </div>

            <div className="pt-space-4 border-t border-border mt-space-4 flex items-center justify-between">
              <div className="flex flex-col gap-0.5 text-label-small text-foreground/50">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-primary" />
                  {promo.showroom}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-primary" />
                  {promo.duration}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(promo)}
                  className="p-2 border border-border rounded-button text-foreground/60 hover:bg-secondary hover:text-primary transition-colors cursor-pointer"
                  aria-label="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(promo.id)}
                  className="p-2 border border-border rounded-button text-foreground/60 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Overlay Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-modal bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg border border-border p-8 rounded-card shadow-soft-lg flex flex-col gap-6 max-h-[90vh] overflow-y-auto relative animate-fade-in">
            <button onClick={() => setIsEditing(false)} className="absolute top-6 right-6 p-1 text-foreground/50 hover:text-foreground">
              <X className="h-6 w-6" />
            </button>

            <div>
              <h2 className="text-section-title font-bold text-primary tracking-tight">
                {editingPromotion ? "Edit Promotion Campaign" : "Schedule Store Promotion"}
              </h2>
              <p className="text-caption text-foreground/50 mt-0.5">
                Complete fields below to publish active promotional campaigns.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-space-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-small font-bold text-foreground/60 uppercase">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monsoon Sports Splash"
                  className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-space-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-small font-bold text-foreground/60 uppercase">Promo Type</label>
                  <select
                    className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as "SHOWROOM" | "BRAND" | "GLOBAL" })}
                  >
                    <option value="SHOWROOM">SHOWROOM EXCLUSIVE</option>
                    <option value="BRAND">BRAND EXCLUSIVE</option>
                    <option value="GLOBAL">GLOBAL CAMPAIGN</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-label-small font-bold text-foreground/60 uppercase">Showroom Assignment</label>
                  <select
                    className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption"
                    value={formData.showroom}
                    onChange={(e) => setFormData({ ...formData, showroom: e.target.value })}
                  >
                    {dbShowrooms.length === 0 ? (
                      <option value="">Loading showrooms...</option>
                    ) : (
                      dbShowrooms.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-small font-bold text-foreground/60 uppercase">Discount Rate (e.g. Flat 20% OFF)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 20% OFF"
                    className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-label-small font-bold text-foreground/60 uppercase">Target Scope (e.g. Nike Footwear)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nike Running"
                    className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption"
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-small font-bold text-foreground/60 uppercase">Validity Duration (e.g. Expires: July 31)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Expires: July 31, 2026"
                  className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-small font-bold text-foreground/60 uppercase">Description Details</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail campaign conditions..."
                  className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="border-t border-border pt-6 mt-4 flex justify-end gap-space-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="border border-border font-semibold px-space-6 py-2.5 rounded-button text-caption hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground font-semibold px-space-8 py-2.5 rounded-button text-caption hover:bg-accent hover:text-accent-foreground transition-all shadow-soft-sm cursor-pointer"
                >
                  Schedule Active Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
