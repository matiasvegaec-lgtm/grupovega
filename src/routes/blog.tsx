import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import labImg from "@/assets/service-lab.jpg";
import equipImg from "@/assets/service-equipment.jpg";
import feedImg from "@/assets/product-feed.jpg";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — AquaMar" },
      { name: "description", content: "Artículos técnicos sobre cultivo de camarón, sanidad, nutrición y mercado internacional." },
      { property: "og:title", content: "Blog AquaMar" },
      { property: "og:description", content: "Conocimiento técnico para camaroneras." },
    ],
  }),
  component: BlogPage,
});

const posts = [
  { title: "Estrategias para prevenir la mancha blanca (WSSV) en 2026", date: "15 Mar 2026", category: "Sanidad", img: labImg },
  { title: "Optimización del FCR con probióticos de nueva generación", date: "02 Mar 2026", category: "Nutrición", img: feedImg },
  { title: "IoT y monitoreo: la camaronera del futuro hoy", date: "20 Feb 2026", category: "Tecnología", img: equipImg },
  { title: "Mercado internacional del camarón ecuatoriano: perspectivas 2026", date: "10 Feb 2026", category: "Mercado", img: equipImg },
  { title: "Manejo de aguas en sistemas de alta densidad", date: "28 Ene 2026", category: "Manejo", img: labImg },
  { title: "Certificación BAP: paso a paso para camaroneras medianas", date: "12 Ene 2026", category: "Certificación", img: feedImg },
];

function BlogPage() {
  return (
    <Layout>
      <PageHero
        eyebrow="Conocimiento"
        title="Blog técnico de la industria camaronera"
        description="Artículos, casos de éxito y análisis de mercado por nuestro equipo de expertos."
      />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((p, i) => (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-all hover:-translate-y-2 cursor-pointer"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={p.img} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="px-2 py-1 rounded-full bg-foam text-ocean font-semibold">{p.category}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {p.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-navy-deep mb-3 group-hover:text-ocean transition leading-snug">{p.title}</h3>
                  <span className="inline-flex items-center gap-1 text-ocean text-sm font-semibold">
                    Leer más <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}