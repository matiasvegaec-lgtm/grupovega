import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SITE = "https://grupovega.lovable.app";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticUrls = ["/", "/productos", "/quienes-somos", "/contacto"];
        let productUrls: { loc: string; lastmod?: string }[] = [];
        try {
          const { data } = await supabaseAdmin
            .from("products")
            .select("slug, id, updated_at")
            .eq("active", true);
          productUrls = (data ?? []).map((p) => ({
            loc: `${SITE}/productos/${p.slug ?? p.id}`,
            lastmod: p.updated_at,
          }));
        } catch {}

        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticUrls
          .map((u) => `<url><loc>${SITE}${u}</loc></url>`)
          .join("\n")}\n${productUrls
          .map(
            (p) =>
              `<url><loc>${p.loc}</loc>${p.lastmod ? `<lastmod>${new Date(p.lastmod).toISOString()}</lastmod>` : ""}</url>`
          )
          .join("\n")}\n</urlset>`;

        return new Response(body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});