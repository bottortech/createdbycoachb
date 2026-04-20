"use client";

import { useTexture, Text, Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef, useState } from "react";

// Midpoint of the alcove (x axis) — used to drop click-cards toward the aisle
const AISLE_CX = 3.75;

// Chip label → logo PNG lookup. Keep in sync with files in public/images/tech-vault/.
const CHIP_IMAGES: Record<string, string> = {
  "React":       "/images/tech-vault/react.png",
  "Vite":        "/images/tech-vault/vite.png",
  "Three.js":    "/images/tech-vault/three-js.png",
  "Extensions":  "/images/tech-vault/extension.png",
  "Node.js":     "/images/tech-vault/nodejs.png",
  "APIs":        "/images/tech-vault/api.png",
  "Railway":     "/images/tech-vault/railway.png",
  "Claude":      "/images/tech-vault/claude.png",
  "ChatGPT":     "/images/tech-vault/chatgpt.png",
  "AI APIs":     "/images/tech-vault/ai-api.png",
  "Unity":       "/images/tech-vault/unity.png",
  "C#":          "/images/tech-vault/csharp.png",
  "Stripe":      "/images/tech-vault/stripe.png",
  "Square":      "/images/tech-vault/square.png",
  "VS Code":     "/images/tech-vault/vscode.png",
  "Xcode":       "/images/tech-vault/xcode.png",
  "GitHub":      "/images/tech-vault/github.png",
  "PDF Parsing": "/images/tech-vault/pdf-parsing.png",
  "Matching":    "/images/tech-vault/matching.png",
  "Workflows":   "/images/tech-vault/workflows.png",
};

// Alcove geometry — branches off the gallery bottom wall (z=-4) at the
// x=3..4 doorway, extending -z into a dedicated room.
const ALCOVE_X_MIN = 0.5;
const ALCOVE_X_MAX = 7.5;
const ALCOVE_Z_MIN = -11; // back wall (far side)
const ALCOVE_Z_MAX = -4;  // door side (shared with gallery bottom wall)
const ALCOVE_HEIGHT = 3.6;
const ALCOVE_CX = (ALCOVE_X_MIN + ALCOVE_X_MAX) / 2;
const ALCOVE_CZ = (ALCOVE_Z_MIN + ALCOVE_Z_MAX) / 2;
const ALCOVE_W = ALCOVE_X_MAX - ALCOVE_X_MIN;
const ALCOVE_D = ALCOVE_Z_MAX - ALCOVE_Z_MIN;

// Doorway extent on the shared south wall (z=ALCOVE_Z_MIN).
const DOOR_X_MIN = 3;
const DOOR_X_MAX = 5;

// Vitrine dimensions
const PEDESTAL_W = 0.8;
const PEDESTAL_D = 0.6;
const PEDESTAL_H = 0.3;
const GLASS_H = 1.7;

interface CategoryData {
  id: string;
  title: string;
  tagline: string;
  chips: string[];
  position: [number, number, number];
}

// 7 categories — 3 foundational in back row, 4 applied in front row.
// AI Core is center-back (most prominent).
const CATEGORIES: CategoryData[] = [
  // Back row (z=-10, far wall) — foundational stack
  { id: "backend",    position: [2, 0, -10],   title: "Backend",    tagline: "Systems that run without friction.",     chips: ["Node.js", "APIs", "Railway"] },
  { id: "ai-core",    position: [4, 0, -10],   title: "AI Core",    tagline: "Where intelligence becomes execution.",  chips: ["Claude", "ChatGPT", "AI APIs"] },
  { id: "frontend",   position: [6, 0, -10],   title: "Frontend",   tagline: "Interfaces that feel effortless.",       chips: ["React", "Vite", "Three.js", "Extensions"] },
  // Front row (z=-6.5, nearer the door) — applied domains
  { id: "devtools",   position: [1.5, 0, -6.5], title: "Dev Tools",  tagline: "Built, tested, and shipped.",            chips: ["VS Code", "Xcode", "GitHub"] },
  { id: "payments",   position: [3, 0, -6.5],   title: "Payments",   tagline: "Seamless transactions, real products.",  chips: ["Stripe", "Square"] },
  { id: "gamedev",    position: [4.5, 0, -6.5], title: "Game Dev",   tagline: "Interactive worlds built from scratch.", chips: ["Unity", "C#"] },
  { id: "automation", position: [6, 0, -6.5],   title: "Automation", tagline: "Turning processes into systems.",        chips: ["PDF Parsing", "Matching", "Workflows"] },
];

// Animated logo plaque — gentle sine float + subtle rotation + emissive pulse.
// Logo is visible from both faces so chips read from either side of the aisle.
const CHIP_SIZE = 0.24;
const CHIP_LOGO = 0.18;

function FloatingChip({ label, baseY }: { label: string; baseY: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.MeshBasicMaterial>(null);
  const [clicked, setClicked] = useState(false);
  const src = CHIP_IMAGES[label];
  const tex = useTexture(src);
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  }, [tex]);

  // Smoothly animate scale + halo opacity toward the clicked state.
  useFrame(() => {
    if (!groupRef.current) return;
    const targetScale = clicked ? 1.18 : 1;
    const current = groupRef.current.scale.x;
    const next = current + (targetScale - current) * 0.18;
    groupRef.current.scale.setScalar(next);
    if (haloRef.current) {
      const targetOpacity = clicked ? 0.55 : 0;
      haloRef.current.opacity += (targetOpacity - haloRef.current.opacity) * 0.18;
    }
  });

  return (
    <group ref={groupRef} position={[0, baseY, 0]}>
      {/* Gold glow halo — fades in on click */}
      <mesh position={[0, 0, -0.012]}>
        <planeGeometry args={[CHIP_SIZE * 1.5, CHIP_SIZE * 1.5]} />
        <meshBasicMaterial
          ref={haloRef}
          color="#e8c56a"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Cream backing plate */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[CHIP_SIZE, CHIP_SIZE]} />
        <meshBasicMaterial color="#f0e8d0" side={THREE.DoubleSide} />
      </mesh>
      {/* Logo plane + click target */}
      <mesh
        position={[0, 0, 0.01]}
        onClick={(e) => {
          e.stopPropagation();
          setClicked((s) => !s);
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <planeGeometry args={[CHIP_SIZE, CHIP_SIZE]} />
        <meshBasicMaterial
          map={tex}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Vitrine({ data }: { data: CategoryData }) {
  const groupRef = useRef<THREE.Group>(null);
  const trimRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState(false);
  const { camera } = useThree();
  const worldPos = useMemo(() => new THREE.Vector3(), []);
  const proximityRef = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!groupRef.current) return;
    groupRef.current.getWorldPosition(worldPos);
    const dist = camera.position.distanceTo(worldPos);
    // Fully glowing under ~2m; fades to 0 by 4.5m
    const target = Math.max(0, Math.min(1, (4.5 - dist) / 2.5));
    proximityRef.current += (target - proximityRef.current) * 0.08;
    const prox = proximityRef.current;

    if (trimRef.current) {
      const mat = trimRef.current.material as THREE.MeshStandardMaterial;
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.4);
      mat.emissiveIntensity = 0.18 + prox * (0.35 + 0.15 * pulse);
    }
    if (haloRef.current) {
      const mat = haloRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = prox * 0.28;
    }
  });

  // Click card placement — push it toward the aisle so it doesn't bury in a wall
  const cardDx = data.position[0] < AISLE_CX ? 0.8 : -0.8;

  return (
    <group ref={groupRef} position={data.position}>
      {/* Soft floor halo — proximity-driven, cool tech accent */}
      <mesh ref={haloRef} position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.85, 48]} />
        <meshBasicMaterial color="#8fb8ff" transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Pedestal */}
      <mesh position={[0, PEDESTAL_H / 2, 0]}>
        <boxGeometry args={[PEDESTAL_W, PEDESTAL_H, PEDESTAL_D]} />
        <meshStandardMaterial color="#1a1410" metalness={0.35} roughness={0.55} />
      </mesh>

      {/* Gold trim (proximity glow target) */}
      <mesh ref={trimRef} position={[0, PEDESTAL_H + 0.008, 0]}>
        <boxGeometry args={[PEDESTAL_W + 0.012, 0.018, PEDESTAL_D + 0.012]} />
        <meshStandardMaterial
          color="#c9a84c"
          emissive="#c9a84c"
          emissiveIntensity={0.18}
          metalness={0.9}
          roughness={0.28}
        />
      </mesh>

      {/* Glass case */}
      <mesh position={[0, PEDESTAL_H + GLASS_H / 2, 0]}>
        <boxGeometry args={[PEDESTAL_W - 0.04, GLASS_H, PEDESTAL_D - 0.04]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.16}
          transmission={0.75}
          roughness={0.06}
          metalness={0}
          ior={1.45}
          color="#dce8f5"
        />
      </mesh>

      {/* Top cap */}
      <mesh position={[0, PEDESTAL_H + GLASS_H + 0.02, 0]}>
        <boxGeometry args={[PEDESTAL_W, 0.04, PEDESTAL_D]} />
        <meshStandardMaterial color="#1a1410" metalness={0.35} roughness={0.55} />
      </mesh>

      {/* Static logo chips — pop + glow on click */}
      {data.chips.map((chip, i) => {
        const total = data.chips.length;
        const spacing = 0.36; // sized for 0.24m plaques + breathing room
        const totalH = (total - 1) * spacing;
        const chipY = PEDESTAL_H + GLASS_H / 2 - totalH / 2 + i * spacing;
        return <FloatingChip key={chip} label={chip} baseY={chipY} />;
      })}

      {/* Category labels on both pedestal faces */}
      <Text
        position={[0, PEDESTAL_H - 0.09, PEDESTAL_D / 2 + 0.003]}
        fontSize={0.058}
        color="#c9a84c"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.2}
      >
        {data.title.toUpperCase()}
      </Text>
      <Text
        position={[0, PEDESTAL_H - 0.09, -PEDESTAL_D / 2 - 0.003]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.058}
        color="#c9a84c"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.2}
      >
        {data.title.toUpperCase()}
      </Text>

      {/* Hover tagline — 3D text floating above the top cap */}
      {hovered && (
        <Text
          position={[0, PEDESTAL_H + GLASS_H + 0.35, 0]}
          fontSize={0.075}
          color="#e8c56a"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.006}
          outlineColor="#0a0807"
          maxWidth={2.5}
          textAlign="center"
        >
          {data.tagline}
        </Text>
      )}

      {/* Click card — floating DOM beside the vitrine (pushed toward the aisle) */}
      {selected && (
        <Html
          position={[cardDx, PEDESTAL_H + GLASS_H / 2, 0]}
          center
          zIndexRange={[50, 0]}
          style={{ pointerEvents: "auto", userSelect: "none" }}
        >
          <div
            style={{
              width: "220px",
              padding: "16px 18px",
              background: "linear-gradient(180deg, rgba(10,8,6,0.94), rgba(5,4,3,0.97))",
              border: "1px solid rgba(201,168,76,0.35)",
              borderRadius: "6px",
              fontFamily: "system-ui, -apple-system, sans-serif",
              boxShadow: "0 0 28px rgba(201,168,76,0.18), inset 0 0 18px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ fontSize: "10px", letterSpacing: "0.32em", textTransform: "uppercase", color: "#c9a84c", opacity: 0.75, marginBottom: "8px" }}>
              {data.title}
            </div>
            <div style={{ fontSize: "13px", color: "#e8d8a0", lineHeight: 1.45, marginBottom: "12px" }}>
              {data.tagline}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {data.chips.map((chip) => (
                <span
                  key={chip}
                  style={{
                    fontSize: "9.5px",
                    padding: "4px 8px",
                    borderRadius: "3px",
                    background: "rgba(201,168,76,0.08)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#e8c56a",
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </Html>
      )}

      {/* Invisible hitbox spanning the whole case — picks up hover + click */}
      <mesh
        position={[0, (PEDESTAL_H + GLASS_H + 0.04) / 2 + PEDESTAL_H / 2, 0]}
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
          setSelected((s) => !s);
        }}
        visible={false}
      >
        <boxGeometry args={[PEDESTAL_W + 0.12, PEDESTAL_H + GLASS_H + 0.12, PEDESTAL_D + 0.12]} />
      </mesh>
    </group>
  );
}

export default function TechVault() {
  const wallTex = useTexture("/images/gallery/wall.jpg");
  const floorTex = useTexture("/images/gallery/floor.jpg");
  const ceilingTex = useTexture("/images/gallery/ceiling.jpg");

  useMemo(() => {
    [wallTex, floorTex, ceilingTex].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
    });
    wallTex.repeat.set(2, 1);
    floorTex.repeat.set(3, 3);
    ceilingTex.repeat.set(2, 1);
  }, [wallTex, floorTex, ceilingTex]);

  // South wall is split by the doorway; compute segment widths
  const leftSegWidth = DOOR_X_MIN - ALCOVE_X_MIN;
  const rightSegWidth = ALCOVE_X_MAX - DOOR_X_MAX;
  const leftSegCenterX = (ALCOVE_X_MIN + DOOR_X_MIN) / 2;
  const rightSegCenterX = (DOOR_X_MAX + ALCOVE_X_MAX) / 2;

  return (
    <group>
      {/* ====== ALCOVE LIGHTING — matches gallery warmth + subtle tech accent ====== */}
      <ambientLight intensity={0.35} color="#fff3e0" />
      <pointLight
        position={[ALCOVE_CX, ALCOVE_HEIGHT - 0.3, ALCOVE_CZ]}
        intensity={4}
        distance={10}
        color="#ffd9a8"
      />
      {/* Subtle cool accent from the back wall — tech signal */}
      <pointLight
        position={[ALCOVE_CX, 1.4, ALCOVE_Z_MIN + 0.4]}
        intensity={1.8}
        distance={5}
        color="#a0c8ff"
      />

      {/* ====== ALCOVE SHELL ====== */}
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ALCOVE_CX, 0.001, ALCOVE_CZ]} receiveShadow>
        <planeGeometry args={[ALCOVE_W, ALCOVE_D]} />
        <meshStandardMaterial map={floorTex} color="#908478" metalness={0.4} roughness={0.55} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[ALCOVE_CX, ALCOVE_HEIGHT, ALCOVE_CZ]}>
        <planeGeometry args={[ALCOVE_W, ALCOVE_D]} />
        <meshStandardMaterial map={ceilingTex} color="#807468" />
      </mesh>

      {/* West wall (left looking in from gallery) */}
      <mesh position={[ALCOVE_X_MIN, ALCOVE_HEIGHT / 2, ALCOVE_CZ]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ALCOVE_D, ALCOVE_HEIGHT]} />
        <meshStandardMaterial map={wallTex} color="#a8a4a0" />
      </mesh>

      {/* East wall (right) */}
      <mesh position={[ALCOVE_X_MAX, ALCOVE_HEIGHT / 2, ALCOVE_CZ]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ALCOVE_D, ALCOVE_HEIGHT]} />
        <meshStandardMaterial map={wallTex} color="#a8a4a0" />
      </mesh>

      {/* Back wall (far side, ALCOVE_Z_MIN) — interior faces +z */}
      <mesh position={[ALCOVE_CX, ALCOVE_HEIGHT / 2, ALCOVE_Z_MIN]} receiveShadow>
        <planeGeometry args={[ALCOVE_W, ALCOVE_HEIGHT]} />
        <meshStandardMaterial map={wallTex} color="#a8a4a0" />
      </mesh>

      {/* Door-side wall (shared with gallery bottom wall, ALCOVE_Z_MAX) — interior faces -z, split by doorway */}
      <mesh position={[leftSegCenterX, ALCOVE_HEIGHT / 2, ALCOVE_Z_MAX]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[leftSegWidth, ALCOVE_HEIGHT]} />
        <meshStandardMaterial map={wallTex} color="#a8a4a0" />
      </mesh>
      <mesh position={[rightSegCenterX, ALCOVE_HEIGHT / 2, ALCOVE_Z_MAX]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[rightSegWidth, ALCOVE_HEIGHT]} />
        <meshStandardMaterial map={wallTex} color="#a8a4a0" />
      </mesh>

      {/* Doorway frame — subtle gold border around the entrance (at shared wall z=ALCOVE_Z_MAX) */}
      {/* Top lintel */}
      <mesh position={[(DOOR_X_MIN + DOOR_X_MAX) / 2, 2.6, ALCOVE_Z_MAX]}>
        <boxGeometry args={[DOOR_X_MAX - DOOR_X_MIN + 0.08, 0.06, 0.08]} />
        <meshStandardMaterial color="#8a6a2e" emissive="#c9a84c" emissiveIntensity={0.2} metalness={0.85} roughness={0.35} />
      </mesh>
      {/* Left jamb */}
      <mesh position={[DOOR_X_MIN, 1.3, ALCOVE_Z_MAX]}>
        <boxGeometry args={[0.04, 2.6, 0.08]} />
        <meshStandardMaterial color="#8a6a2e" emissive="#c9a84c" emissiveIntensity={0.2} metalness={0.85} roughness={0.35} />
      </mesh>
      {/* Right jamb */}
      <mesh position={[DOOR_X_MAX, 1.3, ALCOVE_Z_MAX]}>
        <boxGeometry args={[0.04, 2.6, 0.08]} />
        <meshStandardMaterial color="#8a6a2e" emissive="#c9a84c" emissiveIntensity={0.2} metalness={0.85} roughness={0.35} />
      </mesh>
      {/* TECH VAULT label above the door — facing into the gallery (+z direction) */}
      <Text
        position={[(DOOR_X_MIN + DOOR_X_MAX) / 2, 2.82, ALCOVE_Z_MAX + 0.01]}
        fontSize={0.11}
        color="#e8c56a"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.3}
      >
        TECH VAULT
      </Text>

      {/* ====== VITRINES ====== */}
      {CATEGORIES.map((cat) => (
        <Vitrine key={cat.id} data={cat} />
      ))}
    </group>
  );
}
