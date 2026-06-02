"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Testimonial {
  quote: string;
  name: string;
  title: string;
}

// Easy to extend — append a third entry here when ready
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I'm a returning client of Byron for years now! Ever since he helped create my logo design and event flyers it was only natural I return to him for my website design! He was able to achieve everything I was looking for in my website design and I'm very pleased with all of his work! He definitely goes above and beyond to get your projects done in a timely manner and is very engaging when asking questions to ensure he understood the assignment correctly before proceeding. I also love the way he presents you with several designs so you have a few to pick from! I definitely recommend him for any design, logo, website projects anyone has in mind! He's a very professional person and honest!",
    name: "Maria",
    title: "Owner, Lush Brows",
  },
  {
    quote:
      "Byron Brown has helped out tremendously with logos and graphic designs to help out my media platform JonnyBeeTV. He creatively put together my first ever logo and also made improvements and updates on my latest logo! Byron has also been very helpful with any ideas and advice on planning to help advance the JonnyBeeTV platform. I highly recommend his work!",
    name: "JonnyBeeTV",
    title: "Media Platform",
  },
];

function ProjectorSVG() {
  return (
    <svg
      width="140"
      height="96"
      viewBox="0 0 140 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="lensCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d4b8ff" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#8b5cf6" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#4c3a78" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#1a1030" stopOpacity="0.9" />
        </radialGradient>
        <radialGradient id="lensGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#4c3a78" stopOpacity="0" />
        </radialGradient>
        <filter id="projectorShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.6" />
        </filter>
        <filter id="lensBloom" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Body */}
      <rect x="2" y="22" width="96" height="52" rx="8" fill="#131320" stroke="#2a2a40" strokeWidth="1" filter="url(#projectorShadow)" />
      {/* Body top sheen */}
      <rect x="2" y="22" width="96" height="12" rx="8" fill="#1e1e30" />
      <rect x="2" y="30" width="96" height="4" fill="#1e1e30" />

      {/* Vent slits on top */}
      {[18, 26, 34, 42, 50].map((x) => (
        <rect key={x} x={x} y="24" width="1.5" height="8" rx="1" fill="#2a2a45" />
      ))}

      {/* Status indicator light */}
      <circle cx="16" cy="48" r="3.5" fill="#22c55e" opacity="0.85" />
      <circle cx="16" cy="48" r="5.5" fill="#22c55e" opacity="0.15" />

      {/* Label strip */}
      <rect x="28" y="43" width="44" height="10" rx="2" fill="#0e0e1c" stroke="#2a2a40" strokeWidth="0.5" />
      <rect x="32" y="46.5" width="12" height="1.5" rx="1" fill="#3a3a55" />
      <rect x="32" y="49.5" width="8" height="1.5" rx="1" fill="#3a3a55" />

      {/* Lens housing */}
      <circle cx="108" cy="48" r="20" fill="#0d0d1e" stroke="#2a2a40" strokeWidth="1" />
      <circle cx="108" cy="48" r="16" fill="#0a0a18" stroke="#3a2a55" strokeWidth="1" />
      {/* Outer lens glow halo */}
      <circle cx="108" cy="48" r="22" fill="url(#lensGlow)" />
      {/* Lens glass */}
      <circle cx="108" cy="48" r="13" fill="url(#lensCore)" filter="url(#lensBloom)" />
      {/* Lens inner ring */}
      <circle cx="108" cy="48" r="13" fill="none" stroke="#6d4aaa" strokeWidth="0.8" strokeOpacity="0.6" />
      {/* Lens center hotspot */}
      <circle cx="108" cy="48" r="5" fill="#e2d0ff" opacity="0.9" />
      <circle cx="106" cy="46" r="2" fill="white" opacity="0.7" />

      {/* Mounting rail under body */}
      <rect x="20" y="74" width="72" height="5" rx="2.5" fill="#0e0e1c" stroke="#2a2a40" strokeWidth="0.5" />
      {/* Feet */}
      <rect x="26" y="79" width="10" height="8" rx="3" fill="#0a0a18" stroke="#2a2a40" strokeWidth="0.5" />
      <rect x="76" y="79" width="10" height="8" rx="3" fill="#0a0a18" stroke="#2a2a40" strokeWidth="0.5" />

      {/* Cable */}
      <path d="M28 74 Q20 85 10 88" stroke="#1a1a2a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.35 + index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col overflow-hidden rounded-xl p-5 md:p-6"
      style={{
        background: "rgba(7, 10, 22, 0.92)",
        border: "1px solid rgba(140, 170, 255, 0.18)",
        boxShadow:
          "0 0 0 1px rgba(100, 140, 255, 0.06), 0 8px 40px rgba(60, 90, 200, 0.14), inset 0 0 30px rgba(80, 110, 255, 0.04)",
        backdropFilter: "blur(16px) saturate(1.3)",
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(120,160,255,0.012) 0px, rgba(120,160,255,0.012) 1px, transparent 1px, transparent 5px)",
      }}
    >
      {/* Top-edge highlight — mimics a projected light hitting the top of the panel */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(180, 200, 255, 0.4) 30%, rgba(200, 220, 255, 0.6) 50%, rgba(180, 200, 255, 0.4) 70%, transparent 100%)",
        }}
      />

      {/* Corner bracket — top-left */}
      <svg className="absolute left-3 top-3 h-4 w-4 opacity-30" viewBox="0 0 16 16" fill="none">
        <path d="M1 8 L1 1 L8 1" stroke="rgba(160,190,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {/* Corner bracket — top-right */}
      <svg className="absolute right-3 top-3 h-4 w-4 opacity-30" viewBox="0 0 16 16" fill="none">
        <path d="M15 8 L15 1 L8 1" stroke="rgba(160,190,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      {/* Quote mark */}
      <div
        className="mb-3 text-3xl font-serif leading-none"
        style={{ color: "rgba(180, 160, 255, 0.55)" }}
        aria-hidden="true"
      >
        &ldquo;
      </div>

      {/* Quote text */}
      <p
        className="flex-1 text-[13px] leading-[1.75] md:text-[13.5px]"
        style={{ color: "rgba(218, 225, 248, 0.88)" }}
      >
        {testimonial.quote}
      </p>

      {/* Divider */}
      <div
        className="my-4 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(140, 170, 255, 0.2) 50%, transparent 100%)",
        }}
      />

      {/* Attribution */}
      <div className="flex items-center gap-3">
        {/* Avatar ring */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
          style={{
            background: "rgba(100, 80, 200, 0.25)",
            border: "1px solid rgba(160, 140, 255, 0.3)",
            color: "rgba(200, 190, 255, 0.9)",
            boxShadow: "0 0 12px rgba(120, 100, 220, 0.2)",
          }}
        >
          {testimonial.name[0].toUpperCase()}
        </div>
        <div>
          <div
            className="text-[12px] font-semibold tracking-wide"
            style={{ color: "rgba(220, 225, 255, 0.95)" }}
          >
            {testimonial.name}
          </div>
          <div
            className="text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "rgba(160, 170, 220, 0.6)" }}
          >
            {testimonial.title}
          </div>
        </div>
      </div>

      {/* Bottom-right corner bracket */}
      <svg className="absolute bottom-3 right-3 h-4 w-4 opacity-30" viewBox="0 0 16 16" fill="none">
        <path d="M15 8 L15 15 L8 15" stroke="rgba(160,190,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TestimonialProjector({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[80] overflow-auto"
          style={{
            background:
              "radial-gradient(ellipse at 18% 55%, #0c1028 0%, #050508 65%)",
          }}
          onClick={onClose}
        >
          {/* Ambient dot grid */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(rgba(100, 140, 255, 0.028) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />

          {/* Main card — stops propagation so clicking inside doesn't close */}
          <div
            className="relative z-10 mx-auto flex min-h-full flex-col px-4 py-10 md:px-8 md:py-12"
            style={{ maxWidth: "1060px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-gallery-muted transition-colors hover:border-white/20 hover:text-gallery-white md:right-0 md:top-0"
              aria-label="Close"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10 text-center"
            >
              <span
                className="text-[9px] font-medium uppercase tracking-[0.45em]"
                style={{ color: "rgba(180, 160, 255, 0.8)" }}
              >
                Client Testimonials
              </span>
              <h2 className="mt-2 text-2xl font-extralight tracking-[0.2em] text-gallery-white md:text-3xl">
                What Clients Say
              </h2>
            </motion.div>

            {/* Scene: projector + beam + cards */}
            <div className="flex flex-1 flex-col items-center gap-6 md:flex-row md:items-center md:gap-0">

              {/* ── Projector side (desktop only) ──────────────────────── */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="hidden shrink-0 flex-col items-center md:flex"
                style={{ width: "160px" }}
              >
                {/* Projector label */}
                <div
                  className="mb-3 text-[8px] uppercase tracking-[0.35em]"
                  style={{ color: "rgba(140, 120, 200, 0.6)" }}
                >
                  Projector
                </div>

                {/* Projector body */}
                <div className="relative">
                  <ProjectorSVG />

                  {/* Lens pulse animation */}
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      width: "44px",
                      height: "44px",
                      top: "26px",
                      right: "-2px",
                      background: "radial-gradient(circle, rgba(160,120,255,0.35) 0%, transparent 70%)",
                    }}
                    animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.1, 0.95] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>

                {/* Stand pillar */}
                <div
                  className="mt-1 w-[3px] rounded-full"
                  style={{
                    height: "18px",
                    background: "linear-gradient(180deg, #2a2a40, #1a1a28)",
                  }}
                />
                <div
                  className="rounded-full"
                  style={{
                    width: "30px",
                    height: "5px",
                    background: "linear-gradient(180deg, #2a2a40, #111118)",
                    borderRadius: "3px",
                  }}
                />
              </motion.div>

              {/* ── Beam (desktop only) ────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="relative hidden shrink-0 self-stretch md:block"
                style={{
                  width: "80px",
                  transformOrigin: "left center",
                }}
              >
                {/* Main trapezoidal beam */}
                <div
                  className="absolute inset-y-0 w-full"
                  style={{
                    clipPath: "polygon(0 45%, 100% 10%, 100% 90%, 0 55%)",
                    background:
                      "linear-gradient(90deg, rgba(160,130,255,0.22) 0%, rgba(120,100,220,0.1) 40%, rgba(80,70,180,0.04) 80%, transparent 100%)",
                  }}
                />
                {/* Beam center line — brighter core */}
                <div
                  className="absolute"
                  style={{
                    top: "50%",
                    left: 0,
                    right: 0,
                    height: "2px",
                    transform: "translateY(-50%)",
                    background:
                      "linear-gradient(90deg, rgba(200,180,255,0.5) 0%, rgba(160,140,255,0.2) 50%, transparent 100%)",
                    filter: "blur(1px)",
                  }}
                />
                {/* Animated dust-mote shimmer */}
                <motion.div
                  className="absolute"
                  style={{
                    top: "48%",
                    left: "20%",
                    width: "3px",
                    height: "3px",
                    borderRadius: "50%",
                    background: "rgba(200,180,255,0.6)",
                    filter: "blur(1px)",
                  }}
                  animate={{ opacity: [0, 0.8, 0], x: [0, 30], y: [0, -6, 4] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                />
                <motion.div
                  className="absolute"
                  style={{
                    top: "52%",
                    left: "40%",
                    width: "2px",
                    height: "2px",
                    borderRadius: "50%",
                    background: "rgba(180,160,255,0.5)",
                    filter: "blur(0.5px)",
                  }}
                  animate={{ opacity: [0, 0.6, 0], x: [0, 20], y: [0, 5, -3] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 1.2, repeatDelay: 0.8 }}
                />
              </motion.div>

              {/* ── Testimonial cards ─────────────────────────────────── */}
              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                {TESTIMONIALS.map((t, i) => (
                  <TestimonialCard key={i} testimonial={t} index={i} />
                ))}
              </div>
            </div>

            {/* Footer label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-10 text-center text-[9px] uppercase tracking-[0.35em]"
              style={{ color: "rgba(120, 130, 180, 0.35)" }}
            >
              Verified client reviews
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
