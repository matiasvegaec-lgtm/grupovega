import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart, User, Heart, Package, Bell, Mail, LogOut, LogIn, UserCircle } from "lucide-react";
import logoGrupoVega from "@/assets/logo-grupo-vega.png";
import { useCart } from "@/contexts/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { PromoSubscribeDialog } from "@/components/PromoSubscribeDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/productos", label: "Productos" },
  { to: "/quienes-somos", label: "Quiénes Somos" },
  { to: "/contacto", label: "Contacto" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const { count } = useCart();
  const { count: favCount } = useFavorites();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-light shadow-card" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <Link to="/" className="flex items-center group">
            <img
              src={logoGrupoVega}
              alt="Grupo Vega"
              className={`h-10 md:h-12 w-auto object-contain group-hover:scale-105 transition-transform ${
                scrolled ? "" : "drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
              }`}
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  scrolled
                    ? "text-navy-deep hover:bg-foam"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
                activeProps={{
                  className: scrolled ? "text-ocean bg-foam" : "text-turquoise bg-white/10",
                }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label="Carrito"
              className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                scrolled ? "text-navy-deep hover:bg-foam" : "text-white hover:bg-white/10"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-ocean text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Mi cuenta"
                  className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full mr-2 transition-colors ${
                    scrolled ? "text-navy-deep hover:bg-foam" : "text-white hover:bg-white/10"
                  }`}
                >
                  <User className="w-5 h-5" />
                  {favCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                      {favCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
                <DropdownMenuLabel className="px-3 py-2">
                  {user ? (
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full gradient-wave flex items-center justify-center text-white">
                        <UserCircle className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">Hola,</div>
                        <div className="text-sm font-semibold text-navy-deep truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm font-semibold text-navy-deep">Mi cuenta</div>
                      <div className="text-xs text-muted-foreground">Inicia sesión para acceder</div>
                    </div>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!user ? (
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link to="/auth" search={{ redirect: undefined }} className="flex items-center gap-2.5 px-3 py-2">
                      <LogIn className="w-4 h-4 text-ocean" />
                      <span>Iniciar sesión / Registrarse</span>
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to="/mis-pedidos" className="flex items-center gap-2.5 px-3 py-2">
                        <Package className="w-4 h-4 text-ocean" />
                        <span>Mis pedidos</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <button
                        type="button"
                        onClick={() => setCartOpen(true)}
                        className="w-full flex items-center justify-between gap-2.5 px-3 py-2"
                      >
                        <span className="flex items-center gap-2.5">
                          <ShoppingCart className="w-4 h-4 text-ocean" />
                          <span>Carrito</span>
                        </span>
                        {count > 0 && (
                          <span className="bg-ocean text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] px-1 flex items-center justify-center">
                            {count}
                          </span>
                        )}
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to="/favoritos" className="flex items-center justify-between gap-2.5 px-3 py-2">
                        <span className="flex items-center gap-2.5">
                          <Heart className="w-4 h-4 text-orange-500" />
                          <span>Favoritos</span>
                        </span>
                        {favCount > 0 && (
                          <span className="bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] px-1 flex items-center justify-center">
                            {favCount}
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <button
                        type="button"
                        onClick={() => setPromoOpen(true)}
                        className="w-full flex items-center gap-2.5 px-3 py-2"
                      >
                        <Mail className="w-4 h-4 text-turquoise" />
                        <span>Recibir promociones</span>
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to="/notificaciones" className="flex items-center gap-2.5 px-3 py-2">
                        <Bell className="w-4 h-4 text-turquoise" />
                        <span>Notificaciones</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
                    >
                      <span className="flex items-center gap-2.5 px-3 py-2">
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar sesión</span>
                      </span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              to="/contacto"
              className="inline-flex items-center px-5 py-2.5 rounded-full gradient-wave text-white text-sm font-semibold shadow-glow hover:scale-105 transition-transform"
            >
              Contáctanos
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label="Carrito"
              className={`relative p-2 rounded-md ${scrolled ? "text-navy-deep" : "text-white"}`}
            >
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute top-0 right-0 bg-ocean text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
            <Link
              to="/auth"
              search={{ redirect: undefined }}
              aria-label="Mi cuenta"
              className={`p-2 rounded-md ${scrolled ? "text-navy-deep" : "text-white"}`}
            >
              <User className="w-5 h-5" />
            </Link>
            <button
            onClick={() => setOpen(!open)}
            className={`p-2 rounded-md ${scrolled ? "text-navy-deep" : "text-white"}`}
            aria-label="Menú"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden glass-light border-t border-border animate-in slide-in-from-top">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-lg text-navy-deep hover:bg-foam font-medium"
              >
                {l.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            {!user ? (
              <Link to="/auth" search={{ redirect: undefined }} onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-navy-deep hover:bg-foam font-medium flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Iniciar sesión / Registrarse
              </Link>
            ) : (
              <>
                <Link to="/mis-pedidos" onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-navy-deep hover:bg-foam font-medium flex items-center gap-2">
                  <Package className="w-4 h-4" /> Mis pedidos
                </Link>
                <Link to="/favoritos" onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-navy-deep hover:bg-foam font-medium flex items-center gap-2">
                  <Heart className="w-4 h-4" /> Favoritos
                </Link>
                <Link to="/notificaciones" onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-navy-deep hover:bg-foam font-medium flex items-center gap-2">
                  <Bell className="w-4 h-4" /> Notificaciones
                </Link>
                <button
                  type="button"
                  onClick={() => { setOpen(false); setPromoOpen(true); }}
                  className="text-left px-4 py-3 rounded-lg text-navy-deep hover:bg-foam font-medium flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" /> Recibir promociones
                </button>
                <button
                  type="button"
                  onClick={() => { setOpen(false); signOut(); }}
                  className="text-left px-4 py-3 rounded-lg text-destructive hover:bg-foam font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Cerrar sesión
                </button>
              </>
            )}
            <Link
              to="/contacto"
              onClick={() => setOpen(false)}
              className="mt-2 px-4 py-3 rounded-lg gradient-wave text-white font-semibold text-center"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      )}
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <PromoSubscribeDialog open={promoOpen} onOpenChange={setPromoOpen} />
    </header>
  );
}