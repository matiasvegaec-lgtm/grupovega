import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, FormEvent } from "react";
import { Plus, Pencil, Trash2, Loader2, X, Upload, Eye, EyeOff, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
};

type Category = { id: string; name: string };
type Subcategory = { id: string; name: string; category_id: string };

export const Route = createFileRoute("/admin/productos")({
  component: AdminProductos,
});

const empty: Omit<Product, "id"> = {
  name: "", description: "", price: 0, category: "Alimentos",
  image_url: "", stock: 0, active: true, display_order: 0, featured: false, subcategory_id: null,
};

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
    setForm({ name: p.name, description: p.description ?? "", price: Number(p.price), category: p.category, image_url: p.image_url ?? "", stock: p.stock, active: p.active, display_order: p.display_order, featured: p.featured, subcategory_id: p.subcategory_id ?? null });
    setShowForm(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file);
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast.success("Imagen subida");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), display_order: Number(form.display_order), image_url: form.image_url || null, description: form.description || null, subcategory_id: form.subcategory_id || null };
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-deep">Productos</h1>
          <p className="text-sm text-muted-foreground">Gestiona el catálogo de tu tienda.</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full gradient-wave text-white font-semibold shadow-glow">
          <Plus className="w-4 h-4" /> Nuevo producto
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-ocean" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl">
          <p className="text-muted-foreground mb-4">Aún no hay productos.</p>
          <button onClick={openNew} className="px-6 py-2.5 rounded-full gradient-wave text-white font-semibold">Crear el primero</button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl overflow-hidden shadow-card">
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
              {list.map((p) => (
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
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <form onSubmit={handleSave} onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto shadow-elegant">
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
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                  <option value="Alimentos">Alimentos</option>
                  <option value="Fertilizantes">Fertilizantes</option>
                  <option value="Aditivos">Aditivos</option>
                  <option value="Insumos">Insumos</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-navy-deep">Precio (USD)</label>
                <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-navy-deep">Stock</label>
                <input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-navy-deep">Orden</label>
                <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-navy-deep">Imagen</label>
                <div className="flex gap-3 items-start">
                  {form.image_url && <img src={form.image_url} alt="" className="w-20 h-20 rounded-lg object-cover" />}
                  <div className="flex-1">
                    <input value={form.image_url ?? ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="URL de la imagen" className={inputCls + " mb-2"} />
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border cursor-pointer hover:bg-foam text-xs font-semibold text-navy-deep">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Subir archivo
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                    </label>
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
    </div>
  );
}