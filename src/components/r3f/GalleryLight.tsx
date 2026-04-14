"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GalleryLightProps {
  isActive: boolean;
  width: number;
}

/**
 * A 3D gallery picture light fixture.
 *
 * Built from geometry:
 *  - Wall mounting plate (flush to wall)
 *  - Two support brackets
 *  - Horizontal brass bar with rounded ends (capsule shape)
 *  - Warm point light underneath for wall wash
 *
 * Active state: point light intensifies, bar gets emissive glow.
 */
export default function GalleryLight({ isActive, width }: GalleryLightProps) {
  const lightRef = useRef<THREE.PointLight>(null);
  const barRef = useRef<THREE.Mesh>(null);
  const glowIntensity = useRef(0);
  const emissiveIntensity = useRef(0);

  const barWidth = width * 0.55;
  const barRadius = 0.012;
  const barProtrusion = 0.06; // how far the bar sticks out from the wall
  const mountWidth = 0.06;
  const mountHeight = 0.035;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const speed = 0.06; // ~300ms ramp

    // Light intensity with subtle flicker when active
    const targetGlow = isActive ? 3.5 : 0.4;
    glowIntensity.current += (targetGlow - glowIntensity.current) * speed;
    const flicker = isActive ? Math.sin(t * 8) * 0.03 : 0;
    if (lightRef.current) {
      lightRef.current.intensity = glowIntensity.current + flicker;
    }

    // Bar emissive glow
    const targetEmissive = isActive ? 0.8 : 0.1;
    emissiveIntensity.current += (targetEmissive - emissiveIntensity.current) * speed;
    if (barRef.current) {
      const mat = barRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = emissiveIntensity.current;
    }
  });

  return (
    <group>
      {/* Wall mounting plate — flush to wall */}
      <mesh position={[0, 0.01, 0.003]}>
        <boxGeometry args={[mountWidth, mountHeight, 0.006]} />
        <meshStandardMaterial color="#8a7440" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Left support bracket */}
      <mesh position={[-barWidth * 0.35, -0.005, barProtrusion * 0.5]}>
        <boxGeometry args={[0.008, 0.02, barProtrusion]} />
        <meshStandardMaterial color="#9a8245" metalness={0.65} roughness={0.35} />
      </mesh>

      {/* Right support bracket */}
      <mesh position={[barWidth * 0.35, -0.005, barProtrusion * 0.5]}>
        <boxGeometry args={[0.008, 0.02, barProtrusion]} />
        <meshStandardMaterial color="#9a8245" metalness={0.65} roughness={0.35} />
      </mesh>

      {/* Main horizontal brass bar — capsule-like shape */}
      <group position={[0, -0.01, barProtrusion]} rotation={[0, 0, Math.PI / 2]}>
        <mesh ref={barRef} castShadow>
          <capsuleGeometry args={[barRadius, barWidth, 8, 16]} />
          <meshStandardMaterial
            color="#c9a84c"
            metalness={0.8}
            roughness={0.2}
            emissive="#ffd080"
            emissiveIntensity={0.1}
          />
        </mesh>
      </group>

      {/* Left end cap — slightly larger for visual weight */}
      <mesh position={[-barWidth / 2 - barRadius, -0.01, barProtrusion]} castShadow>
        <sphereGeometry args={[barRadius * 1.3, 12, 12]} />
        <meshStandardMaterial color="#c9a84c" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Right end cap */}
      <mesh position={[barWidth / 2 + barRadius, -0.01, barProtrusion]} castShadow>
        <sphereGeometry args={[barRadius * 1.3, 12, 12]} />
        <meshStandardMaterial color="#c9a84c" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Warm wall wash light — underneath the bar, shining down on the artwork */}
      <pointLight
        ref={lightRef}
        position={[0, -0.03, barProtrusion + 0.02]}
        color="#ffe0a0"
        intensity={0.4}
        distance={1.5}
        decay={2}
      />
    </group>
  );
}
