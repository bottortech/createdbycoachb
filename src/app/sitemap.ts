import type { MetadataRoute } from "next";
import { getAllPredictionMeta } from "@/lib/predictions";

const BASE = "https://createdbycoachb.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const predictions = getAllPredictionMeta();

  const predictionPages: MetadataRoute.Sitemap = predictions.map((p) => ({
    url: `${BASE}/predictions/${p.slug}`,
    lastModified: new Date(p.date + "T12:00:00"),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE}/standard`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/predictions`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...predictionPages,
  ];
}
