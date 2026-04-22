import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, FormEvent, useEffect } from "react";
import { Loader2, CreditCard, ShoppingBag, Building2, Banknote, Send, Lock, Clock, ChevronLeft, ChevronRight, Check, User, MapPin, Wallet } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
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

type PayMethod = "card" | "transfer" | "cash";

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

  // Cargar datos guardados + prellenar email
  useEffect(() => {
    if (typeof window === "undefined") return;
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
  }, [user]);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const buildOrderSummaryText = (orderNumber: string) => {
    const itemsList = items.map((i) => `• ${i.name} x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`).join("\n");
    const metodoLabel = method === "card" ? "Tarjeta (PlaceToPay)" : method === "transfer" ? "Transferencia bancaria" : "Efectivo en sucursal";
    return (
      `🛒 *Pedido ${orderNumber}*\n\n` +
      `👤 ${form.customer_name}\n📧 ${form.customer_email}\n📞 ${form.customer_phone}\n🆔 RUC: ${form.customer_ruc}\n` +
      `📦 Recibe: ${form.receiver_name}\n🏝️ Camaronera: ${form.farm_name}\n📍 Ref: ${form.reference}\n\n` +
      `${itemsList}\n\n💰 *Total: $${subtotal.toFixed(2)}*\n💳 Pago: ${metodoLabel}`
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }
    if (method === "card") {
      toast.info("El pago con tarjeta estará disponible muy pronto. Elige otro método.");
      return;
    }
    // Abrir ventana de WhatsApp ANTES del await para evitar bloqueo de popups
    const waWindow = window.open("about:blank", "_blank");
    setSubmitting(true);
    try {
      const shippingAddress = `${form.farm_name} — Ref: ${form.reference}`;
      const status = method === "transfer" ? "pending" : "pending";
      const notes = `Método: ${method}. Recibe: ${form.receiver_name}. RUC: ${form.customer_ruc}. ${form.shipping_notes || ""}`.trim();

      const { data, error } = await supabase
        .from("orders")
        .insert({
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone,
          shipping_address: shippingAddress,
          shipping_city: "—",
          shipping_province: "—",
          shipping_country: "Ecuador",
          shipping_notes: notes,
          items: items as any,
          subtotal,
          total: subtotal,
          status,
        })
        .select("order_number")
        .single();

      if (error) throw error;
      const orderNumber = data.order_number;
      const summary = buildOrderSummaryText(orderNumber);
      const waUrl = `https://wa.me/${WHATSAPP_EMPRESA}?text=${encodeURIComponent(summary)}`;

      // Guardar datos del cliente para futuras compras
      if (saveData && typeof window !== "undefined") {
        try {
          const { shipping_notes, ...toSave } = form;
          localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(toSave));
        } catch {}
      } else if (!saveData && typeof window !== "undefined") {
        try { localStorage.removeItem(CUSTOMER_STORAGE_KEY); } catch {}
      }

      clear();

      if (method === "transfer") {
        toast.success("Pedido registrado. Envía el comprobante por WhatsApp.");
        if (waWindow) waWindow.location.href = waUrl;
        else window.open(waUrl, "_blank");
      } else if (method === "cash") {
        toast.success("Pedido registrado. Pasa por la sucursal a pagar y retirar.");
        if (waWindow) waWindow.location.href = waUrl;
        else window.open(waUrl, "_blank");
      }

      navigate({ to: "/pedido/$orderNumber", params: { orderNumber } });
    } catch (err: any) {
      if (waWindow) waWindow.close();
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

  return (
    <Layout>
      <PageHero eyebrow="Pago seguro" title="Checkout" description="Completa tus datos y elige el método de pago." />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Datos del cliente */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="font-bold text-navy-deep text-lg mb-4">Datos del cliente</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input required placeholder="Nombres y apellidos" value={form.customer_name} onChange={update("customer_name")} className={`${inputCls} sm:col-span-2`} />
                  <input required placeholder="Persona que recibe el pedido" value={form.receiver_name} onChange={update("receiver_name")} className={inputCls} />
                  <input required placeholder="RUC / Cédula" value={form.customer_ruc} onChange={update("customer_ruc")} className={inputCls} />
                  <input required type="email" placeholder="Correo electrónico" value={form.customer_email} onChange={update("customer_email")} className={inputCls} />
                  <input required placeholder="Teléfono / WhatsApp" value={form.customer_phone} onChange={update("customer_phone")} className={inputCls} />
                </div>
              </div>

              {/* Dirección de entrega */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="font-bold text-navy-deep text-lg mb-4">Lugar de entrega</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input required placeholder="Lugar o nombre de la camaronera" value={form.farm_name} onChange={update("farm_name")} className={`${inputCls} sm:col-span-2`} />
                  <input required placeholder="Referencia (cómo llegar)" value={form.reference} onChange={update("reference")} className={`${inputCls} sm:col-span-2`} />
                  <textarea placeholder="Notas adicionales (opcional)" value={form.shipping_notes} onChange={update("shipping_notes")} rows={3} className={`${inputCls} sm:col-span-2 resize-none`} />
                </div>
              </div>

              {/* Método de pago */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="font-bold text-navy-deep text-lg mb-4">Método de pago</h3>
                <div className="grid gap-3">
                  <MethodOption
                    icon={<CreditCard className="w-5 h-5" />}
                    title="Tarjeta de crédito o débito"
                    subtitle="PlaceToPay — próximamente"
                    selected={method === "card"}
                    onClick={() => setMethod("card")}
                    disabled
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
                  <div className="mt-5 p-4 rounded-xl bg-muted border border-border text-sm text-muted-foreground">
                    Estamos integrando <strong className="text-navy-deep">PlaceToPay</strong> para aceptar tarjetas. Mientras tanto, elige transferencia o efectivo.
                  </div>
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
                disabled={submitting || method === "card"}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                ) : method === "transfer" ? (
                  <><Send className="w-4 h-4" /> Confirmar y enviar comprobante</>
                ) : method === "cash" ? (
                  <><Banknote className="w-4 h-4" /> Confirmar pedido</>
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