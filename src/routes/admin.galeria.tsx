import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, FormEvent, useRef } from "react";
import { Trash2, Loader2, ImageUp, GripVertical, Eye, EyeOff, ImageIcon, Pencil, Check, X as XIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/galeria")({
  component: AdminGaleria,
});

type CompanyImage = {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

type SupplierLogoRow = {
  id: string;
  name: string;
  image_url: string;
  sort_order: number;
  active: boolean;
  created_at: string;
};

type PageHeroRow = {
  id: string;
  page_key: string;
  label: string;
  image_url: string;
  active: boolean;
};

// Páginas que pueden tener un banner editable. Si no existe registro en BD,
// se ofrecerá crearlo desde el panel.
const EDITABLE_HERO_PAGES: { page_key: string; label: string }[] = [
  { page_key: "productos", label: "Banner — Productos" },
  { page_key: "home", label: "Banner — Inicio" },
  { page_key: "quienes-somos", label: "Banner — Quiénes Somos" },
  { page_key: "contacto", label: "Banner — Contacto" },
  { page_key: "carrito", label: "Banner — Carrito" },
];

function AdminGaleria() {
  const [tab, setTab] = useState<"company" | "suppliers" | "heroes">("company");

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-navy-deep">Galería</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Administra las imágenes de "Quiénes Somos", los logos de marcas y los banners de las páginas.
        </p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setTab("company")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${
            tab === "company"
              ? "border-ocean text-ocean"
              : "border-transparent text-muted-foreground hover:text-navy-deep"
          }`}
        >
          Quiénes Somos
        </button>
        <button
          onClick={() => setTab("suppliers")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${
            tab === "suppliers"
              ? "border-ocean text-ocean"
              : "border-transparent text-muted-foreground hover:text-navy-deep"
          }`}
        >
          Marcas que distribuimos
        </button>
        <button
          onClick={() => setTab("heroes")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${
            tab === "heroes"
              ? "border-ocean text-ocean"
              : "border-transparent text-muted-foreground hover:text-navy-deep"
          }`}
        >
          Banners de páginas
        </button>
      </div>

      {tab === "company" && <CompanyGallerySection />}
      {tab === "suppliers" && <SuppliersSection />}
      {tab === "heroes" && <HeroesSection />}
    </div>
  );
}

function CompanyGallerySection() {
  const [images, setImages] = useState<CompanyImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("company_images")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) toast.error(error.message);
    if (data) setImages(data as CompanyImage[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error("Selecciona una imagen");

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const up = await supabase.storage.from("company-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (up.error) throw up.error;

      const { data: pub } = supabase.storage.from("company-images").getPublicUrl(path);
      const nextOrder = (images[images.length - 1]?.sort_order ?? 0) + 1;
      const ins = await supabase.from("company_images").insert({
        image_url: pub.publicUrl,
        caption: caption.trim() || null,
        sort_order: nextOrder,
      });
      if (ins.error) throw ins.error;

      toast.success("Imagen subida");
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al subir";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  async function remove(img: CompanyImage) {
    if (!confirm("¿Eliminar esta imagen?")) return;
    // Intentar borrar archivo del storage
    try {
      const url = new URL(img.image_url);
      const parts = url.pathname.split("/company-images/");
      if (parts[1]) await supabase.storage.from("company-images").remove([parts[1]]);
    } catch {
      // ignore
    }
    const { error } = await supabase.from("company_images").delete().eq("id", img.id);
    if (error) return toast.error(error.message);
    toast.success("Imagen eliminada");
    load();
  }

  async function move(img: CompanyImage, direction: -1 | 1) {
    const idx = images.findIndex((i) => i.id === img.id);
    const swap = images[idx + direction];
    if (!swap) return;
    await Promise.all([
      supabase.from("company_images").update({ sort_order: swap.sort_order }).eq("id", img.id),
      supabase.from("company_images").update({ sort_order: img.sort_order }).eq("id", swap.id),
    ]);
    load();
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-4">
        Imágenes del carrusel automático en la página Quiénes Somos.
      </p>
      <form
        onSubmit={handleUpload}
        className="bg-card border border-border rounded-2xl p-5 mb-8 shadow-card"
      >
        <h2 className="font-semibold text-navy-deep mb-4 flex items-center gap-2">
          <ImageUp className="w-4 h-4 text-ocean" /> Subir nueva imagen
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-navy-deep mb-1 block">Imagen</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              required
              className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-foam file:text-ocean hover:file:bg-foam/70"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-navy-deep mb-1 block">Descripción (opcional)</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ej: Equipo técnico en campo"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full gradient-wave text-white text-sm font-semibold disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageUp className="w-4 h-4" />}
            {uploading ? "Subiendo..." : "Subir imagen"}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-ocean" />
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          Aún no hay imágenes. Sube la primera arriba.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <div key={img.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
              <div className="aspect-[4/3] bg-foam">
                <img src={img.image_url} alt={img.caption ?? ""} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 space-y-2">
                {img.caption && <p className="text-sm font-medium text-navy-deep line-clamp-2">{img.caption}</p>}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <GripVertical className="w-3.5 h-3.5" />
                    <button
                      type="button"
                      onClick={() => move(img, -1)}
                      disabled={i === 0}
                      className="text-xs px-2 py-1 rounded hover:bg-foam disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(img, 1)}
                      disabled={i === images.length - 1}
                      className="text-xs px-2 py-1 rounded hover:bg-foam disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(img)}
                    className="inline-flex items-center gap-1 text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SuppliersSection() {
  const [logos, setLogos] = useState<SupplierLogoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [replacingId, setReplacingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("supplier_logos")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) toast.error(error.message);
    if (data) setLogos(data as SupplierLogoRow[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error("Selecciona una imagen");
    if (!name.trim()) return toast.error("Ingresa el nombre de la marca");

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `suppliers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const up = await supabase.storage.from("company-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (up.error) throw up.error;
      const { data: pub } = supabase.storage.from("company-images").getPublicUrl(path);
      const nextOrder = (logos[logos.length - 1]?.sort_order ?? 0) + 1;
      const ins = await supabase.from("supplier_logos").insert({
        name: name.trim(),
        image_url: pub.publicUrl,
        sort_order: nextOrder,
        active: true,
      });
      if (ins.error) throw ins.error;

      toast.success("Logo agregado");
      setName("");
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al subir";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  async function remove(logo: SupplierLogoRow) {
    if (!confirm(`¿Eliminar "${logo.name}"?`)) return;
    try {
      const url = new URL(logo.image_url);
      const parts = url.pathname.split("/company-images/");
      if (parts[1]) await supabase.storage.from("company-images").remove([parts[1]]);
    } catch {
      // ignore
    }
    const { error } = await supabase.from("supplier_logos").delete().eq("id", logo.id);
    if (error) return toast.error(error.message);
    toast.success("Logo eliminado");
    load();
  }

  async function toggleActive(logo: SupplierLogoRow) {
    const { error } = await supabase
      .from("supplier_logos")
      .update({ active: !logo.active })
      .eq("id", logo.id);
    if (error) return toast.error(error.message);
    load();
  }

  async function move(logo: SupplierLogoRow, direction: -1 | 1) {
    const idx = logos.findIndex((l) => l.id === logo.id);
    const swap = logos[idx + direction];
    if (!swap) return;
    await Promise.all([
      supabase.from("supplier_logos").update({ sort_order: swap.sort_order }).eq("id", logo.id),
      supabase.from("supplier_logos").update({ sort_order: logo.sort_order }).eq("id", swap.id),
    ]);
    load();
  }

  function startEdit(logo: SupplierLogoRow) {
    setEditingId(logo.id);
    setEditingName(logo.name);
  }

  async function saveEdit(logo: SupplierLogoRow) {
    if (!editingName.trim()) return toast.error("El nombre no puede estar vacío");
    const { error } = await supabase
      .from("supplier_logos")
      .update({ name: editingName.trim() })
      .eq("id", logo.id);
    if (error) return toast.error(error.message);
    toast.success("Nombre actualizado");
    setEditingId(null);
    load();
  }

  async function replaceImage(logo: SupplierLogoRow, file: File) {
    setReplacingId(logo.id);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `suppliers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const up = await supabase.storage.from("company-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (up.error) throw up.error;
      const { data: pub } = supabase.storage.from("company-images").getPublicUrl(path);

      // Borrar imagen anterior si está en nuestro storage
      try {
        const url = new URL(logo.image_url);
        const parts = url.pathname.split("/company-images/");
        if (parts[1]) await supabase.storage.from("company-images").remove([parts[1]]);
      } catch { /* ignore */ }

      const { error } = await supabase
        .from("supplier_logos")
        .update({ image_url: pub.publicUrl })
        .eq("id", logo.id);
      if (error) throw error;
      toast.success("Imagen reemplazada");
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al reemplazar";
      toast.error(msg);
    } finally {
      setReplacingId(null);
    }
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-4">
        Logos de las marcas que aparecen en el carrusel "Marcas que distribuimos" en la página principal.
        Si no hay marcas aquí, se mostrarán las marcas por defecto.
      </p>
      <form
        onSubmit={handleUpload}
        className="bg-card border border-border rounded-2xl p-5 mb-8 shadow-card"
      >
        <h2 className="font-semibold text-navy-deep mb-4 flex items-center gap-2">
          <ImageUp className="w-4 h-4 text-ocean" /> Agregar nueva marca
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-navy-deep mb-1 block">Logo (PNG con fondo transparente)</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              required
              className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-foam file:text-ocean hover:file:bg-foam/70"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-navy-deep mb-1 block">Nombre de la marca</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: BioMar"
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full gradient-wave text-white text-sm font-semibold disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageUp className="w-4 h-4" />}
            {uploading ? "Subiendo..." : "Agregar marca"}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-ocean" />
        </div>
      ) : logos.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          Sin marcas personalizadas. Se están mostrando las marcas por defecto del sitio.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {logos.map((logo, i) => (
            <div
              key={logo.id}
              className={`bg-card border border-border rounded-2xl overflow-hidden shadow-card ${
                !logo.active ? "opacity-60" : ""
              }`}
            >
              <div className="relative aspect-[16/9] bg-white flex items-center justify-center p-4 group">
                <img src={logo.image_url} alt={logo.name} className="max-w-full max-h-full object-contain" />
                <label
                  htmlFor={`logo-replace-${logo.id}`}
                  className={`absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition cursor-pointer ${
                    replacingId === logo.id ? "opacity-100" : ""
                  }`}
                >
                  {replacingId === logo.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <ImageUp className="w-3.5 h-3.5" /> Reemplazar imagen
                    </span>
                  )}
                </label>
                <input
                  id={`logo-replace-${logo.id}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) replaceImage(logo, file);
                    e.target.value = "";
                  }}
                />
              </div>
              <div className="p-3 space-y-2">
                {editingId === logo.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-2 py-1 rounded border border-border bg-background text-sm"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(logo)}
                      className="p-1.5 rounded text-emerald-600 hover:bg-emerald-50"
                      title="Guardar"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded text-muted-foreground hover:bg-foam"
                      title="Cancelar"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-navy-deep truncate flex-1">{logo.name}</p>
                    <button
                      type="button"
                      onClick={() => startEdit(logo)}
                      className="p-1.5 rounded text-ocean hover:bg-ocean/10"
                      title="Editar nombre"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <GripVertical className="w-3.5 h-3.5" />
                    <button
                      type="button"
                      onClick={() => move(logo, -1)}
                      disabled={i === 0}
                      className="text-xs px-2 py-1 rounded hover:bg-foam disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(logo, 1)}
                      disabled={i === logos.length - 1}
                      className="text-xs px-2 py-1 rounded hover:bg-foam disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleActive(logo)}
                      className="inline-flex items-center gap-1 text-xs text-ocean hover:bg-ocean/10 px-2 py-1 rounded"
                      title={logo.active ? "Ocultar" : "Mostrar"}
                    >
                      {logo.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(logo)}
                      className="inline-flex items-center gap-1 text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HeroesSection() {
  const [rows, setRows] = useState<PageHeroRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("page_heroes")
      .select("*");
    if (error) toast.error(error.message);
    if (data) setRows(data as PageHeroRow[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function uploadHero(page_key: string, label: string, file: File) {
    setUploadingKey(page_key);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `heroes/${page_key}-${Date.now()}.${ext}`;
      const up = await supabase.storage.from("company-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (up.error) throw up.error;
      const { data: pub } = supabase.storage.from("company-images").getPublicUrl(path);

      const existing = rows.find((r) => r.page_key === page_key);
      if (existing) {
        // Borrar archivo anterior del storage si era nuestro
        try {
          const url = new URL(existing.image_url);
          const parts = url.pathname.split("/company-images/");
          if (parts[1]) await supabase.storage.from("company-images").remove([parts[1]]);
        } catch { /* ignore */ }
        const { error } = await supabase
          .from("page_heroes")
          .update({ image_url: pub.publicUrl, active: true })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("page_heroes").insert({
          page_key,
          label,
          image_url: pub.publicUrl,
          active: true,
        });
        if (error) throw error;
      }
      toast.success("Banner actualizado");
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al subir";
      toast.error(msg);
    } finally {
      setUploadingKey(null);
    }
  }

  async function toggleActive(row: PageHeroRow) {
    const { error } = await supabase
      .from("page_heroes")
      .update({ active: !row.active })
      .eq("id", row.id);
    if (error) return toast.error(error.message);
    load();
  }

  async function removeHero(row: PageHeroRow) {
    if (!confirm(`¿Eliminar la imagen del banner "${row.label}"? La página volverá a usar el degradado por defecto.`)) return;
    try {
      const url = new URL(row.image_url);
      const parts = url.pathname.split("/company-images/");
      if (parts[1]) await supabase.storage.from("company-images").remove([parts[1]]);
    } catch { /* ignore */ }
    const { error } = await supabase.from("page_heroes").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("Banner eliminado");
    load();
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-4">
        Imágenes de fondo de los banners (hero) de cada página. Sube una nueva imagen para reemplazarla.
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-ocean" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {EDITABLE_HERO_PAGES.map(({ page_key, label }) => {
            const row = rows.find((r) => r.page_key === page_key);
            const inputId = `hero-file-${page_key}`;
            const isUploading = uploadingKey === page_key;
            return (
              <div
                key={page_key}
                className={`bg-card border border-border rounded-2xl overflow-hidden shadow-card ${
                  row && !row.active ? "opacity-60" : ""
                }`}
              >
                <div className="aspect-[16/7] bg-foam">
                  {row?.image_url ? (
                    <img src={row.image_url} alt={label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-sm font-semibold text-navy-deep">{label}</p>
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor={inputId}
                      className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full gradient-wave text-white font-semibold cursor-pointer ${
                        isUploading ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageUp className="w-3.5 h-3.5" />}
                      {isUploading ? "Subiendo..." : row ? "Reemplazar" : "Subir"}
                    </label>
                    <input
                      id={inputId}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadHero(page_key, label, file);
                        e.target.value = "";
                      }}
                    />
                    {row && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleActive(row)}
                          className="inline-flex items-center gap-1 text-xs text-ocean hover:bg-ocean/10 px-2 py-1 rounded"
                          title={row.active ? "Ocultar" : "Mostrar"}
                        >
                          {row.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeHero(row)}
                          className="inline-flex items-center gap-1 text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}