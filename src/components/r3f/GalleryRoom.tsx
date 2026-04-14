"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import { useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import { TDSLoader } from "three/examples/jsm/loaders/TDSLoader.js";
import { Project } from "../gallery/ProjectModal";
import WallArtwork from "./WallArtwork";
import SpotLightWithTarget from "./SpotLightWithTarget";
import { DiamondPedestal, EnvelopePedestal, PhonePedestal, ConnectPedestal } from  "./ServicePedestal";

/* ------------------------------------------------------------------ */
/*  STOPS — narrative order, spatial positions                         */
/* ------------------------------------------------------------------ */

export interface GalleryStop {
  pos: [number, number, number];
  lookAt: [number, number, number];
  label: string;
  tier: 1 | 2 | 3; // timing tier
}

const EW = 3;
const GW = 2.5;
const GZ = -1.5;

// New narrative order:
// 1-3: Hero (WiggleWoo, Goat, Gallery overview)
// 4-6: Client/creative (Carla, JB TV, Lush Brows)
// 7-9: Tools/systems (RetroRack, Extension, Bottor Assist)
// 10-11: Brand/media (By Any Means, RetroRack Logo)
// 12: Character (WiggleWoo Character)
// 13: Closing (Book)

export const STOPS: GalleryStop[] = [
  { pos: [0, 1.7, 0.5],      lookAt: [0, 1.7, -1],           label: "WiggleWoo's Word Quest", tier: 1 },
  { pos: [1.5, 1.7, -1.0],   lookAt: [5, 1.7, GZ],           label: "Main Gallery",          tier: 1 },
  // Client/creative — top wall
  { pos: [6, 1.7, GZ],       lookAt: [6, 1.7, GZ + GW],      label: "Carla's Creation",      tier: 3 },
  { pos: [7, 1.7, GZ],       lookAt: [7, 1.7, GZ - GW],      label: "JB TV",                 tier: 3 },
  { pos: [8, 1.7, GZ],       lookAt: [8, 1.7, GZ + GW],      label: "Lush Brows",            tier: 3 },
  // Tools — bottom wall
  { pos: [9, 1.7, GZ],       lookAt: [9, 1.7, GZ - GW],      label: "RetroRack",             tier: 2 },
  // Goat — camera pulls back, raised higher, looking down at the statue
  { pos: [8.5, 2.4, GZ + 1.2], lookAt: [10, 0.6, GZ],        label: "The Standard",          tier: 1 },
  { pos: [10.5, 1.7, GZ],    lookAt: [10.5, 1.7, GZ + GW],   label: "RetroRack Logo",        tier: 2 },
  { pos: [11.5, 1.7, GZ],    lookAt: [11.5, 1.7, GZ - GW],   label: "Bottor Assist",         tier: 1 },
  // Brand
  { pos: [12.5, 1.7, GZ],    lookAt: [12.5, 1.7, GZ + GW],   label: "By Any Means",          tier: 3 },
  { pos: [14, 1.7, GZ],      lookAt: [14, 1.7, GZ - GW],     label: "RetroRack Extension",   tier: 3 },
  // Character
  { pos: [15.5, 1.7, GZ],    lookAt: [15.5, 1.7, GZ + GW],   label: "WiggleWoo Character",   tier: 3 },
  // Closing
  { pos: [16.5, 1.7, GZ],    lookAt: [19, 1.9, GZ],          label: "Professor WiggleWoo",   tier: 1 },
  // Service pedestals — last stop before loop restarts
  { pos: [14, 3.2, GZ + 1.5], lookAt: [17.5, 0.4, GZ],        label: "Services",              tier: 2 },
];

const LAST = STOPS.length - 1;

/* ------------------------------------------------------------------ */
/*  ARTWORK DATA — repositioned to match narrative stop order          */
/* ------------------------------------------------------------------ */

interface ArtworkDef {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  frame: "square" | "landscape" | "portrait";
  project: Project;
}

const ARTWORKS: ArtworkDef[] = [
  // Entry — WiggleWoo
  { position: [0, 1.95, -1], rotation: [0, 0, 0], width: 1.7, frame: "landscape",
    project: { title: "WiggleWoo's Word Quest", category: "Featured Exhibit", image: "/images/ipad-game-view.png",
      description: "An interactive reading game designed for early learners. Players tap letters to form words, move through themed environments, and build real reading skills through play.",
      tags: ["Interactive", "Phonics", "Early Reading"], link: "https://wigglewoo.app", linkLabel: "Join Waitlist" }},

  // TOP WALL — narrative order: Carla, Lush Brows, Extension, By Any Means, WiggleWoo Character
  { position: [6, 1.85, GZ + GW], rotation: [0, Math.PI, 0], width: 0.85, frame: "portrait",
    project: { title: "Carla's Creation", category: "Branding", image: "/images/carlas-creation.png",
      description: "Brand identity crafted with a personal, refined touch.",
      tags: ["Branding", "Identity", "Design"] }},
  { position: [8, 1.85, GZ + GW], rotation: [0, Math.PI, 0], width: 0.9, frame: "square",
    project: { title: "Lush Brows", category: "Logo", image: "/images/lush-brows-logo.png",
      description: "A clean, refined mark that reflects elegance and care.",
      tags: ["Logo", "Beauty", "Identity"] }},
  { position: [10.5, 1.9, GZ + GW], rotation: [0, Math.PI, 0], width: 1.0, frame: "square",
    project: { title: "RetroRack Logo", category: "Logo", image: "/images/retro-rack-logo.png",
      description: "Brand mark channeling the warmth of retro hardware.",
      tags: ["Logo", "Brand Mark", "Tech"], link: "https://retrorack.app/", linkLabel: "Visit RetroRack" }},
  { position: [12.5, 1.9, GZ + GW], rotation: [0, Math.PI, 0], width: 1.0, frame: "square",
    project: { title: "By Any Means", category: "Logo", image: "/images/By-any-means-logo.png",
      description: "Logo and identity design built to feel confident, focused, and bold.",
      tags: ["Logo", "Brand Mark", "Identity"] }},
  { position: [15.5, 1.9, GZ + GW], rotation: [0, Math.PI, 0], width: 0.85, frame: "portrait",
    project: { title: "WiggleWoo Character", category: "Character Design", image: "/images/Wiggle-Woo-Character.png",
      description: "Original character design for WiggleWoo's Word Quest.",
      tags: ["Character Design", "Illustration"], link: "https://wigglewoo.app", linkLabel: "Visit WiggleWoo" }},

  // BOTTOM WALL — JB TV, RetroRack, Bottor Assist, RetroRack Logo
  { position: [7, 1.95, GZ - GW], rotation: [0, 0, 0], width: 1.2, frame: "square",
    project: { title: "JB TV", category: "Graphics", image: "/images/jb-tv.png",
      description: "Visual graphics and branding for JB TV.",
      tags: ["Graphics", "Branding", "Identity"] }},
  { position: [9, 1.9, GZ - GW], rotation: [0, 0, 0], width: 1.1, frame: "landscape",
    project: { title: "RetroRack.app", category: "Web Application", image: "/images/retrorack-web-app.png",
      description: "A web based platform for collecting, organizing, and showcasing retro tech.",
      tags: ["Web App", "React", "Full Stack"], link: "https://retrorack.app/", linkLabel: "Visit RetroRack" }},
  { position: [11.5, 1.9, GZ - GW], rotation: [0, 0, 0], width: 1.0, frame: "landscape",
    project: { title: "Bottor Assist", category: "AI Powered Tool", image: "/images/bottor-assist.png",
      description: "An intelligent assistant platform designed to streamline workflows and automate repetitive tasks.",
      tags: ["AI", "Automation", "Productivity"], link: "https://bottor-assist-xxxxx.lovable.app/", linkLabel: "Explore Bottor Assist" }},
  { position: [14, 1.85, GZ - GW], rotation: [0, 0, 0], width: 1.0, frame: "landscape",
    project: { title: "RetroRack Extension", category: "Chrome Extension", image: "/images/retrorack-extension.jpg",
      description: "The companion browser extension for RetroRack.",
      tags: ["Chrome Extension", "Browser Tool"],
      link: "https://chromewebstore.google.com/detail/dmofdijhloefhkhheimljfjchccgnhgf?utm_source=item-share-cb", linkLabel: "Get the Extension" }},

  // End wall — Book
  { position: [19, 2.0, GZ], rotation: [0, -Math.PI / 2, 0], width: 1.2, frame: "portrait",
    project: { title: "Professor WiggleWoo", category: "Featured Publication", image: "/images/book-cover.jpg",
      description: "A creative and imaginative story that brings wonder, learning, and fun to readers of all ages. This is more than a book. It is the beginning of a universe.",
      tags: ["Published", "Children's Literature", "Education"], link: "https://a.co/d/0di3W4os", linkLabel: "Buy on Amazon" }},
];

/* ------------------------------------------------------------------ */
/*  GOAT STATUE                                                        */
/* ------------------------------------------------------------------ */

function GoatStatue({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  const originalModel = useLoader(TDSLoader, "/images/r--goat.3ds");
  const marbleTex = useTexture("/images/gallery/floor.png");
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const model = useMemo(() => {
    const clone = originalModel.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.material = new THREE.MeshStandardMaterial({
          color: "#c9a84c",
          metalness: 0.85,
          roughness: 0.2,
        });
      }
    });
    return clone;
  }, [originalModel]);

  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(originalModel);
    const size = new THREE.Vector3();
    box.getSize(size);
    const bodyLength = Math.max(size.x, size.z);
    return 0.55 / bodyLength;
  }, [originalModel]);

  return (
    <group position={position}>
      <SpotLightWithTarget position={[0, 3.4, 0]} targetPosition={[position[0], 0.8, position[2]]} intensity={45} angle={0.5} penumbra={0.45} distance={10} castShadow />
      <pointLight position={[0.3, 2.2, 0.6]} intensity={2.5} distance={4} color="#ffe0a0" />
      <pointLight position={[-0.3, 1.5, -0.4]} intensity={1} distance={3} color="#ffd88a" />

      <mesh position={[0, 0.01, 0]} castShadow receiveShadow><boxGeometry args={[1.4, 0.02, 1.0]} /><meshStandardMaterial map={marbleTex} color="#908478" metalness={0.35} roughness={0.6} /></mesh>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow><boxGeometry args={[1.25, 0.5, 0.85]} /><meshStandardMaterial map={marbleTex} color="#908478" metalness={0.35} roughness={0.6} /></mesh>
      <mesh position={[0, 0.51, 0]} castShadow><boxGeometry args={[1.32, 0.02, 0.92]} /><meshStandardMaterial map={marbleTex} color="#a09488" metalness={0.4} roughness={0.5} /></mesh>

      <group ref={groupRef} position={[0, 0.75, 0]}>
        <primitive object={model} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} scale={hovered ? scale * 1.02 : scale} />
        <mesh position={[0, 0, 0]} onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }} onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }} onClick={(e) => { e.stopPropagation(); onClick(); }}>
          <boxGeometry args={[0.8, 0.8, 0.8]} /><meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
        </mesh>
      </group>

      {/* Hover glow */}
      {hovered && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, 0]}>
          <circleGeometry args={[0.7, 32]} />
          <meshBasicMaterial color="#c9a84c" transparent opacity={0.25} />
        </mesh>
      )}

      {/* Hover label */}
      {hovered && (
        <Html position={[0, 1.8, 0]} center style={{ pointerEvents: "none" }}>
          <div style={{
            background: "rgba(12,10,8,0.9)",
            border: "1px solid rgba(201,168,76,0.4)",
            borderRadius: "6px",
            padding: "6px 12px",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}>
            <div style={{ color: "#c9a84c", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em" }}>
              The Standard
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "9px", marginTop: "2px" }}>
              Gallery Centerpiece
            </div>
          </div>
        </Html>
      )}

      <mesh position={[0, 0.5, 0]} onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }} onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }} onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <boxGeometry args={[0.9, 1.2, 0.9]} /><meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow><circleGeometry args={[0.8, 32]} /><meshStandardMaterial color="#000000" transparent opacity={0.35} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}><circleGeometry args={[0.5, 32]} /><meshBasicMaterial color="#c9a84c" transparent opacity={0.06} /></mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

const _v3a = new THREE.Vector3();
const _v3b = new THREE.Vector3();

function lerpStops(a: GalleryStop, b: GalleryStop, t: number, outPos: THREE.Vector3, outLook: THREE.Vector3) {
  _v3a.set(...a.pos); _v3b.set(...b.pos); outPos.lerpVectors(_v3a, _v3b, t);
  _v3a.set(...a.lookAt); _v3b.set(...b.lookAt); outLook.lerpVectors(_v3a, _v3b, t);
}

function getCamera(progress: number, outPos: THREE.Vector3, outLook: THREE.Vector3) {
  const clamped = Math.max(0, Math.min(LAST, progress));
  const i = Math.floor(clamped);
  const frac = clamped - i;
  if (i >= LAST) { outPos.set(...STOPS[LAST].pos); outLook.set(...STOPS[LAST].lookAt); return; }
  lerpStops(STOPS[i], STOPS[i + 1], frac, outPos, outLook);
}

function getLabel(progress: number): string {
  if (progress >= LAST - 0.6) return STOPS[LAST].label;
  const i = Math.round(Math.max(0, Math.min(LAST, progress)));
  return STOPS[i].label;
}

/** Eased interpolation — cubic ease in-out */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

interface GalleryRoomProps {
  onSelectProject: (p: Project) => void;
  modalOpen: boolean;
  targetProgress: number;
  autoTour: boolean;
  cameraDisabled?: boolean;
  snapping?: boolean;
  onSnapDone?: () => void;
  onProgressChange: (p: number) => void;
  onLabelChange: (label: string) => void;
  onOpenPanel?: (panel: string) => void;
  onRestartLoop?: () => void;
}

export default function GalleryRoom({
  onSelectProject,
  modalOpen,
  targetProgress,
  autoTour,
  onProgressChange,
  onLabelChange,
  onOpenPanel,
  cameraDisabled = false,
  snapping = false,
  onSnapDone,
  onRestartLoop,
}: GalleryRoomProps) {
  const { camera } = useThree();

  const smoothProgress = useRef(0);
  const camPos = useRef(new THREE.Vector3(0, 1.7, 0.5));
  const camLook = useRef(new THREE.Vector3(-1.6, 1.7, -1));
  const tempPos = useRef(new THREE.Vector3());
  const [focusedLabel, setFocusedLabel] = useState("");
  const smoothLook = useRef(0);

  const wallTex = useTexture("/images/gallery/wall.png");
  const floorTex = useTexture("/images/gallery/floor.png");
  const ceilingTex = useTexture("/images/gallery/ceiling.png");

  useMemo(() => {
    [wallTex, ceilingTex, floorTex].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; });
    wallTex.repeat.set(2, 1); ceilingTex.repeat.set(3, 1); floorTex.repeat.set(4, 2);
  }, [wallTex, ceilingTex, floorTex]);

  useFrame(({ clock }) => {
    if (cameraDisabled) return;

    // Loop reset detection
    if (smoothProgress.current - targetProgress > 2) {
      smoothProgress.current = targetProgress;
      smoothLook.current = targetProgress;
    }

    // Eased position lerp
    const atStop = Math.abs(targetProgress - Math.round(targetProgress)) < 0.02;
    const posLerp = snapping ? 0.12 : (atStop ? 0.06 : 0.025);
    smoothProgress.current += (targetProgress - smoothProgress.current) * posLerp;
    if (Math.abs(smoothProgress.current - targetProgress) < 0.01) {
      smoothProgress.current = targetProgress;
      if (snapping) onSnapDone?.();
    }

    // Eased lookAt lerp
    const lookLerp = snapping ? 0.15 : 0.07;
    smoothLook.current += (targetProgress - smoothLook.current) * lookLerp;
    if (Math.abs(smoothLook.current - targetProgress) < 0.01) smoothLook.current = targetProgress;

    // Camera position
    getCamera(smoothProgress.current, camPos.current, camLook.current);
    camera.position.copy(camPos.current);

    // Micro drift during hold — very subtle breathing motion
    const moveDelta = Math.abs(targetProgress - smoothProgress.current);
    if (moveDelta < 0.05 && !snapping) {
      const t = clock.getElapsedTime();
      camera.position.x += Math.sin(t * 0.2) * 0.008;
      camera.position.y += Math.cos(t * 0.15) * 0.004;
    }

    // LookAt
    getCamera(smoothLook.current, tempPos.current, camLook.current);
    camera.lookAt(camLook.current);

    onProgressChange(smoothProgress.current / LAST);
    const label = getLabel(smoothLook.current);
    onLabelChange(label);
    setFocusedLabel(moveDelta < 0.2 ? label : "");
  });

  const wc = "#a8a4a0";
  const H = 3.6;

  return (
    <>
      <ambientLight intensity={1.5} color="#fff0dd" />
      <hemisphereLight intensity={0.9} color="#ffe8cc" groundColor="#3a2a18" />
      <fog attach="fog" args={["#1a1a1a", 12, 40]} />

      {/* Floor — subtle metallic */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8, 0, 0]} receiveShadow>
        <planeGeometry args={[35, 15]} />
        <meshStandardMaterial map={floorTex} color="#908478" metalness={0.4} roughness={0.55} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[8, H, 0]}>
        <planeGeometry args={[35, 15]} />
        <meshStandardMaterial map={ceilingTex} color="#807468" />
      </mesh>

      {/* Entry chamber */}
      <mesh position={[0, H / 2, 2]}><planeGeometry args={[EW * 2, H]} /><meshStandardMaterial color="#4a4440" /></mesh>
      <mesh position={[-EW, H / 2, 0.5]} receiveShadow><planeGeometry args={[3.5, H]} /><meshStandardMaterial map={wallTex} color={wc} /></mesh>
      <mesh position={[EW, H / 2, 1.2]} rotation={[0, Math.PI, 0]} receiveShadow><planeGeometry args={[2, H]} /><meshStandardMaterial map={wallTex} color={wc} /></mesh>
      {/* Display wall — centered, with opening on right side for gallery access */}
      <mesh position={[-0.5, H / 2, -1]} receiveShadow><planeGeometry args={[4.5, H]} /><meshStandardMaterial map={wallTex} color={wc} /></mesh>
      <mesh position={[-0.5, H / 2, -1]} rotation={[0, Math.PI, 0]}><planeGeometry args={[4.5, H]} /><meshStandardMaterial map={wallTex} color={wc} /></mesh>

      {/* Main gallery */}
      <mesh position={[10, H / 2, GZ + GW]} rotation={[0, Math.PI, 0]} receiveShadow><planeGeometry args={[20, H]} /><meshStandardMaterial map={wallTex} color={wc} /></mesh>
      <mesh position={[10, H / 2, GZ - GW]} receiveShadow><planeGeometry args={[20, H]} /><meshStandardMaterial map={wallTex} color={wc} /></mesh>
      <mesh position={[19, H / 2, GZ]} rotation={[0, -Math.PI / 2, 0]} receiveShadow><planeGeometry args={[GW * 2, H]} /><meshStandardMaterial map={wallTex} color={wc} /></mesh>

      {/* Track rails */}
      <mesh position={[0, H - 0.08, 0.5]}><boxGeometry args={[0.025, 0.025, 3.5]} /><meshStandardMaterial color="#222" metalness={0.7} roughness={0.4} /></mesh>
      <mesh position={[10, H - 0.08, GZ]}><boxGeometry args={[20, 0.025, 0.025]} /><meshStandardMaterial color="#222" metalness={0.7} roughness={0.4} /></mesh>

      {/* Spotlights — entry */}
      <group>
        <mesh position={[0, H - 0.15, 0.8]}><cylinderGeometry args={[0.04, 0.06, 0.1, 8]} /><meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} /></mesh>
        <pointLight position={[0, H - 0.25, 0.8]} intensity={2.5} distance={5} color="#ffd88a" />
        <SpotLightWithTarget position={[0, H - 0.2, 0.8]} targetPosition={[0, 1.8, -1]} intensity={25} angle={0.55} penumbra={0.65} distance={8} />
      </group>
      <SpotLightWithTarget position={[0, H - 0.2, 0.3]} targetPosition={[-EW + 0.2, 1.6, 0.8]} intensity={18} angle={0.6} penumbra={0.7} distance={8} />
      <SpotLightWithTarget position={[0, H - 0.2, 0.3]} targetPosition={[EW - 0.2, 1.6, 0.8]} intensity={18} angle={0.6} penumbra={0.7} distance={8} />

      {/* Spotlights — gallery (slight random rotation for realism) */}
      {[3, 5.5, 8, 10.5, 13, 15.5, 17.5].map((x, i) => (
        <group key={`lg-${i}`}>
          <mesh position={[x, H - 0.15, GZ]} rotation={[0, 0, (i % 3 - 1) * 0.04]}>
            <cylinderGeometry args={[0.04, 0.06, 0.1, 8]} /><meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
          </mesh>
          <pointLight position={[x, H - 0.25, GZ]} intensity={2} distance={5} color="#ffd88a" />
          <SpotLightWithTarget position={[x, H - 0.2, GZ]} targetPosition={[x, 1.5, i % 2 === 0 ? GZ + GW - 0.3 : GZ - GW + 0.3]} intensity={20} angle={0.65} penumbra={0.7} distance={10} />
        </group>
      ))}
      <SpotLightWithTarget position={[17, H - 0.2, GZ]} targetPosition={[18.9, 1.5, GZ]} intensity={28} angle={0.45} penumbra={0.6} />
      <pointLight position={[17.5, H - 0.25, GZ]} intensity={3} distance={6} color="#ffd88a" />

      {/* Goat statue — centered in the middle of the gallery corridor */}
      <GoatStatue position={[10, 0, GZ]} onClick={() => onOpenPanel?.("studio")} />

      {/* Service pedestals — row across end of gallery */}
      <ConnectPedestal position={[17.5, 0, GZ + 1.2]} onClick={() => onOpenPanel?.("connect")} />
      <DiamondPedestal position={[17.5, 0, GZ + 0.4]} onClick={() => onOpenPanel?.("enterprise")} />
      <EnvelopePedestal position={[17.5, 0, GZ - 0.4]} onClick={() => onOpenPanel?.("contact")} />
      <PhonePedestal position={[17.5, 0, GZ - 1.2]} onClick={() => onOpenPanel?.("book")} />

      {/* Artworks */}
      {ARTWORKS.map((art) => {
        const isFocused = !cameraDisabled && focusedLabel === art.project.title;
        return (
          <WallArtwork key={art.project.title} position={art.position} rotation={art.rotation} width={art.width} frameType={art.frame} project={art.project} onClick={() => onSelectProject(art.project)} isActive={isFocused} />
        );
      })}

    </>
  );
}
