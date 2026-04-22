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
  slug: string | null;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  stock: number;
  subcategory_id: string | null;
};

type Subcategory = { id: string; name: string };

export const Route = createFileRoute("/productos/$productId")({
  loader: async ({ params }) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      params.productId
    );
    const { data } = await supabase
      .from("products")
      .select("name,description")
      .eq(isUuid ? "id" : "slug", params.productId)
      .maybeSingle();
    return { name: data?.name ?? null, description: data?.description ?? null };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name ?? "Producto";
    const desc = loaderData?.description ?? "Detalle del producto en Grupo Vega.";
    return {
      meta: [
        { title: `${name} — Grupo Vega` },
        { name: "description", content: desc.slice(0, 160) },
        { property: "og:title", content: `${name} — Grupo Vega` },
        { property: "og:description", content: desc.slice(0, 160) },
      ],
    };
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [subcategoryName, setSubcategoryName] = useState<string | null>(null);
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    let alive = true;
    if (typeof window !== "undefined") window.scrollTo(0, 0);
    (async () => {
      setLoading(true);
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        productId
      );
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq(isUuid ? "id" : "slug", productId)
        .maybeSingle();
      if (!alive) return;
      const prod = (data ?? null) as Product | null;
      setProduct(prod);
      if (prod) {
        const [subRes, relRes] = await Promise.all([
          prod.subcategory_id
            ? supabase.from("subcategories").select("id,name").eq("id", prod.subcategory_id).maybeSingle()
            : Promise.resolve({ data: null }),
          supabase
            .from("products")
            .select("*")
            .eq("active", true)
            .eq("category", prod.category)
            .neq("id", prod.id)
            .limit(4),
        ]);
        if (!alive) return;
        setSubcategoryName(((subRes.data as Subcategory | null)?.name) ?? null);
        setRelated(((relRes as { data: Product[] | null }).data ?? []) as Product[]);
      } else {
        setSubcategoryName(null);
        setRelated([]);
      }
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
      <section className="bg-foam pt-28 md:pt-32 pb-8">
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative bg-card rounded-3xl overflow-hidden shadow-elegant aspect-square lg:col-span-3"
            >
              <img
                src={product.image_url || feedImg}
                alt={product.name}
                className="w-full h-full object-contain p-6"
              />
              <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full glass text-white text-xs font-semibold flex items-center gap-1.5 z-10">
                <Tag className="w-3 h-3" /> {product.category}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col lg:col-span-2 lg:sticky lg:top-24"
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-ocean mb-3">
                {product.category}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-navy-deep mb-3 leading-tight">
                {product.name}
              </h1>
              {subcategoryName && (
                <div className="mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foam border border-border text-xs font-semibold text-ocean">
                    <Tag className="w-3 h-3" /> {subcategoryName}
                  </span>
                </div>
              )}

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

              <h2 className="text-sm font-bold uppercase tracking-widest text-navy-deep mb-2">
                Descripción
              </h2>
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

          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="text-2xl font-bold text-navy-deep mb-8">
                Otros productos en {product.category}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    to="/productos/$productId"
                    params={{ productId: p.slug || p.id }}
                    className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-all hover:-translate-y-2"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={p.image_url || feedImg}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-navy-deep text-sm mb-1 group-hover:text-ocean transition">
                        {p.name}
                      </h3>
                      <span className="text-lg font-bold text-navy-deep">
                        ${Number(p.price).toFixed(2)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}