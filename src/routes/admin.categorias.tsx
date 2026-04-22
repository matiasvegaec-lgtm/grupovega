import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, FormEvent } from "react";
import { Plus, Trash2, Edit2, Loader2, ChevronDown, ChevronRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categorias")({
  component: AdminCategorias,
});

type Category = {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  active: boolean;
};

type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  display_order: number;
  active: boolean;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function AdminCategorias() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [catModal, setCatModal] = useState<{ open: boolean; editing: Category | null }>({ open: false, editing: null });
  const [catForm, setCatForm] = useState({ name: "", display_order: 0, active: true });

  const [subModal, setSubModal] = useState<{ open: boolean; editing: Subcategory | null; categoryId: string | null }>({ open: false, editing: null, categoryId: null });
  const [subForm, setSubForm] = useState({ name: "", display_order: 0, active: true });

  async function load() {
    setLoading(true);
    const [c, s] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("subcategories").select("*").order("display_order"),
    ]);
    if (c.data) setCategories(c.data as Category[]);
    if (s.data) setSubcategories(s.data as Subcategory[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNewCat() {
    setCatForm({ name: "", display_order: 0, active: true });
    setCatModal({ open: true, editing: null });
  }
  function openEditCat(c: Category) {
    setCatForm({ name: c.name, display_order: c.display_order, active: c.active });
    setCatModal({ open: true, editing: c });
  }

  async function saveCategory(e: FormEvent) {
    e.preventDefault();
    const payload = { ...catForm, slug: slugify(catForm.name) };
    const res = catModal.editing
      ? await supabase.from("categories").update(payload).eq("id", catModal.editing.id)
      : await supabase.from("categories").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success("Categoría guardada");
    setCatModal({ open: false, editing: null });
    load();
  }

  async function deleteCategory(c: Category) {
    if (!confirm(`¿Eliminar "${c.name}" y todas sus subcategorías?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Categoría eliminada");
    load();
  }

  function openNewSub(categoryId: string) {
    setSubForm({ name: "", display_order: 0, active: true });
    setSubModal({ open: true, editing: null, categoryId });
  }
  function openEditSub(s: Subcategory) {
    setSubForm({ name: s.name, display_order: s.display_order, active: s.active });
    setSubModal({ open: true, editing: s, categoryId: s.category_id });
  }

  async function saveSubcategory(e: FormEvent) {
    e.preventDefault();
    if (!subModal.categoryId) return;
    const payload = { ...subForm, slug: slugify(subForm.name), category_id: subModal.categoryId };
    const res = subModal.editing
      ? await supabase.from("subcategories").update(payload).eq("id", subModal.editing.id)
      : await supabase.from("subcategories").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success("Subcategoría guardada");
    setSubModal({ open: false, editing: null, categoryId: null });
    load();
  }

  async function deleteSubcategory(s: Subcategory) {
    if (!confirm(`¿Eliminar "${s.name}"?`)) return;
    const { error } = await supabase.from("subcategories").delete().eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Subcategoría eliminada");
    load();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-deep">Categorías</h1>
          <p className="text-sm text-muted-foreground">Gestiona categorías y subcategorías</p>
        </div>
        <button onClick={openNewCat} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full gradient-wave text-white text-sm font-semibold shadow-glow">
          <Plus className="w-4 h-4" /> Nueva categoría
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-ocean" /></div>
      ) : categories.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No hay categorías. Crea la primera.</p>
      ) : (
        <div className="space-y-3">
          {categories.map((c) => {
            const subs = subcategories.filter((s) => s.category_id === c.id);
            const isOpen = expanded[c.id] ?? true;
            return (
              <div key={c.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <button onClick={() => setExpanded((e) => ({ ...e, [c.id]: !isOpen }))} className="flex items-center gap-3 flex-1 text-left">
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <div>
                      <p className="font-semibold text-navy-deep">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{subs.length} subcategoría{subs.length === 1 ? "" : "s"} · orden {c.display_order} · {c.active ? "activa" : "inactiva"}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openNewSub(c.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-foam text-ocean hover:bg-ocean hover:text-white transition inline-flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Subcategoría
                    </button>
                    <button onClick={() => openEditCat(c)} className="p-2 rounded-lg hover:bg-foam"><Edit2 className="w-4 h-4 text-ocean" /></button>
                    <button onClick={() => deleteCategory(c)} className="p-2 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
                  </div>
                </div>
                {isOpen && subs.length > 0 && (
                  <div className="border-t border-border bg-foam/30 divide-y divide-border">
                    {subs.map((s) => (
                      <div key={s.id} className="flex items-center justify-between px-4 py-2.5 pl-12">
                        <div>
                          <p className="text-sm font-medium text-navy-deep">{s.name}</p>
                          <p className="text-xs text-muted-foreground">orden {s.display_order} · {s.active ? "activa" : "inactiva"}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditSub(s)} className="p-2 rounded-lg hover:bg-background"><Edit2 className="w-4 h-4 text-ocean" /></button>
                          <button onClick={() => deleteSubcategory(s)} className="p-2 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {catModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setCatModal({ open: false, editing: null })}>
          <form onSubmit={saveCategory} onClick={(e) => e.stopPropagation()} className="bg-background rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy-deep">{catModal.editing ? "Editar" : "Nueva"} categoría</h2>
              <button type="button" onClick={() => setCatModal({ open: false, editing: null })}><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Nombre</label>
              <input required value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-card" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Orden</label>
              <input type="number" value={catForm.display_order} onChange={(e) => setCatForm({ ...catForm, display_order: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-card" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={catForm.active} onChange={(e) => setCatForm({ ...catForm, active: e.target.checked })} /> Activa
            </label>
            <button type="submit" className="w-full px-4 py-2.5 rounded-full gradient-wave text-white font-semibold">Guardar</button>
          </form>
        </div>
      )}

      {subModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSubModal({ open: false, editing: null, categoryId: null })}>
          <form onSubmit={saveSubcategory} onClick={(e) => e.stopPropagation()} className="bg-background rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy-deep">{subModal.editing ? "Editar" : "Nueva"} subcategoría</h2>
              <button type="button" onClick={() => setSubModal({ open: false, editing: null, categoryId: null })}><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Nombre</label>
              <input required value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-card" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Orden</label>
              <input type="number" value={subForm.display_order} onChange={(e) => setSubForm({ ...subForm, display_order: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-card" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={subForm.active} onChange={(e) => setSubForm({ ...subForm, active: e.target.checked })} /> Activa
            </label>
            <button type="submit" className="w-full px-4 py-2.5 rounded-full gradient-wave text-white font-semibold">Guardar</button>
          </form>
        </div>
      )}
    </div>
  );
}