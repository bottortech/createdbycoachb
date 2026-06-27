import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { PredictionMeta } from "@/types/prediction";

const CONTENT_DIR = path.join(process.cwd(), "src/content/predictions");

export function getAllPredictionMeta(): PredictionMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
  return files
    .map((filename) => {
      const slug = filename.replace(".mdx", "");
      const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), "utf-8");
      const { data } = matter(raw);
      return {
        slug,
        id: data.id ?? slug,
        number: data.number ?? "",
        title: data.title ?? "",
        date: data.date ?? "",
        summary: data.summary ?? "",
        category: data.category ?? "",
        tags: data.tags ?? [],
        coreIdea: data.coreIdea ?? "",
        framework: data.framework ?? [],
        examples: data.examples ?? [],
      } satisfies PredictionMeta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPredictionRaw(slug: string): string | null {
  const filepath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filepath)) return null;
  return fs.readFileSync(filepath, "utf-8");
}
