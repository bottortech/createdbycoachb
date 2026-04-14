"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

interface SpotLightWithTargetProps {
  position: [number, number, number];
  targetPosition: [number, number, number];
  angle?: number;
  penumbra?: number;
  intensity?: number;
  distance?: number;
  color?: string;
  castShadow?: boolean;
  shadowMapSize?: number;
}

/**
 * SpotLight with a properly configured target Object3D.
 * R3F's spotLight doesn't support target-position directly,
 * so we create and manage the target manually.
 */
export default function SpotLightWithTarget({
  position,
  targetPosition,
  angle = 0.55,
  penumbra = 0.8,
  intensity = 5,
  distance = 12,
  color = "#ffe5c0",
  castShadow = true,
  shadowMapSize = 512,
}: SpotLightWithTargetProps) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const { scene } = useThree();

  useEffect(() => {
    if (!lightRef.current) return;
    const target = new THREE.Object3D();
    target.position.set(...targetPosition);
    scene.add(target);
    lightRef.current.target = target;
    return () => { scene.remove(target); };
  }, [scene, targetPosition]);

  return (
    <spotLight
      ref={lightRef}
      position={position}
      angle={angle}
      penumbra={penumbra}
      intensity={intensity}
      distance={distance}
      color={color}
      castShadow={castShadow}
      shadow-mapSize-width={shadowMapSize}
      shadow-mapSize-height={shadowMapSize}
      shadow-bias={-0.0005}
    />
  );
}
