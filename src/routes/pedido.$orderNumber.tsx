import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Package, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { ProductImage } from "@/components/ProductImage";
import { supabase } from "@/integrations/supabase/client";

type OrderItem = { id: string; name: string; price: number; quantity: number; img: string; category: string };
type Order = {
  order_number: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_country: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: string;
  created_at: string;
};

export const Route = createFileRoute("/pedido/$orderNumber")({
  head: ({ params }) => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: `Pedido ${params.orderNumber} — Grupo Vega` },
      { name: "description", content: "Confirmación de tu pedido." },
    ],
  }),
  component: PedidoPage,
});

function PedidoPage() {
  const { orderNumber } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .rpc("get_order_by_number", { _order_number: orderNumber });
      if (!mounted) return;
      if (error) setError(error.message);
      else if (!data) setError("Pedido no encontrado");
      else setOrder(data as unknown as Order);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [orderNumber]);

  return (
    <Layout>
      <section className="pt-32 pb-16 bg-gradient-to-b from-foam to-background min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-ocean" />
            </div>
          ) : error || !order ? (
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-navy-deep mb-2">No pudimos encontrar tu pedido</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Link to="/productos" className="inline-flex items-center px-6 py-3 rounded-full gradient-wave text-white font-semibold">
                Ir al catálogo
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <div className="w-20 h-20 mx-auto rounded-full gradient-wave flex items-center justify-center shadow-glow mb-4">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-navy-deep mb-2">¡Gracias por tu compra!</h1>
                <p className="text-muted-foreground">
                  Pedido <span className="font-mono font-bold text-navy-deep">{order.order_number}</span> confirmado.
                  Te enviamos un correo a <span className="font-semibold">{order.customer_email}</span>.
                </p>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-card mb-6">
                <h3 className="font-bold text-navy-deep mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-ocean" /> Productos
                </h3>
                <div className="space-y-3">
                  {order.items.map((i) => (
                    <div key={i.id} className="flex gap-3 text-sm">
                      <ProductImage src={i.img} alt={i.name} className="w-14 h-14 rounded-lg object-contain" />
                      <div className="flex-1">
                        <p className="font-semibold text-navy-deep">{i.name}</p>
                        <p className="text-muted-foreground">${i.price.toFixed(2)} x {i.quantity}</p>
                      </div>
                      <span className="font-bold text-navy-deep">${(i.price * i.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border mt-4 pt-3 flex justify-between font-bold text-navy-deep text-lg">
                  <span>Total pagado</span>
                  <span>${Number(order.total).toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-card mb-6">
                <h3 className="font-bold text-navy-deep mb-3">Dirección de envío</h3>
                <p className="text-sm text-muted-foreground">
                  <span className="block font-semibold text-navy-deep">{order.customer_name}</span>
                  {order.shipping_address}<br />
                  {order.shipping_city}, {order.shipping_province}<br />
                  {order.shipping_country}
                </p>
              </div>

              <div className="text-center">
                <Link to="/productos" className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow hover:scale-105 transition-transform">
                  Seguir comprando <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
