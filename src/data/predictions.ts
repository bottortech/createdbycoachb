import type { PredictionMeta } from "@/types/prediction";

export const PREDICTIONS: PredictionMeta[] = [
  {
    slug: "001-authenticity-shift",
    id: "001",
    number: "#001",
    title: "The Authenticity Shift",
    date: "2026-06-27",
    summary: "AI will create abundance, and abundance will make authenticity more valuable.",
    category: "AI & Society",
    tags: ["AI", "Creativity", "Business", "Society"],
    coreIdea: "AI will create abundance, and abundance will make authenticity more valuable.",
    framework: [
      {
        stage: "Stage 1 — Automation",
        description:
          "AI makes creation easier. Barriers that once required years of skill begin to dissolve. Anyone can produce professional-looking output.",
      },
      {
        stage: "Stage 2 — Abundance",
        description:
          "High-quality content becomes widely available at low cost. Volume becomes infinite. Marginal cost approaches zero.",
      },
      {
        stage: "Stage 3 — Authenticity Premium",
        description:
          "People begin paying more for what AI cannot easily mass-produce: originality, human effort, physical ownership, story, trust, reputation, and live experiences.",
      },
    ],
    readingTime: 5,
    featured: true,
    accuracyStatus: "pending" as const,
    examples: [
      "Original hand-painted art may become more valuable than AI-generated prints.",
      "Live concerts may become even more valuable because recorded music did not eliminate live performances.",
      "Human-written books may become more meaningful to readers who care about the author's real voice and lived experience.",
      "Handmade craftsmanship may carry a premium as AI and automation make digital content more abundant.",
    ],
  },
];
