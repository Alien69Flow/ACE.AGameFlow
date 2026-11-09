import { Component, Suspense, useRef, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Stars, OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

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

const EarthMesh = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const [dayMap, normalMap, specularMap, cloudsMap] = useTexture([
    `${TEXTURE_BASE}/earth_atmos_2048.jpg`,
    `${TEXTURE_BASE}/earth_normal_2048.jpg`,
    `${TEXTURE_BASE}/earth_specular_2048.jpg`,
    `${TEXTURE_BASE}/earth_clouds_1024.png`,
  ]);

  useFrame((_, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.1;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.13;
  });

  return (
    <group>
      <Sphere args={[2.12, 48, 48]}>
        <meshBasicMaterial color="#4fa8ff" transparent opacity={0.12} side={THREE.BackSide} />
      </Sphere>

      <Sphere ref={earthRef} args={[2, 96, 96]}>
        <meshPhongMaterial
          map={dayMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.6, 0.6)}
          specularMap={specularMap}
          specular={new THREE.Color('#333333')}
          shininess={14}
        />
      </Sphere>

      <Sphere ref={cloudsRef} args={[2.02, 64, 64]}>
        <meshLambertMaterial map={cloudsMap} transparent opacity={0.8} depthWrite={false} />
      </Sphere>
    </group>
  );
};

interface Earth3DProps {
  className?: string;
}

export const Earth3D = ({ className }: Earth3DProps) => {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 3, 5]} intensity={1.6} color="#ffffff" />

        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

        <GlobeErrorBoundary>
          <Suspense fallback={null}>
            <EarthMesh />
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
