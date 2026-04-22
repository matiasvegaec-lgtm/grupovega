import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, useTexture } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";
import exiaImg from "@/assets/hero-exia.png";
import ecofreshImg from "@/assets/hero-ecofresh.png";
import larvivaImg from "@/assets/hero-larviva.png";

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

function ProductCard({
  position,
  textureUrl,
  scale = 1.6,
  driftOffset = 0,
}: {
  position: [number, number, number];
  textureUrl: string;
  scale?: number;
  driftOffset?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useTexture(textureUrl);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    // sin rotación: solo desplazamiento suave en el espacio 3D
    ref.current.position.x = position[0] + Math.sin(t * 0.6 + driftOffset) * 0.35;
    ref.current.position.y = position[1] + Math.cos(t * 0.5 + driftOffset) * 0.3;
    ref.current.position.z = position[2] + Math.sin(t * 0.4 + driftOffset) * 0.4;
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.05} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}

function Scene() {
  const bubbles = Array.from({ length: 25 }, (_, i) => ({
    position: [(Math.random() - 0.5) * 10, Math.random() * 8 - 4, (Math.random() - 0.5) * 5] as [number, number, number],
    scale: 0.5 + Math.random() * 1.5,
    speed: 0.3 + Math.random() * 0.8,
  }));

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#88ddff" />
      <pointLight position={[-5, -5, 5]} intensity={2} color="#4DA6FF" />
      <pointLight position={[5, 5, -5]} intensity={1.5} color="#00C2CB" />

      <Suspense fallback={null}>
        <ProductCard position={[-2.8, 0.3, 0]} textureUrl={exiaImg} driftOffset={0} />
        <ProductCard position={[2.8, -0.4, -1]} textureUrl={ecofreshImg} driftOffset={1.8} />
        <ProductCard position={[0, 1.6, -2]} textureUrl={larvivaImg} driftOffset={3.6} scale={1.4} />
      </Suspense>

      {bubbles.map((b, i) => (
        <Bubble key={i} {...b} />
      ))}

      <Environment preset="sunset" />
    </>
  );
}

export function UnderwaterScene() {
  return (
    <div className="absolute inset-0 -z-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}