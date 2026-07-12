"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * TEMPORARY performance-diagnostic component — reports a rolling FPS average
 * into a ref so the HTML debug HUD (outside the Canvas) can display it.
 * Safe to delete once perf tuning is done.
 */
export default function FPSMeter({ fpsRef }: { fpsRef: RefObject<number> }) {
  const frameCount = useRef(0);
  const windowStart = useRef(0);

  useFrame(({ clock }) => {
    frameCount.current += 1;
    const elapsed = clock.elapsedTime - windowStart.current;
    if (elapsed >= 0.5) {
      fpsRef.current = frameCount.current / elapsed;
      frameCount.current = 0;
      windowStart.current = clock.elapsedTime;
    }
  });

  return null;
}
