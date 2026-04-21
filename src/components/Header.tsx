import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logoGrupoVega from "@/assets/logo-grupo-vega.jpg";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/productos", label: "Productos" },
  { to: "/contacto", label: "Contacto" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
            <div
              className={`relative rounded-xl px-3 py-1.5 transition-all duration-300 ${
                scrolled ? "bg-transparent" : "bg-white/90 backdrop-blur-sm shadow-card"
              }`}
            >
              <img
                src={logoGrupoVega}
                alt="Grupo Vega"
                className="h-9 md:h-11 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </div>
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

          <div className="hidden lg:block">
            <Link
              to="/contacto"
              className="inline-flex items-center px-5 py-2.5 rounded-full gradient-wave text-white text-sm font-semibold shadow-glow hover:scale-105 transition-transform"
            >
              Contáctanos
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className={`lg:hidden p-2 rounded-md ${scrolled ? "text-navy-deep" : "text-white"}`}
            aria-label="Menú"
          >
            {open ? <X /> : <Menu />}
          </button>
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
    </header>
  );
}