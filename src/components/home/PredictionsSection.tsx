"use client";

import Link from "next/link";
import { useIsClient } from "./useIsClient";
import Container from "@/components/Container";
import PredictionStatusBadge from "@/components/PredictionStatusBadge";
import type { PredictionMeta } from "@/types/prediction";
import { PREDICTIONS } from "@/data/predictions";
import { ArrowRightIcon } from "./icons";

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/** The earliest prediction with a release date still in the future, if one
 *  has actually been scheduled in src/data/predictions.ts. Nothing is inferred
 *  from a cadence; with no scheduled entry this returns null. */
function nextScheduledRelease(): string | null {
  const now = Date.now();
  const upcoming = PREDICTIONS.map((p) => p.releaseDate)
    .filter((d): d is string => !!d && new Date(d + "T00:00:00").getTime() > now)
    .sort();
  return upcoming[0] ?? null;
}

export default function PredictionsSection({ published }: { published: PredictionMeta[] }) {
  // Time-dependent, so only computed after mount (server and first client
  // render must match). Shown only when a release is actually scheduled.
  const isClient = useIsClient();
  const scheduled = isClient ? nextScheduledRelease() : null;

  return (
    <section
      id="ai-predictions"
      aria-labelledby="predictions-title"
      className="scroll-mt-20 border-t border-white/[0.06] bg-gallery-charcoal/40 py-20 sm:py-28"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          {/* Intro column — stays in view while the list scrolls on desktop */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-gallery-accent">
              <span className="h-px w-8 bg-gallery-accent/60" aria-hidden />
              AI Predictions Wing
            </p>
            <h2
              id="predictions-title"
              className="text-3xl font-light leading-[1.1] tracking-tight text-gallery-white sm:text-4xl lg:text-5xl"
            >
              AI Predictions
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-gallery-light/75 sm:text-[17px]">
              Future-focused essays, frameworks, and predictions about AI, creativity, business, technology, and
              society. Each entry is a documented view of where things are heading — and why.
            </p>

            {scheduled && (
              <p className="mt-8 inline-flex items-center gap-3 rounded-full border border-gallery-accent/25 bg-gallery-accent/[0.06] px-4 py-2 text-[14px] text-gallery-light/85">
                <span className="h-1.5 w-1.5 rounded-full bg-gallery-accent" aria-hidden />
                Next prediction scheduled for {formatDate(scheduled)}
              </p>
            )}

            <div>
              <Link
                href="/predictions"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-gallery-accent/45 px-5 py-2.5 text-[14px] font-medium text-gallery-accent transition-colors hover:bg-gallery-accent hover:text-gallery-black"
              >
                View all AI Predictions <ArrowRightIcon />
              </Link>
            </div>
          </div>

          <ol className="space-y-4">
            {published.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/predictions/${p.slug}`}
                  className="group flex gap-5 rounded-2xl border border-white/[0.07] bg-gallery-black/60 p-5 transition-colors hover:border-gallery-accent/40 sm:gap-6 sm:p-7"
                >
                  <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl border sm:flex border-gallery-accent/35 bg-gallery-accent/10 text-[13px] font-semibold tracking-wide text-gallery-accent">
                    {p.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="rounded-md border border-gallery-accent/35 bg-gallery-accent/10 px-2 py-0.5 text-[12px] font-semibold text-gallery-accent sm:hidden">
                        {p.number}
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gallery-accent">
                        {p.category}
                      </span>
                      <PredictionStatusBadge status={p.status} size="md" />
                    </span>
                    <span className="mt-2 block text-xl font-light leading-snug text-gallery-white transition-colors group-hover:text-gallery-accent">
                      {p.title}
                    </span>
                    <span className="mt-2 block text-[15px] leading-relaxed text-gallery-light/70">{p.coreIdea}</span>
                    <span className="mt-4 flex flex-wrap gap-1.5">
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[12px] text-gallery-light/75"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                    <span className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[13px] text-gallery-muted">
                      <span>
                        Published {formatDate(p.date)}
                        {p.lastUpdated && p.lastUpdated !== p.date && <> · Updated {formatDate(p.lastUpdated)}</>}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-medium text-gallery-accent">
                        Read prediction <ArrowRightIcon />
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
