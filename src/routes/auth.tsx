import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Layout } from "@/components/Layout";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import logoGrupoVega from "@/assets/logo-grupo-vega.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso — Grupo Vega" },
      { name: "description", content: "Inicia sesión o crea tu cuenta para comprar." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const { redirect } = useSearch({ from: "/auth" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (redirect) {
      navigate({ to: redirect as any });
    } else if (isAdmin) {
      navigate({ to: "/admin/productos" });
    } else {
      navigate({ to: "/" });
    }
  }, [user, isAdmin, loading, navigate, redirect]);

  const handleGoogle = async () => {
    setSubmitting(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + (redirect || "/"),
    });
    if (result.error) {
      toast.error("No se pudo iniciar con Google");
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-foam via-background to-foam">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-elegant border border-border">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img src={logoGrupoVega} alt="Grupo Vega" className="h-14 w-auto object-contain" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-navy-deep mb-1 text-center">
              Iniciar sesión
            </h1>
            <p className="text-sm text-ocean mb-7 text-center">
              Inicia sesión o crea una cuenta con tu Google
            </p>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white border-2 border-border text-navy-deep font-semibold hover:bg-foam hover:border-ocean transition disabled:opacity-60 shadow-sm"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 8-21l5.7-5.7A20 20 0 1 0 24 44c11 0 20-9 20-20 0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.8-2 13.3-5.2l-6.1-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.1 4.1-3.9 5.6l6.1 5.2C40.9 35.6 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
              )}
              Continuar con Google
            </button>

            <p className="text-xs text-center text-muted-foreground mt-6">
              Si continúas, aceptas nuestros{" "}
              <Link to="/contacto" className="underline hover:text-ocean">
                Términos del servicio
              </Link>
            </p>

            {user && !isAdmin && (
              <p className="text-xs text-center text-muted-foreground mt-4">
                Sesión iniciada. <Link to="/" className="text-ocean">Ir al inicio</Link>
              </p>
            )}
          </div>

          <p className="text-xs text-center text-muted-foreground mt-6 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Tu información está protegida
          </p>
        </div>
      </section>
    </Layout>
  );
}