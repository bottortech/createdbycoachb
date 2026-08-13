"use client";

import { useRef, useMemo, useState, useEffect, type RefObject } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import { useTexture, Html, Text, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import dynamic from "next/dynamic";
import { TDSLoader } from "three/examples/jsm/loaders/TDSLoader.js";
import { Project } from "../gallery/ProjectModal";
import { getProject } from "@/data/projects";
import WallArtwork from "./WallArtwork";
import SpotLightWithTarget from "./SpotLightWithTarget";
import HiddenLetter from "./HiddenLetter";
import { DiamondPedestal, EnvelopePedestal, PhonePedestal, ConnectPedestal } from  "./ServicePedestal";
import type { CharacterOutState } from "./CharacterController";

// Lazy-loaded — not bundled with initial gallery payload
const MusicRoom = dynamic(() => import("./MusicRoom"), { ssr: false });
const FoundersStudy = dynamic(() => import("./FoundersStudy"), { ssr: false });
// Tribute pieces are temporarily hidden from the site. The component
// files remain in the repo for an easy restore — re-import TributeRoom,
// TributeFrame, and TributeMedallion below, re-add their mounts in the
// JSX, restore the "In Memory" and "Memorial Pendant" STOPS, and put
// the matching entries back in GalleryMap's STOP_META.
import TechVault from "./TechVault";
const PredictionsWing = dynamic(() => import("./PredictionsWing"), { ssr: false });

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
  { pos: [0, 1.7, 1.5],      lookAt: [0, 1.7, -1],           label: "WiggleWoo's Word Quest", tier: 1 },
  { pos: [1.5, 1.7, GZ],      lookAt: [8, 1.7, GZ],           label: "Main Gallery",          tier: 1 },
  // Client Reviews — projector/testimonial view inside the main gallery.
  // x=2.4 (offset from the screen's own x=1.2) keeps the sightline clear of
  // the projector prop at (1.2,-0.8), which sits directly between a
  // dead-center approach and the screen. z=-0.2 (pulled back from the
  // original z=0.8) gives the boom camera real clearance from the entry
  // chamber's accent wall — the original spot left only ~0.1-0.3 units,
  // too tight for any 3rd-person distance to show the screen instead of
  // the character's own body filling the frame.
  { pos: [2.4, 2.2, -0.2],   lookAt: [1.2, 1.72, -3.8],      label: "Client Reviews",        tier: 2 },
  // AI Predictions Wing — south alcove branching off the gallery at z=-4, x=-3.5..-1.5 doorway.
  // Camera sits north of doorway, elevated, looking south into the alcove.
  { pos: [-2.5, 2.5, -3.5],   lookAt: [-2.5, 1.0, -7],        label: "AI Predictions Wing",   tier: 2 },
  // Alcove-interior stop — narrative step-in-closer beat only (arrow-key
  // walk / auto-tour). "__" prefix hides it from the main Gallery Map, same
  // as the Tech Vault case stops below; individual predictions are browsed
  // via the wing's own PredictionsMap, never their own nav entry (see
  // insidePredictionsWing in GalleryScene.tsx) — this one stop no longer
  // ties to a single prediction now that the archive has more than one.
  { pos: [-2.5, 1.7, -6],     lookAt: [-2.5, 1.7, -8.5],      label: "__predictions_alcove", tier: 3 },
  // Gallery II — west wing (visited after predictions alcove)
  { pos: [-2, 1.7, GZ],      lookAt: [-16, 1.7, GZ],          label: "Gallery II",            tier: 1 },
  // Tech Vault — side alcove branching off the bottom wall at the x=3..5 doorway.
  // Camera sits in the gallery just north of the widened doorway, elevated (y=2.5)
  // so the sight-line clears the lintel (y=2.6) and frames all 7 vitrines through the opening.
  { pos: [4, 2.5, -3.5],     lookAt: [4, 1.0, -9],           label: "Tech Vault",            tier: 2 },
  // Vision Minds Entertainment — top wall, between the entrance and the
  // Carla's Creation narrative run (matches the ARTWORKS entry's position).
  { pos: [3, 1.7, GZ],       lookAt: [3, 1.7, GZ + GW],       label: "Vision Minds Entertainment", tier: 3 },
  // Client/creative — top wall
  { pos: [6, 1.7, GZ],       lookAt: [6, 1.7, GZ + GW],      label: "Carla's Creation",      tier: 3 },
  { pos: [7, 1.7, GZ],       lookAt: [7, 1.7, GZ - GW],      label: "JB TV",                 tier: 3 },
  { pos: [8, 1.7, GZ],       lookAt: [8, 1.7, GZ + GW],      label: "Lush Brows",            tier: 3 },
  // Tools — bottom wall
  { pos: [9, 1.7, GZ],       lookAt: [9, 1.7, GZ - GW],      label: "RetroRack",             tier: 2 },
  // Goat — camera pulls back, raised higher, looking down at the statue
  { pos: [8.5, 2.4, GZ + 1.2], lookAt: [10, 0.6, GZ],        label: "The Standard",          tier: 1 },
  // z pulled north from GZ to -0.5 — the goat statue's footprint (x:9.3..10.7,
  // z:-2..-1) reaches almost exactly to this stop's original position, so
  // literally every approach (including the plain adjacent step from "The
  // Standard") clipped it. -0.5 sits outside the goat's z-range entirely.
  { pos: [10.5, 1.7, -0.5],  lookAt: [10.5, 1.7, GZ + GW],   label: "RetroRack Logo",        tier: 2 },
  { pos: [11.5, 1.7, GZ],    lookAt: [11.5, 1.7, GZ - GW],   label: "Bottor Assist",         tier: 1 },
  // Brand
  { pos: [12.5, 1.7, GZ],    lookAt: [12.5, 1.7, GZ + GW],   label: "By Any Means",          tier: 3 },
  { pos: [14, 1.7, GZ],      lookAt: [14, 1.7, GZ - GW],     label: "RetroRack Extension",   tier: 3 },
  // Character
  { pos: [15.5, 1.7, GZ],    lookAt: [15.5, 1.7, GZ + GW],   label: "WiggleWoo Character",   tier: 3 },
  // Closing
  { pos: [16.5, 1.7, GZ],    lookAt: [19, 1.9, GZ],          label: "Professor WiggleWoo",   tier: 1 },
  // Service pedestals — last auto-tour stop
  { pos: [14, 2.8, GZ],       lookAt: [17.5, 0.5, GZ],        label: "Services",              tier: 2 },
  // HIDDEN — portal approach on the east end wall. Reachable only by scrolling past Services.
  { pos: [17, 1.7, 0],        lookAt: [19, 1.85, 0],          label: "",                      tier: 3 },
  // HIDDEN — Tech Vault case stops (reachable only via the Tech Vault map).
  // Back row (z=-10), left → right
  { pos: [2, 1.5, -8.5],      lookAt: [2, 1.3, -10],          label: "__vault_backend",       tier: 3 },
  { pos: [4, 1.5, -8.5],      lookAt: [4, 1.3, -10],          label: "__vault_aicore",        tier: 3 },
  { pos: [6, 1.5, -8.5],      lookAt: [6, 1.3, -10],          label: "__vault_frontend",      tier: 3 },
  // Front row (z=-7.5, pushed back), left → right — camera stays 1.5m in front
  { pos: [1.5, 1.5, -9],      lookAt: [1.5, 1.3, -7.5],       label: "__vault_devtools",      tier: 3 },
  { pos: [3, 1.5, -9],        lookAt: [3, 1.3, -7.5],         label: "__vault_payments",      tier: 3 },
  { pos: [4.5, 1.5, -9],      lookAt: [4.5, 1.3, -7.5],       label: "__vault_gamedev",       tier: 3 },
  { pos: [6, 1.5, -9],        lookAt: [6, 1.3, -7.5],         label: "__vault_automation",    tier: 3 },
  // HIDDEN — routing waypoint only (see getWaypointRoute in GalleryScene.tsx).
  // The Entry Chamber's thin display panel (x:-0.95..0.95, z≈-1) sits between
  // the near-entrance corridor stops and the AI Predictions Wing doorway
  // (which is west, x=-2.5). A straight line from the entrance area technically
  // clears the panel's edge, but only by a sliver — too tight for the
  // character's own width, reading as clipping through the wall. This point
  // sits west of the panel (clear of it with real margin) and south of its
  // z-range, on the actual line toward the doorway, so routing through it
  // first keeps the character visibly walking around the wall instead of
  // grazing past it — and since it's the same side the destination is
  // already on, this adds no detour.
  { pos: [-3, 1.8, -2],       lookAt: [-2.5, 1.7, -3.5],      label: "__bypass_panel_west",   tier: 3 },
  // HIDDEN — routing waypoints only. The goat statue (x:9.3..10.7, z:-2..-1)
  // sits astride the corridor's spine (GZ=-1.5) — a direct jump skipping
  // over it (e.g. Lush Brows → RetroRack Logo) cuts straight through. These
  // sit north of it on either side, at z=0.5 (clear of its z-range
  // entirely), so a west-stop → this → this → east-stop chain never crosses it.
  { pos: [9, 1.8, 0.5],       lookAt: [10, 1.7, 0],           label: "__bypass_goat_west",    tier: 3 },
  { pos: [11.5, 1.8, 0.5],    lookAt: [10, 1.7, 0],           label: "__bypass_goat_east",    tier: 3 },
];

// Last index in STOPS — used only for clamping camera interpolation bounds.
const LAST = STOPS.length - 1;

// Safe z for the character/camera at the entrance stop (STOPS[0], z=1.5) —
// matches GalleryScene's characterSpawn exactly (pz - 1.9) so every route
// into this stop lands at the identical, already-confirmed-good position.
const ENTRANCE_SAFE_Z = STOPS[0].pos[2] - 1.9;
// Auto-tour ends at Services; anything after is only reachable via manual
// navigation (scroll past Services, or the map).
export const TOUR_LAST = STOPS.findIndex((s) => s.label === "Services");
export const PORTAL_STOP = TOUR_LAST + 1;
// Vault case stops live further down in STOPS; first case is right after the
// portal approach. Keep these constants in sync with the stops below.
export const VAULT_CASE_START = PORTAL_STOP + 1;
export const VAULT_CASE_COUNT = 7;
// Routing waypoints (see getWaypointRoute in GalleryScene.tsx) — appended
// last, in this fixed order, so they never shift the offsets above.
export const BYPASS_PANEL_WEST_IDX = STOPS.length - 3;
export const BYPASS_GOAT_WEST_IDX = STOPS.length - 2;
export const BYPASS_GOAT_EAST_IDX = STOPS.length - 1;

// Portal painting position + music-room camera for the override transition.
// Portal is on the east end wall, right-of-book (z=0). The music room sits
// directly behind the east wall — camera flies through in +x direction.
export const PORTAL_PAINTING_POS: [number, number, number] = [19, 1.85, 0];
export const MUSIC_ROOM_CAMERA = {
  pos: [21, 1.7, 0] as [number, number, number],
  lookAt: [25, 1.7, 0] as [number, number, number],
};

/* ------------------------------------------------------------------ */
/*  ARTWORK DATA — repositioned to match narrative stop order          */
/* ------------------------------------------------------------------ */

interface ArtworkDef {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  frame: "square" | "landscape" | "portrait";
  project: Project;
  isPortal?: boolean;
  /** Tagged true for the left-side.png painting so clicking it opens the
   *  Founder's Study keypad instead of a project modal. */
  isStudyPortal?: boolean;
  noPlaque?: boolean;
  noLight?: boolean;
  noInteraction?: boolean;
}

const ARTWORKS: ArtworkDef[] = [
  // Entry — WiggleWoo. Category overridden to "Featured Exhibit" for the
  // opening plaque; every other field comes from the shared project data.
  { position: [0, 1.95, -1], rotation: [0, 0, 0], width: 1.7, frame: "landscape",
    project: { ...getProject("wigglewoo"), category: "Featured Exhibit" }},

  // TOP WALL — open run of bare wall from x=0 (entry) to x=6 (Carla's
  // Creation, first narrative piece below); nothing else occupies this span
  // (Tech Vault's doorway is on the opposite/bottom wall at x=3..5). Centered
  // in that gap for a prominent, balanced placement directly across from the
  // Tech Vault doorway.
  { position: [3, 1.9, GZ + GW], rotation: [0, Math.PI, 0], width: 1.3, frame: "landscape",
    project: getProject("vision-minds") },

  // TOP WALL — narrative order: Carla, Lush Brows, Extension, By Any Means, WiggleWoo Character
  { position: [6, 1.85, GZ + GW], rotation: [0, Math.PI, 0], width: 0.85, frame: "portrait",
    project: getProject("carlas-creation") },
  { position: [8, 1.85, GZ + GW], rotation: [0, Math.PI, 0], width: 0.9, frame: "square",
    project: getProject("lush-brows") },
  { position: [10.5, 1.9, GZ + GW], rotation: [0, Math.PI, 0], width: 1.0, frame: "square",
    project: getProject("retrorack-logo") },
  { position: [12.5, 1.9, GZ + GW], rotation: [0, Math.PI, 0], width: 1.0, frame: "square",
    project: getProject("by-any-means") },
  { position: [15.5, 1.9, GZ + GW], rotation: [0, Math.PI, 0], width: 0.85, frame: "portrait",
    project: getProject("wigglewoo-character") },

  // BOTTOM WALL — JB TV, RetroRack, Bottor Assist, RetroRack Logo
  { position: [7, 1.95, GZ - GW], rotation: [0, 0, 0], width: 1.2, frame: "square",
    project: getProject("jb-tv") },
  { position: [9, 1.9, GZ - GW], rotation: [0, 0, 0], width: 1.1, frame: "landscape",
    project: getProject("retrorack") },
  { position: [11.5, 1.9, GZ - GW], rotation: [0, 0, 0], width: 1.0, frame: "landscape",
    project: getProject("bottor-assist") },
  { position: [14, 1.85, GZ - GW], rotation: [0, 0, 0], width: 1.0, frame: "landscape",
    project: getProject("retrorack-extension") },

  // === East end wall cluster: left image + book + portal (evenly spaced) ===
  // Wall spans z from -4 to +1 (width 5m, centered at z = GZ = -1.5).
  // Centers at z = -3, -1.5, 0 → 1.5m between each.

  // Left image — Founder's Study scavenger-hunt portal (click opens keypad)
  { position: [19, 1.85, -3], rotation: [0, -Math.PI / 2, 0], width: 0.8, frame: "portrait",
    noPlaque: true,
    noLight: true,
    isStudyPortal: true,
    project: { title: "__leftImage", category: "", image: "/images/left-side.png",
      description: "", tags: [] }},

  // Book — centered on end wall
  { position: [19, 2.0, GZ], rotation: [0, -Math.PI / 2, 0], width: 1.2, frame: "portrait",
    project: getProject("professor-wigglewoo") },

  // Portal — chess king, right of book. Triggers the music room.
  { position: PORTAL_PAINTING_POS, rotation: [0, -Math.PI / 2, 0], width: 0.8, frame: "portrait",
    isPortal: true,
    noPlaque: true,
    noLight: true,
    project: { title: "__portal", category: "", image: "/images/right-side.png", description: "", tags: [] }},
];

/* ------------------------------------------------------------------ */
/*  PROJECTOR + TESTIMONIAL SCREEN                                     */
/* ------------------------------------------------------------------ */

// Projector in the corridor at x=2, rotation [0, PI/2, 0].
// R_y(PI/2) maps local +x → world -z, so the lens (local +x) faces the bottom wall at z=-4.
// LENS_WZ = PROJ[2] - 0.22  (local x=+0.22 → world z = PROJ_Z - 0.22)
const PROJ: [number, number, number] = [1.2, 1.52, -0.8];
const SCREEN_CENTER: [number, number, number] = [1.2, 1.78, GZ - GW + 0.002]; // bottom wall z≈-3.998
const SW = 2.3;
const SH = 1.28;
const LENS_WZ = PROJ[2] - 0.22;                         // ≈ -1.02
const BEAM_LEN = Math.abs(SCREEN_CENTER[2] - LENS_WZ);  // ≈ 2.98

function ProjectorDisplay() {
  const [slide, setSlide] = useState(0);
  const lensRef    = useRef<THREE.Mesh>(null);
  const flashingIn = useRef(false);

  useEffect(() => {
    const tick = () => {
      flashingIn.current = true;
      setTimeout(() => {
        flashingIn.current = false;
        setSlide((s) => (s + 1) % 3);
      }, 80);
    };
    const id = setInterval(tick, 6000);
    return () => clearInterval(id);
  }, []);

  useFrame((_, dt) => {
    if (lensRef.current) {
      const mat = lensRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = flashingIn.current
        ? Math.min(3.5, mat.emissiveIntensity + dt * 20)
        : Math.max(1.2, mat.emissiveIntensity - dt * 6);
    }
  });

  return (
    <>
      {/* ── Projector body on stand ─────────────────────────────── */}
      <group position={PROJ} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, -PROJ[1] / 2, 0]}>
          <cylinderGeometry args={[0.022, 0.028, PROJ[1], 8]} />
          <meshStandardMaterial color="#1a1a28" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0, -PROJ[1] + 0.008, 0]}>
          <boxGeometry args={[0.26, 0.014, 0.26]} />
          <meshStandardMaterial color="#111118" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.36, 0.2, 0.24]} />
          <meshStandardMaterial color="#131320" metalness={0.3} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.36, 0.007, 0.24]} />
          <meshStandardMaterial color="#1e1e32" metalness={0.6} roughness={0.4} />
        </mesh>
        {[-0.06, 0.0, 0.06].map((oz, i) => (
          <mesh key={i} position={[0.04, 0.098, oz]}>
            <boxGeometry args={[0.1, 0.004, 0.009]} />
            <meshStandardMaterial color="#2a2a45" />
          </mesh>
        ))}
        <mesh position={[-0.13, 0.05, 0.1]}>
          <sphereGeometry args={[0.011, 8, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2.5} />
        </mesh>
        <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.066, 0.015, 12, 24]} />
          <meshStandardMaterial color="#2a2a40" metalness={0.85} roughness={0.15} />
        </mesh>
        <mesh position={[0.205, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.074, 0.007, 8, 24]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh ref={lensRef} position={[0.222, 0, 0]}>
          <sphereGeometry args={[0.054, 20, 20]} />
          <meshStandardMaterial color="#c0a8ff" emissive="#7a45e8" emissiveIntensity={1.2} metalness={0.95} roughness={0.05} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0.225, 0.01, -0.01]}>
          <sphereGeometry args={[0.016, 8, 8]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} transparent opacity={0.75} />
        </mesh>
      </group>

      {/* ── Beam ────────────────────────────────────────────────── */}
      <group position={[PROJ[0], (PROJ[1] + SCREEN_CENTER[1]) / 2, (LENS_WZ + SCREEN_CENTER[2]) / 2]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[SW / 2 + 0.12, 0.06, BEAM_LEN, 16, 1, true]} />
          <meshBasicMaterial color="#9070e0" transparent opacity={0.032} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[SW / 3, 0.025, BEAM_LEN, 12, 1, true]} />
          <meshBasicMaterial color="#b090ff" transparent opacity={0.055} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>


      <SpotLightWithTarget position={[PROJ[0], PROJ[1], LENS_WZ]} targetPosition={SCREEN_CENTER} intensity={10} angle={0.46} penumbra={0.45} distance={6} castShadow={false} />

      {/* ── Metallic plaque above the screen ───────────────────── */}
      <group position={[SCREEN_CENTER[0], SCREEN_CENTER[1] + SH / 2 + 0.11, SCREEN_CENTER[2] + 0.003]}>
        <mesh>
          <boxGeometry args={[0.72, 0.072, 0.014]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.92} roughness={0.12} />
        </mesh>
        <Text position={[0, 0, 0.008]} fontSize={0.032} color="#fff8e0" letterSpacing={0.38} anchorX="center" anchorY="middle">
          CLIENT REVIEWS
        </Text>
      </group>

      {/* ── Wall screen ─────────────────────────────────────────── */}
      <group position={SCREEN_CENTER} rotation={[0, 0, 0]}>
        {/* Gold frame */}
        <mesh position={[0, 0, -0.018]}>
          <boxGeometry args={[SW + 0.08, SH + 0.08, 0.018]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.82} roughness={0.18} />
        </mesh>
        {/* Screen surface */}
        <mesh>
          <planeGeometry args={[SW, SH]} />
          <meshStandardMaterial color="#05061a" emissive="#0c0d2c" emissiveIntensity={0.55} />
        </mesh>
        <pointLight position={[0, 0, 0.4]} intensity={1.4} distance={3} color="#a090dd" />

        {/* ── Slide 0: Title ───────────────────────────────────── */}
        <group visible={slide === 0}>
          <Text position={[0, 0.24, 0.005]} fontSize={0.042} color="#b49aff" letterSpacing={0.5} textAlign="center" anchorX="center" anchorY="middle">
            CLIENT TESTIMONIALS
          </Text>
          <mesh position={[0, 0.1, 0.004]}>
            <planeGeometry args={[SW - 0.4, 0.002]} />
            <meshBasicMaterial color="#5a4acc" transparent opacity={0.6} />
          </mesh>
          <Text position={[0, -0.06, 0.005]} fontSize={0.11} color="#dde0ff" letterSpacing={0.18} textAlign="center" anchorX="center" anchorY="middle">
            What Clients Say
          </Text>
          <Text position={[0, -0.34, 0.005]} fontSize={0.036} color="#4a4a72" letterSpacing={0.32} textAlign="center" anchorX="center" anchorY="middle">
            VERIFIED CLIENT REVIEWS
          </Text>
        </group>

        {/* ── Slide 1: Maria ───────────────────────────────────── */}
        <group visible={slide === 1}>
          <Text position={[-SW / 2 + 0.14, SH / 2 - 0.1, 0.005]} fontSize={0.048} color="#7a5acc" letterSpacing={0.35} anchorX="left" anchorY="middle">
            01 / MARIA
          </Text>
          <Text position={[0, 0.08, 0.005]} fontSize={0.065} color="#dae1f8" maxWidth={SW - 0.18} textAlign="left" anchorX="center" anchorY="middle" lineHeight={1.55}>
            {`"Returning client for years! Byron achieved everything I was looking for in website design and I'm very pleased. He goes above and beyond, is very engaging when asking questions, and presents multiple designs. Highly recommend for any design, logo, or website project!"`}
          </Text>
          <mesh position={[0, -(SH / 2 - 0.24), 0.004]}>
            <planeGeometry args={[SW - 0.2, 0.002]} />
            <meshBasicMaterial color="#5a4acc" transparent opacity={0.5} />
          </mesh>
          <Text position={[0, -(SH / 2 - 0.1), 0.005]} fontSize={0.068} color="#c8c2ff" anchorX="center" anchorY="middle">
            Maria  ·  Owner, Lush Brows
          </Text>
        </group>

        {/* ── Slide 2: JonnyBeeTV ──────────────────────────────── */}
        <group visible={slide === 2}>
          <Text position={[-SW / 2 + 0.14, SH / 2 - 0.1, 0.005]} fontSize={0.048} color="#7a5acc" letterSpacing={0.35} anchorX="left" anchorY="middle">
            02 / JONNYBEETV
          </Text>
          <Text position={[0, 0.08, 0.005]} fontSize={0.065} color="#dae1f8" maxWidth={SW - 0.18} textAlign="left" anchorX="center" anchorY="middle" lineHeight={1.55}>
            {`"Byron helped tremendously with logos and graphic designs for JonnyBeeTV. He creatively put together my first logo and improved my latest. Very helpful with ideas and advice on planning to advance the platform. Highly recommend his work!"`}
          </Text>
          <mesh position={[0, -(SH / 2 - 0.24), 0.004]}>
            <planeGeometry args={[SW - 0.2, 0.002]} />
            <meshBasicMaterial color="#5a4acc" transparent opacity={0.5} />
          </mesh>
          <Text position={[0, -(SH / 2 - 0.1), 0.005]} fontSize={0.068} color="#c8c2ff" anchorX="center" anchorY="middle">
            JonnyBeeTV  ·  Media Platform
          </Text>
        </group>

        {/* Slide dot indicators */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 0.09, -(SH / 2 + 0.065), 0.004]}>
            <circleGeometry args={[0.013, 12]} />
            <meshBasicMaterial color={slide === i ? "#c8c2ff" : "#2e2e50"} transparent opacity={slide === i ? 0.9 : 0.5} />
          </mesh>
        ))}
      </group>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  VAULT PULSE — ambient breathing light in the Tech Vault hub        */
/* ------------------------------------------------------------------ */

function VaultPulse() {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1.8 + Math.sin(clock.getElapsedTime() * 0.7) * 0.9;
    }
  });
  return <pointLight ref={lightRef} position={[4, 2.2, -5]} color="#6040ff" intensity={1.8} distance={9} />;
}

/* ------------------------------------------------------------------ */
/*  PLACEHOLDER FRAMES — top wall x=1.5..5, awaiting real artwork     */
/* ------------------------------------------------------------------ */

function PlaceholderFrame({
  position,
  rotation,
  width = 1.0,
  height = 0.78,
  label = "In Development",
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  width?: number;
  height?: number;
  label?: string;
}) {
  const pad = 0.048;
  return (
    <group position={position} rotation={rotation}>
      {/* Gold frame */}
      <mesh position={[0, 0, -0.014]}>
        <boxGeometry args={[width + pad * 2, height + pad * 2, 0.014]} />
        <meshStandardMaterial color="#c9a84c" metalness={0.82} roughness={0.2} />
      </mesh>
      {/* Dark canvas */}
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#080810" />
      </mesh>
      {/* Subtle inner border */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[width - 0.04, height - 0.04]} />
        <meshBasicMaterial color="#0e0e18" transparent opacity={0.0} />
      </mesh>
      <Text
        position={[0, 0.06, 0.003]}
        fontSize={0.055}
        color="rgba(201,168,76,0.35)"
        letterSpacing={0.28}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        COMING SOON
      </Text>
      <Text
        position={[0, -0.07, 0.003]}
        fontSize={0.038}
        color="rgba(160,160,190,0.22)"
        letterSpacing={0.12}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  GOAT STATUE                                                        */
/* ------------------------------------------------------------------ */

function GoatStatue({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  const originalModel = useLoader(TDSLoader, "/images/r--goat.3ds");
  const marbleTex = useTexture("/images/gallery/floor.jpg");
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

      <mesh position={[0, 0.01, 0]} receiveShadow><boxGeometry args={[1.4, 0.02, 1.0]} /><meshStandardMaterial map={marbleTex} color="#908478" metalness={0.35} roughness={0.6} /></mesh>
      <mesh position={[0, 0.25, 0]} receiveShadow><boxGeometry args={[1.25, 0.5, 0.85]} /><meshStandardMaterial map={marbleTex} color="#908478" metalness={0.35} roughness={0.6} /></mesh>
      <mesh position={[0, 0.51, 0]}><boxGeometry args={[1.32, 0.02, 0.92]} /><meshStandardMaterial map={marbleTex} color="#a09488" metalness={0.4} roughness={0.5} /></mesh>

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
// Temp scratch for look-at → yaw/pitch math used by the music-room remote.
const _lookMat = new THREE.Matrix4();
const _lookQuat = new THREE.Quaternion();
const _lookEuler = new THREE.Euler(0, 0, 0, "YXZ");
const _upVec = new THREE.Vector3(0, 1, 0);

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
  targetRef: { current: number };
  autoTour: boolean;
  cameraDisabled?: boolean;
  snapping?: boolean;
  onSnapDone?: () => void;
  onProgressChange: (p: number) => void;
  onLabelChange: (label: string) => void;
  onOpenPanel?: (panel: string) => void;
  onRestartLoop?: () => void;
  onPortalEnter?: () => void;
  portalActive?: boolean;
  portalOverride?: { pos: [number, number, number]; lookAt: [number, number, number] } | null;
  /** Direct A→B camera lerp that bypasses STOPS-axis interpolation. Used for
   * vault-to-vault jumps so the camera doesn't swing through intermediate
   * gallery stops. Target idx is used to sync smoothProgress when the lerp
   * finishes, so the STOPS path resumes cleanly at the new stop. */
  directSnap?: { pos: [number, number, number]; lookAt: [number, number, number]; targetIdx: number } | null;
  onDirectSnapDone?: () => void;
  onPortalProximityChange?: (ready: boolean) => void;
  freeLook?: boolean;
  /** World point the free-look camera should smoothly rotate to face. Used by
   *  the music-room remote to steer between pieces. Null = free-drag only. */
  musicRoomTargetLookAt?: [number, number, number] | null;
  /** Power state forwarded to MusicRoom. */
  musicRoomPower?: boolean;
  /** Currently selected piece index forwarded to MusicRoom. */
  musicRoomPieceIdx?: number;
  /** Hidden-letter placements for the Founder's Study scavenger hunt. */
  hiddenLetters?: ReadonlyArray<{
    char: string;
    position: [number, number, number];
    rotation?: [number, number, number];
    size?: number;
  }>;
  /** Characters the user has already collected (hides those letters in 3D). */
  foundLetters?: ReadonlyArray<string>;
  /** Fires when a hidden letter is clicked/tapped. */
  onLetterCollect?: (char: string) => void;
  /** Fires when the user taps the left-side.png (Founder's Study) painting. */
  onStudyPortalClick?: () => void;
  /** Which hidden portal is currently active (drives which room to mount). */
  activePortal?: "music" | "study" | "tribute" | null;
  /** Fires when the in-study HIRE ME sign is clicked. */
  onHireMe?: () => void;
  /** Currently selected study piece idx (drives lerp reactivation). */
  studyPieceIdx?: number;
  /** Index of the currently-highlighted book on the shelf (-1 = none). */
  studyHighlightedBookIdx?: number;
  /** Fires when the floating tribute lantern hidden in the gallery is tapped. */
  onTributePortalClick?: () => void;
  /** Fires when the wooden bench inside the tribute room is clicked. Parent
   *  toggles between standing-entry and seated camera views. */
  onTributeBenchClick?: () => void;
  /** Fires when a prediction frame in the Predictions Wing is clicked. */
  onSelectPrediction?: (slug: string) => void;
  /** "balanced" swaps the reflective floor's real-time planar reflection
   *  (a full second scene render pass every frame — very expensive on
   *  integrated GPUs) for a plain material. */
  quality?: "high" | "balanced";
  /** When set (and cameraDisabled is false), all of this component's camera
   *  writes (STOPS lerp, portal override, direct snap) target this proxy
   *  object instead of the real render camera — used so the third-person
   *  character can be driven by the exact same tour/portal choreography. */
  navTarget?: THREE.Object3D | null;
  /** Live character position/yaw — used for the portal-proximity check below
   *  when cameraDisabled is true (freely walking). The real camera trails
   *  the character by a couple meters in that mode (ThirdPersonCamera's
   *  boom offset), so checking camera.position against the portal painting
   *  requires standing almost inside the wall before it registers as
   *  "close enough." Checking the character's own position instead measures
   *  what the user actually sees themselves standing next to. */
  characterStateRef?: RefObject<CharacterOutState>;
}

export default function GalleryRoom({
  onSelectProject,
  modalOpen,
  targetProgress,
  targetRef,
  autoTour,
  onProgressChange,
  onLabelChange,
  onOpenPanel,
  cameraDisabled = false,
  snapping = false,
  onSnapDone,
  onRestartLoop,
  onPortalEnter,
  portalActive = false,
  portalOverride = null,
  directSnap = null,
  onDirectSnapDone,
  onPortalProximityChange,
  freeLook = false,
  musicRoomTargetLookAt = null,
  musicRoomPower = false,
  musicRoomPieceIdx = 3,
  hiddenLetters = [],
  foundLetters = [],
  onLetterCollect,
  onStudyPortalClick,
  activePortal = null,
  onHireMe,
  studyPieceIdx = 0,
  studyHighlightedBookIdx = -1,
  onTributePortalClick,
  onTributeBenchClick,
  onSelectPrediction,
  navTarget = null,
  quality = "high",
  characterStateRef,
}: GalleryRoomProps) {
  const { camera: renderCamera } = useThree();
  const camera = navTarget ?? renderCamera;

  const smoothProgress = useRef(0);
  const camPos = useRef(new THREE.Vector3(0, 1.7, 0.5));
  const camLook = useRef(new THREE.Vector3(-1.6, 1.7, -1));
  const tempPos = useRef(new THREE.Vector3());
  const [focusedLabel, setFocusedLabel] = useState("");
  const smoothLook = useRef(0);
  // Visibility state for the floating "Press E" hint that lives in 3D
  // beside the portal painting. Mirrors the proximity ref below — kept
  // as React state because <Html> only mounts on a true → false flip.
  const [portalHintVisible, setPortalHintVisible] = useState(false);

  // Distance-aware map-snap state — rate is computed once per snap so the
  // duration scales with how far the click jumps.
  const wasSnapping = useRef(false);
  const snapPosRate = useRef(8);
  const snapLookRate = useRef(10);

  // Portal override — smooth lerp state (initialized from live camera on first use)
  const overrideSmoothPos = useRef(new THREE.Vector3());
  const overrideSmoothLook = useRef(new THREE.Vector3());
  const overrideInitialized = useRef(false);
  const overrideTargetPos = useRef(new THREE.Vector3());
  const overrideTargetLook = useRef(new THREE.Vector3());

  // Direct-snap override — one-shot A→B lerp seeded from live camera, released
  // when the camera reaches the target.
  const directSmoothPos = useRef(new THREE.Vector3());
  const directSmoothLook = useRef(new THREE.Vector3());
  const directInitialized = useRef(false);
  // Tracks which directSnap object instance onDirectSnapDone has already
  // fired for. GalleryScene's setDirectSnap is a React state update, so a
  // new target isn't visible to this closure until the next render commits
  // — but this useFrame loop keeps running every rAF tick in the meantime.
  // Once "arrived" at the old target, directInitialized resets and the very
  // next tick re-seeds the lerp from the (already-there) camera position
  // toward the SAME stale directSnap.pos, which reads as "arrived" again
  // instantly — firing the callback repeatedly for one real arrival. For a
  // caller that advances a queue synchronously on each call (as
  // handleDirectSnapDone's waypoint chain does), that drains multiple
  // waypoints in a single burst before React ever paints an intermediate
  // frame. Firing at most once per distinct directSnap object closes that.
  const directSnapFiredFor = useRef<typeof directSnap>(null);

  // Portal proximity — computed each frame, reported up when it crosses the threshold
  const portalPaintingVec = useRef(new THREE.Vector3(...PORTAL_PAINTING_POS));
  const portalReadyState = useRef(false);

  // Mobile detection — used only to tweak the Services stop framing so all 4
  // pedestals fit on narrow viewports. Desktop behavior is untouched.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const servicesIdx = useMemo(
    () => STOPS.findIndex((s) => s.label === "Services"),
    []
  );

  // Free-look (music room) — yaw/pitch driven by mouse drag
  const yawRef = useRef(Math.PI); // Math.PI = facing +z by default (music-room start orientation)
  const pitchRef = useRef(0);
  const freeLookSeeded = useRef(false);
  const freeLookEuler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));

  // Music-room remote: true while we should be lerping yaw/pitch toward
  // musicRoomTargetLookAt. Reset to true whenever the user clicks a new
  // piece (pieceIdx changes), turned off the moment the user starts a
  // manual drag so their input isn't fighting the lerp.
  const remoteLerpActive = useRef(false);
  const draggingRef = useRef(false);
  useEffect(() => {
    remoteLerpActive.current = true;
  }, [musicRoomPieceIdx, studyPieceIdx]);

  const wallTex = useTexture("/images/gallery/wall.jpg");
  const floorTex = useTexture("/images/gallery/floor.jpg");
  const ceilingTex = useTexture("/images/gallery/ceiling.jpg");

  useMemo(() => {
    [wallTex, ceilingTex, floorTex].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; });
    wallTex.repeat.set(2, 1); ceilingTex.repeat.set(3, 1); floorTex.repeat.set(4, 2);
  }, [wallTex, ceilingTex, floorTex]);

  // Free-look drag — active only inside the music room. Horizontal drag → yaw, vertical → pitch.
  useEffect(() => {
    if (!freeLook) {
      freeLookSeeded.current = false;
      document.body.style.cursor = "default";
      return;
    }
    document.body.style.cursor = "grab";
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const SENS = 0.0035;
    const MAX_PITCH = Math.PI / 2 - 0.15;

    const onDown = (e: PointerEvent) => {
      // Ignore drags that originate on iframes/links inside the media board
      const target = e.target as HTMLElement;
      if (target.closest("iframe") || target.closest("a")) return;
      dragging = true;
      draggingRef.current = true;
      // Manual drag takes over — stop lerping toward the remote's target
      // until the user picks a new piece.
      remoteLerpActive.current = false;
      lastX = e.clientX;
      lastY = e.clientY;
      document.body.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      yawRef.current -= dx * SENS;
      pitchRef.current = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitchRef.current - dy * SENS));
    };
    const onUp = () => {
      dragging = false;
      draggingRef.current = false;
      document.body.style.cursor = "grab";
    };

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.body.style.cursor = "default";
    };
  }, [freeLook]);

  useFrame(({ clock }, delta) => {
    // Portal proximity + "Press E" hint — evaluated every frame regardless of
    // cameraDisabled. While freely walking (the default mode now that the
    // character replaced the free-roam camera), cameraDisabled is true and
    // everything below this block is skipped — that used to silently skip
    // this check too, so 'E' near a portal painting did nothing and the
    // hint never appeared while walking (it only worked mid-scripted-jump).
    // The real camera trails the character by ~2.8m in that mode (see
    // ThirdPersonCamera's BACK_DISTANCE), so even a proximity check that DID
    // run against camera.position would need the character almost inside
    // the wall to register — using the character's own live position (via
    // characterStateRef) instead measures what the user actually sees
    // themselves standing next to. Horizontal-only (x/z) so the painting's
    // wall-mounted height doesn't add irrelevant distance.
    {
      const posSource =
        cameraDisabled && characterStateRef?.current
          ? characterStateRef.current.position
          : camera.position;
      const dx = posSource.x - portalPaintingVec.current.x;
      const dz = posSource.z - portalPaintingVec.current.z;
      const ready = Math.sqrt(dx * dx + dz * dz) < 3.5 && !portalActive;
      if (ready !== portalReadyState.current) {
        portalReadyState.current = ready;
        onPortalProximityChange?.(ready);
        setPortalHintVisible(ready);
      }
    }

    if (cameraDisabled) return;

    const dt = Math.min(delta, 0.1); // clamp for tab-refocus safety

    // --- Portal override path: direct lerp, bypasses STOPS ---
    if (portalOverride) {
      if (!overrideInitialized.current) {
        overrideInitialized.current = true;
        overrideSmoothPos.current.copy(camera.position);
        // Seed look from current lookAt proxy
        camera.getWorldDirection(_v3a);
        overrideSmoothLook.current.copy(camera.position).add(_v3a.multiplyScalar(2));
      }
      overrideTargetPos.current.set(...portalOverride.pos);
      overrideTargetLook.current.set(...portalOverride.lookAt);
      const rate = 2.0;
      const k = 1 - Math.exp(-rate * dt);
      overrideSmoothPos.current.lerp(overrideTargetPos.current, k);
      camera.position.copy(overrideSmoothPos.current);

      if (freeLook) {
        // Seed yaw/pitch from the entry lookAt on the first inside frame. Use
        // camera.lookAt → extract YXZ euler so the math always matches three's
        // own convention (custom atan2 formulas are easy to get wrong).
        if (!freeLookSeeded.current) {
          freeLookSeeded.current = true;
          camera.lookAt(overrideTargetLook.current);
          freeLookEuler.current.setFromQuaternion(camera.quaternion, "YXZ");
          yawRef.current = freeLookEuler.current.y;
          pitchRef.current = freeLookEuler.current.x;
        }

        // Music-room remote: lerp toward the selected piece's look-at while
        // the user isn't actively dragging and hasn't dragged since the last
        // arrow click.
        if (
          musicRoomTargetLookAt &&
          remoteLerpActive.current &&
          !draggingRef.current
        ) {
          _v3a.set(...musicRoomTargetLookAt);
          _lookMat.lookAt(camera.position, _v3a, _upVec);
          _lookQuat.setFromRotationMatrix(_lookMat);
          _lookEuler.setFromQuaternion(_lookQuat, "YXZ");
          const targetYaw = _lookEuler.y;
          const targetPitch = _lookEuler.x;
          // Shortest-path yaw delta so the camera never spins the long way.
          let dYaw = targetYaw - yawRef.current;
          while (dYaw > Math.PI) dYaw -= 2 * Math.PI;
          while (dYaw < -Math.PI) dYaw += 2 * Math.PI;
          const rate = 5;
          const k = 1 - Math.exp(-rate * dt);
          yawRef.current += dYaw * k;
          pitchRef.current += (targetPitch - pitchRef.current) * k;
        }

        freeLookEuler.current.set(pitchRef.current, yawRef.current, 0, "YXZ");
        camera.quaternion.setFromEuler(freeLookEuler.current);
      } else {
        // Cinematic entry / exit — classic lookAt lerp
        overrideSmoothLook.current.lerp(overrideTargetLook.current, k * 1.2);
        camera.lookAt(overrideSmoothLook.current);
      }
      // Keep smoothProgress frozen at wherever the user was — so on exit, STOPS resumes cleanly.
      onLabelChange("");
      return;
    }
    overrideInitialized.current = false;

    // --- Direct-snap override: one-shot direct A→B lerp (vault-to-vault jumps)
    if (directSnap) {
      if (!directInitialized.current) {
        directInitialized.current = true;
        directSmoothPos.current.copy(camera.position);
        camera.getWorldDirection(_v3a);
        directSmoothLook.current.copy(camera.position).add(_v3a.multiplyScalar(2));
      }
      _v3a.set(...directSnap.pos);
      _v3b.set(...directSnap.lookAt);
      // Mobile framing adjustment for Services — pull camera back + up so
      // all 4 pedestals fit the narrow viewport (lookAt stays the same).
      if (isMobile && directSnap.targetIdx === servicesIdx) {
        _v3a.x -= 1.5;
        _v3a.y += 0.4;
      }
      // Same entry-chamber wall clearance as the main STOPS-lerp path below —
      // map jumps of more than 1 stop take this direct A→B path instead, so
      // without this the character lands right up against the front wall
      // whenever the destination is the entrance stop, regardless of which
      // path got it there. Matches characterSpawn's exact z (GalleryScene.tsx)
      // so every route to this stop lands at the same, already-confirmed-good
      // position instead of each path independently approximating "far enough."
      if (navTarget && Math.abs(_v3a.x) < 1 && _v3a.z > ENTRANCE_SAFE_Z) {
        _v3a.z = ENTRANCE_SAFE_Z;
      }
      const rate = 4.5;
      const k = 1 - Math.exp(-rate * dt);
      directSmoothPos.current.lerp(_v3a, k);
      directSmoothLook.current.lerp(_v3b, k * 1.2);
      camera.position.copy(directSmoothPos.current);
      camera.lookAt(directSmoothLook.current);

      if (camera.position.distanceTo(_v3a) < 0.015) {
        // Sync STOPS-space to the landing idx so the main path resumes here
        // without a second jump.
        smoothProgress.current = directSnap.targetIdx;
        smoothLook.current = directSnap.targetIdx;
        directInitialized.current = false;
        if (directSnapFiredFor.current !== directSnap) {
          directSnapFiredFor.current = directSnap;
          onDirectSnapDone?.();
        }
      }
      onProgressChange(Math.min(1, directSnap.targetIdx / TOUR_LAST));
      onLabelChange(STOPS[directSnap.targetIdx]?.label ?? "");
      return;
    }
    directInitialized.current = false;

    const target = targetRef.current;

    // Loop reset detection
    if (smoothProgress.current - target > 2) {
      smoothProgress.current = target;
      smoothLook.current = target;
    }

    // Frame-rate independent exponential lerp
    const atStop = Math.abs(target - Math.round(target)) < 0.02;

    // Distance-aware snap rate — computed once when a snap starts and held
    // for the whole transition. Short jumps lerp quickly, long jumps take
    // proportionally more time so they read as smooth cinematic pans.
    if (snapping && !wasSnapping.current) {
      const d = Math.abs(target - smoothProgress.current);
      snapPosRate.current = Math.max(2.2, 7 - d * 0.5);
      snapLookRate.current = Math.max(3.0, 9 - d * 0.6);
      wasSnapping.current = true;
    } else if (!snapping) {
      wasSnapping.current = false;
    }

    const posRate = snapping ? snapPosRate.current : (atStop ? 8 : 25);
    const posLerp = 1 - Math.exp(-posRate * dt);
    smoothProgress.current += (target - smoothProgress.current) * posLerp;
    if (Math.abs(smoothProgress.current - target) < 0.005) {
      smoothProgress.current = target;
      if (snapping) onSnapDone?.();
    }

    // Look lerp — slightly faster than position for natural look-ahead
    const lookRate = snapping ? snapLookRate.current : (atStop ? 10 : 30);
    const lookLerp = 1 - Math.exp(-lookRate * dt);
    smoothLook.current += (target - smoothLook.current) * lookLerp;
    if (Math.abs(smoothLook.current - target) < 0.005) smoothLook.current = target;

    // Camera position
    getCamera(smoothProgress.current, camPos.current, camLook.current);

    // When driving the character proxy (not the real camera), pull the
    // target back from the entry chamber's back wall — STOPS[0] sits at
    // z=1.5, only 0.5 units from the wall (z=2), which is fine for the
    // first-person eye camera but embeds the 3rd-person boom (~1.4 units
    // behind the character) inside the wall, reading as a black screen.
    // Scoped tightly to the entrance doorway's x range so no other stop's
    // framing is affected. Matches GalleryScene's characterSpawn exactly, so
    // every route to this stop (initial spawn, this path, the direct-snap
    // path above) lands at the identical, already-confirmed-good position.
    if (navTarget && Math.abs(camPos.current.x) < 1 && camPos.current.z > ENTRANCE_SAFE_Z) {
      camPos.current.z = ENTRANCE_SAFE_Z;
    }

    camera.position.copy(camPos.current);

    // Mobile framing adjustment for Services — blend a pull-back + rise as the
    // camera approaches the stop so all 4 pedestals fit on narrow viewports.
    // Desktop path is skipped entirely.
    if (isMobile && servicesIdx >= 0) {
      const d = Math.abs(smoothProgress.current - servicesIdx);
      if (d < 1) {
        const weight = 1 - d;
        camera.position.x -= 1.5 * weight;
        camera.position.y += 0.4 * weight;
      }
    }

    // Micro drift during hold — very subtle breathing motion
    const moveDelta = Math.abs(target - smoothProgress.current);
    if (moveDelta < 0.05 && !snapping) {
      const t = clock.getElapsedTime();
      camera.position.x += Math.sin(t * 0.2) * 0.008;
      camera.position.y += Math.cos(t * 0.15) * 0.004;
    }

    // LookAt
    getCamera(smoothLook.current, tempPos.current, camLook.current);
    camera.lookAt(camLook.current);

    onProgressChange(Math.min(1, smoothProgress.current / TOUR_LAST));
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
      <fog attach="fog" args={["#1a1a1a", 8, 25]} />

      {/* Main Gallery floor — reflective, scoped to corridor (x=0..19, z=-4..+1).
          Shrunk from the old 35×15 plane to prevent Z-fighting with Gallery II floor. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9.5, 0, GZ]} receiveShadow>
        <planeGeometry args={[19, GW * 2]} />
        {quality === "high" ? (
          <MeshReflectorMaterial
            map={floorTex}
            color="#908478"
            roughness={0.65}
            metalness={0.3}
            mirror={0.35}
            blur={[400, 150]}
            resolution={512}
            mixBlur={0.9}
            mixStrength={1.2}
            depthScale={1.0}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
          />
        ) : (
          <meshStandardMaterial map={floorTex} color="#908478" roughness={0.65} metalness={0.3} />
        )}
      </mesh>
      {/* Entry chamber floor — only the front lobby strip z=+1..+2.
          The corridor floors (Main Gallery + Gallery II) already cover z=-4..+1. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1.5]} receiveShadow>
        <planeGeometry args={[6, 1]} />
        <meshStandardMaterial map={floorTex} color="#908478" metalness={0.4} roughness={0.55} />
      </mesh>

      {/* Main Gallery ceiling — scoped to corridor only, matches floor */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[9.5, H, GZ]}>
        <planeGeometry args={[19, GW * 2]} />
        <meshStandardMaterial map={ceilingTex} color="#807468" />
      </mesh>
      {/* Entry chamber ceiling — front lobby strip only, matches floor */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 1.5]}>
        <planeGeometry args={[6, 1]} />
        <meshStandardMaterial map={ceilingTex} color="#807468" />
      </mesh>

      {/* Entry chamber — front wall restored to full width */}
      <mesh position={[0, H / 2, 2]}><planeGeometry args={[EW * 2, H]} /><meshStandardMaterial color="#4a4440" /></mesh>

      {/* Entry right wall kept; left wall removed — Gallery II corridor opens west */}
      <mesh position={[EW, H / 2, 1.2]} rotation={[0, Math.PI, 0]} receiveShadow><planeGeometry args={[2, H]} /><meshStandardMaterial map={wallTex} color={wc} /></mesh>
      {/* Display panel — centered on artwork (x=0, width=1.7). Width=1.9m
          gives 0.1m backing on each side: reads as a focused panel not a wall. */}
      <mesh position={[0, H / 2, -1]} receiveShadow><planeGeometry args={[1.9, H]} /><meshStandardMaterial map={wallTex} color={wc} /></mesh>
      <mesh position={[0, H / 2, -1]} rotation={[0, Math.PI, 0]}><planeGeometry args={[1.9, H]} /><meshStandardMaterial map={wallTex} color={wc} /></mesh>

      {/* Main gallery top wall */}
      <mesh position={[10, H / 2, GZ + GW]} rotation={[0, Math.PI, 0]} receiveShadow><planeGeometry args={[20, H]} /><meshStandardMaterial map={wallTex} color={wc} /></mesh>

      {/* ── Gallery II — west wing, x=-19..0, same corridor as Main Gallery ────────
          North wall z=+1, South wall z=-4, runs in -X direction from entry.
          Bird's eye: [Gallery II x=-19..0] [entry] [Main Gallery x=0..19]      */}
      {/* North wall (z=+1, faces -z, same as main gallery top wall) */}
      <mesh position={[-9.5, H / 2, GZ + GW]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[19, H]} /><meshStandardMaterial map={wallTex} color={wc} />
      </mesh>
      {/* South wall (z=-4) — split by AI Predictions Wing doorway at x=-3.5..-1.5 */}
      {/* Left of doorway: x=-19 to x=-3.5 */}
      <mesh position={[-11.25, H / 2, GZ - GW]} receiveShadow>
        <planeGeometry args={[15.5, H]} /><meshStandardMaterial map={wallTex} color={wc} />
      </mesh>
      {/* Right of doorway: x=-1.5 to x=0 */}
      <mesh position={[-0.75, H / 2, GZ - GW]} receiveShadow>
        <planeGeometry args={[1.5, H]} /><meshStandardMaterial map={wallTex} color={wc} />
      </mesh>
      {/* West end wall of Gallery II — restored now that PredictionsWing is a separate south alcove */}
      <mesh position={[-19, H / 2, GZ]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[GW * 2, H]} /><meshStandardMaterial map={wallTex} color={wc} />
      </mesh>
      <mesh position={[-19, H / 2, GZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[GW * 2, H]} /><meshStandardMaterial map={wallTex} color={wc} />
      </mesh>
      {/* Floor extension */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-9.5, 0, GZ]} receiveShadow>
        <planeGeometry args={[19, GW * 2]} /><meshStandardMaterial map={floorTex} color="#908478" metalness={0.4} roughness={0.55} />
      </mesh>
      {/* Ceiling extension */}
      <mesh position={[-9.5, H, GZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[19, GW * 2]} /><meshStandardMaterial map={ceilingTex} color="#807468" />
      </mesh>
      {/* Ceiling track rail */}
      <mesh position={[-9.5, H - 0.08, GZ]}>
        <boxGeometry args={[19, 0.025, 0.025]} /><meshStandardMaterial color="#222" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Gallery II — sealed wing, dim blue-gray lighting */}
      {[-4, -9, -14].map((x, i) => (
        <group key={`g2-sp-${x}`}>
          <mesh position={[x, H - 0.15, GZ]} rotation={[0, 0, (i % 3 - 1) * 0.04]}>
            <cylinderGeometry args={[0.04, 0.06, 0.1, 8]} /><meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} />
          </mesh>
          <SpotLightWithTarget
            position={[x, H - 0.2, GZ]}
            targetPosition={[x, 1.5, GZ]}
            intensity={5} angle={0.7} penumbra={0.9} distance={8} castShadow={false}
            color="#8899bb"
          />
        </group>
      ))}

      {/* Velvet rope barrier — posts span corridor width (z-axis), rope reads head-on from entry camera */}
      <group position={[-6, 0, 0]}>
        {/* South post (near z=-4 wall) */}
        <mesh position={[0, 0.6, GZ - GW + 0.5]}>
          <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 1.22, GZ - GW + 0.5]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* North post (near z=+1 wall) */}
        <mesh position={[0, 0.6, GZ + GW - 0.5]}>
          <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 1.22, GZ + GW - 0.5]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Rope in z-direction — rotation [PI/2,0,0] makes cylinder run along Z */}
        <mesh position={[0, 0.9, GZ]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, GW * 2 - 1, 8]} />
          <meshStandardMaterial color="#8b1a1a" metalness={0.2} roughness={0.8} />
        </mesh>
      </group>

      {/* Announcement sign — rotation [0,PI/2,0] makes it face east (+x) toward incoming camera */}
      <group position={[-11, 0, GZ]} rotation={[0, Math.PI / 2, 0]}>
        {/* Stand */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 1.0, 8]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.5, 0.04, 0.5]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Gold frame border */}
        <mesh position={[0, 1.55, -0.02]}>
          <boxGeometry args={[2.96, 1.26, 0.04]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.85} roughness={0.15} />
        </mesh>
        {/* Dark panel */}
        <mesh position={[0, 1.55, 0.01]}>
          <boxGeometry args={[2.8, 1.1, 0.05]} />
          <meshStandardMaterial color="#0a0a12" metalness={0.3} roughness={0.7} />
        </mesh>
        <Text position={[0, 1.73, 0.045]} fontSize={0.16} color="rgba(201,168,76,0.9)" letterSpacing={0.35} textAlign="center" anchorX="center" anchorY="middle">
          GALLERY II
        </Text>
        <Text position={[0, 1.50, 0.045]} fontSize={0.09} color="rgba(180,190,210,0.6)" letterSpacing={0.25} textAlign="center" anchorX="center" anchorY="middle">
          OPENING SOON
        </Text>
        <Text position={[0, 1.32, 0.045]} fontSize={0.055} color="rgba(140,150,170,0.4)" letterSpacing={0.15} textAlign="center" anchorX="center" anchorY="middle">
          New work coming
        </Text>
      </group>
      {/* Spotlight on the sign, angled from above toward the sign face */}
      <SpotLightWithTarget
        position={[-7, H - 0.2, GZ]}
        targetPosition={[-11, 1.55, GZ]}
        intensity={14} angle={0.38} penumbra={0.55} distance={8} castShadow={false}
        color="#c9a84c"
      />

      {/* Very faint ambient so the wing isn't pitch black */}
      <pointLight position={[-9.5, 2.2, GZ]} intensity={0.25} distance={20} color="#6070a0" />

      {/* Bottom gallery wall — split around the Tech Vault doorway (x=3..5, 2m wide) */}
      <mesh position={[1.5, H / 2, GZ - GW]} receiveShadow><planeGeometry args={[3, H]} /><meshStandardMaterial map={wallTex} color={wc} /></mesh>
      <mesh position={[12.5, H / 2, GZ - GW]} receiveShadow><planeGeometry args={[15, H]} /><meshStandardMaterial map={wallTex} color={wc} /></mesh>
      <mesh position={[19, H / 2, GZ]} rotation={[0, -Math.PI / 2, 0]} receiveShadow><planeGeometry args={[GW * 2, H]} /><meshStandardMaterial map={wallTex} color={wc} /></mesh>

      {/* Track rails */}
      <mesh position={[0, H - 0.08, 0.5]}><boxGeometry args={[0.025, 0.025, 3.5]} /><meshStandardMaterial color="#222" metalness={0.7} roughness={0.4} /></mesh>
      <mesh position={[10, H - 0.08, GZ]}><boxGeometry args={[20, 0.025, 0.025]} /><meshStandardMaterial color="#222" metalness={0.7} roughness={0.4} /></mesh>

      {/* Spotlights — entry */}
      <group>
        <mesh position={[0, H - 0.15, 0.8]}><cylinderGeometry args={[0.04, 0.06, 0.1, 8]} /><meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} /></mesh>
        {/* Point light removed — spotlight sufficient */}
        <SpotLightWithTarget position={[0, H - 0.2, 0.8]} targetPosition={[0, 1.8, -1]} intensity={25} angle={0.55} penumbra={0.65} distance={8} />
      </group>
      <SpotLightWithTarget position={[0, H - 0.2, 0.3]} targetPosition={[-EW + 0.2, 1.6, 0.8]} intensity={18} angle={0.6} penumbra={0.7} distance={8} castShadow={false} />
      <SpotLightWithTarget position={[0, H - 0.2, 0.3]} targetPosition={[EW - 0.2, 1.6, 0.8]} intensity={18} angle={0.6} penumbra={0.7} distance={8} castShadow={false} />

      {/* Spotlights — gallery (slight random rotation for realism) */}
      {[3, 5.5, 8, 10.5, 13, 15.5, 17.5].map((x, i) => (
        <group key={`lg-${i}`}>
          <mesh position={[x, H - 0.15, GZ]} rotation={[0, 0, (i % 3 - 1) * 0.04]}>
            <cylinderGeometry args={[0.04, 0.06, 0.1, 8]} /><meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Point light removed — spotlight provides sufficient illumination */}
          <SpotLightWithTarget position={[x, H - 0.2, GZ]} targetPosition={[x, 1.5, i % 2 === 0 ? GZ + GW - 0.3 : GZ - GW + 0.3]} intensity={20} angle={0.65} penumbra={0.7} distance={10} castShadow={false} />
        </group>
      ))}
      <SpotLightWithTarget position={[17, H - 0.2, GZ]} targetPosition={[18.9, 1.5, GZ]} intensity={28} angle={0.45} penumbra={0.6} />
      {/* Point light removed — end wall spotlight sufficient */}

      {/* Goat statue — centered in the middle of the gallery corridor */}
      <GoatStatue position={[10, 0, GZ]} onClick={() => onOpenPanel?.("studio")} />

      {/* Service pedestals — row across end of gallery */}
      <ConnectPedestal position={[17.5, 0, GZ + 1.2]} onClick={() => onOpenPanel?.("connect")} />
      <DiamondPedestal position={[17.5, 0, GZ + 0.4]} onClick={() => onOpenPanel?.("enterprise")} />
      <EnvelopePedestal position={[17.5, 0, GZ - 0.4]} onClick={() => onOpenPanel?.("commission")} />
      <PhonePedestal position={[17.5, 0, GZ - 1.2]} onClick={() => onOpenPanel?.("appointments")} />


      {/* Projector + testimonial screen — right gallery wall, x=3 */}
      <ProjectorDisplay />

      {/* Artworks */}
      {ARTWORKS.map((art) => {
        const isFocused = !cameraDisabled && focusedLabel === art.project.title;
        return (
          <WallArtwork
            key={art.project.title}
            position={art.position}
            rotation={art.rotation}
            width={art.width}
            frameType={art.frame}
            project={art.project}
            onClick={() => {
              if (art.noInteraction) return;
              if (art.isPortal) onPortalEnter?.();
              else if (art.isStudyPortal) onStudyPortalClick?.();
              else onSelectProject(art.project);
            }}
            isActive={isFocused}
            isPortal={art.isPortal}
            noPlaque={art.noPlaque}
            noLight={art.noLight}
            characterStateRef={characterStateRef}
          />
        );
      })}

      {/* Hidden letters for the Founder's Study scavenger hunt — removed
          once collected. Skipped entirely once the study is already unlocked.
          Not gated on cameraDisabled/scriptedNavActive: the hunt is meant to
          be found during free-roam exploration, not just the guided tour. */}
      {hiddenLetters.map((l) => (
          <HiddenLetter
            key={l.char}
            char={l.char}
            position={l.position}
            rotation={l.rotation}
            size={l.size}
            found={foundLetters.includes(l.char)}
            onCollect={(c) => onLetterCollect?.(c)}
          />
        ))}

      {/* Hidden rooms — only the portal that was activated mounts its room. */}
      {portalActive && activePortal === "music" && (
        <MusicRoom
          onOpenPanel={onOpenPanel}
          powerOn={musicRoomPower}
          currentPieceIdx={musicRoomPieceIdx}
          onAlbumClick={(idx) => {
            const albums: Project[] = [
              {
                title: "Album I — Burgundy",
                category: "Music · Manny Baby",
                image: "/images/Wiggle-Woo-Character.png",
                description:
                  "First in the rotation. A mood piece — warm, late-night, conversational. The deep burgundy on the wall is the sound: heavy bass, soft synths, slow tempo.",
                tags: ["Music", "Manny Baby"],
              },
              {
                title: "Album II — Deep Blue",
                category: "Music · Manny Baby",
                image: "/images/Wiggle-Woo-Character.png",
                description:
                  "Cooler, more reflective. Pulled apart and put back together — the kind of album that sounds different the third time you hear it.",
                tags: ["Music", "Manny Baby"],
              },
              {
                title: "Album III — Warm Brown",
                category: "Music · Manny Baby",
                image: "/images/Wiggle-Woo-Character.png",
                description:
                  "Richer, denser. Studio-leaning. Live drums where you'd expect samples, vocals layered for warmth.",
                tags: ["Music", "Manny Baby"],
              },
              {
                title: "Album IV — Forest Green",
                category: "Music · Manny Baby",
                image: "/images/Wiggle-Woo-Character.png",
                description:
                  "The newest. Looser, riskier, more confident. Listen end-to-end — the sequencing is the point.",
                tags: ["Music", "Manny Baby"],
              },
            ];
            const album = albums[idx];
            if (album) onSelectProject(album);
          }}
        />
      )}
      {portalActive && activePortal === "study" && (
        <FoundersStudy onHireMe={onHireMe} highlightedBookIdx={studyHighlightedBookIdx} />
      )}
      {/* Tribute room + wall memorial frame + spinning medallion are
          temporarily hidden. The component files (TributeRoom.tsx,
          TributeFrame.tsx, TributeMedallion.tsx) and tribute portal
          state in GalleryScene remain intact for an easy restore — see
          the comment on the import block above for the restore steps. */}

      {/* "Press E" hint — anchored in 3D space just above and slightly
          in front of the chess-king portal painting on the east wall.
          Renders only when the camera is close enough (portalHintVisible
          flips edge-only via the proximity ref above). The painting sits
          at PORTAL_PAINTING_POS (19, 1.85, 0) facing -X, so the hint
          floats at slightly lower x (toward the viewer) and higher y. */}
      {portalHintVisible && (
        <Html
          position={[18.6, 2.65, 0]}
          center
          distanceFactor={6}
          zIndexRange={[40, 50]}
          style={{ pointerEvents: "none" }}
        >
          <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-gallery-accent/40 bg-black/70 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.25em] text-gallery-accent backdrop-blur-sm">
            <span className="rounded border border-gallery-accent/60 px-1.5 py-0.5 font-mono text-[10px] leading-none text-gallery-accent">
              E
            </span>
            <span>Press to enter</span>
          </div>
        </Html>
      )}

      {/* Tech Vault — dedicated alcove branching off the top wall at x=3..4 */}
      <TechVault />
      <VaultPulse />

      {/* AI Predictions Wing — south alcove at x=-5..0, z=-9..-4, doorway at x=-3.5..-1.5 */}
      <PredictionsWing onSelectPrediction={onSelectPrediction ?? (() => {})} />

    </>
  );
}
