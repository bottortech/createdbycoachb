import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { PredictionMeta } from "@/types/prediction";

const CONTENT_DIR = path.join(process.cwd(), "src/content/predictions");

/** True once a prediction's releaseDate (if any) has arrived. No date = always released. */
function isReleased(releaseDate: string | undefined): boolean {
  if (!releaseDate) return true;
  return new Date(releaseDate + "T00:00:00").getTime() <= Date.now();
}

/** Every prediction whose release date (if set) has arrived. This is the
 *  only lookup the app should use — an unreleased one is invisible here,
 *  which also makes generateStaticParams skip its URL and the [slug] page
 *  404 it if visited directly before release. */
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
        status: data.status ?? "watching",
        lastUpdated: data.lastUpdated ?? data.date ?? "",
        updates: data.updates ?? [],
        readingTime: data.readingTime ?? undefined,
        featured: data.featured ?? undefined,
        releaseDate: data.releaseDate ?? undefined,
      } satisfies PredictionMeta;
    })
    .filter((p) => isReleased(p.releaseDate))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** Used directly by the [slug] page — must re-check releaseDate itself
 *  (not just rely on getAllPredictionMeta upstream) since this reads the
 *  file straight off disk and is reachable via a guessed/shared URL even
 *  for a slug that was never in generateStaticParams. */
export function getPredictionRaw(slug: string): string | null {
  const filepath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filepath)) return null;
  const raw = fs.readFileSync(filepath, "utf-8");
  const { data } = matter(raw);
  if (!isReleased(data.releaseDate)) return null;
  return raw;
}
