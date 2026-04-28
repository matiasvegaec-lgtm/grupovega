import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingCart, Loader2, Wheat, Sprout, FlaskConical, Beaker, Pill, Droplet, Layers, X, Heart } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import feedImg from "@/assets/product-feed.jpg";
import provNlproinsu from "@/assets/proveedor-nlproinsu.png";
import provNaturalstar from "@/assets/proveedor-naturalstar.png";
import provBlueweight from "@/assets/proveedor-blueweight.png";
import provLacolina from "@/assets/proveedor-lacolina.png";
import provLarviva from "@/assets/proveedor-larviva.png";
import provBiomar from "@/assets/proveedor-biomar.png";
import productosHero from "@/assets/productos-hero.jpeg";
import { usePageHero } from "@/hooks/usePageHero";

export const Route = createFileRoute("/productos")({
  head: () => ({
    meta: [
      { title: "Productos — Grupo Vega" },
      { name: "description", content: "Catálogo completo de alimento balanceado, probióticos, fertilizantes y equipos para camaroneras." },
      { property: "og:title", content: "Productos Grupo Vega" },
      { property: "og:description", content: "Catálogo completo para camaroneras." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { categoria?: string } => {
    const categoria = typeof search.categoria === "string" ? search.categoria : undefined;
    return categoria ? { categoria } : {};
  },
  component: ProductosPage,
});

type Product = {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  stock: number;
  subcategory_id: string | null;
};

type Category = { id: string; name: string };
type Subcategory = { id: string; name: string; category_id: string };

const CATEGORY_META: Record<string, { icon: typeof Wheat; desc: string }> = {
  "Alimentos": { icon: Wheat, desc: "Balanceados premium" },
  "Fertilizantes": { icon: Sprout, desc: "Nutrientes para piscinas" },
  "Aditivos": { icon: FlaskConical, desc: "Probióticos y mejoradores" },
  "Insumos": { icon: Beaker, desc: "Químicos y equipos" },
  "Vitaminas": { icon: Pill, desc: "Premix y suplementos" },
  "Aceites": { icon: Droplet, desc: "Aceites de pescado" },
};

const SUPPLIERS = [
  { name: "NLProinsu", img: provNlproinsu },
  { name: "NaturalStar", img: provNaturalstar },
  { name: "Blueweight", img: provBlueweight },
  { name: "La Colina", img: provLacolina },
  { name: "Larviva", img: provLarviva },
  { name: "BioMar", img: provBiomar },
];

function ProductosPage() {
  const location = useLocation();
  const { categoria } = Route.useSearch();
  const [active, setActive] = useState("Todos");
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [stockOnly, setStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [sort, setSort] = useState<"recent" | "price-asc" | "price-desc" | "name">("recent");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { toggle: toggleFav, isFavorite } = useFavorites();
  const heroBg = usePageHero("productos", productosHero);

  useEffect(() => {
    (async () => {
      const [prodRes, catRes, subRes] = await Promise.all([
        supabase.from("products").select("*").eq("active", true).order("display_order").order("created_at", { ascending: false }),
        supabase.from("categories").select("id,name").eq("active", true).order("display_order"),
        supabase.from("subcategories").select("id,name,category_id").eq("active", true).order("display_order"),
      ]);
      if (!prodRes.error) {
        const list = (prodRes.data ?? []) as Product[];
        setProducts(list);
        const max = list.reduce((m, p) => Math.max(m, Number(p.price) || 0), 0);
        setMaxPrice(Math.ceil(max) || 100);
      }
      if (!catRes.error) setCategories((catRes.data ?? []) as Category[]);
      if (!subRes.error) setSubcategories((subRes.data ?? []) as Subcategory[]);
      setLoading(false);
    })();
  }, []);

  // Aplicar categoría desde el search param ?categoria=Alimentos
  useEffect(() => {
    if (categoria && categoria.length > 0) {
      setActive(categoria);
      setActiveSub(null);
    }
  }, [categoria]);

  const allCategoryNames = categories.map((c) => c.name);
  const categoryCounts = allCategoryNames.reduce<Record<string, number>>((acc, c) => {
    acc[c] = products.filter((p) => p.category === c).length;
    return acc;
  }, {});
  const totalMaxPrice = products.reduce((m, p) => Math.max(m, Number(p.price) || 0), 0) || 100;

  const filtered = products
    .filter(
      (p) =>
        (active === "Todos" || p.category === active) &&
        (!activeSub || p.subcategory_id === activeSub) &&
        p.name.toLowerCase().includes(query.toLowerCase()) &&
        (!stockOnly || p.stock > 0) &&
        (maxPrice === 0 || Number(p.price) <= maxPrice)
    )
    .sort((a, b) => {
      if (sort === "price-asc") return Number(a.price) - Number(b.price);
      if (sort === "price-desc") return Number(b.price) - Number(a.price);
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const resetFilters = () => {
    setActive("Todos");
    setActiveSub(null);
    setQuery("");
    setStockOnly(false);
    setMaxPrice(Math.ceil(totalMaxPrice));
    setSort("recent");
  };

  const supplierItems = [...SUPPLIERS, ...SUPPLIERS, ...SUPPLIERS];

  if (location.pathname !== "/productos") {
    return <Outlet />;
  }

  const Sidebar = (
    <aside className="space-y-6">
      {/* Búsqueda */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-ocean mb-2 block">Buscar</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre del producto..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-card border border-border focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20 transition text-sm"
          />
        </div>
      </div>

      {/* Categorías */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-ocean mb-3 block">Categorías</label>
        <div className="space-y-1">
          <button
            onClick={() => { setActive("Todos"); setActiveSub(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              active === "Todos"
                ? "gradient-wave text-white shadow-glow"
                : "text-navy-deep hover:bg-foam"
            }`}
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4" /> Todos
            </span>
            <span className={`text-xs ${active === "Todos" ? "text-white/80" : "text-muted-foreground"}`}>
              {products.length}
            </span>
          </button>
          {allCategoryNames.map((c) => {
            const meta = CATEGORY_META[c];
            const Icon = meta?.icon ?? Beaker;
            const count = categoryCounts[c] ?? 0;
            const isActive = active === c;
            const catRow = categories.find((x) => x.name === c);
            const subs = catRow ? subcategories.filter((s) => s.category_id === catRow.id) : [];
            return (
              <div key={c}>
                <button
                  onClick={() => { setActive(c); setActiveSub(null); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "gradient-wave text-white shadow-glow"
                      : "text-navy-deep hover:bg-foam"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" /> {c}
                  </span>
                  <span className={`text-xs ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
                    {count}
                  </span>
                </button>
                {isActive && subs.length > 0 && (
                  <div className="mt-1 ml-3 pl-3 border-l border-border space-y-1">
                    <button
                      onClick={() => setActiveSub(null)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        activeSub === null ? "bg-foam text-ocean" : "text-muted-foreground hover:bg-foam"
                      }`}
                    >
                      Todas las subcategorías
                    </button>
                    {subs.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setActiveSub(s.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          activeSub === s.id ? "bg-foam text-ocean" : "text-muted-foreground hover:bg-foam"
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Precio */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-ocean mb-3 block">
          Precio máximo: ${maxPrice}
        </label>
        <input
          type="range"
          min={0}
          max={Math.ceil(totalMaxPrice)}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-ocean"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>$0</span>
          <span>${Math.ceil(totalMaxPrice)}</span>
        </div>
      </div>

      {/* Disponibilidad */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-navy-deep">
          <input
            type="checkbox"
            checked={stockOnly}
            onChange={(e) => setStockOnly(e.target.checked)}
            className="w-4 h-4 accent-ocean"
          />
          Solo disponibles en stock
        </label>
      </div>

      {/* Orden */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-ocean mb-2 block">Ordenar por</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="w-full px-3 py-2.5 rounded-xl bg-card border border-border focus:border-ocean focus:outline-none text-sm"
        >
          <option value="recent">Más recientes</option>
          <option value="name">Nombre A–Z</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
        </select>
      </div>

      <button
        onClick={resetFilters}
        className="w-full px-4 py-2.5 rounded-full border border-border text-sm font-semibold text-navy-deep hover:border-ocean hover:text-ocean transition"
      >
        Limpiar filtros
      </button>
    </aside>
  );

  return (
    <Layout>
      <PageHero
        eyebrow="Catálogo"
        title="Productos para cada fase del cultivo"
        description="Más de 60 productos especializados para optimizar la productividad de tu camaronera."
        backgroundImage={heroBg}
      />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar desktop */}
            <div className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24 bg-card border border-border rounded-3xl p-6 shadow-card">
                {Sidebar}
              </div>
            </div>

            {/* Botón filtros mobile */}
            <div className="lg:hidden flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full gradient-wave text-white text-sm font-semibold shadow-glow"
                >
                  <Search className="w-4 h-4" /> Filtros
                </button>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="px-4 py-2.5 rounded-full border border-border bg-card text-navy-deep text-sm font-semibold focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20 transition"
                  aria-label="Ordenar productos"
                >
                  <option value="recent">Relevancia</option>
                  <option value="name">Nombre A–Z</option>
                  <option value="price-asc">Precio: menor a mayor</option>
                  <option value="price-desc">Precio: mayor a menor</option>
                </select>
              </div>
              <span className="text-sm text-muted-foreground pl-1">
                {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Drawer mobile */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setSidebarOpen(false)}
                />
                <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-background p-6 overflow-y-auto animate-slide-in-right">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-navy-deep">Filtros</h3>
                    <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-full hover:bg-foam">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {Sidebar}
                </div>
              </div>
            )}

            {/* Grid de productos */}
            <div className="flex-1 min-w-0">
              <div className="hidden lg:flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-navy-deep">
                  {active === "Todos" ? "Todos los productos" : active}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
                </span>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-ocean" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-muted-foreground py-16">No se encontraron productos.</p>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filtered.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
                      className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-all hover:-translate-y-2 flex flex-col"
                    >
                      <Link
                        to="/productos/$productId"
                        params={{ productId: p.slug || p.id }}
                        className="block w-full h-48 sm:h-52 overflow-hidden relative text-left bg-white"
                      >
                        <img
                          src={p.image_url || feedImg}
                          alt={p.name}
                          loading="lazy"
                          className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-700"
                        />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-semibold shadow-md">
                          {p.category}
                        </span>
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFav({
                            id: p.id,
                            name: p.name,
                            price: Number(p.price),
                            category: p.category,
                            img: p.image_url || feedImg,
                            slug: p.slug,
                          });
                          toast.success(
                            isFavorite(p.id)
                              ? `${p.name} quitado de favoritos`
                              : `${p.name} agregado a favoritos`,
                          );
                        }}
                        aria-label="Favorito"
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-md hover:scale-110 transition"
                      >
                        <Heart
                          className={`w-4 h-4 transition ${
                            isFavorite(p.id)
                              ? "fill-orange-500 text-orange-500"
                              : "text-navy-deep"
                          }`}
                        />
                      </button>
                      <div className="p-5 flex flex-col flex-1">
                        <Link
                          to="/productos/$productId"
                          params={{ productId: p.slug || p.id }}
                          className="text-left font-bold text-navy-deep mb-1 hover:text-ocean transition"
                        >
                          {p.name}
                        </Link>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
                          {p.description}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xl font-bold text-navy-deep">
                            ${Number(p.price).toFixed(2)}
                          </span>
                          {p.stock > 0 ? (
                            <span className="text-xs text-green-700 font-semibold">En stock</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Agotado</span>
                          )}
                        </div>
                        <button
                          disabled={p.stock <= 0}
                          onClick={() => {
                            addItem({
                              id: p.id,
                              name: p.name,
                              price: Number(p.price),
                              category: p.category,
                              img: p.image_url || feedImg,
                            });
                            toast.success(`${p.name} agregado al carrito`);
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full gradient-wave text-white text-sm font-semibold shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="w-4 h-4" /> Agregar al carrito
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Proveedores — marquee */}
      <section className="py-20 bg-foam overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-widest text-ocean mb-3">Proveedores</p>
            <h2 className="text-4xl md:text-5xl font-bold text-navy-deep">Marcas que distribuimos</h2>
            <p className="text-muted-foreground mt-4">
              Trabajamos con los líderes mundiales en nutrición y sanidad acuícola.
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-foam to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-foam to-transparent" />
          <div className="flex gap-6 animate-marquee-slow w-max hover:[animation-play-state:paused]">
            {supplierItems.map((s, i) => (
              <div
                key={`${s.name}-${i}`}
                className="relative shrink-0 w-56 h-28 group"
              >
                <div className="absolute inset-0 gradient-wave rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition duration-500" />
                <div className="relative w-full h-full bg-white border border-border rounded-2xl flex items-center justify-center p-4 group-hover:border-ocean group-hover:shadow-elegant transition-all duration-300 overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}