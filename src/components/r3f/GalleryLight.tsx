"use client";

interface GalleryLightProps {
  isActive: boolean;
  width: number;
}

export default function GalleryLight({ isActive, width }: GalleryLightProps) {
  const barWidth = width * 0.55;
  const barRadius = 0.012;
  const barProtrusion = 0.06;
  const mountWidth = 0.06;
  const mountHeight = 0.035;

  return (
    <group>
      {/* Wall mounting plate */}
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

      {/* Main horizontal brass bar — cylinder (Safari-safe) */}
      <group position={[0, -0.01, barProtrusion]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[barRadius, barRadius, barWidth, 12]} />
          <meshStandardMaterial
            color="#c9a84c"
            metalness={0.8}
            roughness={0.2}
            emissive="#ffd080"
            emissiveIntensity={isActive ? 0.8 : 0.1}
          />
        </mesh>
      </group>

      {/* Warm wall wash light — only rendered when artwork is active */}
      {isActive && (
        <pointLight
          position={[0, -0.03, barProtrusion + 0.02]}
          color="#ffe0a0"
          intensity={3.5}
          distance={1.5}
          decay={2}
        />
      )}
    </group>
  );
}
