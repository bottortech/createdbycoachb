"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

const TRACK_LIGHT_POSITIONS = [10, 28, 50, 72, 90];

/**
 * Persistent gallery interior environment.
 *
 * Real textures used:
 *  - floor.png (dark marble) at the bottom with subtle perspective gradient
 *  - wall.png (dark plaster) on left and right with center fade
 *  - ceiling.png (dark texture) at top
 *  - track-light.png positioned across the ceiling
 *  - light-beam.svg cones falling from each track light
 *
 * The whole environment is fixed-position (z-0) so it stays visible
 * as the user scrolls through page content. Subtle transforms based
 * on scroll position create a sense of motion through the space.
 */
export default function GalleryEnvironment() {
  const { scrollYProgress } = useScroll();

  // Subtle drift to create the feeling of walking through the space
  const floorY = useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);
  const ceilingY = useTransform(scrollYProgress, [0, 1], ["0%", "-3%"]);
  const beamShift = useTransform(scrollYProgress, [0, 1], ["0%", "1.5%"]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ background: "#070504" }}
    >
      {/* === DEEP BACK WALL === */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, #1a1209 0%, #110a06 35%, #070504 75%)",
        }}
      />

      {/* === LEFT WALL TEXTURE === */}
      <div
        className="absolute inset-y-0 left-0 w-[26vw]"
        style={{
          backgroundImage: "url('/images/gallery/wall.png')",
          backgroundSize: "auto 60vh",
          backgroundRepeat: "repeat-y",
          backgroundPosition: "left center",
          maskImage:
            "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 50%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 50%, transparent 100%)",
        }}
      >
        {/* Top to bottom gradient for depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.4) 100%)",
          }}
        />
      </div>

      {/* === RIGHT WALL TEXTURE === */}
      <div
        className="absolute inset-y-0 right-0 w-[26vw]"
        style={{
          backgroundImage: "url('/images/gallery/wall.png')",
          backgroundSize: "auto 60vh",
          backgroundRepeat: "repeat-y",
          backgroundPosition: "right center",
          maskImage:
            "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 50%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 50%, transparent 100%)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.4) 100%)",
          }}
        />
      </div>

      {/* === CEILING === */}
      <motion.div
        style={{ y: ceilingY }}
        className="absolute inset-x-0 top-0 h-[18vh]"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/gallery/ceiling.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 60%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 60%, transparent 100%)",
          }}
        />
        {/* Crown line where ceiling meets walls */}
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.20) 30%, rgba(201,168,76,0.30) 50%, rgba(201,168,76,0.20) 70%, transparent 100%)",
          }}
        />
        {/* Lower edge shadow */}
        <div
          className="absolute inset-x-0 bottom-[1px] h-3"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)",
          }}
        />
      </motion.div>

      {/* === LIGHT BEAMS — falling from ceiling === */}
      <motion.div
        style={{ x: beamShift }}
        className="absolute inset-x-0 top-[10vh] h-[80vh]"
      >
        {TRACK_LIGHT_POSITIONS.map((pos) => (
          <div
            key={`beam-${pos}`}
            className="absolute top-0"
            style={{
              left: `${pos}%`,
              transform: "translateX(-50%)",
              width: "320px",
              height: "100%",
              mixBlendMode: "screen",
              opacity: 0.85,
            }}
          >
            <Image
              src="/images/gallery/light-beam.svg"
              alt=""
              width={400}
              height={800}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </motion.div>

      {/* === TRACK LIGHTS on the ceiling === */}
      <div className="absolute inset-x-0 top-0 z-[3] h-[18vh]">
        {TRACK_LIGHT_POSITIONS.map((pos) => (
          <div
            key={`light-${pos}`}
            className="absolute top-0"
            style={{
              left: `${pos}%`,
              transform: "translateX(-50%)",
              width: "180px",
              height: "120px",
            }}
          >
            <Image
              src="/images/gallery/track-light.png"
              alt=""
              width={300}
              height={200}
              className="h-full w-full object-contain object-top"
              style={{
                filter:
                  "drop-shadow(0 4px 8px rgba(0,0,0,0.6)) brightness(0.95)",
              }}
            />
          </div>
        ))}
      </div>

      {/* === FLOOR === */}
      <motion.div
        style={{ y: floorY }}
        className="absolute inset-x-0 bottom-0 h-[38vh]"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/gallery/floor.png')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            maskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 40%, rgba(0,0,0,0.6) 70%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 40%, rgba(0,0,0,0.6) 70%, transparent 100%)",
          }}
        />

        {/* Floor reflection of ceiling lights — warm wash */}
        <div
          className="absolute inset-x-0 top-0 h-[24vh]"
          style={{
            background:
              "radial-gradient(ellipse 70% 100% at center top, rgba(255,225,170,0.08) 0%, rgba(201,168,76,0.04) 35%, transparent 70%)",
            mixBlendMode: "screen",
          }}
        />

        {/* Specific reflections under each track light */}
        {TRACK_LIGHT_POSITIONS.map((pos) => (
          <div
            key={`reflect-${pos}`}
            className="absolute top-0 h-[10vh] w-[18vw]"
            style={{
              left: `${pos}%`,
              transform: "translateX(-50%)",
              background:
                "radial-gradient(ellipse at top, rgba(255,225,170,0.10) 0%, transparent 70%)",
              filter: "blur(8px)",
              mixBlendMode: "screen",
            }}
          />
        ))}

        {/* Horizon line — where wall meets floor */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.30) 15%, rgba(201,168,76,0.45) 50%, rgba(201,168,76,0.30) 85%, transparent 100%)",
          }}
        />
      </motion.div>

      {/* === ATMOSPHERIC HAZE === */}
      <div
        className="absolute inset-0 mix-blend-screen opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at center 60%, rgba(40,28,16,0.4) 0%, transparent 65%)",
        }}
      />

      {/* === OVERALL VIGNETTE === */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </div>
  );
}
