import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Cylinder } from '@react-three/drei';
import { Vector3, Mesh, CylinderGeometry, MeshStandardMaterial, Group } from 'three';

interface HeartProps {
  isActive: boolean;
}

const Heart: React.FC<HeartProps> = ({ isActive }) => {
  const heartGroupRef = useRef<Group>(null);
  const leftVentricleRef = useRef<Mesh>(null);
  const rightVentricleRef = useRef<Mesh>(null);
  const leftAtriumRef = useRef<Mesh>(null);
  const rightAtriumRef = useRef<Mesh>(null);
  const [pulseOpacity, setPulseOpacity] = useState(0.1);
  
  const targetScale = useMemo(() => new Vector3(1, 1, 1), []);
  const targetPosition = useMemo(() => new Vector3(0, 0, 0), []);

  // Create blood vessel geometries
  const arteryGeometry = useMemo(() => new CylinderGeometry(0.08, 0.06, 0.5, 16), []);
  const veinGeometry = useMemo(() => new CylinderGeometry(0.06, 0.08, 0.5, 16), []);
  const vesselMaterial = useMemo(() => 
    new MeshStandardMaterial({
      color: '#cc0000',
      emissive: '#ff0000',
      emissiveIntensity: 0.2,
      roughness: 0.3,
      metalness: 0.7,
    }), []);

  useFrame((state, delta) => {
    if (!heartGroupRef.current || !leftVentricleRef.current || !rightVentricleRef.current ||
        !leftAtriumRef.current || !rightAtriumRef.current) return;

    const t = state.clock.getElapsedTime();
    
    // Complex cardiac cycle animation
    const systole = Math.pow(Math.sin(t * 4), 16); // Ventricular contraction
    const diastole = Math.pow(Math.sin(t * 4 + 0.2), 8); // Ventricular relaxation
    const atrialContraction = Math.pow(Math.sin(t * 4 - 0.2), 12); // Atrial contraction

    // Ventricle animations
    const ventricleScale = 1 - Math.max(systole, diastole) * 0.15;
    leftVentricleRef.current.scale.set(ventricleScale, ventricleScale, ventricleScale);
    rightVentricleRef.current.scale.set(ventricleScale * 0.9, ventricleScale * 0.9, ventricleScale * 0.9);

    // Atrial animations
    const atrialScale = 1 - atrialContraction * 0.1;
    leftAtriumRef.current.scale.set(atrialScale, atrialScale, atrialScale);
    rightAtriumRef.current.scale.set(atrialScale * 0.9, atrialScale * 0.9, atrialScale * 0.9);

    // Twisting motion during contraction
    const twist = systole * 0.1;
    heartGroupRef.current.rotation.y = Math.sin(t * 2) * 0.05;
    heartGroupRef.current.rotation.z = Math.cos(t * 2) * 0.05 + twist;

    // Update pulse opacity
    setPulseOpacity(0.1 + Math.sin(t * 4) * 0.05);

    if (isActive) {
      targetScale.set(1.2, 1.2, 1.2);
      targetPosition.set(0, 0.5, 0);
    } else {
      targetScale.set(1, 1, 1);
      targetPosition.set(0, 0, 0);
    }

    // Smooth transitions
    heartGroupRef.current.scale.lerp(targetScale, 0.1);
    heartGroupRef.current.position.lerp(targetPosition, 0.1);
  });

  return (
    <group ref={heartGroupRef}>
      {/* Left Ventricle (main pumping chamber) */}
      <Sphere
        ref={leftVentricleRef}
        position={[-0.2, -0.1, 0]}
        args={[0.4, 64, 64]}
      >
        <MeshDistortMaterial
          color="#cc0000"
          speed={2}
          distort={0.2}
          radius={1}
          metalness={0.3}
          roughness={0.7}
        />
      </Sphere>

      {/* Right Ventricle */}
      <Sphere
        ref={rightVentricleRef}
        position={[0.2, -0.1, 0]}
        args={[0.35, 64, 64]}
      >
        <MeshDistortMaterial
          color="#990000"
          speed={2}
          distort={0.2}
          radius={1}
          metalness={0.3}
          roughness={0.7}
        />
      </Sphere>

      {/* Left Atrium */}
      <Sphere
        ref={leftAtriumRef}
        position={[-0.2, 0.3, 0]}
        args={[0.25, 32, 32]}
      >
        <MeshDistortMaterial
          color="#cc0000"
          speed={1.5}
          distort={0.15}
          radius={1}
          metalness={0.3}
          roughness={0.7}
        />
      </Sphere>

      {/* Right Atrium */}
      <Sphere
        ref={rightAtriumRef}
        position={[0.2, 0.3, 0]}
        args={[0.25, 32, 32]}
      >
        <MeshDistortMaterial
          color="#990000"
          speed={1.5}
          distort={0.15}
          radius={1}
          metalness={0.3}
          roughness={0.7}
        />
      </Sphere>

      {/* Aorta */}
      <Cylinder
        position={[-0.2, 0.6, 0]}
        rotation={[0, 0, -Math.PI / 6]}
        args={[0.08, 0.08, 0.4, 16]}
      >
        <meshStandardMaterial
          color="#cc0000"
          metalness={0.3}
          roughness={0.7}
        />
      </Cylinder>

      {/* Pulmonary Artery */}
      <Cylinder
        position={[0.2, 0.6, 0]}
        rotation={[0, 0, Math.PI / 6]}
        args={[0.08, 0.08, 0.4, 16]}
      >
        <meshStandardMaterial
          color="#990000"
          metalness={0.3}
          roughness={0.7}
        />
      </Cylinder>

      {/* Pulse effect */}
      <Sphere args={[1.1, 32, 32]}>
        <meshBasicMaterial
          color="#ff0000"
          transparent
          opacity={pulseOpacity}
        />
      </Sphere>
    </group>
  );
};

export default Heart; 