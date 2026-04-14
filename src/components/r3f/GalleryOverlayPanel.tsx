"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

interface GalleryOverlayPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  label: string;
  children: React.ReactNode;
}

/**
 * A slide-in overlay panel for non-visual content (forms, info, social).
 * Slides from the right side, has a dark backdrop.
 */
export default function GalleryOverlayPanel({
  open,
  onClose,
  title,
  label,
  children,
}: GalleryOverlayPanelProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 bottom-0 z-[85] w-full max-w-lg overflow-y-auto border-l border-white/[0.06] bg-[#0c0a08]/95 backdrop-blur-xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-gallery-muted transition-colors hover:border-gallery-accent/40 hover:text-gallery-accent"
              aria-label="Close"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-8 pt-16 md:p-12 md:pt-16">
              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gallery-accent">
                {label}
              </span>
              <h2 className="mt-2 text-2xl font-light text-gallery-white md:text-3xl">
                {title}
              </h2>
              <div className="mt-8">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
