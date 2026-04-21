import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingCart, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import feedImg from "@/assets/product-feed.jpg";

export const Route = createFileRoute("/productos")({
  head: () => ({
    meta: [
      { title: "Productos — AquaMar" },
      { name: "description", content: "Catálogo completo de alimento balanceado, probióticos, fertilizantes y equipos para camaroneras." },
      { property: "og:title", content: "Productos AquaMar" },
      { property: "og:description", content: "Catálogo completo para camaroneras." },
    ],
  }),
  component: ProductosPage,
});

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  stock: number;
};

function ProductosPage() {
  const [active, setActive] = useState("Todos");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("products").select("*").eq("active", true).order("display_order").order("created_at", { ascending: false });
      if (!error) setProducts((data ?? []) as Product[]);
      setLoading(false);
    })();
  }, []);

  const categories = ["Todos", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter(
    (p) =>
      (active === "Todos" || p.category === active) &&
      p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Layout>
      <PageHero
        eyebrow="Catálogo"
        title="Productos para cada fase del cultivo"
        description="Más de 60 productos especializados para optimizar la productividad de tu camaronera."
      />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full pl-12 pr-4 py-3 rounded-full bg-card border border-border focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20 transition"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActive(c)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                    active === c
                      ? "gradient-wave text-white shadow-glow"
                      : "bg-card border border-border text-navy-deep hover:border-ocean"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-ocean" /></div>
          ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
                className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-all hover:-translate-y-2"
              >
                <div className="aspect-square overflow-hidden relative">
                  <img src={p.image_url || feedImg} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full glass text-white text-xs font-semibold">{p.category}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-navy-deep mb-1">{p.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-navy-deep">${Number(p.price).toFixed(2)}</span>
                    {p.stock > 0 ? <span className="text-xs text-green-700 font-semibold">En stock</span> : <span className="text-xs text-muted-foreground">Agotado</span>}
                  </div>
                  <button
                    disabled={p.stock <= 0}
                    onClick={() => {
                      addItem({ id: p.id, name: p.name, price: Number(p.price), category: p.category, img: p.image_url || feedImg });
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

          {!loading && filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-16">No se encontraron productos.</p>
          )}
        </div>
      </section>
    </Layout>
  );
}