import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
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

/** Saco de balanceado estilizado en 3D */
function FeedSack({ position, rotation = [0, 0, 0], color = "#ffffff" }: { position: [number, number, number]; rotation?: [number, number, number]; color?: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = rotation[1] + state.clock.elapsedTime * 0.25;
  });
  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={1.4}>
      <group ref={ref} position={position} rotation={rotation}>
        {/* cuerpo del saco */}
        <mesh castShadow>
          <boxGeometry args={[1.1, 1.5, 0.55]} />
          <meshPhysicalMaterial color={color} roughness={0.85} sheen={1} sheenColor="#cfe6ff" clearcoat={0.2} />
        </mesh>
        {/* franja superior (cierre) */}
        <mesh position={[0, 0.78, 0]}>
          <boxGeometry args={[1.12, 0.1, 0.57]} />
          <meshStandardMaterial color="#1E5AA8" roughness={0.5} />
        </mesh>
        {/* etiqueta central */}
        <mesh position={[0, 0.1, 0.281]}>
          <planeGeometry args={[0.85, 0.55]} />
          <meshStandardMaterial color="#1E5AA8" roughness={0.4} metalness={0.1} />
        </mesh>
        {/* acento turquesa */}
        <mesh position={[0, -0.25, 0.282]}>
          <planeGeometry args={[0.85, 0.08]} />
          <meshStandardMaterial color="#00C2CB" emissive="#00C2CB" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

/** Camarón estilizado: cuerpo segmentado + cola */
function Shrimp({ position, color = "#ff8c69" }: { position: [number, number, number]; color?: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.2) * 0.25;
    ref.current.rotation.y = state.clock.elapsedTime * 0.4;
  });
  const segments = [0, 1, 2, 3, 4];
  return (
    <Float speed={2.2} rotationIntensity={0.6} floatIntensity={1.8}>
      <group ref={ref} position={position}>
        {/* cabeza */}
        <mesh position={[0.55, 0, 0]}>
          <sphereGeometry args={[0.32, 24, 24]} />
          <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.6} sheen={1} sheenColor="#ffd1b8" />
        </mesh>
        {/* segmentos del cuerpo */}
        {segments.map((i) => (
          <mesh key={i} position={[0.25 - i * 0.22, -i * 0.04, 0]} rotation={[0, 0, -i * 0.12]}>
            <torusGeometry args={[0.22 - i * 0.025, 0.09, 16, 24, Math.PI]} />
            <meshPhysicalMaterial color={color} roughness={0.4} clearcoat={0.5} />
          </mesh>
        ))}
        {/* cola */}
        <mesh position={[-0.95, -0.18, 0]} rotation={[0, 0, -0.7]}>
          <coneGeometry args={[0.22, 0.45, 16]} />
          <meshPhysicalMaterial color={color} roughness={0.4} clearcoat={0.5} />
        </mesh>
        {/* antenas */}
        <mesh position={[0.85, 0.18, 0.05]} rotation={[0, 0, 0.5]}>
          <cylinderGeometry args={[0.012, 0.012, 0.7, 8]} />
          <meshStandardMaterial color="#7a3320" />
        </mesh>
        <mesh position={[0.85, 0.18, -0.05]} rotation={[0, 0, 0.7]}>
          <cylinderGeometry args={[0.012, 0.012, 0.7, 8]} />
          <meshStandardMaterial color="#7a3320" />
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

      <FeedSack position={[-2.8, 0.3, 0]} rotation={[0.2, 0.4, 0.1]} color="#f5f7fa" />
      <FeedSack position={[2.6, -0.8, -1.5]} rotation={[-0.1, -0.3, -0.15]} color="#eef3f8" />
      <Shrimp position={[2.2, 1.2, 0]} color="#ff8c69" />
      <Shrimp position={[-2.0, -1.1, -0.5]} color="#ff7a5c" />
      <Shrimp position={[0.2, 0.6, -2]} color="#ffa07a" />

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