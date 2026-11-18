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
    (p) =>
      !p.releaseDate || new Date(p.releaseDate + "T00:00:00").getTime() <= now,
  );
}

export const PREDICTIONS: PredictionMeta[] = [
  {
    slug: "001-authenticity-shift",
    id: "001",
    number: "#001",
    title: "The Authenticity Shift",
    date: "2026-06-27",
    summary:
      "AI will create abundance, and abundance will make authenticity more valuable.",
    category: "AI & Society",
    tags: ["AI", "Creativity", "Business", "Society"],
    coreIdea:
      "AI will create abundance, and abundance will make authenticity more valuable.",
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
      'AI will follow the same adoption path as calculators, search engines, GPS, and smartphones, eventually becoming so common that people stop thinking about it as "AI."',
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
          'AI becomes so integrated that people stop calling it AI, and simply say "ask my phone," "translate this," or "summarize this meeting" — the same way nobody says they\'re "using GPS" anymore, they just navigate.',
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
  {
    slug: "004-ai-transforms-accessibility",
    id: "004",
    number: "#004",
    title: "AI Will Transform Accessibility",
    date: "2026-09-27",
    summary:
      "Artificial intelligence will transform accessibility by reducing the barriers that prevent people with disabilities from independently participating in everyday life.",
    category: "Accessibility & Artificial Intelligence",
    tags: [
      "Artificial Intelligence",
      "Accessibility",
      "Assistive Technology",
      "Inclusive Design",
      "Education",
      "Independence",
      "Innovation",
    ],
    coreIdea:
      "Artificial intelligence will transform accessibility by reducing the barriers that prevent people with disabilities from independently participating in everyday life.",
    framework: [],
    readingTime: 3,
    featured: false,
    status: "watching",
    lastUpdated: "2026-09-27",
    updates: [],
    releaseDate: "2026-09-27",
    examples: [
      "Printed books become interactive, accessible learning experiences.",
      "Individuals with communication difficulties have more personalized ways to express themselves.",
      "Students receive educational instruction adapted to their individual abilities.",
      "Individuals with physical disabilities can control their environments through eye movements, voice commands, and other alternative inputs.",
      "Everyday devices automatically adjust to the accessibility needs of their users.",
    ],
  },
  {
    slug: "005-ai-robotics-manual-labor",
    id: "005",
    number: "#005",
    title: "AI and Robotics Will Transform Manual Labor",
    date: "2026-10-27",
    summary:
      "The integration of artificial intelligence and robotics will fundamentally transform manual labor, making many physical tasks faster, more automated, and less dependent on direct human involvement.",
    category: "Robotics & Future of Work",
    tags: [
      "Artificial Intelligence",
      "Robotics",
      "Automation",
      "Manual Labor",
      "Future of Work",
      "Transportation",
      "Manufacturing",
      "Innovation",
    ],
    coreIdea:
      "The integration of artificial intelligence and robotics will fundamentally transform manual labor, making many physical tasks faster, more automated, and less dependent on direct human involvement.",
    framework: [],
    readingTime: 3,
    featured: false,
    status: "watching",
    lastUpdated: "2026-10-27",
    updates: [],
    releaseDate: "2026-10-27",
    examples: [
      "Automated automotive maintenance and repair stations.",
      "Restaurants increasingly utilizing intelligent robotic food preparation systems.",
      "Greater automation across construction and agriculture.",
      "Autonomous transportation and delivery services becoming more common.",
      "Workers transitioning toward robotic supervision, maintenance, programming, and quality control.",
      "Businesses competing based on the speed and efficiency of automated physical services.",
    ],
  },
  {
    slug: "006-ai-electricity",
    id: "006",
    number: "#006",
    title: "AI Will Transform How We Produce and Consume Electricity",
    date: "2026-11-27",
    summary:
      "Artificial intelligence will transform how electricity is generated, stored, distributed, and consumed, shifting households and businesses from passive energy consumers toward active energy producers.",
    category: "Energy & Artificial Intelligence",
    tags: [
      "Artificial Intelligence",
      "Electricity",
      "Solar Energy",
      "Renewable Energy",
      "Smart Grids",
      "Battery Storage",
      "Sustainability",
      "Innovation",
      "Infrastructure",
      "Future of Energy",
    ],
    coreIdea:
      "Artificial intelligence will transform how electricity is generated, stored, distributed, and consumed, shifting households and businesses from passive energy consumers toward active energy producers.",
    framework: [],
    readingTime: 4,
    featured: false,
    status: "watching",
    lastUpdated: "2026-11-27",
    updates: [],
    releaseDate: "2026-11-27",
    examples: [
      "AI-powered residential and commercial energy management systems.",
      "Greater integration of solar panels, battery storage, and artificial intelligence.",
      "Automated purchasing and selling of electricity where regulations permit.",
      "Neighborhoods operating interconnected energy networks.",
      "Electric vehicles functioning as mobile energy storage systems.",
      "AI-powered electrical grids that anticipate demand and identify potential failures.",
      "Automated energy management systems that help reduce household electricity expenses.",
      "Traditional utility companies adapting their business models to accommodate decentralized energy production.",
      "New business opportunities centered around intelligent energy production, storage, and distribution.",
    ],
  },
  {
    slug: "007-ai-stock-market",
    id: "007",
    number: "#007",
    title: "AI Will Reshape the Stock Market",
    date: "2026-12-27",
    summary:
      "Artificial intelligence will fundamentally reshape the stock market by making sophisticated financial analysis more accessible to everyday investors while transforming how investment decisions are made and executed.",
    category: "Finance & Artificial Intelligence",
    tags: [
      "Artificial Intelligence",
      "Stock Market",
      "Investing",
      "Financial Technology",
      "Algorithmic Trading",
      "Automation",
      "Financial Markets",
      "Economics",
      "AI Agents",
      "Future of Finance",
    ],
    coreIdea:
      "Artificial intelligence will fundamentally reshape the stock market by making sophisticated financial analysis more accessible to everyday investors while transforming how investment decisions are made and executed.",
    framework: [],
    readingTime: 5,
    featured: false,
    status: "watching",
    lastUpdated: "2026-12-27",
    updates: [],
    releaseDate: "2026-12-27",
    examples: [
      "AI-powered personal investment assistants becoming mainstream.",
      "Automated portfolio management tailored to individual financial goals.",
      "Retail investors gaining access to increasingly sophisticated financial analysis.",
      "Financial institutions competing through proprietary AI investment systems.",
      "Companies offering specialized AI investment agents through subscription-based services.",
      "AI systems executing investment decisions within investor-defined boundaries.",
      "Investors comparing AI investment systems based on historical performance, reliability, strategy, and risk management.",
      "New regulations specifically addressing autonomous financial agents.",
      "Market disruptions linked to synchronized AI-driven trading decisions.",
      "Growing demand for independent auditing of AI-powered investment systems.",
      "Financial literacy increasingly including the ability to understand and manage AI-powered investment tools.",
    ],
  },
];
