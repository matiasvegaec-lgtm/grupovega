/**
 * Hero decoration: floating shrimp feed sacks with parallax + bubbles.
 * Replaces the previous Three.js atom-style scene with real product imagery.
 */
const sacks = [
  {
    src: "/sacks/exia-duo.png",
    alt: "Sacos Exia Perform y Exia Prime",
    className:
      "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 lg:w-[32rem] rotate-[-4deg] animate-float-slow drop-shadow-[0_45px_60px_rgba(8,20,55,0.65)]",
    delay: "0s",
  },
  {
    src: "/sacks/exia-prime.png",
    alt: "Saco Exia Prime",
    className:
      "left-[4%] top-[22%] w-32 sm:w-40 lg:w-48 rotate-[-10deg] animate-float opacity-90",
    delay: "0.8s",
  },
  {
    src: "/sacks/exia-perform.png",
    alt: "Saco Exia Perform",
    className:
      "right-[5%] bottom-[14%] w-32 sm:w-40 lg:w-52 rotate-[8deg] animate-float opacity-90",
    delay: "1.4s",
  },
];

export function UnderwaterScene() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      {/* Glow accents */}
      <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[var(--gradient-glow)] opacity-60 blur-2xl" />

      {/* Floating bubbles */}
      {Array.from({ length: 14 }).map((_, i) => {
        const size = 8 + Math.random() * 22;
        const left = Math.random() * 100;
        const duration = 8 + Math.random() * 10;
        const delay = Math.random() * 8;
        return (
          <span
            key={i}
            className="absolute bottom-[-40px] rounded-full bg-white/30 backdrop-blur-[2px] ring-1 ring-white/40"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              animation: `bubble-rise ${duration}s linear ${delay}s infinite`,
            }}
          />
        );
      })}

      {/* Floating sacks */}
      {sacks.map((s, i) => (
        <img
          key={i}
          src={s.src}
          alt={s.alt}
          loading="eager"
          className={`absolute drop-shadow-[0_25px_45px_rgba(8,20,55,0.55)] ${s.className}`}
          style={{ animationDelay: s.delay }}
        />
      ))}
    </div>
  );
}