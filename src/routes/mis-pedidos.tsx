import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/mis-pedidos")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Mis pedidos — Grupo Vega" },
      { name: "description", content: "Historial de tus pedidos." },
    ],
  }),
  component: MisPedidosPage,
});

type Order = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total: number;
};

function MisPedidosPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth", search: { redirect: "/mis-pedidos" } });
      return;
    }
    if (user) {
      (async () => {
        const { data } = await supabase
          .from("orders")
          .select("id, order_number, created_at, status, total")
          .order("created_at", { ascending: false });
        setOrders((data ?? []) as Order[]);
        setLoading(false);
      })();
    }
  }, [authLoading, user, navigate]);

  if (authLoading || !user) {
    return (
      <Layout>
        <PageHero eyebrow="Cuenta" title="Mis pedidos" description="Cargando..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHero
        eyebrow="Mi cuenta"
        title="Mis pedidos"
        description="Revisa el estado de tus pedidos recientes."
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-ocean" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-6">Aún no tienes pedidos.</p>
              <Link
                to="/productos"
                className="inline-flex items-center px-6 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow"
              >
                Hacer mi primer pedido
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  to="/pedido/$orderNumber"
                  params={{ orderNumber: o.order_number }}
                  className="block bg-card border border-border rounded-2xl p-5 hover:shadow-card transition"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-bold text-navy-deep">{o.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("es-EC", {
                          year: "numeric", month: "long", day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 rounded-full bg-foam text-ocean text-xs font-semibold uppercase tracking-wider">
                        {o.status}
                      </span>
                      <span className="font-bold text-navy-deep">${Number(o.total).toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}