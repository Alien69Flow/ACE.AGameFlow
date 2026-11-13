import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const ENERGY_GREEN = '#5cff2a';
const ENERGY_AMBER = '#ffb627';
const STEEL = '#4a5568';
const STEEL_DARK = '#2d3748';

interface CoreMineSceneProps {
  onTap: () => Promise<boolean>;
  canTap: boolean;
}

function DrillRig({ onTap, canTap }: CoreMineSceneProps) {
  const towerRef = useRef<THREE.Group>(null);
  const drillRef = useRef<THREE.Mesh>(null);
  const drillGroupRef = useRef<THREE.Group>(null);
  const padRef = useRef<THREE.Group>(null);
  const [hitFlash, setHitFlash] = useState(0);
  const hitFlashRef = useRef(0);
  const drillOffsetRef = useRef(0);

  const crackGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1.2, 1.2, 8, 8);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const noise = Math.sin(x * 8) * 0.02 + Math.cos(y * 6) * 0.02;
      pos.setZ(i, noise);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (drillRef.current) {
      drillRef.current.rotation.z += delta * 8;
    }

    if (drillGroupRef.current) {
      drillOffsetRef.current = Math.sin(t * 4) * 0.08;
      drillGroupRef.current.position.y = -0.35 + drillOffsetRef.current;
    }

    if (towerRef.current) {
      const shake = hitFlashRef.current > 0 ? (Math.random() - 0.5) * 0.02 * hitFlashRef.current : 0;
      towerRef.current.position.x = shake;
      towerRef.current.position.z = shake;
    }

    if (padRef.current) {
      const flashGroup = padRef.current;
      flashGroup.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat.emissive) {
            mat.emissiveIntensity = (canTap ? 0.8 : 0.15) + Math.sin(t * 2) * 0.15 + hitFlashRef.current * 3;
          }
        }
      });
    }

    hitFlashRef.current = Math.max(0, hitFlashRef.current - delta * 3);
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!canTap) return;
    hitFlashRef.current = 1;
    setHitFlash(1);
    onTap().then((ok) => {
      if (ok) {
        setTimeout(() => setHitFlash(0), 200);
      } else {
        setHitFlash(0);
      }
    });
  };

  const handlePointerOver = () => {
    document.body.style.cursor = canTap ? 'pointer' : 'not-allowed';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = '';
  };

  return (
    <group rotation={[0.15, -0.3, 0]} scale={1.1}>
      {/* Base platform */}
      <mesh position={[0, -0.9, 0]} onPointerDown={handlePointerDown} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <cylinderGeometry args={[1.1, 1.3, 0.18, 8]} />
        <meshStandardMaterial color={STEEL_DARK} metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Platform rim lights */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={`rim-${i}`} position={[Math.cos(a) * 1.15, -0.8, Math.sin(a) * 1.15]}>
            <boxGeometry args={[0.06, 0.04, 0.06]} />
            <meshStandardMaterial
              color={ENERGY_GREEN}
              emissive={ENERGY_GREEN}
              emissiveIntensity={canTap ? 2 : 0.3}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      {/* Energy pad (glowing center where drill meets ground) */}
      <group ref={padRef} position={[0, -0.79, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={crackGeometry}>
          <meshStandardMaterial
            color={ENERGY_GREEN}
            emissive={ENERGY_GREEN}
            emissiveIntensity={0.8}
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Support legs (4 angled) */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const r = 0.8;
        return (
          <mesh
            key={`leg-${i}`}
            position={[Math.cos(a) * r * 0.5, -0.35, Math.sin(a) * r * 0.5]}
            rotation={[Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35]}
          >
            <cylinderGeometry args={[0.04, 0.06, 1.0, 6]} />
            <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.3} />
          </mesh>
        );
      })}

      {/* Tower frame — derrick structure */}
      <group ref={towerRef}>
        {/* 4 vertical rails converging at top */}
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          const baseR = 0.65;
          const topR = 0.15;
          const midX = Math.cos(a) * (baseR + topR) * 0.5;
          const midZ = Math.sin(a) * (baseR + topR) * 0.5;
          const angle = Math.atan2(topR - baseR, 1.4);
          return (
            <mesh
              key={`rail-${i}`}
              position={[midX, 0.1, midZ]}
              rotation={[Math.sin(a) * angle, 0, -Math.cos(a) * angle]}
            >
              <cylinderGeometry args={[0.025, 0.035, 1.4, 6]} />
              <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.25} />
            </mesh>
          );
        })}

        {/* Cross braces (X pattern) — 3 levels */}
        {[0, 1, 2].map((level) => {
          const y = -0.5 + level * 0.45;
          const r = 0.6 - level * 0.18;
          return [0, 1].map((diagonal) => (
            <mesh key={`brace-${level}-${diagonal}`} position={[0, y, 0]} rotation={[0, (diagonal * Math.PI / 2) + Math.PI / 4, Math.PI / 4]}>
              <boxGeometry args={[r * 2.6, 0.02, 0.02]} />
              <meshStandardMaterial color={STEEL_DARK} metalness={0.7} roughness={0.4} />
            </mesh>
          ));
        })}

        {/* Horizontal bands */}
        {[-0.5, -0.05, 0.4, 0.75].map((y) => {
          const r = 0.62 - (y + 0.5) * 0.3;
          return (
            <mesh key={`band-${y}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[r, 0.018, 6, 20]} />
              <meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.3} />
            </mesh>
          );
        })}

        {/* Crown block (top) */}
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 0.1, 8]} />
          <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Warning light on top */}
        <mesh position={[0, 0.97, 0]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshBasicMaterial color={ENERGY_AMBER} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 1.0, 0]} intensity={3} color={ENERGY_AMBER} distance={2} />
      </group>

      {/* Drill group — moving up/down */}
      <group ref={drillGroupRef} position={[0, -0.35, 0]}>
        {/* Drill shaft */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
          <meshStandardMaterial color={STEEL} metalness={0.95} roughness={0.15} />
        </mesh>

        {/* Drill bit (cone with spiral) */}
        <mesh ref={drillRef} position={[0, -0.15, 0]}>
          <coneGeometry args={[0.12, 0.3, 6]} />
          <meshStandardMaterial
            color="#8a8a8a"
            metalness={0.95}
            roughness={0.1}
            emissive={ENERGY_GREEN}
            emissiveIntensity={0.1 + hitFlash * 0.6}
          />
        </mesh>

        {/* Energy beam from drill to ground */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.02, 0.06, 0.3, 8]} />
          <meshBasicMaterial
            color={ENERGY_GREEN}
            transparent
            opacity={0.4 + hitFlash * 0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Glow halo around base */}
      <mesh position={[0, -0.75, 0]}>
        <sphereGeometry args={[0.7, 32, 16]} />
        <meshBasicMaterial
          color={ENERGY_GREEN}
          transparent
          opacity={0.05 + hitFlash * 0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Side control panels */}
      {[-1, 1].map((side) => (
        <group key={`panel-${side}`} position={[side * 0.95, -0.7, 0]}>
          <mesh>
            <boxGeometry args={[0.15, 0.25, 0.08]} />
            <meshStandardMaterial color={STEEL_DARK} metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Panel lights */}
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, 0.06 - i * 0.06, 0.045]}>
              <sphereGeometry args={[0.012, 8, 8]} />
              <meshBasicMaterial
                color={i === 0 ? ENERGY_GREEN : i === 1 ? ENERGY_AMBER : '#ff4444'}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Exhaust pipes */}
      {[-1, 1].map((side) => (
        <mesh key={`pipe-${side}`} position={[side * 0.5, 0.3, 0]} rotation={[0, 0, side * 0.1]}>
          <cylinderGeometry args={[0.03, 0.03, 0.8, 6]} />
          <meshStandardMaterial color="#5a4a3a" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function DustParticles({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 40;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.3 + Math.random() * 0.8;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = -0.7 + Math.random() * 0.3;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const y = positions[i * 3 + 1] + (active ? Math.sin(t * 3 + i) * 0.05 : 0);
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={ENERGY_GREEN}
        transparent
        opacity={active ? 0.6 : 0.2}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
}

export const CoreMineScene = ({ onTap, canTap }: CoreMineSceneProps) => (
  <Canvas
    dpr={[1, 2]}
    camera={{ position: [0, 0.5, 4.5], fov: 42 }}
    gl={{ antialias: true, alpha: true }}
    style={{ background: 'transparent' }}
  >
    <ambientLight intensity={0.4} />
    <directionalLight position={[3, 5, 4]} intensity={1.5} color="#fff4e0" />
    <pointLight position={[-2, 1, 3]} intensity={8} color={ENERGY_GREEN} distance={12} />
    <pointLight position={[2, -1, -2]} intensity={4} color={ENERGY_AMBER} distance={8} />
    <pointLight position={[0, 2, 0]} intensity={3} color="#ffffff" distance={6} />

    <Sparkles count={60} scale={[4, 4, 2]} size={3} speed={0.3} color={ENERGY_GREEN} />
    <DustParticles active={canTap} />
    <DrillRig onTap={onTap} canTap={canTap} />
  </Canvas>
);
