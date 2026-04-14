"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import SectionLabel from "../SectionLabel";
import GalleryButton from "../GalleryButton";

const tags = ["Interactive", "Phonics", "Early Reading", "Game Based Learning"];

/**
 * Featured Exhibit — the WiggleWoo "Main Hall."
 * Uses a pinned sticky stage so the iPad and content stay locked
 * in view while the user scrolls. Inside the pinned area, content
 * animates with depth and parallax for a cinematic reveal.
 */
export default function FeaturedExhibit() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // iPad floats slightly upward as scroll progresses through the scene
  const tabletY = useTransform(scrollYProgress, [0, 1], ["8%", "-6%"]);
  const tabletScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 0.97]);
  const tabletRotate = useTransform(scrollYProgress, [0, 1], [3, -2]);

  // Title fades up as the user enters the scene
  const titleOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0.6]);
  const titleY = useTransform(scrollYProgress, [0, 0.3], [40, 0]);

  // Spotlight intensifies in the middle of the scene
  const spotlightOpacity = useTransform(
    scrollYProgress,
    [0, 0.4, 0.6, 1],
    [0.4, 1, 1, 0.4]
  );

  return (
    <section
      id="featured-exhibit"
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "220vh" }}
    >
      {/* Pinned stage */}
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        {/* Spotlight from above */}
        <motion.div
          style={{ opacity: spotlightOpacity }}
          className="pointer-events-none absolute inset-x-0 top-0 h-[60vh]"
        >
          <div
            className="absolute left-1/2 top-0 h-[80vh] w-[70vw] -translate-x-1/2"
            style={{
              background:
                "radial-gradient(ellipse at top, rgba(255,225,170,0.10) 0%, rgba(201,168,76,0.05) 35%, transparent 65%)",
            }}
          />
        </motion.div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-6 md:grid-cols-2 md:items-center md:gap-16 md:px-12">
          {/* iPad with parallax + tilt */}
          <motion.div
            style={{
              y: tabletY,
              scale: tabletScale,
              rotate: tabletRotate,
            }}
            className="flex items-center justify-center"
          >
            <div
              className="relative w-[88%] overflow-hidden rounded-[7%]"
              style={{
                filter:
                  "drop-shadow(0 30px 60px rgba(0,0,0,0.6)) drop-shadow(0 12px 24px rgba(201,168,76,0.10))",
              }}
            >
              <Image
                src="/images/ipad-game-view.png"
                alt="WiggleWoo Word Quest game preview on iPad"
                width={800}
                height={600}
                className="block h-auto w-full"
                priority
              />
              {/* Glass reflection */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(115deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 35%, rgba(255,255,255,0) 100%)",
                }}
              />
            </div>
          </motion.div>

          {/* Content with fade up */}
          <motion.div
            style={{ opacity: titleOpacity, y: titleY }}
            className="space-y-6"
          >
            <SectionLabel
              label="Main Hall"
              title="WiggleWoo's Word Quest"
              description="A phonics driven adventure where kids learn to read by building words, unlocking worlds, and progressing through structured gameplay."
            />

            <p className="text-gallery-muted leading-relaxed">
              WiggleWoo&apos;s Word Quest is an interactive reading game designed
              for early learners. Players tap letters to form words, move through
              themed environments, and build real reading skills through play.
            </p>

            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gallery-accent-soft px-4 py-1.5 text-xs font-medium text-gallery-accent"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <GalleryButton href="https://wigglewoo.app" variant="primary">
                Join Waitlist
              </GalleryButton>
              <GalleryButton
                href="https://wigglewoo.app/#details"
                variant="outline"
              >
                View Details
              </GalleryButton>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
