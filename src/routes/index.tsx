import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Wheat, Droplet, FlaskConical, Sprout, Pill, Beaker, MapPin, Phone, Mail, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { UnderwaterScene } from "@/components/UnderwaterScene";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import heroImg from "@/assets/hero-shrimp-farm.jpg";
import pBalanceado from "@/assets/p-balanceado.png";
import pAceite from "@/assets/p-aceite.png";
import pAditivo from "@/assets/p-aditivo.png";
import pLarva from "@/assets/p-larva.png";
import pFertilizante from "@/assets/p-fertilizante.png";
import pVitamina from "@/assets/p-vitamina.png";
import provNlproinsu from "@/assets/proveedor-nlproinsu.png";
import provNaturalstar from "@/assets/proveedor-naturalstar.png";
import provBlueweight from "@/assets/proveedor-blueweight.png";
import provLacolina from "@/assets/proveedor-lacolina.png";
import provLarviva from "@/assets/proveedor-larviva.png";
import provBiomar from "@/assets/proveedor-biomar.png";

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
  { icon: Wheat, name: "Alimentos", desc: "Balanceados premium para cada etapa de cultivo", count: "20+ productos" },
  { icon: Sprout, name: "Fertilizantes", desc: "Nutrientes que potencian la productividad de tus piscinas", count: "12+ productos" },
  { icon: FlaskConical, name: "Aditivos", desc: "Probióticos, vitaminas y mejoradores de rendimiento", count: "15+ productos" },
  { icon: Beaker, name: "Insumos", desc: "Equipos y químicos para el manejo diario", count: "30+ productos" },
];

type FeaturedItem = { id: string; slug: string | null; name: string; img: string };

const featuredFallback: FeaturedItem[] = [
  { id: "fb-1", slug: null, name: "Balanceado Engorde", img: pBalanceado },
  { id: "fb-2", slug: null, name: "Aceite de Pescado", img: pAceite },
  { id: "fb-3", slug: null, name: "Aditivo Probiótico", img: pAditivo },
  { id: "fb-4", slug: null, name: "Alimento Larva", img: pLarva },
  { id: "fb-5", slug: null, name: "Fertilizante Mineral", img: pFertilizante },
  { id: "fb-6", slug: null, name: "Vitaminas Premix", img: pVitamina },
];

const supplierLogos = [
  { name: "NLProinsu", img: provNlproinsu },
  { name: "NaturalStar", img: provNaturalstar },
  { name: "Blueweight", img: provBlueweight },
  { name: "La Colina", img: provLacolina },
  { name: "Larviva", img: provLarviva },
  { name: "BioMar", img: provBiomar },
];

function Index() {
  const [featured, setFeatured] = useState<FeaturedItem[]>(featuredFallback);
  const mobileAutoplay = useRef(
    Autoplay({ delay: 2200, stopOnInteraction: false, stopOnMouseEnter: false })
  );
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, slug, name, image_url")
      .eq("active", true)
      .eq("featured", true)
      .order("display_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setFeatured(
            data
              .map((p) => ({ id: p.id, slug: p.slug, name: p.name, img: p.image_url || "" }))
              .filter((p) => p.img)
          );
        }
      });
  }, []);

  // Mobile: resaltar la tarjeta más cercana al centro de la pantalla
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) return;

    let raf = 0;
    let lastTick = 0;
    let lastClosest: HTMLElement | null = null;
    const tick = () => {
      const now = performance.now();
      if (now - lastTick < 100) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastTick = now;
      const container = marqueeRef.current;
      if (container) {
        const items = container.querySelectorAll<HTMLElement>(".marquee-item");
        const centerX = window.innerWidth / 2;
        let closest: HTMLElement | null = null;
        let minDist = Infinity;
        items.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.right < 0 || r.left > window.innerWidth) return;
          const dist = Math.abs(r.left + r.width / 2 - centerX);
          if (dist < minDist) {
            minDist = dist;
            closest = el;
          }
        });
        if (closest !== lastClosest) {
          if (lastClosest) lastClosest.classList.remove("is-centered");
          if (closest) (closest as HTMLElement).classList.add("is-centered");
          lastClosest = closest;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [featured]);

  // Repetimos el array suficientes veces para garantizar loop infinito sin saltos
  // incluso cuando hay pocos productos destacados
  const minItems = 12;
  const featuredRepeats = Math.max(2, Math.ceil(minItems / Math.max(featured.length, 1)));
  const carouselItems = Array.from({ length: featuredRepeats }, () => featured).flat();
  const supplierRepeats = Math.max(2, Math.ceil(minItems / supplierLogos.length));
  const supplierItems = Array.from({ length: supplierRepeats }, () => supplierLogos).flat();

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
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-ocean mb-3">Categorías</p>
            <h2 className="text-4xl md:text-5xl font-bold text-navy-deep mb-4">Líneas de producto</h2>
            <p className="text-muted-foreground text-lg">
              Descubre nuestro catálogo organizado por categorías para encontrar exactamente lo que tu camaronera necesita.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {categories.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative"
              >
                <Link to="/productos" className="block h-full">
                  <div className="absolute -inset-0.5 gradient-wave rounded-2xl opacity-0 group-hover:opacity-60 blur transition duration-500" />
                  <div className="relative h-full bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center hover:border-ocean transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-elegant overflow-hidden">
                    {/* decorative wave bg */}
                    <div className="absolute inset-x-0 -top-12 h-24 bg-gradient-to-b from-ocean/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />

                    <div className="relative w-20 h-20 rounded-2xl gradient-wave flex items-center justify-center shadow-glow mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <c.icon className="w-10 h-10 text-white" strokeWidth={1.6} />
                    </div>
                    <span className="font-bold text-lg text-navy-deep mb-1">{c.name}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-ocean mb-3">{c.count}</span>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{c.desc}</p>
                    <div className="mt-4 inline-flex items-center gap-1 text-ocean font-semibold text-sm opacity-0 group-hover:opacity-100 group-hover:gap-2 transition-all duration-300">
                      Explorar <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS — carrusel automático, sueltos sin caja */}
      <section className="relative py-24 bg-foam overflow-hidden">
        {/* fondo decorativo inmersivo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-ocean/10 blur-3xl animate-float-slow" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-turquoise/15 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/3 left-1/2 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 mb-14">
          <div className="text-center max-w-2xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-ocean mb-3"
            >
              <span className="w-8 h-px bg-ocean" /> Destacados <span className="w-8 h-px bg-ocean" />
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-navy-deep mb-4"
            >
              Productos más <span className="text-gradient">vendidos</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg"
            >
              Los favoritos de los camaroneros ecuatorianos, seleccionados por calidad y rendimiento.
            </motion.p>
          </div>
        </div>

        <div className="relative w-full">
          {/* Marquee automático (mismo efecto en mobile y desktop) */}
          <div className="relative">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 md:w-24 z-10 bg-gradient-to-r from-foam to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 md:w-24 z-10 bg-gradient-to-l from-foam to-transparent" />
            <div
              ref={marqueeRef}
              className="flex gap-12 w-max animate-marquee hover:[animation-play-state:paused]"
            >
              {carouselItems.map((p, i) => (
                <Link
                  key={`${p.name}-${i}`}
                  to="/productos/$productId"
                  params={{ productId: p.slug || p.id }}
                  className="marquee-item group flex flex-col items-center w-56 shrink-0 cursor-pointer"
                >
                  <div className="relative w-56 h-56 flex items-center justify-center">
                    {/* Fondo circular suave que actúa como "marco" sin recortar la imagen */}
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white via-foam to-ocean/10 shadow-inner" />
                    <div className="absolute inset-4 rounded-full gradient-wave opacity-0 group-hover:opacity-40 blur-2xl transition-all duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-ocean/0 group-hover:border-ocean/30 group-hover:rotate-180 transition-all duration-1000" />
                    <img
                      src={p.img}
                      alt={p.name}
                      loading="lazy"
                      className="relative max-h-full max-w-full object-contain drop-shadow-2xl group-hover:scale-125 group-hover:-translate-y-2 group-hover:-rotate-3 transition-all duration-500"
                      style={{ filter: "drop-shadow(0 20px 30px oklch(0.22 0.1 258 / 0.25))" }}
                    />
                  </div>
                  <p className="mt-4 font-semibold text-navy-deep text-center group-hover:text-ocean transition-colors">{p.name}</p>
                  <span className="destacado-label text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">Destacado ⭐</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="relative text-center mt-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block"
          >
            <Link
              to="/productos"
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full gradient-wave text-white font-semibold shadow-glow hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              {/* shimmer effect */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000" />
              <span className="relative">Ver catálogo completo</span>
              <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
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
                key={`${s.name}-${i}`}
                whileHover={{ scale: 1.1, rotate: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
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
                    <div className="text-lg">grupovega.ec@outlook.com</div>
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
                href="https://maps.app.goo.gl/z8RTL5Aq4AhWzNMN8"
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
                src="https://www.google.com/maps?q=Garc%C3%ADa+Moreno+y+3+de+Noviembre+Pedernales+Manab%C3%AD+Ecuador&z=17&output=embed"
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