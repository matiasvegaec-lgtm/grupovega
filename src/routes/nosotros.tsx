import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Target, Eye, Heart, Award } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/nosotros")({
  head: () => ({
    meta: [
      { title: "Nosotros — AquaMar" },
      { name: "description", content: "Más de 26 años impulsando la industria camaronera del Ecuador con innovación y compromiso." },
      { property: "og:title", content: "Nosotros — AquaMar" },
      { property: "og:description", content: "Conoce nuestra historia, misión y valores." },
    ],
  }),
  component: NosotrosPage,
});

const values = [
  { icon: Target, title: "Misión", desc: "Proveer soluciones integrales que potencien la productividad y rentabilidad de las camaroneras del Ecuador y Latinoamérica." },
  { icon: Eye, title: "Visión", desc: "Ser la empresa líder en innovación y sostenibilidad para la acuicultura en la región." },
  { icon: Heart, title: "Valores", desc: "Integridad, excelencia, compromiso con el cliente y respeto por el ecosistema marino." },
  { icon: Award, title: "Calidad", desc: "Certificaciones internacionales BAP, ASC e ISO 9001 que respaldan nuestros procesos." },
];

const timeline = [
  { year: "1998", title: "Fundación", desc: "Iniciamos operaciones en Guayaquil con un pequeño laboratorio." },
  { year: "2005", title: "Primera planta", desc: "Inauguramos nuestra primera planta de alimento balanceado." },
  { year: "2012", title: "Expansión nacional", desc: "Cobertura completa en Guayas, El Oro, Manabí y Esmeraldas." },
  { year: "2018", title: "Certificaciones globales", desc: "Obtenemos BAP y ASC, posicionándonos como referente." },
  { year: "2024", title: "Tecnología 4.0", desc: "Lanzamos plataforma de monitoreo satelital y IA aplicada." },
];

function NosotrosPage() {
  return (
    <Layout>
      <PageHero
        eyebrow="Sobre nosotros"
        title="Cultivando el futuro de la acuicultura"
        description="Desde 1998 acompañamos a las camaroneras ecuatorianas con productos, ciencia y servicio de excelencia."
      />

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group bg-card p-6 rounded-2xl shadow-card hover:shadow-elegant transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 gradient-wave rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-glow">
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-navy-deep mb-2">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 gradient-deep text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-turquoise mb-3">Nuestra historia</p>
            <h2 className="text-4xl md:text-5xl font-bold">26 años de evolución constante</h2>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 gradient-wave" />
            {timeline.map((t, i) => (
              <motion.div
                key={t.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`relative pl-12 md:pl-0 mb-12 md:grid md:grid-cols-2 md:gap-12 ${i % 2 === 0 ? "" : "md:[&>div:first-child]:order-2"}`}
              >
                <div className={`md:text-right ${i % 2 !== 0 ? "md:text-left" : ""}`}>
                  <div className="absolute left-0 md:left-1/2 -translate-x-1/2 md:-translate-x-1/2 top-2 w-8 h-8 rounded-full gradient-wave flex items-center justify-center shadow-glow ring-4 ring-navy-deep">
                    <span className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <div className="text-3xl font-bold text-gradient mb-1">{t.year}</div>
                  <h3 className="text-xl font-semibold mb-2">{t.title}</h3>
                  <p className="text-white/70 text-sm">{t.desc}</p>
                </div>
                <div />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}