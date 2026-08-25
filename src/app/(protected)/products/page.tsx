"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, formatNaira } from "@/lib/api";
import { Product } from "@/types";
import toast from "react-hot-toast";
import { X, Plus } from "lucide-react";

const CATEGORIES = ["tops", "shirts", "caps", "wears"] as const;
const SIZES_DEFAULT = ["XS", "S", "M", "L", "XL", "XXL"];
const inputCls =
  "w-full bg-transparent border border-ftm-line px-4 py-2.5 text-[12px] text-ftm-white placeholder:text-ftm-dim focus:border-ftm-offwhite outline-none transition-colors";
const selectCls =
  "w-full bg-ftm-black border border-ftm-line px-4 py-2.5 text-[12px] text-ftm-white focus:border-ftm-offwhite outline-none transition-colors appearance-none";

const empty = (): Partial<Product> => ({
  name: "",
  slug: "",
  description: "",
  price: 0,
  category: "shirts",
  sizes: [],
  colors: [],
  images: [],
  customizable: false,
  stock: 0,
  featured: false,
});

function parseList(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [form, setForm] = useState<Partial<Product>>(empty());
  const [sizesStr, setSizesStr] = useState("");
  const [colorsStr, setColorsStr] = useState("");
  const [imagesStr, setImagesStr] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get<Product[]>("/products")
      .then((r) => setProducts(r.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd = () => {
    setForm(empty());
    setSizesStr("");
    setColorsStr("");
    setImagesStr("");
    setModal("add");
  };
  const openEdit = (p: Product) => {
    setForm({ ...p });
    setSizesStr((p.sizes || []).join(", "));
    setColorsStr((p.colors || []).join(", "));
    setImagesStr((p.images || []).join(", "));
    setModal("edit");
  };
  const closeModal = () => {
    setModal(null);
    setForm(empty());
    setSizesStr("");
    setColorsStr("");
    setImagesStr("");
  };

  const handleSave = async () => {
    if (!form.name || !form.slug || !form.price) {
      toast.error("Name, slug and price are required.");
      return;
    }
    const sizes = parseList(sizesStr);
    const colors = parseList(colorsStr);
    const imagesFromUrls = parseList(imagesStr);
    const mergedImages = Array.from(
      new Set([...(form.images || []), ...imagesFromUrls]),
    );
    const payload = { ...form, sizes, colors, images: mergedImages };
    setSaving(true);
    try {
      if (modal === "add") {
        const r = await api.post<Product>("/products", payload);
        setProducts((p) => [r.data, ...p]);
        toast.success("Product added");
      } else {
        const r = await api.put<Product>(`/products/${form.id}`, payload);
        setProducts((p) => p.map((x) => (x.id === form.id ? r.data : x)));
        toast.success("Product updated");
      }
      closeModal();
    } catch {
      toast.error("Failed to save — check backend connection");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await api.post<{ urls: string[] }>("/products/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.urls?.length) {
        setForm((prev) => ({
          ...prev,
          images: [...(prev.images || []), ...res.data.urls],
        }));
        toast.success(`Uploaded ${res.data.urls.length} image(s)`);
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== idx),
    }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((p) => p.filter((x) => x.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const autoSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const thCls =
    "text-left px-5 py-3 text-[8px] uppercase tracking-[0.25em] text-ftm-muted font-normal border-b border-ftm-line";
  const tdCls = "px-5 py-4 text-[12px]";

  return (
    <div>
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[9px] uppercase tracking-[0.35em] text-ftm-muted mb-2">
            Manage
          </p>
          <h1 className="font-display font-light text-[clamp(26px,3.5vw,44px)]">
            Products
          </h1>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-3 bg-ftm-white text-ftm-black text-[10px] uppercase tracking-[0.18em] hover:bg-ftm-offwhite transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="border border-ftm-line p-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 ftm-skeleton my-1" />
          ))}
        </div>
      ) : (
        <div className="border border-ftm-line overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ftm-deep">
              <tr>
                <th className={thCls}>Name</th>
                <th className={thCls}>Category</th>
                <th className={thCls}>Price</th>
                <th className={thCls}>Stock</th>
                <th className={thCls}>Featured</th>
                <th className={thCls}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-ftm-muted text-[12px]"
                  >
                    No products yet. Add one above.
                  </td>
                </tr>
              )}
              {products.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-t border-ftm-line ${i % 2 === 0 ? "bg-ftm-black" : "bg-ftm-deep"}`}
                >
                  <td className={`${tdCls} text-ftm-white`}>{p.name}</td>
                  <td className={`${tdCls} text-ftm-muted capitalize`}>
                    {p.category}
                  </td>
                  <td className={`${tdCls} font-display text-[14px]`}>
                    {formatNaira(p.price)}
                  </td>
                  <td className={`${tdCls} text-ftm-muted`}>{p.stock}</td>
                  <td className={`${tdCls} text-ftm-muted`}>
                    {p.featured ? "Yes" : "—"}
                  </td>
                  <td className={tdCls}>
                    <button
                      onClick={() => openEdit(p)}
                      className="text-ftm-muted hover:text-ftm-white transition-colors mr-5 text-[10px] uppercase tracking-wider"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-ftm-muted hover:text-red-400 transition-colors text-[10px] uppercase tracking-wider"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-ftm-deep border border-ftm-line w-full max-w-xl max-h-[90vh] overflow-y-auto p-8">
                <div className="flex items-center justify-between mb-7">
                  <h2 className="font-display font-light text-[22px]">
                    {modal === "add" ? "Add Product" : "Edit Product"}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-ftm-muted hover:text-ftm-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[8px] uppercase tracking-[0.25em] text-ftm-muted block mb-1.5">
                      Product Name *
                    </label>
                    <input
                      value={form.name || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                          slug: autoSlug(e.target.value),
                        })
                      }
                      className={inputCls}
                      placeholder="Focus Graphic Tee"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase tracking-[0.25em] text-ftm-muted block mb-1.5">
                      Slug *
                    </label>
                    <input
                      value={form.slug || ""}
                      onChange={(e) =>
                        setForm({ ...form, slug: e.target.value })
                      }
                      className={inputCls}
                      placeholder="focus-graphic-tee"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase tracking-[0.25em] text-ftm-muted block mb-1.5">
                      Category *
                    </label>
                    <select
                      value={form.category || "shirts"}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value as any })
                      }
                      className={selectCls}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} className="bg-ftm-black">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[8px] uppercase tracking-[0.25em] text-ftm-muted block mb-1.5">
                      Price (₦) *
                    </label>
                    <input
                      type="number"
                      value={form.price || ""}
                      onChange={(e) =>
                        setForm({ ...form, price: Number(e.target.value) })
                      }
                      className={inputCls}
                      placeholder="15000"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase tracking-[0.25em] text-ftm-muted block mb-1.5">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={form.stock || ""}
                      onChange={(e) =>
                        setForm({ ...form, stock: Number(e.target.value) })
                      }
                      className={inputCls}
                      placeholder="0"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[8px] uppercase tracking-[0.25em] text-ftm-muted block mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={form.description || ""}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={3}
                      className={`${inputCls} resize-none`}
                      placeholder="Product description..."
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase tracking-[0.25em] text-ftm-muted block mb-1.5">
                      Sizes (comma separated)
                    </label>
                    <input
                      value={sizesStr}
                      onChange={(e) => setSizesStr(e.target.value)}
                      className={inputCls}
                      placeholder="S, M, L, XL"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase tracking-[0.25em] text-ftm-muted block mb-1.5">
                      Colors (comma separated)
                    </label>
                    <input
                      value={colorsStr}
                      onChange={(e) => setColorsStr(e.target.value)}
                      className={inputCls}
                      placeholder="Black, White"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[8px] uppercase tracking-[0.25em] text-ftm-muted block mb-1.5">
                      Upload Images (multiple)
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                      <label
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 border border-ftm-line text-[10px] uppercase tracking-[0.2em] text-ftm-muted hover:text-ftm-white hover:border-ftm-offwhite cursor-pointer transition-colors ${uploadingImages ? "opacity-40 pointer-events-none" : ""}`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        {uploadingImages ? "Uploading..." : "Choose Files"}
                      </label>
                      <p className="text-[10px] text-ftm-dim">
                        Upload new images, or paste URLs below.
                      </p>
                    </div>
                    {(form.images?.length ?? 0) > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                        {form.images!.map((src, i) => (
                          <div
                            key={i}
                            className="relative aspect-square border border-ftm-line bg-ftm-black overflow-hidden group"
                          >
                            <img
                              src={src}
                              alt={`image-${i}`}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              className="absolute top-1 right-1 bg-ftm-black/80 text-red-400 rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm hover:bg-red-900/60"
                              aria-label="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label className="text-[8px] uppercase tracking-[0.25em] text-ftm-muted block mb-1.5">
                      Or paste Image URLs (comma separated)
                    </label>
                    <input
                      value={imagesStr}
                      onChange={(e) => setImagesStr(e.target.value)}
                      className={inputCls}
                      placeholder="https://img1.com, https://img2.com"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-[10px] text-ftm-muted cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!form.customizable}
                        onChange={(e) =>
                          setForm({ ...form, customizable: e.target.checked })
                        }
                        className="accent-ftm-white"
                      />
                      Customizable
                    </label>
                    <label className="flex items-center gap-2 text-[10px] text-ftm-muted cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!form.featured}
                        onChange={(e) =>
                          setForm({ ...form, featured: e.target.checked })
                        }
                        className="accent-ftm-white"
                      />
                      Featured on homepage
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="mt-8 w-full py-4 bg-ftm-white text-ftm-black text-[10px] uppercase tracking-[0.22em] hover:bg-ftm-offwhite transition-colors disabled:opacity-40"
                >
                  {saving
                    ? "Saving..."
                    : modal === "add"
                      ? "Add Product"
                      : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
