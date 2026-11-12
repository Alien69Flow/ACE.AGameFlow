import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type BuildingType = 'core_mina' | 'central_energy' | 'laboratory' | 'card_hangar' | 'arena' | 'coliseum';

interface Building3DProps {
  type: BuildingType;
  level: number;
  position: [number, number, number];
}

const ENERGY_GREEN = '#5cff2a';
const ENERGY_AMBER = '#ffb627';

function CoreMinaModel({ level }: { level: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4;
  });
  const scale = 1 + level * 0.15;
  return (
    <group ref={ref} scale={scale}>
      <mesh>
        <icosahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} emissive={ENERGY_GREEN} emissiveIntensity={0.3} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.5, 0.04, 8, 32]} />
        <meshBasicMaterial color={ENERGY_GREEN} toneMapped={false} />
      </mesh>
    </group>
  );
}

function CentralEnergyModel({ level }: { level: number }) {
  const ref = useRef<THREE.Group>(null);
  const bladeRefs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 1.5;
    bladeRefs.current.forEach((b, i) => {
      if (b) b.rotation.z += delta * (2 + i * 0.5);
    });
  });
  const bladeCount = 3 + level;
  const scale = 1 + level * 0.12;
  return (
    <group ref={ref} scale={scale}>
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.3, 8]} />
        <meshStandardMaterial color="#2a2a3e" metalness={0.9} roughness={0.2} />
      </mesh>
      {Array.from({ length: bladeCount }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { bladeRefs.current[i] = el; }}
          rotation={[0, 0, (i / bladeCount) * Math.PI * 2]}
          position={[0, 0.05, 0]}
        >
          <boxGeometry args={[0.4, 0.03, 0.08]} />
          <meshStandardMaterial color={ENERGY_GREEN} emissive={ENERGY_GREEN} emissiveIntensity={0.6} metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color={ENERGY_GREEN} toneMapped={false} />
      </mesh>
    </group>
  );
}

function LaboratoryModel({ level }: { level: number }) {
  const ref = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.3;
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.3;
      ringRef.current.rotation.z += delta * 0.8;
    }
  });
  const scale = 1 + level * 0.12;
  return (
    <group ref={ref} scale={scale}>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.22, 0.25, 0.2, 6]} />
        <meshStandardMaterial color="#1e2a3a" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.25, 6]} />
        <meshStandardMaterial color="#2a3a4a" metalness={0.6} roughness={0.25} emissive="#4fa8ff" emissiveIntensity={0.15} />
      </mesh>
      <mesh ref={ringRef} position={[0, 0.28, 0]}>
        <torusGeometry args={[0.15, 0.02, 8, 24]} />
        <meshBasicMaterial color="#4fa8ff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#4fa8ff" toneMapped={false} />
      </mesh>
    </group>
  );
}

function CardHangarModel({ level }: { level: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.2;
  });
  const scale = 1 + level * 0.12;
  return (
    <group ref={ref} scale={scale}>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.5, 0.15, 0.35]} />
        <meshStandardMaterial color="#2a1e3a" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[-0.12, 0.12, 0]} rotation={[0.3, 0, -0.2]}>
        <boxGeometry args={[0.25, 0.2, 0.01]} />
        <meshStandardMaterial color="#3a2a4a" metalness={0.5} roughness={0.4} emissive="#b347d9" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.12, 0.12, 0]} rotation={[0.3, 0, 0.2]}>
        <boxGeometry args={[0.25, 0.2, 0.01]} />
        <meshStandardMaterial color="#3a2a4a" metalness={0.5} roughness={0.4} emissive="#b347d9" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <coneGeometry args={[0.08, 0.15, 6]} />
        <meshBasicMaterial color="#b347d9" toneMapped={false} />
      </mesh>
    </group>
  );
}

function ArenaModel({ level }: { level: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.15;
  });
  const scale = 1 + level * 0.12;
  return (
    <group ref={ref} scale={scale}>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.1, 8]} />
        <meshStandardMaterial color="#3a2a1e" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.15, 8]} />
        <meshStandardMaterial color="#4a3a2e" metalness={0.4} roughness={0.5} emissive={ENERGY_AMBER} emissiveIntensity={0.15} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.28, 0.22, Math.sin(a) * 0.28]}>
            <cylinderGeometry args={[0.02, 0.02, 0.2, 6]} />
            <meshStandardMaterial color={ENERGY_AMBER} emissive={ENERGY_AMBER} emissiveIntensity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

function ColiseumModel({ level }: { level: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.1;
  });
  const scale = 1 + level * 0.15;
  return (
    <group ref={ref} scale={scale}>
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.38, 0.42, 0.12, 16]} />
        <meshStandardMaterial color="#3a2a1e" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.32, 0.36, 0.2, 16]} />
        <meshStandardMaterial color="#4a3a2a" metalness={0.3} roughness={0.6} emissive={ENERGY_AMBER} emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.08, 16]} />
        <meshStandardMaterial color="#5a4a3a" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.22, 0.25, 16]} />
        <meshStandardMaterial color={ENERGY_AMBER} emissive={ENERGY_AMBER} emissiveIntensity={0.4} metalness={0.5} roughness={0.2} />
      </mesh>
    </group>
  );
}

const MODEL_MAP: Record<BuildingType, (props: { level: number }) => React.JSX.Element> = {
  core_mina: CoreMinaModel,
  central_energy: CentralEnergyModel,
  laboratory: LaboratoryModel,
  card_hangar: CardHangarModel,
  arena: ArenaModel,
  coliseum: ColiseumModel,
};

export const Building3D = ({ type, level, position }: Building3DProps) => {
  const Model = MODEL_MAP[type];
  const lookAt = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) groupRef.current.lookAt(lookAt);
  });

  if (level <= 0 && type !== 'core_mina') return null;

  return (
    <group ref={groupRef} position={position}>
      <Model level={level} />
    </group>
  );
};
