"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = "*, *::before, *::after { cursor: none !important; }";
    document.head.appendChild(style);

    const onMove = (e: MouseEvent) => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      style={{
        position: "fixed",
        top: -5,
        left: -5,
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: "#c9a84c",
        pointerEvents: "none",
        zIndex: 99999,
        willChange: "transform",
        boxShadow: "0 0 6px rgba(201,168,76,0.6)",
      }}
    />
  );
}
