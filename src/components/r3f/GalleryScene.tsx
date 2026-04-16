"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GalleryRoom, { STOPS } from "./GalleryRoom";
import ProjectModal, { Project } from "../gallery/ProjectModal";
import GalleryOverlayPanel from "./GalleryOverlayPanel";
import GalleryMap from "./GalleryMap";

type PanelType = "enterprise" | "studio" | "appointments" | "commission" | "connect" | null;

const LAST = STOPS.length - 1;
const DEFAULT_SPEED = 0.5;

/* ------------------------------------------------------------------ */
/*  TourController — frame-synced auto-tour with delta-time drift      */
/* ------------------------------------------------------------------ */

function TourController({
  targetRef, syncTarget, snapRef, autoSpeed,
  entered, autoTour, anyOverlayOpen, loopResetFlag,
}: {
  targetRef: { current: number };
  syncTarget: (v: number) => void;
  snapRef: { current: boolean };
  autoSpeed: number;
  entered: boolean;
  autoTour: boolean;
  anyOverlayOpen: boolean;
  loopResetFlag: { current: boolean };
}) {
  const stopIdx = useRef(0);
  const holdTime = useRef(0);
  const phase = useRef<"drift" | "pause">("pause");
  const syncTimer = useRef(0);
  const wasActive = useRef(false);

  useFrame((_, rawDelta) => {
    const isActive = entered && autoTour && !anyOverlayOpen;

    if (!isActive) {
      wasActive.current = false;
      return;
    }

    // Just became active — reset tour
    if (!wasActive.current) {
      wasActive.current = true;
      stopIdx.current = 0;
      holdTime.current = 0;
      phase.current = "pause";
      targetRef.current = 0;
      syncTarget(0);
      return;
    }

    const dt = Math.min(rawDelta, 0.1); // clamp for tab-refocus safety

    // Loop restart
    if (loopResetFlag.current) {
      loopResetFlag.current = false;
      stopIdx.current = 0;
      holdTime.current = 0;
      phase.current = "pause";
      targetRef.current = 0;
      syncTarget(0);
      return;
    }

    if (phase.current === "pause") {
      holdTime.current += dt;
      targetRef.current = Math.max(0, Math.min(LAST, stopIdx.current));
      snapRef.current = true;

      // Hold timing (seconds) — matches original 50ms-tick pacing exactly
      const tier = STOPS[stopIdx.current]?.tier || 3;
      const isFirst = stopIdx.current === 0;
      const isGoat = STOPS[stopIdx.current]?.label === "The Standard";
      const isServices = STOPS[stopIdx.current]?.label === "Services";

      const settleTime = isFirst ? 0.4 : isServices ? 0.75 : isGoat ? 2.5 : 1.0;
      const holdDuration = isFirst ? 2.6 : isServices ? 2.0 : isGoat ? 2.5
        : (tier === 1 ? 1.75 : tier === 2 ? 2.0 : 1.5);

      if (holdTime.current >= settleTime + holdDuration) {
        holdTime.current = 0;
        snapRef.current = false;
        stopIdx.current++;

        if (stopIdx.current > LAST) {
          stopIdx.current = LAST;
          phase.current = "pause";
        } else if (stopIdx.current === LAST) {
          targetRef.current = LAST;
          phase.current = "pause";
        } else {
          phase.current = "drift";
        }
      }
    } else {
      // Smooth drift — advances every render frame using delta time
      const current = targetRef.current;
      const goal = stopIdx.current;
      const from = goal - 1;
      const segmentProgress = Math.max(0, Math.min(1, (current - from) / (goal - from)));

      // Subtle ease-in-out: camera gently accelerates then decelerates each segment
      const ease = 1 - 0.1 * Math.cos(segmentProgress * Math.PI);
      const segmentSpeed = goal === 1 ? autoSpeed * 1.5 : autoSpeed; // first turn is faster
      const next = current + segmentSpeed * ease * dt;

      if (next >= goal - 0.02) {
        targetRef.current = goal;
        phase.current = "pause";
      } else {
        targetRef.current = Math.min(next, goal);
      }
    }

    // Sync React state for progress bar (~15fps, avoids excessive re-renders)
    syncTimer.current += dt;
    if (syncTimer.current > 0.066) {
      syncTimer.current = 0;
      syncTarget(targetRef.current);
    }
  });

  return null;
}

export default function GalleryScene() {
  const [entered, setEntered] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [mode, setMode] = useState<"guided" | "manual">("guided");
  const [progress, setProgress] = useState(0);
  const [currentLabel, setCurrentLabel] = useState("Entrance");
  const [autoSpeed, setAutoSpeed] = useState(DEFAULT_SPEED);
  const [mapOpen, setMapOpen] = useState(false);
  const mapAutoShown = useRef(false);
  const loopResetFlag = useRef(false);

  const autoTour = mode === "guided";
  const setAutoTour = useCallback((v: boolean) => setMode(v ? "guided" : "manual"), []);

  // The target progress (0 to LAST). Camera smoothly follows this.
  const targetRef = useRef(0);
  const [target, setTarget] = useState(0);
  const scrollAccum = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const anyOverlayOpen = !!selectedProject || !!activePanel;

  // Sync ref with state (ref for non-render reads, state for passing to Canvas)
  const updateTarget = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(LAST, v));
    targetRef.current = clamped;
    setTarget(clamped);
  }, []);

  // Audio
  useEffect(() => {
    audioRef.current = new Audio("/audio/gallery-vibes.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    return () => { audioRef.current?.pause(); };
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

  const restartTour = useCallback(() => {
    updateTarget(1); // go to Main Gallery view
    snapRef.current = true;
    setMode("manual"); // hand control to the user after one loop
    mapAutoShown.current = false;
    setMapOpen(true); // open map so user can browse
  }, [updateTarget]);

  // LOOP RULE: Only loop when camera has ACTUALLY arrived at the book (progress >= 0.95)
  // AND stayed there for 5 seconds
  const atBookTimer = useRef(0);
  const loopTriggered = useRef(false);
  const progressRef = useRef(0);

  // Keep progressRef in sync
  useEffect(() => { progressRef.current = progress; }, [progress]);

  useEffect(() => {
    if (!entered || !autoTour) {
      atBookTimer.current = 0;
      loopTriggered.current = false;
      return;
    }

    const check = setInterval(() => {
      if (progressRef.current >= 0.95) {
        atBookTimer.current += 100;

        // Close the gallery map 1 second before the loop triggers
        if (atBookTimer.current >= 4000 && mapOpen) {
          setMapOpen(false);
        }

        if (atBookTimer.current >= 5000 && !loopTriggered.current) {
          loopTriggered.current = true;
          restartTour();
          setTimeout(() => {
            atBookTimer.current = 0;
            loopTriggered.current = false;
          }, 2000);
        }
      } else {
        atBookTimer.current = 0;
      }
    }, 100);

    return () => clearInterval(check);
  }, [entered, autoTour, restartTour]);

  // Auto-show gallery map at "Main Gallery" stop (once per tour)
  useEffect(() => {
    if (currentLabel === "Main Gallery" && !mapAutoShown.current && autoTour && entered) {
      mapAutoShown.current = true;
      setMapOpen(true);
    }
  }, [currentLabel, autoTour, entered]);

  // Reset auto-show flag when tour loops back so map shows each loop
  useEffect(() => {
    if (currentLabel === "WiggleWoo's Word Quest") {
      mapAutoShown.current = false;
    }
  }, [currentLabel]);

  // Handle map piece selection
  const handleMapSelect = useCallback((stopIndex: number) => {
    setMode("manual");
    updateTarget(stopIndex);
    snapRef.current = true;
  }, [updateTarget]);

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
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (!entered) handleEnter(); }, 6000);
    return () => clearTimeout(t);
  }, [entered, handleEnter]);

  // Scroll: accumulate and advance by fractions
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (anyOverlayOpen || !entered ) return;
      e.preventDefault();
      setAutoTour(false);
      // Smooth scroll: small increments
      const delta = e.deltaY * 0.003;
      updateTarget(targetRef.current + delta);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [anyOverlayOpen, entered, updateTarget]);

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
      if (anyOverlayOpen || !entered || e.repeat) return;
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
  }, [anyOverlayOpen, entered, updateTarget, setAutoTour]);

  // Touch/swipe
  useEffect(() => {
    let startY = 0;
    const onStart = (e: TouchEvent) => { startY = e.touches[0].clientY; };
    const onMove = (e: TouchEvent) => {
      if (anyOverlayOpen || !entered ) return;
      setAutoTour(false);
      const dy = startY - e.touches[0].clientY;
      startY = e.touches[0].clientY;
      updateTarget(targetRef.current + dy * 0.005);
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    return () => { window.removeEventListener("touchstart", onStart); window.removeEventListener("touchmove", onMove); };
  }, [anyOverlayOpen, entered, updateTarget]);

  // Prev/next button handlers — snap to exact stops
  const snapRef = useRef(false);
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

  return (
    <div className="fixed inset-0">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ fov: 55, near: 0.1, far: 30, position: [0, 1.7, 1.5] }}
        gl={{ antialias: false, alpha: false, powerPreference: "default", toneMapping: THREE.LinearToneMapping, toneMappingExposure: 1.6 }}
        style={{ background: "#050403" }}
      >
        <TourController
          targetRef={targetRef}
          syncTarget={setTarget}
          snapRef={snapRef}
          autoSpeed={autoSpeed}
          entered={entered}
          autoTour={autoTour}
          anyOverlayOpen={anyOverlayOpen}
          loopResetFlag={loopResetFlag}
        />
        <Suspense fallback={null}>
          <GalleryRoom
            onSelectProject={setSelectedProject}
            modalOpen={anyOverlayOpen}
            targetProgress={target}
            targetRef={targetRef}
            autoTour={autoTour && entered && !anyOverlayOpen}
            cameraDisabled={false}
            snapping={snapRef.current}
            onSnapDone={() => { snapRef.current = false; }}
            onProgressChange={setProgress}
            onLabelChange={setCurrentLabel}
            onOpenPanel={(panel) => setActivePanel(panel as PanelType)}
            onRestartLoop={() => {
              updateTarget(0);
              snapRef.current = false;
            }}
          />
        </Suspense>
      </Canvas>

      {/* Intro */}
      <AnimatePresence>
        {!entered && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#050403]">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.3 }} className="mb-4 text-[10px] font-medium uppercase tracking-[0.5em] text-gallery-accent/80">Welcome to the Gallery</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.8 }} className="text-center text-4xl font-extralight text-gallery-white md:text-6xl lg:text-7xl">Created by <span className="text-gallery-accent">Coach B</span></motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.8 }} className="mt-4 text-sm text-gallery-muted">Builder. Designer. Founder. Author.</motion.p>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 2.8 }} onClick={handleEnter} className="mt-8 rounded-full border border-gallery-accent/40 px-6 py-2.5 text-xs font-medium tracking-wide text-gallery-accent transition-all hover:bg-gallery-accent hover:text-gallery-black">Enter the Gallery</motion.button>
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
              <button onClick={() => setMapOpen(!mapOpen)} className={`rounded-full p-1.5 transition-all border ${mapOpen ? "border-gallery-accent/40 text-gallery-accent" : "border-white/10 text-gallery-muted hover:text-gallery-white"}`} aria-label="Gallery Map">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
              </button>
              <button onClick={toggleMusic} className={`rounded-full p-1.5 transition-all border ${musicPlaying ? "border-gallery-accent/40 text-gallery-accent" : "border-white/10 text-gallery-muted"}`} aria-label={musicPlaying ? "Mute" : "Unmute"}>
                {musicPlaying ? <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.14v7.72A4.5 4.5 0 0016.5 12zM14 3.23v2.06A6.97 6.97 0 0121 12a6.97 6.97 0 01-7 6.71v2.06A9 9 0 0023 12 9 9 0 0014 3.23z" /></svg>
                : <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12A4.5 4.5 0 0014 8.14v2.12l2.45 2.45c.03-.2.05-.4.05-.71zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.92 8.92 0 0021 12a9 9 0 00-7-8.77v2.06A6.97 6.97 0 0121 12zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>}
              </button>
              <button onClick={() => { const next = mode === "guided" ? "manual" : "guided"; setMode(next); if (next === "manual") setMapOpen(true); }} className={`rounded-full px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] transition-all border ${mode === "guided" ? "border-gallery-accent/40 text-gallery-accent bg-gallery-accent/10" : "border-white/20 text-gallery-light bg-white/5"}`}>{mode === "guided" ? "Guided" : "Manual"}</button>
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

      {/* Manual mode — return to guided button */}
      {entered && mode === "manual" && !anyOverlayOpen && (
        <button
          onClick={() => setMode("guided")}
          className="fixed top-14 right-4 z-20 rounded-full border border-gallery-accent/30 bg-black/50 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-gallery-accent backdrop-blur-sm transition-all hover:bg-gallery-accent hover:text-gallery-black"
        >
          Start Auto Tour
        </button>
      )}



      {/* Gallery Map */}
      <GalleryMap
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        onSelectStop={handleMapSelect}
        onContinueTour={() => { setMapOpen(false); setMode("guided"); }}
        currentLabel={currentLabel}
      />

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
