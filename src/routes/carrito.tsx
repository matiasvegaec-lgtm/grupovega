import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { useCart } from "@/contexts/CartContext";

export const Route = createFileRoute("/carrito")({
  head: () => ({
    meta: [
      { title: "Carrito — Grupo Vega" },
      { name: "description", content: "Revisa los productos en tu carrito antes de finalizar tu compra." },
    ],
  }),
  component: CarritoPage,
});

function CarritoPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  return (
    <Layout>
      <PageHero eyebrow="Tu compra" title="Carrito de compras" description="Revisa los productos antes de continuar al pago." />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold text-navy-deep mb-2">Tu carrito está vacío</h2>
              <p className="text-muted-foreground mb-6">Explora nuestro catálogo y agrega productos.</p>
              <Link to="/productos" className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow">
                Ver productos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map((it) => (
                  <div key={it.id} className="flex gap-4 bg-card rounded-2xl p-4 shadow-card">
                    <img src={it.img} alt={it.name} className="w-24 h-24 object-cover rounded-xl" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-navy-deep">{it.name}</h3>
                      <p className="text-ocean font-semibold mt-1">${it.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => updateQuantity(it.id, it.quantity - 1)} className="p-1.5 rounded-full bg-foam hover:bg-ocean hover:text-white transition">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-semibold">{it.quantity}</span>
                        <button onClick={() => updateQuantity(it.id, it.quantity + 1)} className="p-1.5 rounded-full bg-foam hover:bg-ocean hover:text-white transition">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => removeItem(it.id)} aria-label="Eliminar" className="text-muted-foreground hover:text-destructive transition">
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <span className="font-bold text-navy-deep">${(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <aside className="bg-card rounded-2xl p-6 shadow-card h-fit lg:sticky lg:top-24">
                <h3 className="text-xl font-bold text-navy-deep mb-4">Resumen</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Envío</span><span className="text-muted-foreground">A calcular</span></div>
                </div>
                <div className="border-t border-border my-4" />
                <div className="flex justify-between text-lg font-bold text-navy-deep mb-6">
                  <span>Total</span><span>${subtotal.toFixed(2)}</span>
                </div>
                <Link to="/checkout" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow hover:scale-[1.02] transition">
                  Continuar al pago <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/productos" className="w-full mt-3 inline-flex items-center justify-center px-6 py-3 rounded-full border border-border text-navy-deep font-semibold hover:bg-foam transition">
                  Seguir comprando
                </Link>
              </aside>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}