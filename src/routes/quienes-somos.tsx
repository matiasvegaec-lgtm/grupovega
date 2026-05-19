import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf, ShieldCheck, Target, Layers, Globe2, Award, Users, Sparkles, Anchor } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { usePageHero } from "@/hooks/usePageHero";

export const Route = createFileRoute("/quienes-somos")({
  head: () => ({
    meta: [
      { title: "Quiénes Somos — Grupo Vega" },
      {
        name: "description",
        content:
          "Conoce a Grupo Vega: principios, política de calidad, divisiones y mercados que servimos en la industria camaronera.",
      },
      { property: "og:title", content: "Quiénes Somos — Grupo Vega" },
      {
        property: "og:description",
        content: "Soluciones integrales para acuicultura de camarón en Ecuador y Latinoamérica.",
      },
      { property: "og:url", content: "https://grupovega.lovable.app/quienes-somos" },
    ],
    links: [
      { rel: "canonical", href: "https://grupovega.lovable.app/quienes-somos" },
    ],
  }),
  component: QuienesSomosPage,
});

type CompanyImage = { id: string; image_url: string; caption: string | null };

const stats = [
  { value: "5000+", label: "​VENTAS EN PRODUCTOS" },
  { value: "50+", label: "PRODUCTOS Y MARCAS" },
  { value: "1,200+", label: "HECTÁREAS ASESORADAS" },
  { value: "30+", label: "​CLIENTES POTENCIALES" },
];

const highlights = [
  { icon: Award, title: "Calidad certificada", text: "Procesos auditados y mejora continua en cada lote." },
  { icon: Users, title: "Equipo técnico", text: "Profesionales con experiencia en cultivos camaroneros." },
  { icon: Sparkles, title: "Innovación constante", text: "Probióticos, minerales y tecnología de punta." },
  { icon: Anchor, title: "Cobertura nacional", text: "Distribuimos a las principales zonas camaroneras." },
];

function QuienesSomosPage() {
  const [images, setImages] = useState<CompanyImage[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("company_images")
        .select("id, image_url, caption")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (mounted && data) setImages(data as CompanyImage[]);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-rotación de imagen cada 4.5s
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [images.length]);

  const activeImage = useMemo(() => images[activeIdx], [images, activeIdx]);
  const heroBg = usePageHero("quienes-somos");

  return (
    <Layout>
      <PageHero
        eyebrow="Quiénes Somos"
        title="Comprometidos con la acuicultura ecuatoriana"
        description="Somos Grupo Vega: insumos, asesoría técnica y tecnología para que tu camaronera produzca más y mejor."
        backgroundImage={heroBg}
      />

      {/* Sección "¿Por qué elegirnos?" — info izquierda + imagen rotativa derecha */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative grid lg:grid-cols-2 gap-12 items-center">
          {/* Columna info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-navy-deep"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ocean mb-4">¿Por qué elegirnos?</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl leading-tight mb-4 font-extralight">
              Compromiso de nuestra empresa
            </h2>
            <div className="w-16 h-1 rounded-full bg-ocean mb-6" />
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
              Estamos comprometidos en entregar a los acuicultores y a la industria productos y herramientas que
              faciliten los procesos de producción y garanticen resultados eficientes.
            </p>

            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
              {highlights.map((h, i) => {
                const Icon = h.icon;
                return (
                  <motion.div
                    key={h.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl border border-border flex items-center justify-center bg-foam">
                      <Icon className="w-5 h-5 text-ocean" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-deep text-sm md:text-base mb-1">{h.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{h.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Columna imagen rotativa */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] md:aspect-[4/4] rounded-3xl overflow-hidden shadow-elegant ring-1 ring-border bg-foam">
              {activeImage ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage.id}
                    src={activeImage.image_url}
                    alt={activeImage.caption ?? "Grupo Vega"}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.9, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-border m-4 rounded-2xl">
                  <div className="text-center px-6">
                    <p>Sube imágenes desde el panel administrativo</p>
                    <p className="text-xs mt-2 opacity-60">(Galería)</p>
                  </div>
                </div>
              )}

              {activeImage?.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/60 to-transparent p-5">
                  <p className="text-white text-sm md:text-base font-medium">{activeImage.caption}</p>
                </div>
              )}
            </div>

            {/* Indicadores */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2 mt-5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    aria-label={`Ver imagen ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeIdx ? "w-8 bg-ocean" : "w-1.5 bg-border hover:bg-muted-foreground/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Principios, Política, Objetivos */}
      <section className="py-20 bg-foam">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-10">
          {[
            {
              icon: Leaf,
              title: "Principios y Valores",
              text: "Nos basamos en principios éticos, morales y de responsabilidad ante la sociedad y el medio ambiente, mediante la aplicación y mejoramiento continuo.",
            },
            {
              icon: ShieldCheck,
              title: "Política de Calidad",
              text: "Somos una organización dedicada a la importación, comercialización y distribución de insumos para acuicultura. Mejoramos continuamente nuestros procesos para satisfacer a nuestros clientes y cumplir con la legislación ecuatoriana vigente.",
            },
            {
              icon: Target,
              title: "Objetivos de Calidad",
              text: "• Mejorar la satisfacción de clientes externos e internos.\n• Mejorar la calidad de nuestro servicio de ventas y distribución.\n• Brindar servicio técnico de calidad a nuestros clientes.",
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card rounded-3xl p-8 shadow-card"
              >
                <div className="w-12 h-12 rounded-2xl gradient-wave flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-ocean mb-2">{item.title}</h3>
                <div className="w-12 h-1 rounded-full bg-turquoise mb-4" />
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{item.text}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Divisiones */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-wave mb-6">
            <Layers className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-ocean mb-6">DIVISIONES</h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Estamos enfocados en atender los requerimientos del sector camaronero ecuatoriano desde diferentes campos de
            acción. Nuestras actividades comprenden insumos químicos y biológicos, alimento balanceado, equipos de
            oxigenación, asesoría técnica especializada y soluciones tecnológicas para la producción acuícola.
          </p>
        </div>
      </section>

      {/* Mercados */}
      <section className="py-20 bg-foam">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-wave mb-6">
            <Globe2 className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-ocean mb-6">MERCADOS SERVIDOS</h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Grupo Vega opera en el mercado camaronero ecuatoriano ofreciendo a sus clientes una extensa línea de
            productos para mejorar su productividad: desde probióticos, minerales y alimento balanceado hasta equipos y
            servicio técnico para todo el ciclo del camarón.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 gradient-wave">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white max-w-5xl mx-auto justify-items-center">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="text-4xl md:text-5xl font-bold mb-1">{s.value}</div>
                <div className="text-[11px] md:text-xs font-semibold tracking-widest opacity-90 text-justify">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
