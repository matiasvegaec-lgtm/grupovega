import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Mis favoritos — Grupo Vega" },
      { name: "description", content: "Tus productos favoritos guardados." },
    ],
  }),
  component: FavoritosPage,
});

function FavoritosPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { items, remove } = useFavorites();
  const { addItem } = useCart();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", search: { redirect: "/favoritos" } });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <Layout>
        <PageHero eyebrow="Cuenta" title="Mis favoritos" description="Cargando..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHero
        eyebrow="Mi cuenta"
        title="Mis favoritos"
        description="Productos que has guardado para más tarde."
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-6">No tienes productos favoritos aún.</p>
              <Link
                to="/productos"
                className="inline-flex items-center px-6 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow"
              >
                Explorar productos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((p) => (
                <div
                  key={p.id}
                  className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-all"
                >
                  <Link
                    to="/productos/$productId"
                    params={{ productId: p.slug || p.id }}
                    className="block aspect-square overflow-hidden bg-white"
                  >
                    <img src={p.img} alt={p.name} className="w-full h-full object-contain p-4" />
                  </Link>
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-wider text-ocean font-semibold mb-1">{p.category}</p>
                    <h3 className="font-bold text-navy-deep mb-2 line-clamp-2">{p.name}</h3>
                    <p className="text-lg font-bold text-navy-deep mb-3">${p.price.toFixed(2)}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          addItem({ id: p.id, name: p.name, price: p.price, category: p.category, img: p.img });
                          toast.success(`${p.name} agregado al carrito`);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full gradient-wave text-white text-xs font-semibold"
                      >
                        <ShoppingCart className="w-3 h-3" /> Carrito
                      </button>
                      <button
                        onClick={() => remove(p.id)}
                        aria-label="Quitar"
                        className="p-2 rounded-full border border-border hover:border-destructive hover:text-destructive transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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