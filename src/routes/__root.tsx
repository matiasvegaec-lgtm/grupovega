import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Grupo Vega | Nutrición y Suministros Acuícolas" },
      { name: "description", content: "Grupo Vega: insumos, nutrición y suministros técnicos para camaroneras del Ecuador. Calidad y asesoría especializada." },
      { name: "author", content: "Grupo Vega" },
      { name: "google-site-verification", content: "RIJtNncWfVNlEcp5SqGeTnkzQL-Lc3QeRg3yZmOwsIM" },
      { property: "og:title", content: "Grupo Vega | Nutrición y Suministros Acuícolas" },
      { property: "og:description", content: "Grupo Vega: insumos, nutrición y suministros técnicos para camaroneras del Ecuador. Calidad y asesoría especializada." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/5f5XTXezHfbqfnSknv41Q2zwlNT2/social-images/social-1777859714361-imagen_bodega_grupo_vega.webp" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Grupo Vega" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@GrupoVega" },
      { name: "twitter:title", content: "Grupo Vega | Nutrición y Suministros Acuícolas" },
      { name: "twitter:description", content: "Grupo Vega: insumos, nutrición y suministros técnicos para camaroneras del Ecuador. Calidad y asesoría especializada." },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/5f5XTXezHfbqfnSknv41Q2zwlNT2/social-images/social-1777859714361-imagen_bodega_grupo_vega.webp" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/favicon.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      // Preload the actual woff2 files to short-circuit the CSS→font request chain
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPbF4C_k3HqU.woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5nw.woff2",
        crossOrigin: "anonymous",
      },
      // Load Google Fonts CSS non-render-blocking via preload + onload swap
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap",
        onLoad: "this.onload=null;this.rel='stylesheet'",
      } as any,
      // Fallback for no-JS clients
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap",
        media: "print",
        onLoad: "this.media='all'",
      } as any,
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Grupo Vega",
          url: "https://grupovega.lovable.app",
          logo: "https://grupovega.lovable.app/favicon.png",
          sameAs: [],
          contactPoint: [{
            "@type": "ContactPoint",
            telephone: "+593-99-773-8026",
            contactType: "sales",
            email: "grupovega.ec@outlook.com",
            areaServed: "EC",
            availableLanguage: ["Spanish"],
          }],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Grupo Vega",
          url: "https://grupovega.lovable.app",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartProvider>
          <AnalyticsTracker />
          <Outlet />
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
