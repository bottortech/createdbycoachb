"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { STOPS } from "./GalleryRoom";

const STOP_META: Record<string, { thumb: string; type: string }> = {
  "WiggleWoo's Word Quest": { thumb: "/images/ipad-game-view.png", type: "Educational Game / Web App" },
  "The Standard":           { thumb: "/images/goat-statue.png",    type: "Gallery Centerpiece" },
  "Carla's Creation":       { thumb: "/images/carlas-creation.png", type: "Flyer Design" },
  "JB TV":                  { thumb: "/images/jb-tv.png",          type: "Brand Logo / Visual Identity" },
  "Lush Brows":             { thumb: "/images/lush-brows-logo.png", type: "Logo Design" },
  "RetroRack":              { thumb: "/images/retrorack-web-app.png", type: "Inventory Management Web App" },
  "RetroRack Logo":         { thumb: "/images/retro-rack-logo.png", type: "Brand Logo Design" },
  "RetroRack Extension":    { thumb: "/images/retrorack-extension.jpg", type: "Chrome Extension / Cross Listing Tool" },
  "Bottor Assist":          { thumb: "/images/bottor-assist.png",  type: "AI Tool / Web App" },
  "By Any Means":           { thumb: "/images/By-any-means-logo.png", type: "Brand Logo Design" },
  "WiggleWoo Character":    { thumb: "/images/Wiggle-Woo-Character.png", type: "Character Design" },
  "Professor WiggleWoo":    { thumb: "/images/book-cover.jpg",    type: "Children's Book" },
  "Services":               { thumb: "/images/coachb-services.png", type: "Services & Contact" },
};

interface GalleryMapProps {
  open: boolean;
  onClose: () => void;
  onSelectStop: (index: number) => void;
  onContinueTour: () => void;
  currentLabel: string;
}

export default function GalleryMap({ open, onClose, onSelectStop, onContinueTour, currentLabel }: GalleryMapProps) {
  const pieces = STOPS.map((stop, i) => ({ ...stop, index: i })).filter(
    (s) => s.label !== "Main Gallery"
  );

  // Scroll active thumbnail into view on mobile strip
  const stripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open || !stripRef.current) return;
    const active = stripRef.current.querySelector("[data-active=true]");
    if (active) active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [open, currentLabel]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ============ DESKTOP — Sidebar (hidden on mobile) ============ */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 top-0 bottom-0 z-[75] hidden w-48 overflow-y-auto border-r border-white/[0.06] bg-[#0c0a08]/95 backdrop-blur-xl md:block"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-white/[0.06] bg-[#0c0a08]/95 px-3 py-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-medium uppercase tracking-[0.3em] text-gallery-accent">Gallery Map</span>
                  <p className="mt-0.5 text-[10px] text-gallery-muted">Jump to any piece or continue the tour</p>
                </div>
                <button onClick={onContinueTour} className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-gallery-muted transition-colors hover:border-gallery-accent/40 hover:text-gallery-accent">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <button onClick={onContinueTour} className="mt-3 w-full rounded-lg bg-gallery-accent py-2.5 text-[10px] font-medium uppercase tracking-wider text-gallery-black transition-all hover:bg-gallery-accent/90">
                Continue Auto Tour
              </button>
            </div>

            {/* Piece list */}
            <div className="p-3 space-y-1">
              {pieces.map((piece) => {
                const meta = STOP_META[piece.label];
                const isActive = currentLabel === piece.label;
                return (
                  <button
                    key={piece.index}
                    onClick={() => onSelectStop(piece.index)}
                    className={`group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-all ${isActive ? "bg-gallery-accent/10 border border-gallery-accent/30" : "border border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"}`}
                  >
                    <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-gallery-dark">
                      {meta?.thumb && <Image src={meta.thumb} alt={piece.label} fill sizes="32px" className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[10px] font-medium truncate ${isActive ? "text-gallery-accent" : "text-gallery-light group-hover:text-gallery-white"}`}>{meta?.type || ""}</p>
                      {isActive && <p className="text-[7px] uppercase tracking-wider text-gallery-accent/40 mt-0.5">Viewing</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* ============ MOBILE — Bottom thumbnail strip (hidden on desktop) ============ */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 right-0 bottom-0 z-[75] md:hidden"
          >
            {/* Continue button + close */}
            <div className="flex items-center justify-between bg-[#0c0a08]/95 px-3 py-2 backdrop-blur-xl border-t border-white/[0.06]">
              <button onClick={onContinueTour} className="rounded-full bg-gallery-accent px-4 py-1.5 text-[9px] font-medium uppercase tracking-wider text-gallery-black">
                Continue Tour
              </button>
              <span className="text-[8px] uppercase tracking-wider text-gallery-muted/50">Swipe to browse</span>
              <button onClick={onContinueTour} className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 text-gallery-muted">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Horizontal scrollable thumbnail strip */}
            <div
              ref={stripRef}
              className="flex gap-2 overflow-x-auto bg-[#0c0a08]/95 px-3 pb-6 pt-2 backdrop-blur-xl no-scrollbar"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {pieces.map((piece) => {
                const meta = STOP_META[piece.label];
                const isActive = currentLabel === piece.label;
                return (
                  <button
                    key={piece.index}
                    data-active={isActive}
                    onClick={() => onSelectStop(piece.index)}
                    className={`flex-shrink-0 rounded-lg transition-all ${isActive ? "ring-2 ring-gallery-accent" : "ring-1 ring-white/10"}`}
                    style={{ width: "70px" }}
                  >
                    <div className="relative h-14 w-full overflow-hidden rounded-t-lg bg-gallery-dark">
                      {meta?.thumb && <Image src={meta.thumb} alt={piece.label} fill sizes="70px" className="object-cover" />}
                    </div>
                    <div className={`rounded-b-lg px-1 py-1 ${isActive ? "bg-gallery-accent/20" : "bg-black/60"}`}>
                      <p className={`text-[6px] font-medium leading-tight truncate ${isActive ? "text-gallery-accent" : "text-gallery-light"}`}>
                        {meta?.type || piece.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
