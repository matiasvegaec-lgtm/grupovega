import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useTexture } from "@react-three/drei";
import { useRef, Suspense, useEffect, useState } from "react";
import * as THREE from "three";
import productsImg from "@/assets/hero-products-group.png";
import productMobileImg from "@/assets/hero-product-mobile.png";

function ProductsGroup({ textureUrl, aspect = 1.05, animated = true }: { textureUrl: string; aspect?: number; animated?: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useTexture(textureUrl);
  texture.anisotropy = 16;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  useFrame((state) => {
    if (!ref.current || !animated) return;
    const t = state.clock.elapsedTime;
    // Suave flotación + ligera inclinación 3D para sensación de volumen
    ref.current.position.y = Math.sin(t * 0.8) * 0.15;
    ref.current.position.x = Math.sin(t * 0.4) * 0.08;
    ref.current.rotation.y = Math.sin(t * 0.5) * 0.12;
    ref.current.rotation.x = Math.cos(t * 0.4) * 0.05;
    ref.current.rotation.z = Math.sin(t * 0.3) * 0.02;
  });

  return (
    <mesh
      ref={ref}
      scale={[3.2, 3.2, 1]}
      rotation={animated ? [0, 0, 0] : [-0.08, -0.25, 0]}
    >
      <planeGeometry args={[1, aspect]} />
      <meshStandardMaterial
        map={texture}
        transparent
        alphaTest={0.05}
        side={THREE.DoubleSide}
        roughness={0.4}
        metalness={0.25}
      />
    </mesh>
  );
}

function Scene({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      {/* Luz ambiental suave */}
      <ambientLight intensity={0.5} />
      {/* Luz principal cálida desde arriba-izquierda */}
      <directionalLight position={[-4, 6, 5]} intensity={2.4} color="#ffffff" castShadow />
      {/* Luz de relleno fría desde la derecha */}
      <pointLight position={[5, 2, 4]} intensity={2} color="#88ccff" />
      {/* Luz de contorno trasera para resaltar bordes */}
      <pointLight position={[3, -2, -3]} intensity={1.6} color="#4DA6FF" />
      {/* Luz superior tipo spot para volumen */}
      <spotLight position={[0, 5, 3]} angle={0.5} penumbra={0.8} intensity={1.5} color="#ffffff" />

      <Suspense fallback={null}>
        <ProductsGroup
          textureUrl={isMobile ? productMobileImg : productsImg}
          aspect={isMobile ? 1.4 : 1.05}
          animated={!isMobile}
        />
      </Suspense>

      <Environment preset="city" />
    </>
  );
}

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
        pointer-events-none absolute -z-0
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
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        dpr={[2, 3]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene key={isMobile ? "m" : "d"} isMobile={isMobile} />
        </Suspense>
      </Canvas>
    </div>
  );
}