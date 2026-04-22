import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Wheat, Droplet, FlaskConical, Sprout, Pill, Beaker, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Layout } from "@/components/Layout";
import { UnderwaterScene } from "@/components/UnderwaterScene";
import heroImg from "@/assets/hero-shrimp-farm.jpg";
import pBalanceado from "@/assets/p-balanceado.png";
import pAceite from "@/assets/p-aceite.png";
import pAditivo from "@/assets/p-aditivo.png";
import pLarva from "@/assets/p-larva.png";
import pFertilizante from "@/assets/p-fertilizante.png";
import pVitamina from "@/assets/p-vitamina.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Grupo Vega — Insumos para Camaroneras del Ecuador" },
      { name: "description", content: "Alimentos, aceites y aditivos para la industria camaronera. Encuentra nuestro punto de venta en Ecuador." },
      { property: "og:title", content: "Grupo Vega — Industria Camaronera" },
      { property: "og:description", content: "Insumos y equipos para camaroneras del Ecuador." },
    ],
  }),
  component: Index,
});

const categories = [
  { icon: Wheat, name: "Alimentos" },
  { icon: Sprout, name: "Fertilizantes" },
  { icon: FlaskConical, name: "Aditivos" },
  { icon: Beaker, name: "Insumos" },
];

const featured = [
  { name: "Balanceado Engorde", img: pBalanceado },
  { name: "Aceite de Pescado", img: pAceite },
  { name: "Aditivo Probiótico", img: pAditivo },
  { name: "Alimento Larva", img: pLarva },
  { name: "Fertilizante Mineral", img: pFertilizante },
  { name: "Vitaminas Premix", img: pVitamina },
];

const suppliers = [
  "Cargill", "Skretting", "BioMar", "Nutreco", "INVE", "Zeigler", "Alltech", "Nicovita",
];

function Index() {
  // Duplicamos el array para crear loop infinito sin saltos
  const carouselItems = [...featured, ...featured];
  const supplierItems = [...suppliers, ...suppliers];

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
              Alimento balanceado, aceites, aditivos y más insumos premium con distribución en toda la costa ecuatoriana.
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
                Ver productos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
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

      {/* CATEGORÍAS — solo icono + nombre */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-ocean mb-3">Categorías</p>
            <h2 className="text-4xl md:text-5xl font-bold text-navy-deep">Líneas de producto</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto justify-items-center">
            {categories.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group flex flex-col items-center text-center cursor-pointer"
              >
                <div className="w-20 h-20 rounded-full gradient-wave flex items-center justify-center shadow-glow mb-3 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                  <c.icon className="w-9 h-9 text-white" strokeWidth={1.8} />
                </div>
                <span className="font-semibold text-navy-deep">{c.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS — carrusel automático, sueltos sin caja */}
      <section className="py-20 bg-foam overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-widest text-ocean mb-3">Destacados</p>
            <h2 className="text-4xl md:text-5xl font-bold text-navy-deep">Productos más vendidos</h2>
          </div>
        </div>

        <div className="relative w-full">
          {/* fade laterales */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-foam to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-foam to-transparent" />

          <div className="flex gap-12 animate-marquee w-max hover:[animation-play-state:paused]">
            {carouselItems.map((p, i) => (
              <div key={`${p.name}-${i}`} className="flex flex-col items-center w-56 shrink-0">
                <div className="w-56 h-56 flex items-center justify-center group">
                  <img
                    src={p.img}
                    alt={p.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                    style={{ filter: "drop-shadow(0 20px 30px oklch(0.22 0.1 258 / 0.25))" }}
                  />
                </div>
                <p className="mt-4 font-semibold text-navy-deep text-center">{p.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link to="/productos" className="inline-flex items-center gap-1 text-ocean font-semibold hover:gap-2 transition-all">
            Ver catálogo completo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* PROVEEDORES — marquee con efectos por logo */}
      <section className="py-20 bg-background overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-widest text-ocean mb-3">Proveedores</p>
            <h2 className="text-4xl md:text-5xl font-bold text-navy-deep">Marcas que distribuimos</h2>
            <p className="text-muted-foreground mt-4">Trabajamos con los líderes mundiales en nutrición y sanidad acuícola.</p>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-background to-transparent" />

          <div className="flex gap-6 animate-marquee-slow w-max hover:[animation-play-state:paused]">
            {supplierItems.map((s, i) => (
              <motion.div
                key={`${s}-${i}`}
                whileHover={{ scale: 1.1, rotate: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative shrink-0 w-56 h-28 group"
              >
                <div className="absolute inset-0 gradient-wave rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition duration-500" />
                <div className="relative w-full h-full bg-card border border-border rounded-2xl flex items-center justify-center text-navy-deep font-display font-bold text-2xl group-hover:border-ocean group-hover:text-ocean group-hover:shadow-elegant transition-all duration-300">
                  <span className="relative">
                    {s}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 gradient-wave group-hover:w-full transition-all duration-500" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PUNTO DE VENTA — info izquierda + mapa derecha */}
      <section className="py-20 gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-turquoise mb-3">Punto de venta</p>
            <h2 className="text-4xl md:text-5xl font-bold">Visítanos</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-stretch">
            {/* Info izquierda */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass rounded-3xl p-8 md:p-10 flex flex-col justify-center"
            >
              <h3 className="text-3xl font-bold mb-2">Grupo Vega — Pedernales</h3>
              <p className="text-turquoise font-semibold mb-8">Sede principal y centro de distribución</p>

              <ul className="space-y-5">
                <li className="flex gap-4">
                  <div className="shrink-0 w-11 h-11 rounded-xl gradient-wave flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white/60 text-xs uppercase tracking-widest font-semibold">Dirección</div>
                    <div className="text-lg">García Moreno y 3 de Noviembre, frente al cementerio — Pedernales, Manabí, Ecuador</div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="shrink-0 w-11 h-11 rounded-xl gradient-wave flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white/60 text-xs uppercase tracking-widest font-semibold">Teléfono</div>
                    <div className="text-lg">+593 99 773 8026</div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="shrink-0 w-11 h-11 rounded-xl gradient-wave flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white/60 text-xs uppercase tracking-widest font-semibold">Email</div>
                    <div className="text-lg">grupovega.ec@gmail.com</div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="shrink-0 w-11 h-11 rounded-xl gradient-wave flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white/60 text-xs uppercase tracking-widest font-semibold">Horario</div>
                    <div className="text-lg">Lun – Vie: 8:00 – 18:00 · Sáb: 8:00 – 13:00</div>
                  </div>
                </li>
              </ul>

              <a
                href="https://share.google/ZFla4RoAnbQhZ5IOk"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow hover:scale-105 transition w-fit"
              >
                Cómo llegar <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Mapa derecha */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl overflow-hidden shadow-elegant min-h-[400px] lg:min-h-full border border-white/20"
            >
              <iframe
                title="Ubicación Grupo Vega - Pedernales"
                src="https://www.google.com/maps?q=Grupo+Vega+Pedernales+Manab%C3%AD+Ecuador&z=16&output=embed"
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full min-h-[400px] border-0"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}