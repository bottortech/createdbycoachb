"use client";

import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import * as THREE from "three";
import { Suspense, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GalleryRoom, { STOPS, TOUR_LAST, PORTAL_STOP, VAULT_CASE_START, VAULT_CASE_COUNT, BYPASS_PANEL_WEST_IDX, BYPASS_GOAT_WEST_IDX, BYPASS_GOAT_EAST_IDX, MUSIC_ROOM_CAMERA } from "./GalleryRoom";
import { BOOKING_PAYMENT_URL } from "@/lib/links";
import { STUDY_ROOM_CAMERA, STUDY_PIECES, STUDY_DEFAULT_PIECE_IDX, STUDY_BOOK_TITLES } from "./FoundersStudy";
import {
  TRIBUTE_ROOM_CAMERA,
  TRIBUTE_SEATED_CAMERA,
  TRIBUTE_NAME,
  TRIBUTE_DATES,
  TRIBUTE_MESSAGE,
  TRIBUTE_PHOTO,
} from "./TributeRoom";
import ProjectModal, { Project } from "../gallery/ProjectModal";
import PredictionModal from "../PredictionModal";
import CertificationBadges from "../CertificationBadges";
import { getPublishedPredictions } from "@/data/predictions";
import type { PredictionMeta } from "@/types/prediction";
import GalleryOverlayPanel from "./GalleryOverlayPanel";
import GalleryMap from "./GalleryMap";
import TechVaultMap from "./TechVaultMap";
import PredictionsMap from "./PredictionsMap";
import TestimonialProjector from "../sections/TestimonialProjector";
import CharacterController, { CharacterOutState } from "./CharacterController";
import ThirdPersonCamera from "./ThirdPersonCamera";
import MobileControls from "./MobileControls";
import FPSMeter from "./FPSMeter";

type PanelType = "enterprise" | "studio" | "appointments" | "commission" | "connect" | "testimonials" | null;

// Max stop user can reach via scroll/arrows. Vault case stops live past PORTAL_STOP
// but are only addressable via the TechVaultMap, not by scrolling.
const LAST = PORTAL_STOP;
const PORTAL_ANIM_MS = 1500;

// Hidden Founder's Study unlock — scavenger hunt. Users find 4 characters
// scattered across the main gallery floor, then enter DEV-007 on a keypad
// mounted on the left-side.png painting to unlock the room.
const STUDY_CODE = "DEV007"; // normalized (no dash) — keypad accepts either
const STUDY_REQUIRED_LETTERS: ReadonlyArray<string> = ["D", "E", "V", "7"];
const STUDY_STORAGE_KEY = "coachb_study_progress_v1";
const HUNT_HINT_STORAGE_KEY = "coachb_hunt_hint_seen_v1";
// Delay before the hunt hint fades in after the user enters the gallery.
const HUNT_HINT_DELAY_MS = 4000;

// Hidden letter placements. Chosen so finding them requires looking closely
// at different parts of the gallery — not floating in the middle of the room.
interface HiddenLetterPlacement {
  char: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  size?: number;
}
const HIDDEN_LETTERS: ReadonlyArray<HiddenLetterPlacement> = [
  // D — front face of the goat statue's marble pedestal.
  // Visible at Stop 7 where the camera looks down at the goat.
  { char: "D", position: [10, 0.3, -0.95], size: 0.11 },
  // E — on the top wall below the WiggleWoo Character piece.
  // Visible at Stop 12 where the camera looks north at the artwork.
  { char: "E", position: [15.5, 0.8, 0.99], rotation: [0, Math.PI, 0], size: 0.13 },
  // V — on the bottom wall below the JB TV piece.
  // Visible at Stop 4 where the camera looks south at the artwork.
  { char: "V", position: [7.0, 0.8, -3.99], size: 0.13 },
  // 7 — laid flat on the floor in front of the Service pedestal row.
  // Visible at Stop 14 where the camera is elevated (y=2.8) and tilts down
  // at the pedestals, so the floor is inside the frame.
  { char: "7", position: [16, 0.02, -1.5], rotation: [-Math.PI / 2, 0, 0], size: 0.16 },
];

// Music-room piece cycle (left-to-right pan order). Each entry is the world
// point the camera should look at when that piece is selected on the remote.
// Indices 2 and 4 are the two TVs — see MUSIC_ROOM_LEFT_TV_IDX / _RIGHT_TV_IDX
// in MusicRoom.tsx.
const MUSIC_ROOM_PIECES: ReadonlyArray<{
  name: string;
  lookAt: [number, number, number];
}> = [
  { name: "Album I",     lookAt: [29.5, 1.7, -5.98] },
  { name: "Album II",    lookAt: [31.5, 1.7, -5.98] },
  { name: "Left Screen", lookAt: [27.0, 2.8, -3.5] },
  { name: "Media Board", lookAt: [33.99, 1.7, 0] },
  { name: "Right Screen",lookAt: [27.0, 2.8, 3.5] },
  { name: "Album III",   lookAt: [29.5, 1.7, 5.98] },
  { name: "Album IV",    lookAt: [31.5, 1.7, 5.98] },
];

// Guided tour dwell — how long to sit at each stop AFTER the camera has
// fully settled. Flat 3s at every real content stop. Tech Vault doorway is
// a pass-through waypoint in guided mode (the tour flies straight into the
// vault cases from there, not a piece to look at), so it's exempt.
function guidedDwellMs(stop: (typeof STOPS)[number]): number {
  if (stop.label === "Tech Vault") return 150;
  return 3000;
}

export default function GalleryScene() {
  // useProgress works outside the Canvas — it reads a global Zustand store
  // populated by Three.js's DefaultLoadingManager as textures/models load.
  const { progress: loadProgress } = useProgress();
  const sceneLoaded = loadProgress >= 100;

  const [entered, setEntered] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionMeta | null>(null);
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  // Starts in manual; user opts into guided via the map or toggle.
  const [mode, setMode] = useState<"guided" | "manual">("manual");
  const AUTO_TOUR_ENABLED = true;
  const [progress, setProgress] = useState(0);
  const [currentLabel, setCurrentLabel] = useState("Entrance");
  const [mapOpen, setMapOpen] = useState(false);
  const [portalStage, setPortalStage] = useState<"none" | "entering" | "inside" | "exiting">("none");
  // Which hidden portal is currently active — drives which room the camera
  // transitions into and which room component GalleryRoom mounts.
  const [activePortal, setActivePortal] = useState<"music" | "study" | "tribute" | null>(null);
  // Tribute room audio — starts muted; user can fade it in via the unmute
  // pill rendered bottom-right while inside the room.
  const tributeAudioRef = useRef<HTMLAudioElement | null>(null);
  const [tributeMuted, setTributeMuted] = useState(true);
  // Tribute bench seated state — toggled by clicking the wooden bench.
  // When seated, the camera lerps to a closer, lower view at eye-level
  // with the photo. Resets whenever the user exits the room.
  const [tributeSeated, setTributeSeated] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  // Active direct A→B camera override — used for vault-to-vault jumps so the
  // camera flies straight between two vault stops instead of sweeping through
  // every gallery stop between them on the STOPS index axis.
  const [directSnap, setDirectSnap] = useState<{
    pos: [number, number, number];
    lookAt: [number, number, number];
    targetIdx: number;
  } | null>(null);
  // Guided tour pauses at the Tech Vault doorway so the user can choose whether
  // to enter the vault and tour each glass display, or skip straight to the
  // next gallery piece.
  const [vaultPromptOpen, setVaultPromptOpen] = useState(false);
  // Music-room remote — power toggles TV audio, pieceIdx drives the camera
  // and which TV plays. Default: Media Board (center).
  const [musicRoomPower, setMusicRoomPower] = useState(false);
  const [musicRoomPieceIdx, setMusicRoomPieceIdx] = useState(3);

  // Study remote — pieceIdx drives camera (Welcome first). Bookshelf piece has
  // a secondary "book title" cycler that highlights the matching book in 3D.
  const [studyPieceIdx, setStudyPieceIdx] = useState(STUDY_DEFAULT_PIECE_IDX);
  const [studyBookIdx, setStudyBookIdx] = useState(0);

  // Scavenger hunt state (hidden Founder's Study unlock).
  const [foundLetters, setFoundLetters] = useState<string[]>([]);
  const [studyUnlocked, setStudyUnlocked] = useState(false);
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [keypadInput, setKeypadInput] = useState("");
  const [keypadShake, setKeypadShake] = useState(false);
  // Flipped by the keypad-success path / re-tap of the painting. A useEffect
  // further down picks it up and actually fires the portal entry so we
  // don't have to reference handlers that are declared later in render.
  const [pendingStudyEnter, setPendingStudyEnter] = useState(false);
  const allLettersFound = foundLetters.length >= STUDY_REQUIRED_LETTERS.length;

  // One-time hunt hint shown after the user enters the gallery so they know
  // there's a scavenger hunt + hidden room to unlock. Dismiss button + any
  // first-letter collection marks it "seen" and it won't show again.
  const [huntHintVisible, setHuntHintVisible] = useState(false);
  const [huntHintSeen, setHuntHintSeen] = useState(true); // true until hydrated to avoid flash

  // Throne / winner popup state machine. Fires after a successful keypad
  // submit — checks the server-side "first solver" flag, then shows either
  // the winner form or the "throne claimed" waitlist popup before letting
  // the user into the 3D room.
  type ThroneStage =
    | "idle"
    | "checking"
    | "winner-form"
    | "submitting"
    | "won"
    | "claimed"
    | "waitlist-submitting"
    | "waitlist-done"
    | "error";
  const [throneStage, setThroneStage] = useState<ThroneStage>("idle");
  const [throneError, setThroneError] = useState<string | null>(null);
  const [winnerForm, setWinnerForm] = useState({
    name: "",
    email: "",
    social: "",
    idea: "",
  });
  const [waitlistEmail, setWaitlistEmail] = useState("");

  // Hydrate from localStorage on first mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STUDY_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as {
          foundLetters?: string[];
          studyUnlocked?: boolean;
        };
        if (Array.isArray(saved.foundLetters)) setFoundLetters(saved.foundLetters);
        if (saved.studyUnlocked) setStudyUnlocked(true);
      }
    } catch {
      // ignore corrupt storage
    }
    // Hunt hint — only new visitors should see it.
    setHuntHintSeen(localStorage.getItem(HUNT_HINT_STORAGE_KEY) === "1");
  }, []);

  // Persist whenever progress changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      STUDY_STORAGE_KEY,
      JSON.stringify({ foundLetters, studyUnlocked })
    );
  }, [foundLetters, studyUnlocked]);

  const dismissHuntHint = useCallback(() => {
    setHuntHintVisible(false);
    setHuntHintSeen(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(HUNT_HINT_STORAGE_KEY, "1");
    }
  }, []);

  const handleLetterCollect = useCallback((char: string) => {
    setFoundLetters((prev) => (prev.includes(char) ? prev : [...prev, char]));
    // First letter collected = user discovered the hunt on their own.
    // No need to keep the hint around.
    dismissHuntHint();
  }, [dismissHuntHint]);

  // Reveal the hunt hint shortly after the user enters the gallery, so
  // they know there's a scavenger hunt + hidden room to find. Skipped if
  // they've already seen it, already unlocked the study, or are currently
  // in a portal / modal.
  useEffect(() => {
    if (!entered) return;
    if (huntHintSeen) return;
    if (studyUnlocked) return;
    const t = setTimeout(() => setHuntHintVisible(true), HUNT_HINT_DELAY_MS);
    return () => clearTimeout(t);
  }, [entered, huntHintSeen, studyUnlocked]);

  // Left-side painting click. If the user hasn't unlocked yet → open the
  // keypad. If already unlocked → fly straight into the 3D Founder's Study.
  const handleStudyPortalClick = useCallback(() => {
    if (studyUnlocked) {
      setPendingStudyEnter(true);
      return;
    }
    setKeypadOpen(true);
    setKeypadInput("");
  }, [studyUnlocked]);

  const submitKeypad = useCallback(() => {
    const normalized = keypadInput.replace(/-/g, "").toUpperCase();
    if (!allLettersFound) {
      // Refuse submissions until the user has done the hunt.
      setKeypadShake(true);
      setTimeout(() => setKeypadShake(false), 400);
      return;
    }
    if (normalized === STUDY_CODE) {
      setKeypadOpen(false);
      setStudyUnlocked(true);
      // Before flying into the 3D room, check the server to see whether
      // this solver is the first-ever and deserves the prize popup.
      setThroneStage("checking");
    } else {
      setKeypadShake(true);
      setTimeout(() => {
        setKeypadShake(false);
        setKeypadInput("");
      }, 400);
    }
  }, [keypadInput, allLettersFound]);

  const appendKeypad = useCallback((key: string) => {
    setKeypadInput((prev) => (prev.length >= 7 ? prev : prev + key));
  }, []);
  const backspaceKeypad = useCallback(() => {
    setKeypadInput((prev) => prev.slice(0, -1));
  }, []);

  // Mobile detection — narrow-viewport tweaks (touch joystick, wider FOV,
  // tribute room's flattened layout, etc). The hidden rooms (music/study)
  // render the same real 3D room regardless of this flag.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const autoTour = mode === "guided";
  const setAutoTour = useCallback((v: boolean) => setMode(v ? "guided" : "manual"), []);
  const portalActive = portalStage !== "none";

  // The target progress (0 to LAST). Camera smoothly follows this.
  const targetRef = useRef(0);
  const [target, setTarget] = useState(0);
  const scrollAccum = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const portalReturnStop = useRef<number>(PORTAL_STOP);
  const snapRef = useRef(false);
  const anyOverlayOpen = !!selectedProject || !!selectedPrediction || !!activePanel || mapOpen;

  // --- Third-person character -------------------------------------------
  // Proxy object: whenever a scripted move (guided tour / next-prev / map
  // jump / entrance) is in flight, GalleryRoom's existing STOPS/camera math
  // writes into this instead of the real camera, and CharacterController
  // walks the character toward it. During portals, GalleryRoom writes to the
  // real camera directly (navTarget omitted) — portal rooms are untouched.
  const navProxy = useMemo(() => new THREE.Object3D(), []);
  const characterStateRef = useRef<CharacterOutState>({ position: new THREE.Vector3(0, 0, 1.5), yaw: 0 });
  const joystickInputRef = useRef({ forward: 0, turn: 0 });
  // Authoritative instant-teleport channel to CharacterController — see
  // snapCharacterTo below for why this replaced polling-for-convergence.
  const snapTargetRef = useRef({ signal: 0, position: [0, 0, 0] as [number, number, number], yaw: 0 });

  // Pre-entry, GalleryRoom must keep driving the real camera (today's static
  // establishing shot) rather than the character proxy — same for portals.
  const useRealCameraDirectly = !entered || portalActive;
  const scriptedNavActive = useRealCameraDirectly || autoTour || snapRef.current || !!directSnap;
  const characterControlMode: "free" | "scripted" = scriptedNavActive ? "scripted" : "free";
  const galleryRoomCameraDisabled = !scriptedNavActive;
  const showCharacter = entered && !portalActive;

  // STOPS[0] ("WiggleWoo's Word Quest") sits at z=1.5, only 0.5 units from the
  // entry chamber's back wall (z=2) — fine for a first-person eye position,
  // but a 3rd-person camera pulled back behind the character at that spot
  // ends up embedded in/behind that wall (the Phase 3 "flat brown screen"
  // bug). Nudge the spawn deeper into the room so the follow camera has
  // clearance. Same x/yaw as STOPS[0], so the initial framing is still close
  // to the original entrance view.
  const characterSpawn = useMemo(() => {
    const [px, , pz] = STOPS[0].pos;
    const [lx, , lz] = STOPS[0].lookAt;
    const yaw = Math.atan2(-(lx - px), -(lz - pz));
    return { position: [px, 0, pz - 1.9] as [number, number, number], yaw };
  }, []);

  // Known-open fallback for the debug "Reset View" button — the main gallery
  // hall (STOPS[1]) has no nearby walls in any direction.
  const RESET_VIEW_SPAWN = useMemo(() => {
    const stop = STOPS.find((s) => s.label === "Main Gallery") ?? STOPS[1];
    const [px, , pz] = stop.pos;
    const [lx, , lz] = stop.lookAt;
    const yaw = Math.atan2(-(lx - px), -(lz - pz));
    return { position: [px, 0, pz] as [number, number, number], yaw };
  }, []);

  // Dev-only diagnostics — gated on NODE_ENV below so this never renders (or
  // ships) in production, but stays available locally via `npm run dev`.
  // One-click hide for clean screenshots — panel comes back on next reload
  // or by clicking the small pill it leaves behind.
  const [debugHidden, setDebugHidden] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const cameraDebugRef = useRef<{ camPos: THREE.Vector3; camLook: THREE.Vector3 }>({
    camPos: new THREE.Vector3(),
    camLook: new THREE.Vector3(),
  });
  const fpsRef = useRef(0);
  const [quality, setQuality] = useState<"high" | "balanced">("high");
  // Counts how many times controlMode has actually transitioned since mount —
  // stays at 1 if it settles into "free" and never flickers back to "scripted".
  const modeChangeCountRef = useRef(0);
  useEffect(() => {
    modeChangeCountRef.current += 1;
  }, [characterControlMode]);

  const [debugHudText, setDebugHudText] = useState("");
  useEffect(() => {
    // 2x/sec — enough to read live, far below the 60fps hot path (and this
    // is the only state update this diagnostics panel causes).
    const id = setInterval(() => {
      const c = characterStateRef.current;
      const cam = cameraDebugRef.current;
      setDebugHudText(
        `FPS: ${fpsRef.current.toFixed(0)}   QUALITY: ${quality.toUpperCase()}\n` +
          `MODE: ${characterControlMode.toUpperCase()}  (changed ${modeChangeCountRef.current}x)\n` +
          `char pos: ${c.position.x.toFixed(2)}, ${c.position.y.toFixed(2)}, ${c.position.z.toFixed(2)}  yaw: ${c.yaw.toFixed(2)}\n` +
          `cam pos:  ${cam.camPos.x.toFixed(2)}, ${cam.camPos.y.toFixed(2)}, ${cam.camPos.z.toFixed(2)}\n` +
          `navProxy: ${navProxy.position.x.toFixed(2)}, ${navProxy.position.y.toFixed(2)}, ${navProxy.position.z.toFixed(2)}\n` +
          `showCharacter: ${showCharacter}  autoTour: ${autoTour}  snapping: ${snapRef.current}\n` +
          `target: ${targetRef.current.toFixed(2)}  directSnap: ${directSnap ? `${directSnap.targetIdx}(${STOPS[directSnap.targetIdx]?.label})` : "null"}  pending: [${pendingWaypoints.current.join(",")}]`
      );
    }, 500);
    return () => clearInterval(id);
  }, [navProxy, characterControlMode, showCharacter, autoTour, quality, directSnap]);

  // Sync ref with state (ref for non-render reads, state for passing to Canvas).
  // Clamp to the full STOPS range so the map can directly address hidden stops
  // (vault cases, portal approach). LAST is reserved for scroll-input ranges.
  const updateTarget = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(STOPS.length - 1, v));
    targetRef.current = clamped;
    setTarget(clamped);
  }, []);

  // Audio
  useEffect(() => {
    audioRef.current = new Audio("/audio/gallery-vibes.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    // Tribute audio — placeholder filename, swap by dropping a different
    // mp3 at /public/audio/tribute-room.mp3.
    tributeAudioRef.current = new Audio("/audio/tribute-room.mp3");
    tributeAudioRef.current.loop = true;
    tributeAudioRef.current.volume = 0;
    return () => {
      audioRef.current?.pause();
      tributeAudioRef.current?.pause();
    };
  }, []);

  // Mobile audio unlock — retry playback on first user interaction after enter
  useEffect(() => {
    if (!entered || !musicPlaying) return;
    const tryPlay = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    };
    document.addEventListener("touchstart", tryPlay, { once: true });
    document.addEventListener("click", tryPlay, { once: true });
    return () => {
      document.removeEventListener("touchstart", tryPlay);
      document.removeEventListener("click", tryPlay);
    };
  }, [entered, musicPlaying]);

  const mainGalleryStopIdx = useMemo(
    () => STOPS.findIndex((s) => s.label === "Main Gallery"),
    []
  );
  const techVaultDoorwayIdx = useMemo(
    () => STOPS.findIndex((s) => s.label === "Tech Vault"),
    []
  );

  // Guided tour stop sequence. The vault cases aren't adjacent to the gallery
  // stops in the STOPS array, so the tour visits them as a detour right after
  // the Tech Vault doorway peek. Snake order across the cases (back row L→R,
  // then front row R→L) so the camera doesn't jog across the vault.
  const GUIDED_SEQUENCE = useMemo<number[]>(() => {
    const vaultOrder = [0, 1, 2, 6, 5, 4, 3].map((o) => VAULT_CASE_START + o);
    const seq: number[] = [];
    for (let i = 0; i <= TOUR_LAST; i++) {
      seq.push(i);
      if (i === techVaultDoorwayIdx) seq.push(...vaultOrder);
    }
    return seq;
  }, [techVaultDoorwayIdx]);

  // True when a stop→stop transition would otherwise detour through unrelated
  // positions on the STOPS index axis (e.g. doorway idx 2 → vault case idx 16
  // would visit every gallery stop between them). Non-adjacent stops get a
  // direct A→B camera lerp instead.
  const transitionNeedsDirectSnap = useCallback(
    (fromIdx: number, toIdx: number) => Math.abs(fromIdx - toIdx) > 1,
    []
  );

  // --- Doorway-aware routing for direct-snap jumps ---------------------
  // A raw direct-snap draws one straight line between two arbitrary points,
  // which is safe within the open corridor (Entry Chamber + Main Gallery +
  // Gallery II are all one continuous space) but cuts through a solid wall
  // whenever the jump crosses into/out of one of the two side rooms — e.g. a
  // straight line from "The Authenticity Shift" (deep in the Predictions
  // Wing alcove) to "Tech Vault" crosses the Main Gallery's south wall well
  // outside the doorway gap. Each side room's doorway threshold is already a
  // real STOPS entry, so routing a cross-zone jump through that stop first
  // (as its own direct-snap hop) keeps every hop a straight line that stays
  // inside a doorway gap or the open corridor — verified by hand against the
  // actual wall/doorway coordinates for every zone pairing below.
  const PREDICTIONS_DOORWAY_IDX = 3; // "AI Predictions Wing" — sits at the x:-3.5..-1.5 doorway
  const TECH_VAULT_DOORWAY_IDX = 6; // "Tech Vault" — sits at the x:3..5 doorway
  const PREDICTIONS_ZONE_INDICES = new Set([3, 4]); // AI Predictions Wing, The Authenticity Shift

  const zoneOf = useCallback(
    (idx: number): "predictions" | "techvault" | "corridor" => {
      if (PREDICTIONS_ZONE_INDICES.has(idx)) return "predictions";
      if (idx === TECH_VAULT_DOORWAY_IDX || idx >= VAULT_CASE_START) return "techvault";
      return "corridor";
    },
    []
  );

  const doorwayIdxOf = useCallback(
    (zone: "predictions" | "techvault") => (zone === "predictions" ? PREDICTIONS_DOORWAY_IDX : TECH_VAULT_DOORWAY_IDX),
    []
  );

  // Stops on either side of the goat statue (x:9.3..10.7 astride the
  // corridor's spine) — a skip-jump directly between them (e.g. Lush Brows
  // -> RetroRack Logo) cuts straight through it despite both being in the
  // open "corridor" zone. "The Standard" (the goat's own viewing stop,
  // idx 12) is deliberately excluded — that's the intended close-up stop.
  // Indices shifted +1 from Carla's Creation onward after inserting the
  // Vision Minds Entertainment stop ahead of them in STOPS.
  const GOAT_WEST_INDICES = new Set([8, 9, 10, 11]); // Carla's Creation, JB TV, Lush Brows, RetroRack
  const GOAT_EAST_INDICES = new Set([13, 14, 15, 16, 17, 18, 19]); // RetroRack Logo .. Services

  // Returns the sequence of intermediate stop indices to hop through before
  // finally reaching toIdx — empty when a direct line between them doesn't
  // cross anything.
  //
  // Any corridor↔predictions crossing routes through BYPASS_PANEL_WEST_IDX
  // first: a straight line from the entrance-area corridor stops to the AI
  // Predictions Wing doorway (which is west, x=-2.5) technically threads the
  // gap beside the Entry Chamber's display panel (x:-0.95..0.95 @ z≈-1), but
  // only by a sliver — too tight for the character's own width, so it reads
  // as walking through the wall. Routing through a point that's actually
  // west of the panel with real clearance (and already on the destination's
  // side, so it costs no detour) keeps the character visibly walking around
  // it instead.
  const getWaypointRoute = useCallback(
    (fromIdx: number, toIdx: number): number[] => {
      const waypoints: number[] = [];
      const pushUnique = (idx: number) => {
        if (waypoints[waypoints.length - 1] !== idx) waypoints.push(idx);
      };

      if (GOAT_WEST_INDICES.has(fromIdx) && GOAT_EAST_INDICES.has(toIdx)) {
        pushUnique(BYPASS_GOAT_WEST_IDX);
        pushUnique(BYPASS_GOAT_EAST_IDX);
      } else if (GOAT_EAST_INDICES.has(fromIdx) && GOAT_WEST_INDICES.has(toIdx)) {
        pushUnique(BYPASS_GOAT_EAST_IDX);
        pushUnique(BYPASS_GOAT_WEST_IDX);
      }

      const fromZone = zoneOf(fromIdx);
      const toZone = zoneOf(toIdx);
      if (fromZone !== toZone) {
        if (fromZone === "corridor" && toZone === "predictions") pushUnique(BYPASS_PANEL_WEST_IDX);
        if (fromZone !== "corridor" && fromIdx !== doorwayIdxOf(fromZone)) pushUnique(doorwayIdxOf(fromZone));
        if (fromZone === "predictions" && toZone === "corridor") pushUnique(BYPASS_PANEL_WEST_IDX);
        if (toZone !== "corridor" && toIdx !== doorwayIdxOf(toZone)) pushUnique(doorwayIdxOf(toZone));
      }
      return waypoints;
    },
    [zoneOf, doorwayIdxOf]
  );

  // Queue of remaining hops (intermediate waypoints + the final destination)
  // for an in-flight doorway-routed jump. Consumed one at a time by
  // handleDirectSnapDone below.
  const pendingWaypoints = useRef<number[]>([]);

  // Shared navigation — the single, reusable "move the camera to stop N"
  // function. Both manual map clicks and the guided state machine call this;
  // neither has its own movement path. Mode changes are the caller's job.
  const goToStop = useCallback((index: number) => {
    // Cancel any in-flight direct-snap/routed jump — GalleryRoom's useFrame
    // checks directSnap before the STOPS-lerp branch, so a stale non-null
    // value here would keep controlling the camera (finishing the OLD
    // request) and silently ignore this new one until it happened to arrive.
    setDirectSnap(null);
    pendingWaypoints.current = [];
    updateTarget(index);
    snapRef.current = true;
  }, [updateTarget]);

  // Same as goToStop, but picks the direct A→B lerp path when the jump would
  // cause a detour through unrelated STOPS-axis positions. Used by both manual
  // vault clicks and the guided state machine. Cross-zone jumps (corridor ↔
  // Predictions Wing ↔ Tech Vault) get routed through the relevant doorway
  // stop(s) first — see getWaypointRoute — instead of a single unrouted
  // direct-snap that can cut through a wall.
  const navigateToStop = useCallback((destIdx: number) => {
    const currentIdx = Math.round(targetRef.current);
    // Already there, or already mid-transition heading there — do nothing.
    // targetRef reflects the DESTINATION of any in-flight jump, not our
    // actual current position, so treating a repeat click on that same
    // destination as a fresh "currentIdx === destIdx, same zone, no routing
    // needed" request was silently discarding whatever routed multi-hop
    // path was already correctly carrying us there and falling back to a
    // raw, unrouted jump instead — worse than doing nothing.
    if (currentIdx === destIdx && (directSnap || pendingWaypoints.current.length > 0 || snapRef.current)) {
      return;
    }
    // Invalidate any queued hops from an interrupted previous routed jump —
    // this new request fully supersedes it.
    pendingWaypoints.current = [];
    const waypoints = getWaypointRoute(currentIdx, destIdx);
    if (waypoints.length > 0) {
      updateTarget(destIdx);
      snapRef.current = false;
      pendingWaypoints.current = [...waypoints, destIdx];
      const firstIdx = pendingWaypoints.current.shift()!;
      const first = STOPS[firstIdx];
      setDirectSnap({ pos: first.pos, lookAt: first.lookAt, targetIdx: firstIdx });
    } else if (transitionNeedsDirectSnap(currentIdx, destIdx)) {
      const dest = STOPS[destIdx];
      updateTarget(destIdx);
      snapRef.current = false;
      setDirectSnap({ pos: dest.pos, lookAt: dest.lookAt, targetIdx: destIdx });
    } else {
      goToStop(destIdx);
    }
  }, [goToStop, updateTarget, transitionNeedsDirectSnap, getWaypointRoute, directSnap]);

  // Handle map piece selection
  const handleMapSelect = useCallback((stopIndex: number) => {
    setMode("manual");
    navigateToStop(stopIndex);
  }, [navigateToStop]);

  // Guided state machine. Drives the tour by calling navigateToStop step by
  // step (same movement paths manual uses — STOPS lerp for adjacent stops,
  // direct A→B lerp for vault entry/exit). Waits for the camera to fully
  // settle at each stop (signalled by handleSnapDone or handleDirectSnapDone
  // → guidedSettleHandler), then dwells, then advances.
  const guidedSeqIdx = useRef(0);
  const guidedDwellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const guidedSettleHandler = useRef<(() => void) | null>(null);
  // Set when the tour is paused at the Tech Vault doorway waiting for the user
  // to pick "enter" or "skip". Cleared on resolution (or on cleanup).
  const guidedResumer = useRef<((choice: "enter" | "skip") => void) | null>(null);

  const consumeSettleHandler = useCallback(() => {
    const fn = guidedSettleHandler.current;
    if (fn) {
      guidedSettleHandler.current = null;
      fn();
    }
  }, []);

  // Both handleSnapDone and handleDirectSnapDone (at every hop, not just the
  // final one) fire when the camera PROXY reaches a target — not when the
  // character (which chases the proxy with its own lag) has actually walked
  // there. The previous approach polled characterStateRef with a timeout,
  // waiting for the lagged chase to visually converge before advancing —
  // but that timeout is wall-clock, while the chase's convergence rate is
  // tied to actual simulation frames. At low FPS the simulation barely
  // advances, so the poll routinely burned its full timeout doing nothing,
  // reading as the character "stopping" for a couple seconds at whatever
  // waypoint it was chasing, and could still hand off control before the
  // yaw genuinely finished turning (frozen facing the wrong way). Snapping
  // the character's position/yaw straight to the exact target the instant
  // arrival is confirmed sidesteps convergence entirely — it's correct by
  // construction, on the very next frame, regardless of frame rate.
  const snapCharacterTo = useCallback((stopIdx: number) => {
    const stop = STOPS[stopIdx];
    if (!stop) return;
    const [px, , pz] = stop.pos;
    const [lx, , lz] = stop.lookAt;
    const yawVal = Math.atan2(-(lx - px), -(lz - pz));
    snapTargetRef.current = {
      signal: snapTargetRef.current.signal + 1,
      position: [px, 0, pz],
      yaw: yawVal,
    };
  }, []);

  // Fires when GalleryRoom finishes a STOPS-axis snap.
  const handleSnapDone = useCallback(() => {
    snapCharacterTo(Math.round(targetRef.current));
    snapRef.current = false;
    consumeSettleHandler();
  }, [consumeSettleHandler, snapCharacterTo]);

  // Fires when GalleryRoom finishes a direct A→B lerp (vault entry/exit/hop).
  // If a doorway-routed jump (see navigateToStop/getWaypointRoute) left more
  // hops queued, advance to the next one instead of finishing — the guided
  // tour's settle-handler (vault enter/skip prompt) must only fire once, on
  // true final arrival, not after every intermediate doorway hop.
  //
  // Each intermediate hop snaps the character to the waypoint it just
  // reached before advancing the proxy to the next one — the character
  // genuinely visits every waypoint in order (never cutting a straight line
  // through an obstacle, which is the whole point of routing) without
  // needing to wait for a smooth chase to catch up first.
  const handleDirectSnapDone = useCallback(() => {
    if (directSnap) snapCharacterTo(directSnap.targetIdx);
    if (pendingWaypoints.current.length > 0) {
      const nextIdx = pendingWaypoints.current.shift()!;
      const next = STOPS[nextIdx];
      setDirectSnap({ pos: next.pos, lookAt: next.lookAt, targetIdx: nextIdx });
      return;
    }
    setDirectSnap(null);
    consumeSettleHandler();
  }, [consumeSettleHandler, directSnap, snapCharacterTo]);

  useEffect(() => {
    const guidedActive = entered && autoTour && !anyOverlayOpen && !portalActive;
    if (!guidedActive) return;

    // Find our position in the guided sequence. If the current stop isn't in
    // the sequence (e.g. sitting at the portal approach stop) or we're at the
    // end, start fresh from sequence[0].
    const currentStopIdx = Math.max(0, Math.round(targetRef.current));
    const seqIdxFromCurrent = GUIDED_SEQUENCE.indexOf(currentStopIdx);
    const wasAtEndOrUnknown =
      seqIdxFromCurrent < 0 || seqIdxFromCurrent >= GUIDED_SEQUENCE.length - 1;
    guidedSeqIdx.current = wasAtEndOrUnknown ? 0 : seqIdxFromCurrent;

    const scheduleDwell = () => {
      const stopIdx = GUIDED_SEQUENCE[guidedSeqIdx.current];

      // Tech Vault doorway — pause and let the user decide whether to enter
      // the vault or skip straight to the next gallery piece. No timer; the
      // tour resumes only when the user clicks a prompt button.
      if (stopIdx === techVaultDoorwayIdx) {
        setVaultPromptOpen(true);
        guidedResumer.current = (choice) => {
          setVaultPromptOpen(false);
          guidedResumer.current = null;
          if (choice === "enter") {
            // Next sequence entry is the first vault case — advance normally.
            advance();
          } else {
            // Jump past all vault cases in the sequence, then advance to the
            // next gallery stop (Carla's).
            guidedSeqIdx.current += VAULT_CASE_COUNT;
            advance();
          }
        };
        return;
      }

      const stop = STOPS[stopIdx];
      guidedDwellTimer.current = setTimeout(() => {
        guidedDwellTimer.current = null;
        advance();
      }, guidedDwellMs(stop));
    };

    const advance = () => {
      const nextSeqIdx = guidedSeqIdx.current + 1;
      if (nextSeqIdx >= GUIDED_SEQUENCE.length) {
        // Tour complete — hand control back to the user.
        setMode("manual");
        setMapOpen(true);
        return;
      }
      guidedSeqIdx.current = nextSeqIdx;
      guidedSettleHandler.current = scheduleDwell;
      navigateToStop(GUIDED_SEQUENCE[nextSeqIdx]);
    };

    // Kick off. If we had to reset (user was at the tour end / unknown stop),
    // fly to the first stop and dwell there so they see it. If we're already
    // sitting at the Tech Vault doorway (e.g. prompt was interrupted by an
    // overlay), re-open the prompt rather than auto-advancing into the vault.
    // Otherwise skip the initial dwell and move to the next stop immediately.
    const startStopIdx = GUIDED_SEQUENCE[guidedSeqIdx.current];
    if (wasAtEndOrUnknown) {
      guidedSettleHandler.current = scheduleDwell;
      navigateToStop(startStopIdx);
    } else if (startStopIdx === techVaultDoorwayIdx) {
      scheduleDwell();
    } else {
      advance();
    }

    return () => {
      if (guidedDwellTimer.current) {
        clearTimeout(guidedDwellTimer.current);
        guidedDwellTimer.current = null;
      }
      guidedSettleHandler.current = null;
      guidedResumer.current = null;
      setVaultPromptOpen(false);
    };
  }, [entered, autoTour, anyOverlayOpen, portalActive, navigateToStop, GUIDED_SEQUENCE, techVaultDoorwayIdx]);

  // Tech Vault state — user is "inside" the vault at the Tech Vault stop or any
  // of the hidden case stops. The case key (null or "backend"/"aicore"/...) is
  // derived from the label so the TechVaultMap can highlight the active case.
  const insideVault =
    currentLabel === "Tech Vault" || currentLabel.startsWith("__vault_");
  const currentCaseKey = currentLabel.startsWith("__vault_")
    ? currentLabel.replace("__vault_", "")
    : null;
  const handleVaultCaseSelect = useCallback(
    (caseIdx: number) => {
      setMode("manual");
      navigateToStop(VAULT_CASE_START + caseIdx);
    },
    [navigateToStop]
  );
  const handleVaultReturn = useCallback(() => {
    setMode("manual");
    setDirectSnap(null);
    navigateToStop(mainGalleryStopIdx);
  }, [navigateToStop, mainGalleryStopIdx]);

  // AI Predictions Wing state — mirrors insideVault/TechVaultMap above.
  // Individual predictions never get their own STOPS entry (that clutters
  // the main nav worse every month) — the wing's own map lists all of them
  // directly, and picking one opens the modal in place rather than moving
  // the camera to a dedicated position per prediction.
  const insidePredictionsWing =
    currentLabel === "AI Predictions Wing" || currentLabel === "__predictions_alcove";
  const handleSelectPrediction = useCallback((slug: string) => {
    const found = getPublishedPredictions().find((p) => p.slug === slug) ?? null;
    setSelectedPrediction(found);
  }, []);
  const handlePredictionsWingReturn = useCallback(() => {
    setMode("manual");
    setDirectSnap(null);
    navigateToStop(mainGalleryStopIdx);
  }, [navigateToStop, mainGalleryStopIdx]);

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return;
    if (musicPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setMusicPlaying(!musicPlaying);
  }, [musicPlaying]);

  const handleEnter = useCallback(() => {
    setEntered(true);
    audioRef.current?.play().catch(() => {});
    setMusicPlaying(true);
    // Hold the map off until the intro fade + first gallery frame settle.
    // Exit is 200ms; 400ms beat for the first piece to read.
    setTimeout(() => setMapOpen(true), 600);
  }, []);

  // Fade helper — ramps a single audio element to targetVol over durationMs
  const fadeAudio = useCallback((el: HTMLAudioElement | null, targetVol: number, durationMs: number) => {
    if (!el) return;
    const start = el.volume;
    const delta = targetVol - start;
    const startT = performance.now();
    const step = () => {
      const t = Math.min(1, (performance.now() - startT) / durationMs);
      el.volume = Math.max(0, Math.min(1, start + delta * t));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);

  const handlePortalEnter = useCallback(() => {
    if (portalStage !== "none") return;
    // Return to wherever the user was (portal stop by default, but Book works too if proximity allows)
    portalReturnStop.current = Math.max(0, Math.min(LAST, Math.round(targetRef.current)));
    setMode("manual"); // auto-tour paused during portal
    setActivePortal("music");
    setPortalStage("entering");
    // Reset remote state — power off, start centered on the Media Board.
    setMusicRoomPower(false);
    setMusicRoomPieceIdx(3);
    // Fade gallery music down so the music room starts silent (the user
    // drives audio from the in-room remote).
    if (audioRef.current && musicPlaying) fadeAudio(audioRef.current, 0, 900);
    // After animation, we're "inside" the room
    setTimeout(() => {
      setPortalStage((s) => (s === "entering" ? "inside" : s));
    }, PORTAL_ANIM_MS);
  }, [portalStage, fadeAudio, musicPlaying]);

  // Symmetric handler for the Founder's Study portal. Uses the same camera
  // override machinery as the music portal but flies toward STUDY_ROOM_CAMERA.
  const handleStudyPortalEnterPortal = useCallback(() => {
    if (portalStage !== "none") return;
    portalReturnStop.current = Math.max(0, Math.min(LAST, Math.round(targetRef.current)));
    setMode("manual");
    setActivePortal("study");
    setPortalStage("entering");
    // Reset the study remote so every visit starts on the Welcome plaque
    // with no book highlighted.
    setStudyPieceIdx(STUDY_DEFAULT_PIECE_IDX);
    setStudyBookIdx(0);
    if (audioRef.current && musicPlaying) fadeAudio(audioRef.current, 0, 900);
    setTimeout(() => {
      setPortalStage((s) => (s === "entering" ? "inside" : s));
    }, PORTAL_ANIM_MS);
  }, [portalStage, fadeAudio, musicPlaying]);

  // Tribute portal — flies the camera into the lantern garden. Always starts
  // muted; the user opts in to ambient audio via the unmute pill.
  const handleTributePortalClick = useCallback(() => {
    if (portalStage !== "none") return;
    portalReturnStop.current = Math.max(0, Math.min(LAST, Math.round(targetRef.current)));
    setMode("manual");
    setActivePortal("tribute");
    setPortalStage("entering");
    setTributeMuted(true);
    setTributeSeated(false);
    if (audioRef.current && musicPlaying) fadeAudio(audioRef.current, 0, 900);
    setTimeout(() => {
      setPortalStage((s) => (s === "entering" ? "inside" : s));
    }, PORTAL_ANIM_MS);
  }, [portalStage, fadeAudio, musicPlaying]);

  // Bench click — toggles between standing-entry and seated views. The
  // override pos/lookAt swap immediately and the existing portal lerp
  // smoothly drives the camera between them. No new flight logic.
  const handleTributeBenchClick = useCallback(() => {
    setTributeSeated((s) => !s);
  }, []);

  // Unmute / mute the tribute audio with a gentle fade so it never starts
  // abruptly.
  const toggleTributeAudio = useCallback(() => {
    setTributeMuted((wasMuted) => {
      const willPlay = wasMuted; // toggling: was muted -> now playing
      if (!tributeAudioRef.current) return !wasMuted;
      if (willPlay) {
        tributeAudioRef.current.volume = 0;
        tributeAudioRef.current.play().catch(() => {});
        fadeAudio(tributeAudioRef.current, 0.18, 2200);
      } else {
        fadeAudio(tributeAudioRef.current, 0, 700);
        const ref = tributeAudioRef.current;
        setTimeout(() => ref?.pause(), 750);
      }
      return !wasMuted;
    });
  }, [fadeAudio]);

  // Study remote handlers — cycle pieces or (when Bookshelf is selected)
  // cycle individual book titles so the label reveals each title in turn.
  const studyBookshelfIdx = useMemo(
    () => STUDY_PIECES.findIndex((p) => p.name === "Bookshelf"),
    []
  );
  const isStudyOnBookshelf = studyPieceIdx === studyBookshelfIdx;
  const nextStudyPiece = useCallback(() => {
    if (studyPieceIdx === studyBookshelfIdx) {
      setStudyBookIdx((i) => (i + 1) % STUDY_BOOK_TITLES.length);
      return;
    }
    setStudyPieceIdx((i) => (i + 1) % STUDY_PIECES.length);
  }, [studyPieceIdx, studyBookshelfIdx]);
  const prevStudyPiece = useCallback(() => {
    if (studyPieceIdx === studyBookshelfIdx) {
      setStudyBookIdx(
        (i) => (i - 1 + STUDY_BOOK_TITLES.length) % STUDY_BOOK_TITLES.length
      );
      return;
    }
    setStudyPieceIdx(
      (i) => (i - 1 + STUDY_PIECES.length) % STUDY_PIECES.length
    );
  }, [studyPieceIdx, studyBookshelfIdx]);
  // Exit book-browsing mode from the remote — next tap jumps to the next
  // piece instead of the next book.
  const nextStudyRoomPiece = useCallback(() => {
    setStudyPieceIdx((i) => (i + 1) % STUDY_PIECES.length);
  }, []);
  const prevStudyRoomPiece = useCallback(() => {
    setStudyPieceIdx(
      (i) => (i - 1 + STUDY_PIECES.length) % STUDY_PIECES.length
    );
  }, []);

  // Consume the pending-study-enter flag set by keypad success or re-tap of
  // the already-unlocked painting. Done here (after handler definition) to
  // avoid hoisting issues with the keypad handlers declared earlier.
  useEffect(() => {
    if (!pendingStudyEnter) return;
    setPendingStudyEnter(false);
    handleStudyPortalEnterPortal();
  }, [pendingStudyEnter, handleStudyPortalEnterPortal]);

  // Throne check — fires when the state machine enters "checking". Asks the
  // server whether the prize has already been claimed, then routes to the
  // appropriate popup. On network failure we fail open (skip popup, enter).
  useEffect(() => {
    if (throneStage !== "checking") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/throne/state", { cache: "no-store" });
        const data = (await res.json()) as { claimed?: boolean };
        if (cancelled) return;
        setThroneStage(data.claimed ? "claimed" : "winner-form");
      } catch {
        if (cancelled) return;
        // API unreachable — don't block entry.
        setThroneStage("idle");
        setPendingStudyEnter(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [throneStage]);

  const submitThroneClaim = useCallback(async () => {
    const name = winnerForm.name.trim();
    const email = winnerForm.email.trim();
    if (!name || !email) return;
    setThroneStage("submitting");
    setThroneError(null);
    try {
      const res = await fetch("/api/throne/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(winnerForm),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (data.ok) {
        setThroneStage("won");
        // Let the user read the win moment, then fly into the 3D room.
        setTimeout(() => {
          setThroneStage("idle");
          setPendingStudyEnter(true);
        }, 3000);
      } else if (data.error === "already_claimed") {
        // Race lost — someone else won in the last few seconds.
        setThroneStage("claimed");
      } else {
        setThroneError("Couldn't submit. Please try again.");
        setThroneStage("error");
      }
    } catch {
      setThroneError("Network error. Please try again.");
      setThroneStage("error");
    }
  }, [winnerForm]);

  const submitThroneWaitlist = useCallback(async () => {
    const email = waitlistEmail.trim();
    if (!email) return;
    setThroneStage("waitlist-submitting");
    setThroneError(null);
    try {
      const res = await fetch("/api/throne/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { ok?: boolean };
      if (data.ok) {
        setThroneStage("waitlist-done");
        setTimeout(() => {
          setThroneStage("idle");
          setPendingStudyEnter(true);
        }, 2000);
      } else {
        setThroneError("Couldn't join the waitlist.");
        setThroneStage("error");
      }
    } catch {
      setThroneError("Network error.");
      setThroneStage("error");
    }
  }, [waitlistEmail]);

  const skipThronePopup = useCallback(() => {
    setThroneStage("idle");
    setPendingStudyEnter(true);
  }, []);

  // Music-room remote handlers. Next/prev cycle through MUSIC_ROOM_PIECES;
  // togglePower flips audio for the currently-selected TV (handled in
  // MusicRoom via postMessage).
  const nextMusicPiece = useCallback(() => {
    setMusicRoomPieceIdx(
      (i) => (i + 1 + MUSIC_ROOM_PIECES.length) % MUSIC_ROOM_PIECES.length
    );
  }, []);
  const prevMusicPiece = useCallback(() => {
    setMusicRoomPieceIdx(
      (i) => (i - 1 + MUSIC_ROOM_PIECES.length) % MUSIC_ROOM_PIECES.length
    );
  }, []);
  const toggleMusicPower = useCallback(() => setMusicRoomPower((p) => !p), []);

  const musicRoomLookAt = MUSIC_ROOM_PIECES[musicRoomPieceIdx].lookAt;
  // Generic portal target — whichever hidden-room piece is selected.
  const portalTargetLookAt: [number, number, number] | null =
    portalStage === "inside"
      ? activePortal === "study"
        ? STUDY_PIECES[studyPieceIdx].lookAt
        : musicRoomLookAt
      : null;

  const handlePortalExit = useCallback(() => {
    if (portalStage !== "inside") return;
    setPortalStage("exiting");
    // Snap the gallery target to the return stop so STOPS resumes there cleanly after override releases
    updateTarget(portalReturnStop.current);
    snapRef.current = true;
    // Restore gallery music on the way out
    if (audioRef.current && musicPlaying) fadeAudio(audioRef.current, 0.3, 900);
    // Fade tribute audio out if it was playing.
    if (tributeAudioRef.current && !tributeMuted) {
      fadeAudio(tributeAudioRef.current, 0, 700);
      const ref = tributeAudioRef.current;
      setTimeout(() => ref?.pause(), 750);
    }
    setTimeout(() => {
      setPortalStage("none");
      setActivePortal(null);
      setTributeMuted(true);
      setTributeSeated(false);
    }, PORTAL_ANIM_MS);
  }, [portalStage, fadeAudio, updateTarget, musicPlaying, tributeMuted]);

  useEffect(() => {
    const t = setTimeout(() => { if (!entered) handleEnter(); }, 6000);
    return () => clearTimeout(t);
  }, [entered, handleEnter]);

  // Arrow keys: jump to next/prev stop (with press-and-hold repeat)
  useEffect(() => {
    let holdInterval: ReturnType<typeof setInterval> | null = null;
    const clearHold = () => { if (holdInterval) { clearInterval(holdInterval); holdInterval = null; } };

    const doNext = () => {
      setAutoTour(false);
      const current = Math.floor(targetRef.current);
      updateTarget(current >= LAST ? 0 : current + 1);
      snapRef.current = true;
    };
    const doPrev = () => {
      setAutoTour(false);
      const current = Math.ceil(targetRef.current);
      updateTarget(current <= 0 ? LAST : current - 1);
      snapRef.current = true;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!entered || e.repeat) return;
      // Esc exits the music room
      if (e.key === "Escape" && portalStage === "inside") {
        e.preventDefault();
        handlePortalExit();
        return;
      }
      if (anyOverlayOpen || portalActive) return;
      // E (or e) triggers the portal when the camera is close enough
      if ((e.key === "e" || e.key === "E") && portalReady) {
        e.preventDefault();
        handlePortalEnter();
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault(); doNext();
        clearHold();
        holdInterval = setInterval(doNext, 400);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault(); doPrev();
        clearHold();
        holdInterval = setInterval(doPrev, 400);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) clearHold();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); clearHold(); };
  }, [anyOverlayOpen, entered, updateTarget, setAutoTour, portalActive, portalStage, portalReady, handlePortalExit, handlePortalEnter]);

  // Prev/next button handlers — snap to exact stops
  const goNext = useCallback(() => {
    setAutoTour(false);
    const current = Math.floor(targetRef.current);
    const nextStop = current >= LAST ? 0 : current + 1;
    updateTarget(nextStop);
    snapRef.current = true;
  }, [updateTarget, setAutoTour]);

  const goPrev = useCallback(() => {
    setAutoTour(false);
    const current = Math.ceil(targetRef.current);
    const prevStop = current <= 0 ? LAST : current - 1;
    updateTarget(prevStop);
    snapRef.current = true;
  }, [updateTarget, setAutoTour]);

  // Override camera target derived from portal stage + which portal is
  // active. null = STOPS drive the camera.
  const portalOverride = (() => {
    if (portalStage === "exiting") {
      return {
        pos: STOPS[portalReturnStop.current].pos,
        lookAt: STOPS[portalReturnStop.current].lookAt,
      };
    }
    if (portalStage === "entering" || portalStage === "inside") {
      if (activePortal === "study") return STUDY_ROOM_CAMERA;
      if (activePortal === "tribute")
        return tributeSeated ? TRIBUTE_SEATED_CAMERA : TRIBUTE_ROOM_CAMERA;
      return MUSIC_ROOM_CAMERA;
    }
    return null;
  })();

  return (
    <div className="fixed inset-0">
      <Canvas
        shadows={quality === "high"}
        dpr={quality === "high" ? [1, 1.5] : [1, 1]}
        camera={{ fov: isMobile ? 78 : 55, near: 0.1, far: 100, position: [0, 1.7, 1.5] }}
        gl={{ antialias: false, alpha: false, powerPreference: "default", toneMapping: THREE.LinearToneMapping, toneMappingExposure: 1.6 }}
        style={{ background: "#050403" }}
        onPointerMissed={() => {
          if (portalStage === "inside") handlePortalExit();
        }}
      >
        <Suspense fallback={null}>
          <GalleryRoom
            quality={quality}
            onSelectProject={setSelectedProject}
            modalOpen={anyOverlayOpen}
            targetProgress={target}
            targetRef={targetRef}
            autoTour={autoTour && entered && !anyOverlayOpen && !portalActive}
            cameraDisabled={galleryRoomCameraDisabled}
            navTarget={useRealCameraDirectly ? undefined : navProxy}
            snapping={snapRef.current}
            onSnapDone={handleSnapDone}
            onProgressChange={setProgress}
            onLabelChange={setCurrentLabel}
            onOpenPanel={(panel) => setActivePanel(panel as PanelType)}
            onPortalEnter={handlePortalEnter}
            portalActive={portalActive}
            portalOverride={portalOverride}
            directSnap={directSnap}
            onDirectSnapDone={handleDirectSnapDone}
            onPortalProximityChange={setPortalReady}
            freeLook={portalStage === "inside"}
            musicRoomTargetLookAt={portalTargetLookAt}
            musicRoomPower={musicRoomPower}
            musicRoomPieceIdx={musicRoomPieceIdx}
            studyPieceIdx={studyPieceIdx}
            studyHighlightedBookIdx={isStudyOnBookshelf ? studyBookIdx : -1}
            hiddenLetters={studyUnlocked ? [] : HIDDEN_LETTERS}
            foundLetters={foundLetters}
            onLetterCollect={handleLetterCollect}
            onStudyPortalClick={handleStudyPortalClick}
            activePortal={activePortal}
            onHireMe={() => setActivePanel("commission")}
            onTributePortalClick={handleTributePortalClick}
            onTributeBenchClick={handleTributeBenchClick}
            onSelectPrediction={handleSelectPrediction}
            characterStateRef={characterStateRef}
          />
        </Suspense>

        <Suspense fallback={null}>
          <CharacterController
            active={showCharacter}
            controlMode={characterControlMode}
            navTarget={useRealCameraDirectly ? null : navProxy}
            joystickInputRef={joystickInputRef}
            spawn={characterSpawn}
            outState={characterStateRef}
            resetSignal={resetSignal}
            resetTo={RESET_VIEW_SPAWN}
            snapTargetRef={snapTargetRef}
          />
        </Suspense>
        <ThirdPersonCamera
          active={showCharacter}
          characterState={characterStateRef}
          resetSignal={resetSignal}
          debugState={cameraDebugRef}
        />
        <FPSMeter fpsRef={fpsRef} />
      </Canvas>

      {isMobile && entered && showCharacter && !anyOverlayOpen && (
        <MobileControls inputRef={joystickInputRef} />
      )}

      {/* Dev-only diagnostics — gated on NODE_ENV so it's never in the production
          build real visitors get, but stays available locally via `npm run dev`.
          Mobile gets a small tap-to-cycle-quality badge instead of the full panel — the full
          panel is sized for desktop and was covering the real nav buttons + joystick on phones. */}
      {process.env.NODE_ENV === "development" && entered && isMobile && (
        <button
          onClick={() => setQuality((q) => (q === "high" ? "balanced" : "high"))}
          className="fixed top-16 right-2 z-[200] whitespace-pre rounded bg-black/80 px-2 py-1 text-left font-mono text-[10px] text-lime-300"
        >
          {`FPS: ${fpsRef.current.toFixed(0)} · ${quality === "high" ? "High" : "Balanced"} (tap)\nchar: ${characterStateRef.current.position.x.toFixed(2)}, ${characterStateRef.current.position.z.toFixed(2)}  yaw: ${characterStateRef.current.yaw.toFixed(2)}\ntarget: ${targetRef.current.toFixed(2)}`}
        </button>
      )}
      {process.env.NODE_ENV === "development" && entered && !isMobile && debugHidden && (
        <button
          onClick={() => setDebugHidden(false)}
          className="fixed top-4 right-4 z-[200] rounded bg-black/80 px-2 py-1 font-mono text-[10px] text-lime-300"
        >
          Show Debug
        </button>
      )}
      {process.env.NODE_ENV === "development" && entered && !isMobile && !debugHidden && (
        <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 rounded-lg bg-black/80 p-3 font-mono text-[10px] leading-relaxed text-lime-300 whitespace-pre">
          <div className="flex items-start justify-between gap-2">
            {debugHudText}
            <button
              onClick={() => setDebugHidden(true)}
              className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-gallery-muted hover:bg-white/20"
            >
              Hide
            </button>
          </div>
          <div className="mt-1 flex gap-1">
            <button
              onClick={goPrev}
              className="flex-1 rounded bg-sky-500/20 px-2 py-1 text-[10px] uppercase tracking-wider text-sky-200 hover:bg-sky-500/30"
            >
              ◀ Prev Stop
            </button>
            <button
              onClick={goNext}
              className="flex-1 rounded bg-sky-500/20 px-2 py-1 text-[10px] uppercase tracking-wider text-sky-200 hover:bg-sky-500/30"
            >
              Next Stop ▶
            </button>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setResetSignal((n) => n + 1)}
              className="flex-1 rounded bg-lime-500/20 px-2 py-1 text-[10px] uppercase tracking-wider text-lime-200 hover:bg-lime-500/30"
            >
              Reset View
            </button>
            <button
              onClick={() => setQuality((q) => (q === "high" ? "balanced" : "high"))}
              className="flex-1 rounded bg-amber-500/20 px-2 py-1 text-[10px] uppercase tracking-wider text-amber-200 hover:bg-amber-500/30"
            >
              Quality: {quality === "high" ? "High" : "Balanced"}
            </button>
          </div>
        </div>
      )}

      {/* Intro — stays mounted until the user has clicked AND the 3D scene is
          fully loaded. This eliminates the "pop" that occurs when the canvas
          is revealed before textures/geometry have finished streaming in. */}
      <AnimatePresence>
        {(!entered || !sceneLoaded) && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#050403]"
          >
            {!entered ? (
              /* ── Normal intro state ── */
              <>
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.0, delay: 0.2 }} className="mb-4 text-[10px] font-medium uppercase tracking-[0.5em] text-gallery-accent/80">Welcome to the Gallery</motion.span>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0, delay: 0.6 }} className="text-center text-4xl font-extralight text-gallery-white md:text-6xl lg:text-7xl">Created by <span className="text-gallery-accent">Coach B</span></motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.3 }} className="mt-4 text-sm text-gallery-muted">Builder. Designer. Founder. Author.</motion.p>
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.9 }} onClick={handleEnter} className="mt-8 rounded-full border border-gallery-accent/40 px-6 py-2.5 text-xs font-medium tracking-wide text-gallery-accent transition-all hover:bg-gallery-accent hover:text-gallery-black">Enter the Gallery</motion.button>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 2.2 }}
                  onClick={() => { handleEnter(); setActivePanel("commission"); }}
                  className="mt-4 text-[10px] uppercase tracking-[0.28em] text-gallery-muted transition-colors hover:text-gallery-accent"
                >
                  Or start a project →
                </motion.button>
              </>
            ) : (
              /* ── Post-click loading state — scene still streaming in ── */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="h-px w-32 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full bg-gallery-accent"
                    animate={{ width: `${loadProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-gallery-muted">
                  Preparing gallery
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      {entered && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="absolute top-0 left-0 right-0 z-20 bg-black/40 backdrop-blur-md border-b border-white/5">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 md:px-8">
            <span className="text-sm font-light tracking-widest text-gallery-white">COACH B</span>
            <div className="hidden items-center gap-1 lg:flex">
              {([
                { label: "Enterprise", panel: "enterprise" as PanelType },
                { label: "Studio", panel: "studio" as PanelType },
                { label: "Book a Call", panel: "appointments" as PanelType },
                { label: "Contact", panel: "commission" as PanelType },
                { label: "Connect", panel: "connect" as PanelType },
              ]).map((item) => (
                <button key={item.label} onClick={() => setActivePanel(item.panel)} className={`rounded-full px-2.5 py-1 text-[10px] tracking-wide transition-all ${activePanel === item.panel ? "text-gallery-accent bg-gallery-accent-soft" : "text-gallery-muted hover:text-gallery-white"}`}>{item.label}</button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <AnimatePresence mode="wait">
                {currentLabel && (
                  <motion.span key={currentLabel} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="hidden text-[10px] uppercase tracking-[0.2em] text-gallery-accent md:block">{currentLabel}</motion.span>
                )}
              </AnimatePresence>
              {/* Persistent Hire Me CTA — opens the Commission Desk form so
                  visitors with intent never have to hunt for how to inquire. */}
              <button
                onClick={() => setActivePanel("commission")}
                className="rounded-full bg-gallery-accent px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-gallery-black transition-all hover:bg-gallery-accent/90"
              >
                Hire Me
              </button>
              {!portalActive && (
                <button onClick={() => setMapOpen(!mapOpen)} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-medium uppercase tracking-[0.18em] transition-all border ${mapOpen ? "border-gallery-accent/40 text-gallery-accent bg-gallery-accent/10" : "border-white/10 text-gallery-muted hover:text-gallery-white hover:border-white/20"}`} aria-label="Gallery Map">
                  <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                  Map
                </button>
              )}
              <button onClick={toggleMusic} className={`rounded-full p-1.5 transition-all border ${musicPlaying ? "border-gallery-accent/40 text-gallery-accent" : "border-white/10 text-gallery-muted"}`} aria-label={musicPlaying ? "Mute" : "Unmute"}>
                {musicPlaying ? <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.14v7.72A4.5 4.5 0 0016.5 12zM14 3.23v2.06A6.97 6.97 0 0121 12a6.97 6.97 0 01-7 6.71v2.06A9 9 0 0023 12 9 9 0 0014 3.23z" /></svg>
                : <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12A4.5 4.5 0 0014 8.14v2.12l2.45 2.45c.03-.2.05-.4.05-.71zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.92 8.92 0 0021 12a9 9 0 00-7-8.77v2.06A6.97 6.97 0 0121 12zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>}
              </button>
              {AUTO_TOUR_ENABLED && (
                <button onClick={() => { const next = mode === "guided" ? "manual" : "guided"; setMode(next); if (next === "manual") setMapOpen(true); else setMapOpen(false); }} className={`rounded-full px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] transition-all border ${mode === "guided" ? "border-gallery-accent/40 text-gallery-accent bg-gallery-accent/10" : "border-white/20 text-gallery-light bg-white/5"}`}>{mode === "guided" ? "Guided" : "Manual"}</button>
              )}
            </div>
          </div>
        </motion.div>
      )}


      {/* Progress bar */}
      {entered && (
        <div className="absolute bottom-4 left-8 right-8 z-20">
          <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gallery-accent transition-all duration-700" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      )}

      {/* Hunt hint — one-time nudge letting new visitors know there's a
          scavenger hunt + hidden room to unlock. Dismissed on X click,
          on first-letter collection, or once per browser (localStorage). */}
      <AnimatePresence>
        {huntHintVisible && entered && !studyUnlocked && !portalActive && !anyOverlayOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-16 right-4 z-30 w-[280px] rounded-xl border border-gallery-accent/30 bg-[#0c0a08]/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          >
            <button
              onClick={dismissHuntHint}
              aria-label="Dismiss"
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-gallery-muted transition-colors hover:text-gallery-accent"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mb-1 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.3em] text-gallery-accent">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
              Hidden Challenge
            </div>
            <h3 className="mb-2 text-[13px] font-medium text-gallery-white">
              Find the code.
            </h3>
            <p className="text-[11px] leading-relaxed text-gallery-muted">
              Three letters and one number are hidden around the gallery.
              Collect them all, enter the code, and unlock the Founder's Study.
              <span className="mt-1 block text-gallery-accent/80">
                First to solve wins a prize.
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual mode — "start auto tour" CTA. Bottom-center above the
          progress bar so it doesn't collide with the right-side hunt hint
          or the left-side gallery map. */}
      {AUTO_TOUR_ENABLED && entered && mode === "manual" && !anyOverlayOpen && !portalActive && (
        <button
          onClick={() => setMode("guided")}
          className="fixed bottom-12 left-1/2 z-20 -translate-x-1/2 rounded-full border border-gallery-accent/30 bg-black/60 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-gallery-accent backdrop-blur-sm transition-all hover:bg-gallery-accent hover:text-gallery-black"
        >
          Start Auto Tour
        </button>
      )}

      {/* Music-room exit hint */}
      <AnimatePresence>
        {portalStage === "inside" && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            onClick={handlePortalExit}
            className="fixed top-14 left-4 z-30 flex items-center gap-2 rounded-full border border-gallery-accent/40 bg-black/60 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] text-gallery-accent backdrop-blur-sm transition-all hover:bg-gallery-accent hover:text-gallery-black"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Exit Room
            <span className="hidden md:inline text-gallery-muted/60 ml-1">· Esc</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* "Press E" hint — moved into 3D space inside GalleryRoom, anchored
          just above the chess-king portal painting via drei <Html>. */}

      {/* Tribute room — desktop unmute pill (bottom-right). Lets the user
          opt into the ambient track without it ever starting abruptly. */}
      <AnimatePresence>
        {portalStage === "inside" && activePortal === "tribute" && !isMobile && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            onClick={toggleTributeAudio}
            aria-label={tributeMuted ? "Unmute ambient music" : "Mute ambient music"}
            className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full border border-white/15 bg-[#0c0a14]/90 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/70 backdrop-blur-md transition-colors hover:text-white"
          >
            {tributeMuted ? (
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12A4.5 4.5 0 0014 8.14v2.12l2.45 2.45c.03-.2.05-.4.05-.71zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.92 8.92 0 0021 12a9 9 0 00-7-8.77v2.06A6.97 6.97 0 0121 12zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.14v7.72A4.5 4.5 0 0016.5 12zM14 3.23v2.06A6.97 6.97 0 0121 12a6.97 6.97 0 01-7 6.71v2.06A9 9 0 0023 12 9 9 0 0014 3.23z" />
              </svg>
            )}
            {tributeMuted ? "Play music" : "Mute"}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Tribute room — mobile 2D overlay. On narrow viewports the 3D
          lantern garden is replaced with a quiet vertical layout: photo +
          plaque text + unmute pill. Same emotional weight, less GPU. */}
      <AnimatePresence>
        {isMobile && portalStage !== "none" && activePortal === "tribute" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="fixed inset-0 z-40 overflow-y-auto"
            style={{
              background:
                "radial-gradient(ellipse at center, #2a1f4a 0%, #1a1228 50%, #0a0612 100%)",
            }}
          >
            <div className="flex min-h-full flex-col items-center px-6 pb-32 pt-12 text-center">
              <div className="mb-2 text-[9px] font-medium uppercase tracking-[0.4em] text-amber-300/70">
                In Memory
              </div>
              <h2 className="mb-8 text-[15px] font-light tracking-[0.3em] text-white/85">
                A QUIET PLACE
              </h2>

              {/* Photo */}
              <div className="mb-8 w-[180px] overflow-hidden rounded-md border border-amber-300/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <img
                  src={TRIBUTE_PHOTO}
                  alt={TRIBUTE_NAME}
                  className="block h-auto w-full"
                />
              </div>

              {/* Plaque text */}
              <div className="mb-1 text-[16px] font-light tracking-[0.25em] text-amber-100/90">
                {TRIBUTE_NAME}
              </div>
              <div className="mb-6 text-[11px] font-light tracking-[0.3em] text-amber-100/60">
                {TRIBUTE_DATES}
              </div>
              <div className="mb-12 text-[13px] italic tracking-[0.18em] text-amber-100/85">
                {TRIBUTE_MESSAGE}
              </div>

              {/* Unmute pill */}
              <button
                onClick={toggleTributeAudio}
                className="rounded-full border border-white/20 bg-black/40 px-5 py-2 text-[10px] font-medium uppercase tracking-[0.25em] text-white/70 transition-colors active:scale-95"
              >
                {tributeMuted ? "Play ambient music" : "Mute"}
              </button>
            </div>

            {/* Fixed bottom — Exit pill */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0a0612]/90 px-4 py-3 backdrop-blur-xl">
              <button
                onClick={handlePortalExit}
                className="mx-auto flex items-center justify-center gap-2 rounded-full border border-amber-300/30 bg-transparent px-6 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-amber-100/85 transition-all active:scale-95"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Return to Gallery
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music-room remote — sleek matte black pill with gold accents. Power
          button drives audio for the currently-selected TV; arrows cycle
          through all 7 pieces in left-to-right pan order. Renders on mobile
          too, same as the Study remote below — the real 3D room (with the
          same touch-drag look-around) is what's shown on every device now,
          not a flattened stand-in. */}
      <AnimatePresence>
        {portalStage === "inside" && activePortal === "music" && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-gallery-accent/30 bg-[#0c0a08]/95 px-3 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          >
            {/* Power — glows gold when on, dim when off */}
            <button
              onClick={toggleMusicPower}
              aria-label={musicRoomPower ? "Power off" : "Power on"}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
                musicRoomPower
                  ? "border-gallery-accent/70 bg-gallery-accent/15 text-gallery-accent shadow-[0_0_14px_rgba(201,168,76,0.35)]"
                  : "border-white/15 bg-white/[0.04] text-gallery-muted hover:text-gallery-accent"
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v9m5.25-7.5a8.25 8.25 0 11-10.5 0" />
              </svg>
            </button>

            {/* Prev */}
            <button
              onClick={prevMusicPiece}
              aria-label="Previous piece"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-gallery-light transition-all hover:border-gallery-accent/40 hover:text-gallery-accent"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Current piece label */}
            <div className="flex min-w-[130px] flex-col items-center px-2">
              <span className="text-[8px] font-medium uppercase tracking-[0.3em] text-gallery-muted/70">
                Now Viewing
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={MUSIC_ROOM_PIECES[musicRoomPieceIdx].name}
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 3 }}
                  transition={{ duration: 0.18 }}
                  className="text-[11px] font-medium uppercase tracking-[0.18em] text-gallery-accent"
                >
                  {MUSIC_ROOM_PIECES[musicRoomPieceIdx].name}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Next */}
            <button
              onClick={nextMusicPiece}
              aria-label="Next piece"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-gallery-light transition-all hover:border-gallery-accent/40 hover:text-gallery-accent"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Study remote — prev/next cycles through the 5 study pieces. When
          the Bookshelf piece is selected, the arrows switch context and
          cycle through the 21 book titles (with the matching book glowing
          gold in 3D). A small "Room" button exits book-browse mode. */}
      <AnimatePresence>
        {portalStage === "inside" && activePortal === "study" && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[#00d9ff]/30 bg-[#0a0f1e]/95 px-3 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          >
            {/* Prev */}
            <button
              onClick={prevStudyPiece}
              aria-label={isStudyOnBookshelf ? "Previous book" : "Previous piece"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-gallery-light transition-all hover:border-[#00d9ff]/40 hover:text-[#00d9ff]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Piece / book label */}
            <div className="flex min-w-[160px] flex-col items-center px-2">
              <span className="text-[8px] font-medium uppercase tracking-[0.3em] text-gallery-muted/70">
                {isStudyOnBookshelf ? "Currently Viewing" : "Now Viewing"}
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={
                    isStudyOnBookshelf
                      ? `book-${studyBookIdx}`
                      : `piece-${studyPieceIdx}`
                  }
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 3 }}
                  transition={{ duration: 0.18 }}
                  className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7ee6ff]"
                >
                  {isStudyOnBookshelf
                    ? STUDY_BOOK_TITLES[studyBookIdx]
                    : STUDY_PIECES[studyPieceIdx].name}
                </motion.span>
              </AnimatePresence>
              {isStudyOnBookshelf && (
                <span className="text-[7px] uppercase tracking-[0.3em] text-gallery-muted/50">
                  Book {studyBookIdx + 1} / {STUDY_BOOK_TITLES.length}
                </span>
              )}
            </div>

            {/* Next */}
            <button
              onClick={nextStudyPiece}
              aria-label={isStudyOnBookshelf ? "Next book" : "Next piece"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-gallery-light transition-all hover:border-[#00d9ff]/40 hover:text-[#00d9ff]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Room-piece shortcut buttons — always visible so the user can
                exit the book-browser context and jump to any piece by name. */}
            <div className="ml-1 flex items-center gap-1 border-l border-white/10 pl-2">
              <button
                onClick={prevStudyRoomPiece}
                aria-label="Previous room piece"
                title="Previous room piece"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-[9px] uppercase tracking-wider text-gallery-muted transition-all hover:border-[#00d9ff]/40 hover:text-[#00d9ff]"
              >
                ‹
              </button>
              <span className="px-1 text-[7px] font-medium uppercase tracking-[0.25em] text-gallery-muted/60">
                Room
              </span>
              <button
                onClick={nextStudyRoomPiece}
                aria-label="Next room piece"
                title="Next room piece"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-[9px] uppercase tracking-wider text-gallery-muted transition-all hover:border-[#00d9ff]/40 hover:text-[#00d9ff]"
              >
                ›
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scavenger-hunt HUD — subtle code tracker that appears once the user
          Shows fixed scaffolding (dash and double-zero) plus blanks for the
          4 findable characters. Hidden once the study is unlocked. */}
      <AnimatePresence>
        {entered && !studyUnlocked && !portalActive && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="fixed top-14 right-4 z-20 rounded-lg border border-gallery-accent/25 bg-[#0c0a08]/90 px-3 py-2 backdrop-blur-md"
          >
            <div className="text-[8px] font-medium uppercase tracking-[0.3em] text-gallery-muted/80">
              Code
            </div>
            <div className="mt-1 flex gap-1 font-mono text-[14px] tracking-[0.18em] text-gallery-accent">
              {(["D", "E", "V", "-", "0", "0", "7"] as const).map((ch, i) => {
                const isFixed = ch === "-" || ch === "0";
                const isFound = foundLetters.includes(ch);
                return (
                  <span
                    key={`${ch}-${i}`}
                    className={
                      isFixed
                        ? "text-gallery-accent/50"
                        : isFound
                        ? "text-gallery-accent"
                        : "text-gallery-muted/40"
                    }
                  >
                    {isFixed ? ch : isFound ? ch : "_"}
                  </span>
                );
              })}
            </div>
            <div className="mt-1 text-[8px] uppercase tracking-[0.25em] text-gallery-muted/60">
              {foundLetters.length} / {STUDY_REQUIRED_LETTERS.length} found
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Throne popup — shows after a successful keypad unlock. Different
          content per state-machine stage: checking / winner-form / submitting
          / won / claimed (with waitlist) / waitlist states / error. */}
      <AnimatePresence>
        {throneStage !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mx-6 w-full max-w-[500px] rounded-2xl border border-gallery-accent/30 bg-[#0c0a08]/95 p-8 text-center shadow-[0_24px_72px_rgba(0,0,0,0.7)]"
            >
              {throneStage === "checking" && (
                <div className="py-8">
                  <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.35em] text-gallery-accent">
                    Verifying
                  </div>
                  <p className="text-sm text-gallery-light">Checking the throne…</p>
                </div>
              )}

              {throneStage === "winner-form" && (
                <>
                  <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.35em] text-gallery-accent">
                    First Solver
                  </div>
                  <h2 className="mb-3 text-2xl font-light tracking-[0.1em] text-gallery-white">
                    You cracked the code.
                  </h2>
                  <p className="mb-6 text-[13px] leading-relaxed text-gallery-light">
                    You're the first person to solve the scavenger hunt.
                    Your prize: <span className="text-gallery-accent">you get to design the next hidden room</span>.
                    Claim it below — we'll follow up by email with the full brief.
                  </p>
                  <div className="space-y-3 text-left">
                    <div>
                      <label className="mb-1 block text-[9px] font-medium uppercase tracking-[0.2em] text-gallery-muted">
                        Name
                      </label>
                      <input
                        type="text"
                        value={winnerForm.name}
                        onChange={(e) => setWinnerForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Your full name"
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gallery-white placeholder-gallery-muted/40 outline-none focus:border-gallery-accent/40"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[9px] font-medium uppercase tracking-[0.2em] text-gallery-muted">
                        Email
                      </label>
                      <input
                        type="email"
                        value={winnerForm.email}
                        onChange={(e) => setWinnerForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gallery-white placeholder-gallery-muted/40 outline-none focus:border-gallery-accent/40"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[9px] font-medium uppercase tracking-[0.2em] text-gallery-muted">
                        Social Link <span className="opacity-60">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={winnerForm.social}
                        onChange={(e) => setWinnerForm((f) => ({ ...f, social: e.target.value }))}
                        placeholder="X / LinkedIn / portfolio URL"
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gallery-white placeholder-gallery-muted/40 outline-none focus:border-gallery-accent/40"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[9px] font-medium uppercase tracking-[0.2em] text-gallery-muted">
                        One-Sentence Room Idea <span className="opacity-60">(optional)</span>
                      </label>
                      <textarea
                        value={winnerForm.idea}
                        onChange={(e) => setWinnerForm((f) => ({ ...f, idea: e.target.value }))}
                        rows={2}
                        placeholder="A candlelit library where every book is a secret…"
                        className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gallery-white placeholder-gallery-muted/40 outline-none focus:border-gallery-accent/40"
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-gallery-muted/70">
                    Claim within 24 hours
                  </p>
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={skipThronePopup}
                      className="flex-1 rounded-full border border-white/15 py-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-muted transition-colors hover:text-gallery-light"
                    >
                      Skip
                    </button>
                    <button
                      onClick={submitThroneClaim}
                      disabled={!winnerForm.name.trim() || !winnerForm.email.trim()}
                      className="flex-1 rounded-full bg-gallery-accent py-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-black transition-colors hover:bg-gallery-accent/90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Claim the Throne
                    </button>
                  </div>
                </>
              )}

              {throneStage === "submitting" && (
                <div className="py-8">
                  <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.35em] text-gallery-accent">
                    Claiming
                  </div>
                  <p className="text-sm text-gallery-light">Locking in your claim…</p>
                </div>
              )}

              {throneStage === "won" && (
                <div className="py-4">
                  <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.35em] text-gallery-accent">
                    Claimed
                  </div>
                  <h2 className="mb-3 text-2xl font-light tracking-[0.1em] text-gallery-white">
                    The throne is yours.
                  </h2>
                  <p className="text-[13px] leading-relaxed text-gallery-light">
                    Coach B will follow up by email with the design brief.
                    Stepping into the study now…
                  </p>
                </div>
              )}

              {throneStage === "claimed" && (
                <>
                  <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.35em] text-gallery-accent">
                    Throne Claimed
                  </div>
                  <h2 className="mb-3 text-xl font-light tracking-[0.1em] text-gallery-white">
                    You found the code — but the throne has been claimed.
                  </h2>
                  <p className="mb-5 text-[13px] leading-relaxed text-gallery-light">
                    Someone got here first this time. Join the waitlist and
                    you'll be first in line for future rooms and challenges.
                  </p>
                  <div className="text-left">
                    <label className="mb-1 block text-[9px] font-medium uppercase tracking-[0.2em] text-gallery-muted">
                      Email
                    </label>
                    <input
                      type="email"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gallery-white placeholder-gallery-muted/40 outline-none focus:border-gallery-accent/40"
                    />
                  </div>
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={skipThronePopup}
                      className="flex-1 rounded-full border border-white/15 py-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-muted transition-colors hover:text-gallery-light"
                    >
                      No Thanks
                    </button>
                    <button
                      onClick={submitThroneWaitlist}
                      disabled={!waitlistEmail.trim()}
                      className="flex-1 rounded-full bg-gallery-accent py-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-black transition-colors hover:bg-gallery-accent/90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Join Waitlist
                    </button>
                  </div>
                </>
              )}

              {throneStage === "waitlist-submitting" && (
                <div className="py-8">
                  <p className="text-sm text-gallery-light">Adding you…</p>
                </div>
              )}

              {throneStage === "waitlist-done" && (
                <div className="py-4">
                  <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.35em] text-gallery-accent">
                    You're in
                  </div>
                  <h2 className="mb-3 text-xl font-light tracking-[0.1em] text-gallery-white">
                    Welcome to the waitlist.
                  </h2>
                  <p className="text-[13px] leading-relaxed text-gallery-light">
                    You'll hear from Coach B for the next challenge.
                    Stepping into the study…
                  </p>
                </div>
              )}

              {throneStage === "error" && (
                <>
                  <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.35em] text-red-400/80">
                    Something went wrong
                  </div>
                  <p className="mb-5 text-[13px] leading-relaxed text-gallery-light">
                    {throneError || "Please try again."}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={skipThronePopup}
                      className="flex-1 rounded-full border border-white/15 py-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-muted"
                    >
                      Enter the Study
                    </button>
                    <button
                      onClick={() => setThroneStage("checking")}
                      className="flex-1 rounded-full bg-gallery-accent py-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-black"
                    >
                      Retry
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keypad modal — opens when the user taps the left-side.png painting.
          Unified 4×4 grid: digits on the left 3 columns, earned letters
          appear on the right column in their code positions (D/E/V top→
          bottom). Auto-dash input display + status message that explains
          why submit is blocked when the scavenger hunt isn't complete. */}
      <AnimatePresence>
        {keypadOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setKeypadOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, x: keypadShake ? [0, -8, 8, -8, 8, 0] : 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: keypadShake ? 0.4 : 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[320px] rounded-2xl border border-gallery-accent/30 bg-[#0c0a08]/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
            >
              <div className="mb-1 text-center text-[9px] font-medium uppercase tracking-[0.35em] text-gallery-accent/80">
                Founder's Study
              </div>
              <h3 className="mb-4 text-center text-[13px] font-medium uppercase tracking-[0.2em] text-gallery-white">
                Enter Access Code
              </h3>

              {/* Input display — auto-dashes after position 3 (D E V - 0 0 7) */}
              <div className="mb-3 flex h-12 items-center justify-center rounded-lg border border-white/10 bg-black/40 font-mono text-[18px] tracking-[0.22em] text-gallery-accent">
                {(() => {
                  const positions = [0, 1, 2, 3, 4, 5];
                  return (
                    <div className="flex items-center gap-1">
                      {positions.map((pos) => {
                        // Insert visual dash before position 3 (between DEV and 007).
                        const dashBefore = pos === 3;
                        const char = keypadInput[pos];
                        return (
                          <span key={pos} className="flex items-center gap-1">
                            {dashBefore && (
                              <span className={char !== undefined ? "text-gallery-accent/70" : "text-gallery-muted/40"}>
                                -
                              </span>
                            )}
                            <span className={char ? "text-gallery-accent" : "text-gallery-muted/30"}>
                              {char ?? "_"}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Status line — always visible, explains what's required */}
              <div className="mb-4 flex min-h-[16px] items-center justify-center text-center text-[9px] uppercase tracking-[0.25em]">
                {allLettersFound ? (
                  <span className="text-gallery-muted/60">Enter the 6-digit code</span>
                ) : (
                  <span className="text-amber-300/70">
                    Collect 3 letters and 1 number first
                    <span className="ml-2 text-gallery-muted/50">
                      ({foundLetters.length}/{STUDY_REQUIRED_LETTERS.length})
                    </span>
                  </span>
                )}
              </div>

              {/* Unified 4-column pad — digits 1-9 on the left 3 columns,
                  earned letters on the right column (D/E/V), Del/0/Enter
                  on the last row. Letter slots stay empty until found. */}
              <div className="grid grid-cols-4 gap-2">
                {/* Row 1 */}
                <button
                  onClick={() => appendKeypad("1")}
                  className="rounded-lg border border-white/10 bg-white/[0.03] py-3 text-[16px] font-medium text-gallery-light transition-colors hover:border-gallery-accent/40 hover:text-gallery-accent"
                >
                  1
                </button>
                <button
                  onClick={() => appendKeypad("2")}
                  className="rounded-lg border border-white/10 bg-white/[0.03] py-3 text-[16px] font-medium text-gallery-light transition-colors hover:border-gallery-accent/40 hover:text-gallery-accent"
                >
                  2
                </button>
                <button
                  onClick={() => appendKeypad("3")}
                  className="rounded-lg border border-white/10 bg-white/[0.03] py-3 text-[16px] font-medium text-gallery-light transition-colors hover:border-gallery-accent/40 hover:text-gallery-accent"
                >
                  3
                </button>
                {foundLetters.includes("D") ? (
                  <button
                    onClick={() => appendKeypad("D")}
                    className="rounded-lg border border-gallery-accent/40 bg-gallery-accent/10 py-3 text-[16px] font-medium text-gallery-accent transition-colors hover:bg-gallery-accent/20"
                  >
                    D
                  </button>
                ) : (
                  <div />
                )}

                {/* Row 2 */}
                <button
                  onClick={() => appendKeypad("4")}
                  className="rounded-lg border border-white/10 bg-white/[0.03] py-3 text-[16px] font-medium text-gallery-light transition-colors hover:border-gallery-accent/40 hover:text-gallery-accent"
                >
                  4
                </button>
                <button
                  onClick={() => appendKeypad("5")}
                  className="rounded-lg border border-white/10 bg-white/[0.03] py-3 text-[16px] font-medium text-gallery-light transition-colors hover:border-gallery-accent/40 hover:text-gallery-accent"
                >
                  5
                </button>
                <button
                  onClick={() => appendKeypad("6")}
                  className="rounded-lg border border-white/10 bg-white/[0.03] py-3 text-[16px] font-medium text-gallery-light transition-colors hover:border-gallery-accent/40 hover:text-gallery-accent"
                >
                  6
                </button>
                {foundLetters.includes("E") ? (
                  <button
                    onClick={() => appendKeypad("E")}
                    className="rounded-lg border border-gallery-accent/40 bg-gallery-accent/10 py-3 text-[16px] font-medium text-gallery-accent transition-colors hover:bg-gallery-accent/20"
                  >
                    E
                  </button>
                ) : (
                  <div />
                )}

                {/* Row 3 */}
                <button
                  onClick={() => appendKeypad("7")}
                  className="rounded-lg border border-white/10 bg-white/[0.03] py-3 text-[16px] font-medium text-gallery-light transition-colors hover:border-gallery-accent/40 hover:text-gallery-accent"
                >
                  7
                </button>
                <button
                  onClick={() => appendKeypad("8")}
                  className="rounded-lg border border-white/10 bg-white/[0.03] py-3 text-[16px] font-medium text-gallery-light transition-colors hover:border-gallery-accent/40 hover:text-gallery-accent"
                >
                  8
                </button>
                <button
                  onClick={() => appendKeypad("9")}
                  className="rounded-lg border border-white/10 bg-white/[0.03] py-3 text-[16px] font-medium text-gallery-light transition-colors hover:border-gallery-accent/40 hover:text-gallery-accent"
                >
                  9
                </button>
                {foundLetters.includes("V") ? (
                  <button
                    onClick={() => appendKeypad("V")}
                    className="rounded-lg border border-gallery-accent/40 bg-gallery-accent/10 py-3 text-[16px] font-medium text-gallery-accent transition-colors hover:bg-gallery-accent/20"
                  >
                    V
                  </button>
                ) : (
                  <div />
                )}

                {/* Row 4 — Del, 0, Enter (spans 2) */}
                <button
                  onClick={backspaceKeypad}
                  className="rounded-lg border border-white/10 bg-white/[0.03] py-3 text-[12px] uppercase tracking-wider text-gallery-muted transition-colors hover:border-gallery-accent/40 hover:text-gallery-accent"
                >
                  Del
                </button>
                <button
                  onClick={() => appendKeypad("0")}
                  className="rounded-lg border border-white/10 bg-white/[0.03] py-3 text-[16px] font-medium text-gallery-light transition-colors hover:border-gallery-accent/40 hover:text-gallery-accent"
                >
                  0
                </button>
                <button
                  onClick={submitKeypad}
                  className={`col-span-2 rounded-lg py-3 text-[11px] font-medium uppercase tracking-[0.2em] transition-all ${
                    allLettersFound
                      ? "bg-gallery-accent text-gallery-black hover:bg-gallery-accent/90"
                      : "bg-gallery-accent/25 text-gallery-accent/60 cursor-not-allowed"
                  }`}
                >
                  Enter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tech Vault prompt — guided tour pauses at the doorway for the user to
          choose: tour each glass display, or skip to the next piece. */}
      <AnimatePresence>
        {vaultPromptOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-16 left-1/2 z-40 w-[280px] -translate-x-1/2 rounded-xl border border-gallery-accent/30 bg-[#0c0a08]/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          >
            <div className="mb-1 text-[9px] font-medium uppercase tracking-[0.3em] text-gallery-accent">
              Tech Vault
            </div>
            <h3 className="mb-2 text-[13px] font-medium text-gallery-white">
              Take a closer look?
            </h3>
            <p className="mb-3 text-[11px] leading-relaxed text-gallery-muted">
              Step inside to tour each glass display, or continue to the next gallery piece.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => guidedResumer.current?.("enter")}
                className="flex-1 rounded-md bg-gallery-accent py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-gallery-black transition-colors hover:bg-gallery-accent/90"
              >
                Enter Vault
              </button>
              <button
                onClick={() => guidedResumer.current?.("skip")}
                className="flex-1 rounded-md border border-white/15 bg-white/[0.03] py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-gallery-light transition-colors hover:border-gallery-accent/40 hover:text-gallery-accent"
              >
                Skip
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Gallery Map — hidden while inside the music room. Swaps to
          TechVaultMap inside the Tech Vault, or PredictionsMap inside the
          AI Predictions Wing, same pattern for both. */}
      {!portalActive && !insideVault && !insidePredictionsWing && (
        <GalleryMap
          open={mapOpen}
          onClose={() => setMapOpen(false)}
          onSelectStop={handleMapSelect}
          onContinueTour={() => { setMode("guided"); setMapOpen(false); }}
          currentLabel={currentLabel}
          showContinueTour={AUTO_TOUR_ENABLED}
        />
      )}
      {!portalActive && insideVault && (
        <TechVaultMap
          open={mapOpen}
          onClose={() => setMapOpen(false)}
          onSelectCase={handleVaultCaseSelect}
          onReturn={handleVaultReturn}
          currentCaseKey={currentCaseKey}
        />
      )}
      {!portalActive && insidePredictionsWing && (
        <PredictionsMap
          open={mapOpen}
          onSelectPrediction={handleSelectPrediction}
          onReturn={handlePredictionsWingReturn}
        />
      )}

      {/* Testimonial Projector — full-screen overlay */}
      <TestimonialProjector
        open={activePanel === "testimonials"}
        onClose={() => setActivePanel(null)}
      />


      {/* Project Modal */}
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />

      {/* Prediction Modal */}
      <PredictionModal prediction={selectedPrediction} onClose={() => setSelectedPrediction(null)} />

      {/* Overlay Panels */}
      <GalleryOverlayPanel open={activePanel === "enterprise"} onClose={() => setActivePanel(null)} label="Enterprise Hall" title="Bottor Technologies Inc.">
        <p className="text-sm text-gallery-muted leading-relaxed mb-6">Technology solutions for government, enterprise, and forward thinking organizations.</p>
        <div className="grid gap-3 sm:grid-cols-2">{["Software Development", "Automation Tools", "UI and UX Systems", "Digital Product Development", "Professional Services", "AI and Data Solutions"].map((c) => (<div key={c} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"><p className="text-xs font-medium text-gallery-white">{c}</p></div>))}</div>
        <div className="mt-6"><a href="https://drive.google.com/file/d/1XmDidqSyxh_tNgDYXagU_YvNmm1Nx8-C/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="rounded-full border border-gallery-gray px-5 py-2 text-xs font-medium text-gallery-light hover:border-gallery-accent hover:text-gallery-accent transition-colors">Download PDF</a></div>
      </GalleryOverlayPanel>
      <GalleryOverlayPanel open={activePanel === "studio"} onClose={() => setActivePanel(null)} label="The Studio" title="About Coach B">
        <div className="grid gap-3 sm:grid-cols-2">{[{ t: "Builder", d: "Creating software, tools, and digital products from concept to launch." }, { t: "Creative Technologist", d: "Blending design, code, and emerging tech to build unique experiences." }, { t: "Product Creator", d: "Shipping real products that solve real problems for real people." }, { t: "Founder", d: "Leading Bottor Technologies Inc. and building ventures from the ground up." }, { t: "Author", d: "Writing stories that inspire imagination and make learning feel alive." }].map((r) => (<div key={r.t} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"><p className="text-xs font-medium text-gallery-white">{r.t}</p><p className="mt-1 text-[11px] text-gallery-muted leading-relaxed">{r.d}</p></div>))}</div>
        <div className="mt-8"><CertificationBadges /></div>
      </GalleryOverlayPanel>
      <GalleryOverlayPanel open={activePanel === "appointments"} onClose={() => setActivePanel(null)} label="Appointments" title="Book a 1:1 with Coach B">
        <p className="text-sm text-gallery-muted leading-relaxed mb-6">For product strategy, creative direction, business discussion, and project guidance.</p>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-accent">30 Minutes</span>
          <div className="mt-3 mb-4"><span className="text-3xl font-extralight text-gallery-white">$75</span><span className="ml-2 text-xs text-gallery-muted/60">per session</span></div>
          <p className="mb-5 text-xs text-gallery-muted leading-relaxed">A focused session for quick strategy, feedback, or guidance.</p>
          <a href={BOOKING_PAYMENT_URL} target="_blank" rel="noopener noreferrer" className="block w-full rounded-lg bg-gallery-accent py-3 text-center text-xs font-medium text-gallery-black hover:bg-gallery-accent/90">Book 30 Minutes</a>
        </div>
      </GalleryOverlayPanel>
      <GalleryOverlayPanel open={activePanel === "commission"} onClose={() => setActivePanel(null)} label="Commission Desk" title="Start a Project">
        <form action="https://api.web3forms.com/submit" method="POST" className="space-y-4">
          <input type="hidden" name="access_key" value="8cccd495-aec7-461a-9e68-8653dc65a19f" /><input type="hidden" name="subject" value="New message from Created by Coach B site" /><input type="hidden" name="from_name" value="Coach B Website" /><input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />
          <div><label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-muted">Name</label><input type="text" name="name" required placeholder="Your full name" className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gallery-white placeholder-gallery-muted/40 outline-none focus:border-gallery-accent/40" /></div>
          <div><label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-muted">Email</label><input type="email" name="email" required placeholder="your@email.com" className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gallery-white placeholder-gallery-muted/40 outline-none focus:border-gallery-accent/40" /></div>
          <div><label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-muted">What Do You Need</label><select name="project_type" required className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gallery-white outline-none focus:border-gallery-accent/40 appearance-none"><option value="">Select an option</option><option value="Website Build">Website Build</option><option value="Branding / Design">Branding / Design</option><option value="Automation Tools">Automation Tools</option><option value="Other">Other</option></select></div>
          <div><label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-muted">Message</label><textarea name="message" rows={4} required placeholder="Tell me about your project" className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gallery-white placeholder-gallery-muted/40 outline-none focus:border-gallery-accent/40" /></div>
          <button type="submit" className="w-full rounded-lg bg-gallery-accent py-3 text-sm font-medium text-gallery-black hover:bg-gallery-accent/90">Send Message</button>
        </form>
      </GalleryOverlayPanel>
      <GalleryOverlayPanel open={activePanel === "connect"} onClose={() => setActivePanel(null)} label="Connect" title="Stay Connected">
        <div className="space-y-3">
          <a href="https://www.linkedin.com/in/byron-brown-b61ab695/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 hover:border-gallery-accent/20"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.03]"><svg className="h-5 w-5 text-gallery-muted" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg></div><div><p className="text-sm font-medium text-gallery-white">LinkedIn</p><p className="text-xs text-gallery-muted">Byron Brown</p></div></a>
          <a href="https://github.com/bottortech" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 hover:border-gallery-accent/20"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.03]"><svg className="h-5 w-5 text-gallery-muted" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg></div><div><p className="text-sm font-medium text-gallery-white">GitHub</p><p className="text-xs text-gallery-muted">Bottor Technologies</p></div></a>
        </div>
        <p className="mt-8 text-[10px] text-gallery-muted/30">&copy; {new Date().getFullYear()} Coach B. All rights reserved.</p>
      </GalleryOverlayPanel>
    </div>
  );
}
