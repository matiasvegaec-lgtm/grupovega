import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { useCart } from "@/contexts/CartContext";

export const Route = createFileRoute("/carrito")({
  head: () => ({
    meta: [
      { title: "Carrito — Grupo Vega" },
      { name: "description", content: "Revisa los productos en tu carrito antes de finalizar la compra." },
    ],
  }),
  component: CarritoPage,
});

function CarritoPage() {
  const { items, updateQty, removeItem, subtotal } = useCart();

  return (
    <Layout>
      <PageHero eyebrow="Tu compra" title="Carrito" description="Revisa, ajusta cantidades y procede al pago." />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold text-navy-deep mb-2">Tu carrito está vacío</h2>
              <p className="text-muted-foreground mb-6">Explora nuestro catálogo y agrega productos.</p>
              <Link
                to="/productos"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow hover:scale-105 transition-transform"
              >
                Ver productos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-card rounded-2xl p-4 shadow-card flex gap-4">
                    <img src={item.img} alt={item.name} className="w-24 h-24 rounded-xl object-cover" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                          <h3 className="font-bold text-navy-deep">{item.name}</h3>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center gap-2 border border-border rounded-full px-1">
                          <button
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-foam"
                            aria-label="Disminuir"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-foam"
                            aria-label="Aumentar"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="font-bold text-navy-deep">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-card h-fit sticky top-24">
                <h3 className="font-bold text-navy-deep text-lg mb-4">Resumen</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="text-muted-foreground">Calculado al pagar</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between text-base">
                    <span className="font-bold text-navy-deep">Total</span>
                    <span className="font-bold text-navy-deep">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow hover:scale-[1.02] transition-transform"
                >
                  Finalizar compra <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/productos"
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-border text-navy-deep font-semibold hover:bg-foam transition"
                >
                  Seguir comprando
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
