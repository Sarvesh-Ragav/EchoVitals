import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Cylinder } from '@react-three/drei';
import { Vector3, Mesh, CylinderGeometry, MeshStandardMaterial, Group } from 'three';

interface LungsProps {
  isActive: boolean;
}

interface AirParticle {
  x: number;
  y: number;
  z: number;
  opacity: number;
}

const Lungs: React.FC<LungsProps> = ({ isActive }) => {
  const lungsGroupRef = useRef<Group>(null);
  
  // Left lung refs (3 lobes)
  const leftUpperLobeRef = useRef<Mesh>(null);
  const leftLowerLobeRef = useRef<Mesh>(null);
  
  // Right lung refs (3 lobes)
  const rightUpperLobeRef = useRef<Mesh>(null);
  const rightMiddleLobeRef = useRef<Mesh>(null);
  const rightLowerLobeRef = useRef<Mesh>(null);

  const [airParticles, setAirParticles] = useState<AirParticle[]>(() =>
    Array.from({ length: 50 }).map((_, i) => ({
      x: Math.cos(i * 0.4) * 0.2,
      y: -0.8,
      z: Math.sin(i * 0.4) * 0.2,
      opacity: 0.3,
    }))
  );

  const targetScale = useMemo(() => new Vector3(1, 1, 1), []);
  const targetPosition = useMemo(() => new Vector3(0, 0, 0), []);

  // Create airway geometries
  const bronchiGeometry = useMemo(() => new CylinderGeometry(0.05, 0.04, 0.4, 8), []);
  const tracheaGeometry = useMemo(() => new CylinderGeometry(0.08, 0.08, 0.8, 16), []);
  const airwayMaterial = useMemo(() => 
    new MeshStandardMaterial({
      color: '#cc6699',
      roughness: 0.3,
      metalness: 0.2,
    }), []);

  useFrame((state, delta) => {
    if (!lungsGroupRef.current || !leftUpperLobeRef.current || !leftLowerLobeRef.current ||
        !rightUpperLobeRef.current || !rightMiddleLobeRef.current || !rightLowerLobeRef.current) return;

    const t = state.clock.getElapsedTime();
    
    // Complex breathing animation
    const baseBreathing = Math.sin(t * 0.5); // Basic breathing cycle
    const deepBreath = Math.sin(t * 0.2) * 0.3; // Occasional deeper breaths
    const breathe = 0.15 * baseBreathing + 0.05 * deepBreath;

    // Left lung animations with natural asymmetry
    const leftUpperScale = 1 + breathe * 1.2;
    const leftLowerScale = 1 + breathe * 1.1;
    
    leftUpperLobeRef.current.scale.set(leftUpperScale, leftUpperScale, leftUpperScale);
    leftLowerLobeRef.current.scale.set(leftLowerScale, leftLowerScale, leftLowerScale);

    // Right lung animations
    const rightUpperScale = 1 + breathe * 1.1;
    const rightMiddleScale = 1 + breathe;
    const rightLowerScale = 1 + breathe * 1.05;

    rightUpperLobeRef.current.scale.set(rightUpperScale, rightUpperScale, rightUpperScale);
    rightMiddleLobeRef.current.scale.set(rightMiddleScale, rightMiddleScale, rightMiddleScale);
    rightLowerLobeRef.current.scale.set(rightLowerScale, rightLowerScale, rightLowerScale);

    // Natural expansion movement
    const expansion = breathe * 0.2;
    leftUpperLobeRef.current.position.x = -0.6 - expansion;
    leftLowerLobeRef.current.position.x = -0.6 - expansion;
    rightUpperLobeRef.current.position.x = 0.6 + expansion;
    rightMiddleLobeRef.current.position.x = 0.6 + expansion;
    rightLowerLobeRef.current.position.x = 0.6 + expansion;

    // Update air particles
    setAirParticles(prevParticles =>
      prevParticles.map((particle, i) => {
        const particleTime = t * 0.5 + i * 0.1;
        const breathingPhase = Math.sin(particleTime);
        return {
          x: particle.x * (1 + breathingPhase * 0.2),
          y: -0.8 + Math.sin(particleTime) * 0.6,
          z: particle.z * (1 + breathingPhase * 0.2),
          opacity: 0.3 * (1 + Math.sin(particleTime)) / 2,
        };
      })
    );

    if (isActive) {
      targetScale.set(1.2, 1.2, 1.2);
      targetPosition.set(0, 0.5, 0);
    } else {
      targetScale.set(1, 1, 1);
      targetPosition.set(0, 0, 0);
    }

    // Smooth transitions
    lungsGroupRef.current.scale.lerp(targetScale, 0.1);
    lungsGroupRef.current.position.lerp(targetPosition, 0.1);
  });

  return (
    <group ref={lungsGroupRef}>
      {/* Left Lung - Upper Lobe */}
      <Sphere
        ref={leftUpperLobeRef}
        position={[-0.6, 0.2, 0]}
        args={[0.3, 64, 64]}
      >
        <MeshDistortMaterial
          color="#ff69b4"
          speed={1.5}
          distort={0.15}
          radius={1}
          metalness={0.1}
          roughness={0.8}
        />
      </Sphere>

      {/* Left Lung - Lower Lobe */}
      <Sphere
        ref={leftLowerLobeRef}
        position={[-0.6, -0.2, 0]}
        args={[0.35, 64, 64]}
      >
        <MeshDistortMaterial
          color="#ff69b4"
          speed={1.5}
          distort={0.15}
          radius={1}
          metalness={0.1}
          roughness={0.8}
        />
      </Sphere>

      {/* Right Lung - Upper Lobe */}
      <Sphere
        ref={rightUpperLobeRef}
        position={[0.6, 0.3, 0]}
        args={[0.25, 64, 64]}
      >
        <MeshDistortMaterial
          color="#ff69b4"
          speed={1.5}
          distort={0.15}
          radius={1}
          metalness={0.1}
          roughness={0.8}
        />
      </Sphere>

      {/* Right Lung - Middle Lobe */}
      <Sphere
        ref={rightMiddleLobeRef}
        position={[0.6, 0, 0]}
        args={[0.25, 64, 64]}
      >
        <MeshDistortMaterial
          color="#ff69b4"
          speed={1.5}
          distort={0.15}
          radius={1}
          metalness={0.1}
          roughness={0.8}
        />
      </Sphere>

      {/* Right Lung - Lower Lobe */}
      <Sphere
        ref={rightLowerLobeRef}
        position={[0.6, -0.3, 0]}
        args={[0.3, 64, 64]}
      >
        <MeshDistortMaterial
          color="#ff69b4"
          speed={1.5}
          distort={0.15}
          radius={1}
          metalness={0.1}
          roughness={0.8}
        />
      </Sphere>

      {/* Main Bronchi - Left */}
      <Cylinder
        position={[-0.3, -0.2, 0]}
        rotation={[0, 0, Math.PI / 4]}
        args={[0.05, 0.04, 0.4, 8]}
        material={airwayMaterial}
      />

      {/* Main Bronchi - Right */}
      <Cylinder
        position={[0.3, -0.2, 0]}
        rotation={[0, 0, -Math.PI / 4]}
        args={[0.05, 0.04, 0.4, 8]}
        material={airwayMaterial}
      />

      {/* Trachea */}
      <Cylinder
        position={[0, -0.6, 0]}
        args={[0.08, 0.08, 0.8, 16]}
        material={airwayMaterial}
      />

      {/* Air particles effect */}
      {airParticles.map((particle, i) => (
        <mesh
          key={i}
          position={[particle.x, particle.y, particle.z]}
        >
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={particle.opacity}
          />
        </mesh>
      ))}
    </group>
  );
};

export default Lungs; 