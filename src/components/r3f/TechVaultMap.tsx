"use client";

import { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Cases in position order: back row left→right, then front row left→right.
// Indices match the order appended to STOPS starting at VAULT_CASE_START.
const CASES: { key: string; title: string }[] = [
  { key: "backend",    title: "Backend" },
  { key: "aicore",     title: "AI Core" },
  { key: "frontend",   title: "Frontend" },
  { key: "devtools",   title: "Dev Tools" },
  { key: "payments",   title: "Payments" },
  { key: "gamedev",    title: "Game Dev" },
  { key: "automation", title: "Automation" },
];

interface TechVaultMapProps {
  open: boolean;
  onClose: () => void;
  onSelectCase: (index: number) => void;
  onReturn: () => void;
  currentCaseKey: string | null;
}

export default function TechVaultMap({ open, onSelectCase, onReturn, currentCaseKey }: TechVaultMapProps) {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !stripRef.current) return;
    const active = stripRef.current.querySelector("[data-active=true]");
    if (active) active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [open, currentCaseKey]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed left-0 right-0 bottom-0 z-[75] border-t border-white/[0.06] bg-[#0c0a08] shadow-[0_-8px_32px_rgba(0,0,0,0.5)]"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-3 md:px-6">
            {/* Return to Main Gallery pill — left side */}
            <button
              onClick={onReturn}
              className="flex flex-shrink-0 items-center gap-2 rounded-full border border-gallery-accent/50 bg-gallery-accent/10 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-gallery-accent transition-colors hover:bg-gallery-accent/20"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Main Gallery</span>
              <span className="sm:hidden">Back</span>
            </button>

            {/* Thin divider */}
            <div className="h-8 w-px flex-shrink-0 bg-white/10" />

            {/* Section label — desktop only */}
            <span className="hidden flex-shrink-0 text-[9px] font-medium uppercase tracking-[0.32em] text-gallery-accent/70 md:inline">
              Tech Vault
            </span>

            {/* Case chips — horizontally scrollable on narrow screens */}
            <div
              ref={stripRef}
              className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {CASES.map((c, i) => {
                const isActive = currentCaseKey === c.key;
                return (
                  <button
                    key={c.key}
                    data-active={isActive}
                    onClick={() => onSelectCase(i)}
                    className={`flex flex-shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] transition-all ${
                      isActive
                        ? "border-gallery-accent/60 bg-gallery-accent/15 text-gallery-accent"
                        : "border-white/10 bg-white/[0.02] text-gallery-light hover:border-gallery-accent/40 hover:text-gallery-accent"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold tracking-normal ${
                        isActive ? "bg-gallery-accent/20 text-gallery-accent" : "bg-white/[0.04] text-gallery-muted"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{c.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
