"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Suspense, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GalleryRoom, { STOPS, TOUR_LAST, PORTAL_STOP, VAULT_CASE_START, VAULT_CASE_COUNT, MUSIC_ROOM_CAMERA } from "./GalleryRoom";
import ProjectModal, { Project } from "../gallery/ProjectModal";
import GalleryOverlayPanel from "./GalleryOverlayPanel";
import GalleryMap from "./GalleryMap";
import TechVaultMap from "./TechVaultMap";

type PanelType = "enterprise" | "studio" | "appointments" | "commission" | "connect" | null;

// Max stop user can reach via scroll/arrows. Vault case stops live past PORTAL_STOP
// but are only addressable via the TechVaultMap, not by scrolling.
const LAST = PORTAL_STOP;
const PORTAL_ANIM_MS = 1500;

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

// Guided tour dwell — how long to sit at each stop AFTER the camera has fully
// settled. Anchor stops get a longer beat; regular tier-based stops scale.
// Tech Vault doorway is a pass-through waypoint in guided mode (the tour flies
// straight into the vault cases from there), so it gets the shortest dwell.
function guidedDwellMs(stop: (typeof STOPS)[number]): number {
  if (stop.label === "WiggleWoo's Word Quest") return 2600;
  if (stop.label === "The Standard") return 2500;
  if (stop.label === "Services") return 2000;
  if (stop.label === "Tech Vault") return 150;
  return stop.tier === 1 ? 1750 : stop.tier === 2 ? 2000 : 1500;
}

export default function GalleryScene() {
  const [entered, setEntered] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  // Starts in manual; user opts into guided via the map or toggle.
  const [mode, setMode] = useState<"guided" | "manual">("manual");
  const AUTO_TOUR_ENABLED = true;
  const [progress, setProgress] = useState(0);
  const [currentLabel, setCurrentLabel] = useState("Entrance");
  const [mapOpen, setMapOpen] = useState(false);
  const [portalStage, setPortalStage] = useState<"none" | "entering" | "inside" | "exiting">("none");
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
  const anyOverlayOpen = !!selectedProject || !!activePanel;

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
    return () => {
      audioRef.current?.pause();
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

  // Shared navigation — the single, reusable "move the camera to stop N"
  // function. Both manual map clicks and the guided state machine call this;
  // neither has its own movement path. Mode changes are the caller's job.
  const goToStop = useCallback((index: number) => {
    updateTarget(index);
    snapRef.current = true;
  }, [updateTarget]);

  // Same as goToStop, but picks the direct A→B lerp path when the jump would
  // cause a detour through unrelated STOPS-axis positions. Used by both manual
  // vault clicks and the guided state machine.
  const navigateToStop = useCallback((destIdx: number) => {
    const currentIdx = Math.round(targetRef.current);
    if (transitionNeedsDirectSnap(currentIdx, destIdx)) {
      const dest = STOPS[destIdx];
      updateTarget(destIdx);
      snapRef.current = false;
      setDirectSnap({ pos: dest.pos, lookAt: dest.lookAt, targetIdx: destIdx });
    } else {
      goToStop(destIdx);
    }
  }, [goToStop, updateTarget, transitionNeedsDirectSnap]);

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

  // Fires when GalleryRoom finishes a STOPS-axis snap.
  const handleSnapDone = useCallback(() => {
    snapRef.current = false;
    consumeSettleHandler();
  }, [consumeSettleHandler]);

  // Fires when GalleryRoom finishes a direct A→B lerp (vault entry/exit/hop).
  const handleDirectSnapDone = useCallback(() => {
    setDirectSnap(null);
    consumeSettleHandler();
  }, [consumeSettleHandler]);

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
    // Hold the map off until WiggleWoo has fully popped in after the intro
    // fade (500ms fade + a ~400ms beat for the piece to read on screen).
    setTimeout(() => setMapOpen(true), 900);
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

  const handlePortalExit = useCallback(() => {
    if (portalStage !== "inside") return;
    setPortalStage("exiting");
    // Snap the gallery target to the return stop so STOPS resumes there cleanly after override releases
    updateTarget(portalReturnStop.current);
    snapRef.current = true;
    // Restore gallery music on the way out
    if (audioRef.current && musicPlaying) fadeAudio(audioRef.current, 0.3, 900);
    setTimeout(() => {
      setPortalStage("none");
    }, PORTAL_ANIM_MS);
  }, [portalStage, fadeAudio, updateTarget, musicPlaying]);

  useEffect(() => {
    const t = setTimeout(() => { if (!entered) handleEnter(); }, 6000);
    return () => clearTimeout(t);
  }, [entered, handleEnter]);

  // Scroll: accumulate and advance by fractions
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (anyOverlayOpen || !entered || portalActive) return;
      e.preventDefault();
      setAutoTour(false);
      // Smooth scroll: small increments
      const delta = e.deltaY * 0.003;
      updateTarget(targetRef.current + delta);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [anyOverlayOpen, entered, updateTarget, portalActive, setAutoTour]);

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

  // Touch/swipe
  useEffect(() => {
    let startY = 0;
    const onStart = (e: TouchEvent) => { startY = e.touches[0].clientY; };
    const onMove = (e: TouchEvent) => {
      if (anyOverlayOpen || !entered || portalActive) return;
      setAutoTour(false);
      const dy = startY - e.touches[0].clientY;
      startY = e.touches[0].clientY;
      updateTarget(targetRef.current + dy * 0.005);
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    return () => { window.removeEventListener("touchstart", onStart); window.removeEventListener("touchmove", onMove); };
  }, [anyOverlayOpen, entered, updateTarget, portalActive, setAutoTour]);

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

  // Override camera target derived from portal stage. null = STOPS drive the camera.
  const portalOverride =
    portalStage === "entering" || portalStage === "inside"
      ? MUSIC_ROOM_CAMERA
      : portalStage === "exiting"
        ? { pos: STOPS[portalReturnStop.current].pos, lookAt: STOPS[portalReturnStop.current].lookAt }
        : null;

  return (
    <div className="fixed inset-0">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ fov: 55, near: 0.1, far: 30, position: [0, 1.7, 1.5] }}
        gl={{ antialias: false, alpha: false, powerPreference: "default", toneMapping: THREE.LinearToneMapping, toneMappingExposure: 1.6 }}
        style={{ background: "#050403" }}
        onPointerMissed={() => {
          if (portalStage === "inside") handlePortalExit();
        }}
      >
        <Suspense fallback={null}>
          <GalleryRoom
            onSelectProject={setSelectedProject}
            modalOpen={anyOverlayOpen}
            targetProgress={target}
            targetRef={targetRef}
            autoTour={autoTour && entered && !anyOverlayOpen && !portalActive}
            cameraDisabled={false}
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
            musicRoomTargetLookAt={portalStage === "inside" ? musicRoomLookAt : null}
            musicRoomPower={musicRoomPower}
            musicRoomPieceIdx={musicRoomPieceIdx}
          />
        </Suspense>
      </Canvas>

      {/* Intro */}
      <AnimatePresence>
        {!entered && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#050403]">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.3 }} className="mb-4 text-[10px] font-medium uppercase tracking-[0.5em] text-gallery-accent/80">Welcome to the Gallery</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.8 }} className="text-center text-4xl font-extralight text-gallery-white md:text-6xl lg:text-7xl">Created by <span className="text-gallery-accent">Coach B</span></motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.8 }} className="mt-4 text-sm text-gallery-muted">Builder. Designer. Founder. Author.</motion.p>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 2.8 }} onClick={handleEnter} className="mt-8 rounded-full border border-gallery-accent/40 px-6 py-2.5 text-xs font-medium tracking-wide text-gallery-accent transition-all hover:bg-gallery-accent hover:text-gallery-black">Enter the Gallery</motion.button>
            {/* Secondary intro action — direct path to the Commission Desk
                form for visitors who came to hire, not to browse. */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 3.2 }}
              onClick={() => {
                handleEnter();
                setActivePanel("commission");
              }}
              className="mt-4 text-[10px] uppercase tracking-[0.28em] text-gallery-muted transition-colors hover:text-gallery-accent"
            >
              Or start a project →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      {entered && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="absolute top-0 left-0 right-0 z-20 bg-black/40 backdrop-blur-md border-b border-white/5">
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
                <button onClick={() => setMapOpen(!mapOpen)} className={`rounded-full p-1.5 transition-all border ${mapOpen ? "border-gallery-accent/40 text-gallery-accent" : "border-white/10 text-gallery-muted hover:text-gallery-white"}`} aria-label="Gallery Map">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                </button>
              )}
              <button onClick={toggleMusic} className={`rounded-full p-1.5 transition-all border ${musicPlaying ? "border-gallery-accent/40 text-gallery-accent" : "border-white/10 text-gallery-muted"}`} aria-label={musicPlaying ? "Mute" : "Unmute"}>
                {musicPlaying ? <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.14v7.72A4.5 4.5 0 0016.5 12zM14 3.23v2.06A6.97 6.97 0 0121 12a6.97 6.97 0 01-7 6.71v2.06A9 9 0 0023 12 9 9 0 0014 3.23z" /></svg>
                : <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12A4.5 4.5 0 0014 8.14v2.12l2.45 2.45c.03-.2.05-.4.05-.71zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.92 8.92 0 0021 12a9 9 0 00-7-8.77v2.06A6.97 6.97 0 0121 12zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>}
              </button>
              {AUTO_TOUR_ENABLED && (
                <button onClick={() => { const next = mode === "guided" ? "manual" : "guided"; setMode(next); if (next === "manual") setMapOpen(true); }} className={`rounded-full px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] transition-all border ${mode === "guided" ? "border-gallery-accent/40 text-gallery-accent bg-gallery-accent/10" : "border-white/20 text-gallery-light bg-white/5"}`}>{mode === "guided" ? "Guided" : "Manual"}</button>
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

      {/* Manual mode — return to guided button (hidden while auto-tour is disabled) */}
      {AUTO_TOUR_ENABLED && entered && mode === "manual" && !anyOverlayOpen && !portalActive && (
        <button
          onClick={() => setMode("guided")}
          className="fixed top-14 right-4 z-20 rounded-full border border-gallery-accent/30 bg-black/50 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-gallery-accent backdrop-blur-sm transition-all hover:bg-gallery-accent hover:text-gallery-black"
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

      {/* Music-room remote — sleek matte black pill with gold accents. Power
          button drives audio for the currently-selected TV; arrows cycle
          through all 7 pieces in left-to-right pan order. */}
      <AnimatePresence>
        {portalStage === "inside" && (
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



      {/* Gallery Map — hidden while inside the music room. Swap to TechVaultMap
          while the camera is inside the Tech Vault. */}
      {!portalActive && !insideVault && (
        <GalleryMap
          open={mapOpen}
          onClose={() => setMapOpen(false)}
          onSelectStop={handleMapSelect}
          onContinueTour={() => { setMode("guided"); }}
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

      {/* Project Modal */}
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />

      {/* Overlay Panels */}
      <GalleryOverlayPanel open={activePanel === "enterprise"} onClose={() => setActivePanel(null)} label="Enterprise Hall" title="Bottor Technologies Inc.">
        <p className="text-sm text-gallery-muted leading-relaxed mb-6">Technology solutions for government, enterprise, and forward thinking organizations.</p>
        <div className="grid gap-3 sm:grid-cols-2">{["Software Development", "Automation Tools", "UI and UX Systems", "Digital Product Development", "Professional Services", "AI and Data Solutions"].map((c) => (<div key={c} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"><p className="text-xs font-medium text-gallery-white">{c}</p></div>))}</div>
        <div className="mt-6"><a href="https://drive.google.com/file/d/1XmDidqSyxh_tNgDYXagU_YvNmm1Nx8-C/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="rounded-full border border-gallery-gray px-5 py-2 text-xs font-medium text-gallery-light hover:border-gallery-accent hover:text-gallery-accent transition-colors">Download PDF</a></div>
      </GalleryOverlayPanel>
      <GalleryOverlayPanel open={activePanel === "studio"} onClose={() => setActivePanel(null)} label="The Studio" title="About Coach B">
        <div className="grid gap-3 sm:grid-cols-2">{[{ t: "Builder", d: "Creating software, tools, and digital products from concept to launch." }, { t: "Creative Technologist", d: "Blending design, code, and emerging tech to build unique experiences." }, { t: "Product Creator", d: "Shipping real products that solve real problems for real people." }, { t: "Founder", d: "Leading Bottor Technologies Inc. and building ventures from the ground up." }, { t: "Author", d: "Writing stories that inspire imagination and make learning feel alive." }].map((r) => (<div key={r.t} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"><p className="text-xs font-medium text-gallery-white">{r.t}</p><p className="mt-1 text-[11px] text-gallery-muted leading-relaxed">{r.d}</p></div>))}</div>
      </GalleryOverlayPanel>
      <GalleryOverlayPanel open={activePanel === "appointments"} onClose={() => setActivePanel(null)} label="Appointments" title="Book a 1:1 with Coach B">
        <p className="text-sm text-gallery-muted leading-relaxed mb-6">For product strategy, creative direction, business discussion, and project guidance.</p>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-accent">30 Minutes</span>
          <div className="mt-3 mb-4"><span className="text-3xl font-extralight text-gallery-white">$75</span><span className="ml-2 text-xs text-gallery-muted/60">per session</span></div>
          <p className="mb-5 text-xs text-gallery-muted leading-relaxed">A focused session for quick strategy, feedback, or guidance.</p>
          <a href="https://calendly.com/byron-brown31/30min" target="_blank" rel="noopener noreferrer" className="block w-full rounded-lg bg-gallery-accent py-3 text-center text-xs font-medium text-gallery-black hover:bg-gallery-accent/90">Book 30 Minutes</a>
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
