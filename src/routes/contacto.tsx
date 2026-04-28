import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Send, CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { usePageHero } from "@/hooks/usePageHero";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — Grupo Vega" },
      { name: "description", content: "Habla con nuestro equipo de Grupo Vega. Estamos en Pedernales, Manabí — Ecuador." },
      { property: "og:title", content: "Contacto Grupo Vega" },
      { property: "og:description", content: "Estamos cerca de tu camaronera." },
    ],
  }),
  component: ContactoPage,
});

const offices = [
  { city: "Pedernales (Matriz)", address: "Pedernales, Manabí", phone: "+593 99 773 8026" },
];

function ContactoPage() {
  const [sent, setSent] = useState(false);
  const heroBg = usePageHero("contacto");

  return (
    <Layout>
      <PageHero
        eyebrow="Contacto"
        title="Hablemos de tu camaronera"
        description="Nuestros asesores están listos para ayudarte. Respondemos en menos de 24 horas hábiles."
        backgroundImage={heroBg}
      />

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-3xl p-8 shadow-elegant"
            >
              {sent ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-ocean mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-navy-deep mb-2">¡Mensaje enviado!</h3>
                  <p className="text-muted-foreground">Te contactaremos pronto.</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                  className="space-y-5"
                >
                  <h3 className="text-2xl font-bold text-navy-deep mb-6">Envíanos un mensaje</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-navy-deep mb-2">Nombre</label>
                      <input required className="w-full px-4 py-3 rounded-xl bg-foam border border-border focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-deep mb-2">Empresa</label>
                      <input className="w-full px-4 py-3 rounded-xl bg-foam border border-border focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-deep mb-2">Email</label>
                    <input type="email" required className="w-full px-4 py-3 rounded-xl bg-foam border border-border focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-deep mb-2">Hectáreas</label>
                    <input type="number" className="w-full px-4 py-3 rounded-xl bg-foam border border-border focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-deep mb-2">Mensaje</label>
                    <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-foam border border-border focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20" />
                  </div>
                  <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl gradient-wave text-white font-semibold shadow-glow hover:scale-[1.02] transition">
                    Enviar mensaje <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="bg-card rounded-3xl p-8 shadow-card">
                <h3 className="text-2xl font-bold text-navy-deep mb-6">Información de contacto</h3>
                <div className="space-y-4">
                  <div className="flex gap-3"><Mail className="w-5 h-5 text-ocean shrink-0 mt-0.5" /><span className="text-muted-foreground">grupovega.ec@outlook.com</span></div>
                  <div className="flex gap-3"><Phone className="w-5 h-5 text-ocean shrink-0 mt-0.5" /><span className="text-muted-foreground">+593 99 773 8026</span></div>
                  <div className="flex gap-3"><MapPin className="w-5 h-5 text-ocean shrink-0 mt-0.5" /><span className="text-muted-foreground">Pedernales, Manabí — Ecuador</span></div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {offices.map((o) => (
                  <div key={o.city} className="bg-card rounded-2xl p-5 shadow-card hover:shadow-elegant transition">
                    <div className="w-10 h-10 rounded-lg gradient-wave flex items-center justify-center mb-3">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-navy-deep">{o.city}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{o.address}</p>
                    <p className="text-xs text-ocean font-semibold mt-2">{o.phone}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}