"use client";

import { motion } from "framer-motion";

interface SceneDotsProps {
  total: number;
  current: number;
  onChange: (index: number) => void;
  labels: string[];
}

/**
 * Side nav dots showing gallery position.
 * Each dot is clickable to jump to a scene.
 * Hovering shows the scene label.
 */
export default function SceneDots({
  total,
  current,
  onChange,
  labels,
}: SceneDotsProps) {
  return (
    <div className="fixed right-5 top-1/2 z-30 -translate-y-1/2 flex flex-col items-end gap-3 md:right-7">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className="group relative flex items-center justify-end"
          aria-label={`Go to ${labels[i]}`}
        >
          {/* Label tooltip on hover */}
          <span className="pointer-events-none absolute right-6 whitespace-nowrap rounded bg-gallery-black/80 px-2.5 py-1 text-[10px] font-medium tracking-wide text-gallery-light opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
            {labels[i]}
          </span>

          {/* Dot */}
          <motion.div
            animate={{
              width: current === i ? 20 : 6,
              height: 6,
              backgroundColor:
                current === i ? "#c9a84c" : "rgba(245,245,245,0.25)",
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="rounded-full"
            style={{
              boxShadow:
                current === i
                  ? "0 0 8px rgba(201,168,76,0.5)"
                  : "none",
            }}
          />
        </button>
      ))}
    </div>
  );
}
