import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";
import logoGrupoVega from "@/assets/logo-grupo-vega.png";

export function Footer() {
  return (
    <footer className="relative gradient-deep text-white overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{ background: "var(--gradient-glow)" }} />
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <img
              src={logoGrupoVega}
              alt="Grupo Vega"
              className="h-14 w-auto object-contain mb-4"
            />
            <p className="text-white/70 text-sm leading-relaxed">
              Soluciones integrales para la industria camaronera del Ecuador. Innovación, calidad y sostenibilidad desde 1998.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-turquoise">Compañía</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/" className="hover:text-turquoise transition">Inicio</Link></li>
              <li><Link to="/productos" className="hover:text-turquoise transition">Productos</Link></li>
              <li><Link to="/contacto" className="hover:text-turquoise transition">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-turquoise">Soluciones</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/productos" className="hover:text-turquoise transition">Alimento balanceado</Link></li>
              <li><Link to="/productos" className="hover:text-turquoise transition">Probióticos</Link></li>
              <li><Link to="/productos" className="hover:text-turquoise transition">Fertilizantes</Link></li>
              <li><Link to="/productos" className="hover:text-turquoise transition">Equipos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-turquoise">Contacto</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-turquoise" /> Importadora Vega, Manta — Ecuador</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-turquoise" /> +593 99 773 8026</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-turquoise" /> grupovega.ec@gmail.com</li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-turquoise/30 transition"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-turquoise/30 transition"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-turquoise/30 transition"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-sm text-white/50">
          <p>© {new Date().getFullYear()} Grupo Vega. Todos los derechos reservados.</p>
          <p>Hecho con <span className="text-turquoise">●</span> para camaroneras del Ecuador</p>
        </div>
      </div>
    </footer>
  );
}