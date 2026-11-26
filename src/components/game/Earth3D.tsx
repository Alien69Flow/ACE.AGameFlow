import { Component, Suspense, useRef, useState, useEffect, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Building3D, type BuildingType } from './Building3D';
import { isWebGLAvailable } from './WebGLDetector';

const TEXTURE_BASE = 'https://threejs.org/examples/textures/planets';

class GlobeErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export interface BuildingSlotData {
  slotId: number;
  type: BuildingType;
  level: number;
}

const SLOT_ANGLES: Record<number, number> = {
  1: -90,
  2: -30,
  3: 30,
  4: 90,
  5: 150,
  6: 210,
};

const BUILDING_RADIUS = 2.18;
const BUILDING_HEIGHT = 0.28;

function buildingPosition(slotId: number): [number, number, number] {
  const angleDeg = SLOT_ANGLES[slotId] ?? 0;
  const angle = (angleDeg * Math.PI) / 180;
  const x = Math.cos(angle) * BUILDING_RADIUS;
  const z = Math.sin(angle) * BUILDING_RADIUS;
  return [x, BUILDING_HEIGHT, z];
}

const EarthMesh = ({ buildings }: { buildings: BuildingSlotData[] }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const buildingsRef = useRef<THREE.Group>(null);
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const [textures, setTextures] = useState<[THREE.Texture, THREE.Texture, THREE.Texture, THREE.Texture] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const urls = [
      `${TEXTURE_BASE}/earth_atmos_2048.jpg`,
      `${TEXTURE_BASE}/earth_normal_2048.jpg`,
      `${TEXTURE_BASE}/earth_specular_2048.jpg`,
      `${TEXTURE_BASE}/earth_clouds_1024.png`,
    ];

    Promise.all(
      urls.map(
        (url) =>
          new Promise<THREE.Texture>((resolve, reject) => {
            loader.load(url, resolve, undefined, reject);
          })
      )
    )
      .then((loaded) => {
        if (!cancelled) {
          setTextures(loaded as [THREE.Texture, THREE.Texture, THREE.Texture, THREE.Texture]);
          setTexturesLoaded(true);
        }
      })
      .catch(() => {
        // If textures fail (e.g. on mobile networks), mark as loaded so we render a colored sphere
        if (!cancelled) setTexturesLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useFrame((_, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.1;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.13;
    if (buildingsRef.current) buildingsRef.current.rotation.y += delta * 0.1;
  });

  if (!texturesLoaded) {
    return (
      <group>
        <Sphere args={[2, 48, 48]}>
          <meshStandardMaterial color="#1a3a5a" emissive="#0a2a4a" emissiveIntensity={0.2} />
        </Sphere>
      </group>
    );
  }

  return (
    <group>
      <Sphere args={[2.12, 48, 48]}>
        <meshBasicMaterial color="#4fa8ff" transparent opacity={0.12} side={THREE.BackSide} />
      </Sphere>

      <Sphere ref={earthRef} args={[2, 96, 96]}>
        {textures ? (
          <meshPhongMaterial
            map={textures[0]}
            normalMap={textures[1]}
            normalScale={new THREE.Vector2(0.6, 0.6)}
            specularMap={textures[2]}
            specular={new THREE.Color('#333333')}
            shininess={14}
          />
        ) : (
          <meshStandardMaterial color="#1a4a7a" emissive="#0a2a4a" emissiveIntensity={0.3} metalness={0.3} roughness={0.7} />
        )}
      </Sphere>

      {textures && (
        <Sphere ref={cloudsRef} args={[2.02, 64, 64]}>
          <meshLambertMaterial map={textures[3]} transparent opacity={0.8} depthWrite={false} />
        </Sphere>
      )}

      <group ref={buildingsRef}>
        {buildings.map((b) => {
          const pos = buildingPosition(b.slotId);
          const isGhost = b.level <= 0 && b.type !== 'core_mina';
          return (
            <group key={b.slotId}>
              <pointLight
                position={[pos[0] * 1.1, pos[1] + 0.3, pos[2] * 1.1]}
                intensity={isGhost ? 2 : 6}
                distance={1.5}
                color={isGhost ? '#3a5a3a' : '#5cff2a'}
              />
              <Building3D
                type={b.type}
                level={b.level}
                position={pos}
              />
            </group>
          );
        })}
      </group>
    </group>
  );
};

// 2D CSS fallback planet (used when WebGL is not available)
const Earth2DFallback = ({ buildings }: { buildings: BuildingSlotData[] }) => {
  const slotPositions: Record<number, { x: string; y: string }> = {
    1: { x: '50%', y: '50%' },
    2: { x: '72%', y: '38%' },
    3: { x: '72%', y: '62%' },
    4: { x: '50%', y: '78%' },
    5: { x: '28%', y: '62%' },
    6: { x: '28%', y: '38%' },
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-64 h-64 rounded-full overflow-hidden" style={{
        background: 'radial-gradient(circle at 35% 35%, #2a6aaa 0%, #1a4a7a 40%, #0a2a4a 70%, #051a2a 100%)',
        boxShadow: '0 0 40px rgba(79, 168, 255, 0.3), inset -20px -20px 40px rgba(0,0,0,0.5)',
      }}>
        {/* Cloud-like overlay */}
        <div className="absolute inset-0 opacity-30" style={{
          background: 'radial-gradient(ellipse at 60% 40%, rgba(255,255,255,0.4) 0%, transparent 30%), radial-gradient(ellipse at 30% 70%, rgba(255,255,255,0.3) 0%, transparent 25%)',
        }} />

        {/* Building slots */}
        {buildings.map((b) => {
          const pos = slotPositions[b.slotId] ?? { x: '50%', y: '50%' };
          const isGhost = b.level <= 0 && b.type !== 'core_mina';
          return (
            <div
              key={b.slotId}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{
                left: pos.x,
                top: pos.y,
                background: isGhost ? 'rgba(58, 90, 58, 0.5)' : 'rgba(92, 255, 42, 0.8)',
                boxShadow: isGhost ? 'none' : '0 0 12px rgba(92, 255, 42, 0.6)',
                border: '1px solid rgba(92, 255, 42, 0.4)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

interface Earth3DProps {
  className?: string;
  buildings?: BuildingSlotData[];
}

export const Earth3D = ({ className, buildings = [] }: Earth3DProps) => {
  const [webglOk] = useState(() => isWebGLAvailable());

  if (!webglOk) {
    return (
      <div className={className}>
        <Earth2DFallback buildings={buildings} />
      </div>
    );
  }

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 1, 6], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 3, 5]} intensity={1.6} color="#ffffff" />
        <pointLight position={[-3, 2, -4]} intensity={6} color="#5cff2a" distance={15} />

        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

        <GlobeErrorBoundary>
          <Suspense fallback={null}>
            <EarthMesh buildings={buildings} />
          </Suspense>
        </GlobeErrorBoundary>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
};
