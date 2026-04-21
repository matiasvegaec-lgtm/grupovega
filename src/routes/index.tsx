import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Droplets, FlaskConical, Leaf, ShieldCheck, Truck, Award, ChevronRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { UnderwaterScene } from "@/components/UnderwaterScene";
import heroImg from "@/assets/hero-shrimp-farm.jpg";
import feedImg from "@/assets/product-feed.jpg";
import labImg from "@/assets/service-lab.jpg";
import equipImg from "@/assets/service-equipment.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AquaMar — Soluciones Integrales para Camaroneras del Ecuador" },
      { name: "description", content: "Alimento balanceado, probióticos, asesoría técnica y tecnología 4.0 para la industria camaronera." },
      { property: "og:title", content: "AquaMar — Industria Camaronera" },
      { property: "og:description", content: "Soluciones integrales para acuicultura de camarón." },
    ],
  }),
  component: Index,
});

const stats = [
  { value: "26+", label: "Años de experiencia" },
  { value: "850+", label: "Camaroneras atendidas" },
  { value: "120K", label: "Hectáreas asesoradas" },
  { value: "98%", label: "Satisfacción cliente" },
];

const categories = [
  { icon: Droplets, title: "Alimento Balanceado", desc: "Fórmulas premium para cada fase: larva, juvenil y engorde.", img: feedImg },
  { icon: FlaskConical, title: "Probióticos & Aditivos", desc: "Mejora la conversión alimenticia y la sanidad del cultivo.", img: labImg },
  { icon: Truck, title: "Equipos & Aireación", desc: "Tecnología de monitoreo y aireación para máxima productividad.", img: equipImg },
];

const features = [
  { icon: ShieldCheck, title: "Calidad certificada", desc: "Plantas con certificaciones BAP, ASC e ISO 9001." },
  { icon: Leaf, title: "Sostenibilidad", desc: "Procesos responsables con el ecosistema marino." },
  { icon: Award, title: "I+D continuo", desc: "Laboratorio propio y alianzas con universidades." },
];

function Index() {
  return (
    <Layout>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden gradient-deep">
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
              Líderes en industria camaronera del Ecuador
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6"
            >
              Cultivamos el futuro del{" "}
              <span className="text-gradient">camarón</span> ecuatoriano
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl leading-relaxed"
            >
              Insumos premium, asesoría técnica y tecnología 4.0 para maximizar la productividad y sostenibilidad de tu camaronera.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/cotizar"
                className="group inline-flex items-center gap-2 px-7 py-4 rounded-full gradient-wave text-white font-semibold shadow-glow hover:scale-105 transition-transform"
              >
                Solicitar cotización
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                to="/productos"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full glass text-white font-semibold hover:bg-white/20 transition"
              >
                Ver catálogo
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl"
            >
              {stats.map((s) => (
                <div key={s.label} className="glass rounded-2xl p-4 text-white">
                  <div className="text-3xl md:text-4xl font-bold text-gradient">{s.value}</div>
                  <div className="text-xs md:text-sm text-white/70 mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto" preserveAspectRatio="none">
            <path fill="hsl(var(--background))" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L0,120Z" style={{ fill: "var(--background)" }} />
          </svg>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-ocean mb-3">Nuestras soluciones</p>
            <h2 className="text-4xl md:text-5xl font-bold text-navy-deep">
              Todo lo que tu camaronera necesita
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Desde la siembra hasta la cosecha, te acompañamos con productos y servicios de clase mundial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-elegant transition-all duration-500 hover:-translate-y-2"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={c.img} alt={c.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl gradient-wave flex items-center justify-center shadow-glow">
                  <c.icon className="w-6 h-6 text-white" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-navy-deep mb-2">{c.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{c.desc}</p>
                  <Link to="/productos" className="inline-flex items-center gap-1 mt-4 text-ocean font-semibold text-sm group/link">
                    Explorar <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-turquoise mb-3">Por qué AquaMar</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Más de 26 años cultivando confianza
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-8">
                Somos el aliado estratégico de las camaroneras más productivas del Ecuador. Combinamos investigación, tecnología y servicio en campo.
              </p>
              <div className="space-y-4">
                {features.map((f) => (
                  <div key={f.title} className="flex gap-4 group">
                    <div className="shrink-0 w-12 h-12 rounded-xl glass flex items-center justify-center group-hover:scale-110 transition">
                      <f.icon className="w-6 h-6 text-turquoise" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{f.title}</h4>
                      <p className="text-white/70 text-sm">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 gradient-wave rounded-3xl blur-3xl opacity-40 animate-pulse" />
              <div className="relative aspect-square glass rounded-3xl p-8 flex items-center justify-center animate-float-slow">
                <div className="text-center">
                  <div className="text-7xl md:text-8xl font-bold text-gradient mb-2">98%</div>
                  <div className="text-xl font-semibold mb-1">Satisfacción</div>
                  <div className="text-white/70 text-sm">de nuestros clientes camaroneros</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 bg-foam">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-card rounded-3xl p-10 md:p-16 shadow-elegant overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 gradient-wave rounded-full opacity-20 blur-3xl" />
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-navy-deep mb-4">
                  ¿Listo para llevar tu producción al siguiente nivel?
                </h2>
                <p className="text-muted-foreground text-lg">
                  Habla con un asesor técnico hoy y recibe un diagnóstico gratuito de tu operación.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 md:justify-end">
                <Link to="/contacto" className="inline-flex items-center gap-2 px-7 py-4 rounded-full gradient-wave text-white font-semibold shadow-glow hover:scale-105 transition">
                  Contáctanos <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/cotizar" className="inline-flex items-center gap-2 px-7 py-4 rounded-full border-2 border-navy-deep text-navy-deep font-semibold hover:bg-navy-deep hover:text-white transition">
                  Cotizar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
