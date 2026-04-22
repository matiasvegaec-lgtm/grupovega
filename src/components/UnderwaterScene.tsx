import { useEffect, useState } from "react";
import productsImg from "@/assets/hero-products-group.png";

const BUBBLES = Array.from({ length: 14 }, (_, i) => {
  const size = 8 + ((i * 7) % 28);
  return {
    left: `${(i * 13 + 5) % 95}%`,
    size,
    delay: (i * 0.7) % 8,
    duration: 7 + ((i * 1.3) % 8),
    opacity: 0.25 + ((i * 0.11) % 0.45),
  };
});

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
    <>
      {/* Burbujas decorativas que suben por todo el hero */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-0">
        {BUBBLES.map((b, i) => (
          <span
            key={i}
            className="absolute bottom-0 rounded-full"
            style={{
              left: b.left,
              width: `${b.size}px`,
              height: `${b.size}px`,
              background:
                "radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.9), oklch(0.85 0.08 230 / 0.4) 60%, transparent 70%)",
              border: "1px solid oklch(1 0 0 / 0.4)",
              opacity: b.opacity,
              animation: `bubble-rise ${b.duration}s linear ${b.delay}s infinite`,
            }}
          />
        ))}
      </div>

    <div
      className="
        pointer-events-none absolute -z-0 animate-fade-in
        bottom-0 right-0 w-[70%] max-w-[560px] h-[75%]
        md:w-[65%] md:max-w-[820px] md:h-[100%]
        lg:max-w-[980px] lg:h-[110%]
        xl:max-w-[1120px]
        2xl:max-w-[1280px]
      "
        style={{ animationDuration: "1.2s" }}
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
    </>
  );
}