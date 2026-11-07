import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const ENERGY_GREEN = '#5cff2a';
const RING_RADII = [1.75, 1.95, 2.15];

interface CoreMineSceneProps {
  onTap: () => Promise<boolean>;
  canTap: boolean;
}

const CoreTorus = ({ onTap, canTap }: CoreMineSceneProps) => {
  const spinRef = useRef<THREE.Group>(null);
  const coreMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
  const pulseRef = useRef(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
    };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (spinRef.current) {
      spinRef.current.rotation.y += delta * 0.35;
      pulseRef.current = THREE.MathUtils.lerp(pulseRef.current, 0, Math.min(1, delta * 6));
      const hoverScale = hovered && canTap ? 1.05 : 1;
      spinRef.current.scale.setScalar(hoverScale + pulseRef.current * 0.08);
    }

    if (coreMaterialRef.current) {
      coreMaterialRef.current.emissiveIntensity = (canTap ? 0.9 : 0.1) + Math.sin(t * 2.5) * (canTap ? 0.35 : 0.05);
    }

    ringRefs.current.forEach((ring, i) => {
      if (ring) ring.rotation.z += delta * (0.4 + i * 0.25);
    });
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!canTap) return;
    onTap().then((ok) => {
      if (ok) pulseRef.current = 1;
    });
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = canTap ? 'pointer' : 'not-allowed';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = '';
  };

  return (
    <group rotation={[0.45, 0, 0]}>
      <group ref={spinRef}>
        <mesh
          onPointerDown={handlePointerDown}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <torusGeometry args={[1, 0.38, 96, 256]} />
          <meshPhysicalMaterial
            color="#0d2a14"
            metalness={0.9}
            roughness={0.22}
            clearcoat={1}
            clearcoatRoughness={0.08}
            ref={coreMaterialRef}
            emissive={ENERGY_GREEN}
            emissiveIntensity={0.9}
          />
        </mesh>

        <mesh>
          <torusGeometry args={[1, 0.14, 48, 192]} />
          <meshBasicMaterial color={ENERGY_GREEN} toneMapped={false} />
        </mesh>

        <mesh position={[0, 0, 0]}>
          <circleGeometry args={[0.6, 96]} />
          <meshBasicMaterial
            color={ENERGY_GREEN}
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>

      {RING_RADII.map((radius, i) => (
        <mesh
          key={radius}
          ref={(el) => {
            ringRefs.current[i] = el;
          }}
          rotation={[Math.PI / 2 - i * 0.35, i * 0.6, 0]}
        >
          <torusGeometry args={[radius, 0.012, 16, 256]} />
          <meshBasicMaterial
            color={ENERGY_GREEN}
            transparent
            opacity={0.55 - i * 0.12}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
};

export const CoreMineScene = ({ onTap, canTap }: CoreMineSceneProps) => (
  <Canvas
    dpr={[1, 2]}
    camera={{ position: [0, 0, 5.4], fov: 40 }}
    gl={{ antialias: true, alpha: true }}
    style={{ background: 'transparent' }}
  >
    <ambientLight intensity={0.35} />
    <directionalLight position={[3, 4, 5]} intensity={1.6} color="#ffffff" />
    <pointLight position={[-3, -1.5, 2]} intensity={8} color={ENERGY_GREEN} distance={12} />
    <pointLight position={[2.5, 2, -2]} intensity={4} color="#b8ff9a" distance={10} />
    <Sparkles count={70} scale={[5.5, 5.5, 3]} size={3} speed={0.35} color={ENERGY_GREEN} />
    <CoreTorus onTap={onTap} canTap={canTap} />
  </Canvas>
);
