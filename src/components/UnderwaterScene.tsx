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
        pointer-events-none absolute -z-0
        bottom-[-5%] -right-[8%] w-[80%] max-w-[640px] h-[85%]
        md:-right-[10%] md:w-[75%] md:max-w-[960px] md:h-[115%]
        lg:-right-[12%] lg:max-w-[1140px] lg:h-[125%]
        xl:-right-[14%] xl:max-w-[1300px]
        2xl:max-w-[1480px]
      "
    >
      {/* Halo / glow detrás de los productos */}
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          background:
            "radial-gradient(ellipse at 60% 60%, oklch(0.7 0.18 220 / 0.55), transparent 65%)",
          filter: "blur(30px)",
          animationDuration: "4s",
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
        className="relative z-10 w-full h-full object-contain hero-product-reveal"
      />
      </div>
    </>
  );
}