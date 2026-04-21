import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, useTexture } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

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

/** Saco de balanceado real renderizado en 3D usando textura */
function FeedSack({
  position,
  rotation = [0, 0, 0],
  textureUrl,
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  textureUrl: string;
  scale?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const texture = useTexture(textureUrl);
  texture.anisotropy = 8;

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.6) * 0.4;
    ref.current.rotation.z = rotation[2] + Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
  });

  // Proporción real del saco aprox 1:1.4
  const w = 1.4 * scale;
  const h = 2.0 * scale;
  const d = 0.45 * scale;

  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={1.6}>
      <group ref={ref} position={position} rotation={rotation}>
        {/* Cuerpo del saco con textura al frente y atrás */}
        <mesh>
          <boxGeometry args={[w, h, d]} />
          {/* 6 materiales: +x, -x, +y, -y, +z (frente), -z (atrás) */}
          <meshStandardMaterial attach="material-0" color="#e8eef5" roughness={0.9} />
          <meshStandardMaterial attach="material-1" color="#e8eef5" roughness={0.9} />
          <meshStandardMaterial attach="material-2" color="#dfe6ee" roughness={0.9} />
          <meshStandardMaterial attach="material-3" color="#dfe6ee" roughness={0.9} />
          <meshStandardMaterial attach="material-4" map={texture} roughness={0.75} />
          <meshStandardMaterial attach="material-5" map={texture} roughness={0.75} />
        </mesh>
      </group>
    </Float>
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

      <FeedSack position={[-2.6, 0.2, 0]} rotation={[0.1, 0.3, 0.08]} textureUrl="/sacks/exia-prime.png" scale={1} />
      <FeedSack position={[2.7, -0.3, -1]} rotation={[-0.1, -0.4, -0.12]} textureUrl="/sacks/exia-perform.png" scale={1} />
      <FeedSack position={[0.2, 1.4, -2.2]} rotation={[0.05, 0.2, 0]} textureUrl="/sacks/exia-prime.png" scale={0.8} />

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