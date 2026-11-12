import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const ENERGY_GREEN = '#5cff2a';
const ENERGY_AMBER = '#ffb627';

interface CoreMineSceneProps {
  onTap: () => Promise<boolean>;
  canTap: boolean;
}

function AsteroidRock({ onTap, canTap }: CoreMineSceneProps) {
  const rockRef = useRef<THREE.Mesh>(null);
  const veinRef = useRef<THREE.Mesh>(null);
  const crustRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef(0);
  const crackRef = useRef(0);
  const [hovered, setHovered] = useState(false);

  const rockGeometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.6, 3);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      const noise = (Math.sin(v.x * 4) + Math.cos(v.y * 3) + Math.sin(v.z * 5)) * 0.08;
      v.multiplyScalar(1 + noise);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const veinGeometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.25, 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      const noise = (Math.sin(v.x * 6) + Math.cos(v.z * 4)) * 0.04;
      v.multiplyScalar(1 + noise);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
    };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (rockRef.current) {
      rockRef.current.rotation.y += delta * 0.12;
      rockRef.current.rotation.x = Math.sin(t * 0.3) * 0.08;
      pulseRef.current = THREE.MathUtils.lerp(pulseRef.current, 0, Math.min(1, delta * 5));
      const hoverScale = hovered && canTap ? 1.04 : 1;
      const crackShake = crackRef.current > 0 ? (Math.random() - 0.5) * 0.04 * crackRef.current : 0;
      rockRef.current.scale.setScalar(hoverScale + pulseRef.current * 0.06 + crackShake);
      crackRef.current = Math.max(0, crackRef.current - delta * 2);
    }

    if (veinRef.current) {
      const mat = veinRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (canTap ? 1.2 : 0.2) + Math.sin(t * 3) * (canTap ? 0.4 : 0.08) + pulseRef.current * 2;
      veinRef.current.rotation.y -= delta * 0.18;
      veinRef.current.rotation.z += delta * 0.05;
    }

    if (crustRef.current) {
      const mat = crustRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.35 + Math.sin(t * 1.5) * 0.05 - pulseRef.current * 0.2;
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!canTap) return;
    crackRef.current = 1;
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
    <group rotation={[0.3, 0, 0.15]}>
      {/* Outer crust shell — floating fragments */}
      <mesh ref={crustRef}>
        <icosahedronGeometry args={[1.95, 1]} />
        <meshStandardMaterial
          color="#3d2b1f"
          metalness={0.3}
          roughness={0.85}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Main rock body */}
      <mesh
        ref={rockRef}
        geometry={rockGeometry}
        onPointerDown={handlePointerDown}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshStandardMaterial
          color="#2a2a1e"
          metalness={0.4}
          roughness={0.75}
          flatShading
          emissive="#1a1a10"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Energy veins inner core */}
      <mesh ref={veinRef} geometry={veinGeometry}>
        <meshStandardMaterial
          color={ENERGY_GREEN}
          emissive={ENERGY_GREEN}
          emissiveIntensity={1.2}
          metalness={0.3}
          roughness={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Glow halo */}
      <mesh>
        <sphereGeometry args={[2.1, 32, 32]} />
        <meshBasicMaterial
          color={ENERGY_GREEN}
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Orbiting energy rings */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2 - i * 0.4, i * 0.7, 0]}>
          <torusGeometry args={[2.3 + i * 0.15, 0.008, 8, 128]} />
          <meshBasicMaterial
            color={i === 1 ? ENERGY_AMBER : ENERGY_GREEN}
            transparent
            opacity={0.4 - i * 0.1}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Floating debris chunks */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        const r = 2.6 + (i % 2) * 0.3;
        return (
          <mesh key={`debris-${i}`} position={[Math.cos(a) * r, Math.sin(a * 2) * 0.4, Math.sin(a) * r]}>
            <dodecahedronGeometry args={[0.08 + (i % 3) * 0.03, 0]} />
            <meshStandardMaterial color="#3a3a2a" metalness={0.5} roughness={0.7} flatShading />
          </mesh>
        );
      })}
    </group>
  );
}

export const CoreMineScene = ({ onTap, canTap }: CoreMineSceneProps) => (
  <Canvas
    dpr={[1, 2]}
    camera={{ position: [0, 0, 5.5], fov: 42 }}
    gl={{ antialias: true, alpha: true }}
    style={{ background: 'transparent' }}
  >
    <ambientLight intensity={0.25} />
    <directionalLight position={[3, 4, 5]} intensity={1.4} color="#fff4e0" />
    <pointLight position={[-2, -1, 3]} intensity={10} color={ENERGY_GREEN} distance={14} />
    <pointLight position={[2.5, 2, -2]} intensity={5} color={ENERGY_AMBER} distance={10} />
    <Sparkles count={90} scale={[6, 6, 3]} size={4} speed={0.4} color={ENERGY_GREEN} />
    <AsteroidRock onTap={onTap} canTap={canTap} />
  </Canvas>
);
