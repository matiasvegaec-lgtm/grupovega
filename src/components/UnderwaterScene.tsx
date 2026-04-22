import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useRef, Suspense, useState, useEffect } from "react";
import * as THREE from "three";
import productsImg from "@/assets/hero-products-group.png";

function Bubble({ position, scale = 1, speed = 1 }: { position: [number, number, number]; scale?: number; speed?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + ((state.clock.elapsedTime * speed) % 8) - 4;
    ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.3;
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshPhysicalMaterial color="#ffffff" transparent opacity={0.4} roughness={0} transmission={0.9} thickness={0.5} />
    </mesh>
  );
}

function BubblesField() {
  const bubbles = Array.from({ length: 22 }, () => ({
    position: [(Math.random() - 0.5) * 10, Math.random() * 8 - 4, (Math.random() - 0.5) * 5] as [number, number, number],
    scale: 0.5 + Math.random() * 1.5,
    speed: 0.3 + Math.random() * 0.8,
  }));
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[-5, -5, 5]} intensity={2} color="#4DA6FF" />
      <pointLight position={[5, 5, -5]} intensity={1.5} color="#00C2CB" />
      {bubbles.map((b, i) => (
        <Bubble key={i} {...b} />
      ))}
    </>
  );
}

function ProductsGroup() {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useTexture(productsImg);

  // Mejorar calidad de la textura
  texture.anisotropy = 16;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  (texture as any).colorSpace = THREE.SRGBColorSpace;

  // Aspect ratio real de la imagen (≈ 940x1180 → 0.8)
  const aspect = 0.8;
  const height = 3.4;
  const width = height * aspect;

  return (
    <mesh ref={ref} scale={[width, height, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.05}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <Suspense fallback={null}>
        <ProductsGroup />
      </Suspense>
    </>
  );
}

export function UnderwaterScene() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Burbujas en toda la escena (fondo) */}
      <div className="absolute inset-0 -z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={[1, 2]} gl={{ alpha: true }} style={{ background: "transparent" }}>
          <Suspense fallback={null}>
            <BubblesField />
          </Suspense>
        </Canvas>
      </div>

      {/* Productos en esquina inferior derecha con animación de aparición */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 -z-0 w-[60%] sm:w-[50%] md:w-[42%] max-w-[520px] h-[55%] sm:h-[65%] md:h-[80%] transition-all duration-[1400ms] ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translate(0, 0) scale(1)" : "translate(40px, 40px) scale(0.92)",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Halo / glow detrás de los productos */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 60% 65%, oklch(0.65 0.15 230 / 0.35), transparent 60%)",
            filter: "blur(24px)",
          }}
        />
        {/* Sombra proyectada en el suelo */}
        <div
          className="absolute bottom-[4%] left-[10%] right-[8%] h-[36px] rounded-[50%]"
          style={{
            background: "radial-gradient(ellipse, oklch(0.1 0.05 258 / 0.55), transparent 70%)",
            filter: "blur(14px)",
          }}
        />
        <Canvas
          camera={{ position: [0, 0, 4.2], fov: 45 }}
          dpr={[1.5, 3]}
          gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}