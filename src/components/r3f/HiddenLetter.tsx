"use client";

import { useRef, useState } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface HiddenLetterProps {
  char: string;
  position: [number, number, number];
  /** Additional rotation so letters on walls or floors face the right way. */
  rotation?: [number, number, number];
  /** Font size in world units. Default ~12cm — small enough to feel hidden. */
  size?: number;
  /** Called when the user clicks/taps the letter. */
  onCollect: (char: string) => void;
  /** When true, the letter has been found and should not render. */
  found?: boolean;
}

/**
 * A single hidden letter used by the scavenger hunt. Renders as a small gold
 * 3D glyph; tapping it collects it. No visual flourish or audio — discovery
 * is intentionally silent so users have to look closely.
 */
export default function HiddenLetter({
  char,
  position,
  rotation = [0, 0, 0],
  size = 0.12,
  onCollect,
  found = false,
}: HiddenLetterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  if (found) return null;

  // Invisible slightly-larger hit mesh for more forgiving click/tap targets.
  const HIT_PAD = size * 1.4;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <mesh
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
          onCollect(char);
        }}
      >
        <planeGeometry args={[HIT_PAD, HIT_PAD]} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>
      <Text
        position={[0, 0, 0.002]}
        fontSize={size}
        color={hovered ? "#ffd780" : "#c9a84c"}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        letterSpacing={0.05}
      >
        {char}
      </Text>
    </group>
  );
}
