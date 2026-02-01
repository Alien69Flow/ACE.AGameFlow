import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const EarthMesh = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Create gradient texture for Earth
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Ocean base
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, 512, 256);
    
    // Land masses with green tint
    const gradient = ctx.createRadialGradient(256, 128, 0, 256, 128, 200);
    gradient.addColorStop(0, '#1a4d1a');
    gradient.addColorStop(0.5, '#0d3d0d');
    gradient.addColorStop(1, '#0a1628');
    
    // Draw continents
    ctx.fillStyle = '#143814';
    ctx.beginPath();
    ctx.ellipse(150, 100, 60, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(350, 120, 80, 50, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(400, 180, 40, 30, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(200, 180, 50, 35, 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Add neon green highlights
    ctx.strokeStyle = '#39FF14';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  // Create clouds texture
  const cloudsTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, 512, 256);
    
    // Draw cloud wisps
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const w = Math.random() * 80 + 20;
      const h = Math.random() * 20 + 5;
      ctx.beginPath();
      ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.1;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.12;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      {/* Atmospheric glow */}
      <Sphere ref={glowRef} args={[2.2, 32, 32]}>
        <meshBasicMaterial
          color="#39FF14"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Earth */}
      <Sphere ref={earthRef} args={[2, 64, 64]}>
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.8}
          metalness={0.1}
          emissive="#39FF14"
          emissiveIntensity={0.05}
        />
      </Sphere>
      
      {/* Clouds */}
      <Sphere ref={cloudsRef} args={[2.02, 32, 32]}>
        <meshStandardMaterial
          map={cloudsTexture}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </Sphere>
      
      {/* Inner glow */}
      <pointLight position={[0, 0, 0]} intensity={0.5} color="#39FF14" />
    </group>
  );
};

interface Earth3DProps {
  className?: string;
}

export const Earth3D = ({ className }: Earth3DProps) => {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 3, 5]} intensity={1} color="#ffffff" />
        <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#39FF14" />
        
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        
        <EarthMesh />
        
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
