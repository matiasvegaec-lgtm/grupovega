import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, ShoppingCart, Loader2, Check, Package, Tag } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Layout } from "@/components/Layout";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import feedImg from "@/assets/product-feed.jpg";
import paymentMethods from "@/assets/payment-methods.png";

type Supplier = { name: string; img: string; scale: number };

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
  presentation: string | null;
  protein_content: string | null;
  price_card_3m: number | null;
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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "center" });
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    supabase
      .from("supplier_logos")
      .select("name, image_url, display_scale")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setSuppliers(
          (data ?? []).map((s) => ({
            name: s.name,
            img: s.image_url,
            scale: (s as { display_scale?: number }).display_scale ?? 100,
          })),
        );
      });
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIdx(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, related.length]);

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
            .limit(20),
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
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-stretch">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative bg-white rounded-3xl overflow-hidden shadow-elegant border border-border lg:sticky lg:top-24 lg:self-start aspect-square"
            >
              <img
                src={product.image_url || feedImg}
                alt={product.name}
                className="w-full h-full object-contain p-8"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col"
            >
              <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-md bg-ocean/10 text-ocean text-xs font-bold uppercase tracking-wider mb-3">
                <Tag className="w-3 h-3" /> {product.category}
                {subcategoryName && (
                  <span className="font-semibold normal-case tracking-normal opacity-80">
                    {" · "}{subcategoryName}
                  </span>
                )}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-navy-deep mb-3 leading-tight">
                {product.name}
              </h1>

              {product.stock > 0 ? (
                <p className="text-base font-bold text-red-600 mb-4">
                  ¡Disponibles {product.stock}!
                </p>
              ) : (
                <p className="text-base font-bold text-muted-foreground mb-4">Agotado</p>
              )}

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-ocean">
                  ${Number(product.price).toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">precio x unidad</span>
              </div>

              {/* Especificaciones rápidas */}
              {(product.presentation || product.protein_content || product.price_card_3m) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {product.presentation && (
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Presentación</p>
                      <p className="text-base font-bold text-navy-deep mt-0.5">{product.presentation}</p>
                    </div>
                  )}
                  {product.protein_content && (
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Proteína</p>
                      <p className="text-base font-bold text-navy-deep mt-0.5">{product.protein_content}</p>
                    </div>
                  )}
                  {product.price_card_3m && Number(product.price_card_3m) > 0 && (
                    <div className="rounded-xl border border-turquoise/40 bg-gradient-to-br from-turquoise/10 to-ocean/10 p-3 sm:col-span-2">
                      <p className="text-[11px] uppercase tracking-wider text-ocean font-bold">Pago con tarjeta · 3 meses sin intereses</p>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <p className="text-lg font-bold text-navy-deep">
                          3 × ${(Number(product.price_card_3m) / 3).toFixed(2)}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          (Total ${Number(product.price_card_3m).toFixed(2)})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cantidad + CTA en línea, estilo referencia */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-navy-deep">Cantidad</span>
                  <div className="inline-flex items-center bg-card border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-3 py-2 text-lg font-bold text-navy-deep hover:bg-foam transition"
                      aria-label="Disminuir"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 font-semibold text-navy-deep min-w-[3ch] text-center border-x border-border">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}
                      className="px-3 py-2 text-lg font-bold text-navy-deep hover:bg-foam transition"
                      aria-label="Aumentar"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  disabled={product.stock <= 0}
                  onClick={handleAdd}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-turquoise hover:bg-turquoise/90 text-white font-bold uppercase tracking-wide text-sm shadow-glow transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" /> Agregar al carrito
                </button>
              </div>

              <p className="text-sm text-navy-deep mb-6">
                <span className="font-semibold">Referencia:</span>{" "}
                <span className="text-muted-foreground">{product.id.slice(0, 8).toUpperCase()}</span>
              </p>

              <div className="border-t border-border pt-6 mb-6">
                <h2 className="text-lg font-bold text-navy-deep mb-3">Descripción del producto</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                  {product.description ? (
                    <p className="whitespace-pre-line">{product.description}</p>
                  ) : (
                    <p className="italic">Sin descripción disponible.</p>
                  )}
                </div>
              </div>

              <div className="mb-3 w-full bg-white rounded-2xl px-4 py-4 flex items-center justify-center">
                <img
                  src={paymentMethods}
                  alt="Métodos de pago aceptados: Visa, Mastercard, American Express, Diners Club"
                  className="h-16 sm:h-20 w-auto object-contain"
                />
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
              {/* Mobile: header tipo banner + carrusel con flechas y dots (estilo referencia) */}
              <div className="md:hidden mb-6 rounded-2xl gradient-wave py-5 px-4 text-center shadow-card">
                <h2 className="text-xl font-bold text-white leading-snug">
                  Otros productos en {product.category}
                </h2>
              </div>
              <h2 className="hidden md:block text-2xl font-bold text-navy-deep mb-8">
                Otros productos en {product.category}
              </h2>

              {/* Mobile: carrusel una tarjeta a la vez */}
              <div className="md:hidden relative">
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex">
                    {related.map((p) => (
                      <div key={p.id} className="flex-[0_0_100%] min-w-0 px-2">
                        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                          <Link
                            to="/productos/$productId"
                            params={{ productId: p.slug || p.id }}
                            className="block relative"
                          >
                            <span className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full gradient-wave text-white text-xs font-semibold">
                              {p.category}
                            </span>
                            <div className="aspect-square bg-white flex items-center justify-center p-6">
                              <img
                                src={p.image_url || feedImg}
                                alt={p.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                          </Link>
                          <div className="p-5">
                            <p className="text-xs font-semibold uppercase tracking-widest text-ocean mb-1">
                              {p.category}
                            </p>
                            <Link
                              to="/productos/$productId"
                              params={{ productId: p.slug || p.id }}
                              className="block font-bold text-navy-deep text-base mb-2 hover:text-ocean transition"
                            >
                              {p.name}
                            </Link>
                            <p className="text-lg font-bold text-navy-deep mb-4">
                              ${Number(p.price).toFixed(2)}
                            </p>
                            <Link
                              to="/productos/$productId"
                              params={{ productId: p.slug || p.id }}
                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow"
                            >
                              <ShoppingCart className="w-4 h-4" /> Ver producto
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flechas laterales */}
                <button
                  type="button"
                  aria-label="Anterior"
                  onClick={() => emblaApi?.scrollPrev()}
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ocean/80 text-white flex items-center justify-center shadow-md active:scale-95 transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  aria-label="Siguiente"
                  onClick={() => emblaApi?.scrollNext()}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ocean/80 text-white flex items-center justify-center shadow-md active:scale-95 transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Dots */}
                <div className="flex items-center justify-center gap-2 mt-5">
                  {related.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Ir al producto ${i + 1}`}
                      onClick={() => emblaApi?.scrollTo(i)}
                      className={`rounded-full transition-all ${
                        i === selectedIdx
                          ? "w-2.5 h-2.5 bg-ocean"
                          : "w-2 h-2 bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop: grilla original */}
              <div className="hidden md:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Proveedores — marquee */}
      <section className="py-20 bg-foam overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-widest text-ocean mb-3">Proveedores</p>
            <h2 className="text-4xl md:text-5xl font-bold text-navy-deep">Marcas que distribuimos</h2>
            <p className="text-muted-foreground mt-4">
              Trabajamos con los líderes mundiales en nutrición y sanidad acuícola.
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-foam to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-foam to-transparent" />
          <div className="flex gap-6 animate-marquee-slow w-max hover:[animation-play-state:paused]">
            {(() => {
              const repeats = Math.max(1, Math.ceil(12 / Math.max(suppliers.length, 1)));
              const base = Array.from({ length: repeats }, () => suppliers).flat();
              return [...base, ...base];
            })().map((s, i) => (
              <div
                key={`${s.name}-${i}`}
                className="relative shrink-0 w-56 h-28 group"
              >
                <div className="absolute inset-0 gradient-wave rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition duration-500" />
                <div className="relative w-full h-full bg-white border border-border rounded-2xl flex items-center justify-center p-4 group-hover:border-ocean group-hover:shadow-elegant transition-all duration-300 overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.name}
                    loading="lazy"
                    style={{ transform: `scale(${(s.scale ?? 100) / 100})` }}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:opacity-90"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}