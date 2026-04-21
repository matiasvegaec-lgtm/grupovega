import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/cotizar")({
  head: () => ({
    meta: [
      { title: "Cotizar — AquaMar" },
      { name: "description", content: "Solicita una cotización personalizada para tu camaronera." },
      { property: "og:title", content: "Cotizar AquaMar" },
      { property: "og:description", content: "Cotización rápida y personalizada." },
    ],
  }),
  component: CotizarPage,
});

function CotizarPage() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);

  return (
    <Layout>
      <PageHero
        eyebrow="Cotización"
        title="Solicita tu cotización personalizada"
        description="Completa los siguientes pasos y recibirás una propuesta en menos de 24 horas."
      />

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          {!done && (
            <div className="flex justify-between mb-10">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${step >= s ? "gradient-wave text-white shadow-glow" : "bg-foam text-muted-foreground"}`}>
                    {s}
                  </div>
                  {s < 3 && <div className={`flex-1 h-1 mx-2 rounded ${step > s ? "gradient-wave" : "bg-foam"}`} />}
                </div>
              ))}
            </div>
          )}

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-3xl p-8 shadow-elegant"
          >
            {done ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-ocean mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-navy-deep mb-2">¡Cotización solicitada!</h3>
                <p className="text-muted-foreground">Un asesor se pondrá en contacto contigo pronto.</p>
              </div>
            ) : step === 1 ? (
              <>
                <h3 className="text-2xl font-bold text-navy-deep mb-6">Datos de tu camaronera</h3>
                <div className="space-y-4">
                  <input placeholder="Nombre de la empresa" className="w-full px-4 py-3 rounded-xl bg-foam border border-border focus:border-ocean focus:outline-none" />
                  <input placeholder="Ubicación (provincia)" className="w-full px-4 py-3 rounded-xl bg-foam border border-border focus:border-ocean focus:outline-none" />
                  <input type="number" placeholder="Hectáreas en producción" className="w-full px-4 py-3 rounded-xl bg-foam border border-border focus:border-ocean focus:outline-none" />
                </div>
              </>
            ) : step === 2 ? (
              <>
                <h3 className="text-2xl font-bold text-navy-deep mb-6">¿Qué necesitas?</h3>
                <div className="space-y-3">
                  {["Alimento balanceado", "Probióticos & aditivos", "Equipos de aireación", "Análisis de laboratorio", "Asesoría técnica"].map((p) => (
                    <label key={p} className="flex items-center gap-3 p-4 rounded-xl bg-foam hover:bg-foam/70 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 accent-ocean" />
                      <span className="text-navy-deep font-medium">{p}</span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-navy-deep mb-6">Tus datos de contacto</h3>
                <div className="space-y-4">
                  <input placeholder="Nombre completo" className="w-full px-4 py-3 rounded-xl bg-foam border border-border focus:border-ocean focus:outline-none" />
                  <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-xl bg-foam border border-border focus:border-ocean focus:outline-none" />
                  <input placeholder="Teléfono / WhatsApp" className="w-full px-4 py-3 rounded-xl bg-foam border border-border focus:border-ocean focus:outline-none" />
                </div>
              </>
            )}

            {!done && (
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(Math.max(1, step - 1))}
                  disabled={step === 1}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-navy-deep font-semibold disabled:opacity-40"
                >
                  <ArrowLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                  onClick={() => (step === 3 ? setDone(true) : setStep(step + 1))}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-wave text-white font-semibold shadow-glow"
                >
                  {step === 3 ? "Enviar" : "Siguiente"} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}