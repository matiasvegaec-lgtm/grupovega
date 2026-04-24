import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Leaf, ShieldCheck, Target, Layers, Globe2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/quienes-somos")({
  head: () => ({
    meta: [
      { title: "Quiénes Somos — Grupo Vega" },
      { name: "description", content: "Conoce a Grupo Vega: principios, política de calidad, divisiones y mercados que servimos en la industria camaronera." },
      { property: "og:title", content: "Quiénes Somos — Grupo Vega" },
      { property: "og:description", content: "Soluciones integrales para acuicultura de camarón en Ecuador y Latinoamérica." },
    ],
  }),
  component: QuienesSomosPage,
});

type CompanyImage = { id: string; image_url: string; caption: string | null };

const stats = [
  { value: "30+", label: "AÑOS DE EXPERIENCIA" },
  { value: "500+", label: "CLIENTES ATENDIDOS" },
  { value: "1,200+", label: "HECTÁREAS ASESORADAS" },
  { value: "50+", label: "PRODUCTOS" },
  { value: "24/7", label: "SOPORTE TÉCNICO" },
];

function QuienesSomosPage() {
  const [images, setImages] = useState<CompanyImage[]>([]);

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
    return () => { mounted = false; };
  }, []);

  // Duplicamos para loop continuo
  const carouselImages = images.length > 0 ? [...images, ...images] : [];

  return (
    <Layout>
      <PageHero
        eyebrow="Quiénes Somos"
        title="Comprometidos con la acuicultura ecuatoriana"
        description="Somos Grupo Vega: insumos, asesoría técnica y tecnología para que tu camaronera produzca más y mejor."
      />

      {/* Carrusel automático */}
      <section className="py-16 bg-background overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-ocean mb-3">Nuestra empresa</p>
          <h2 className="text-3xl md:text-4xl font-bold text-navy-deep">Momentos que nos definen</h2>
        </div>

        {carouselImages.length > 0 ? (
          <div className="relative">
            <div className="flex gap-6 animate-marquee w-max">
              {carouselImages.map((img, idx) => (
                <figure
                  key={`${img.id}-${idx}`}
                  className="w-[280px] md:w-[380px] aspect-[4/3] rounded-3xl overflow-hidden shadow-elegant ring-1 ring-border bg-card flex-shrink-0 relative group"
                >
                  <img
                    src={img.image_url}
                    alt={img.caption ?? "Grupo Vega"}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {img.caption && (
                    <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy-deep/90 to-transparent text-white text-sm font-medium p-4">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border-2 border-dashed border-border p-12 text-center text-muted-foreground">
              <p className="text-sm">Aún no hay imágenes en el carrusel.</p>
              <p className="text-xs mt-2">Sube fotos desde el panel administrativo.</p>
            </div>
          </div>
        )}
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
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {item.text}
                </p>
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
            Estamos enfocados en atender los requerimientos del sector camaronero ecuatoriano desde diferentes campos de acción.
            Nuestras actividades comprenden insumos químicos y biológicos, alimento balanceado, equipos de oxigenación,
            asesoría técnica especializada y soluciones tecnológicas para la producción acuícola.
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
            Grupo Vega opera en el mercado camaronero ecuatoriano ofreciendo a sus clientes una extensa línea de productos
            para mejorar su productividad: desde probióticos, minerales y alimento balanceado hasta equipos y servicio técnico
            para todo el ciclo del camarón.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 gradient-wave">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center text-white">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="text-4xl md:text-5xl font-bold mb-1">{s.value}</div>
                <div className="text-[11px] md:text-xs font-semibold tracking-widest opacity-90">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}