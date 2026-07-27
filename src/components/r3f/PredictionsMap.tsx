"use client";

import { AnimatePresence, motion } from "framer-motion";
import { getPublishedPredictions } from "@/data/predictions";
import { PREDICTION_STATUS_META } from "@/types/prediction";

interface PredictionsMapProps {
  open: boolean;
  onSelectPrediction: (slug: string) => void;
  onReturn: () => void;
}

/** AI Predictions' own nav strip — same bottom-bar pattern as TechVaultMap,
 *  so a growing archive of predictions never has to add itself to the main
 *  Gallery Map. Picking one opens the prediction modal directly; there's no
 *  per-prediction camera position to jump to. */
export default function PredictionsMap({ open, onSelectPrediction, onReturn }: PredictionsMapProps) {
  const predictions = getPublishedPredictions();

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
              AI Predictions
            </span>

            {/* Prediction chips — horizontally scrollable on narrow screens */}
            <div
              className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {predictions.length === 0 ? (
                <span className="text-[10px] text-gallery-muted">No predictions published yet.</span>
              ) : (
                predictions.map((p) => {
                  const statusMeta = PREDICTION_STATUS_META[p.status];
                  return (
                    <button
                      key={p.slug}
                      onClick={() => onSelectPrediction(p.slug)}
                      className="flex flex-shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-gallery-light transition-all hover:border-gallery-accent/40 hover:text-gallery-accent"
                    >
                      <span
                        className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                        style={{ background: statusMeta.color, boxShadow: `0 0 5px ${statusMeta.color}` }}
                        title={statusMeta.label}
                      />
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.04] text-[9px] font-semibold tracking-normal text-gallery-muted">
                        {p.number.replace("#", "")}
                      </span>
                      <span className="normal-case tracking-normal">{p.title}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
