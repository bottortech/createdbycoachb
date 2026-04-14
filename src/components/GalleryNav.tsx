"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SCENES } from "./gallery/GalleryApp";

interface GalleryNavProps {
  currentScene: number;
  onSceneChange: (index: number) => void;
}

export default function GalleryNav({
  currentScene,
  onSceneChange,
}: GalleryNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="fixed top-0 left-0 right-0 z-40 bg-gallery-black/60 backdrop-blur-xl border-b border-white/5"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 md:px-12">
          <button
            onClick={() => onSceneChange(0)}
            className="text-lg font-light tracking-widest text-gallery-white hover:text-gallery-accent transition-colors"
          >
            COACH B
          </button>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 lg:flex">
            {SCENES.slice(1).map((scene, i) => (
              <button
                key={scene.id}
                onClick={() => onSceneChange(i + 1)}
                className={`rounded-full px-3 py-1.5 text-xs tracking-wide transition-all duration-300 ${
                  currentScene === i + 1
                    ? "text-gallery-accent bg-gallery-accent-soft"
                    : "text-gallery-muted hover:text-gallery-white"
                }`}
              >
                {scene.label}
              </button>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex flex-col gap-1.5 lg:hidden p-2"
            aria-label="Toggle navigation"
          >
            <motion.span
              animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block h-px w-6 bg-gallery-white"
            />
            <motion.span
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block h-px w-6 bg-gallery-white"
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block h-px w-6 bg-gallery-white"
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-gallery-black/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex h-full flex-col items-center justify-center gap-2">
              {SCENES.map((scene, i) => (
                <motion.button
                  key={scene.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => {
                    onSceneChange(i);
                    setIsOpen(false);
                  }}
                  className={`px-6 py-3 text-lg tracking-wide transition-colors ${
                    currentScene === i
                      ? "text-gallery-accent"
                      : "text-gallery-muted hover:text-gallery-white"
                  }`}
                >
                  {scene.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
