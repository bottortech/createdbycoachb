import type { PredictionMeta } from "@/types/prediction";

// This client-side array backs the 3D gallery's Predictions Wing (and the
// /standard page's list) — a separate copy from src/content/predictions/,
// which backs the full-article MDX pages. Keep a new prediction's
// releaseDate in sync across both so it stays hidden/reveals at the same
// time everywhere. Unlike the MDX side (server-rendered, needs ISR to
// re-check the date), this filter runs live in the visitor's own browser
// on every render, so it's correct automatically — no revalidation needed.
export function getPublishedPredictions(): PredictionMeta[] {
  const now = Date.now();
  return PREDICTIONS.filter(
    (p) => !p.releaseDate || new Date(p.releaseDate + "T00:00:00").getTime() <= now
  );
}

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
    status: "watching",
    lastUpdated: "2026-06-27",
    updates: [],
    examples: [
      "Original hand-painted art may become more valuable than AI-generated prints.",
      "Live concerts may become even more valuable because recorded music did not eliminate live performances.",
      "Human-written books may become more meaningful to readers who care about the author's real voice and lived experience.",
      "Handmade craftsmanship may carry a premium as AI and automation make digital content more abundant.",
    ],
  },
  {
    slug: "002-ai-everyday-utility",
    id: "002",
    number: "#002",
    title: "AI Will Become an Everyday Utility",
    date: "2026-07-27",
    summary:
      "AI will follow the same adoption path as calculators, search engines, GPS, and smartphones, eventually becoming so common that people stop thinking about it as \"AI.\"",
    category: "Artificial Intelligence",
    tags: [
      "Artificial Intelligence",
      "Technology",
      "Future of Work",
      "Innovation",
      "Productivity",
      "Digital Transformation",
      "Everyday Technology",
    ],
    coreIdea:
      "As AI becomes embedded into the products and services people already use, it will fade into the background and become everyday infrastructure rather than a standalone technology.",
    framework: [
      {
        stage: "Stage 1 — Resistance",
        description:
          "People question AI, fear it, and debate whether it should be used — schools ban it in classrooms, businesses hesitate to adopt it, and concerns about jobs fuel ongoing ethical debates.",
      },
      {
        stage: "Stage 2 — Adoption",
        description:
          "Organizations begin integrating AI because it saves time, reduces costs, and improves productivity — AI assistants show up in offices, customer support, writing tools, and coding assistants.",
      },
      {
        stage: "Stage 3 — Invisible Infrastructure",
        description:
          "AI becomes so integrated that people stop calling it AI, and simply say \"ask my phone,\" \"translate this,\" or \"summarize this meeting\" — the same way nobody says they're \"using GPS\" anymore, they just navigate.",
      },
    ],
    readingTime: 3,
    featured: false,
    status: "watching",
    lastUpdated: "2026-07-27",
    updates: [],
    releaseDate: "2026-07-27",
    examples: [
      "GPS replacing paper maps.",
      "Search engines replacing encyclopedias.",
      "Smartphones replacing cameras, calculators, flashlights, and MP3 players.",
      "Spell check and spam filtering running automatically, without anyone asking.",
      "AI recommendations built into Netflix, Spotify, and YouTube.",
      "AI writing suggestions, customer service, and scheduling assistants built directly into operating systems.",
    ],
  },
  {
    slug: "003-homework-obsolete",
    id: "003",
    number: "#003",
    title: "Traditional Homework Will Become Obsolete",
    date: "2026-08-27",
    summary:
      "As AI becomes capable of completing take-home assignments, schools will shift toward hands-on learning and real-world demonstrations of knowledge.",
    category: "Education",
    tags: [
      "Artificial Intelligence",
      "Education",
      "Homework",
      "EdTech",
      "Future of Learning",
      "Schools",
      "Students",
    ],
    coreIdea:
      "The purpose of homework will change because assignments that AI can complete no longer accurately measure what students know.",
    framework: [
      {
        stage: "Stage 1 — AI Completes Homework",
        description:
          "Students begin relying on AI to solve math problems, write essays, summarize reading, and answer science and language questions — turning take-home assignments into something AI can finish in minutes.",
      },
      {
        stage: "Stage 2 — Schools Adapt",
        description:
          "Educators recognize that traditional homework no longer measures learning and begin redesigning assignments around open-AI homework, oral presentations, in-class writing, collaborative projects, and direct teacher observation.",
      },
      {
        stage: "Stage 3 — Learning Becomes Experiential",
        description:
          "Schools shift toward demonstrating understanding over completing worksheets — science experiments, engineering builds, reading aloud, debates, presentations, community projects, and art or music performances.",
      },
    ],
    readingTime: 2,
    featured: false,
    status: "watching",
    lastUpdated: "2026-08-27",
    updates: [],
    releaseDate: "2026-08-27",
    examples: [
      "Building a volcano instead of writing about one.",
      "Recording yourself reading instead of answering reading questions.",
      "Designing a bridge instead of completing a worksheet.",
      "Creating a business instead of writing a business report.",
      "Performing a science experiment in class.",
      "Coding a small app instead of answering programming questions.",
      "Building robots.",
      "Creating videos explaining concepts.",
    ],
  },
];
