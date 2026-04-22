import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, Loader2, Check, Package, Tag } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import feedImg from "@/assets/product-feed.jpg";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  stock: number;
};

export const Route = createFileRoute("/productos/$productId")({
  head: () => ({
    meta: [
      { title: "Producto — Grupo Vega" },
      { name: "description", content: "Detalle del producto en Grupo Vega." },
    ],
  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();
      if (!alive) return;
      const prod = (data ?? null) as Product | null;
      setProduct(prod);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-ocean" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl font-bold text-navy-deep mb-3">Producto no encontrado</h1>
          <p className="text-muted-foreground mb-6">Este producto no existe o ya no está disponible.</p>
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al catálogo
          </Link>
        </div>
      </Layout>
    );
  }

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        category: product.category,
        img: product.image_url || feedImg,
      });
    }
    toast.success(`${product.name} (x${qty}) agregado al carrito`);
  };

  return (
    <Layout>
      <section className="bg-foam py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate({ to: "/productos" })}
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy-deep hover:text-ocean transition"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al catálogo
          </button>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative bg-card rounded-3xl overflow-hidden shadow-elegant aspect-square"
            >
              <img
                src={product.image_url || feedImg}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full glass text-white text-xs font-semibold flex items-center gap-1.5">
                <Tag className="w-3 h-3" /> {product.category}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col"
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-ocean mb-3">
                {product.category}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-navy-deep mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-4xl font-bold text-navy-deep">
                  ${Number(product.price).toFixed(2)}
                </span>
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700">
                    <Check className="w-4 h-4" /> En stock ({product.stock} disponibles)
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-muted-foreground">Agotado</span>
                )}
              </div>

              <div className="prose prose-sm max-w-none text-muted-foreground mb-8 leading-relaxed">
                {product.description ? (
                  <p className="whitespace-pre-line">{product.description}</p>
                ) : (
                  <p className="italic">Sin descripción disponible.</p>
                )}
              </div>

              <div className="bg-foam rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-ocean shrink-0" />
                  <div className="text-sm text-navy-deep">
                    <strong>Despacho desde Pedernales.</strong>{" "}
                    Coordinamos envío a toda la costa ecuatoriana.
                  </div>
                </div>
              </div>

              {/* Cantidad + CTA */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="inline-flex items-center bg-card border border-border rounded-full overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 py-3 text-lg font-bold text-navy-deep hover:bg-foam transition"
                    aria-label="Disminuir"
                  >
                    −
                  </button>
                  <span className="px-5 font-semibold text-navy-deep min-w-[3ch] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}
                    className="px-4 py-3 text-lg font-bold text-navy-deep hover:bg-foam transition"
                    aria-label="Aumentar"
                  >
                    +
                  </button>
                </div>
                <button
                  disabled={product.stock <= 0}
                  onClick={handleAdd}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" /> Agregar al carrito
                </button>
              </div>

              <Link
                to="/contacto"
                className="text-sm font-semibold text-ocean hover:underline"
              >
                ¿Necesitas pedido al por mayor? Contáctanos →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}