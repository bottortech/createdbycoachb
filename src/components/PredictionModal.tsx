"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import Link from "next/link";
import type { PredictionMeta } from "@/types/prediction";

interface PredictionModalProps {
  prediction: PredictionMeta | null;
  onClose: () => void;
}

export default function PredictionModal({ prediction, onClose }: PredictionModalProps) {
  const open = Boolean(prediction);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && prediction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-8 backdrop-blur-md"
        >
          {/* Animation wrapper only — no clipping */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[860px]"
          >
            {/* Gray card — expands around the content, not with it */}
            <div
              className="relative flex flex-col rounded-2xl border border-white/8 bg-gallery-charcoal shadow-[0_60px_120px_-30px_rgba(0,0,0,0.95)]"
              style={{ maxHeight: "90vh", overflow: "hidden" }}
            >
              {/* Close button — always in top-right corner of the card */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-gallery-white backdrop-blur-md transition-all hover:border-gallery-accent/40 hover:bg-gallery-accent hover:text-gallery-black"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* ── Header — inset from card edges ── */}
              <div
                className="relative shrink-0 border-b border-white/6"
                style={{ padding: "2.5rem 3rem 2rem" }}
              >
                {/* Ambient glow stays inside the padding */}
                <div
                  className="pointer-events-none absolute left-1/2 top-0 h-32 w-3/4 -translate-x-1/2 blur-3xl"
                  style={{ background: "radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)" }}
                />
                <p className="text-[10px] font-medium uppercase tracking-[0.45em] text-gallery-accent mb-3">
                  AI Prediction {prediction.number}
                </p>
                <h3 className="text-2xl font-light text-gallery-white leading-snug" style={{ paddingRight: "2.5rem" }}>
                  {prediction.title}
                </h3>
                <p className="mt-2 text-xs text-gallery-muted">
                  {new Date(prediction.date + "T12:00:00").toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {" · "}
                  {prediction.category}
                </p>
              </div>

              {/* ── Scrollable body — same side inset as header ── */}
              <div
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
                style={{ padding: "2rem 3rem 0" }}
              >
                {/* Inner content — floats in the middle of the card */}
                <div className="space-y-6">

                  {/* Core idea callout — does NOT touch the card edge */}
                  <div className="rounded-xl border border-gallery-accent/20 bg-gallery-accent-soft p-5">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-gallery-accent mb-2">
                      The Prediction
                    </p>
                    <p className="text-gallery-white text-sm leading-relaxed font-light">
                      {prediction.coreIdea}
                    </p>
                  </div>

                  {/* Framework */}
                  {prediction.framework.length > 0 && (
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-gallery-accent mb-3">
                        {prediction.title} Framework
                      </p>
                      <div className="space-y-3">
                        {prediction.framework.map((step, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-gallery-accent/40 flex items-center justify-center">
                              <span className="text-[9px] text-gallery-accent font-medium">{i + 1}</span>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gallery-white">{step.stage}</p>
                              <p className="text-xs text-gallery-muted mt-0.5 leading-relaxed">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Examples */}
                  {prediction.examples.length > 0 && (
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-gallery-accent mb-3">
                        Examples
                      </p>
                      <ul className="space-y-2">
                        {prediction.examples.map((ex, i) => (
                          <li key={i} className="flex gap-3 text-xs text-gallery-muted leading-relaxed">
                            <span className="text-gallery-accent/50 shrink-0 mt-0.5">—</span>
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tags */}
                  {prediction.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {prediction.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gallery-accent-soft border border-gallery-accent/20 px-3 py-1 text-[10px] font-medium text-gallery-accent"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA — well inside the card with generous bottom gap */}
                  <div style={{ paddingBottom: "2.5rem" }}>
                    <Link
                      href={`/predictions/${prediction.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-gallery-accent px-7 py-3 text-sm font-medium tracking-wide text-gallery-black transition-all hover:bg-gallery-accent/90 hover:shadow-lg hover:shadow-gallery-accent/20"
                    >
                      Read Full Article
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
