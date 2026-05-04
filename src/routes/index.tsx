import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Wheat, FlaskConical, Sprout, Beaker, MapPin, Phone, Mail, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { UnderwaterScene } from "@/components/UnderwaterScene";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
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
import { usePageHero } from "@/hooks/usePageHero";

function LazyMap() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!ref.current || show) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [show]);
  return (
    <div ref={ref} className="w-full h-full bg-muted">
      {show && (
        <iframe
          title="Ubicación Grupo Vega - Pedernales"
          src="https://www.google.com/maps?q=Garc%C3%ADa+Moreno+y+3+de+Noviembre+Pedernales+Manab%C3%ADa+Ecuador&z=17&output=embed"
          width="100%"
          height="100%"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full border-0"
        />
      )}
    </div>
  );
}

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
  { icon: Wheat, name: "Alimentos", desc: "Balanceados premium para cada etapa de cultivo", count: "20+ productos", categoria: "Alimentos" },
  { icon: Sprout, name: "Fertilizantes", desc: "Nutrientes que potencian la productividad de tus piscinas", count: "12+ productos", categoria: "Fertilizante" },
  { icon: FlaskConical, name: "Aditivos", desc: "Probióticos, vitaminas y mejoradores de rendimiento", count: "15+ productos", categoria: "Aditivos" },
  { icon: Beaker, name: "Insumos", desc: "Equipos y químicos para el manejo diario", count: "30+ productos", categoria: "Insumos" },
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

type SupplierLogo = { name: string; img: string; scale?: number };

const supplierLogosFallback: SupplierLogo[] = [
  { name: "NLProinsu", img: provNlproinsu },
  { name: "NaturalStar", img: provNaturalstar },
  { name: "Blueweight", img: provBlueweight },
  { name: "La Colina", img: provLacolina },
  { name: "Larviva", img: provLarviva },
  { name: "BioMar", img: provBiomar },
];

// Sirve versiones optimizadas (WebP + redimensionadas) para imágenes alojadas en Supabase Storage
// usando el endpoint de transformación. Para URLs externas o locales, devuelve la URL original.
function optimizedSupabaseImage(url: string, width: number, height?: number): string {
  if (!url || !url.includes("/storage/v1/object/public/")) return url;
  const transformed = url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  const params = new URLSearchParams();
  params.set("width", String(width));
  if (height) params.set("height", String(height));
  params.set("resize", "contain");
  params.set("quality", "75");
  return `${transformed}?${params.toString()}`;
}

function Index() {
  const [featured, setFeatured] = useState<FeaturedItem[]>(featuredFallback);
  const [supplierLogos, setSupplierLogos] = useState<SupplierLogo[]>([]);
  const homeHeroBg = usePageHero("home", heroImg);
  const mobileAutoplay = useRef(
    Autoplay({ delay: 2200, stopOnInteraction: false, stopOnMouseEnter: false })
  );
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [featuredApi, setFeaturedApi] = useState<CarouselApi | null>(null);
  const [featuredSelected, setFeaturedSelected] = useState(0);
  const [categoriesApi, setCategoriesApi] = useState<CarouselApi | null>(null);
  const [categoriesSelected, setCategoriesSelected] = useState(0);
  const categoriesAutoplay = useRef(
    Autoplay({ delay: 2600, stopOnInteraction: false, stopOnMouseEnter: false })
  );

  useEffect(() => {
    if (!featuredApi) return;
    const onSelect = () => setFeaturedSelected(featuredApi.selectedScrollSnap());
    onSelect();
    featuredApi.on("select", onSelect);
    featuredApi.on("reInit", onSelect);
    return () => {
      featuredApi.off("select", onSelect);
      featuredApi.off("reInit", onSelect);
    };
  }, [featuredApi]);

  useEffect(() => {
    if (!categoriesApi) return;
    const onSelect = () => setCategoriesSelected(categoriesApi.selectedScrollSnap());
    onSelect();
    categoriesApi.on("select", onSelect);
    categoriesApi.on("reInit", onSelect);
    return () => {
      categoriesApi.off("select", onSelect);
      categoriesApi.off("reInit", onSelect);
    };
  }, [categoriesApi]);

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

  // Cargar logos de marcas desde la base de datos (editables desde admin)
  useEffect(() => {
    supabase
      .from("supplier_logos")
      .select("name, image_url, display_scale")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setSupplierLogos(
          (data ?? []).map((s) => ({
            name: s.name,
            img: s.image_url,
            scale: (s as { display_scale?: number }).display_scale ?? 100,
          })),
        );
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
  // Para que el marquee infinito no muestre huecos, el contenido visible debe
  // ser EXACTAMENTE el set base duplicado (la animación traslada -50%).
  // 1) Construimos un set base con suficientes logos para llenar la pantalla.
  // 2) Lo duplicamos una sola vez para crear el loop sin saltos.
  const supplierBaseRepeats = Math.max(
    1,
    Math.ceil(minItems / Math.max(supplierLogos.length, 1)),
  );
  const supplierBase = Array.from({ length: supplierBaseRepeats }, () => supplierLogos).flat();
  const supplierItems = [...supplierBase, ...supplierBase];

  return (
    <Layout>
      {/* HERO */}
      <section className="relative min-h-[85vh] md:min-h-[80vh] flex items-center overflow-hidden gradient-deep">
        <div className="absolute inset-0">
          <img src={homeHeroBg} alt="" className="w-full h-full object-cover opacity-40" width={1920} height={1080} loading="eager" decoding="async" fetchPriority="high" />
          <div className="absolute inset-0 gradient-deep opacity-70" />
          {/* Difumina la línea de horizonte del fondo bajo el encabezado */}
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[oklch(0.12_0.08_258)] to-transparent" />
        </div>
        <UnderwaterScene />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-10 lg:px-8 pt-24 md:pt-28 pb-16 md:pb-20">
          <div className="max-w-3xl md:max-w-4xl md:mx-auto md:text-center lg:mx-0 lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-white/90 text-sm md:text-base mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-turquoise animate-pulse" />
              Insumos para la industria camaronera
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-7xl font-bold text-white leading-[1.05] mb-6"
            >
              Todo para tu <span className="text-gradient">camaronera</span> en un solo lugar
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl text-white/80 mb-8 max-w-2xl md:max-w-3xl md:mx-auto lg:mx-0 leading-relaxed"
            >
              Alimento balanceado, aceites, aditivos y más insumos premium con distribución en toda la costa ecuatoriana.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-4 md:justify-center lg:justify-start"
            >
              <Link
                to="/productos"
                className="group inline-flex items-center gap-2 px-7 md:px-8 py-4 md:py-5 rounded-full gradient-wave text-white font-semibold md:text-lg shadow-glow hover:scale-105 transition-transform"
              >
                Ver productos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                to="/contacto"
                className="inline-flex items-center gap-2 px-7 md:px-8 py-4 md:py-5 rounded-full glass text-white font-semibold md:text-lg hover:bg-white/20 transition"
              >
                Contáctanos
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-[-1px] left-0 right-0 leading-[0]">
          <svg viewBox="0 0 1440 120" className="block w-full h-auto" preserveAspectRatio="none">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L0,120Z" style={{ fill: "var(--background)" }} />
          </svg>
        </div>
      </section>

      {/* CATEGORÍAS — solo icono + nombre */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-8">
          <div className="text-center max-w-2xl md:max-w-3xl mx-auto mb-14 md:mb-16">
            <p className="text-sm md:text-base font-semibold uppercase tracking-widest text-ocean mb-3">Categorías</p>
            <h2 className="text-4xl md:text-6xl font-bold text-navy-deep mb-4">Líneas de producto</h2>
            <p className="text-muted-foreground text-lg md:text-xl">
              Descubre nuestro catálogo organizado por categorías para encontrar exactamente lo que tu camaronera necesita.
            </p>
          </div>
          {/* Desktop: grid 4 columnas */}
          <div className="hidden lg:grid grid-cols-4 gap-6 max-w-6xl mx-auto">
            {categories.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative"
              >
                <Link to="/productos" search={{ categoria: c.categoria }} className="block h-full">
                  <div className="absolute -inset-0.5 gradient-wave rounded-2xl opacity-0 group-hover:opacity-60 blur transition duration-500" />
                  <div className="relative h-full bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center hover:border-ocean transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-elegant overflow-hidden">
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

          {/* Mobile / Tablet: mismo carrusel, mayor ancho/escala en tablet */}
          <div className="lg:hidden max-w-md md:max-w-2xl mx-auto px-0 relative">
            <Carousel
              opts={{ align: "center", loop: true }}
              plugins={[categoriesAutoplay.current]}
              setApi={setCategoriesApi}
              className="relative"
            >
              <CarouselContent className="py-4">
                {categories.map((c, idx) => {
                  const isActive = idx === categoriesSelected;
                  return (
                    <CarouselItem key={c.name} className="basis-[70%] md:basis-[55%] flex justify-center">
                      <Link
                        to="/productos"
                        search={{ categoria: c.categoria }}
                        className={`group block h-full w-full transition-all duration-500 ease-out ${isActive ? "opacity-100" : "opacity-50"}`}
                      >
                        <div className="relative h-full bg-card border border-border rounded-2xl p-5 md:p-7 flex flex-col items-center text-center hover:border-ocean transition-all duration-300 overflow-hidden">
                          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl gradient-wave flex items-center justify-center shadow-glow mb-3 md:mb-4">
                            <c.icon className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={1.6} />
                          </div>
                          <span className="font-bold text-base md:text-lg text-navy-deep mb-1">{c.name}</span>
                          <span className="text-[11px] md:text-xs font-semibold uppercase tracking-wider text-ocean mb-2 md:mb-3">{c.count}</span>
                          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed flex-1">{c.desc}</p>
                        </div>
                      </Link>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="left-0 bg-card/95 border-ocean/30 text-ocean hover:bg-ocean hover:text-white shadow-md z-10" />
              <CarouselNext className="right-0 bg-card/95 border-ocean/30 text-ocean hover:bg-ocean hover:text-white shadow-md z-10" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS — carrusel automático, sueltos sin caja */}
      <section className="relative py-24 md:py-28 bg-foam overflow-hidden">
        {/* fondo decorativo inmersivo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-ocean/10 blur-3xl animate-float-slow" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-turquoise/15 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/3 left-1/2 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 md:px-10 lg:px-8 mb-14 md:mb-16">
          <div className="text-center max-w-2xl md:max-w-3xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-sm md:text-base font-semibold uppercase tracking-widest text-ocean mb-3"
            >
              <span className="w-8 h-px bg-ocean" /> Destacados <span className="w-8 h-px bg-ocean" />
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-navy-deep mb-4"
            >
              Productos más <span className="text-gradient">vendidos</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg md:text-xl"
            >
              Los favoritos de los camaroneros ecuatorianos, seleccionados por calidad y rendimiento.
            </motion.p>
          </div>
        </div>

        <div className="relative w-full">
          {/* Desktop: marquee continuo */}
          <div className="relative hidden lg:block">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-foam to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-foam to-transparent" />
            <div ref={marqueeRef} className="flex gap-12 w-max animate-marquee hover:[animation-play-state:paused]">
              {carouselItems.map((p, i) => (
                <Link key={`${p.name}-${i}`} to="/productos/$productId" params={{ productId: p.slug || p.id }} className="marquee-item group flex flex-col items-center w-56 shrink-0 cursor-pointer">
                  <div className="relative w-56 h-56 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-foam to-ocean/20 shadow-[0_10px_30px_-10px_rgba(0,80,140,0.25)] ring-1 ring-ocean/10" />
                    <div className="absolute inset-4 rounded-full gradient-wave opacity-0 group-hover:opacity-40 blur-2xl transition-all duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-ocean/0 group-hover:border-ocean/30 group-hover:rotate-180 transition-all duration-1000" />
                    <img src={p.img} alt={p.name} loading="lazy" className="relative z-10 w-44 h-44 object-contain group-hover:scale-110 group-hover:-translate-y-2 group-hover:-rotate-3 transition-all duration-500 drop-shadow-2xl" />
                  </div>
                  <p className="mt-4 text-base font-semibold text-navy-deep text-center group-hover:text-ocean transition-colors px-1">{p.name}</p>
                  <span className="destacado-label text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">Destacado ⭐</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile / Tablet: mismo carrusel, mayor ancho/escala en tablet */}
          <div className="lg:hidden max-w-md md:max-w-2xl mx-auto px-0 relative">
            <Carousel
              opts={{ align: "center", loop: true }}
              plugins={[mobileAutoplay.current]}
              setApi={setFeaturedApi}
              className="relative"
            >
              <CarouselContent className="py-6">
                {featured.map((p, idx) => {
                  const isActive = idx === featuredSelected;
                  return (
                    <CarouselItem key={p.id} className="basis-[60%] md:basis-[45%] flex justify-center">
                      <Link
                        to="/productos/$productId"
                        params={{ productId: p.slug || p.id }}
                        className={`group flex h-full flex-col items-center cursor-pointer transition-all duration-500 ease-out ${isActive ? "scale-110 opacity-100" : "scale-75 opacity-60"}`}
                      >
                        <div className="relative w-44 h-44 md:w-56 md:h-56 flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-foam to-ocean/20 shadow-[0_10px_30px_-10px_rgba(0,80,140,0.25)] ring-1 ring-ocean/10" />
                          <img src={p.img} alt={p.name} loading="lazy" className="relative z-10 w-36 h-36 md:w-44 md:h-44 object-contain drop-shadow-xl transition-transform duration-500" />
                        </div>
                        <p className="mt-3 text-sm md:text-base font-semibold text-navy-deep text-center px-1">{p.name}</p>
                        {isActive && <span className="text-xs text-muted-foreground mt-1">Destacado ⭐</span>}
                      </Link>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="left-0 bg-card/95 border-ocean/30 text-ocean hover:bg-ocean hover:text-white shadow-md z-10" />
              <CarouselNext className="right-0 bg-card/95 border-ocean/30 text-ocean hover:bg-ocean hover:text-white shadow-md z-10" />
            </Carousel>
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

      {/* PUNTO DE VENTA — info izquierda + mapa derecha */}
      <section className="py-12 md:py-20 gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative container mx-auto px-4 sm:px-6 md:px-10 lg:px-8">
          <div className="text-center max-w-2xl md:max-w-3xl mx-auto mb-8 md:mb-12">
            <p className="text-sm md:text-base font-semibold uppercase tracking-widest text-turquoise mb-2">Punto de venta</p>
            <h2 className="text-3xl md:text-5xl font-bold">Visítanos</h2>
          </div>

          <div className="grid lg:grid-cols-5 gap-6 items-stretch max-w-5xl mx-auto">
            {/* Info izquierda — más compacta */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass rounded-2xl p-6 md:p-7 flex flex-col justify-center lg:col-span-2"
            >
              <h3 className="text-xl md:text-2xl font-bold mb-1">Grupo Vega — Pedernales</h3>
              <p className="text-turquoise text-sm font-semibold mb-5">Sede principal y centro de distribución</p>

              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="shrink-0 w-9 h-9 rounded-lg gradient-wave flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white/60 text-xs uppercase tracking-widest font-semibold">Dirección</div>
                    <div className="text-sm leading-snug">García Moreno y 3 de Noviembre, frente al cementerio — Pedernales, Manabí</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="shrink-0 w-9 h-9 rounded-lg gradient-wave flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white/60 text-xs uppercase tracking-widest font-semibold">Teléfono</div>
                    <div className="text-sm">+593 99 773 8026</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="shrink-0 w-9 h-9 rounded-lg gradient-wave flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white/60 text-xs uppercase tracking-widest font-semibold">Email</div>
                    <div className="text-sm break-all">grupovega.ec@outlook.com</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="shrink-0 w-9 h-9 rounded-lg gradient-wave flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white/60 text-xs uppercase tracking-widest font-semibold">Horario</div>
                    <div className="text-sm">Lun – Vie: 8:00 – 18:00 · Sáb: 8:00 – 13:00</div>
                  </div>
                </li>
              </ul>

              <a
                href="https://maps.app.goo.gl/z8RTL5Aq4AhWzNMN8"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full gradient-wave text-white text-sm font-semibold shadow-glow hover:scale-105 transition w-fit"
              >
                Cómo llegar <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Mapa derecha — más pequeño */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl overflow-hidden shadow-elegant border border-white/20 lg:col-span-3 h-[240px] md:h-[280px] lg:h-auto lg:min-h-[320px]"
            >
              <LazyMap />
            </motion.div>
          </div>
        </div>
      </section>

      {/* PROVEEDORES — marquee con efectos por logo */}
      <section className="py-20 md:py-24 bg-background overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-8 mb-12 md:mb-14">
          <div className="text-center max-w-2xl md:max-w-3xl mx-auto">
            <p className="text-sm md:text-base font-semibold uppercase tracking-widest text-ocean mb-3">Proveedores</p>
            <h2 className="text-4xl md:text-6xl font-bold text-navy-deep">Marcas que distribuimos</h2>
            <p className="text-muted-foreground mt-4 md:text-lg">Trabajamos con los líderes mundiales en nutrición y sanidad acuícola.</p>
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
                    src={optimizedSupabaseImage(s.img, 400, 200)}
                    alt={s.name}
                    loading="lazy"
                    width={224}
                    height={112}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    style={{ transform: `scale(${(s.scale ?? 100) / 100})` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}