"use client";

import { useTexture, Html, Text } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";
import SpotLightWithTarget from "./SpotLightWithTarget";
import GalleryLight from "./GalleryLight";

// Room bounds — sits directly behind gallery east wall (x = 19). Deep enough
// that the back wall never fills the viewport at any browser aspect ratio.
// Camera enters at (19.5, 1.7, 0) looking +x (toward the back wall).
const X_MIN = 19;
const X_MAX = 29; // 10m deep — plenty of side-wall real estate for album pieces
const Z_MIN = -4;
const Z_MAX = 4;
const HEIGHT = 4.5;
const CX = (X_MIN + X_MAX) / 2;
const CZ = (Z_MIN + Z_MAX) / 2;
const WIDTH_Z = Z_MAX - Z_MIN;
const DEPTH_X = X_MAX - X_MIN;

// Real media endpoints
const SPOTIFY_SRC =
  "https://open.spotify.com/embed/artist/5g9KSIefKirB7JMpZvTNw5?utm_source=generator&theme=0";
const YT_1 = "CpkCMAmhHc8";
const YT_2 = "ju3vv4EiEW0";
const YT_3 = "F51zQmvtruE";
const APPLE_URL = "https://music.apple.com/us/artist/manny-baby/1131992992";


// Procedural marble — cream base with layered veining. Canvas-generated so
// we don't need a texture asset on disk. Tiles seamlessly.
function createMarbleTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Pure white base (Carrara-style)
  ctx.fillStyle = "#f7f7f9";
  ctx.fillRect(0, 0, size, size);

  // Cool grey veining
  for (let i = 0; i < 70; i++) {
    const opacity = 0.06 + Math.random() * 0.2;
    ctx.strokeStyle = `rgba(140, 142, 155, ${opacity})`;
    ctx.lineWidth = 0.4 + Math.random() * 1.6;
    ctx.beginPath();
    let x = Math.random() * size;
    let y = Math.random() * size;
    ctx.moveTo(x, y);
    for (let j = 0; j < 40; j++) {
      x += (Math.random() - 0.5) * 35;
      y += (Math.random() - 0.5) * 35;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Subtle cool speckle for tactile grain
  for (let i = 0; i < 3500; i++) {
    ctx.fillStyle = `rgba(185, 188, 200, ${Math.random() * 0.07})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Placeholder "album artwork" — solid color with a subtle radial gradient for depth.
// Swap in real JPG/PNG covers by replacing the texture prop in <AlbumPiece />.
function createAlbumTexture(baseColor: string): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.7);
  g.addColorStop(0, "rgba(255,255,255,0.15)");
  g.addColorStop(1, "rgba(0,0,0,0.3)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Modern floating frameless album panel with plaque + gallery light.
interface AlbumPieceProps {
  position: [number, number, number];
  rotation: [number, number, number];
  texture: THREE.Texture;
  label: string;
}
function AlbumPiece({ position, rotation, texture, label }: AlbumPieceProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Dark canvas-wrap panel standing 2cm off the wall */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[1.0, 1.0, 0.02]} />
        <meshStandardMaterial color="#0a0807" roughness={0.7} />
      </mesh>
      {/* Album face */}
      <mesh position={[0, 0, 0.0251]}>
        <planeGeometry args={[1.0, 1.0]} />
        <meshStandardMaterial map={texture} roughness={0.55} />
      </mesh>
      {/* Gallery picture light above */}
      <group position={[0, 0.58, 0.02]}>
        <GalleryLight width={1.0} isActive={false} />
      </group>
      {/* Gold plaque below */}
      <group position={[0, -0.65, 0.015]}>
        <mesh>
          <planeGeometry args={[0.6, 0.12]} />
          <meshStandardMaterial
            color="#c9a84c"
            emissive="#c9a84c"
            emissiveIntensity={0.15}
            metalness={0.9}
            roughness={0.35}
          />
        </mesh>
        <Text
          position={[0, 0, 0.003]}
          fontSize={0.045}
          color="#0a0807"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.22}
        >
          {label}
        </Text>
      </group>
    </group>
  );
}

interface Props {
  onOpenPanel?: (panel: string) => void;
}

export default function MusicRoom(_props: Props) {
  const wallTex = useTexture("/images/gallery/wall.jpg");
  const ceilingTex = useTexture("/images/gallery/ceiling.jpg");
  const marbleTex = useMemo(() => createMarbleTexture(), []);
  const album1Tex = useMemo(() => createAlbumTexture("#4a2d3a"), []); // burgundy
  const album2Tex = useMemo(() => createAlbumTexture("#2a3a4c"), []); // deep blue
  const album3Tex = useMemo(() => createAlbumTexture("#3a2818"), []); // warm brown
  const album4Tex = useMemo(() => createAlbumTexture("#233428"), []); // forest green

  useMemo(() => {
    wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
    ceilingTex.wrapS = ceilingTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(2, 1);
    ceilingTex.repeat.set(2, 1);
    marbleTex.repeat.set(5, 4);
  }, [wallTex, ceilingTex, marbleTex]);

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.35} color="#ffffff" />

      {/* Ceiling lights — 2×2 grid, pendant-style hanging below the ceiling */}
      {[
        [CX - 2, Z_MIN + 2],
        [CX - 2, Z_MAX - 2],
        [CX + 2, Z_MIN + 2],
        [CX + 2, Z_MAX - 2],
      ].map(([lx, lz], i) => (
        <group key={i} position={[lx, HEIGHT - 0.6, lz]}>
          {/* Thin cord from ceiling to fixture */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
            <meshStandardMaterial color="#1a1a1e" />
          </mesh>
          {/* Glowing bulb — uses meshBasicMaterial so it's always bright */}
          <mesh>
            <sphereGeometry args={[0.2, 24, 16]} />
            <meshBasicMaterial color="#fff3d8" toneMapped={false} />
          </mesh>
          {/* Outer glow shell (semi-transparent) */}
          <mesh>
            <sphereGeometry args={[0.35, 24, 16]} />
            <meshBasicMaterial color="#fff1d6" transparent opacity={0.25} toneMapped={false} />
          </mesh>
          {/* Light source */}
          <pointLight intensity={6} distance={12} color="#fff1d6" decay={1.5} />
        </group>
      ))}

      {/* Focused warm wash on the media wall */}
      <SpotLightWithTarget
        position={[X_MAX - 2.5, HEIGHT - 0.25, CZ]}
        targetPosition={[X_MAX - 0.05, 1.7, CZ]}
        intensity={10}
        angle={0.55}
        penumbra={0.9}
        distance={6}
        color="#fff1d6"
        castShadow={false}
      />

      {/* White marble floor — sized to the room footprint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CX, 0.002, CZ]} receiveShadow>
        <planeGeometry args={[DEPTH_X, WIDTH_Z]} />
        <meshStandardMaterial map={marbleTex} roughness={0.25} metalness={0.1} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[CX, HEIGHT, CZ]} receiveShadow>
        <planeGeometry args={[DEPTH_X, WIDTH_Z]} />
        <meshStandardMaterial map={ceilingTex} color="#807468" />
      </mesh>

      {/* West wall (entry side, shared with gallery east wall) — interior face */}
      <mesh position={[X_MIN, HEIGHT / 2, CZ]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[WIDTH_Z, HEIGHT]} />
        <meshStandardMaterial map={wallTex} color="#a8a4a0" />
      </mesh>

      {/* East wall (back of room — media board wall) */}
      <mesh position={[X_MAX, HEIGHT / 2, CZ]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[WIDTH_Z, HEIGHT]} />
        <meshStandardMaterial map={wallTex} color="#a8a4a0" />
      </mesh>

      {/* South wall (left from entry view) */}
      <mesh position={[CX, HEIGHT / 2, Z_MIN]} receiveShadow>
        <planeGeometry args={[DEPTH_X, HEIGHT]} />
        <meshStandardMaterial map={wallTex} color="#a8a4a0" />
      </mesh>

      {/* North wall (right from entry view) */}
      <mesh position={[CX, HEIGHT / 2, Z_MAX]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[DEPTH_X, HEIGHT]} />
        <meshStandardMaterial map={wallTex} color="#a8a4a0" />
      </mesh>

      {/* ====== ALBUM ARTWORKS — 2 per side wall ======
          Spread along the 10m side walls. Camera lands at x=21 so you can
          turn slightly to catch each piece without losing the media wall. */}
      {/* South wall (z = Z_MIN), faces +z */}
      <AlbumPiece
        position={[21, 1.7, Z_MIN + 0.02]}
        rotation={[0, 0, 0]}
        texture={album1Tex}
        label="ALBUM I"
      />
      <AlbumPiece
        position={[25.5, 1.7, Z_MIN + 0.02]}
        rotation={[0, 0, 0]}
        texture={album2Tex}
        label="ALBUM II"
      />
      {/* North wall (z = Z_MAX), faces -z */}
      <AlbumPiece
        position={[21, 1.7, Z_MAX - 0.02]}
        rotation={[0, Math.PI, 0]}
        texture={album3Tex}
        label="ALBUM III"
      />
      <AlbumPiece
        position={[25.5, 1.7, Z_MAX - 0.02]}
        rotation={[0, Math.PI, 0]}
        texture={album4Tex}
        label="ALBUM IV"
      />

      {/* ====== MEDIA BOARD — borderless, just the content ====== */}
      <group position={[X_MAX - 0.005, 2, CZ]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Media content — anchored to the back wall */}
        <Html
          center
          position={[0, -0.3, 0.008]}
          zIndexRange={[50, 0]}
          style={{ pointerEvents: "auto", userSelect: "none" }}
        >
          <div
            style={{
              width: "860px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontFamily: "system-ui, -apple-system, sans-serif",
              color: "#fff",
            }}
          >
            <iframe
              title="Spotify"
              src={SPOTIFY_SRC}
              width="100%"
              height="252"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ border: 0, display: "block", borderRadius: "6px" }}
            />
            <div style={{ display: "flex", gap: "9px", width: "100%" }}>
              {[YT_1, YT_2, YT_3].map((id) => (
                <iframe
                  key={id}
                  title={`YT ${id}`}
                  width="100%"
                  height="160"
                  src={`https://www.youtube-nocookie.com/embed/${id}`}
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  style={{ border: 0, display: "block", borderRadius: "5px", flex: 1, minWidth: 0 }}
                />
              ))}
            </div>
            <a
              href={APPLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                alignSelf: "center",
                padding: "11px 28px",
                borderRadius: "4px",
                background: "linear-gradient(180deg, #14110b 0%, #0a0806 100%)",
                border: "1px solid rgba(201,168,76,0.38)",
                color: "#e8c56a",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
              }}
            >
              Listen on Apple Music
            </a>
          </div>
        </Html>
      </group>

    </group>
  );
}
