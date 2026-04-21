import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useState, FormEvent, useEffect } from "react";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin/productos` },
        });
        if (error) throw error;
        toast.success("Cuenta creada. Revisa tu correo si requiere confirmación.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenido");
      }
    } catch (err: any) {
      toast.error(err.message || "Error de autenticación");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20 transition";

  return (
    <Layout>
      <PageHero eyebrow="Panel" title={mode === "login" ? "Iniciar sesión" : "Crear cuenta"} description="Acceso restringido a administradores." />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-white border border-border text-navy-deep font-semibold hover:bg-foam transition disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 8-21l5.7-5.7A20 20 0 1 0 24 44c11 0 20-9 20-20 0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.8-2 13.3-5.2l-6.1-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.1 4.1-3.9 5.6l6.1 5.2C40.9 35.6 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
              Continuar con Google
            </button>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border" /> o con email <div className="flex-1 h-px bg-border" />
            </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" required placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            <input type="password" required minLength={6} placeholder="Contraseña (mín. 6)" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
            <button disabled={submitting} type="submit" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-60">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {mode === "login" ? "Entrar" : "Registrarme"}
            </button>
            <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="w-full text-sm text-ocean hover:underline">
              {mode === "login" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Iniciar sesión"}
            </button>
            {user && !isAdmin && (
              <p className="text-xs text-center text-muted-foreground">
                Estás autenticado pero no eres admin. <Link to="/" className="text-ocean">Ir al inicio</Link>
              </p>
            )}
          </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}