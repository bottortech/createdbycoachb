export interface PredictionFramework {
  stage: string;
  description: string;
}

/** Living-archive status — this is the whole point of the archive: a
 *  prediction's standing is expected to change over time as real-world
 *  evidence comes in, tracked via each prediction's `updates` timeline. No
 *  confidence/probability score — just where the prediction currently
 *  stands. */
export type PredictionStatus =
  | "watching"      // published, nothing notable observed yet
  | "emerging"      // early signals starting to show up
  | "accelerating"  // evidence building, trending toward confirmed
  | "confirmed"      // played out as predicted
  | "disproven";    // clearly did not play out as predicted

/** Color + label for each status — single source of truth for both the DOM
 *  badges (cards, article page) and the 3D gallery frame's status dot. */
export const PREDICTION_STATUS_META: Record<PredictionStatus, { label: string; color: string }> = {
  watching:     { label: "Watching",     color: "#9ca3af" }, // gray
  emerging:     { label: "Emerging",     color: "#eab308" }, // yellow
  accelerating: { label: "Accelerating", color: "#f97316" }, // orange
  confirmed:    { label: "Confirmed",    color: "#22c55e" }, // green
  disproven:    { label: "Disproven",    color: "#ef4444" }, // red
};

/** One dated entry in a prediction's "Evidence & Updates" timeline —
 *  written whenever real-world evidence changes where a prediction stands. */
export interface PredictionUpdate {
  date: string;                 // ISO date (YYYY-MM-DD)
  title: string;
  summary: string;
  sourceUrl?: string;
  previousStatus: PredictionStatus;
  newStatus: PredictionStatus;
}

export interface PredictionMeta {
  slug: string;
  id: string;
  number: string;
  title: string;
  /** Published date (ISO YYYY-MM-DD). */
  date: string;
  summary: string;
  category: string;
  tags: string[];
  coreIdea: string;
  framework: PredictionFramework[];
  examples: string[];

  /** Current standing — see PREDICTION_STATUS_META. */
  status: PredictionStatus;
  /** ISO date (YYYY-MM-DD) — the most recent status change, or the
   *  published date if there have been none yet. Shown on cards. */
  lastUpdated: string;
  /** Evidence & Updates timeline, newest first by convention (not enforced —
   *  consumers sort defensively). Empty array = "No updates yet." */
  updates: PredictionUpdate[];

  // Optional enrichment fields — add as predictions mature
  readingTime?: number;           // minutes
  relatedSlugs?: string[];        // slugs of related predictions
  featured?: boolean;             // pin to top of list / gallery hero
  seriesId?: string;              // group predictions into named series
  seriesOrder?: number;           // position within a series
  /** ISO date (YYYY-MM-DD). While in the future, this prediction is fully
   *  hidden — no card, no wing plaque, no direct URL — everywhere it's
   *  consumed (see getPublishedPredictions/getAllPredictionMeta). Omit for
   *  predictions that are already live. */
  releaseDate?: string;
}

/** Lightweight card for lists, gallery map, and search results. */
export type PredictionCard = Pick<
  PredictionMeta,
  | "slug"
  | "id"
  | "number"
  | "title"
  | "date"
  | "summary"
  | "category"
  | "tags"
  | "coreIdea"
  | "readingTime"
  | "featured"
  | "status"
  | "lastUpdated"
>;
