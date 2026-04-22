import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";

type CartDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, updateQty, removeItem, subtotal, count } = useCart();
  const close = () => onOpenChange(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={!isMobile}>
      <SheetContent
        side="right"
        className="w-[85%] max-w-[360px] sm:w-full sm:max-w-md flex flex-col p-0 md:shadow-2xl"
        onInteractOutside={(e) => {
          if (isMobile) e.preventDefault();
        }}
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="text-navy-deep flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Tu carrito ({count})
          </SheetTitle>
          <SheetDescription>Vista rápida de tus productos.</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <ShoppingBag className="w-14 h-14 text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-navy-deep mb-1">Tu carrito está vacío</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Explora nuestro catálogo y agrega productos.
            </p>
            <Link
              to="/productos"
              onClick={close}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full gradient-wave text-white text-sm font-semibold shadow-glow hover:scale-105 transition-transform"
            >
              Ver productos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 bg-card rounded-xl p-3 shadow-sm border border-border"
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {item.category}
                        </p>
                        <h4 className="font-semibold text-sm text-navy-deep truncate">
                          {item.name}
                        </h4>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive transition shrink-0"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-1 border border-border rounded-full px-1">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-foam"
                          aria-label="Disminuir"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-foam"
                          aria-label="Aumentar"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-sm text-navy-deep">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-6 py-4 space-y-4 bg-background">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-bold text-navy-deep">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">
                Envío e impuestos calculados al pagar.
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  to="/checkout"
                  onClick={close}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full gradient-wave text-white text-sm font-semibold shadow-glow hover:scale-[1.02] transition-transform"
                >
                  Ir al checkout <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={close}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-border text-navy-deep text-sm font-semibold hover:bg-foam transition"
                >
                  Seguir comprando
                </button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}