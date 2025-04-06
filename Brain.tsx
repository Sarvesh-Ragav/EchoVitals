import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Points, PointMaterial, Cylinder, Plane } from '@react-three/drei';
import { Vector3, Mesh, Float32BufferAttribute, Group, SphereGeometry, Color, DoubleSide, Shape, ExtrudeGeometry } from 'three';

interface BrainProps {
  isActive: boolean;
}

const Brain: React.FC<BrainProps> = ({ isActive }) => {
  const brainGroupRef = useRef<Group>(null);
  const leftHemisphereRef = useRef<Mesh>(null);
  const rightHemisphereRef = useRef<Mesh>(null);
  const cerebellumRef = useRef<Mesh>(null);
  const brainStemRef = useRef<Mesh>(null);
  const crossSectionRef = useRef<Mesh>(null);
  const ventricleMeshRef = useRef<Mesh>(null);
  
  const targetScale = useMemo(() => new Vector3(1, 1, 1), []);
  const targetPosition = useMemo(() => new Vector3(0, 0, 0), []);
  const targetRotation = useMemo(() => new Vector3(0, -Math.PI / 2, 0), []); // Side view rotation

  // Generate highly detailed cortical geometry with smooth transitions
  const generateCortexGeometry = (radius: number, detail: number) => {
    const geometry = new SphereGeometry(radius, detail, detail);
    const positions = geometry.attributes.position;
    const count = positions.count;
    
    // Create smooth anatomical deformations
    for (let i = 0; i < count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      
      // Smooth primary sulci with gradual transitions
      const centralSulcus = Math.sin(y * 12 + x * 2.5) * Math.cos(x * 2) * 0.08;
      const lateralSulcus = Math.sin(x * 14 + z * 2.5) * Math.cos(z * 2) * 0.07;
      const superiorFrontalSulcus = Math.sin(z * 10 + y * 3) * Math.cos(y * 2) * 0.06;
      const parietoOccipitalSulcus = Math.sin(y * 13 - z * 3) * Math.cos(z * 2) * 0.07;
      
      // Blended secondary sulci
      const precentralSulcus = Math.sin(y * 20 + x * 4) * Math.cos(x * 3) * 0.04;
      const postCentralSulcus = Math.sin(y * 20 - x * 4) * Math.cos(x * 3) * 0.04;
      const superiorTemporalSulcus = Math.sin(x * 25 + z * 5) * Math.cos(z * 3) * 0.035;
      
      // Smooth microfolding with gradual transitions
      const microfolding = (
        Math.sin(x * 40) * Math.sin(y * 40) * Math.sin(z * 40) * 0.015 +
        Math.sin(x * 35 + y * 35) * Math.sin(z * 35) * 0.02 +
        Math.sin(y * 45 - z * 45) * Math.sin(x * 45) * 0.015
      );
      
      // Smooth gyri transitions
      const precentralGyrus = Math.cos(y * 16 + x * 3) * Math.sin(x * 2) * 0.05;
      const postCentralGyrus = Math.cos(y * 16 - x * 3) * Math.sin(x * 2) * 0.05;
      const superiorFrontalGyrus = Math.cos(z * 15 + y * 4) * Math.sin(y * 2) * 0.045;
      const middleFrontalGyrus = Math.cos(z * 14 - y * 4) * Math.sin(y * 2) * 0.045;
      const inferiorFrontalGyrus = Math.cos(x * 18 + z * 3) * Math.sin(z * 2) * 0.04;
      
      // Smooth regional transitions
      const frontalLobe = y > 0 ? Math.sin(y * 6) * 0.03 : 0;
      const parietalLobe = y < 0 && z > 0 ? Math.sin(z * 6) * 0.03 : 0;
      const temporalLobe = x > 0 ? Math.cos(x * 8) * 0.035 : 0;
      const occipitalLobe = z < 0 ? Math.sin(z * 9) * 0.04 : 0;
      
      // Smooth longitudinal fissure
      const fissureDepth = 0.12;
      const fissureWidth = 0.1;
      const fissureTransition = Math.abs(x) / fissureWidth;
      const longitudinalFissure = Math.abs(x) < fissureWidth
        ? (1 - Math.pow(fissureTransition, 2)) * fissureDepth * (Math.sin(y * 8) * 0.5 + 0.5)
        : 0;
      
      // Blend all deformations with smooth weights
      const totalDeformation = 
        centralSulcus * 1.0 +
        lateralSulcus * 0.9 +
        superiorFrontalSulcus * 0.8 +
        parietoOccipitalSulcus * 0.8 +
        precentralSulcus * 0.7 +
        postCentralSulcus * 0.7 +
        superiorTemporalSulcus * 0.6 +
        microfolding * 0.3 +
        precentralGyrus * 0.8 +
        postCentralGyrus * 0.8 +
        superiorFrontalGyrus * 0.7 +
        middleFrontalGyrus * 0.7 +
        inferiorFrontalGyrus * 0.6 +
        frontalLobe * 0.5 +
        parietalLobe * 0.5 +
        temporalLobe * 0.5 +
        occipitalLobe * 0.6 -
        longitudinalFissure;
      
      // Apply smooth deformation
      const normal = new Vector3(x, y, z).normalize();
      const deformationVector = normal.multiplyScalar(totalDeformation);
      
      positions.setXYZ(
        i,
        x + deformationVector.x,
        y + deformationVector.y,
        z + deformationVector.z
      );
    }
    
    geometry.computeVertexNormals();
    return geometry;
  };

  // Generate internal structures
  const generateInternalStructures = () => {
    // Ventricle shape
    const ventricleShape = new Shape();
    ventricleShape.moveTo(0, 0);
    ventricleShape.bezierCurveTo(0.1, 0.1, 0.2, 0.15, 0.15, 0.2);
    ventricleShape.bezierCurveTo(0.1, 0.25, 0.05, 0.2, 0, 0.15);
    ventricleShape.bezierCurveTo(-0.05, 0.1, -0.1, 0.05, 0, 0);

    const extrudeSettings = {
      steps: 2,
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5
    };

    return new ExtrudeGeometry(ventricleShape, extrudeSettings);
  };

  // Generate neural pathways
  const generateNeuralPathways = () => {
    const points = [];
    const pathCount = 2000;
    
    for (let i = 0; i < pathCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 0.4 + Math.random() * 0.3;
      
      // Create pathways connecting different brain regions
      const region = Math.random();
      let x, y, z;
      
      if (region < 0.25) { // Corpus callosum pathways
        x = radius * Math.cos(theta) * 0.8;
        y = radius * Math.sin(theta) * 0.2;
        z = radius * Math.sin(phi) * 0.6;
      } else if (region < 0.5) { // Limbic system connections
        x = radius * Math.sin(phi) * 0.4;
        y = -radius * Math.cos(phi) * 0.3;
        z = radius * Math.sin(theta) * 0.5;
      } else if (region < 0.75) { // Thalamic radiations
        x = radius * Math.sin(phi) * Math.cos(theta) * 0.6;
        y = radius * Math.cos(phi) * 0.4;
        z = radius * Math.sin(phi) * Math.sin(theta) * 0.5;
      } else { // Association fibers
        x = radius * Math.cos(theta) * 0.7;
        y = radius * Math.sin(phi) * 0.5;
        z = radius * Math.sin(theta) * 0.4;
      }
      
      points.push(x, y, z);
    }
    
    return new Float32BufferAttribute(points, 3);
  };

  useFrame((state, delta) => {
    if (!brainGroupRef.current || !leftHemisphereRef.current || !rightHemisphereRef.current || 
        !cerebellumRef.current || !brainStemRef.current || !crossSectionRef.current) return;

    const t = state.clock.getElapsedTime();
    
    // Ultra-smooth physiological animations
    const baseScale = 1 + Math.sin(t * 0.4) * 0.001;
    const brainActivity = Math.sin(t * 1.2) * 0.0008 * Math.sin(t * 1.5);
    const bloodFlow = Math.sin(t * 0.6 + Math.PI/4) * 0.0008;
    
    // Smooth hemisphere animations with intersection emphasis
    leftHemisphereRef.current.scale.lerp(
      new Vector3(
        baseScale + brainActivity,
        baseScale + bloodFlow,
        baseScale + brainActivity
      ),
      0.1
    );
    rightHemisphereRef.current.scale.lerp(
      new Vector3(
        baseScale - brainActivity,
        baseScale + bloodFlow,
        baseScale - brainActivity
      ),
      0.1
    );

    // Ultra-smooth cerebellum movement
    cerebellumRef.current.rotation.x = Math.sin(t * 0.15) * 0.003;
    cerebellumRef.current.rotation.z = Math.cos(t * 0.15) * 0.002;
    
    if (isActive) {
      targetScale.set(2.5, 2.5, 2.5); // Larger scale for internal view
      targetPosition.set(-2, 0.4, 0); // Further to the side
      brainGroupRef.current.rotation.y = -Math.PI / 2.2; // Angled view
      brainGroupRef.current.rotation.z = Math.PI / 12; // Slight tilt
      
      // Animate cross-section plane
      if (crossSectionRef.current) {
        crossSectionRef.current.position.x = Math.sin(t * 0.2) * 0.1;
      }
    } else {
      targetScale.set(1, 1, 1);
      targetPosition.set(0, 0, 0);
      brainGroupRef.current.rotation.y = 0;
      brainGroupRef.current.rotation.z = 0;
    }

    // Smooth transitions
    brainGroupRef.current.scale.lerp(targetScale, 0.05);
    brainGroupRef.current.position.lerp(targetPosition, 0.05);
  });

  // Generate geometries
  const leftHemisphereGeometry = useMemo(() => generateCortexGeometry(0.5, 384), []);
  const rightHemisphereGeometry = useMemo(() => generateCortexGeometry(0.5, 384), []);
  const internalStructures = useMemo(() => generateInternalStructures(), []);
  const neuralPathways = useMemo(() => generateNeuralPathways(), []);

  return (
    <group ref={brainGroupRef}>
      {/* Cross-section plane */}
      <Plane
        ref={crossSectionRef}
        args={[2, 2]}
        position={[0, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <meshPhysicalMaterial
          color="#ff9999"
          metalness={0.1}
          roughness={0.8}
          transparent
          opacity={0.1}
          side={DoubleSide}
        />
      </Plane>

      {/* Left Hemisphere */}
      <mesh
        ref={leftHemisphereRef}
        position={[-0.25, 0, 0]}
        geometry={leftHemisphereGeometry}
      >
        <meshPhysicalMaterial
          color="#e4a9a9"
          metalness={0.02}
          roughness={0.88}
          clearcoat={0.4}
          clearcoatRoughness={0.25}
          envMapIntensity={0.6}
          sheen={0.5}
          sheenRoughness={0.4}
          sheenColor={new Color("#ffcdc9")}
          transparent
          opacity={0.7}
          side={DoubleSide}
        />
      </mesh>

      {/* Right Hemisphere */}
      <mesh
        ref={rightHemisphereRef}
        position={[0.25, 0, 0]}
        geometry={rightHemisphereGeometry}
      >
        <meshPhysicalMaterial
          color="#e4a9a9"
          metalness={0.02}
          roughness={0.88}
          clearcoat={0.4}
          clearcoatRoughness={0.25}
          envMapIntensity={0.6}
          sheen={0.5}
          sheenRoughness={0.4}
          sheenColor={new Color("#ffcdc9")}
          transparent
          opacity={0.7}
          side={DoubleSide}
        />
      </mesh>

      {/* Internal Structures */}
      <group position={[0, 0, 0]}>
        {/* Ventricles */}
        <mesh
          ref={ventricleMeshRef}
          geometry={internalStructures}
          position={[0, 0.1, 0]}
          scale={[1, 1, 1]}
        >
          <meshPhysicalMaterial
            color="#88ccff"
            metalness={0.1}
            roughness={0.6}
            transparent
            opacity={0.8}
            side={DoubleSide}
          />
        </mesh>

        {/* Thalamus */}
        <Sphere args={[0.15, 32, 32]} position={[0, -0.1, 0]}>
          <meshPhysicalMaterial
            color="#cc99cc"
            metalness={0.1}
            roughness={0.7}
            transparent
            opacity={0.9}
          />
        </Sphere>

        {/* Hippocampus */}
        <mesh position={[0.2, -0.2, 0.1]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.05, 0.08, 0.3, 16]} />
          <meshPhysicalMaterial
            color="#99cc99"
            metalness={0.1}
            roughness={0.7}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>

      {/* Neural Pathways */}
      <Points>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            {...neuralPathways}
          />
        </bufferGeometry>
        <PointMaterial
          transparent
          size={0.004}
          sizeAttenuation
          blending={2}
          depthWrite={false}
          color="#ffff00"
          opacity={0.4}
        />
      </Points>

      {/* Cerebellum with internal detail */}
      <group position={[0, -0.45, -0.2]}>
        <Sphere
          ref={cerebellumRef}
          args={[0.3, 192, 192]}
          scale={[1, 0.45, 0.8]}
        >
          <meshPhysicalMaterial
            color="#dba1a1"
            metalness={0.02}
            roughness={0.92}
            clearcoat={0.3}
            clearcoatRoughness={0.3}
            envMapIntensity={0.5}
            sheen={0.4}
            sheenRoughness={0.5}
            sheenColor={new Color("#ffcdc9")}
            transparent
            opacity={0.7}
            side={DoubleSide}
          />
        </Sphere>
      </group>

      {/* Brain Stem with internal structure */}
      <group position={[0, -0.7, -0.1]} rotation={[0.2, 0, 0]}>
        <Cylinder
          ref={brainStemRef}
          args={[0.12, 0.15, 0.4, 64]}
        >
          <meshPhysicalMaterial
            color="#e6e6e6"
            metalness={0.02}
            roughness={0.85}
            clearcoat={0.3}
            clearcoatRoughness={0.3}
            envMapIntensity={0.5}
            transparent
            opacity={0.7}
            side={DoubleSide}
          />
        </Cylinder>
        {/* Medulla Oblongata with internal detail */}
        <Cylinder
          position={[0, -0.2, 0]}
          args={[0.1, 0.12, 0.2, 64]}
        >
          <meshPhysicalMaterial
            color="#d9d9d9"
            metalness={0.02}
            roughness={0.85}
            clearcoat={0.3}
            clearcoatRoughness={0.3}
            envMapIntensity={0.5}
            transparent
            opacity={0.7}
            side={DoubleSide}
          />
        </Cylinder>
      </group>
    </group>
  );
};

export default Brain; 