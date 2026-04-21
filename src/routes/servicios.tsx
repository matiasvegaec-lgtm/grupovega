import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FlaskConical, Users, Satellite, GraduationCap, ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import labImg from "@/assets/service-lab.jpg";
import equipImg from "@/assets/service-equipment.jpg";

export const Route = createFileRoute("/servicios")({
  head: () => ({
    meta: [
      { title: "Servicios — AquaMar" },
      { name: "description", content: "Asesoría técnica, análisis de laboratorio, monitoreo satelital y capacitaciones para camaroneras." },
      { property: "og:title", content: "Servicios AquaMar" },
      { property: "og:description", content: "Soluciones integrales para tu producción." },
    ],
  }),
  component: ServiciosPage,
});

const services = [
  {
    icon: Users,
    title: "Asesoría técnica en campo",
    desc: "Equipo de biólogos e ingenieros acuícolas en tu camaronera diagnosticando y optimizando cada ciclo.",
    img: equipImg,
  },
  {
    icon: FlaskConical,
    title: "Análisis de laboratorio",
    desc: "Análisis de agua, suelo, y diagnóstico molecular (PCR) de WSSV, EMS, EHP y más.",
    img: labImg,
  },
  {
    icon: Satellite,
    title: "Monitoreo satelital",
    desc: "Plataforma 4.0 con sensores IoT, drones y satélite para monitoreo en tiempo real.",
    img: equipImg,
  },
  {
    icon: GraduationCap,
    title: "Capacitaciones",
    desc: "Programas de formación para personal técnico y operativo en mejores prácticas.",
    img: labImg,
  },
];

function ServiciosPage() {
  return (
    <Layout>
      <PageHero
        eyebrow="Servicios"
        title="Más que productos: somos tu socio técnico"
        description="Acompañamos a tu camaronera con un equipo multidisciplinario y tecnología de punta."
      />

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""}`}
            >
              <div className="relative">
                <div className="absolute inset-0 gradient-wave rounded-3xl blur-2xl opacity-20" />
                <img src={s.img} alt={s.title} loading="lazy" className="relative rounded-3xl shadow-elegant w-full aspect-[4/3] object-cover" />
                <div className="absolute -top-6 -left-6 w-16 h-16 rounded-2xl gradient-wave flex items-center justify-center shadow-glow">
                  <s.icon className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-ocean mb-3">Servicio {String(i + 1).padStart(2, "0")}</p>
                <h3 className="text-3xl md:text-4xl font-bold text-navy-deep mb-4">{s.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">{s.desc}</p>
                <Link to="/contacto" className="inline-flex items-center gap-2 text-ocean font-semibold hover:gap-3 transition-all">
                  Solicitar este servicio <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
}