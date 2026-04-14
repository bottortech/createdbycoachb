"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export type FrameType = "square" | "landscape" | "portrait";

interface FramedPieceProps {
  children: ReactNode;
  frameType?: FrameType;
  onClick?: () => void;
  className?: string;
  delay?: number;
  spotlight?: boolean;
  plaque?: {
    title: string;
    subtitle?: string;
  };
}

/**
 * Frame asset metadata.
 * Each frame PNG has its own aspect ratio and "cutout" — the inner
 * area where the artwork should be positioned. Cutouts are expressed
 * as percentages from each edge of the frame image.
 *
 * The frame PNGs include their own baked-in wall background and
 * shadow, which sits naturally against the dark gallery wall.
 */
const FRAME_CONFIG: Record<
  FrameType,
  {
    src: string;
    aspect: string;
    cutout: { top: string; right: string; bottom: string; left: string };
  }
> = {
  square: {
    src: "/images/frames/frame-square.png",
    aspect: "1 / 1",
    cutout: { top: "16%", right: "15%", bottom: "16%", left: "15%" },
  },
  landscape: {
    src: "/images/frames/frame-landscape.png",
    aspect: "3 / 2",
    cutout: { top: "18%", right: "15%", bottom: "18%", left: "15%" },
  },
  portrait: {
    src: "/images/frames/frame-portrait.png",
    aspect: "2 / 3",
    cutout: { top: "13%", right: "16%", bottom: "13%", left: "16%" },
  },
};

/**
 * A real wall-mounted framed artwork.
 *
 * Layered:
 *  1. Spotlight cone (CSS) — warm light hitting the frame from above
 *  2. Artwork base layer — positioned inside the frame's cutout
 *  3. Frame PNG — the gold ornate frame on top
 *  4. Glass reflection — diagonal sheen on the artwork
 *  5. Brass plaque (PNG) — mounted below the frame
 */
export default function FramedPiece({
  children,
  frameType = "square",
  onClick,
  className = "",
  delay = 0,
  spotlight = true,
  plaque,
}: FramedPieceProps) {
  const isInteractive = Boolean(onClick);
  const config = FRAME_CONFIG[frameType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay }}
      className={`relative ${className}`}
    >
      {/* Spotlight cone hitting the frame from the ceiling */}
      {spotlight && (
        <>
          <div
            className="pointer-events-none absolute -top-20 left-1/2 h-48 w-[120%] -translate-x-1/2"
            style={{
              background:
                "radial-gradient(ellipse at top, rgba(255,225,170,0.22) 0%, rgba(201,168,76,0.10) 35%, transparent 70%)",
              filter: "blur(24px)",
            }}
          />
          <div
            className="pointer-events-none absolute -top-12 left-1/2 h-32 w-[85%] -translate-x-1/2"
            style={{
              background:
                "radial-gradient(ellipse at top, rgba(255,235,200,0.16) 0%, transparent 70%)",
              filter: "blur(14px)",
            }}
          />
        </>
      )}

      <motion.div
        whileHover={isInteractive ? { y: -8 } : undefined}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="group relative"
      >
        {/* Hover ambient glow */}
        {isInteractive && (
          <div
            className="pointer-events-none absolute -inset-6 rounded-xl opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(255,225,170,0.25) 0%, transparent 70%)",
            }}
          />
        )}

        {/* The framed piece itself */}
        <button
          type="button"
          onClick={onClick}
          disabled={!isInteractive}
          className={`relative block w-full ${
            isInteractive ? "cursor-pointer" : "cursor-default"
          }`}
          style={{
            aspectRatio: config.aspect,
            filter:
              "drop-shadow(0 35px 50px rgba(0,0,0,0.7)) drop-shadow(0 14px 22px rgba(0,0,0,0.5))",
          }}
        >
          {/* Artwork — sits inside the frame's cutout area */}
          <div
            className="absolute overflow-hidden bg-gallery-black"
            style={{
              top: config.cutout.top,
              right: config.cutout.right,
              bottom: config.cutout.bottom,
              left: config.cutout.left,
            }}
          >
            {children}

            {/* Glass reflection — diagonal sheen */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(125deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0) 45%, rgba(255,255,255,0) 100%)",
              }}
            />

            {/* Subtle warm light wash from above */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(255,225,170,0.08) 0%, transparent 100%)",
              }}
            />

            {/* Hover tint */}
            {isInteractive && (
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(to top, rgba(255,225,170,0.18), transparent 60%)",
                }}
              />
            )}
          </div>

          {/* Real gold frame PNG on top */}
          <Image
            src={config.src}
            alt=""
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            className="pointer-events-none object-contain"
            priority={false}
          />
        </button>

        {/* Brass plaque mounted below the frame */}
        {plaque && (
          <div className="mt-6 flex justify-center">
            <div
              className="relative px-9 py-3"
              style={{ minWidth: "200px" }}
            >
              {/* Brass plaque background image */}
              <Image
                src="/images/gallery/plaque.png"
                alt=""
                fill
                sizes="240px"
                className="pointer-events-none"
                style={{
                  filter:
                    "drop-shadow(0 6px 10px rgba(0,0,0,0.5)) drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                  objectFit: "fill",
                }}
              />
              {/* Plaque text */}
              <div className="relative text-center">
                <p
                  className="text-[8px] font-semibold uppercase tracking-[0.3em]"
                  style={{ color: "#3a2810" }}
                >
                  {plaque.subtitle}
                </p>
                <p
                  className="mt-0.5 text-[11px] font-semibold tracking-wide"
                  style={{ color: "#1a1108" }}
                >
                  {plaque.title}
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
