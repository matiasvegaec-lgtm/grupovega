import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, FormEvent } from "react";
import { Plus, Pencil, Trash2, Loader2, X, Upload, Eye, EyeOff, Star, Crop, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageAdjuster } from "@/components/ImageAdjuster";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  stock: number;
  active: boolean;
  display_order: number;
  featured: boolean;
  subcategory_id: string | null;
  presentation: string | null;
  protein_content: string | null;
  price_card_3m: number | null;
};

type Category = { id: string; name: string };
type Subcategory = { id: string; name: string; category_id: string };

export const Route = createFileRoute("/admin/productos")({
  head: () => ({ meta: [{ title: "Admin · Productos — Grupo Vega" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminProductos,
});

const empty: Omit<Product, "id"> = {
  name: "", description: "", price: 0, category: "Alimentos",
  image_url: "", stock: 0, active: true, display_order: 0, featured: false, subcategory_id: null,
  presentation: "", protein_content: "", price_card_3m: null,
};

const PRESENTATION_UNITS = ["kg", "g"] as const;
type PresentationUnit = (typeof PRESENTATION_UNITS)[number];

const getPresentationParts = (presentation: string | null | undefined) => {
  const value = presentation?.trim() ?? "";
  const match = value.match(/^([\d.]+)\s*(kg|g)$/i);

  if (match) {
    return {
      amount: match[1],
      unit: match[2].toLowerCase() as PresentationUnit,
    };
  }

  return {
    amount: value.replace(/[^0-9.]/g, ""),
    unit: /(^|\s)g$/i.test(value) && !/kg/i.test(value) ? "g" as PresentationUnit : "kg" as PresentationUnit,
  };
};

const formatPresentation = (amount: string, unit: PresentationUnit) => (amount === "" ? "" : `${amount} ${unit}`);

function AdminProductos() {
  const [list, setList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [adjusterSrc, setAdjusterSrc] = useState<string | null>(null);
  const [searchName, setSearchName] = useState("");

  const load = async () => {
    setLoading(true);
    const [prodRes, catRes, subRes] = await Promise.all([
      supabase.from("products").select("*").order("display_order").order("created_at", { ascending: false }),
      supabase.from("categories").select("id,name").eq("active", true).order("display_order"),
      supabase.from("subcategories").select("id,name,category_id").eq("active", true).order("display_order"),
    ]);
    if (prodRes.error) toast.error(prodRes.error.message);
    else setList((prodRes.data ?? []) as Product[]);
    if (!catRes.error) setCategories((catRes.data ?? []) as Category[]);
    if (!subRes.error) setSubcategories((subRes.data ?? []) as Subcategory[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null); setForm(empty); setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description ?? "", price: Number(p.price), category: p.category, image_url: p.image_url ?? "", stock: p.stock, active: p.active, display_order: p.display_order, featured: p.featured, subcategory_id: p.subcategory_id ?? null, presentation: p.presentation ?? "", protein_content: p.protein_content ?? "", price_card_3m: p.price_card_3m ?? null });
    setShowForm(true);
  };

  const uploadBlob = async (blob: Blob, ext = "png") => {
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("product-images")
      .upload(path, blob, { contentType: blob.type || "image/png" });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const toastId = toast.loading("Procesando imagen con IA (fondo blanco + cuadrado)…");
    try {
      // 1. Convertir archivo a base64
      const base64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 2. Llamar edge function para limpiar el fondo y centrar
      let finalBlob: Blob;
      let finalExt = "png";
      try {
        const { data: aiData, error: aiErr } = await supabase.functions.invoke("process-product-image", {
          body: { imageBase64: base64, mimeType: file.type || "image/png" },
        });
        if (aiErr) throw aiErr;
        if (!aiData?.imageDataUrl) throw new Error("Sin respuesta de IA");

        const res = await fetch(aiData.imageDataUrl);
        finalBlob = await res.blob();
      } catch (aiErr: any) {
        // Fallback: si la IA falla, subimos el archivo original
        toast.warning("La IA falló, se subirá la imagen original.", { id: toastId });
        finalBlob = file;
        finalExt = file.name.split(".").pop() || "png";
      }

      // 3. Subir a storage
      const url = await uploadBlob(finalBlob, finalExt);
      setForm((f) => ({ ...f, image_url: url }));
      toast.success("Imagen lista", { id: toastId });
    } catch (e: any) {
      toast.error(e.message, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), display_order: Number(form.display_order), image_url: form.image_url || null, description: form.description || null, subcategory_id: form.subcategory_id || null, presentation: form.presentation || null, protein_content: form.protein_content || null, price_card_3m: form.price_card_3m === null || form.price_card_3m === undefined || (form.price_card_3m as any) === "" ? null : Number(form.price_card_3m) };
      if (editing) {
        const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Producto actualizado");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast.success("Producto creado");
      }
      setShowForm(false);
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`¿Eliminar "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) toast.error(error.message);
    else { toast.success("Eliminado"); await load(); }
  };

  const toggleActive = async (p: Product) => {
    const { error } = await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    if (error) toast.error(error.message);
    else await load();
  };

  const toggleFeatured = async (p: Product) => {
    const { error } = await supabase.from("products").update({ featured: !p.featured }).eq("id", p.id);
    if (error) toast.error(error.message);
    else { toast.success(p.featured ? "Quitado de destacados" : "Marcado como destacado"); await load(); }
  };

  const inputCls = "w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-ocean focus:outline-none text-sm";
  const presentationParts = getPresentationParts(form.presentation);
  const filteredList = useMemo(() => {
    const q = searchName.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(q));
  }, [list, searchName]);

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8">
      <div className="flex justify-between items-start md:items-center mb-6 gap-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-navy-deep">Productos</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Gestiona el catálogo de tu tienda.</p>
        </div>
        <button onClick={openNew} className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-full gradient-wave text-white font-semibold shadow-glow">
          <Plus className="w-4 h-4" /> Nuevo producto
        </button>
      </div>

      {/* FAB nuevo producto en mobile */}
      <button onClick={openNew} className="md:hidden fixed bottom-6 right-6 z-20 w-14 h-14 rounded-full gradient-wave text-white shadow-glow flex items-center justify-center" aria-label="Nuevo producto">
        <Plus className="w-6 h-6" />
      </button>

      {loading ? (
        <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-ocean" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl">
          <p className="text-muted-foreground mb-4">Aún no hay productos.</p>
          <button onClick={openNew} className="px-6 py-2.5 rounded-full gradient-wave text-white font-semibold">Crear el primero</button>
        </div>
      ) : (
        <>
        {/* Buscador */}
        <div className="mb-4 relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Buscar producto por nombre o categoría…"
            className="w-full pl-9 pr-9 py-2 rounded-lg bg-card border border-border text-sm focus:border-ocean focus:outline-none"
          />
          {searchName && (
            <button type="button" onClick={() => setSearchName("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-navy-deep" aria-label="Limpiar búsqueda">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile: cards */}
        <div className="md:hidden space-y-3">
          {filteredList.length === 0 ? (
            <div className="text-center py-10 bg-card rounded-2xl text-sm text-muted-foreground">Sin resultados para "{searchName}"</div>
          ) : filteredList.map((p) => (
            <div key={p.id} className="bg-card rounded-2xl shadow-card p-3 flex gap-3">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-foam shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <p className="font-semibold text-navy-deep truncate flex-1">{p.name}</p>
                  <button onClick={() => toggleFeatured(p)} className={`shrink-0 p-1 -mt-1 rounded ${p.featured ? "text-yellow-500" : "text-gray-300"}`}>
                    <Star className={`w-4 h-4 ${p.featured ? "fill-current" : ""}`} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground truncate">{p.category}</p>
                <div className="flex items-center gap-2 mt-1.5 text-xs">
                  <span className="font-bold text-navy-deep">${Number(p.price).toFixed(2)}</span>
                  <span className="text-muted-foreground">· stock {p.stock}</span>
                  <span className={`ml-auto px-2 py-0.5 rounded-full font-semibold ${p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {p.active ? "Activo" : "Oculto"}
                  </span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  <button onClick={() => openEdit(p)} className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-foam text-ocean text-xs font-semibold">
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button onClick={() => toggleActive(p)} className="px-2 py-1.5 rounded-lg bg-foam text-navy-deep">
                    {p.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => handleDelete(p)} className="px-2 py-1.5 rounded-lg bg-destructive/10 text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: tabla */}
        <div className="hidden md:block bg-card rounded-2xl overflow-hidden shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-foam text-navy-deep">
              <tr>
                <th className="text-left p-3">Imagen</th>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Categoría</th>
                <th className="text-right p-3">Precio</th>
                <th className="text-right p-3">Stock</th>
                <th className="text-center p-3">Destacado</th>
                <th className="text-center p-3">Estado</th>
                <th className="text-right p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">Sin resultados para "{searchName}"</td></tr>
              ) : filteredList.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3">
                    {p.image_url ? <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-foam" />}
                  </td>
                  <td className="p-3 font-semibold text-navy-deep">{p.name}</td>
                  <td className="p-3 text-muted-foreground">{p.category}</td>
                  <td className="p-3 text-right font-semibold">${Number(p.price).toFixed(2)}</td>
                  <td className="p-3 text-right">{p.stock}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => toggleFeatured(p)} title={p.featured ? "Quitar de destacados" : "Marcar como destacado"} className={`p-1.5 rounded-lg transition ${p.featured ? "text-yellow-500 hover:bg-yellow-50" : "text-gray-300 hover:bg-foam"}`}>
                      <Star className={`w-4 h-4 ${p.featured ? "fill-current" : ""}`} />
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => toggleActive(p)} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {p.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />} {p.active ? "Activo" : "Oculto"}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-foam text-ocean"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p)} className="p-2 rounded-lg hover:bg-foam text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 md:p-4" onClick={() => setShowForm(false)}>
          <form onSubmit={handleSave} onClick={(e) => e.stopPropagation()} className="bg-card rounded-t-2xl md:rounded-2xl p-4 md:p-6 max-w-2xl w-full max-h-[92vh] md:max-h-[90vh] overflow-auto shadow-elegant">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-navy-deep">{editing ? "Editar producto" : "Nuevo producto"}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-navy-deep">Nombre</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-navy-deep">Descripción</label>
                <textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls + " resize-none"} />
              </div>
              <div>
                <label className="text-xs font-semibold text-navy-deep">Categoría</label>
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, subcategory_id: null })} className={inputCls}>
                  {categories.length === 0 && (
                    <>
                      <option value="Alimentos">Alimentos</option>
                      <option value="Fertilizantes">Fertilizantes</option>
                      <option value="Aditivos">Aditivos</option>
                      <option value="Insumos">Insumos</option>
                    </>
                  )}
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-navy-deep">Subcategoría</label>
                {(() => {
                  const parent = categories.find((c) => c.name === form.category);
                  const subs = parent ? subcategories.filter((s) => s.category_id === parent.id) : [];
                  return (
                    <select
                      value={form.subcategory_id ?? ""}
                      onChange={(e) => setForm({ ...form, subcategory_id: e.target.value || null })}
                      disabled={subs.length === 0}
                      className={inputCls + (subs.length === 0 ? " opacity-50 cursor-not-allowed" : "")}
                    >
                      <option value="">{subs.length === 0 ? "Sin subcategorías" : "— Ninguna —"}</option>
                      {subs.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  );
                })()}
              </div>
              <div>
                <label className="text-xs font-semibold text-navy-deep">Precio (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground pointer-events-none">$</span>
                  <input required type="number" step="0.01" min="0" value={form.price === 0 ? "" : form.price} placeholder="0.00" onFocus={(e) => e.target.select()} onChange={(e) => setForm({ ...form, price: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0 })} className={inputCls + " pl-7"} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-navy-deep">Stock</label>
                <div className="relative">
                  <input required type="number" min="0" value={form.stock === 0 ? "" : form.stock} placeholder="0" onFocus={(e) => e.target.select()} onChange={(e) => setForm({ ...form, stock: e.target.value === "" ? 0 : parseInt(e.target.value) || 0 })} className={inputCls + " pr-12"} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none">uds</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-navy-deep">Presentación</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={presentationParts.amount}
                    onChange={(e) => {
                      setForm({ ...form, presentation: formatPresentation(e.target.value, presentationParts.unit) });
                    }}
                    placeholder="25"
                    className={inputCls + " pr-16"}
                  />
                  <select
                    value={presentationParts.unit}
                    onChange={(e) => {
                      setForm({ ...form, presentation: formatPresentation(presentationParts.amount, e.target.value as PresentationUnit) });
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-1.5 pr-5 text-xs font-semibold text-navy-deep bg-foam border border-border rounded-md focus:outline-none focus:border-ocean cursor-pointer"
                  >
                    {PRESENTATION_UNITS.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-navy-deep">Contenido de proteína</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={(form.protein_content ?? "").replace(/[^0-9.]/g, "")}
                    onChange={(e) => {
                      const num = e.target.value;
                      setForm({ ...form, protein_content: num === "" ? "" : `${num}%` });
                    }}
                    placeholder="35"
                    className={inputCls + " pr-8"}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground pointer-events-none">%</span>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-navy-deep">Precio con tarjeta a 3 meses (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground pointer-events-none">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price_card_3m ?? ""}
                    onChange={(e) => setForm({ ...form, price_card_3m: e.target.value === "" ? null : parseFloat(e.target.value) })}
                    placeholder="Opcional — total diferido a 3 cuotas"
                    className={inputCls + " pl-7"}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Si lo dejas vacío no se mostrará el precio diferido.</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-navy-deep">Imagen</label>
                <div className="flex gap-3 items-start">
                  {form.image_url && <img src={form.image_url} alt="" className="w-20 h-20 rounded-lg object-cover" />}
                  <div className="flex-1">
                    <input value={form.image_url ?? ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="URL de la imagen" className={inputCls + " mb-2"} />
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border cursor-pointer hover:bg-foam text-xs font-semibold text-navy-deep">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Subir imagen
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.currentTarget.value = ""; }} />
                      </label>
                      {form.image_url && (
                        <button
                          type="button"
                          onClick={() => setAdjusterSrc(form.image_url!)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-foam text-xs font-semibold text-navy-deep"
                        >
                          <Crop className="w-4 h-4" /> Reajustar actual
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5">La imagen se procesa automáticamente al subirla y luego puedes reajustarla si necesitas moverla o acercarla.</p>
                  </div>
                </div>
              </div>
              <label className="sm:col-span-2 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                <span>Activo (visible en la tienda)</span>
              </label>
              <label className="sm:col-span-2 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                <span>Destacado (aparece en la página principal)</span>
              </label>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-semibold">Cancelar</button>
              <button disabled={saving} type="submit" className="px-6 py-2 rounded-lg gradient-wave text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {adjusterSrc && (
        <ImageAdjuster
          src={adjusterSrc}
          onCancel={() => setAdjusterSrc(null)}
          onConfirm={async (blob) => {
            const toastId = toast.loading("Subiendo imagen ajustada…");
            const currentEditing = editing;
            try {
              setUploading(true);
              const url = await uploadBlob(blob, "png");
              setForm((f) => ({ ...f, image_url: url }));
              if (currentEditing) {
                const { error } = await supabase
                  .from("products")
                  .update({ image_url: url })
                  .eq("id", currentEditing.id);
                if (error) throw error;
                setEditing({ ...currentEditing, image_url: url });
              }
              toast.success("Imagen actualizada", { id: toastId });
              setAdjusterSrc(null);
              // Refrescamos la lista en segundo plano para no bloquear el cierre
              load().catch((err) => console.error("Error recargando productos:", err));
            } catch (e: any) {
              console.error("Error aplicando imagen ajustada:", e);
              const msg =
                e?.message ||
                e?.error_description ||
                (typeof e === "string" ? e : "No se pudo aplicar la imagen");
              toast.error(msg, { id: toastId });
            } finally {
              setUploading(false);
            }
          }}
        />
      )}
    </div>
  );
}