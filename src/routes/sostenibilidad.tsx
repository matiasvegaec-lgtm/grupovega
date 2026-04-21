import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Leaf, Droplet, Recycle, Sun } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/sostenibilidad")({
  head: () => ({
    meta: [
      { title: "Sostenibilidad — AquaMar" },
      { name: "description", content: "Compromiso con prácticas responsables, huella de carbono y cuidado del ecosistema marino." },
      { property: "og:title", content: "Sostenibilidad AquaMar" },
      { property: "og:description", content: "Acuicultura responsable y sostenible." },
    ],
  }),
  component: SostenibilidadPage,
});

const pillars = [
  { icon: Leaf, title: "Manglares protegidos", value: "1,200 ha", desc: "Reforestadas en alianza con comunidades costeras." },
  { icon: Droplet, title: "Agua reutilizada", value: "65%", desc: "De los efluentes son tratados y reutilizados." },
  { icon: Recycle, title: "Empaque reciclable", value: "100%", desc: "De nuestros sacos son reciclables o biodegradables." },
  { icon: Sun, title: "Energía solar", value: "40%", desc: "De nuestras plantas operan con energía renovable." },
];

function SostenibilidadPage() {
  return (
    <Layout>
      <PageHero
        eyebrow="Sostenibilidad"
        title="Cuidamos el océano que nos da vida"
        description="Cada decisión que tomamos busca equilibrio entre productividad y respeto por el ecosistema."
      />

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center bg-card rounded-2xl p-8 shadow-card hover:shadow-elegant transition"
              >
                <div className="mx-auto w-16 h-16 rounded-2xl gradient-wave flex items-center justify-center mb-4 shadow-glow">
                  <p.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gradient mb-2">{p.value}</div>
                <h3 className="font-bold text-navy-deep mb-2">{p.title}</h3>
                <p className="text-muted-foreground text-sm">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 gradient-hero text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Certificaciones internacionales</h2>
          <p className="text-white/80 text-lg mb-10">Cumplimos los estándares más exigentes del mundo en acuicultura responsable.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {["BAP", "ASC", "ISO 9001", "ISO 14001", "GlobalGAP"].map((c) => (
              <div key={c} className="px-6 py-3 glass rounded-full font-semibold">{c}</div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}