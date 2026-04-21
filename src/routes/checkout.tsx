import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, FormEvent, useEffect } from "react";
import { Loader2, CreditCard, ShoppingBag } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Grupo Vega" },
      { name: "description", content: "Completa tus datos de envío y pago." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    shipping_city: "",
    shipping_province: "",
    shipping_postal_code: "",
    shipping_country: "Ecuador",
    shipping_notes: "",
    card_number: "",
    card_exp: "",
    card_cvc: "",
  });

  useEffect(() => {
    if (items.length === 0 && !submitting) {
      // allow page render but suggest going back
    }
  }, [items.length, submitting]);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone,
          shipping_address: form.shipping_address,
          shipping_city: form.shipping_city,
          shipping_province: form.shipping_province,
          shipping_postal_code: form.shipping_postal_code || null,
          shipping_country: form.shipping_country,
          shipping_notes: form.shipping_notes || null,
          items: items as any,
          subtotal,
          total: subtotal,
          status: "paid",
        })
        .select("order_number")
        .single();

      if (error) throw error;
      clear();
      toast.success("¡Pago aprobado!");
      navigate({ to: "/pedido/$orderNumber", params: { orderNumber: data.order_number } });
    } catch (err: any) {
      toast.error(err.message || "Error al procesar el pedido");
      setSubmitting(false);
    }
  };

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
      <PageHero eyebrow="Pago seguro" title="Checkout" description="Completa tus datos de envío y pago." />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="font-bold text-navy-deep text-lg mb-4">Información de contacto</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input required placeholder="Nombre completo" value={form.customer_name} onChange={update("customer_name")} className={inputCls} />
                  <input required type="email" placeholder="Correo electrónico" value={form.customer_email} onChange={update("customer_email")} className={inputCls} />
                  <input required placeholder="Teléfono" value={form.customer_phone} onChange={update("customer_phone")} className={`${inputCls} sm:col-span-2`} />
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="font-bold text-navy-deep text-lg mb-4">Dirección de envío</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input required placeholder="Dirección" value={form.shipping_address} onChange={update("shipping_address")} className={`${inputCls} sm:col-span-2`} />
                  <input required placeholder="Ciudad" value={form.shipping_city} onChange={update("shipping_city")} className={inputCls} />
                  <input required placeholder="Provincia / Estado" value={form.shipping_province} onChange={update("shipping_province")} className={inputCls} />
                  <input placeholder="Código postal (opcional)" value={form.shipping_postal_code} onChange={update("shipping_postal_code")} className={inputCls} />
                  <input required placeholder="País" value={form.shipping_country} onChange={update("shipping_country")} className={inputCls} />
                  <textarea placeholder="Notas de entrega (opcional)" value={form.shipping_notes} onChange={update("shipping_notes")} rows={3} className={`${inputCls} sm:col-span-2 resize-none`} />
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="font-bold text-navy-deep text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-ocean" /> Datos de pago
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Pasarela de pago en modo demostración. No se realizan cargos reales.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input required placeholder="Número de tarjeta" maxLength={19} value={form.card_number} onChange={update("card_number")} className={`${inputCls} sm:col-span-2`} />
                  <input required placeholder="MM/AA" maxLength={5} value={form.card_exp} onChange={update("card_exp")} className={inputCls} />
                  <input required placeholder="CVC" maxLength={4} value={form.card_cvc} onChange={update("card_cvc")} className={inputCls} />
                </div>
              </div>
            </div>

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
                <div className="flex justify-between"><span className="text-muted-foreground">Envío</span><span>Gratis</span></div>
                <div className="flex justify-between text-base font-bold text-navy-deep pt-2 border-t border-border">
                  <span>Total</span><span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</> : <>Pagar ${subtotal.toFixed(2)}</>}
              </button>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
}
