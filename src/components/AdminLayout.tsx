import { Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, Users, LogOut, Loader2, ShieldAlert, ShoppingBag, FolderTree, Menu, X, Mail, Image as ImageIcon, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/admin" } });
  }, [loading, user, navigate]);

  // Cierra el drawer al cambiar de ruta
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

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
          <button onClick={async () => { await signOut(); navigate({ to: "/auth", search: { redirect: "/" } }); }} className="px-6 py-3 rounded-full gradient-wave text-white font-semibold">Cerrar sesión</button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const links = [
    { to: "/admin/analitica", label: "Analítica", icon: BarChart3 },
    { to: "/admin/productos", label: "Productos", icon: Package },
    { to: "/admin/categorias", label: "Categorías", icon: FolderTree },
    { to: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
    { to: "/admin/clientes", label: "Clientes", icon: Mail },
    { to: "/admin/usuarios", label: "Usuarios", icon: Users },
    { to: "/admin/galeria", label: "Galería", icon: ImageIcon },
  ];

  const activeLink = links.find((l) => location.pathname.startsWith(l.to));

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Top bar mobile */}
      <header className="md:hidden sticky top-0 z-30 bg-card border-b border-border flex items-center justify-between px-4 h-14">
        <button onClick={() => setMenuOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-foam" aria-label="Abrir menú">
          <Menu className="w-5 h-5 text-navy-deep" />
        </button>
        <div className="font-bold text-navy-deep text-sm truncate">
          {activeLink?.label ?? "Admin"}
        </div>
        <Link to="/" className="text-xs text-ocean font-semibold">Tienda</Link>
      </header>

      {/* Drawer mobile */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside onClick={(e) => e.stopPropagation()} className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-card p-4 flex flex-col shadow-elegant animate-in slide-in-from-left">
            <div className="flex items-center justify-between mb-6">
              <Link to="/" className="font-bold text-navy-deep">Dashboard Grupo Vega</Link>
              <button onClick={() => setMenuOpen(false)} className="p-2 -mr-2 rounded-lg hover:bg-foam"><X className="w-5 h-5" /></button>
            </div>
            <nav className="space-y-1 flex-1">
              {links.map((l) => {
                const Icon = l.icon;
                const active = location.pathname.startsWith(l.to);
                return (
                  <Link key={l.to} to={l.to} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition ${active ? "gradient-wave text-white" : "text-navy-deep hover:bg-foam"}`}>
                    <Icon className="w-4 h-4" /> {l.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-border pt-4 space-y-2">
              <p className="text-xs text-muted-foreground px-2 truncate">{user.email}</p>
              <button onClick={async () => { await signOut(); navigate({ to: "/auth", search: { redirect: "/" } }); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-foam transition">
                <LogOut className="w-4 h-4" /> Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-60 bg-card border-r border-border p-4 flex-col">
        <Link to="/" className="font-bold text-navy-deep text-lg mb-8 px-2">Dashboard Grupo Vega</Link>
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
          <button onClick={async () => { await signOut(); navigate({ to: "/auth", search: { redirect: "/" } }); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-foam transition">
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