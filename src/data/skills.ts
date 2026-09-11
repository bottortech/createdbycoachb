export interface SkillCategory {
  id: string;
  title: string;
  tagline: string;
  chips: string[];
}

// Single source of truth for the Tech Vault's 7 categories, shared by the 3D
// gallery's vault exhibit (src/components/r3f/TechVault.tsx) and the standard
// page's Tech Stack section (src/components/SkillsSection.tsx).
export const SKILL_CATEGORIES: SkillCategory[] = [
  { id: "backend",    title: "Backend",    tagline: "Systems that run without friction.",     chips: ["Node.js", "APIs", "Railway"] },
  { id: "ai-core",    title: "AI Core",    tagline: "Where intelligence becomes execution.",  chips: ["Claude", "ChatGPT", "AI APIs"] },
  { id: "frontend",   title: "Frontend",   tagline: "Interfaces that feel effortless.",       chips: ["React", "Vite", "Three.js", "Extensions"] },
  { id: "devtools",   title: "Dev Tools",  tagline: "Built, tested, and shipped.",            chips: ["VS Code", "Xcode", "GitHub"] },
  { id: "payments",   title: "Payments",   tagline: "Seamless transactions, real products.",  chips: ["Stripe", "Square"] },
  { id: "gamedev",    title: "Game Dev",   tagline: "Interactive worlds built from scratch.", chips: ["Unity", "C#"] },
  { id: "automation", title: "Automation", tagline: "Turning processes into systems.",        chips: ["PDF Parsing", "Matching", "Workflows"] },
];

// Chip label → logo PNG lookup. Keep in sync with files in public/images/tech-vault/.
export const CHIP_IMAGES: Record<string, string> = {
  "React":       "/images/tech-vault/react.png",
  "Vite":        "/images/tech-vault/vite.png",
  "Three.js":    "/images/tech-vault/three-js.png",
  "Extensions":  "/images/tech-vault/extension.png",
  "Node.js":     "/images/tech-vault/nodejs.png",
  "APIs":        "/images/tech-vault/api.png",
  "Railway":     "/images/tech-vault/railway.png",
  "Claude":      "/images/tech-vault/claude.png",
  "ChatGPT":     "/images/tech-vault/chatgpt.png",
  "AI APIs":     "/images/tech-vault/ai-api.png",
  "Unity":       "/images/tech-vault/unity.png",
  "C#":          "/images/tech-vault/csharp.png",
  "Stripe":      "/images/tech-vault/stripe.png",
  "Square":      "/images/tech-vault/square.png",
  "VS Code":     "/images/tech-vault/vscode.png",
  "Xcode":       "/images/tech-vault/xcode.png",
  "GitHub":      "/images/tech-vault/github.png",
  "PDF Parsing": "/images/tech-vault/pdf-parsing.png",
  "Matching":    "/images/tech-vault/matching.png",
  "Workflows":   "/images/tech-vault/workflows.png",
};

export function getSkillCategory(id: string): SkillCategory {
  const category = SKILL_CATEGORIES.find((c) => c.id === id);
  if (!category) {
    throw new Error(`getSkillCategory: no category with id "${id}"`);
  }
  return category;
}
