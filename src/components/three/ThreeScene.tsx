'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

function FloatingShape({ position, color, scale, speed, distort, onClick }: {
  position: [number, number, number];
  color: string;
  scale: number;
  speed: number;
  distort: number;
  onClick?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
      const targetScale = hovered ? scale * 1.2 : scale;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1}>
      <mesh 
        ref={meshRef} 
        position={position} 
        scale={scale}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <icosahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial 
          color={color} 
          speed={speed * 2} 
          distort={distort}
          roughness={0.2}
          metalness={0.8}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
          transparent={true}
          opacity={hovered ? 1 : 0.8}
        />
      </mesh>
    </Float>
  );
}

function ServiceFrame({ position, color, label, onClick }: {
  position: [number, number, number];
  color: string;
  label: string;
  onClick?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.15;
      meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.2) * 0.05;
      const targetScale = hovered ? 1.1 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={meshRef} position={position}>
        <mesh 
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[2.5, 1.8, 0.08]} />
          <meshStandardMaterial 
            color={color} 
            metalness={0.9} 
            roughness={0.1}
            emissive={color}
            emissiveIntensity={hovered ? 0.4 : 0.1}
          />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[2.3, 1.6]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={hovered ? 0.3 : 0.15} 
          />
        </mesh>
      </group>
    </Float>
  );
}

function PulseRing({ position, color, speed = 1 }: {
  position: [number, number, number];
  color: string;
  speed?: number;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * speed) * 0.2;
      ringRef.current.scale.set(scale, scale, 1);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 - Math.sin(state.clock.elapsedTime * speed) * 0.2;
    }
  });

  return (
    <mesh ref={ringRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.5, 2, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Particles({ count = 300, color = '#00d4ff' }: { count?: number; color?: string }) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 25;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.015;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial size={0.025} color={color} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function GridFloor() {
  const gridRef = useRef<THREE.GridHelper>(null);
  
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.elapsedTime * 0.8) % 1 - 5;
    }
  });

  return (
    <>
      <gridHelper 
        ref={gridRef}
        args={[60, 60, '#0a3d4d', '#062029']} 
        position={[0, -4, -5]}
      />
      <mesh position={[0, -4.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#050a10" transparent opacity={0.8} />
      </mesh>
    </>
  );
}

function ScrollReactiveCamera({ scrollY }: { scrollY: number }) {
  const { camera } = useThree();
  
  useFrame(() => {
    const targetZ = 8 - scrollY * 0.003;
    const targetY = -scrollY * 0.001;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    (camera as THREE.PerspectiveCamera).position.y = THREE.MathUtils.lerp((camera as THREE.PerspectiveCamera).position.y, targetY, 0.05);
  });
  
  return null;
}

interface ThreeSceneProps {
  scrollY?: number;
  onServiceClick?: (service: string) => void;
}

function ThreeSceneInner({ scrollY = 0, onServiceClick }: ThreeSceneProps) {
  const serviceLabels = ['IMAGE', 'VIDEO', 'AI', 'WEB'];
  const serviceColors = ['#00d4ff', '#22d3ee', '#a855f7', '#f97316'];

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <color attach="background" args={['#030308']} />
        
        <ScrollReactiveCamera scrollY={scrollY} />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-15, 5, -5]} intensity={0.8} color="#00d4ff" />
        <pointLight position={[15, -5, 5]} intensity={0.6} color="#f97316" />
        
        <Stars radius={80} depth={50} count={4000} factor={3} fade speed={0.5} />
        
        <GridFloor />
        
        <PulseRing position={[0, 0, -2]} color="#00d4ff" speed={0.8} />
        <PulseRing position={[-5, 2, -3]} color="#22d3ee" speed={1.2} />
        <PulseRing position={[5, -1, -2]} color="#f97316" speed={1} />
        
        <FloatingShape 
          position={[-5, 3, -3]} 
          color="#00d4ff" 
          scale={0.6} 
          speed={0.4} 
          distort={0.3}
        />
        <FloatingShape 
          position={[5, 2, -2]} 
          color="#22d3ee" 
          scale={0.5} 
          speed={0.5} 
          distort={0.4}
        />
        <FloatingShape 
          position={[-3, -2, -4]} 
          color="#f97316" 
          scale={0.4} 
          speed={0.3} 
          distort={0.2}
        />
        <FloatingShape 
          position={[4, -3, -3]} 
          color="#a855f7" 
          scale={0.35} 
          speed={0.45} 
          distort={0.5}
        />
        <FloatingShape 
          position={[0, 4, -5]} 
          color="#00ff88" 
          scale={0.3} 
          speed={0.6} 
          distort={0.3}
        />
        
        {serviceLabels.map((label, i) => (
          <ServiceFrame
            key={label}
            position={[
              (i % 2 === 0 ? -1 : 1) * (3 + i * 0.5),
              1 - i * 0.4,
              -1 - i * 0.3
            ]}
            color={serviceColors[i]}
            label={label}
            onClick={() => onServiceClick?.(label.toLowerCase())}
          />
        ))}
        
        <Particles count={250} color="#00d4ff" />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-l from-background/50 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

export default function ThreeScene(props: ThreeSceneProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0 -z-10 overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-black" />;
  }

  return <ThreeSceneInner {...props} />;
}