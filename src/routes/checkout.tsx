import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, FormEvent, useEffect } from "react";
import { Loader2, CreditCard, ShoppingBag, Building2, Banknote, Send, Lock, Clock, ChevronLeft, ChevronRight, Check, User, MapPin, Wallet, FileText } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Checkout — Grupo Vega" },
      { name: "description", content: "Completa tus datos y elige tu método de pago." },
    ],
  }),
  component: CheckoutPage,
});

const WHATSAPP_EMPRESA = "593997738026";
const SUCURSAL = {
  direccion: "Av. Principal y Secundaria, Guayaquil",
  horario: "Lunes a Sábado, 8:30 am – 6:00 pm",
};
const BANCO_DEMO = {
  banco: "Banco Pichincha",
  tipo: "Cuenta Corriente",
  numero: "2100XXXXXX",
  titular: "Grupo Vega S.A.",
  ruc: "1790XXXXXX001",
  correo: "pagos@grupovega.com",
};

const buildWhatsAppUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_EMPRESA}?text=${encodeURIComponent(message)}`;

type PayMethod = "card" | "transfer" | "cash" | "quote";

const CUSTOMER_STORAGE_KEY = "gv_customer_data_v1";

type StepKey = "customer" | "shipping" | "payment";
const STEPS: { key: StepKey; label: string; icon: any }[] = [
  { key: "customer", label: "Datos", icon: User },
  { key: "shipping", label: "Entrega", icon: MapPin },
  { key: "payment", label: "Pago", icon: Wallet },
];

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState<PayMethod>("transfer");
  const [saveData, setSaveData] = useState(true);
  const [step, setStep] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    customer_name: "",        // nombres y apellidos
    receiver_name: "",        // quien recibe
    customer_ruc: "",
    customer_email: "",
    customer_phone: "",
    farm_name: "",            // camaronera / lugar
    reference: "",            // referencia
    shipping_notes: "",
  });

  // Bloquear si no hay sesión
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth", search: { redirect: "/checkout" } as any });
    }
  }, [user, authLoading, navigate]);

  // Cargar datos guardados desde Supabase (perfil) + fallback localStorage + email del usuario
  useEffect(() => {
    if (typeof window === "undefined") return;
    // 1. Fallback inmediato desde localStorage para UX
    try {
      const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm((f) => ({ ...f, ...parsed }));
      }
    } catch {}
    if (user?.email) {
      setForm((f) => (f.customer_email ? f : { ...f, customer_email: user.email! }));
    }
    // 2. Cargar perfil desde Supabase (fuente de verdad)
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, address, city, province, postal_code")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!data) return;
      setForm((f) => ({
        ...f,
        customer_name: f.customer_name || data.full_name || "",
        customer_phone: f.customer_phone || data.phone || "",
        farm_name: f.farm_name || data.address || "",
        reference: f.reference || data.city || "",
      }));
    })();
  }, [user]);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validateStep = (idx: number): boolean => {
    const e: Record<string, string> = {};
    if (idx === 0) {
      if (!form.customer_name.trim()) e.customer_name = "Requerido";
      if (!form.receiver_name.trim()) e.receiver_name = "Requerido";
      if (!form.customer_ruc.trim()) e.customer_ruc = "Requerido";
      else if (!/^\d{10,13}$/.test(form.customer_ruc.trim())) e.customer_ruc = "10 a 13 dígitos";
      if (!form.customer_email.trim()) e.customer_email = "Requerido";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email.trim())) e.customer_email = "Correo inválido";
      if (!form.customer_phone.trim()) e.customer_phone = "Requerido";
      else if (!/^[\d+\s-]{7,15}$/.test(form.customer_phone.trim())) e.customer_phone = "Teléfono inválido";
    }
    if (idx === 1) {
      if (!form.farm_name.trim()) e.farm_name = "Requerido";
      if (!form.reference.trim()) e.reference = "Requerido";
    }
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error("Completa los campos obligatorios");
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const buildOrderSummaryText = (orderNumber: string) => {
    const itemsList = items.map((i) => `• ${i.name} x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`).join("\n");
    const metodoLabel =
      method === "card" ? "Tarjeta (PlaceToPay)"
      : method === "transfer" ? "Transferencia bancaria"
      : method === "cash" ? "Efectivo en sucursal"
      : "Solicitud de cotización";
    const tipoDoc =
      method === "quote" ? "📄 *Cotización*"
      : method === "card" ? "💳 *Factura / Link de pago*"
      : method === "cash" ? "🏬 *Factura / Pago en efectivo*"
      : "🧾 *Factura / Pedido*";
    const accion =
      method === "transfer" ? "Estado: esperando comprobante de pago"
      : method === "card" ? "Solicitud: enviar link seguro de pago"
      : method === "cash" ? "Solicitud: reservar pedido para pago en sucursal"
      : "Solicitud: generar cotización formal";
    return (
      `${tipoDoc} ${orderNumber}\n\n` +
      `*Datos de facturación*\n` +
      `👤 Cliente: ${form.customer_name}\n📧 Correo: ${form.customer_email}\n📞 WhatsApp: ${form.customer_phone}\n🆔 RUC/Cédula: ${form.customer_ruc}\n\n` +
      `*Datos de entrega*\n` +
      `📦 Recibe: ${form.receiver_name}\n🏝️ Camaronera: ${form.farm_name}\n📍 Referencia: ${form.reference}\n` +
      `${form.shipping_notes ? `📝 Notas: ${form.shipping_notes}\n` : ""}\n` +
      `*Productos*\n${itemsList}\n\n💰 *Total: $${subtotal.toFixed(2)}*\n💳 Pago: ${metodoLabel}\n${accion}`
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }
    // Validar todos los pasos antes de enviar
    if (!validateStep(0)) { setStep(0); return; }
    if (!validateStep(1)) { setStep(1); return; }
    setSubmitting(true);
    try {
      const shippingAddress = `${form.farm_name} — Ref: ${form.reference}`;
      const status = method === "quote" ? "quote" : "pending";
      const notes = `Método: ${method}. Recibe: ${form.receiver_name}. RUC: ${form.customer_ruc}. ${form.shipping_notes || ""}`.trim();

      const { data, error } = await supabase.rpc("create_order", {
        _items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })) as any,
        _customer_name: form.customer_name,
        _customer_email: form.customer_email,
        _customer_phone: form.customer_phone,
        _shipping_address: shippingAddress,
        _shipping_city: "—",
        _shipping_province: "—",
        _shipping_country: "Ecuador",
        _shipping_notes: notes,
        _status: status,
      });

      if (error) throw error;
      const orderNumber = (data as any)?.[0]?.order_number ?? (data as any)?.order_number;
      if (!orderNumber) throw new Error("No se pudo crear el pedido");
      const waUrl = buildWhatsAppUrl(buildOrderSummaryText(orderNumber));

      // Guardar datos del cliente para futuras compras (Supabase + respaldo local)
      if (saveData) {
        if (user) {
          await supabase.from("profiles").upsert({
            user_id: user.id,
            full_name: form.customer_name,
            phone: form.customer_phone,
            address: form.farm_name,
            city: form.reference,
          }, { onConflict: "user_id" });
        }
        if (typeof window !== "undefined") {
          try {
            const { shipping_notes, ...toSave } = form;
            localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(toSave));
          } catch {}
        }
      } else if (typeof window !== "undefined") {
        try { localStorage.removeItem(CUSTOMER_STORAGE_KEY); } catch {}
      }

      clear();

      if (method === "transfer") {
        toast.success("Pedido registrado. Envía el comprobante por WhatsApp.");
      } else if (method === "cash") {
        toast.success("Pedido registrado. Pasa por la sucursal a pagar y retirar.");
      } else if (method === "card") {
        toast.success("Pedido registrado. Te enviamos los datos por WhatsApp para confirmar el pago con tarjeta.");
      } else if (method === "quote") {
        toast.success("Cotización enviada. Pronto te contactaremos por WhatsApp.");
      }
      // En todos los casos, abrir WhatsApp con el resumen para la empresa
      window.location.href = waUrl;
    } catch (err: any) {
      toast.error(err.message || "Error al procesar el pedido");
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <Layout>
        <PageHero eyebrow="Checkout" title="Verificando sesión..." />
        <section className="py-20 text-center"><Loader2 className="w-8 h-8 mx-auto animate-spin text-ocean" /></section>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <PageHero eyebrow="Checkout" title="Tu carrito está vacío" description="Agrega productos antes de continuar." />
        <section className="py-16 bg-background text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <Link to="/productos" className="inline-flex items-center px-6 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow">
            Ver productos
          </Link>
        </section>
      </Layout>
    );
  }

  const inputCls = "w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20 transition";
  const errCls = "border-destructive focus:border-destructive focus:ring-destructive/20";

  const fieldError = (key: string) =>
    errors[key] ? <p className="text-xs text-destructive mt-1">{errors[key]}</p> : null;

  return (
    <Layout>
      <PageHero eyebrow="Pago seguro" title="Checkout" description="Completa tus datos y elige el método de pago." />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Stepper */}
              <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-card">
                <div className="flex items-center justify-between gap-2">
                  {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const done = i < step;
                    const active = i === step;
                    return (
                      <div key={s.key} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1.5 min-w-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition shrink-0 ${
                            done ? "bg-ocean border-ocean text-white"
                            : active ? "border-ocean text-ocean bg-foam"
                            : "border-border text-muted-foreground bg-background"
                          }`}>
                            {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                          </div>
                          <span className={`text-[11px] sm:text-xs font-semibold truncate ${active || done ? "text-navy-deep" : "text-muted-foreground"}`}>
                            Paso {i + 1}: {s.label}
                          </span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`h-0.5 flex-1 mx-2 mb-5 transition ${i < step ? "bg-ocean" : "bg-border"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Paso 1: Datos del cliente */}
              {step === 0 && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h3 className="font-bold text-navy-deep text-lg mb-1">Datos del cliente</h3>
                  <p className="text-sm text-muted-foreground mb-4">Todos los campos son obligatorios.</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <input placeholder="Nombres y apellidos *" value={form.customer_name} onChange={update("customer_name")} className={`${inputCls} ${errors.customer_name ? errCls : ""}`} />
                      {fieldError("customer_name")}
                    </div>
                    <div>
                      <input placeholder="Persona que recibe el pedido *" value={form.receiver_name} onChange={update("receiver_name")} className={`${inputCls} ${errors.receiver_name ? errCls : ""}`} />
                      {fieldError("receiver_name")}
                    </div>
                    <div>
                      <input placeholder="RUC / Cédula *" value={form.customer_ruc} onChange={update("customer_ruc")} className={`${inputCls} ${errors.customer_ruc ? errCls : ""}`} />
                      {fieldError("customer_ruc")}
                    </div>
                    <div>
                      <input type="email" placeholder="Correo electrónico *" value={form.customer_email} onChange={update("customer_email")} className={`${inputCls} ${errors.customer_email ? errCls : ""}`} />
                      {fieldError("customer_email")}
                    </div>
                    <div>
                      <input placeholder="Teléfono / WhatsApp *" value={form.customer_phone} onChange={update("customer_phone")} className={`${inputCls} ${errors.customer_phone ? errCls : ""}`} />
                      {fieldError("customer_phone")}
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 2: Entrega */}
              {step === 1 && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h3 className="font-bold text-navy-deep text-lg mb-1">Lugar de entrega</h3>
                  <p className="text-sm text-muted-foreground mb-4">Las notas adicionales son opcionales.</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <input placeholder="Lugar o nombre de la camaronera *" value={form.farm_name} onChange={update("farm_name")} className={`${inputCls} ${errors.farm_name ? errCls : ""}`} />
                      {fieldError("farm_name")}
                    </div>
                    <div className="sm:col-span-2">
                      <input placeholder="Referencia (cómo llegar) *" value={form.reference} onChange={update("reference")} className={`${inputCls} ${errors.reference ? errCls : ""}`} />
                      {fieldError("reference")}
                    </div>
                    <textarea placeholder="Notas adicionales (opcional)" value={form.shipping_notes} onChange={update("shipping_notes")} rows={3} className={`${inputCls} sm:col-span-2 resize-none`} />
                  </div>
                </div>
              )}

              {/* Paso 3: Método de pago */}
              {step === 2 && (
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="font-bold text-navy-deep text-lg mb-4">Método de pago</h3>
                <div className="grid gap-3">
                  <MethodOption
                    icon={<FileText className="w-5 h-5" />}
                    title="Generar cotización"
                    subtitle="Recibe una cotización formal por WhatsApp sin compromiso de compra"
                    selected={method === "quote"}
                    onClick={() => setMethod("quote")}
                  />
                  <MethodOption
                    icon={<CreditCard className="w-5 h-5" />}
                    title="Tarjeta de crédito o débito"
                    subtitle="Te enviamos el link de pago por WhatsApp para completar la transacción"
                    selected={method === "card"}
                    onClick={() => setMethod("card")}
                  />
                  <MethodOption
                    icon={<Building2 className="w-5 h-5" />}
                    title="Transferencia bancaria"
                    subtitle="Envía el comprobante por WhatsApp para confirmar tu pedido"
                    selected={method === "transfer"}
                    onClick={() => setMethod("transfer")}
                  />
                  <MethodOption
                    icon={<Banknote className="w-5 h-5" />}
                    title="Pago en efectivo en sucursal"
                    subtitle="Paga y retira directamente en nuestra sucursal"
                    selected={method === "cash"}
                    onClick={() => setMethod("cash")}
                  />
                </div>

                {/* Detalle según método */}
                {method === "transfer" && (
                  <div className="mt-5 p-4 rounded-xl bg-foam border border-border space-y-2 text-sm">
                    <p className="font-semibold text-navy-deep">Datos para transferencia (ejemplo):</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li><strong>Banco:</strong> {BANCO_DEMO.banco}</li>
                      <li><strong>Tipo:</strong> {BANCO_DEMO.tipo}</li>
                      <li><strong>N° de cuenta:</strong> {BANCO_DEMO.numero}</li>
                      <li><strong>Titular:</strong> {BANCO_DEMO.titular}</li>
                      <li><strong>RUC:</strong> {BANCO_DEMO.ruc}</li>
                      <li><strong>Correo:</strong> {BANCO_DEMO.correo}</li>
                    </ul>
                    <p className="text-xs text-ocean flex items-center gap-2 pt-2">
                      <Send className="w-3.5 h-3.5" /> Al confirmar, abriremos WhatsApp con tu resumen para que adjuntes el comprobante (obligatorio).
                    </p>
                  </div>
                )}
                {method === "cash" && (
                  <div className="mt-5 p-4 rounded-xl bg-foam border border-border space-y-2 text-sm">
                    <p className="font-semibold text-navy-deep">Pago en sucursal:</p>
                    <p className="text-muted-foreground flex items-start gap-2"><Building2 className="w-4 h-4 mt-0.5 text-ocean" /> {SUCURSAL.direccion}</p>
                    <p className="text-muted-foreground flex items-start gap-2"><Clock className="w-4 h-4 mt-0.5 text-ocean" /> {SUCURSAL.horario}</p>
                    <p className="text-xs text-ocean pt-2">Tu pedido quedará reservado y se despacha al momento del pago.</p>
                  </div>
                )}
                {method === "card" && (
                  <div className="mt-5 p-4 rounded-xl bg-foam border border-border space-y-2 text-sm">
                    <p className="font-semibold text-navy-deep">Pago con tarjeta:</p>
                    <p className="text-muted-foreground">Al confirmar, enviaremos los datos completos de tu factura por WhatsApp a la empresa. Te responderemos con el link seguro de pago para que completes la transacción con tu tarjeta de crédito o débito.</p>
                    <p className="text-xs text-ocean flex items-center gap-2 pt-2">
                      <Send className="w-3.5 h-3.5" /> Procesamiento seguro mediante pasarela de pagos.
                    </p>
                  </div>
                )}
                {method === "quote" && (
                  <div className="mt-5 p-4 rounded-xl bg-foam border border-border space-y-2 text-sm">
                    <p className="font-semibold text-navy-deep">Solicitud de cotización:</p>
                    <p className="text-muted-foreground">Al confirmar, te generamos una cotización formal con todos los productos seleccionados y la enviamos a la empresa por WhatsApp. Un asesor te contactará para finalizar los detalles, sin compromiso de compra.</p>
                    <p className="text-xs text-ocean flex items-center gap-2 pt-2">
                      <Send className="w-3.5 h-3.5" /> Atención personalizada para tu camaronera.
                    </p>
                  </div>
                )}
              </div>
              )}

              {/* Navegación entre pasos */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-border text-navy-deep font-semibold hover:border-ocean transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" /> Atrás
                </button>
                {step < STEPS.length - 1 && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full gradient-wave text-white font-semibold shadow-glow hover:scale-[1.02] transition-transform"
                  >
                    Siguiente <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-card rounded-2xl p-6 shadow-card h-fit lg:sticky lg:top-24">
              <h3 className="font-bold text-navy-deep text-lg mb-4">Tu pedido</h3>
              <div className="space-y-3 max-h-64 overflow-auto mb-4">
                {items.map((i) => (
                  <div key={i.id} className="flex gap-3 text-sm">
                    <img src={i.img} alt={i.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-navy-deep line-clamp-1">{i.name}</p>
                      <p className="text-muted-foreground">x{i.quantity}</p>
                    </div>
                    <span className="font-semibold">${(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Envío</span><span>A coordinar</span></div>
                <div className="flex justify-between text-base font-bold text-navy-deep pt-2 border-t border-border">
                  <span>Total</span><span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
              <label className="flex items-start gap-2 mt-4 cursor-pointer text-xs text-muted-foreground select-none">
                <input
                  type="checkbox"
                  checked={saveData}
                  onChange={(e) => setSaveData(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-ocean cursor-pointer"
                />
                <span>Guardar mis datos en este dispositivo para futuras compras (más rápido la próxima vez).</span>
              </label>
              <button
                type="submit"
                disabled={submitting || step !== STEPS.length - 1}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                title={step !== STEPS.length - 1 ? "Completa los pasos anteriores" : ""}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                ) : step !== STEPS.length - 1 ? (
                  <><Lock className="w-4 h-4" /> Completa los pasos</>
                ) : method === "transfer" ? (
                  <><Send className="w-4 h-4" /> Confirmar y enviar comprobante</>
                ) : method === "cash" ? (
                  <><Banknote className="w-4 h-4" /> Confirmar pedido</>
                ) : method === "card" ? (
                  <><CreditCard className="w-4 h-4" /> Confirmar y recibir link de pago</>
                ) : method === "quote" ? (
                  <><FileText className="w-4 h-4" /> Generar cotización</>
                ) : (
                  <><Lock className="w-4 h-4" /> Próximamente</>
                )}
              </button>
              <p className="text-[11px] text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Conexión segura. Tus datos están protegidos.
              </p>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
}

function MethodOption({
  icon, title, subtitle, selected, onClick, disabled,
}: {
  icon: React.ReactNode; title: string; subtitle: string; selected: boolean; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-start gap-3 w-full text-left p-4 rounded-xl border-2 transition ${
        selected ? "border-ocean bg-foam" : "border-border bg-background hover:border-ocean/40"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div className={`mt-0.5 ${selected ? "text-ocean" : "text-muted-foreground"}`}>{icon}</div>
      <div className="flex-1">
        <p className="font-semibold text-navy-deep text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? "border-ocean" : "border-border"}`}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-ocean" />}
      </div>
    </button>
  );
}