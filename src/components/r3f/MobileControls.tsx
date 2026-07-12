"use client";

import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";

interface MobileControlsProps {
  /** Mutated directly on drag/release — CharacterController reads it every frame. */
  inputRef: RefObject<{ forward: number; turn: number }>;
}

const BASE_RADIUS = 55; // px
const NUB_RADIUS = 26; // px

/**
 * Single-stick tank-control joystick for mobile/touch: drag up/down = walk
 * forward/back, drag left/right = turn — same mapping as desktop W/A/S/D.
 * Pointer Events (not touch events) so it works consistently across
 * iPhone/iPad/Android; `touch-action: none` + pointer capture stop the page
 * from scrolling/zooming while dragging.
 */
export default function MobileControls({ inputRef }: MobileControlsProps) {
  const [hidden, setHidden] = useState(false);
  const [nubOffset, setNubOffset] = useState({ x: 0, y: 0 });
  const baseRef = useRef<HTMLDivElement>(null);
  const activePointerId = useRef<number | null>(null);

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const base = baseRef.current;
      if (!base) return;
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > BASE_RADIUS) {
        dx = (dx / dist) * BASE_RADIUS;
        dy = (dy / dist) * BASE_RADIUS;
      }
      setNubOffset({ x: dx, y: dy });
      inputRef.current.forward = -dy / BASE_RADIUS; // up = forward
      inputRef.current.turn = dx / BASE_RADIUS; // right = turn right
    },
    [inputRef]
  );

  const resetStick = useCallback(() => {
    setNubOffset({ x: 0, y: 0 });
    inputRef.current.forward = 0;
    inputRef.current.turn = 0;
  }, [inputRef]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    activePointerId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX, e.clientY);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    updateFromPointer(e.clientX, e.clientY);
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    activePointerId.current = null;
    resetStick();
  };

  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        className="fixed bottom-8 left-4 z-30 rounded-full border border-gallery-accent/30 bg-black/50 px-3 py-2 text-[9px] uppercase tracking-wider text-gallery-accent backdrop-blur-sm"
      >
        Show Controls
      </button>
    );
  }

  return (
    <div className="fixed bottom-10 left-6 z-30 flex flex-col items-center gap-2">
      <div
        ref={baseRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative rounded-full border border-gallery-accent/30 bg-black/40 backdrop-blur-sm touch-none select-none"
        style={{ width: BASE_RADIUS * 2, height: BASE_RADIUS * 2, touchAction: "none" }}
      >
        <div
          className="absolute rounded-full border border-gallery-accent bg-gallery-accent/60"
          style={{
            width: NUB_RADIUS * 2,
            height: NUB_RADIUS * 2,
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) translate(${nubOffset.x}px, ${nubOffset.y}px)`,
            boxShadow: "0 0 12px rgba(212, 175, 55, 0.45)",
          }}
        />
      </div>
      <button
        onClick={() => {
          resetStick();
          setHidden(true);
        }}
        className="rounded-full border border-white/10 bg-black/40 px-2 py-1 text-[8px] uppercase tracking-wider text-gallery-muted hover:text-gallery-accent"
      >
        Hide Controls
      </button>
    </div>
  );
}
