import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useTexture } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";
import productsImg from "@/assets/hero-products-group.png";

function ProductsGroup() {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useTexture(productsImg);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    // Suave flotación + ligera inclinación 3D para sensación de volumen
    ref.current.position.y = Math.sin(t * 0.8) * 0.15;
    ref.current.position.x = Math.sin(t * 0.4) * 0.08;
    ref.current.rotation.y = Math.sin(t * 0.5) * 0.12;
    ref.current.rotation.x = Math.cos(t * 0.4) * 0.05;
    ref.current.rotation.z = Math.sin(t * 0.3) * 0.02;
  });

  return (
    <mesh ref={ref} scale={[3.2, 3.2, 1]}>
      <planeGeometry args={[1, 1.05]} />
      <meshStandardMaterial
        map={texture}
        transparent
        alphaTest={0.05}
        side={THREE.DoubleSide}
        roughness={0.55}
        metalness={0.15}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      {/* Luz ambiental suave */}
      <ambientLight intensity={0.55} />
      {/* Luz principal cálida desde arriba-izquierda */}
      <directionalLight position={[-4, 6, 5]} intensity={2.2} color="#ffffff" castShadow />
      {/* Luz de relleno fría desde la derecha */}
      <pointLight position={[5, 2, 4]} intensity={1.8} color="#88ccff" />
      {/* Luz de contorno trasera */}
      <pointLight position={[0, -3, -3]} intensity={1.2} color="#4DA6FF" />

      <Suspense fallback={null}>
        <ProductsGroup />
      </Suspense>

      <Environment preset="city" />
    </>
  );
}

export function UnderwaterScene() {
  return (
    <div className="pointer-events-none absolute bottom-0 right-0 -z-0 w-[55%] max-w-[640px] h-[85%] md:h-[95%]">
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
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}