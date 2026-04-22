import { useEffect, useState } from "react";
import productsImg from "@/assets/hero-products-group.png";

export function UnderwaterScene() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  if (isMobile) return null;

  return (
    <div
      className="
        pointer-events-none absolute -z-0 animate-fade-in
        bottom-0 right-0 w-[60%] max-w-[460px] h-[60%]
        md:w-[55%] md:max-w-[640px] md:h-[85%]
        lg:max-w-[760px] lg:h-[95%]
        xl:max-w-[880px]
        2xl:max-w-[1000px]
      "
    >
      {/* Halo / glow detrás de los productos */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 70%, oklch(0.65 0.15 230 / 0.35), transparent 60%)",
          filter: "blur(20px)",
        }}
      />
      {/* Sombra proyectada en el suelo */}
      <div
        className="absolute bottom-[6%] left-[15%] right-[10%] h-[40px] rounded-[50%]"
        style={{
          background: "radial-gradient(ellipse, oklch(0.1 0.05 258 / 0.55), transparent 70%)",
          filter: "blur(14px)",
        }}
      />
      <img
        src={productsImg}
        alt="Productos Grupo Vega"
        className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
      />
    </div>
  );
}