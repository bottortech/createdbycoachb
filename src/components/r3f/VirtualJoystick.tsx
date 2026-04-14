"use client";

import { useRef, useCallback } from "react";

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
  onLook: (dx: number) => void;
}

/**
 * On-screen D-pad for mobile movement + look buttons.
 * Clear arrows so you know exactly which direction you're going.
 */
export default function VirtualJoystick({ onMove, onLook }: VirtualJoystickProps) {
  const moveInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const lookInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const startMove = useCallback((x: number, y: number) => {
    onMove(x, y);
    if (moveInterval.current) clearInterval(moveInterval.current);
    moveInterval.current = setInterval(() => onMove(x, y), 50);
  }, [onMove]);

  const stopMove = useCallback(() => {
    if (moveInterval.current) { clearInterval(moveInterval.current); moveInterval.current = null; }
    onMove(0, 0);
  }, [onMove]);

  const startLook = useCallback((dx: number) => {
    onLook(dx);
    if (lookInterval.current) clearInterval(lookInterval.current);
    lookInterval.current = setInterval(() => onLook(dx), 50);
  }, [onLook]);

  const stopLook = useCallback(() => {
    if (lookInterval.current) { clearInterval(lookInterval.current); lookInterval.current = null; }
    onLook(0);
  }, [onLook]);

  const btn = "flex items-center justify-center rounded-lg border border-white/15 bg-black/40 backdrop-blur-sm active:bg-gallery-accent/20 active:border-gallery-accent/30 transition-colors touch-none select-none";

  return (
    <>
      {/* Movement D-pad — bottom left */}
      <div className="fixed bottom-16 left-4 z-30">
        <div className="grid grid-cols-3 grid-rows-3 gap-1" style={{ width: "130px", height: "130px" }}>
          {/* Row 1: empty, forward, empty */}
          <div />
          <button
            className={`${btn} h-10 w-10`}
            onPointerDown={() => startMove(0, 1)}
            onPointerUp={stopMove}
            onPointerLeave={stopMove}
          >
            <svg className="h-4 w-4 text-gallery-light/70" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
          </button>
          <div />

          {/* Row 2: left, center label, right */}
          <button
            className={`${btn} h-10 w-10`}
            onPointerDown={() => startMove(-1, 0)}
            onPointerUp={stopMove}
            onPointerLeave={stopMove}
          >
            <svg className="h-4 w-4 text-gallery-light/70" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center justify-center">
            <span className="text-[7px] uppercase tracking-wider text-gallery-muted/40">Move</span>
          </div>
          <button
            className={`${btn} h-10 w-10`}
            onPointerDown={() => startMove(1, 0)}
            onPointerUp={stopMove}
            onPointerLeave={stopMove}
          >
            <svg className="h-4 w-4 text-gallery-light/70" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>

          {/* Row 3: empty, backward, empty */}
          <div />
          <button
            className={`${btn} h-10 w-10`}
            onPointerDown={() => startMove(0, -1)}
            onPointerUp={stopMove}
            onPointerLeave={stopMove}
          >
            <svg className="h-4 w-4 text-gallery-light/70" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <div />
        </div>
      </div>

      {/* Look buttons — bottom right */}
      <div className="fixed bottom-20 right-4 z-30 flex items-center gap-2">
        <button
          className={`${btn} h-12 w-12`}
          onPointerDown={() => startLook(3)}
          onPointerUp={stopLook}
          onPointerLeave={stopLook}
        >
          <svg className="h-5 w-5 text-gallery-light/70" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-[7px] uppercase tracking-wider text-gallery-muted/40">Look</span>
        <button
          className={`${btn} h-12 w-12`}
          onPointerDown={() => startLook(-3)}
          onPointerUp={stopLook}
          onPointerLeave={stopLook}
        >
          <svg className="h-5 w-5 text-gallery-light/70" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </>
  );
}
