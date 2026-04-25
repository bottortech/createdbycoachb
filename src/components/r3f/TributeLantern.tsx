"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useState } from "react";

/**
 * Small floating paper lantern hidden in the main gallery — the entry
 * point to the Tribute Room. Subtle by design: gentle bob, soft glow,
 * minor brightening on hover. Never sparkles, never pulses.
 */
interface TributeLanternProps {
  position: [number, number, number];
  onClick?: () => void;
}
export default function TributeLantern({ position, onClick }: TributeLanternProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const baseY = position[1];

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime * 0.4;
    groupRef.current.position.y = baseY + Math.sin(t) * 0.05;
  });

  const color = "#ffb87a";

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Hanging cord */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 1.2, 6]} />
        <meshStandardMaterial color="#1a1410" />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.07, 0.055, 0.035, 16]} />
        <meshStandardMaterial color="#2a1f1a" roughness={0.8} />
      </mesh>
      {/* Paper body — emissive cylinder, brightens softly on hover */}
      <mesh>
        <cylinderGeometry args={[0.09, 0.09, 0.2, 18, 1, true]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.5 : 1.0}
          roughness={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Bottom cap */}
      <mesh position={[0, -0.115, 0]}>
        <cylinderGeometry args={[0.055, 0.04, 0.025, 16]} />
        <meshStandardMaterial color="#2a1f1a" roughness={0.8} />
      </mesh>
      {/* Tassel */}
      <mesh position={[0, -0.155, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.05, 6]} />
        <meshStandardMaterial color="#2a1f1a" />
      </mesh>
      {/* Subtle warm point light so the lantern actually emits */}
      <pointLight
        color={color}
        intensity={hovered ? 1.4 : 0.9}
        distance={2.5}
        decay={2.2}
      />
    </group>
  );
}
