"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import GalleryButton from "../GalleryButton";

/**
 * The Entrance Hall.
 *
 * Uses the real gallery interior photo as the visual anchor.
 * The user immediately sees a dramatic gallery space — marble floor,
 * track lights, framed art on walls, vanishing point — and the
 * hero text floats inside that space.
 *
 * As the user scrolls down, the photo subtly parallaxes and fades,
 * making the transition into the constructed gallery environment
 * feel like walking deeper into the space.
 */
export default function Entrance() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Backdrop slowly zooms in as user scrolls (camera moves forward)
  const backdropScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const backdropOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 0.85, 1],
    [1, 1, 0.6, 0]
  );

  // Hero text holds, then fades and lifts up as user scrolls past
  const titleY = useTransform(scrollYProgress, [0, 0.5, 1], ["0%", "0%", "-25%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.4, 0.75], [1, 1, 0]);

  // Scroll hint fades quickly
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <section
      id="entrance"
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "180vh" }}
    >
      {/* Sticky pinned stage so the entrance hangs in view as you scroll */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
      {/* === GALLERY INTERIOR PHOTO BACKDROP === */}
      <motion.div
        style={{ scale: backdropScale, opacity: backdropOpacity }}
        className="absolute inset-0"
      >
        <Image
          src="/images/gallery/hero-interior.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Darken overlay so hero text is readable */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.40) 35%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.85) 100%)",
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)",
          }}
        />

        {/* Warm ceiling glow wash */}
        <div
          className="absolute inset-x-0 top-0 h-[40vh]"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(255,225,170,0.15) 0%, rgba(201,168,76,0.05) 35%, transparent 70%)",
            mixBlendMode: "screen",
          }}
        />
      </motion.div>

      {/* === HERO CONTENT === */}
      <motion.div
        style={{ y: titleY, opacity: titleOpacity }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 text-center md:px-12">
          {/* Welcome marker */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="mb-8"
          >
            <span
              className="inline-block text-[10px] font-medium uppercase tracking-[0.5em] text-gallery-accent/90"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}
            >
              Welcome to the Gallery
            </span>
          </motion.div>

          {/* Statement headline */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 max-w-5xl text-center text-4xl font-extralight leading-tight tracking-tight text-gallery-white sm:text-5xl md:text-7xl lg:text-8xl"
            style={{ textShadow: "0 4px 24px rgba(0,0,0,0.8)" }}
          >
            Everything Here Was
            <br />
            <span className="text-gallery-accent">Created by Coach B</span>
          </motion.h1>

          {/* Roles */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55 }}
            className="mb-5 max-w-2xl text-center text-lg font-light tracking-wide text-gallery-light md:text-xl"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}
          >
            Builder. Designer. Founder. Author. Artist.
          </motion.p>

          {/* Supporting text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            className="mb-14 max-w-[640px] text-center text-base leading-relaxed text-gallery-light/80"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}
          >
            Creating products, systems, and experiences that solve real problems
            and push ideas forward.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9 }}
            className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row"
          >
            <GalleryButton href="#featured-exhibit" variant="primary">
              Explore the Gallery
            </GalleryButton>
            <GalleryButton href="#product-wing" variant="outline">
              View Projects
            </GalleryButton>
            <GalleryButton href="#commission-desk" variant="secondary">
              Join Early Access
            </GalleryButton>
          </motion.div>
        </div>
      </motion.div>

      {/* === SCROLL HINT === */}
      <motion.div
        style={{ opacity: scrollHintOpacity }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <span
            className="text-[10px] uppercase tracking-[0.3em] text-gallery-light/70"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
          >
            Scroll to enter the collection
          </span>
          <div className="h-12 w-px bg-gradient-to-b from-gallery-accent/60 to-transparent" />
        </motion.div>
      </motion.div>
      </div>
    </section>
  );
}
