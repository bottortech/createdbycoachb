"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

interface GallerySectionProps {
  id: string;
  children: ReactNode;
  className?: string;
  spotlight?: boolean;
  spotlightGold?: boolean;
  /**
   * Multiplier for how long the section pins to the viewport.
   * 1 = no pin (one viewport tall), 1.8 = pins for ~0.8 viewports.
   * Default 1.8 gives a comfortable read while maintaining scroll momentum.
   */
  pinHeight?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

/**
 * GallerySection — a pinned exhibit room.
 *
 * Each section is a tall outer container with an inner sticky stage.
 * As the user scrolls through the section's height, the inner stage
 * stays pinned to the viewport while the gallery environment behind
 * it stays fixed.
 *
 * Content inside fades + scales + slides based on scroll progress
 * within the section, so it feels like an exhibit "transitioning into
 * view" inside a fixed gallery room, then transitioning out as you
 * move on to the next.
 */
export default function GallerySection({
  id,
  children,
  className = "",
  spotlight = false,
  spotlightGold = false,
  pinHeight = 1.8,
}: GallerySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Content fades in as section enters, holds, fades out as it leaves
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.7, 0.95],
    [0, 1, 1, 0]
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.75, 1],
    [0.92, 1, 1, 0.96]
  );
  const y = useTransform(
    scrollYProgress,
    [0, 0.2, 0.75, 1],
    ["8%", "0%", "0%", "-6%"]
  );

  // Spotlight intensity peaks while section is centered in pin
  const spotlightOpacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.7, 1],
    [0, 1, 1, 0]
  );

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`relative w-full ${className}`}
      style={{ height: `${pinHeight * 100}vh` }}
    >
      {/* Sticky pinned stage — fills the viewport while section is in view */}
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        {/* Per-section ambient spotlight */}
        {spotlight && (
          <div className="pointer-events-none absolute inset-0 spotlight" />
        )}
        {spotlightGold && (
          <div className="pointer-events-none absolute inset-0 spotlight-gold" />
        )}

        {/* Animated gold spotlight that intensifies when this room is "open" */}
        <motion.div
          style={{ opacity: spotlightOpacity }}
          className="pointer-events-none absolute left-1/2 top-1/4 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gallery-accent/[0.06] blur-[160px]"
        />

        {/* Subtle floor-glow that intensifies with the spotlight */}
        <motion.div
          style={{ opacity: spotlightOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[20vh]"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 100% at center bottom, rgba(255,225,170,0.08) 0%, transparent 70%)",
              mixBlendMode: "screen",
            }}
          />
        </motion.div>

        {/* Content with scroll-driven reveal */}
        <motion.div
          style={{ opacity, scale, y }}
          className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {children}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
