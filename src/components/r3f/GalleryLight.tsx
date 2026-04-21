"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Radial gold spill — canvas texture, generated once per fixture.
function createSpillTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255, 220, 150, 1)");
  g.addColorStop(0.45, "rgba(255, 200, 120, 0.45)");
  g.addColorStop(1, "rgba(255, 200, 120, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

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

  const spillTex = useMemo(() => createSpillTexture(), []);

  // Smooth on/off animation — lerps toward isActive over ~250ms.
  const lightLevel = useRef(isActive ? 1 : 0);
  const barMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const bulbMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const haloInnerRef = useRef<THREE.MeshBasicMaterial>(null);
  const haloOuterRef = useRef<THREE.MeshBasicMaterial>(null);
  const coneMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const spillMatRef = useRef<THREE.MeshBasicMaterial>(null);

  // Reused color buffers for the bulb color interpolation.
  const bulbColorActive = useMemo(() => new THREE.Color("#fff4d0"), []);
  const bulbColorIdle = useMemo(() => new THREE.Color("#4a3a18"), []);
  const bulbColorBuf = useMemo(() => new THREE.Color(), []);

  useFrame((_, dt) => {
    const target = isActive ? 1 : 0;
    // ~250ms settle. Clamp dt to avoid catch-up jumps on frame hitches.
    const k = 1 - Math.exp(-9 * Math.min(dt, 0.05));
    lightLevel.current += (target - lightLevel.current) * k;
    const L = lightLevel.current;

    if (barMatRef.current) {
      barMatRef.current.emissiveIntensity = 0.04 + L * 0.22;
    }
    if (bulbMatRef.current) {
      bulbColorBuf.copy(bulbColorIdle).lerp(bulbColorActive, L);
      bulbMatRef.current.color.copy(bulbColorBuf);
    }
    if (haloInnerRef.current) haloInnerRef.current.opacity = L * 0.55;
    if (haloOuterRef.current) haloOuterRef.current.opacity = L * 0.2;
    if (coneMatRef.current) coneMatRef.current.opacity = L * 0.08;
    if (spillMatRef.current) spillMatRef.current.opacity = L * 0.4;
  });

  return (
    <group>
      {/* Wall spill — soft warm patch of "reflected" light on the wall above
          the fixture. Additive blend so it adds brightness without darkening. */}
      <mesh position={[0, 0.14, -0.002]}>
        <planeGeometry args={[0.55, 0.34]} />
        <meshBasicMaterial
          ref={spillMatRef}
          map={spillTex}
          color="#ffd080"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

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

      {/* Brass housing bar */}
      <group position={[0, -0.01, barProtrusion]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[barRadius, barRadius, barWidth, 12]} />
          <meshStandardMaterial
            ref={barMatRef}
            color="#c9a84c"
            metalness={0.8}
            roughness={0.2}
            emissive="#c9a84c"
            emissiveIntensity={0.04}
          />
        </mesh>
      </group>

      {/* Bulb — the visible glowing source */}
      <mesh position={[0, -0.028, barProtrusion]}>
        <sphereGeometry args={[0.012, 20, 14]} />
        <meshBasicMaterial
          ref={bulbMatRef}
          color="#4a3a18"
          toneMapped={false}
        />
      </mesh>

      {/* Inner halo — hot core glow */}
      <mesh position={[0, -0.028, barProtrusion]}>
        <sphereGeometry args={[0.035, 24, 16]} />
        <meshBasicMaterial
          ref={haloInnerRef}
          color="#ffd280"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer halo — ambient spill */}
      <mesh position={[0, -0.028, barProtrusion]}>
        <sphereGeometry args={[0.08, 24, 16]} />
        <meshBasicMaterial
          ref={haloOuterRef}
          color="#ffb860"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Short light-shaft cone */}
      <mesh position={[0, -0.12, barProtrusion]}>
        <coneGeometry args={[0.1, 0.2, 24, 1, true]} />
        <meshBasicMaterial
          ref={coneMatRef}
          color="#ffd080"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
