"use client";

import { useRef, useState, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { getPublishedPredictions } from "@/data/predictions";
import { PREDICTION_STATUS_META, type PredictionMeta } from "@/types/prediction";
import SpotLightWithTarget from "./SpotLightWithTarget";

// South-facing alcove off the Gallery II / main gallery south wall at z=-4.
// Doorway cut into the south wall at x=-3.5..-1.5.
// Room occupies x=-5..0, z=-9..-4 (5 × 5 units).
const ALCOVE_X_MIN = -5;
const ALCOVE_X_MAX = 0;
const ALCOVE_Z_MIN = -9; // back wall
const ALCOVE_Z_MAX = -4; // doorway / shared with gallery south wall
const ALCOVE_HEIGHT = 3.6;
const ALCOVE_CX = (ALCOVE_X_MIN + ALCOVE_X_MAX) / 2; // -2.5
const ALCOVE_CZ = (ALCOVE_Z_MIN + ALCOVE_Z_MAX) / 2; // -6.5
const ALCOVE_W = ALCOVE_X_MAX - ALCOVE_X_MIN;         // 5
const ALCOVE_D = ALCOVE_Z_MAX - ALCOVE_Z_MIN;         // 5

const DOOR_X_MIN = -3.5;
const DOOR_X_MAX = -1.5;

// Door-side wall (interior) left/right segment widths
const LEFT_SEG_W = DOOR_X_MIN - ALCOVE_X_MIN;           // 1.5
const LEFT_SEG_CX = (ALCOVE_X_MIN + DOOR_X_MIN) / 2;   // -4.25
const RIGHT_SEG_W = ALCOVE_X_MAX - DOOR_X_MAX;           // 1.5
const RIGHT_SEG_CX = (DOOR_X_MAX + ALCOVE_X_MAX) / 2;  // -0.75

// ── Prediction frame ──────────────────────────────────────────────────────────

interface PredictionFrameProps {
  position: [number, number, number];
  rotation: [number, number, number];
  prediction: PredictionMeta;
  onSelect: (slug: string) => void;
  width?: number;
  height?: number;
}

function PredictionFrame({
  position,
  rotation,
  prediction,
  onSelect,
  width = 1.6,
  height = 1.1,
}: PredictionFrameProps) {
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);
  const PAD = 0.052;

  useFrame(({ clock }) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      const base = hovered ? 0.2 : 0.06;
      const pulse = Math.sin(clock.getElapsedTime() * 1.4) * 0.03;
      mat.opacity = base + pulse;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Gold frame border */}
      <mesh position={[0, 0, -0.016]}>
        <boxGeometry args={[width + PAD * 2, height + PAD * 2, 0.016]} />
        <meshStandardMaterial color="#c9a84c" metalness={0.82} roughness={0.18} />
      </mesh>

      {/* Dark canvas */}
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#06060e" />
      </mesh>

      {/* Pulsing glow overlay */}
      <mesh ref={glowRef} position={[0, 0, 0.001]}>
        <planeGeometry args={[width + PAD * 4, height + PAD * 4]} />
        <meshBasicMaterial color="#c9a84c" transparent opacity={0.06} depthWrite={false} />
      </mesh>

      {/* Prediction number kicker */}
      <Text
        position={[0, height / 2 - 0.1, 0.003]}
        fontSize={0.048}
        color="#c9a84c"
        letterSpacing={0.35}
        anchorX="center"
        anchorY="middle"
      >
        {`AI PREDICTION ${prediction.number}`}
      </Text>

      {/* Thin divider */}
      <mesh position={[0, height / 2 - 0.2, 0.003]}>
        <planeGeometry args={[width - 0.12, 0.002]} />
        <meshBasicMaterial color="#c9a84c" transparent opacity={0.3} />
      </mesh>

      {/* Title */}
      <Text
        position={[0, 0.1, 0.003]}
        fontSize={0.085}
        color="#f5f5f5"
        maxWidth={width - 0.14}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        lineHeight={1.4}
      >
        {prediction.title}
      </Text>

      {/* Core idea */}
      <Text
        position={[0, -0.22, 0.003]}
        fontSize={0.044}
        color="rgba(180,180,195,0.7)"
        maxWidth={width - 0.18}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        lineHeight={1.5}
      >
        {prediction.coreIdea}
      </Text>

      {/* Status badge — colored dot + label, single source of truth is
          PREDICTION_STATUS_META so this always matches the DOM badges. */}
      <group position={[0, -0.35, 0.003]}>
        <mesh position={[-0.15, 0, 0]}>
          <circleGeometry args={[0.014, 16]} />
          <meshBasicMaterial
            color={PREDICTION_STATUS_META[prediction.status].color}
            toneMapped={false}
          />
        </mesh>
        <Text
          position={[-0.11, 0, 0]}
          fontSize={0.032}
          color={PREDICTION_STATUS_META[prediction.status].color}
          letterSpacing={0.18}
          anchorX="left"
          anchorY="middle"
        >
          {PREDICTION_STATUS_META[prediction.status].label.toUpperCase()}
        </Text>
      </group>

      {/* Date */}
      <Text
        position={[0, -(height / 2 - 0.1), 0.003]}
        fontSize={0.03}
        color="rgba(201,168,76,0.5)"
        letterSpacing={0.12}
        anchorX="center"
        anchorY="middle"
      >
        {new Date(prediction.date + "T12:00:00").toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        })}
      </Text>

      {/* Hover tooltip */}
      {hovered && (
        <Html position={[0, height / 2 + 0.2, 0.01]} center style={{ pointerEvents: "none" }}>
          <div
            style={{
              background: "rgba(12,10,8,0.92)",
              border: "1px solid rgba(201,168,76,0.45)",
              borderRadius: "6px",
              padding: "6px 14px",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                color: "#c9a84c",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.06em",
              }}
            >
              Click to read
            </div>
          </div>
        </Html>
      )}

      {/* Clickable hit area */}
      <mesh
        position={[0, 0, 0.012]}
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
          onSelect(prediction.slug);
        }}
        visible={false}
      >
        <planeGeometry args={[width + 0.1, height + 0.1]} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>

      {/* Ceiling spotlight */}
      <SpotLightWithTarget
        position={[position[0], ALCOVE_HEIGHT - 0.2, position[2] + 0.5]}
        targetPosition={[position[0], position[1], position[2]]}
        intensity={20}
        angle={0.42}
        penumbra={0.6}
        distance={8}
        castShadow={false}
        color="#ffeedd"
      />

      {/* Brass category plaque */}
      <group position={[0, -(height / 2) - 0.065, 0.005]}>
        <mesh>
          <boxGeometry args={[0.76, 0.068, 0.01]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.85} roughness={0.15} />
        </mesh>
        <Text
          position={[0, 0, 0.007]}
          fontSize={0.024}
          color="#1a1108"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          {prediction.category.toUpperCase()}
        </Text>
      </group>
    </group>
  );
}

// ── Placeholder frame ─────────────────────────────────────────────────────────

function PlaceholderPredictionFrame({
  position,
  rotation,
  number,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  number: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.016]}>
        <boxGeometry args={[1.1, 0.82, 0.016]} />
        <meshStandardMaterial color="#c9a84c" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh>
        <planeGeometry args={[1.0, 0.72]} />
        <meshStandardMaterial color="#06060e" />
      </mesh>
      <Text
        position={[0, 0.1, 0.003]}
        fontSize={0.042}
        color="rgba(201,168,76,0.28)"
        letterSpacing={0.3}
        anchorX="center"
        anchorY="middle"
      >
        {`AI PREDICTION ${number}`}
      </Text>
      <Text
        position={[0, -0.07, 0.003]}
        fontSize={0.052}
        color="rgba(201,168,76,0.2)"
        letterSpacing={0.18}
        anchorX="center"
        anchorY="middle"
      >
        COMING SOON
      </Text>
    </group>
  );
}

// ── Wing component ────────────────────────────────────────────────────────────

interface PredictionsWingProps {
  onSelectPrediction: (slug: string) => void;
}

export default function PredictionsWing({ onSelectPrediction }: PredictionsWingProps) {
  const floorTex = useTexture("/images/gallery/floor.jpg");
  const ceilingTex = useTexture("/images/gallery/ceiling.jpg");
  const wallTex = useTexture("/images/gallery/wall.jpg");
  const bannerTex = useTexture("/images/ai-predictions.png");

  useLayoutEffect(() => {
    bannerTex.colorSpace = THREE.SRGBColorSpace;
  }, [bannerTex]);

  const wc = "#9a9690";

  return (
    <group>
      {/* ── Lighting ── */}
      <ambientLight intensity={0.28} color="#fff3e0" />
      <pointLight
        position={[ALCOVE_CX, ALCOVE_HEIGHT - 0.3, ALCOVE_CZ]}
        intensity={3.5}
        distance={10}
        color="#ffd9a8"
      />
      {/* Cool intellectual accent */}
      <pointLight
        position={[ALCOVE_CX, 1.5, ALCOVE_Z_MIN + 0.5]}
        intensity={1.2}
        distance={5}
        color="#a8b8e0"
      />

      {/* ── Floor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ALCOVE_CX, 0.001, ALCOVE_CZ]} receiveShadow>
        <planeGeometry args={[ALCOVE_W, ALCOVE_D]} />
        <meshStandardMaterial map={floorTex} color="#807060" metalness={0.4} roughness={0.55} />
      </mesh>

      {/* ── Ceiling ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[ALCOVE_CX, ALCOVE_HEIGHT, ALCOVE_CZ]}>
        <planeGeometry args={[ALCOVE_W, ALCOVE_D]} />
        <meshStandardMaterial map={ceilingTex} color="#706860" />
      </mesh>

      {/* ── Back wall (z = ALCOVE_Z_MIN = -9), faces +z into room ── */}
      <mesh position={[ALCOVE_CX, ALCOVE_HEIGHT / 2, ALCOVE_Z_MIN]} receiveShadow>
        <planeGeometry args={[ALCOVE_W, ALCOVE_HEIGHT]} />
        <meshStandardMaterial map={wallTex} color={wc} />
      </mesh>

      {/* ── West wall (x = ALCOVE_X_MIN = -5), faces +x into room ── */}
      <mesh
        position={[ALCOVE_X_MIN, ALCOVE_HEIGHT / 2, ALCOVE_CZ]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[ALCOVE_D, ALCOVE_HEIGHT]} />
        <meshStandardMaterial map={wallTex} color={wc} />
      </mesh>

      {/* ── East wall (x = ALCOVE_X_MAX = 0), faces -x into room ── */}
      <mesh
        position={[ALCOVE_X_MAX, ALCOVE_HEIGHT / 2, ALCOVE_CZ]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[ALCOVE_D, ALCOVE_HEIGHT]} />
        <meshStandardMaterial map={wallTex} color={wc} />
      </mesh>

      {/* ── Door-side wall interior (z = -4), split by doorway, faces -z into room ── */}
      <mesh
        position={[LEFT_SEG_CX, ALCOVE_HEIGHT / 2, ALCOVE_Z_MAX]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
      >
        <planeGeometry args={[LEFT_SEG_W, ALCOVE_HEIGHT]} />
        <meshStandardMaterial map={wallTex} color={wc} />
      </mesh>
      <mesh
        position={[RIGHT_SEG_CX, ALCOVE_HEIGHT / 2, ALCOVE_Z_MAX]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
      >
        <planeGeometry args={[RIGHT_SEG_W, ALCOVE_HEIGHT]} />
        <meshStandardMaterial map={wallTex} color={wc} />
      </mesh>

      {/* ── Ceiling track rail ── */}
      <mesh position={[ALCOVE_CX, ALCOVE_HEIGHT - 0.08, ALCOVE_CZ]}>
        <boxGeometry args={[ALCOVE_W, 0.025, 0.025]} />
        <meshStandardMaterial color="#222" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* ── Doorway frame — gold trim at z=-4 ── */}
      {/* Top lintel */}
      <mesh
        position={[(DOOR_X_MIN + DOOR_X_MAX) / 2, 2.6, ALCOVE_Z_MAX]}
      >
        <boxGeometry args={[DOOR_X_MAX - DOOR_X_MIN + 0.08, 0.06, 0.08]} />
        <meshStandardMaterial
          color="#8a6a2e"
          emissive="#c9a84c"
          emissiveIntensity={0.22}
          metalness={0.85}
          roughness={0.35}
        />
      </mesh>
      {/* Left jamb */}
      <mesh position={[DOOR_X_MIN, 1.3, ALCOVE_Z_MAX]}>
        <boxGeometry args={[0.04, 2.6, 0.08]} />
        <meshStandardMaterial
          color="#8a6a2e"
          emissive="#c9a84c"
          emissiveIntensity={0.22}
          metalness={0.85}
          roughness={0.35}
        />
      </mesh>
      {/* Right jamb */}
      <mesh position={[DOOR_X_MAX, 1.3, ALCOVE_Z_MAX]}>
        <boxGeometry args={[0.04, 2.6, 0.08]} />
        <meshStandardMaterial
          color="#8a6a2e"
          emissive="#c9a84c"
          emissiveIntensity={0.22}
          metalness={0.85}
          roughness={0.35}
        />
      </mesh>

      {/* ── Wing sign above doorway — PNG banner, identical setup to Tech Vault ── */}
      <mesh position={[(DOOR_X_MIN + DOOR_X_MAX) / 2, 3.0, ALCOVE_Z_MAX + 0.06]}>
        <planeGeometry args={[1.8, 1.2]} />
        <meshBasicMaterial
          map={bannerTex}
          alphaTest={0.5}
          toneMapped={false}
        />
      </mesh>

      {/* ── Prediction frames — centered on back wall ── */}
      {/* Main frame: The Authenticity Shift, center of back wall */}
      {getPublishedPredictions().map((pred) => (
        <PredictionFrame
          key={pred.slug}
          position={[ALCOVE_CX, 1.85, ALCOVE_Z_MIN + 0.01]}
          rotation={[0, 0, 0]}
          prediction={pred}
          onSelect={onSelectPrediction}
          width={1.7}
          height={1.15}
        />
      ))}

      {/* Placeholder frames flanking the main frame */}
      <PlaceholderPredictionFrame
        position={[ALCOVE_X_MIN + 0.9, 1.75, ALCOVE_Z_MIN + 0.01]}
        rotation={[0, 0, 0]}
        number="#002"
      />
      <PlaceholderPredictionFrame
        position={[ALCOVE_X_MAX - 0.9, 1.75, ALCOVE_Z_MIN + 0.01]}
        rotation={[0, 0, 0]}
        number="#003"
      />

      {/* Side-wall accent frame — west wall */}
      <group position={[ALCOVE_X_MIN + 0.015, 1.85, ALCOVE_CZ]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0, -0.014]}>
          <boxGeometry args={[1.2, 0.85, 0.014]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh>
          <planeGeometry args={[1.1, 0.75]} />
          <meshStandardMaterial color="#06060e" />
        </mesh>
        <Text
          position={[0, 0.1, 0.003]}
          fontSize={0.052}
          color="rgba(201,168,76,0.55)"
          letterSpacing={0.28}
          anchorX="center"
          anchorY="middle"
        >
          DIGITAL MUSEUM
        </Text>
        <Text
          position={[0, -0.06, 0.003]}
          fontSize={0.038}
          color="rgba(180,190,215,0.35)"
          letterSpacing={0.12}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.0}
        >
          Of Ideas
        </Text>
      </group>

      {/* ── Ceiling spotlights ── */}
      {[-2.5].map((x, i) => (
        <group key={`pw-sp-${i}`}>
          <mesh position={[x, ALCOVE_HEIGHT - 0.15, ALCOVE_CZ]}>
            <cylinderGeometry args={[0.04, 0.06, 0.1, 8]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
