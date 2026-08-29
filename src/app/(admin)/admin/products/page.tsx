"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, X, Upload } from "lucide-react";

interface ProductMock {
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
  image?: string;
  hotSelling: boolean;
  hotSellingBadge?: string;
  newArrival: boolean;
  available: boolean;
}

interface DbBrand { id: string; name: string; }
interface DbShowroom { id: string; name: string; }
interface DbCategory { id: string; name: string; }

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductMock[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbBrands, setDbBrands] = useState<DbBrand[]>([]);
  const [dbShowrooms, setDbShowrooms] = useState<DbShowroom[]>([]);
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchProducts();
    });
    // Fetch brands, showrooms, and categories from DB for dropdowns
    fetch("/api/brands").then((r) => r.json()).then((d) => setDbBrands(d.brands || [])).catch(() => {});
    fetch("/api/showrooms").then((r) => r.json()).then((d) => setDbShowrooms(d.showrooms || [])).catch(() => {});
    // Categories come from distinct productCategory values in existing products
    fetch("/api/products/filter-options").then((r) => r.json()).then((d) => {
      setDbCategories((d.productCategories || []).map((name: string, i: number) => ({ id: String(i), name })));
    }).catch(() => {});
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<ProductMock> | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    id: "",
    articleNumber: "",
    name: "",
    slug: "",
    brand: "",
    category: "",
    showroom: "",
    mrp: 0,
    discount: 0,
    hotSelling: false,
    hotSellingBadge: "TRENDING" as "TRENDING" | "BEST_SELLER" | "SELLING_FAST",
    newArrival: true,
    available: true,
  });

  const [formImages, setFormImages] = useState<{ filename: string; url: string; color?: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setFormImages((prev) => [
            ...prev,
            {
              filename: file.name,
              url: reader.result as string,
              color: "Default",
            },
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setFormImages((prev) => [
            ...prev,
            {
              filename: file.name,
              url: reader.result as string,
              color: "Default",
            },
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const updated = [...formImages];
    if (direction === "up" && index > 0) {
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
    } else if (direction === "down" && index < updated.length - 1) {
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
    }
    setFormImages(updated);
  };

  const deleteImage = (index: number) => {
    setFormImages(formImages.filter((_, i) => i !== index));
  };

  const updateImageColor = (index: number, color: string) => {
    const updated = [...formImages];
    updated[index] = { ...updated[index], color };
    setFormImages(updated);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.articleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (p: ProductMock) => {
    setEditingProduct(p);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const casted = p as any;
    setFormImages(casted.images || (p.image ? [{ filename: "cover.jpg", url: p.image }] : []));
    setFormData({
      id: p.id,
      articleNumber: p.articleNumber,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      category: p.category,
      showroom: p.showroom,
      mrp: p.mrp,
      discount: p.discount,
      hotSelling: p.hotSelling,
      hotSellingBadge: (p.hotSellingBadge || "TRENDING") as "TRENDING" | "BEST_SELLER" | "SELLING_FAST",
      newArrival: p.newArrival,
      available: p.available,
    });
    setIsEditing(true);
  };

  const handleAddNewClick = () => {
    setEditingProduct(null);
    setFormImages([]);
    setFormData({
      id: `prod-${Date.now()}`,
      articleNumber: "",
      name: "",
      slug: "",
      brand: dbBrands[0]?.name || "",
      category: dbCategories[0]?.name || "",
      showroom: dbShowrooms[0]?.name || "",
      mrp: 0,
      discount: 0,
      hotSelling: false,
      hotSellingBadge: "TRENDING",
      newArrival: true,
      available: true,
    });
    setIsEditing(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const res = await fetch(`/api/products?id=${id}`, {
          method: "DELETE"
        });
        if (res.ok) {
          fetchProducts();
        } else {
          setProducts(products.filter((p) => p.id !== id));
        }
      } catch (err) {
        console.error("Delete error:", err);
        setProducts(products.filter((p) => p.id !== id));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPrice = Math.round(formData.mrp * (1 - formData.discount / 100));
    const slug = formData.name.toLowerCase().replace(/\s+/g, "-");

    const payload = {
      id: formData.id,
      articleNumber: formData.articleNumber,
      name: formData.name,
      slug,
      brand: formData.brand,
      category: formData.category,
      showroom: formData.showroom,
      mrp: formData.mrp,
      discount: formData.discount,
      finalPrice,
      image: formImages[0]?.url || editingProduct?.image || "/mock-pegasus.jpg",
      coverImage: formImages[0]?.url || editingProduct?.image || "/mock-pegasus.jpg",
      images: formImages,
      imageCount: formImages.length,
      available: formData.available,
      hotSelling: formData.hotSelling,
      hotSellingBadge: formData.hotSelling ? formData.hotSellingBadge : undefined,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchProducts();
      }
    } catch (err) {
      console.error("Failed to save product:", err);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-space-8 w-full max-w-6xl">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-border pb-space-4">
        <div>
          <h1 className="text-page-title font-bold text-primary tracking-tight">Products Catalog CRUD</h1>
          <p className="text-caption text-foreground/50">
            Create, update, and manage shoes and apparel items.
          </p>
        </div>
        <button
          onClick={handleAddNewClick}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-space-6 py-space-3 rounded-button text-caption hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer shadow-soft-sm"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Control row */}
      <div className="w-full max-w-md bg-card border border-border p-2.5 rounded-input shadow-soft-sm flex items-center gap-space-3">
        <Search className="h-5 w-5 text-foreground/30 shrink-0 ml-1" />
        <input
          type="text"
          placeholder="Search by name, code, brand..."
          className="w-full outline-none text-caption bg-transparent placeholder:text-foreground/30 text-foreground"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Products Data Table */}
      <div className="overflow-x-auto w-full border border-border rounded-card bg-card shadow-soft-sm">
        <table className="w-full border-collapse text-left text-caption">
          <thead>
            <tr className="bg-secondary text-foreground border-b border-border text-label-small font-bold uppercase tracking-wider">
              <th className="p-space-4">Product Code / Name</th>
              <th className="p-space-4">Brand</th>
              <th className="p-space-4">Category</th>
              <th className="p-space-4">Showroom</th>
              <th className="p-space-4">Price</th>
              <th className="p-space-4">Discount</th>
              <th className="p-space-4">Status</th>
              <th className="p-space-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground/80">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-space-8 text-center text-foreground/50">
                  Loading catalog items...
                </td>
              </tr>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((p) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const casted = p as any;
                const imagesCount = casted.imagesCount || (casted.images ? casted.images.length : 1);
                return (
                  <tr key={p.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="p-space-4 flex items-center gap-space-3">
                      <div className="h-10 w-10 bg-slate-100 border border-border rounded-button overflow-hidden flex items-center justify-center text-slate-400 select-none shrink-0">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt={p.name} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-[8px] uppercase font-bold text-center leading-tight">No Cover</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-foreground leading-tight">{p.name}</span>
                        <span className="font-mono text-[11px] text-foreground/45 flex items-center gap-2">
                          {p.articleNumber}
                          <span className="bg-secondary text-foreground/60 text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase shrink-0">
                            {imagesCount} images
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="p-space-4 font-semibold text-primary">{p.brand}</td>
                    <td className="p-space-4">{p.category}</td>
                    <td className="p-space-4">{p.showroom.split(" ").slice(1).join(" ")}</td>
                    <td className="p-space-4 font-semibold">₹{p.finalPrice}</td>
                    <td className="p-space-4">
                      {p.discount > 0 ? (
                        <span className="text-accent font-bold">{p.discount}% OFF</span>
                      ) : (
                        <span className="text-foreground/30">—</span>
                      )}
                    </td>
                    <td className="p-space-4">
                      {p.available ? (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          In Stock
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          OOS
                        </span>
                      )}
                    </td>
                    <td className="p-space-4 text-right">
                      <div className="flex justify-end gap-space-2">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-2 border border-border rounded-button text-foreground/60 hover:bg-secondary hover:text-primary transition-colors cursor-pointer"
                          aria-label="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(p.id)}
                          className="p-2 border border-border rounded-button text-foreground/60 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="p-space-8 text-center text-foreground/50">
                  No products matched the search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Editor Modal Overlay */}
      {isEditing && (
        <div className="fixed inset-0 z-modal bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl border border-border p-8 rounded-card shadow-soft-lg flex flex-col gap-6 max-h-[90vh] overflow-y-auto relative animate-fade-in">
            <button onClick={() => setIsEditing(false)} className="absolute top-6 right-6 p-1 text-foreground/50 hover:text-foreground">
              <X className="h-6 w-6" />
            </button>

            <div>
              <h2 className="text-section-title font-bold text-primary tracking-tight">
                {editingProduct ? "Edit Product Specs" : "Add Catalog Product"}
              </h2>
              <p className="text-caption text-foreground/50 mt-0.5">
                Complete the fields below to sync changes to the catalog.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-space-4">
              {/* Product Name */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-label-small font-bold text-foreground/60 uppercase">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nike Air Zoom Pegasus 40"
                  className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Code */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label-small font-bold text-foreground/60 uppercase">Article Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NK-PEG-40"
                  className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption font-mono"
                  value={formData.articleNumber}
                  onChange={(e) => setFormData({ ...formData, articleNumber: e.target.value })}
                />
              </div>

              {/* Showroom — options from DB */}
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

              {/* Brand — options from DB */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label-small font-bold text-foreground/60 uppercase">Brand</label>
                <select
                  className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                >
                  {dbBrands.length === 0 ? (
                    <option value="">Loading brands...</option>
                  ) : (
                    dbBrands.map((b) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Category — options from distinct productCategory values in DB */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label-small font-bold text-foreground/60 uppercase">Category</label>
                <select
                  className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {dbCategories.length === 0 ? (
                    <option value="">No categories in DB yet</option>
                  ) : (
                    dbCategories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))
                  )}
                </select>
              </div>

              {/* MRP */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label-small font-bold text-foreground/60 uppercase">MRP (Price in ₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption font-mono"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: parseInt(e.target.value, 10) || 0 })}
                />
              </div>

              {/* Discount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label-small font-bold text-foreground/60 uppercase">Discount Percentage (%)</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={99}
                  className="bg-secondary/30 border border-border rounded-input px-4 py-2.5 outline-none focus:border-primary text-caption font-mono"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value, 10) || 0 })}
                />
              </div>

              {/* Flags */}
              <div className="flex flex-col gap-3 md:col-span-2 border-t border-border pt-4 mt-2">
                <label className="flex items-center gap-2.5 text-caption cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-primary h-4 w-4"
                    checked={formData.hotSelling}
                    onChange={(e) => setFormData({ ...formData, hotSelling: e.target.checked })}
                  />
                  <span>Mark as &quot;Hot Selling&quot; Product</span>
                </label>

                {formData.hotSelling && (
                  <div className="flex flex-col gap-1.5 ml-6">
                    <label className="text-label-small font-bold text-foreground/60 uppercase">Hot Selling Badge Text</label>
                    <select
                      className="bg-secondary/30 border border-border rounded-input px-4 py-2 outline-none focus:border-primary text-caption max-w-xs"
                      value={formData.hotSellingBadge}
                      onChange={(e) => setFormData({ ...formData, hotSellingBadge: e.target.value as "TRENDING" | "BEST_SELLER" | "SELLING_FAST" })}
                    >
                      <option value="TRENDING">TRENDING</option>
                      <option value="BEST_SELLER">BEST SELLER</option>
                      <option value="SELLING_FAST">SELLING FAST</option>
                    </select>
                  </div>
                )}

                <label className="flex items-center gap-2.5 text-caption cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-primary h-4 w-4"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  />
                  <span>Showroom Inventory Availability Status (In Stock)</span>
                </label>
              </div>

              {/* Dynamic Images & Colorways Gallery (Request Enhancements) */}
              <div className="flex flex-col gap-space-3 md:col-span-2 border-t border-border pt-6 mt-2">
                <h3 className="text-body font-bold text-primary">Product Gallery & Colorways</h3>
                
                {/* Drag & Drop Upload Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed border-border rounded-input p-6 text-center bg-secondary/15 relative flex flex-col items-center justify-center gap-2 transition-all ${
                    dragActive ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageUpload}
                  />
                  <Upload className="h-8 w-8 text-foreground/30" />
                  <span className="text-caption text-foreground/60">
                    Drag images here or click to upload
                  </span>
                  <span className="text-[10px] text-foreground/45 font-mono">PNG, JPG formats supported</span>
                </div>

                {/* Thumbnails list with reorder and color dropdowns */}
                {formImages.length > 0 && (
                  <div className="flex flex-col gap-3 mt-2">
                    <span className="text-label-small font-bold text-foreground/50 uppercase tracking-wider">
                      Uploaded Images ({formImages.length}) — First image is Default Cover
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formImages.map((img, idx) => (
                        <div key={idx} className="border border-border p-3 rounded-card bg-secondary/10 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-12 w-12 rounded border border-border overflow-hidden shrink-0">
                              <img src={img.url} alt="preview" className="object-cover w-full h-full" />
                            </div>
                            <div className="flex flex-col gap-1 min-w-0">
                              <span className="text-[10px] text-foreground font-bold truncate block">{img.filename}</span>
                              <select
                                className="text-[10px] border border-border rounded px-1.5 py-0.5 outline-none bg-card"
                                value={img.color || "Default"}
                                onChange={(e) => updateImageColor(idx, e.target.value)}
                              >
                                <option value="Default">No Colorway (Default)</option>
                                <option value="White">White</option>
                                <option value="Black">Black</option>
                                <option value="Blue">Blue</option>
                                <option value="Red">Red</option>
                                <option value="Grey">Grey</option>
                                <option value="Green">Green</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveImage(idx, "up")}
                              className="p-1 border border-border rounded bg-card text-foreground/60 hover:bg-secondary disabled:opacity-disabled"
                              title="Move Up"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              disabled={idx === formImages.length - 1}
                              onClick={() => moveImage(idx, "down")}
                              className="p-1 border border-border rounded bg-card text-foreground/60 hover:bg-secondary disabled:opacity-disabled"
                              title="Move Down"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteImage(idx)}
                              className="p-1 border border-border rounded bg-red-50 text-red-600 hover:bg-red-100"
                              title="Remove"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-2 border-t border-border pt-6 mt-4 flex justify-end gap-space-3">
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
