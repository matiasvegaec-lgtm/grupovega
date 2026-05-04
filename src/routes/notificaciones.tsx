import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Bell } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/notificaciones")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Notificaciones — Grupo Vega" },
      { name: "description", content: "Tus notificaciones recientes." },
    ],
  }),
  component: NotificacionesPage,
});

function NotificacionesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", search: { redirect: "/notificaciones" } });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <Layout>
        <PageHero eyebrow="Cuenta" title="Notificaciones" description="Cargando..." />
      </Layout>
    );
  }

  // Por ahora no hay sistema de notificaciones, siempre vacío
  const items: Array<{ id: string; title: string; message: string; date: string }> = [];

  return (
    <Layout>
      <PageHero
        eyebrow="Mi cuenta"
        title="Notificaciones"
        description="Mantente al día con tus pedidos y novedades."
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-6">No hay notificaciones.</p>
              <Link
                to="/productos"
                className="inline-flex items-center px-6 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow"
              >
                Explorar productos
              </Link>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {items.map((n) => (
                <div key={n.id} className="bg-card rounded-2xl p-5 shadow-card">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full gradient-wave flex items-center justify-center text-white shrink-0">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-navy-deep">{n.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{n.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
