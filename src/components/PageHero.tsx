import { motion } from "framer-motion";

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="relative pt-32 pb-20 gradient-hero text-white overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-glow)" }} />
      <div className="absolute top-20 right-10 w-72 h-72 gradient-wave rounded-full blur-3xl opacity-30 animate-float-slow" />
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-turquoise mb-4">{eyebrow}</p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">{title}</h1>
          {description && <p className="text-lg md:text-xl text-white/80 leading-relaxed">{description}</p>}
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0,40L80,45C160,50,320,60,480,55C640,50,800,30,960,25C1120,20,1280,30,1360,35L1440,40L1440,80L0,80Z" style={{ fill: "var(--background)" }} />
        </svg>
      </div>
    </section>
  );
}