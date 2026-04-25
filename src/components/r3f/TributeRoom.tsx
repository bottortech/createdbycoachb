"use client";

import { Billboard, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";

// =============================================================
// DEBUG_TRIBUTE — stripped-down visibility mode.
// When true:
//   - SkyDome, MountainBackdrop, SakuraTree, SakuraPetals, WispOrbs are
//     all SKIPPED so nothing in the scene can occlude or dim the room.
//   - The warm purple/amber lighting is replaced with strong neutral
//     white ambient + directional + hemisphere so dark base materials
//     are guaranteed visible.
//   - axesHelper + gridHelper + bright magenta cube + yellow camera
//     marker render so we can visually confirm the scene is alive.
// Flip back to false once basic geometry is confirmed visible.
// =============================================================
const DEBUG_TRIBUTE = false;
// Legacy alias (other components still reference this).
const DEBUG = DEBUG_TRIBUTE;

// =====================================================================
// TRIBUTE ROOM — a quiet lantern garden in honor of Jamal Brown.
// Open-air, balanced cool/warm palette. Lazy-loaded; mounts only while
// the tribute portal is active. All textures are procedurally generated
// so this room adds no asset weight to the main gallery payload aside
// from the brother's photo.
// =====================================================================

// Far east of the other hidden rooms so portals don't conflict.
const X_MIN = 70;
const X_MAX = 86;
const Z_MIN = -8;
const Z_MAX = 8;
const CX = (X_MIN + X_MAX) / 2;
const CZ = (Z_MIN + Z_MAX) / 2;
const DEPTH_X = X_MAX - X_MIN;
const WIDTH_Z = Z_MAX - Z_MIN;

// Camera entry — looks down the path toward the centerpiece. Slightly
// elevated (y=2) and tilted down (lookAt y=1) so the user can see the
// floor + pedestal + lanterns in one frame on entry.
export const TRIBUTE_ROOM_CAMERA = {
  pos: [72, 2, 0] as [number, number, number],
  lookAt: [82, 1, 0] as [number, number, number],
};

// Tribute content — exported so the mobile 2D overlay can render the
// same words without duplicating the strings.
export const TRIBUTE_NAME = "JAMAL BROWN";
export const TRIBUTE_DATES = "1997 — 2021";
export const TRIBUTE_MESSAGE = "Forever Loved";
export const TRIBUTE_PHOTO = "/images/brother.jpg";

// Tiny solid-color fallback texture — used if any of the procedural canvas
// generators throw. Guarantees we never end up with a null map.
function fallbackTexture(color: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Procedurally paint the night sky once, reuse the result.
function createSkyTexture(): THREE.CanvasTexture {
  try {
  const w = 1024;
  const h = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Vertical gradient — deep indigo zenith, warmer violet near the horizon.
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#161028");
  grad.addColorStop(0.4, "#23193e");
  grad.addColorStop(0.75, "#3c2754");
  grad.addColorStop(1, "#5a3a55");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Stars — concentrated in the upper half so the horizon stays clean.
  const starCount = 280;
  for (let i = 0; i < starCount; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h * 0.72;
    const size = 0.3 + Math.random() * 1.4;
    const brightness = 0.25 + Math.random() * 0.7;
    ctx.fillStyle = `rgba(255, 248, 230, ${brightness})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // A few soft glowing patches — distant clouds / nebula hints.
  for (let i = 0; i < 4; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h * 0.55;
    const radius = 50 + Math.random() * 60;
    const haze = ctx.createRadialGradient(x, y, 0, x, y, radius);
    haze.addColorStop(0, "rgba(255, 210, 170, 0.13)");
    haze.addColorStop(1, "rgba(255, 210, 170, 0)");
    ctx.fillStyle = haze;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Soft anime moon — a gentle disc with diffuse halo. Anchors the sky.
  {
    const moonX = w * 0.7;
    const moonY = h * 0.18;
    const moonR = 38;
    // Wide outer halo
    const halo = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonR * 4);
    halo.addColorStop(0, "rgba(255, 245, 215, 0.22)");
    halo.addColorStop(1, "rgba(255, 245, 215, 0)");
    ctx.fillStyle = halo;
    ctx.fillRect(moonX - moonR * 4, moonY - moonR * 4, moonR * 8, moonR * 8);
    // Disc — slight off-center highlight for soft sphere feel
    const disc = ctx.createRadialGradient(moonX - 10, moonY - 10, 0, moonX, moonY, moonR);
    disc.addColorStop(0, "rgba(255, 252, 240, 1)");
    disc.addColorStop(0.7, "rgba(248, 240, 220, 0.95)");
    disc.addColorStop(1, "rgba(220, 210, 190, 0.65)");
    ctx.fillStyle = disc;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();
    // A few faint moon "marias" — suggest texture without detail
    ctx.fillStyle = "rgba(180, 170, 150, 0.18)";
    for (let i = 0; i < 5; i++) {
      const dx = (Math.random() - 0.5) * moonR * 1.2;
      const dy = (Math.random() - 0.5) * moonR * 1.2;
      const r = 4 + Math.random() * 6;
      if (dx * dx + dy * dy < (moonR * 0.85) ** 2) {
        ctx.beginPath();
        ctx.arc(moonX + dx, moonY + dy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[TributeRoom] sky texture generation failed", err);
    return fallbackTexture("#1f1838");
  }
}

// Distant mountain silhouettes — anchors the horizon with depth. Two
// overlapping layers, each procedurally drawn as soft jagged peaks.
function createMountainBackdrop(): THREE.CanvasTexture {
  const w = 2048;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);

  // Far layer — distant mountains, very dim violet
  const drawRange = (
    fillStyle: string,
    minPeak: number,
    maxPeak: number,
    minStep: number,
    maxStep: number
  ) => {
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.moveTo(0, h);
    let x = 0;
    let lastY = h - (minPeak + Math.random() * (maxPeak - minPeak));
    ctx.lineTo(0, lastY);
    while (x < w) {
      const step = minStep + Math.random() * (maxStep - minStep);
      x += step;
      const peakY = h - (minPeak + Math.random() * (maxPeak - minPeak));
      ctx.lineTo(x, peakY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  };

  drawRange("#231938", 60, 130, 90, 180);
  drawRange("#1a1230", 100, 200, 140, 240);
  drawRange("#120a22", 140, 240, 220, 360);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Sakura tree silhouette — trunk + branches + soft pink blossom clouds.
// Used as a 2D plate flanking the torii. No transparency on a plane is
// possible if we set transparent: true on the material.
function createSakuraTreeTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 768;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);

  const trunkColor = "#1a0e1a";

  // Trunk — slightly tapered
  ctx.fillStyle = trunkColor;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 18, h);
  ctx.bezierCurveTo(
    w / 2 - 22, h * 0.7,
    w / 2 - 12, h * 0.5,
    w / 2 - 6, h * 0.3
  );
  ctx.lineTo(w / 2 + 6, h * 0.3);
  ctx.bezierCurveTo(
    w / 2 + 12, h * 0.5,
    w / 2 + 22, h * 0.7,
    w / 2 + 18, h
  );
  ctx.closePath();
  ctx.fill();

  // Branches — angled twigs reaching outward
  ctx.strokeStyle = trunkColor;
  ctx.lineCap = "round";
  for (let i = 0; i < 7; i++) {
    const startY = h * (0.45 + Math.random() * 0.3);
    const length = 70 + Math.random() * 110;
    const angle = (Math.random() - 0.5) * 1.6;
    ctx.lineWidth = 3 + Math.random() * 3;
    ctx.beginPath();
    ctx.moveTo(w / 2, startY);
    const endX = w / 2 + Math.cos(angle) * length;
    const endY = startY - Math.abs(Math.sin(angle)) * length;
    // gentle curve via control point
    ctx.quadraticCurveTo((w / 2 + endX) / 2 + (Math.random() - 0.5) * 30, startY - length * 0.3, endX, endY);
    ctx.stroke();
  }

  // Blossom clusters — pink soft circles in the canopy
  for (let i = 0; i < 90; i++) {
    const cx = w / 2 + (Math.random() - 0.5) * 380;
    const cy = h * 0.05 + Math.random() * h * 0.45;
    const radius = 12 + Math.random() * 30;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    // mix of pinks for soft variation
    const pinkVar = Math.random() > 0.4 ? "255, 200, 218" : "255, 215, 232";
    grad.addColorStop(0, `rgba(${pinkVar}, 0.95)`);
    grad.addColorStop(0.6, `rgba(${pinkVar}, 0.45)`);
    grad.addColorStop(1, `rgba(${pinkVar}, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Soft sakura petal sprite — used by the falling-petal particle system.
function createPetalSprite(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  // Petal-like soft oval gradient
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255, 200, 220, 1)");
  grad.addColorStop(0.45, "rgba(255, 205, 225, 0.7)");
  grad.addColorStop(1, "rgba(255, 205, 225, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Soft stone-path texture so the path doesn't read as plain color.
function createStoneTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#3d2f3a";
  ctx.fillRect(0, 0, size, size);
  // Subtle dotted variation
  for (let i = 0; i < 1200; i++) {
    ctx.fillStyle = `rgba(${50 + Math.random() * 30}, ${40 + Math.random() * 25}, ${50 + Math.random() * 30}, ${Math.random() * 0.35})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  }
  // A few hairline cracks for texture
  for (let i = 0; i < 16; i++) {
    ctx.strokeStyle = `rgba(20, 15, 22, ${0.25 + Math.random() * 0.3})`;
    ctx.lineWidth = 0.4 + Math.random() * 0.6;
    ctx.beginPath();
    let x = Math.random() * size;
    let y = Math.random() * size;
    ctx.moveTo(x, y);
    for (let j = 0; j < 12; j++) {
      x += (Math.random() - 0.5) * 18;
      y += (Math.random() - 0.5) * 18;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---------- Sky dome ----------
// Centered at the camera entry (not at the room center) so the entire
// sphere surface stays well inside the global Canvas far-plane (30m).
// Without this, parts of the sky get clipped and the user sees a black
// void where the night sky should be.
function SkyDome() {
  const tex = useMemo(() => createSkyTexture(), []);
  return (
    <mesh
      position={[
        TRIBUTE_ROOM_CAMERA.pos[0],
        TRIBUTE_ROOM_CAMERA.pos[1],
        TRIBUTE_ROOM_CAMERA.pos[2],
      ]}
      renderOrder={-10}
    >
      <sphereGeometry args={[24, 32, 16]} />
      {/* No tinting color — leave as #ffffff so the procedural map shows
          at full brightness. If the canvas texture failed, fallbackTexture
          renders a solid dark indigo so we never see bare canvas. */}
      <meshBasicMaterial
        map={tex}
        side={THREE.BackSide}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}

// ---------- Floor ----------
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CX, 0, CZ]} receiveShadow>
      <planeGeometry args={[DEPTH_X, WIDTH_Z]} />
      <meshStandardMaterial color="#1f1830" roughness={0.9} />
    </mesh>
  );
}

// ---------- Stone path leading to the centerpiece ----------
function StonePath() {
  const tex = useMemo(() => createStoneTexture(), []);
  useMemo(() => {
    tex.repeat.set(8, 1);
  }, [tex]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[77.5, 0.01, 0]}>
      <planeGeometry args={[10.5, 1.4]} />
      <meshStandardMaterial map={tex} color="#5a4a55" roughness={0.75} />
    </mesh>
  );
}

// ---------- Floating paper lantern ----------
interface LanternProps {
  position: [number, number, number];
  scale?: number;
  isMain?: boolean;
  phase?: number;
}
function FloatingLantern({ position, scale = 1, isMain = false, phase = 0 }: LanternProps) {
  const groupRef = useRef<THREE.Group>(null);
  const baseY = position[1];
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // Very gentle bob — slower than a regular animation, breath-like.
    const t = clock.elapsedTime * 0.45 + phase;
    groupRef.current.position.y = baseY + Math.sin(t) * 0.06;
  });

  const lanternColor = isMain ? "#ffc88a" : "#ffb87a";
  const emissiveIntensity = isMain ? 1.6 : 0.95;

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Hanging cord — runs up out of frame */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 1.4, 6]} />
        <meshStandardMaterial color="#1a1410" />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, 0.135, 0]}>
        <cylinderGeometry args={[0.075, 0.06, 0.04, 16]} />
        <meshStandardMaterial color="#2a1f1a" roughness={0.7} />
      </mesh>
      {/* Paper body — emissive cylinder */}
      <mesh>
        <cylinderGeometry args={[0.1, 0.1, 0.22, 18, 1, true]} />
        <meshStandardMaterial
          color={lanternColor}
          emissive={lanternColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Bottom cap */}
      <mesh position={[0, -0.125, 0]}>
        <cylinderGeometry args={[0.06, 0.04, 0.03, 16]} />
        <meshStandardMaterial color="#2a1f1a" roughness={0.7} />
      </mesh>
      {/* Tassel beneath */}
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.05, 6]} />
        <meshStandardMaterial color="#2a1f1a" />
      </mesh>
    </group>
  );
}

// ---------- Distant torii silhouette ----------
function Torii({ x = 84, z = 0 }: { x?: number; z?: number }) {
  const color = "#0e0a14";
  return (
    <group position={[x, 0, z]}>
      {/* Vertical posts */}
      <mesh position={[0, 1.5, -0.85]}>
        <boxGeometry args={[0.22, 3, 0.22]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
      <mesh position={[0, 1.5, 0.85]}>
        <boxGeometry args={[0.22, 3, 0.22]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
      {/* Lower beam (nuki) */}
      <mesh position={[0, 2.45, 0]}>
        <boxGeometry args={[0.18, 0.08, 1.85]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
      {/* Top beam (kasagi) — wider, suggestion of upturn */}
      <mesh position={[0, 2.85, 0]}>
        <boxGeometry args={[0.26, 0.16, 2.25]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
      {/* Top beam shadow plate */}
      <mesh position={[0, 2.7, 0]}>
        <boxGeometry args={[0.21, 0.06, 1.95]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
    </group>
  );
}

// ---------- Centerpiece pedestal + plaque ----------
function Pedestal({ onClick }: { onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={[82, 0, 0]}>
      {/* Base */}
      <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.82, 0.05, 0.62]} />
        <meshStandardMaterial color="#5a544c" roughness={0.7} />
      </mesh>
      {/* Stone column */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.68, 1.0, 0.5]} />
        <meshStandardMaterial color="#4f4940" roughness={0.75} />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, 1.075, 0]} castShadow>
        <boxGeometry args={[0.78, 0.06, 0.58]} />
        <meshStandardMaterial color="#5e574e" roughness={0.65} />
      </mesh>

      {/* Brass plaque — front face (-x side). Local +z faces -x in world
          when this group rotates -π/2 around Y. We don't rotate the
          group; instead we orient the plaque manually. The plaque group
          is clickable so the tribute text opens the same modal as the
          photo. */}
      <group
        position={[-0.341, 0.55, 0]}
        rotation={[0, -Math.PI / 2, 0]}
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
        {/* Invisible click hitbox covering the whole plaque area */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[0.4, 0.65]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        {/* Plaque plate — brightens on hover so the user knows it's
            interactive. */}
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[0.36, 0.6]} />
          <meshStandardMaterial
            color="#7a5f2a"
            metalness={0.75}
            roughness={0.35}
            emissive="#3a2b10"
            emissiveIntensity={hovered ? 0.5 : 0.15}
          />
        </mesh>
        {/* Border inset */}
        <mesh position={[0, 0, 0.006]}>
          <planeGeometry args={[0.32, 0.55]} />
          <meshStandardMaterial
            color="#8c6f33"
            metalness={0.85}
            roughness={0.3}
          />
        </mesh>
        {/* Engraved text */}
        <Text
          position={[0, 0.18, 0.012]}
          fontSize={0.045}
          color="#1c1408"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.18}
        >
          {TRIBUTE_NAME}
        </Text>
        <Text
          position={[0, 0.075, 0.012]}
          fontSize={0.034}
          color="#241a0c"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.18}
        >
          {TRIBUTE_DATES}
        </Text>
        {/* Divider — small horizontal line */}
        <mesh position={[0, -0.005, 0.011]}>
          <planeGeometry args={[0.13, 0.005]} />
          <meshStandardMaterial color="#241a0c" />
        </mesh>
        <Text
          position={[0, -0.13, 0.012]}
          fontSize={0.038}
          color="#1c1408"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.22}
        >
          {TRIBUTE_MESSAGE}
        </Text>
      </group>
    </group>
  );
}

// ---------- Photo easel beside the pedestal ----------
function PhotoEasel({ onClick }: { onClick?: () => void }) {
  // Imperative texture load — avoids drei's suspense-based useTexture so a
  // slow / failing photo download can never blank the whole scene. We always
  // render the easel; the photo plane shows a dark fallback until the
  // texture resolves (or stays dark forever if it errors).
  const [photoTex, setPhotoTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let cancelled = false;
    loader.load(
      TRIBUTE_PHOTO,
      (tex) => {
        if (cancelled) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        setPhotoTex(tex);
        // eslint-disable-next-line no-console
        console.log("[TributeRoom] photo loaded:", TRIBUTE_PHOTO);
      },
      undefined,
      (err) => {
        // eslint-disable-next-line no-console
        console.error("[TributeRoom] photo load failed:", TRIBUTE_PHOTO, err);
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);
  const [hovered, setHovered] = useState(false);
  // Easel pulled forward (closer to camera) and away from the row of
  // stone lanterns, scaled up so the photo reads as the centerpiece
  // instead of a small detail beside the pedestal.
  const PHOTO_W = 0.62;
  const PHOTO_H = 0.88;
  return (
    <group
      position={[80, 0.05, -1.0]}
      rotation={[0, -Math.PI / 2, 0]}
    >
      {/* Wooden tabletop base */}
      <mesh position={[0, 0.05, 0.08]} castShadow>
        <boxGeometry args={[0.7, 0.1, 0.42]} />
        <meshStandardMaterial color="#3a2818" roughness={0.75} />
      </mesh>
      {/* Easel back — slight backward lean (top tilts away from camera). */}
      <group position={[0, 0.1, 0]} rotation={[Math.PI / 14, 0, 0]}>
        {/* Vertical posts */}
        <mesh position={[-0.32, 0.78, 0]}>
          <boxGeometry args={[0.04, 1.55, 0.04]} />
          <meshStandardMaterial color="#3a2818" roughness={0.75} />
        </mesh>
        <mesh position={[0.32, 0.78, 0]}>
          <boxGeometry args={[0.04, 1.55, 0.04]} />
          <meshStandardMaterial color="#3a2818" roughness={0.75} />
        </mesh>
        {/* Crossbar (under the photo) */}
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[0.7, 0.03, 0.03]} />
          <meshStandardMaterial color="#3a2818" roughness={0.75} />
        </mesh>
        {/* Top crossbar (above the photo) */}
        <mesh position={[0, 1.32, 0]}>
          <boxGeometry args={[0.7, 0.03, 0.03]} />
          <meshStandardMaterial color="#3a2818" roughness={0.75} />
        </mesh>
        {/* Soft warm halo behind the photo — gives the portrait a glow
            so it pops against the dark scene. */}
        <mesh position={[0, 0.82, 0.003]}>
          <planeGeometry args={[PHOTO_W + 0.18, PHOTO_H + 0.22]} />
          <meshBasicMaterial
            color="#ffb87a"
            transparent
            opacity={0.18}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
        {/* Frame border (outer) */}
        <mesh position={[0, 0.82, 0.005]}>
          <planeGeometry args={[PHOTO_W + 0.12, PHOTO_H + 0.16]} />
          <meshStandardMaterial color="#2a1c10" roughness={0.65} side={THREE.DoubleSide} />
        </mesh>
        {/* Inner gold rim — brightens on hover so it's clearly interactive. */}
        <mesh position={[0, 0.82, 0.0065]}>
          <planeGeometry args={[PHOTO_W + 0.08, PHOTO_H + 0.12]} />
          <meshStandardMaterial
            color="#7a5f2a"
            metalness={0.7}
            roughness={0.4}
            side={THREE.DoubleSide}
            emissive="#3a2b10"
            emissiveIntensity={hovered ? 0.45 : 0.1}
          />
        </mesh>
        {/* Mat */}
        <mesh position={[0, 0.82, 0.008]}>
          <planeGeometry args={[PHOTO_W + 0.04, PHOTO_H + 0.04]} />
          <meshStandardMaterial color="#1a120a" roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
        {/* Photo — clickable, unlit so it always reads brightly regardless
            of the warm/cool ambience. Bumped to renderOrder=2 + the click
            mesh so nothing can occlude or steal pointer events. */}
        <mesh
          position={[0, 0.82, 0.014]}
          renderOrder={2}
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
          <planeGeometry args={[PHOTO_W, PHOTO_H]} />
          <meshBasicMaterial
            map={photoTex ?? undefined}
            color={photoTex ? "#ffffff" : "#1a1208"}
            toneMapped={false}
            depthTest={false}
          />
        </mesh>
      </group>
      {/* Soft warm spotlight onto the photo so it pops even in the
          ambient warm/cool lighting. */}
      <pointLight
        position={[0.4, 1.6, 0]}
        color="#fff1c8"
        intensity={1.4}
        distance={2.4}
        decay={2}
      />
    </group>
  );
}

// ---------- Origami crane on the pedestal ----------
function OrigamiCrane() {
  // Tiny low-poly crane — paper-white, suggested rather than detailed.
  return (
    <group position={[82, 1.115, 0.18]} rotation={[0, Math.PI / 4.5, 0]}>
      {/* Body */}
      <mesh rotation={[0, 0, 0]}>
        <coneGeometry args={[0.04, 0.06, 4]} />
        <meshStandardMaterial color="#f3f0e2" roughness={0.95} />
      </mesh>
      {/* Right wing — angled flat triangle */}
      <mesh position={[0.04, 0.015, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.025, 0.07, 3]} />
        <meshStandardMaterial color="#f3f0e2" roughness={0.95} />
      </mesh>
      {/* Left wing */}
      <mesh position={[-0.04, 0.015, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <coneGeometry args={[0.025, 0.07, 3]} />
        <meshStandardMaterial color="#f3f0e2" roughness={0.95} />
      </mesh>
      {/* Head/beak — small cone tilted up */}
      <mesh position={[0.025, 0.04, 0]} rotation={[0, 0, -Math.PI / 2.5]}>
        <coneGeometry args={[0.012, 0.04, 4]} />
        <meshStandardMaterial color="#f3f0e2" roughness={0.95} />
      </mesh>
    </group>
  );
}

// ---------- Distant mountain silhouettes (wide backdrop plate) ----------
function MountainBackdrop() {
  const tex = useMemo(() => createMountainBackdrop(), []);
  return (
    <mesh position={[86, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <planeGeometry args={[20, 5]} />
      <meshBasicMaterial
        map={tex}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

// ---------- Sakura tree silhouette (2D plate) ----------
function SakuraTree({
  x, z, rotY = -Math.PI / 2, scale = 1,
}: {
  x: number; z: number; rotY?: number; scale?: number;
}) {
  const tex = useMemo(() => createSakuraTreeTexture(), []);
  // Tree height: scale * 4m. Width keeps aspect 512:768 → 0.667.
  const w = 4 * 0.667 * scale;
  const h = 4 * scale;
  return (
    <mesh position={[x, h / 2, z]} rotation={[0, rotY, 0]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        map={tex}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

// ---------- Traditional stone ishidoro lantern ----------
function StoneIshidoro({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Base stone */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.16, 0.46]} />
        <meshStandardMaterial color="#3a3540" roughness={0.95} />
      </mesh>
      {/* Stem column */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.085, 0.6, 8]} />
        <meshStandardMaterial color="#46414c" roughness={0.92} />
      </mesh>
      {/* Hikiraku ring (mid disc) */}
      <mesh position={[0, 0.81, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.04, 12]} />
        <meshStandardMaterial color="#3a3540" roughness={0.9} />
      </mesh>
      {/* Lamp body — square with windows on each side */}
      <mesh position={[0, 0.96, 0]} castShadow>
        <boxGeometry args={[0.3, 0.28, 0.3]} />
        <meshStandardMaterial color="#3a3540" roughness={0.9} />
      </mesh>
      {/* Inner glow — emissive sphere visible through window cutouts in real
          stone lanterns; here suggested as a warm core. */}
      <mesh position={[0, 0.96, 0]}>
        <sphereGeometry args={[0.09, 10, 8]} />
        <meshBasicMaterial color="#ffb87a" toneMapped={false} />
      </mesh>
      {/* Roof — pyramidal cap */}
      <mesh position={[0, 1.16, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.27, 0.16, 4]} />
        <meshStandardMaterial color="#3a3540" roughness={0.95} />
      </mesh>
      {/* Finial — small ball on top */}
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshStandardMaterial color="#3a3540" roughness={0.9} />
      </mesh>
      {/* Soft warm light from the lantern body */}
      <pointLight
        position={[0, 0.96, 0]}
        color="#ffb87a"
        intensity={0.7}
        distance={2.4}
        decay={2}
      />
    </group>
  );
}

// ---------- Wisp orbs — small drifting glow lights along the path ----------
// ---------- Koi pond — reflective water + slow swimming koi ----------
// Sits beside the path on the north side. The water plane uses a dark
// blue MeshStandardMaterial with low roughness so the lanterns above
// reflect into it. Koi are simple oval sprites that slowly orbit the
// pond center on a clock-driven path. No textures required — purely
// procedural so it adds zero asset weight.
// Pond sits to the LEFT of the path (north side, +Z). Pulled in from
// z=4.4 → z=2.8 so the pond's center stays inside the entry-camera FOV
// at ~7m distance; with the 1.4m radius the near edge sits just past
// the stone lanterns at z=1.6.
const KOI_POND_CENTER: [number, number, number] = [79, 0.005, 2.8];
const KOI_POND_RADIUS = 1.2;

function KoiPond() {
  const koiGroupRef = useRef<THREE.Group>(null);
  const koi = useMemo(
    () =>
      [
        { phase: 0, speed: 0.22, radius: 0.85, color: "#ff8a3a", y: 0.04, scale: 1.0 },
        { phase: Math.PI * 0.6, speed: 0.28, radius: 0.65, color: "#fff3d0", y: 0.05, scale: 0.85 },
        { phase: Math.PI * 1.1, speed: 0.18, radius: 0.95, color: "#ff5e22", y: 0.045, scale: 1.05 },
        { phase: Math.PI * 1.7, speed: 0.32, radius: 0.55, color: "#ffffff", y: 0.05, scale: 0.75 },
      ] as const,
    []
  );

  useFrame(({ clock }) => {
    if (!koiGroupRef.current) return;
    const t = clock.elapsedTime;
    koiGroupRef.current.children.forEach((node, i) => {
      const k = koi[i];
      const a = t * k.speed + k.phase;
      const x = KOI_POND_CENTER[0] + Math.cos(a) * k.radius;
      const z = KOI_POND_CENTER[2] + Math.sin(a) * k.radius;
      node.position.set(x, KOI_POND_CENTER[1] + k.y, z);
      // Face direction of motion. Tangent direction is perpendicular to
      // radius vector, so yaw = a + π/2.
      node.rotation.y = a + Math.PI / 2;
    });
  });

  return (
    <group>
      {/* Stone rim — a thicker dark torus around the water edge */}
      <mesh
        position={[KOI_POND_CENTER[0], 0.04, KOI_POND_CENTER[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[KOI_POND_RADIUS, KOI_POND_RADIUS + 0.18, 48]} />
        <meshStandardMaterial color="#3a3530" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* Water surface — low roughness + metalness gives it a faint
          mirror-like quality under the lanterns. */}
      <mesh
        position={[KOI_POND_CENTER[0], KOI_POND_CENTER[1] + 0.005, KOI_POND_CENTER[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[KOI_POND_RADIUS, 48]} />
        <meshStandardMaterial
          color="#16243a"
          roughness={0.18}
          metalness={0.55}
          emissive="#1a2a48"
          emissiveIntensity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* A few lily pads — small flat green discs scattered on the surface. */}
      {[
        [0.55, 0.65],
        [-0.7, 0.2],
        [0.2, -0.85],
        [-0.4, -0.55],
      ].map(([dx, dz], i) => (
        <mesh
          key={i}
          position={[KOI_POND_CENTER[0] + dx, KOI_POND_CENTER[1] + 0.012, KOI_POND_CENTER[2] + dz]}
          rotation={[-Math.PI / 2, 0, i * 0.7]}
        >
          <circleGeometry args={[0.18, 16]} />
          <meshStandardMaterial color="#2d5a32" roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Koi — flat top-down ovals (long axis aligned with motion). */}
      <group ref={koiGroupRef}>
        {koi.map((k, i) => (
          <group key={i}>
            {/* Body — wide along local X, narrow along Z. */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[k.scale * 0.34, k.scale * 0.12, 1]}>
              <circleGeometry args={[1, 18]} />
              <meshBasicMaterial color={k.color} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            {/* Tail — small triangle behind the body */}
            <mesh
              position={[-k.scale * 0.32, 0, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={[k.scale * 0.12, k.scale * 0.1, 1]}
            >
              <circleGeometry args={[1, 3]} />
              <meshBasicMaterial color={k.color} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// ---------- Fireflies — small bright glowing orbs swarming softly ----------
// Brighter and more numerous than WispOrbs. Lanterns and fireflies do
// most of the lighting heavy-lifting in the scene.
interface FireflyData {
  baseX: number;
  baseY: number;
  baseZ: number;
  phase: number;
  speed: number;
  amp: number;
}
function Fireflies() {
  const groupRef = useRef<THREE.Group>(null);
  const flies = useMemo<FireflyData[]>(() => {
    const data: FireflyData[] = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
      data.push({
        baseX: 73 + Math.random() * 11,
        baseY: 0.6 + Math.random() * 2.4,
        baseZ: (Math.random() - 0.5) * 7,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.55,
        amp: 0.25 + Math.random() * 0.45,
      });
    }
    return data;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((fly, i) => {
      const d = flies[i];
      fly.position.x = d.baseX + Math.sin(t * d.speed + d.phase) * d.amp;
      fly.position.y = d.baseY + Math.sin(t * d.speed * 0.6 + d.phase * 1.7) * 0.3;
      fly.position.z = d.baseZ + Math.cos(t * d.speed * 0.85 + d.phase * 0.5) * d.amp;
      // Pulsing brightness — each firefly blinks on its own phase.
      const blink = 0.55 + 0.45 * Math.sin(t * 2.4 + d.phase * 3.1);
      const core = fly.children[0] as THREE.Mesh | undefined;
      const halo = fly.children[1] as THREE.Mesh | undefined;
      if (core && core.material instanceof THREE.MeshBasicMaterial) {
        core.material.opacity = blink;
      }
      if (halo && halo.material instanceof THREE.MeshBasicMaterial) {
        halo.material.opacity = blink * 0.3;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {flies.map((d, i) => {
        // Half warm yellow, half soft green so they read as a mixed
        // kodama-style swarm rather than a uniform color.
        const color = i % 2 === 0 ? "#fff39a" : "#c8ff9a";
        return (
          <group key={i} position={[d.baseX, d.baseY, d.baseZ]}>
            <mesh>
              <sphereGeometry args={[0.035, 8, 6]} />
              <meshBasicMaterial color={color} toneMapped={false} transparent opacity={1} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.13, 10, 8]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.3}
                toneMapped={false}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ---------- Anime silhouette sprite — used for spirit fox + watcher ----------
// Loads a PNG with transparent background. If it fails we fall back to a
// small dark plane so the scene never blanks. Always faces the camera
// (sprite-like billboarding) so it reads cleanly from the entry angle.
interface AnimeSpriteProps {
  src: string;
  position: [number, number, number];
  width: number;
  height: number;
  /** Tint color — pass white to keep the PNG colors verbatim. */
  color?: string;
  /** Optional emissive boost. Useful for the spirit fox glow. */
  emissive?: string;
  emissiveIntensity?: number;
  /** When false, sprite uses parent rotation instead of always facing
   *  the camera. Used for the shrine display where the image must stay
   *  fixed inside the alcove. */
  billboard?: boolean;
}
function AnimeSprite({
  src,
  position,
  width,
  height,
  color = "#ffffff",
  emissive,
  emissiveIntensity = 0,
  billboard = true,
}: AnimeSpriteProps) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let cancelled = false;
    loader.load(
      src,
      (t) => {
        if (cancelled) return;
        t.colorSpace = THREE.SRGBColorSpace;
        setTex(t);
      },
      undefined,
      () => {
        if (cancelled) return;
        setLoadFailed(true);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [src]);
  const meshContent = (
    <mesh>
      <planeGeometry args={[width, height]} />
      {tex ? (
        emissive ? (
          <meshStandardMaterial
            map={tex}
            color={color}
            transparent
            alphaTest={0.05}
            side={THREE.DoubleSide}
            emissive={emissive}
            emissiveMap={tex}
            emissiveIntensity={emissiveIntensity}
            toneMapped={false}
          />
        ) : (
          <meshBasicMaterial
            map={tex}
            color={color}
            transparent
            alphaTest={0.05}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        )
      ) : (
        <meshBasicMaterial
          color={loadFailed ? "#1a1410" : "#2a2218"}
          transparent
          opacity={loadFailed ? 0.12 : 0.25}
          side={THREE.DoubleSide}
        />
      )}
    </mesh>
  );

  if (billboard) {
    return (
      <Billboard position={position} follow lockX={false} lockY={false} lockZ={false}>
        {meshContent}
      </Billboard>
    );
  }
  return <group position={position}>{meshContent}</group>;
}

// ---------- Spirit fox shrine — small Inari-style alcove housing the
// fox image. Stone base, wooden frame and tiered roof, glowing from
// within. The image is fixed to the back wall (billboard=false) so it
// reads as a piece of art enshrined inside, not a free-floating sprite. ----------
function SpiritFoxShrine() {
  return (
    <group position={[76, 0, -2.5]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Stone base — wider, rougher slab */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.1, 0.55]} />
        <meshStandardMaterial color="#5a544c" roughness={0.85} />
      </mesh>
      {/* Stone step inset on top of the base */}
      <mesh position={[0, 0.13, 0.04]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.06, 0.45]} />
        <meshStandardMaterial color="#6a625a" roughness={0.8} />
      </mesh>
      {/* Wooden mat platform inside the alcove (where the fox sits) */}
      <mesh position={[0, 0.18, -0.08]}>
        <boxGeometry args={[0.65, 0.02, 0.3]} />
        <meshStandardMaterial color="#3a2818" roughness={0.7} />
      </mesh>

      {/* Back wall — dark wood, gives the fox image a frame */}
      <mesh position={[0, 0.65, -0.22]} castShadow>
        <boxGeometry args={[0.7, 0.92, 0.04]} />
        <meshStandardMaterial color="#1c1208" roughness={0.75} />
      </mesh>
      {/* Two side posts */}
      <mesh position={[-0.345, 0.65, -0.05]} castShadow>
        <boxGeometry args={[0.05, 1.0, 0.42]} />
        <meshStandardMaterial color="#3a2818" roughness={0.7} />
      </mesh>
      <mesh position={[0.345, 0.65, -0.05]} castShadow>
        <boxGeometry args={[0.05, 1.0, 0.42]} />
        <meshStandardMaterial color="#3a2818" roughness={0.7} />
      </mesh>
      {/* Lintel above the alcove */}
      <mesh position={[0, 1.16, -0.05]} castShadow>
        <boxGeometry args={[0.78, 0.06, 0.45]} />
        <meshStandardMaterial color="#241810" roughness={0.7} />
      </mesh>
      {/* Tiered roof — two pitched halves like a real shrine roof */}
      <mesh
        position={[0, 1.24, 0.06]}
        rotation={[Math.PI / 9, 0, 0]}
        castShadow
      >
        <boxGeometry args={[0.92, 0.05, 0.36]} />
        <meshStandardMaterial color="#0e0a06" roughness={0.65} />
      </mesh>
      <mesh
        position={[0, 1.24, -0.16]}
        rotation={[-Math.PI / 9, 0, 0]}
        castShadow
      >
        <boxGeometry args={[0.92, 0.05, 0.36]} />
        <meshStandardMaterial color="#0e0a06" roughness={0.65} />
      </mesh>
      {/* Roof ridge */}
      <mesh position={[0, 1.32, -0.05]} castShadow>
        <boxGeometry args={[0.95, 0.04, 0.06]} />
        <meshStandardMaterial color="#1a1208" roughness={0.6} />
      </mesh>

      {/* Fox image — fixed inside the alcove, NOT billboarded so it
          stays in place even as the user looks around. */}
      <AnimeSprite
        src="/images/spirit-fox.jpg"
        position={[0, 0.62, -0.18]}
        width={0.55}
        height={0.7}
        color="#fff5d8"
        emissive="#ffd28a"
        emissiveIntensity={0.6}
        billboard={false}
      />

      {/* Warm glow inside the shrine — lights the fox image and spills
          softly onto the path. */}
      <pointLight
        color="#ffb87a"
        intensity={1.2}
        distance={2.2}
        decay={2}
        position={[0, 0.65, 0.05]}
      />

      {/* Two small offering bowls at the front of the platform */}
      <mesh position={[-0.18, 0.21, 0.16]} castShadow>
        <cylinderGeometry args={[0.045, 0.055, 0.045, 14]} />
        <meshStandardMaterial color="#4a4238" roughness={0.85} />
      </mesh>
      <mesh position={[0.18, 0.21, 0.16]} castShadow>
        <cylinderGeometry args={[0.045, 0.055, 0.045, 14]} />
        <meshStandardMaterial color="#4a4238" roughness={0.85} />
      </mesh>
      {/* Tiny candle flames in each bowl */}
      <mesh position={[-0.18, 0.27, 0.16]}>
        <sphereGeometry args={[0.018, 8, 6]} />
        <meshBasicMaterial color="#fff3a0" toneMapped={false} />
      </mesh>
      <mesh position={[0.18, 0.27, 0.16]}>
        <sphereGeometry args={[0.018, 8, 6]} />
        <meshBasicMaterial color="#fff3a0" toneMapped={false} />
      </mesh>
    </group>
  );
}

// ---------- Watcher — distant figure silhouette on a hill ----------
function Watcher() {
  return (
    <group>
      {/* Small dark mound under the figure so it doesn't appear to float.
          Watcher pulled in from z=4.6 → z=3.2 so it stays inside the
          entry FOV at ~15m distance. */}
      <mesh position={[86.4, 0.18, 3.2]} receiveShadow>
        <sphereGeometry args={[0.55, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#161220" roughness={0.95} />
      </mesh>
      <AnimeSprite
        src="/images/tribute/watcher.png"
        position={[86.4, 0.95, 3.2]}
        width={0.9}
        height={1.4}
        color="#0a0612"
      />
    </group>
  );
}

interface WispData {
  baseX: number;
  baseY: number;
  baseZ: number;
  phase: number;
  speed: number;
  color: string;
}
function WispOrbs() {
  const groupRef = useRef<THREE.Group>(null);
  const orbs = useMemo<WispData[]>(() => {
    const data: WispData[] = [];
    const count = 7;
    for (let i = 0; i < count; i++) {
      data.push({
        baseX: 74 + Math.random() * 9,
        baseY: 0.7 + Math.random() * 1.6,
        baseZ: (Math.random() - 0.5) * 5.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.18 + Math.random() * 0.25,
        color: i % 2 === 0 ? "#a8c8ff" : "#d8a8ff",
      });
    }
    return data;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((orb, i) => {
      const d = orbs[i];
      orb.position.x = d.baseX + Math.sin(t * d.speed + d.phase) * 0.4;
      orb.position.y = d.baseY + Math.sin(t * d.speed * 0.7 + d.phase * 1.3) * 0.18;
      orb.position.z = d.baseZ + Math.cos(t * d.speed + d.phase * 0.7) * 0.35;
    });
  });

  return (
    <group ref={groupRef}>
      {orbs.map((d, i) => (
        <group key={i} position={[d.baseX, d.baseY, d.baseZ]}>
          {/* Core */}
          <mesh>
            <sphereGeometry args={[0.025, 8, 6]} />
            <meshBasicMaterial color={d.color} toneMapped={false} />
          </mesh>
          {/* Soft halo */}
          <mesh>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshBasicMaterial
              color={d.color}
              transparent
              opacity={0.18}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------- Sakura petals — drifting particle system ----------
function SakuraPetals() {
  const PETAL_COUNT = 80;
  const pointsRef = useRef<THREE.Points>(null);
  const sprite = useMemo(() => createPetalSprite(), []);

  // Initial positions + per-petal velocity vectors. Stored in plain arrays
  // so we can mutate them every frame without React overhead.
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(PETAL_COUNT * 3);
    const vel = new Float32Array(PETAL_COUNT * 3);
    for (let i = 0; i < PETAL_COUNT; i++) {
      pos[i * 3 + 0] = X_MIN + Math.random() * (X_MAX - X_MIN);
      pos[i * 3 + 1] = Math.random() * 5.5;
      pos[i * 3 + 2] = Z_MIN + Math.random() * (Z_MAX - Z_MIN);
      vel[i * 3 + 0] = (Math.random() - 0.5) * 0.06;
      vel[i * 3 + 1] = -(0.08 + Math.random() * 0.06);
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.06;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const dt = Math.min(delta, 0.1);
    const attr = pointsRef.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < PETAL_COUNT; i++) {
      arr[i * 3 + 0] += velocities[i * 3 + 0] * dt;
      arr[i * 3 + 1] += velocities[i * 3 + 1] * dt;
      arr[i * 3 + 2] += velocities[i * 3 + 2] * dt;
      // Recycle when below ground — re-spawn at the top, fresh column.
      if (arr[i * 3 + 1] < 0) {
        arr[i * 3 + 0] = X_MIN + Math.random() * (X_MAX - X_MIN);
        arr[i * 3 + 1] = 5 + Math.random() * 1.5;
        arr[i * 3 + 2] = Z_MIN + Math.random() * (Z_MAX - Z_MIN);
      }
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        size={0.18}
        sizeAttenuation
        transparent
        depthWrite={false}
        opacity={0.85}
        toneMapped={false}
      />
    </points>
  );
}

// ---------- Main component ----------
interface TributeRoomProps {
  /** Fires when the user clicks the photo on the easel. Parent surfaces
   *  this as a "piece" modal (same UX as the main-gallery ProjectModal). */
  onPhotoClick?: () => void;
}
export default function TributeRoom({ onPhotoClick }: TributeRoomProps = {}) {
  // Mount log so we can confirm the dynamic import resolved + the room
  // actually rendered, separate from any visual glitch.
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[TributeRoom] mounted", {
      cameraPos: TRIBUTE_ROOM_CAMERA.pos,
      cameraLookAt: TRIBUTE_ROOM_CAMERA.lookAt,
      photoPath: TRIBUTE_PHOTO,
      debug: DEBUG,
    });
    return () => {
      // eslint-disable-next-line no-console
      console.log("[TributeRoom] unmounted");
    };
  }, []);

  // -------- DEBUG_TRIBUTE branch: literally nothing but a floor, a
  // bright cube at the pedestal, a yellow sphere at camera entry, and
  // ambient/directional white light. If this is still black, the issue
  // is upstream (portal not engaging, camera not moving, canvas dead) —
  // not in any room geometry. --------
  if (DEBUG_TRIBUTE) {
    return (
      <group>
        {/* Big bright unlit floor — meshBasicMaterial ignores lights, so
            if even THIS is invisible the camera is not pointed at the
            room at all. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CX, 0, CZ]}>
          <planeGeometry args={[DEPTH_X, WIDTH_Z]} />
          <meshBasicMaterial color="#3a8a3a" toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        {/* Magenta cube where the pedestal sits */}
        <mesh position={[82, 1.5, 0]}>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshBasicMaterial color="#ff00ff" toneMapped={false} />
        </mesh>
        {/* Yellow sphere at camera entry */}
        <mesh position={TRIBUTE_ROOM_CAMERA.pos}>
          <sphereGeometry args={[0.3, 12, 8]} />
          <meshBasicMaterial color="#ffff00" toneMapped={false} />
        </mesh>
        {/* Big cyan wall behind the pedestal so we can never miss it */}
        <mesh position={[84, 3, 0]}>
          <boxGeometry args={[0.5, 6, 8]} />
          <meshBasicMaterial color="#00ffff" toneMapped={false} />
        </mesh>
        <axesHelper args={[3]} position={TRIBUTE_ROOM_CAMERA.pos} />
        <gridHelper args={[20, 20, "#ff00ff", "#666666"]} position={[CX, 0.02, CZ]} />
        <ambientLight intensity={2.4} color="#ffffff" />
        <directionalLight position={[80, 12, 5]} intensity={1.6} color="#ffffff" />
      </group>
    );
  }

  return (
    <group>
      <SkyDome />

      <Floor />
      <StonePath />

      <MountainBackdrop />

      <SakuraTree x={85.2} z={-3.8} scale={2.4} />
      <SakuraTree x={85.2} z={3.8} scale={2.2} />

      {/* Distant torii silhouette anchoring the horizon */}
      <Torii x={84.6} z={0} />

      {/* Stone ishidoro lanterns paired along the path */}
      <StoneIshidoro x={75.8} z={-1.6} />
      <StoneIshidoro x={75.8} z={1.6} />
      <StoneIshidoro x={79.8} z={-1.6} />
      <StoneIshidoro x={79.8} z={1.6} />

      {/* Floating lanterns lining the path — varied heights and phases. */}
      <FloatingLantern position={[74.5, 2.2, -2.8]} phase={0} />
      <FloatingLantern position={[75.5, 2.7, 2.4]} phase={1.1} />
      <FloatingLantern position={[77.5, 2.4, -2.4]} phase={2.0} />
      <FloatingLantern position={[78.0, 3.0, 2.8]} phase={0.5} />
      <FloatingLantern position={[80.0, 2.6, -2.6]} phase={1.5} />
      <FloatingLantern position={[80.5, 3.1, 2.3]} phase={2.4} />

      {/* The main lantern — directly above the pedestal, brighter,
          larger; this is the emotional focal point. */}
      <FloatingLantern position={[82, 2.55, 0]} scale={1.4} isMain phase={0} />

      {/* Centerpiece — both the pedestal plaque and the photo easel
          open the same tribute modal so users can interact with either. */}
      <Pedestal onClick={onPhotoClick} />
      <PhotoEasel onClick={onPhotoClick} />
      <OrigamiCrane />

      {/* Anime atmosphere — koi pond beside the path, glowing fireflies
          throughout, a small spirit fox near the entrance, and a distant
          silhouetted watcher figure on a far hill. */}
      <KoiPond />
      <Fireflies />
      <SpiritFoxShrine />
      <Watcher />

      <SakuraPetals />
      <WispOrbs />

      <ambientLight intensity={0.6} color="#7e6dab" />
      <hemisphereLight color="#5a4ab0" groundColor="#2a2040" intensity={0.55} />
      <pointLight
        position={[82, 2.55, 0]}
        color="#ffb47a"
        intensity={4.0}
        distance={9}
        decay={2}
      />
      <pointLight
        position={[82, 1.2, 0.4]}
        color="#ffd4a0"
        intensity={0.9}
        distance={3}
        decay={2}
      />
    </group>
  );
}
