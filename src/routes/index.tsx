import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Droplets, FlaskConical, Truck, Sprout, MapPin, Phone } from "lucide-react";
import { Layout } from "@/components/Layout";
import { UnderwaterScene } from "@/components/UnderwaterScene";
import heroImg from "@/assets/hero-shrimp-farm.jpg";
import feedImg from "@/assets/product-feed.jpg";
import labImg from "@/assets/service-lab.jpg";
import equipImg from "@/assets/service-equipment.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AquaMar — Insumos para Camaroneras del Ecuador" },
      { name: "description", content: "Alimento balanceado, probióticos, fertilizantes y equipos para la industria camaronera. Encuentra nuestros puntos de venta en Ecuador." },
      { property: "og:title", content: "AquaMar — Industria Camaronera" },
      { property: "og:description", content: "Insumos y equipos para camaroneras del Ecuador." },
    ],
  }),
  component: Index,
});

const categories = [
  { icon: Droplets, title: "Alimento Balanceado", desc: "Fórmulas premium para larva, juvenil y engorde." },
  { icon: FlaskConical, title: "Probióticos", desc: "Salud intestinal y control de vibriosis." },
  { icon: Sprout, title: "Fertilizantes", desc: "Floración natural y productividad del estanque." },
  { icon: Truck, title: "Equipos & Aireación", desc: "Aireadores, sensores IoT y monitoreo 24/7." },
];

const featured = [
  { name: "AquaFeed Engorde 32%", category: "Alimento", img: feedImg },
  { name: "ProBio Plus", category: "Probióticos", img: labImg },
  { name: "AeroMax 5HP", category: "Equipos", img: equipImg },
  { name: "FertiPond", category: "Fertilizantes", img: labImg },
];

const suppliers = [
  "Cargill", "Skretting", "BioMar", "Nutreco", "INVE Aquaculture", "Zeigler", "Alltech", "Nicovita",
];

const stores = [
  { city: "Guayaquil", address: "Km 8.5 Vía Daule", phone: "+593 4 222 3344" },
  { city: "Machala", address: "Av. Las Palmeras 200", phone: "+593 7 293 1122" },
  { city: "Manta", address: "Vía Puerto, Manta", phone: "+593 5 262 4455" },
  { city: "Esmeraldas", address: "Malecón 12-34", phone: "+593 6 272 8899" },
];

function Index() {
  return (
    <Layout>
      {/* HERO */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden gradient-deep">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover opacity-40" width={1920} height={1080} />
          <div className="absolute inset-0 gradient-deep opacity-70" />
        </div>
        <UnderwaterScene />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-white/90 text-sm mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-turquoise animate-pulse" />
              Insumos para la industria camaronera
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6"
            >
              Todo para tu <span className="text-gradient">camaronera</span> en un solo lugar
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl leading-relaxed"
            >
              Alimento balanceado, probióticos, fertilizantes y equipos de las mejores marcas del mundo, con puntos de venta en toda la costa ecuatoriana.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/productos"
                className="group inline-flex items-center gap-2 px-7 py-4 rounded-full gradient-wave text-white font-semibold shadow-glow hover:scale-105 transition-transform"
              >
                Ver productos
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                to="/contacto"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full glass text-white font-semibold hover:bg-white/20 transition"
              >
                Contáctanos
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L0,120Z" style={{ fill: "var(--background)" }} />
          </svg>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-ocean mb-3">Categorías</p>
            <h2 className="text-4xl md:text-5xl font-bold text-navy-deep">Líneas de producto</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-elegant transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl gradient-wave flex items-center justify-center shadow-glow mb-4 group-hover:scale-110 transition">
                  <c.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-navy-deep mb-1">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="py-20 bg-foam">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-ocean mb-3">Destacados</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-deep">Productos más vendidos</h2>
            </div>
            <Link to="/productos" className="inline-flex items-center gap-1 text-ocean font-semibold hover:gap-2 transition-all">
              Ver catálogo completo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-all hover:-translate-y-2"
              >
                <div className="aspect-square overflow-hidden relative">
                  <img src={p.img} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full glass text-white text-xs font-semibold">{p.category}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-navy-deep">{p.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROVEEDORES */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-ocean mb-3">Proveedores</p>
            <h2 className="text-4xl md:text-5xl font-bold text-navy-deep">Marcas que distribuimos</h2>
            <p className="text-muted-foreground mt-4">Trabajamos con los líderes mundiales en nutrición y sanidad acuícola.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {suppliers.map((s) => (
              <div key={s} className="bg-card border border-border rounded-2xl py-8 px-4 flex items-center justify-center text-navy-deep font-display font-bold text-lg hover:border-ocean hover:shadow-card transition">
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PUNTOS DE VENTA */}
      <section className="py-20 gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-turquoise mb-3">Puntos de venta</p>
            <h2 className="text-4xl md:text-5xl font-bold">Encuéntranos en la costa</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stores.map((s) => (
              <div key={s.city} className="glass rounded-2xl p-6 hover:bg-white/15 transition">
                <div className="w-10 h-10 rounded-lg gradient-wave flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-xl mb-1">{s.city}</h3>
                <p className="text-white/70 text-sm mb-3">{s.address}</p>
                <p className="text-turquoise text-sm font-semibold inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {s.phone}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}