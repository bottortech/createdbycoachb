"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import GalleryNav from "../GalleryNav";
import SceneDots from "./SceneDots";
import ProjectModal, { Project } from "./ProjectModal";

import EntranceScene from "./scenes/EntranceScene";
import FeaturedScene from "./scenes/FeaturedScene";
import ProductWallScene from "./scenes/ProductWallScene";
import CreativeWallScene from "./scenes/CreativeWallScene";
import LibraryScene from "./scenes/LibraryScene";
import EnterpriseScene from "./scenes/EnterpriseScene";
import StudioScene from "./scenes/StudioScene";
import AppointmentsScene from "./scenes/AppointmentsScene";
import CommissionScene from "./scenes/CommissionScene";
import ConnectScene from "./scenes/ConnectScene";

export const SCENES = [
  { id: "entrance", label: "Entrance" },
  { id: "featured-exhibit", label: "Main Hall" },
  { id: "product-wing", label: "Product Wing" },
  { id: "creative-gallery", label: "Creative Wing" },
  { id: "author-exhibit", label: "The Library" },
  { id: "government-enterprise", label: "Enterprise Hall" },
  { id: "studio", label: "The Studio" },
  { id: "book-a-call", label: "Appointments" },
  { id: "commission-desk", label: "Commission Desk" },
  { id: "social-wall", label: "Connect" },
] as const;

const SCENE_COMPONENTS = [
  EntranceScene,
  FeaturedScene,
  ProductWallScene,
  CreativeWallScene,
  LibraryScene,
  EnterpriseScene,
  StudioScene,
  AppointmentsScene,
  CommissionScene,
  ConnectScene,
];

/**
 * GalleryApp — the single-screen gallery experience.
 *
 * The entire site is one fixed viewport. The gallery room (hero-interior.png)
 * stays in place permanently. Scroll wheel, arrow keys, and swipe advance
 * through scenes. Each scene crossfades in/out inside the fixed room.
 *
 * Every framed piece is clickable and opens a ProjectModal.
 */
export default function GalleryApp() {
  const [currentScene, setCurrentScene] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const isTransitioning = useRef(false);
  const touchStart = useRef<number | null>(null);

  const totalScenes = SCENES.length;

  const goToScene = useCallback(
    (index: number) => {
      if (isTransitioning.current) return;
      const next = Math.max(0, Math.min(totalScenes - 1, index));
      if (next === currentScene) return;

      isTransitioning.current = true;
      setCurrentScene(next);
      setTimeout(() => {
        isTransitioning.current = false;
      }, 650);
    },
    [currentScene, totalScenes]
  );

  const nextScene = useCallback(() => goToScene(currentScene + 1), [currentScene, goToScene]);
  const prevScene = useCallback(() => goToScene(currentScene - 1), [currentScene, goToScene]);

  // Scroll wheel → advance/retreat one scene
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (selectedProject) return; // modal is open, don't advance
      e.preventDefault();
      if (Math.abs(e.deltaY) < 20) return; // ignore tiny scroll
      if (e.deltaY > 0) nextScene();
      else prevScene();
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [nextScene, prevScene, selectedProject]);

  // Arrow keys → advance/retreat
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedProject) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        nextScene();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        prevScene();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextScene, prevScene, selectedProject]);

  // Touch/swipe → advance/retreat
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (selectedProject || touchStart.current === null) return;
      const diff = touchStart.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 50) return; // ignore small swipes
      if (diff > 0) nextScene();
      else prevScene();
      touchStart.current = null;
    };
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [nextScene, prevScene, selectedProject]);

  // Current scene component
  const SceneComponent = SCENE_COMPONENTS[currentScene];

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* === PERMANENT GALLERY ROOM BACKDROP === */}
      <div className="absolute inset-0">
        <Image
          src="/images/gallery/hero-interior.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Darken for readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0.40) 60%, rgba(0,0,0,0.75) 100%)",
          }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.65) 100%)",
          }}
        />
        {/* Warm ceiling glow */}
        <div
          className="absolute inset-x-0 top-0 h-[35vh]"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(255,225,170,0.12) 0%, transparent 65%)",
            mixBlendMode: "screen",
          }}
        />
      </div>

      {/* === NAV === */}
      <GalleryNav
        currentScene={currentScene}
        onSceneChange={goToScene}
      />

      {/* === SCENE CONTENT — crossfade === */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative z-10 w-full max-w-7xl px-6 md:px-12">
            <SceneComponent onSelectProject={setSelectedProject} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* === SCENE DOTS === */}
      <SceneDots
        total={totalScenes}
        current={currentScene}
        onChange={goToScene}
        labels={SCENES.map((s) => s.label)}
      />

      {/* === SCROLL HINT (entrance only) === */}
      <AnimatePresence>
        {currentScene === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2"
            >
              <span
                className="text-[10px] uppercase tracking-[0.3em] text-gallery-light/60"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
              >
                Scroll to enter the collection
              </span>
              <div className="h-8 w-px bg-gradient-to-b from-gallery-accent/50 to-transparent" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === PROJECT MODAL === */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
