import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Loader2, Lock, ShoppingBag } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Grupo Vega" },
      { name: "description", content: "Completa tus datos de envío para finalizar tu pedido." },
    ],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  customer_name: z.string().trim().min(2, "Nombre requerido").max(100),
  customer_email: z.string().trim().email("Email inválido").max(255),
  customer_phone: z.string().trim().min(7, "Teléfono inválido").max(20),
  shipping_address: z.string().trim().min(5, "Dirección requerida").max(255),
  shipping_city: z.string().trim().min(2, "Ciudad requerida").max(100),
  shipping_province: z.string().trim().min(2, "Provincia requerida").max(100),
  shipping_postal_code: z.string().trim().max(20).optional().or(z.literal("")),
  shipping_country: z.string().trim().min(2).max(100),
  shipping_notes: z.string().trim().max(500).optional().or(z.literal("")),
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;
    setErrors({});
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { if (i.path[0]) errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          ...parsed.data,
          shipping_postal_code: parsed.data.shipping_postal_code || null,
          shipping_notes: parsed.data.shipping_notes || null,
          items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          subtotal,
          total: subtotal,
          status: "pending",
        })
        .select("order_number")
        .single();

      if (error) throw error;
      clear();
      toast.success("¡Pedido creado!");
      navigate({ to: "/pedido/$orderNumber", params: { orderNumber: order.order_number } });
    } catch (err) {
      console.error(err);
      toast.error("No se pudo crear el pedido. Intenta de nuevo.");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <PageHero eyebrow="Checkout" title="Finaliza tu compra" />
        <section className="py-20 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-6">No tienes productos en el carrito.</p>
          <Link to="/productos" className="inline-flex px-6 py-3 rounded-full gradient-wave text-white font-semibold">Ver productos</Link>
        </section>
      </Layout>
    );
  }

  const inputCls = "w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20 transition";

  return (
    <Layout>
      <PageHero eyebrow="Checkout" title="Datos de envío" description="Completa la información para procesar tu pedido." />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-card rounded-2xl p-6 md:p-8 shadow-card space-y-5">
              <div>
                <h3 className="text-xl font-bold text-navy-deep mb-4">Contacto</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Nombre completo" name="customer_name" error={errors.customer_name} cls={inputCls} required />
                  <Field label="Email" name="customer_email" type="email" error={errors.customer_email} cls={inputCls} required />
                  <Field label="Teléfono" name="customer_phone" error={errors.customer_phone} cls={inputCls} required />
                </div>
              </div>
              <div className="border-t border-border pt-5">
                <h3 className="text-xl font-bold text-navy-deep mb-4">Dirección de envío</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Field label="Dirección (calle, número, referencia)" name="shipping_address" error={errors.shipping_address} cls={inputCls} required />
                  </div>
                  <Field label="Ciudad" name="shipping_city" error={errors.shipping_city} cls={inputCls} required />
                  <Field label="Provincia" name="shipping_province" error={errors.shipping_province} cls={inputCls} required />
                  <Field label="Código postal" name="shipping_postal_code" error={errors.shipping_postal_code} cls={inputCls} />
                  <Field label="País" name="shipping_country" defaultValue="Ecuador" error={errors.shipping_country} cls={inputCls} required />
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-navy-deep mb-1.5">Notas (opcional)</label>
                    <textarea name="shipping_notes" rows={3} className={inputCls} placeholder="Instrucciones de entrega..." />
                  </div>
                </div>
              </div>
            </div>

            <aside className="bg-card rounded-2xl p-6 shadow-card h-fit lg:sticky lg:top-24">
              <h3 className="text-xl font-bold text-navy-deep mb-4">Tu pedido</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {items.map((it) => (
                  <div key={it.id} className="flex gap-3 items-center text-sm">
                    <img src={it.img} alt={it.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-navy-deep truncate">{it.name}</p>
                      <p className="text-muted-foreground text-xs">x{it.quantity}</p>
                    </div>
                    <span className="font-semibold">${(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border my-4" />
              <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-lg font-bold text-navy-deep mb-6"><span>Total</span><span>${subtotal.toFixed(2)}</span></div>
              <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow hover:scale-[1.02] transition disabled:opacity-60">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</> : <><Lock className="w-4 h-4" /> Confirmar pedido</>}
              </button>
              <p className="text-xs text-muted-foreground text-center mt-3">Te contactaremos para coordinar el pago y la entrega.</p>
            </aside>
          </form>
        </div>
      </section>
    </Layout>
  );
}

function Field({ label, name, type = "text", error, cls, required, defaultValue }: { label: string; name: string; type?: string; error?: string; cls: string; required?: boolean; defaultValue?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-navy-deep mb-1.5">{label}{required && <span className="text-destructive"> *</span>}</label>
      <input name={name} type={type} defaultValue={defaultValue} className={cls} />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}