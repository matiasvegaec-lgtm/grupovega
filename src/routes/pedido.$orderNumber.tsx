import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/pedido/$orderNumber")({
  head: () => ({
    meta: [
      { title: "Confirmación de pedido — Grupo Vega" },
      { name: "description", content: "Tu pedido ha sido confirmado." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", params.orderNumber)
      .maybeSingle();
    if (error) throw error;
    return { order: data };
  },
  component: OrderConfirmation,
  errorComponent: ({ error }) => (
    <Layout>
      <div className="container mx-auto py-20 text-center">
        <p className="text-destructive">Error: {error.message}</p>
        <Link to="/" className="text-ocean underline mt-4 inline-block">Volver al inicio</Link>
      </div>
    </Layout>
  ),
  notFoundComponent: () => (
    <Layout>
      <div className="container mx-auto py-20 text-center">
        <p>Pedido no encontrado.</p>
        <Link to="/" className="text-ocean underline mt-4 inline-block">Volver al inicio</Link>
      </div>
    </Layout>
  ),
});

function OrderConfirmation() {
  const { order } = Route.useLoaderData();

  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto py-20 text-center">
          <h1 className="text-2xl font-bold text-navy-deep mb-3">Pedido no encontrado</h1>
          <Link to="/productos" className="text-ocean underline">Ver productos</Link>
        </div>
      </Layout>
    );
  }

  const items = (order.items as Array<{ id: string; name: string; price: number; quantity: number }>) || [];

  return (
    <Layout>
      <section className="pt-32 pb-16 bg-gradient-to-b from-foam to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-foam mb-4">
              <CheckCircle2 className="w-12 h-12 text-ocean" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-navy-deep mb-2">¡Gracias por tu pedido!</h1>
            <p className="text-muted-foreground">Tu pedido <span className="font-semibold text-ocean">#{order.order_number}</span> ha sido recibido.</p>
            <p className="text-sm text-muted-foreground mt-1">Te enviaremos un correo a <strong>{order.customer_email}</strong> con los detalles para coordinar el pago y la entrega.</p>
          </div>

          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card space-y-6">
            <div>
              <h3 className="font-bold text-navy-deep mb-3 flex items-center gap-2"><Package className="w-5 h-5 text-ocean" /> Productos</h3>
              <div className="space-y-2">
                {items.map((it) => (
                  <div key={it.id} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                    <span className="text-navy-deep">{it.name} <span className="text-muted-foreground">x{it.quantity}</span></span>
                    <span className="font-semibold">${(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-lg font-bold text-navy-deep pt-4">
                <span>Total</span><span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-border">
              <div>
                <h4 className="font-semibold text-navy-deep mb-2">Contacto</h4>
                <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
              </div>
              <div>
                <h4 className="font-semibold text-navy-deep mb-2">Envío</h4>
                <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
                <p className="text-sm text-muted-foreground">{order.shipping_city}, {order.shipping_province}{order.shipping_postal_code ? ` ${order.shipping_postal_code}` : ""}</p>
                <p className="text-sm text-muted-foreground">{order.shipping_country}</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/productos" className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow">
              Seguir comprando <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}