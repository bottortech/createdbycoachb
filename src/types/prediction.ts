export interface PredictionFramework {
  stage: string;
  description: string;
}

/** Accuracy status — filled in years later as predictions play out. */
export type AccuracyStatus =
  | "pending"     // default — outcome not yet determinable
  | "confirmed"   // prediction held up
  | "partial"     // partially correct
  | "missed"      // clearly wrong
  | "too-soon";   // still unfolding

export interface PredictionMeta {
  slug: string;
  id: string;
  number: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  coreIdea: string;
  framework: PredictionFramework[];
  examples: string[];

  // Optional enrichment fields — add as predictions mature
  readingTime?: number;           // minutes
  relatedSlugs?: string[];        // slugs of related predictions
  featured?: boolean;             // pin to top of list / gallery hero
  accuracyStatus?: AccuracyStatus;
  accuracyNote?: string;          // short update written later
  seriesId?: string;              // group predictions into named series
  seriesOrder?: number;           // position within a series
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
  | "accuracyStatus"
>;
