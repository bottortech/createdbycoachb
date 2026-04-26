"use client";

import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";

/**
 * Memorial pendant medallion in a glass-domed wooden vitrine. Sits
 * standalone in the gallery corridor near the wall-mounted memorial
 * frame. The medallion slowly spins on its vertical axis showing a
 * photo on the front and a "Long Live MAL" message on the back.
 * Clicking the case toggles pause so visitors can examine each side.
 *
 * Layout (local space, with `position` placed at floor level):
 *   y=0.0   floor + soft glow
 *   y=0.05  pedestal base step
 *   y=0.5   pedestal column
 *   y=0.95  pedestal top step
 *   y=0.97-1.4  glass dome (half-sphere)
 *   y=1.18  medallion floats/spins inside the dome
 *
 * Glass dome uses transparent meshStandardMaterial rather than the
 * physical-transmission material because transmission requires renderer
 * config we don't currently have, and a soap-bubble look is fine here.
 */
interface TributeMedallionProps {
  /** Floor center where the pedestal sits. */
  position: [number, number, number];
  /** Optional Y rotation for the whole display (front face direction). */
  rotationY?: number;
}

const FRONT_SRC = "/images/IMG_4191.jpg";
const BACK_SRC = "/images/IMG_4192.jpg";

const PEDESTAL_TOP_Y = 0.95;
const MEDALLION_Y = 1.18;
const MEDALLION_R = 0.045; // ~9 cm diameter — pendant-scale but still readable
const ROTATION_PERIOD = 10; // seconds per full revolution

export default function TributeMedallion({
  position,
  rotationY = 0,
}: TributeMedallionProps) {
  const medallionRef = useRef<THREE.Group>(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [frontTex, setFrontTex] = useState<THREE.Texture | null>(null);
  const [backTex, setBackTex] = useState<THREE.Texture | null>(null);

  // Imperative texture loads — both faces are independent so a slow
  // download on one never blocks the other.
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let cancelled = false;
    loader.load(FRONT_SRC, (t) => {
      if (cancelled) return;
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      setFrontTex(t);
    });
    loader.load(BACK_SRC, (t) => {
      if (cancelled) return;
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      setBackTex(t);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Slow Y-axis rotation — paused on click. Delta-based so the rotation
  // stays at exactly ROTATION_PERIOD seconds per revolution regardless
  // of frame rate.
  useFrame((_, delta) => {
    if (!medallionRef.current || paused) return;
    medallionRef.current.rotation.y +=
      ((Math.PI * 2) / ROTATION_PERIOD) * delta;
  });

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
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
        setPaused((p) => !p);
      }}
    >
      {/* Subtle warm floor glow under the case — lit-from-within shrine
          feel without an actual spotlight. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[0.7, 32]} />
        <meshBasicMaterial
          color="#ffb87a"
          transparent
          opacity={0.18}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* === Wooden pedestal === */}
      {/* Base step */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.1, 0.55]} />
        <meshStandardMaterial color="#3a2818" roughness={0.7} />
      </mesh>
      {/* Main column */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.78, 0.42]} />
        <meshStandardMaterial color="#251509" roughness={0.65} />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, PEDESTAL_TOP_Y, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.04, 0.5]} />
        <meshStandardMaterial color="#3a2818" roughness={0.7} />
      </mesh>

      {/* Engraved gold trim — torus rings at the top and bottom of the
          column. Gives the case a museum-piece formality. */}
      <mesh position={[0, PEDESTAL_TOP_Y - 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.225, 0.012, 10, 48]} />
        <meshStandardMaterial
          color="#b89248"
          metalness={0.92}
          roughness={0.28}
          emissive="#5a3a18"
          emissiveIntensity={0.22}
        />
      </mesh>
      <mesh position={[0, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.245, 0.012, 10, 48]} />
        <meshStandardMaterial
          color="#b89248"
          metalness={0.92}
          roughness={0.28}
          emissive="#5a3a18"
          emissiveIntensity={0.22}
        />
      </mesh>

      {/* Brass placard mounted on the front face of the column */}
      <group position={[0, 0.55, 0.211]}>
        {/* Brass border */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.34, 0.1]} />
          <meshStandardMaterial
            color="#8a6a2a"
            metalness={0.7}
            roughness={0.4}
          />
        </mesh>
        {/* Cream plate */}
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[0.31, 0.075]} />
          <meshStandardMaterial color="#e8d8b0" roughness={0.92} />
        </mesh>
        {/* Engraved text */}
        <Text
          position={[0, 0.012, 0.002]}
          fontSize={0.013}
          color="#1a1208"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.18}
        >
          IN MEMORY · JAMAL BROWN
        </Text>
        <Text
          position={[0, -0.018, 0.002]}
          fontSize={0.011}
          color="#3a2818"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
        >
          1997 — 2021
        </Text>
      </group>

      {/* === Glass dome — half sphere covering the medallion === */}
      <mesh position={[0, PEDESTAL_TOP_Y + 0.02, 0]}>
        <sphereGeometry
          args={[0.22, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={hovered ? 0.18 : 0.12}
          roughness={0.05}
          metalness={0.0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Brass ring at the base of the dome (where it meets the pedestal) */}
      <mesh position={[0, PEDESTAL_TOP_Y + 0.025, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.215, 0.018, 10, 48]} />
        <meshStandardMaterial
          color="#b89248"
          metalness={0.92}
          roughness={0.3}
          emissive="#5a3a18"
          emissiveIntensity={0.22}
        />
      </mesh>

      {/* Subtle warm uplight inside the dome — bathes the medallion in
          a soft glow without adding a visible light cone. */}
      <pointLight
        position={[0, PEDESTAL_TOP_Y + 0.05, 0]}
        color="#ffc890"
        intensity={0.5}
        distance={0.7}
        decay={2}
      />

      {/* === The pendant medallion (spins) === */}
      <group ref={medallionRef} position={[0, MEDALLION_Y, 0]}>
        {/* Bail (small hanging loop at the top) */}
        <mesh position={[0, MEDALLION_R + 0.018, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.012, 0.0035, 10, 20]} />
          <meshStandardMaterial color="#d4a040" metalness={0.95} roughness={0.18} />
        </mesh>
        {/* Bail attachment (small bar from medallion top to bail) */}
        <mesh position={[0, MEDALLION_R + 0.005, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.014, 8]} />
          <meshStandardMaterial color="#d4a040" metalness={0.95} roughness={0.18} />
        </mesh>

        {/* Edge / rim — thin gold cylinder forming the medallion edge */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[MEDALLION_R, MEDALLION_R, 0.006, 48]} />
          <meshStandardMaterial
            color="#d4a040"
            metalness={0.95}
            roughness={0.2}
            emissive="#5a3a18"
            emissiveIntensity={0.12}
          />
        </mesh>

        {/* Front face (photo) — at +Z in local space */}
        <mesh position={[0, 0, 0.0035]}>
          <circleGeometry args={[MEDALLION_R - 0.002, 48]} />
          <meshStandardMaterial
            map={frontTex ?? undefined}
            color={frontTex ? "#ffffff" : "#3a2818"}
            metalness={0.1}
            roughness={0.55}
            side={THREE.FrontSide}
          />
        </mesh>
        {/* Back face ("Long Live MAL") — flipped to face -Z */}
        <mesh position={[0, 0, -0.0035]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[MEDALLION_R - 0.002, 48]} />
          <meshStandardMaterial
            map={backTex ?? undefined}
            color={backTex ? "#ffffff" : "#3a2818"}
            metalness={0.1}
            roughness={0.55}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Decorative chain — a row of small linked rings dangling from
            the bail, alternating orientation for a chain-link look.
            Spins with the medallion which keeps it visually attached. */}
        <Chain
          startY={MEDALLION_R + 0.03}
          length={0.075}
          links={9}
        />
      </group>
    </group>
  );
}

/**
 * Tiny chain made of alternating-orientation tori. Hangs straight down
 * from `startY` for `length` units. Stays attached to its parent group
 * so it spins with the medallion.
 */
function Chain({
  startY,
  length,
  links,
}: {
  startY: number;
  length: number;
  links: number;
}) {
  const linkSpacing = length / links;
  return (
    <group>
      {Array.from({ length: links }, (_, i) => {
        const y = startY + i * linkSpacing;
        // Alternate the link rotation 90° so adjacent rings interlock
        // visually like a real chain.
        const rotX = i % 2 === 0 ? Math.PI / 2 : 0;
        const rotY = i % 2 === 0 ? 0 : Math.PI / 2;
        return (
          <mesh key={i} position={[0, y, 0]} rotation={[rotX, rotY, 0]}>
            <torusGeometry args={[0.0055, 0.0014, 6, 14]} />
            <meshStandardMaterial color="#d4a040" metalness={0.95} roughness={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}
