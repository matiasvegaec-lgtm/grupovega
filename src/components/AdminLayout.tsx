import { Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { Package, Users, LogOut, Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-ocean" />
      </div>
    );
  }

  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-md">
          <ShieldAlert className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold text-navy-deep mb-2">Acceso restringido</h1>
          <p className="text-muted-foreground mb-6">Tu cuenta no tiene permisos de administrador.</p>
          <button onClick={async () => { await signOut(); navigate({ to: "/auth" }); }} className="px-6 py-3 rounded-full gradient-wave text-white font-semibold">Cerrar sesión</button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const links = [
    { to: "/admin/productos", label: "Productos", icon: Package },
    { to: "/admin/usuarios", label: "Usuarios", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-60 bg-card border-r border-border p-4 flex flex-col">
        <Link to="/" className="font-bold text-navy-deep text-lg mb-8 px-2">AquaMar Admin</Link>
        <nav className="space-y-1 flex-1">
          {links.map((l) => {
            const Icon = l.icon;
            const active = location.pathname.startsWith(l.to);
            return (
              <Link key={l.to} to={l.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${active ? "gradient-wave text-white" : "text-navy-deep hover:bg-foam"}`}>
                <Icon className="w-4 h-4" /> {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border pt-4 space-y-2">
          <p className="text-xs text-muted-foreground px-2 truncate">{user.email}</p>
          <button onClick={async () => { await signOut(); navigate({ to: "/auth" }); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-foam transition">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}