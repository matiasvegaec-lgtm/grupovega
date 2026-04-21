import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Download, ShoppingCart, Check } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import feedImg from "@/assets/product-feed.jpg";
import labImg from "@/assets/service-lab.jpg";
import equipImg from "@/assets/service-equipment.jpg";

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

const categories = ["Todos", "Alimento", "Probióticos", "Fertilizantes", "Equipos", "Laboratorio"];

const products = [
  { id: "feed-larva-45", name: "AquaFeed Larva 45%", price: 48.5, category: "Alimento", desc: "Alimento de inicio para post-larva PL10-PL15.", img: feedImg },
  { id: "feed-juvenil-38", name: "AquaFeed Juvenil 38%", price: 42.0, category: "Alimento", desc: "Crecimiento óptimo en fase juvenil.", img: feedImg },
  { id: "feed-engorde-32", name: "AquaFeed Engorde 32%", price: 38.0, category: "Alimento", desc: "Maximiza FCR en fase de engorde.", img: feedImg },
  { id: "probio-plus", name: "ProBio Plus", price: 65.0, category: "Probióticos", desc: "Mezcla de Bacillus para sanidad intestinal.", img: labImg },
  { id: "vibriostop", name: "VibrioStop", price: 72.0, category: "Probióticos", desc: "Control biológico de vibriosis.", img: labImg },
  { id: "fertipond", name: "FertiPond", price: 28.0, category: "Fertilizantes", desc: "Fertilizante orgánico para floración natural.", img: labImg },
  { id: "aeromax-5hp", name: "AeroMax 5HP", price: 1450.0, category: "Equipos", desc: "Aireador paddle wheel de alta eficiencia.", img: equipImg },
  { id: "oxymonitor-iot", name: "OxyMonitor IoT", price: 890.0, category: "Equipos", desc: "Sensor de oxígeno disuelto con conexión 4G.", img: equipImg },
  { id: "pcr-wssv-kit", name: "PCR WSSV Kit", price: 320.0, category: "Laboratorio", desc: "Detección rápida de mancha blanca.", img: labImg },
];

function ProductosPage() {
  const [active, setActive] = useState("Todos");
  const [query, setQuery] = useState("");
  const { addItem } = useCart();

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
                  <img src={p.img} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full glass text-white text-xs font-semibold">{p.category}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-navy-deep mb-1">{p.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{p.desc}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-navy-deep">${p.price.toFixed(2)}</span>
                    <button className="inline-flex items-center gap-1 text-ocean text-xs font-semibold hover:gap-2 transition-all">
                      <Download className="w-3.5 h-3.5" /> Ficha
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      addItem({ id: p.id, name: p.name, price: p.price, category: p.category, img: p.img });
                      toast.success(`${p.name} agregado al carrito`);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full gradient-wave text-white text-sm font-semibold shadow-glow hover:scale-[1.02] transition-transform"
                  >
                    <ShoppingCart className="w-4 h-4" /> Agregar al carrito
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-16">No se encontraron productos.</p>
          )}
        </div>
      </section>
    </Layout>
  );
}