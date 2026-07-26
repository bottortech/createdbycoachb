"use client";

import { useTexture, Html, Text } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import SpotLightWithTarget from "./SpotLightWithTarget";

// Piece indices — the remote navigates through these in left-to-right order.
// The two TV indices are exported so power logic can target the selected TV.
export const MUSIC_ROOM_PIECE_COUNT = 7;
export const MUSIC_ROOM_LEFT_TV_IDX = 2;
export const MUSIC_ROOM_RIGHT_TV_IDX = 4;

// Room bounds — sits directly behind gallery east wall (x = 19). Deep enough
// that the back wall never fills the viewport at any browser aspect ratio.
// Camera enters at (19.5, 1.7, 0) looking +x (toward the back wall).
const X_MIN = 19;
const X_MAX = 34; // 15m deep — back wall pushed further so the camera at x=21
                  //           has plenty of room between entry and media board
const Z_MIN = -6;
const Z_MAX = 6;  // 12m wide — open lounge feel
const HEIGHT = 4.5;
const CX = (X_MIN + X_MAX) / 2;
const CZ = (Z_MIN + Z_MAX) / 2;
const WIDTH_Z = Z_MAX - Z_MIN;
const DEPTH_X = X_MAX - X_MIN;

// Real media endpoints — exported so the mobile 2D overlay in GalleryScene
// can reuse the same sources without hard-coding them twice.
export const SPOTIFY_SRC =
  "https://open.spotify.com/embed/artist/5g9KSIefKirB7JMpZvTNw5?utm_source=generator&theme=0";
// YouTube clips — shown on the two hanging flatscreens flanking the room.
export const TV_LEFT_YT = "CpkCMAmhHc8";
export const TV_RIGHT_YT = "ju3vv4EiEW0";
// const YT_3 = "F51zQmvtruE";
export const APPLE_URL = "https://music.apple.com/us/artist/manny-baby/1131992992";

// Build a YouTube embed URL. Videos start paused and muted; the in-scene
// remote's power button drives play/pause + mute/unmute via the JS API.
function ytEmbedUrl(id: string) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const params = new URLSearchParams({
    autoplay: "0",
    mute: "1",
    loop: "1",
    playlist: id,
    controls: "1",
    modestbranding: "1",
    rel: "0",
    playsinline: "1",
    enablejsapi: "1",
    ...(origin ? { origin } : {}),
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

// Send a command to a YouTube iframe via postMessage. Requires enablejsapi=1
// on the src. Safe no-op if the iframe hasn't loaded yet.
function sendYtCommand(
  iframe: HTMLIFrameElement | null,
  func: "playVideo" | "pauseVideo" | "mute" | "unMute"
) {
  if (!iframe || !iframe.contentWindow) return;
  const msg = JSON.stringify({ event: "command", func, args: "" });
  iframe.contentWindow.postMessage(msg, "*");
}


// Procedural marble — cream base with layered veining. Canvas-generated so
// we don't need a texture asset on disk. Tiles seamlessly.
function createMarbleTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Warm white base (Calacatta-style)
  ctx.fillStyle = "#faf8f2";
  ctx.fillRect(0, 0, size, size);

  // Rich gold veining — varied thickness and opacity for natural layering
  for (let i = 0; i < 75; i++) {
    const opacity = 0.08 + Math.random() * 0.28;
    // Alternate between deep warm gold and a lighter champagne highlight
    const gold = Math.random() > 0.35 ? [176, 140, 56] : [214, 182, 104];
    ctx.strokeStyle = `rgba(${gold[0]}, ${gold[1]}, ${gold[2]}, ${opacity})`;
    ctx.lineWidth = 0.4 + Math.random() * 1.8;
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

  // Subtle warm speckle for tactile grain
  for (let i = 0; i < 3500; i++) {
    ctx.fillStyle = `rgba(210, 180, 120, ${Math.random() * 0.08})`;
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

// Framed album display — dark canvas-wrap backboard, flat gilt border plate,
// and the album artwork on top. No external gallery light — the frame picks
// up the room's ambient + spot wash.
interface AlbumPieceProps {
  position: [number, number, number];
  rotation: [number, number, number];
  texture: THREE.Texture;
  label: string;
  onClick?: () => void;
}
function AlbumPiece({ position, rotation, texture, label, onClick }: AlbumPieceProps) {
  const W = 1.4; // outer frame width
  const H = 1.4; // outer frame height
  const FRAME = 0.09; // visible gilt border thickness
  const ART = W - FRAME * 2; // inner artwork dimension

  return (
    <group position={position} rotation={rotation}>
      {/* Dark back board — sits 1cm off the wall */}
      <mesh position={[0, 0, 0.01]} castShadow>
        <boxGeometry args={[W + 0.04, H + 0.04, 0.02]} />
        <meshStandardMaterial color="#060504" roughness={0.6} />
      </mesh>

      {/* Gilt border — flat plate slightly forward of the backboard */}
      <mesh position={[0, 0, 0.022]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#c9a84c" metalness={0.85} roughness={0.28} />
      </mesh>

      {/* Album artwork — clickable. Tapping opens a piece modal so users
          can read the title + description like main-gallery pieces. */}
      <mesh
        position={[0, 0, 0.024]}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (onClick) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <planeGeometry args={[ART, ART]} />
        <meshStandardMaterial map={texture} roughness={0.5} />
      </mesh>

      {/* Gold plaque below */}
      <group position={[0, -H / 2 - 0.13, 0.02]}>
        <mesh>
          <boxGeometry args={[0.7, 0.14, 0.012]} />
          <meshStandardMaterial
            color="#c9a84c"
            emissive="#c9a84c"
            emissiveIntensity={0.12}
            metalness={0.9}
            roughness={0.3}
          />
        </mesh>
        <Text
          position={[0, 0, 0.009]}
          fontSize={0.05}
          color="#0a0807"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.2}
        >
          {label}
        </Text>
      </group>
    </group>
  );
}

// Hanging flatscreen TV — ceiling-mounted via cable, thin black bezel, and a
// YouTube iframe embedded as the screen via Html transform mode.
interface CeilingTVProps {
  /** x/z of the TV's horizontal anchor; y is the center height of the bezel. */
  position: [number, number, number];
  /** Y rotation in radians. The TV's screen faces +Z at rotationY = 0; use
   *  -Math.PI/2 to face -X (toward the entry camera at low x). */
  rotationY: number;
  /** YouTube video ID to embed. */
  videoId: string;
  /** Ceiling height — cable runs from here down to the top of the TV. */
  ceilingY: number;
  /** Ref to the inner iframe so a parent can drive play/pause/mute via postMessage. */
  iframeRef?: React.Ref<HTMLIFrameElement>;
}
function CeilingTV({ position, rotationY, videoId, ceilingY, iframeRef }: CeilingTVProps) {
  const W = 2.5; // bezel outer width
  const H = 1.42; // bezel outer height (roughly 16:9)
  const screenInset = 0.07; // bezel thickness around the screen
  const screenW = W - screenInset * 2;
  const screenH = H - screenInset * 2;
  // Iframe is rendered at 640×360 CSS px; scale to match the screen's world size.
  const iframePxW = 640;
  const iframePxH = 360;
  const tvY = position[1];
  const cableLen = Math.max(0.15, ceilingY - (tvY + H / 2));

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Ceiling cable — from the ceiling down to the top of the TV */}
      <mesh position={[0, H / 2 + cableLen / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, cableLen, 8]} />
        <meshStandardMaterial color="#1a1a1e" />
      </mesh>
      {/* Small mount plate at the top of the TV */}
      <mesh position={[0, H / 2 + 0.015, 0]}>
        <boxGeometry args={[0.12, 0.03, 0.08]} />
        <meshStandardMaterial color="#1a1a1e" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Bezel — thin matte-black flatscreen body */}
      <mesh castShadow>
        <boxGeometry args={[W, H, 0.06]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.35} roughness={0.5} />
      </mesh>
      {/* Inset dark screen plane (shows through the iframe before it loads,
          and acts as a fallback if the iframe fails to render). */}
      <mesh position={[0, 0, 0.031]}>
        <planeGeometry args={[screenW, screenH]} />
        <meshBasicMaterial color="#050505" />
      </mesh>

      {/* YouTube embed — DOM overlay anchored to the TV's 3D center, sized
          in viewport units so it matches the bezel's projected screen area
          from the fixed entry camera. Transform mode has iframe quirks, so
          this gives us a reliable render at the cost of not tilting with
          the camera. */}
      <Html
        center
        position={[0, 0, 0.034]}
        zIndexRange={[30, 0]}
        style={{ pointerEvents: "auto", userSelect: "none" }}
      >
        <iframe
          ref={iframeRef}
          title={`TV ${videoId}`}
          src={ytEmbedUrl(videoId)}
          width={340}
          height={191}
          allow="autoplay; encrypted-media; picture-in-picture"
          loading="lazy"
          style={{
            border: 0,
            display: "block",
            borderRadius: "4px",
            background: "#050505",
          }}
        />
      </Html>
    </group>
  );
}

interface Props {
  onOpenPanel?: (panel: string) => void;
  /** Remote power state. When on AND a TV is the selected piece, that TV
   *  plays + unmutes. Otherwise both TVs are paused + muted (last frame held). */
  powerOn?: boolean;
  /** Index of the currently selected piece (0..6). See MUSIC_ROOM_*_TV_IDX. */
  currentPieceIdx?: number;
  /** Fires when an album frame is clicked. The parent surfaces this as
   *  a piece modal (same UX as main-gallery pieces). */
  onAlbumClick?: (albumIdx: number) => void;
}

export default function MusicRoom({ powerOn = false, currentPieceIdx = 3, onAlbumClick }: Props) {
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

  // TV iframe refs — driven by the remote's power button + selected piece.
  const leftTvRef = useRef<HTMLIFrameElement>(null);
  const rightTvRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Give the iframe a moment to bind its JS API listener after mount/src
    // change. Without the delay, postMessage fires before YT is listening and
    // the first power-on click does nothing.
    const t = setTimeout(() => {
      const applyState = (
        iframe: HTMLIFrameElement | null,
        shouldPlay: boolean
      ) => {
        if (shouldPlay) {
          sendYtCommand(iframe, "unMute");
          sendYtCommand(iframe, "playVideo");
        } else {
          sendYtCommand(iframe, "pauseVideo");
          sendYtCommand(iframe, "mute");
        }
      };
      applyState(
        leftTvRef.current,
        powerOn && currentPieceIdx === MUSIC_ROOM_LEFT_TV_IDX
      );
      applyState(
        rightTvRef.current,
        powerOn && currentPieceIdx === MUSIC_ROOM_RIGHT_TV_IDX
      );
    }, 200);
    return () => clearTimeout(t);
  }, [powerOn, currentPieceIdx]);

  return (
    <group>
      {/* Lighting — ambient + two invisible ceiling fills (the pendant
          bulbs were replaced with hanging flatscreens). */}
      <ambientLight intensity={0.55} color="#ffffff" />
      <pointLight
        position={[CX - 2, HEIGHT - 0.4, 0]}
        intensity={4}
        distance={14}
        color="#fff1d6"
        decay={1.5}
      />
      <pointLight
        position={[CX + 2, HEIGHT - 0.4, 0]}
        intensity={4}
        distance={14}
        color="#fff1d6"
        decay={1.5}
      />

      {/* ====== HANGING FLATSCREENS — one per side, ceiling-suspended ======
          Both hang in the room (not on walls) flanking the media board, each
          angled toward the entry camera at x≈21 so the screens face the user
          instead of presenting edge-on. */}
      <CeilingTV
        position={[27, 2.8, -3.5]}
        rotationY={-Math.PI / 2}
        videoId={TV_LEFT_YT}
        ceilingY={HEIGHT}
        iframeRef={leftTvRef}
      />
      <CeilingTV
        position={[27, 2.8, 3.5]}
        rotationY={-Math.PI / 2}
        videoId={TV_RIGHT_YT}
        ceilingY={HEIGHT}
        iframeRef={rightTvRef}
      />

      {/* ====== BACK-WALL SPEAKERS — floor-standing studio monitors ======
          Flanking the media board, one on each side of the back wall. */}
      {([-4.5, 4.5] as const).map((sz) => (
        <group key={`spk-${sz}`} position={[X_MAX - 0.2, 0, sz]}>
          {/* Base plate */}
          <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.45, 0.08, 0.45]} />
            <meshStandardMaterial color="#0a0a0a" metalness={0.4} roughness={0.55} />
          </mesh>
          {/* Cabinet */}
          <mesh position={[0, 0.85, 0]} castShadow>
            <boxGeometry args={[0.36, 1.5, 0.38]} />
            <meshStandardMaterial color="#0a0a0a" metalness={0.4} roughness={0.6} />
          </mesh>
          {/* Tweeter (top) — on the front face (-x) */}
          <mesh position={[-0.181, 1.35, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <circleGeometry args={[0.06, 24]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Woofer (mid) — larger cone below the tweeter */}
          <mesh position={[-0.181, 0.85, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <circleGeometry args={[0.13, 28]} />
            <meshStandardMaterial color="#050505" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Woofer dust cap (center) */}
          <mesh position={[-0.183, 0.85, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <circleGeometry args={[0.04, 24]} />
            <meshStandardMaterial color="#222" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Brand plate */}
          <mesh position={[-0.183, 0.4, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[0.16, 0.03]} />
            <meshStandardMaterial
              color="#c9a84c"
              emissive="#c9a84c"
              emissiveIntensity={0.18}
              metalness={0.9}
              roughness={0.3}
            />
          </mesh>
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

      {/* ====== ALBUM ARTWORKS — 2 per side wall, 4 total ======
          Both pairs mounted near the back wall so they flank the media board
          when viewed from the entry. The closer piece reads with a small pan,
          the deeper one anchors toward the corner. */}
      {/* South wall (z = Z_MIN), faces +z */}
      <AlbumPiece
        position={[29.5, 1.7, Z_MIN + 0.02]}
        rotation={[0, 0, 0]}
        texture={album1Tex}
        label="ALBUM I"
        onClick={onAlbumClick ? () => onAlbumClick(0) : undefined}
      />
      <AlbumPiece
        position={[31.5, 1.7, Z_MIN + 0.02]}
        rotation={[0, 0, 0]}
        texture={album2Tex}
        label="ALBUM II"
        onClick={onAlbumClick ? () => onAlbumClick(1) : undefined}
      />
      {/* North wall (z = Z_MAX), faces -z */}
      <AlbumPiece
        position={[29.5, 1.7, Z_MAX - 0.02]}
        rotation={[0, Math.PI, 0]}
        texture={album3Tex}
        label="ALBUM III"
        onClick={onAlbumClick ? () => onAlbumClick(2) : undefined}
      />
      <AlbumPiece
        position={[31.5, 1.7, Z_MAX - 0.02]}
        rotation={[0, Math.PI, 0]}
        texture={album4Tex}
        label="ALBUM IV"
        onClick={onAlbumClick ? () => onAlbumClick(3) : undefined}
      />

      {/* ====== MEDIA BOARD — mounted flush to the back wall ======
          The Html content is a DOM overlay; a dark 3D panel behind it gives
          the media a physical "screen" presence on the wall. */}
      <group position={[X_MAX - 0.005, 2, CZ]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Backing panel — dark glossy plate the media content sits on */}
        <mesh position={[0, -0.3, 0.003]}>
          <planeGeometry args={[5.2, 3.2]} />
          <meshStandardMaterial color="#0a0806" metalness={0.3} roughness={0.45} />
        </mesh>
        {/* Thin gilt border around the backing panel */}
        {([
          [0, 1.3, 5.3, 0.03], // top
          [0, -1.9, 5.3, 0.03], // bottom
          [-2.65, -0.3, 0.03, 3.23], // left
          [2.65, -0.3, 0.03, 3.23], // right
        ] as const).map(([px, py, bw, bh], i) => (
          <mesh key={i} position={[px, py, 0.006]}>
            <planeGeometry args={[bw, bh]} />
            <meshStandardMaterial
              color="#c9a84c"
              emissive="#c9a84c"
              emissiveIntensity={0.15}
              metalness={0.85}
              roughness={0.3}
            />
          </mesh>
        ))}
        {/* Media content anchored to the back-wall frame. Using DOM overlay
            mode (not transform) because iframes inside CSS3D have render
            quirks. Sized in viewport units so the Spotify embed roughly
            matches the frame's projected screen area from the fixed entry
            camera across typical desktop aspect ratios. */}
        {/* Spotify embed — anchored to the upper portion of the gold frame */}
        <Html
          center
          position={[0, 0, 0.012]}
          zIndexRange={[50, 0]}
          style={{ pointerEvents: "auto", userSelect: "none" }}
        >
          <iframe
            title="Spotify"
            src={SPOTIFY_SRC}
            width="100%"
            height="315"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{
              border: 0,
              display: "block",
              borderRadius: "8px",
              // Html renders this at literal CSS pixels, not scaled by 3D
              // distance — 38vw reads fine on a wide desktop viewport but
              // shrinks to a sliver on a narrow phone screen. clamp() keeps
              // it usable on mobile without ballooning past the frame on
              // desktop.
              width: "clamp(220px, 70vw, 520px)",
            }}
          />
        </Html>

        {/* Apple Music call-to-action — separate DOM anchor lower on the back
            wall so it sits visually below the Spotify media, not inside it. */}
        <Html
          center
          position={[0, -1.4, 0.012]}
          zIndexRange={[50, 0]}
          style={{ pointerEvents: "auto", userSelect: "none" }}
        >
          <a
            href={APPLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "10px 28px",
              borderRadius: "4px",
              background: "linear-gradient(180deg, #14110b 0%, #0a0806 100%)",
              border: "1px solid rgba(201,168,76,0.42)",
              color: "#e8c56a",
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              fontFamily: "system-ui, -apple-system, sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            Listen on Apple Music
          </a>
        </Html>
      </group>

    </group>
  );
}
