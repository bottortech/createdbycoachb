"use client";

import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

// =====================================================================
// FOUNDER'S STUDY — hidden developer workspace unlocked by scavenger hunt
// Theme: Midnight Coder (deep navy walls, warm wood desk, cool LED glow)
// Lives far east of the music room; only mounted while its portal is
// active. Camera enters at STUDY_ROOM_CAMERA.pos facing the back wall.
// =====================================================================

// Room bounds
const X_MIN = 50;
const X_MAX = 62;
const Z_MIN = -6;
const Z_MAX = 6;
const HEIGHT = 4.5;
const CX = (X_MIN + X_MAX) / 2;
const CZ = (Z_MIN + Z_MAX) / 2;
const WIDTH_Z = Z_MAX - Z_MIN;
const DEPTH_X = X_MAX - X_MIN;

export const STUDY_ROOM_CAMERA = {
  pos: [52, 1.7, 0] as [number, number, number],
  lookAt: [56, 1.7, 0] as [number, number, number],
};

// Pieces the study remote cycles through (left→right narrative order).
// Welcome is index 0 so the user lands on the message first after unlocking.
export const STUDY_PIECES: ReadonlyArray<{
  name: string;
  lookAt: [number, number, number];
}> = [
  { name: "Welcome",     lookAt: [61.95, 3.05, 0] },
  { name: "Workstation", lookAt: [58.2, 1.15, 0] },
  { name: "Whiteboard",  lookAt: [61.95, 1.5, -3.8] },
  { name: "Bookshelf",   lookAt: [61.9, 1.3, 3.9] },
  { name: "Hire Me",     lookAt: [61.95, 2.7, -3.8] },
];
export const STUDY_DEFAULT_PIECE_IDX = 0;

// Flat list of 21 book titles (matches the 3 × 7 layout of BOOKSHELF_BOOKS).
// Remote cycles through these when the user is browsing the Bookshelf piece.
export const STUDY_BOOK_TITLES: ReadonlyArray<string> = [
  // Shelf 1 — craft
  "Clean Code",
  "Pragmatic Programmer",
  "Refactoring",
  "Design Patterns",
  "Code Complete",
  "Domain-Driven Design",
  "The Mythical Man-Month",
  // Shelf 2 — modern web
  "Eloquent JavaScript",
  "You Don't Know JS",
  "JS: The Good Parts",
  "Don't Make Me Think",
  "Atomic Design",
  "Shape Up",
  "Refactoring UI",
  // Shelf 3 — founder / thinking
  "Zero to One",
  "The Lean Startup",
  "The Mom Test",
  "Rework",
  "Atomic Habits",
  "Deep Work",
  "Hooked",
];

// Palette — "Midnight Coder"
const WALL = "#1a2338";
const WALL_BACK = "#141c2e";
const FLOOR = "#2f231a";
const CEILING = "#0a0e18";
const DESK_WOOD = "#8b6f47";
const DESK_DARK = "#5a4029";
const DARK_METAL = "#14141a";
const SILVER = "#c9cad1";
const LED_CYAN = "#00d9ff";
const LED_PURPLE = "#a855f7";
const SCREEN_DARK = "#061018";
const CODE_CYAN = "#22d3ee";
const CODE_GREEN = "#4ade80";
const CODE_AMBER = "#fbbf24";
const CODE_PINK = "#f472b6";
const CODE_GREY = "#64748b";
const DUCK_YELLOW = "#fde047";
const DUCK_BEAK = "#f97316";
const ACCENT_GOLD = "#c9a84c";
const STANLEY_TEAL = "#2e5d60";
const PLANT_GREEN = "#3a7a4a";
const POT_TERRACOTTA = "#8b4a2f";
const WHITEBOARD_BG = "#ededed";
const SILVER_LAPTOP = "#8d9197";

// Procedural marble-like wood floor — warm dark grain.
function createFloorTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = FLOOR;
  ctx.fillRect(0, 0, size, size);
  // Wood planks
  for (let y = 0; y < size; y += 64) {
    ctx.fillStyle = `rgba(0,0,0,${0.18 + Math.random() * 0.1})`;
    ctx.fillRect(0, y, size, 1.5);
  }
  // Grain streaks
  for (let i = 0; i < 140; i++) {
    ctx.strokeStyle = `rgba(90, 64, 41, ${0.2 + Math.random() * 0.3})`;
    ctx.lineWidth = 0.4 + Math.random() * 1.2;
    ctx.beginPath();
    let x = Math.random() * size;
    let y = Math.random() * size;
    ctx.moveTo(x, y);
    for (let j = 0; j < 24; j++) {
      x += (Math.random() - 0.5) * 22;
      y += (Math.random() - 0.5) * 5;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // Subtle speckle
  for (let i = 0; i < 2200; i++) {
    ctx.fillStyle = `rgba(40, 28, 18, ${Math.random() * 0.18})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Canvas-generated whiteboard art (file-tree sketch + boxes-and-arrows).
function createWhiteboardTexture(): THREE.CanvasTexture {
  const w = 1024;
  const h = 640;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = WHITEBOARD_BG;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#2e3546";
  ctx.lineWidth = 3;
  ctx.font = "bold 22px system-ui, sans-serif";
  ctx.fillStyle = "#2e3546";

  // Architecture sketch — three rounded boxes with arrows between
  const boxes = [
    { x: 90, y: 220, w: 220, h: 90, label: "client" },
    { x: 410, y: 220, w: 220, h: 90, label: "api" },
    { x: 730, y: 220, w: 220, h: 90, label: "db" },
  ];
  for (const b of boxes) {
    ctx.strokeRect(b.x, b.y, b.w, b.h);
    ctx.fillText(b.label, b.x + 18, b.y + 55);
  }
  // Arrows
  ctx.beginPath();
  ctx.moveTo(310, 265); ctx.lineTo(400, 265);
  ctx.moveTo(630, 265); ctx.lineTo(720, 265);
  // Arrow heads
  for (const x of [400, 720]) {
    ctx.moveTo(x, 265); ctx.lineTo(x - 12, 258);
    ctx.moveTo(x, 265); ctx.lineTo(x - 12, 272);
  }
  ctx.stroke();

  // Title
  ctx.font = "bold 30px system-ui, sans-serif";
  ctx.fillText("system sketch", 90, 140);

  // A few scribbled bullets underneath
  ctx.font = "22px system-ui, sans-serif";
  const bullets = [
    "• cache reads, invalidate on write",
    "• retry w/ jitter → max 3",
    "• migrate then flip feature flag",
  ];
  bullets.forEach((t, i) => {
    ctx.fillText(t, 100, 420 + i * 34);
  });

  // Small "coach b" signature bottom-right
  ctx.font = "italic 20px system-ui, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("— coach b", w - 160, h - 30);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function Desk({ x, y = 0, z, width = 2.4, depth = 0.9 }: {
  x: number; y?: number; z: number; width?: number; depth?: number;
}) {
  const TOP_THICK = 0.04;
  const LEG_H = 0.74;
  return (
    <group position={[x, y, z]}>
      {/* Desktop */}
      <mesh position={[0, LEG_H + TOP_THICK / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[depth, TOP_THICK, width]} />
        <meshStandardMaterial color={DESK_WOOD} roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Front trim */}
      <mesh position={[-depth / 2 + 0.005, LEG_H + TOP_THICK / 2, 0]}>
        <boxGeometry args={[0.01, TOP_THICK + 0.002, width + 0.002]} />
        <meshStandardMaterial color={DESK_DARK} roughness={0.55} />
      </mesh>
      {/* Legs */}
      {[
        [-depth / 2 + 0.06, -width / 2 + 0.06],
        [-depth / 2 + 0.06, width / 2 - 0.06],
        [depth / 2 - 0.06, -width / 2 + 0.06],
        [depth / 2 - 0.06, width / 2 - 0.06],
      ].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, LEG_H / 2, lz]} castShadow>
          <boxGeometry args={[0.06, LEG_H, 0.06]} />
          <meshStandardMaterial color={DESK_DARK} roughness={0.6} />
        </mesh>
      ))}
      {/* Under-desk LED glow (cyan strip) */}
      <mesh position={[0, LEG_H - 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[depth * 0.7, width * 0.95]} />
        <meshBasicMaterial color={LED_CYAN} transparent opacity={0.07} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Monitor({
  x, y, z, rotY = 0, w = 0.8, h = 0.48, codeLines = 5, codeColor = CODE_CYAN,
}: {
  x: number; y: number; z: number; rotY?: number; w?: number; h?: number; codeLines?: number; codeColor?: string;
}) {
  return (
    <group position={[x, y, z]} rotation={[0, rotY, 0]}>
      {/* Stand base — disc on desk */}
      <mesh position={[0, -h / 2 - 0.3, 0.04]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.02, 24]} />
        <meshStandardMaterial color={DARK_METAL} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Stand neck */}
      <mesh position={[0, -h / 2 - 0.15, 0.04]}>
        <boxGeometry args={[0.03, 0.3, 0.06]} />
        <meshStandardMaterial color={DARK_METAL} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Monitor body */}
      <mesh castShadow>
        <boxGeometry args={[w, h, 0.035]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.5} />
      </mesh>
      {/* Bezel */}
      <mesh position={[0, 0, 0.019]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#050505" roughness={0.25} />
      </mesh>
      {/* Screen background */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[w - 0.045, h - 0.04]} />
        <meshBasicMaterial color={SCREEN_DARK} toneMapped={false} />
      </mesh>
      {/* Simulated code lines */}
      {Array.from({ length: codeLines }).map((_, i) => {
        const rowH = (h - 0.06) / codeLines;
        const rowY = (h - 0.06) / 2 - rowH * (i + 0.5);
        const rowW = (w - 0.08) * (0.25 + ((i * 37) % 100) / 100 * 0.6);
        const palette = [codeColor, CODE_GREEN, CODE_AMBER, CODE_PINK, CODE_GREY];
        const color = palette[i % palette.length];
        return (
          <mesh
            key={i}
            position={[-(w - 0.08) / 2 + rowW / 2, rowY, 0.021]}
          >
            <planeGeometry args={[rowW, Math.min(0.018, rowH * 0.5)]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

function Laptop({ x, y, z, rotY = 0 }: { x: number; y: number; z: number; rotY?: number }) {
  const baseW = 0.42;
  const baseD = 0.30;
  const baseH = 0.016;
  return (
    <group position={[x, y, z]} rotation={[0, rotY, 0]}>
      {/* Base */}
      <mesh castShadow>
        <boxGeometry args={[baseD, baseH, baseW]} />
        <meshStandardMaterial color={SILVER_LAPTOP} metalness={0.55} roughness={0.35} />
      </mesh>
      {/* Keyboard deck inset (darker rectangle) */}
      <mesh position={[0.01, baseH / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[baseD * 0.85, baseW * 0.85]} />
        <meshStandardMaterial color="#181a1e" roughness={0.45} />
      </mesh>
      {/* Screen — tilted up from back of base */}
      <group position={[-baseD / 2 + 0.01, 0, 0]} rotation={[0, 0, -Math.PI / 2.2]}>
        <mesh position={[0.14, 0, 0]} castShadow>
          <boxGeometry args={[0.012, 0.28, baseW]} />
          <meshStandardMaterial color={SILVER_LAPTOP} metalness={0.6} roughness={0.35} />
        </mesh>
        {/* Screen face */}
        <mesh position={[0.141, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[baseW - 0.02, 0.26]} />
          <meshBasicMaterial color={SCREEN_DARK} toneMapped={false} />
        </mesh>
        {/* Simulated terminal content */}
        {[0.08, 0.04, 0, -0.04, -0.08].map((dy, i) => (
          <mesh
            key={i}
            position={[0.142, dy, -(baseW - 0.08) / 2 + 0.04 + (i % 3) * 0.05]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <planeGeometry args={[(baseW - 0.08) * (0.3 + (i % 3) * 0.2), 0.012]} />
            <meshBasicMaterial color={i % 2 === 0 ? CODE_GREEN : CODE_CYAN} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function MacMini({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh castShadow>
        <boxGeometry args={[0.2, 0.04, 0.2]} />
        <meshStandardMaterial color="#1c1c1f" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Power LED */}
      <mesh position={[-0.09, -0.018, 0.095]}>
        <sphereGeometry args={[0.004, 8, 8]} />
        <meshBasicMaterial color={CODE_AMBER} toneMapped={false} />
      </mesh>
    </group>
  );
}

function IPad({ x, y, z, rotY = 0 }: { x: number; y: number; z: number; rotY?: number }) {
  return (
    <group position={[x, y, z]} rotation={[0, rotY, -Math.PI / 10]}>
      {/* Stand */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <boxGeometry args={[0.07, 0.05, 0.14]} />
        <meshStandardMaterial color={DARK_METAL} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* iPad body */}
      <mesh castShadow>
        <boxGeometry args={[0.016, 0.2, 0.14]} />
        <meshStandardMaterial color="#d6d8dc" metalness={0.55} roughness={0.3} />
      </mesh>
      {/* Screen */}
      <mesh position={[0.01, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.13, 0.19]} />
        <meshBasicMaterial color={SCREEN_DARK} toneMapped={false} />
      </mesh>
      {/* Sketch-style lines */}
      {[0.06, 0.02, -0.02, -0.06].map((dy, i) => (
        <mesh key={i} position={[0.011, dy, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.1, 0.005]} />
          <meshBasicMaterial color={i % 2 === 0 ? CODE_CYAN : CODE_PINK} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Keyboard({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh castShadow>
        <boxGeometry args={[0.13, 0.02, 0.38]} />
        <meshStandardMaterial color="#111" metalness={0.4} roughness={0.45} />
      </mesh>
      {/* Keys — 3 rows of dots */}
      {[-0.016, 0, 0.016].map((dz) =>
        Array.from({ length: 14 }).map((_, i) => (
          <mesh
            key={`${dz}-${i}`}
            position={[0.007, 0.012, -0.18 + (i + 0.5) * (0.36 / 14) + dz * 0.01]}
          >
            <boxGeometry args={[0.02, 0.004, 0.02]} />
            <meshStandardMaterial color="#1a1a1e" metalness={0.3} roughness={0.5} />
          </mesh>
        ))
      )}
      {/* RGB underglow */}
      <mesh position={[0, -0.009, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.11, 0.36]} />
        <meshBasicMaterial color={LED_PURPLE} transparent opacity={0.4} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Mouse({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh castShadow>
        <boxGeometry args={[0.07, 0.022, 0.11]} />
        <meshStandardMaterial color="#15151a" metalness={0.3} roughness={0.5} />
      </mesh>
    </group>
  );
}

function StanleyCup({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      {/* Tapered body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.035, 0.045, 0.22, 24]} />
        <meshStandardMaterial color={STANLEY_TEAL} metalness={0.55} roughness={0.4} />
      </mesh>
      {/* Lid */}
      <mesh position={[0, 0.115, 0]}>
        <cylinderGeometry args={[0.037, 0.037, 0.015, 24]} />
        <meshStandardMaterial color="#111" roughness={0.5} />
      </mesh>
      {/* Straw */}
      <mesh position={[0.015, 0.16, 0]} rotation={[0, 0, -0.1]}>
        <cylinderGeometry args={[0.004, 0.004, 0.08, 8]} />
        <meshStandardMaterial color="#e6e6ea" roughness={0.3} />
      </mesh>
      {/* Handle */}
      <mesh position={[-0.055, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.035, 0.008, 10, 20, Math.PI]} />
        <meshStandardMaterial color={STANLEY_TEAL} metalness={0.55} roughness={0.4} />
      </mesh>
      {/* Tiny logo badge */}
      <mesh position={[0, 0.04, 0.044]}>
        <planeGeometry args={[0.05, 0.012]} />
        <meshStandardMaterial color={ACCENT_GOLD} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function RubberDuck({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      {/* Body */}
      <mesh castShadow>
        <sphereGeometry args={[0.042, 16, 12]} />
        <meshStandardMaterial color={DUCK_YELLOW} roughness={0.55} />
      </mesh>
      {/* Head */}
      <mesh position={[0.025, 0.04, 0]}>
        <sphereGeometry args={[0.028, 16, 12]} />
        <meshStandardMaterial color={DUCK_YELLOW} roughness={0.55} />
      </mesh>
      {/* Beak */}
      <mesh position={[0.055, 0.036, 0]} rotation={[0, 0, -Math.PI / 10]}>
        <coneGeometry args={[0.012, 0.025, 8]} />
        <meshStandardMaterial color={DUCK_BEAK} roughness={0.5} />
      </mesh>
      {/* Eye */}
      <mesh position={[0.044, 0.052, 0.018]}>
        <sphereGeometry args={[0.004, 8, 8]} />
        <meshBasicMaterial color="#000" />
      </mesh>
    </group>
  );
}

function Plant({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      {/* Pot */}
      <mesh castShadow>
        <cylinderGeometry args={[0.07, 0.05, 0.1, 18]} />
        <meshStandardMaterial color={POT_TERRACOTTA} roughness={0.75} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.048, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.005, 18]} />
        <meshStandardMaterial color="#2a1a0f" roughness={1} />
      </mesh>
      {/* Leaves — a handful of cones radiating out */}
      {Array.from({ length: 6 }).map((_, i) => {
        const theta = (i / 6) * Math.PI * 2;
        const tilt = Math.PI / 2.8;
        return (
          <mesh
            key={i}
            position={[Math.cos(theta) * 0.03, 0.11 + (i % 2) * 0.03, Math.sin(theta) * 0.03]}
            rotation={[tilt * Math.sin(theta), theta, tilt * Math.cos(theta)]}
          >
            <coneGeometry args={[0.025, 0.12, 4]} />
            <meshStandardMaterial color={PLANT_GREEN} roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

function DeskLamp({ x, y, z, lit = true }: { x: number; y: number; z: number; lit?: boolean }) {
  return (
    <group position={[x, y, z]}>
      {/* Base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.018, 20]} />
        <meshStandardMaterial color={DARK_METAL} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Lower arm */}
      <group position={[0, 0.14, 0]} rotation={[0, 0, -Math.PI / 8]}>
        <mesh>
          <cylinderGeometry args={[0.008, 0.008, 0.28, 10]} />
          <meshStandardMaterial color={DARK_METAL} metalness={0.55} roughness={0.4} />
        </mesh>
      </group>
      {/* Upper arm */}
      <group position={[-0.105, 0.26, 0]} rotation={[0, 0, Math.PI / 2.6]}>
        <mesh>
          <cylinderGeometry args={[0.008, 0.008, 0.22, 10]} />
          <meshStandardMaterial color={DARK_METAL} metalness={0.55} roughness={0.4} />
        </mesh>
      </group>
      {/* Shade */}
      <group position={[-0.21, 0.24, 0]} rotation={[0, 0, -Math.PI / 3]}>
        <mesh>
          <coneGeometry args={[0.09, 0.12, 18, 1, true]} />
          <meshStandardMaterial color={DARK_METAL} metalness={0.5} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
        {/* Bulb glow */}
        <mesh position={[0, -0.04, 0]}>
          <sphereGeometry args={[0.04, 16, 12]} />
          <meshBasicMaterial color={lit ? "#ffd280" : "#2a2015"} toneMapped={false} />
        </mesh>
      </group>
      {/* Warm point light under the shade — off when lamp unlit. */}
      <pointLight
        position={[-0.21, 0.2, 0]}
        color="#ffcf88"
        intensity={lit ? 3.5 : 0}
        distance={3}
        decay={1.8}
      />
    </group>
  );
}

function Headphones({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      {/* Stand */}
      <mesh position={[0, -0.06, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.02, 18]} />
        <meshStandardMaterial color={DARK_METAL} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.14, 10]} />
        <meshStandardMaterial color={DARK_METAL} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Band (top arc) */}
      <mesh position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.065, 0.012, 10, 16, Math.PI]} />
        <meshStandardMaterial color="#141418" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Cups */}
      {[-0.065, 0.065].map((xx, i) => (
        <mesh key={i} position={[xx, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.035, 20]} />
          <meshStandardMaterial color="#1d1d22" metalness={0.4} roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function StickyNote({ x, y, z, rotY = 0, color = "#fde68a" }: {
  x: number; y: number; z: number; rotY?: number; color?: string;
}) {
  return (
    <group position={[x, y, z]} rotation={[0, rotY, 0]}>
      <mesh>
        <planeGeometry args={[0.06, 0.06]} />
        <meshStandardMaterial color={color} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* Two scribble lines */}
      <mesh position={[0, 0.01, 0.0005]}>
        <planeGeometry args={[0.045, 0.003]} />
        <meshBasicMaterial color="#4a3218" toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.008, 0.0005]}>
        <planeGeometry args={[0.035, 0.003]} />
        <meshBasicMaterial color="#4a3218" toneMapped={false} />
      </mesh>
    </group>
  );
}

interface BookDef {
  color: string;
  height: number;
  thickness: number;
}
const BOOKSHELF_BOOKS: BookDef[][] = [
  // 4 shelves of books, varied heights + colors
  [
    { color: "#3b5998", height: 0.28, thickness: 0.05 },
    { color: "#8b4a2f", height: 0.26, thickness: 0.045 },
    { color: "#1a4a38", height: 0.3, thickness: 0.052 },
    { color: "#c9a84c", height: 0.27, thickness: 0.048 },
    { color: "#5a2e4a", height: 0.29, thickness: 0.05 },
    { color: "#2a3a4c", height: 0.26, thickness: 0.045 },
    { color: "#6b4a28", height: 0.28, thickness: 0.05 },
  ],
  [
    { color: "#4a2d3a", height: 0.27, thickness: 0.048 },
    { color: "#c9a84c", height: 0.3, thickness: 0.055 },
    { color: "#233428", height: 0.26, thickness: 0.045 },
    { color: "#2a3a4c", height: 0.28, thickness: 0.05 },
    { color: "#6b4a28", height: 0.3, thickness: 0.053 },
    { color: "#8b4a2f", height: 0.25, thickness: 0.04 },
    { color: "#1a4a38", height: 0.29, thickness: 0.05 },
  ],
  [
    { color: "#2a3a4c", height: 0.28, thickness: 0.048 },
    { color: "#5a2e4a", height: 0.26, thickness: 0.045 },
    { color: "#c9a84c", height: 0.29, thickness: 0.05 },
    { color: "#1a4a38", height: 0.27, thickness: 0.047 },
    { color: "#3b5998", height: 0.3, thickness: 0.052 },
    { color: "#4a2d3a", height: 0.26, thickness: 0.045 },
    { color: "#6b4a28", height: 0.28, thickness: 0.05 },
  ],
];

function Bookshelf({ x, y, z, rotY = 0, highlightIdx = -1 }: {
  x: number; y: number; z: number; rotY?: number;
  /** Flat book index (0..20) to emit a subtle gold glow around. -1 = none. */
  highlightIdx?: number;
}) {
  const SHELF_W = 1.6;  // horizontal (local x)
  const SHELF_D = 0.28; // depth into wall (local z, negative = into wall)
  const SHELF_SPACING = 0.36;
  const SHELVES = BOOKSHELF_BOOKS.length;
  const TOTAL_H = SHELVES * SHELF_SPACING + 0.1;
  return (
    <group position={[x, y, z]} rotation={[0, rotY, 0]}>
      {/* Back panel (against wall, at -z) */}
      <mesh position={[0, 0, -SHELF_D / 2 + 0.01]} castShadow receiveShadow>
        <boxGeometry args={[SHELF_W, TOTAL_H, 0.02]} />
        <meshStandardMaterial color="#2a1f14" roughness={0.7} />
      </mesh>
      {/* Top + bottom caps */}
      {[TOTAL_H / 2 - 0.01, -TOTAL_H / 2 + 0.01].map((yy, i) => (
        <mesh key={`cap-${i}`} position={[0, yy, 0]} castShadow>
          <boxGeometry args={[SHELF_W, 0.02, SHELF_D]} />
          <meshStandardMaterial color="#2a1f14" roughness={0.7} />
        </mesh>
      ))}
      {/* Side panels */}
      {[-SHELF_W / 2 + 0.01, SHELF_W / 2 - 0.01].map((xx, i) => (
        <mesh key={`side-${i}`} position={[xx, 0, 0]}>
          <boxGeometry args={[0.02, TOTAL_H, SHELF_D]} />
          <meshStandardMaterial color="#2a1f14" roughness={0.7} />
        </mesh>
      ))}
      {/* Horizontal shelf boards */}
      {Array.from({ length: SHELVES - 1 }).map((_, i) => {
        const yy = -TOTAL_H / 2 + (i + 1) * SHELF_SPACING + 0.05;
        return (
          <mesh key={i} position={[0, yy, 0]}>
            <boxGeometry args={[SHELF_W - 0.04, 0.015, SHELF_D - 0.03]} />
            <meshStandardMaterial color="#3b2d1f" roughness={0.65} />
          </mesh>
        );
      })}
      {/* Books — spines facing +z (outward to viewer after rotation). A
          currently-highlighted book (driven from the remote) gets a soft
          gold glow so the user can see which one the title label refers to. */}
      {(() => {
        let flat = 0;
        return BOOKSHELF_BOOKS.map((shelf, rowIdx) => {
          const yRow = -TOTAL_H / 2 + rowIdx * SHELF_SPACING + 0.08;
          let cursor = -SHELF_W / 2 + 0.04;
          return shelf.map((book, bi) => {
            const flatIdx = flat;
            flat += 1;
            const isHighlighted = flatIdx === highlightIdx;
            const mesh = (
              <group key={`${rowIdx}-${bi}`}>
                <mesh
                  position={[cursor + book.thickness / 2, yRow + book.height / 2, 0.04]}
                  castShadow
                >
                  <boxGeometry args={[book.thickness, book.height, 0.18]} />
                  <meshStandardMaterial
                    color={book.color}
                    emissive={isHighlighted ? "#c9a84c" : "#000000"}
                    emissiveIntensity={isHighlighted ? 0.45 : 0}
                    roughness={0.6}
                  />
                </mesh>
                {isHighlighted && (
                  <mesh position={[cursor + book.thickness / 2, yRow + book.height / 2, 0.135]}>
                    <planeGeometry args={[book.thickness + 0.04, book.height + 0.04]} />
                    <meshBasicMaterial
                      color="#c9a84c"
                      transparent
                      opacity={0.25}
                      toneMapped={false}
                      depthWrite={false}
                    />
                  </mesh>
                )}
              </group>
            );
            cursor += book.thickness + 0.003;
            return mesh;
          });
        });
      })()}
    </group>
  );
}

function Chair({ x, y = 0, z, rotY = 0 }: { x: number; y?: number; z: number; rotY?: number }) {
  const seatH = 0.48;
  return (
    <group position={[x, y, z]} rotation={[0, rotY, 0]}>
      {/* Seat */}
      <mesh position={[0, seatH, 0]} castShadow>
        <boxGeometry args={[0.52, 0.08, 0.52]} />
        <meshStandardMaterial color="#2a2a32" roughness={0.7} />
      </mesh>
      {/* Backrest */}
      <mesh position={[-0.22, seatH + 0.32, 0]} rotation={[0, 0, -0.1]} castShadow>
        <boxGeometry args={[0.06, 0.6, 0.48]} />
        <meshStandardMaterial color="#2a2a32" roughness={0.7} />
      </mesh>
      {/* Cylinder post */}
      <mesh position={[0, seatH / 2, 0]}>
        <cylinderGeometry args={[0.025, 0.025, seatH - 0.08, 12]} />
        <meshStandardMaterial color={DARK_METAL} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* 5-star base */}
      {Array.from({ length: 5 }).map((_, i) => {
        const theta = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(theta) * 0.18, 0.04, Math.sin(theta) * 0.18]}
            rotation={[0, -theta, 0]}
          >
            <boxGeometry args={[0.32, 0.03, 0.04]} />
            <meshStandardMaterial color={DARK_METAL} metalness={0.55} roughness={0.45} />
          </mesh>
        );
      })}
      {/* Caster wheels */}
      {Array.from({ length: 5 }).map((_, i) => {
        const theta = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={`w-${i}`}
            position={[Math.cos(theta) * 0.32, 0.02, Math.sin(theta) * 0.32]}
          >
            <sphereGeometry args={[0.022, 10, 8]} />
            <meshStandardMaterial color={DARK_METAL} metalness={0.4} roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

function Whiteboard({ x, y, z, rotY = 0 }: { x: number; y: number; z: number; rotY?: number }) {
  const tex = useMemo(() => createWhiteboardTexture(), []);
  return (
    <group position={[x, y, z]} rotation={[0, rotY, 0]}>
      {/* Frame (behind board) */}
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[1.9, 1.3, 0.06]} />
        <meshStandardMaterial color="#6b7280" metalness={0.4} roughness={0.45} />
      </mesh>
      {/* Board face (front, facing +z local) */}
      <mesh position={[0, 0, 0.003]}>
        <planeGeometry args={[1.82, 1.22]} />
        <meshStandardMaterial map={tex} roughness={0.45} />
      </mesh>
      {/* Marker tray */}
      <mesh position={[0, -0.68, 0.02]}>
        <boxGeometry args={[1.85, 0.02, 0.04]} />
        <meshStandardMaterial color="#6b7280" metalness={0.4} roughness={0.45} />
      </mesh>
    </group>
  );
}

function WallPlaque({
  x, y, z, rotY = 0, title, body, signature, width = 2.2, height = 1.4,
}: {
  x: number; y: number; z: number; rotY?: number;
  title: string; body: string; signature?: string;
  width?: number; height?: number;
}) {
  return (
    <group position={[x, y, z]} rotation={[0, rotY, 0]}>
      {/* Dark backing box (thin, behind) */}
      <mesh position={[0, 0, -0.015]} castShadow>
        <boxGeometry args={[width + 0.04, height + 0.04, 0.02]} />
        <meshStandardMaterial color="#0a0e18" roughness={0.6} />
      </mesh>
      {/* Gilt border plate (front) */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={ACCENT_GOLD}
          emissive={ACCENT_GOLD}
          emissiveIntensity={0.12}
          metalness={0.82}
          roughness={0.28}
        />
      </mesh>
      {/* Inner dark board */}
      <mesh position={[0, 0, 0.003]}>
        <planeGeometry args={[width - 0.12, height - 0.12]} />
        <meshStandardMaterial color="#0d1120" roughness={0.4} />
      </mesh>
      {/* Title */}
      <Text
        position={[0, height / 2 - 0.18, 0.005]}
        fontSize={0.07}
        color={ACCENT_GOLD}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.25}
      >
        {title}
      </Text>
      {/* Body */}
      <Text
        position={[0, 0.02, 0.005]}
        fontSize={0.052}
        color="#e8e8ee"
        anchorX="center"
        anchorY="middle"
        maxWidth={width - 0.22}
        textAlign="center"
        lineHeight={1.35}
      >
        {body}
      </Text>
      {/* Signature */}
      {signature && (
        <Text
          position={[0, -height / 2 + 0.14, 0.005]}
          fontSize={0.045}
          color="#8892aa"
          anchorX="center"
          anchorY="middle"
        >
          {signature}
        </Text>
      )}
    </group>
  );
}

function HireMeSign({
  x, y, z, rotY = 0,
  onClick,
}: { x: number; y: number; z: number; rotY?: number; onClick?: () => void }) {
  const W = 1.2;
  const H = 0.42;
  return (
    <group
      position={[x, y, z]}
      rotation={[0, rotY, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Backing plate (behind) */}
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[W + 0.04, H + 0.04, 0.02]} />
        <meshStandardMaterial color="#0a0e18" roughness={0.5} />
      </mesh>
      {/* Gold face (front) */}
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial
          color={ACCENT_GOLD}
          emissive={ACCENT_GOLD}
          emissiveIntensity={0.35}
          metalness={0.85}
          roughness={0.3}
        />
      </mesh>
      <Text
        position={[0, 0.03, 0.005]}
        fontSize={0.1}
        color="#0a0806"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.3}
      >
        HIRE ME
      </Text>
      <Text
        position={[0, -0.12, 0.005]}
        fontSize={0.028}
        color="#3a2e0f"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.22}
      >
        TAP TO START A PROJECT
      </Text>
    </group>
  );
}

function LEDStrip({ x, y, z, length, axis = "z", color = LED_CYAN, intensity = 0.6 }: {
  x: number; y: number; z: number; length: number;
  axis?: "x" | "y" | "z"; color?: string; intensity?: number;
}) {
  const size: [number, number, number] =
    axis === "x" ? [length, 0.02, 0.02]
    : axis === "y" ? [0.02, length, 0.02]
    : [0.02, 0.02, length];
  return (
    <group position={[x, y, z]}>
      <mesh>
        <boxGeometry args={size} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={intensity} />
      </mesh>
    </group>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

interface Props {
  /** Fires when the user clicks the HIRE ME sign on the study wall. */
  onHireMe?: () => void;
  /** Index into STUDY_BOOK_TITLES of the currently-highlighted book on the
   *  shelf. -1 = no highlight. Driven by the in-scene study remote. */
  highlightedBookIdx?: number;
}

export default function FoundersStudy({ onHireMe, highlightedBookIdx = -1 }: Props) {
  const floorTex = useMemo(() => createFloorTexture(), []);

  useMemo(() => {
    floorTex.repeat.set(3, 2);
  }, [floorTex]);

  // Desk center position (back of room, facing user).
  const deskX = 58.2;
  const deskZ = 0;
  const deskTopY = 0.74 + 0.04; // leg + half-top

  return (
    <group>
      {/* ---------- LIGHTING ---------- */}
      <ambientLight intensity={0.3} color="#b6c0d9" />
      <hemisphereLight intensity={0.35} color="#3c5079" groundColor="#2a1a0e" />
      {/* Key light from lamp handled inside DeskLamp */}
      {/* Cool bloom behind monitors */}
      <pointLight position={[deskX + 0.3, 1.4, deskZ]} color={LED_PURPLE} intensity={1.8} distance={6} decay={1.8} />
      <pointLight position={[deskX + 0.3, 1.4, deskZ - 0.8]} color={LED_CYAN} intensity={1.2} distance={5} decay={1.8} />
      {/* Warm bookshelf accent */}
      <pointLight position={[CX, 2.2, Z_MAX - 1]} color="#ffcf88" intensity={2} distance={6} decay={2} />

      {/* ---------- ROOM SHELL ---------- */}
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CX, 0.001, CZ]} receiveShadow>
        <planeGeometry args={[DEPTH_X, WIDTH_Z]} />
        <meshStandardMaterial map={floorTex} color={FLOOR} roughness={0.75} metalness={0.05} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[CX, HEIGHT, CZ]}>
        <planeGeometry args={[DEPTH_X, WIDTH_Z]} />
        <meshStandardMaterial color={CEILING} roughness={0.85} />
      </mesh>
      {/* West wall (entry side) */}
      <mesh position={[X_MIN, HEIGHT / 2, CZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[WIDTH_Z, HEIGHT]} />
        <meshStandardMaterial color={WALL} roughness={0.7} />
      </mesh>
      {/* East / back wall */}
      <mesh position={[X_MAX, HEIGHT / 2, CZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[WIDTH_Z, HEIGHT]} />
        <meshStandardMaterial color={WALL_BACK} roughness={0.7} />
      </mesh>
      {/* South wall (left-from-entry view) */}
      <mesh position={[CX, HEIGHT / 2, Z_MIN]}>
        <planeGeometry args={[DEPTH_X, HEIGHT]} />
        <meshStandardMaterial color={WALL} roughness={0.7} />
      </mesh>
      {/* North wall (right-from-entry view) */}
      <mesh position={[CX, HEIGHT / 2, Z_MAX]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[DEPTH_X, HEIGHT]} />
        <meshStandardMaterial color={WALL} roughness={0.7} />
      </mesh>

      {/* ---------- LED ACCENT STRIPS ---------- */}
      {/* Along the top of the back wall */}
      <LEDStrip x={X_MAX - 0.02} y={HEIGHT - 0.08} z={CZ} length={WIDTH_Z * 0.85} axis="z" color={LED_CYAN} intensity={0.75} />
      {/* Under the back wall bookshelf line */}
      <LEDStrip x={X_MAX - 0.02} y={0.08} z={CZ} length={WIDTH_Z * 0.85} axis="z" color={LED_PURPLE} intensity={0.55} />

      {/* ---------- DESK + WORKSTATION ---------- */}
      <Desk x={deskX} z={deskZ} />

      {/* 2 external monitors (facing -x toward user) */}
      <Monitor x={deskX + 0.05} y={deskTopY + 0.3} z={deskZ - 0.3} rotY={-Math.PI / 2} w={0.82} h={0.48} codeColor={CODE_CYAN} codeLines={6} />
      <Monitor x={deskX + 0.05} y={deskTopY + 0.3} z={deskZ + 0.45} rotY={-Math.PI / 2} w={0.74} h={0.44} codeColor={CODE_GREEN} codeLines={5} />

      {/* Laptop — open, on the right side of the desk */}
      <Laptop x={deskX - 0.08} y={deskTopY + 0.015} z={deskZ + 1.0} rotY={-Math.PI / 2} />

      {/* Mac mini on the desk behind the main keyboard */}
      <MacMini x={deskX + 0.1} y={deskTopY + 0.025} z={deskZ - 0.95} />

      {/* iPad propped on a stand — left side, tilted toward viewer */}
      <IPad x={deskX - 0.15} y={deskTopY + 0.12} z={deskZ - 0.95} rotY={-Math.PI / 2} />

      {/* Keyboard + mouse in front of main monitors */}
      <Keyboard x={deskX - 0.12} y={deskTopY + 0.012} z={deskZ - 0.3} />
      <Mouse x={deskX - 0.12} y={deskTopY + 0.013} z={deskZ + 0.05} />

      {/* Stanley cup — right-front of desk */}
      <StanleyCup x={deskX - 0.15} y={deskTopY + 0.11} z={deskZ + 0.7} />

      {/* Rubber duck — on the desk between keyboard and right monitor */}
      <RubberDuck x={deskX - 0.05} y={deskTopY + 0.04} z={deskZ + 0.15} />

      {/* Plant — far-left of desk */}
      <Plant x={deskX - 0.05} y={deskTopY + 0.05} z={deskZ - 1.1} />

      {/* Desk lamp — back-left corner of desk, angled at the workspace */}
      <DeskLamp x={deskX + 0.18} y={deskTopY + 0.01} z={deskZ - 1.05} />

      {/* Headphones on stand — between laptop and main monitor */}
      <Headphones x={deskX - 0.0} y={deskTopY + 0.065} z={deskZ + 0.82} />

      {/* Sticky notes on side of the main monitor */}
      <StickyNote x={deskX - 0.02} y={deskTopY + 0.5} z={deskZ - 0.73} rotY={-Math.PI / 2} color="#fde68a" />
      <StickyNote x={deskX - 0.02} y={deskTopY + 0.44} z={deskZ - 0.73} rotY={-Math.PI / 2} color="#fca5a5" />

      {/* ---------- CHAIR ---------- */}
      <Chair x={56.7} z={deskZ} rotY={Math.PI / 2} />

      {/* ---------- BOOKSHELF (back wall, right side flanking desk) ---------- */}
      <Bookshelf x={X_MAX - 0.16} y={0.95} z={3.9} rotY={-Math.PI / 2} highlightIdx={highlightedBookIdx} />

      {/* ---------- WHITEBOARD (back wall, left side flanking desk) ---------- */}
      <Whiteboard x={X_MAX - 0.05} y={1.5} z={-3.8} rotY={-Math.PI / 2} />

      {/* ---------- WALL MESSAGE PLAQUE (back wall, above desk) ---------- */}
      <WallPlaque
        x={X_MAX - 0.04}
        y={3.05}
        z={0}
        rotY={-Math.PI / 2}
        title="FOUNDER'S STUDY"
        body={"You took the time to look closely — thank you.\nWhat you see across this gallery started as an\nidea, a sketch, a late night. I build to help\npeople create the things they imagine."}
        signature="— Coach B"
        width={2.6}
        height={1.25}
      />

      {/* ---------- HIRE ME CTA (back wall, below whiteboard) ---------- */}
      <HireMeSign x={X_MAX - 0.04} y={2.7} z={-3.8} rotY={-Math.PI / 2} onClick={onHireMe} />

      {/* ---------- ACCENT LIGHT over the back wall so signage reads ---------- */}
      <pointLight position={[X_MAX - 1.5, HEIGHT - 0.4, 0]} color="#ffd9a1" intensity={2.5} distance={8} decay={1.8} />
      <pointLight position={[X_MAX - 1.5, HEIGHT - 0.4, -3.8]} color="#ffd9a1" intensity={1.8} distance={6} decay={1.8} />
      <pointLight position={[X_MAX - 1.5, HEIGHT - 0.4, 3.8]} color="#ffd9a1" intensity={1.8} distance={6} decay={1.8} />
    </group>
  );
}
