import { notFound } from "next/navigation";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import { getAllPredictionMeta, getPredictionRaw } from "@/lib/predictions";
import Container from "@/components/Container";
import ShareButtons from "@/components/ShareButtons";
import PredictionStatusBadge from "@/components/PredictionStatusBadge";
import PredictionTimeline from "@/components/PredictionTimeline";
import type { PredictionMeta } from "@/types/prediction";

interface Props {
  params: Promise<{ slug: string }>;
}

// Re-checked hourly — see predictions/page.tsx. Also lets a slug that was
// unreleased at build time (so absent from generateStaticParams below)
// start resolving once its releaseDate passes, instead of 404ing forever.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return getAllPredictionMeta().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const predictions = getAllPredictionMeta();
  const prediction = predictions.find((p) => p.slug === slug);
  if (!prediction) return {};

  const title = `AI Prediction ${prediction.number}: ${prediction.title} | Created by Coach B`;
  const description = prediction.summary;
  const url = `https://createdbycoachb.com/predictions/${slug}`;
  const ogImage = {
    url: `/images/og-default.png`,
    width: 1200,
    height: 630,
    alt: prediction.title,
  };

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Created by Coach B",
      type: "article",
      publishedTime: prediction.date ? new Date(prediction.date + "T12:00:00").toISOString() : undefined,
      tags: prediction.tags,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}

/* ------------------------------------------------------------------
   MDX components — premium editorial typography
   Body: 18px / 1.9 leading. Headings breathe. Lists are clean.
------------------------------------------------------------------ */
const prose: Record<string, React.CSSProperties> = {
  p: {
    fontSize: "1.125rem",
    lineHeight: 1.88,
    color: "rgba(232,232,232,0.8)",
    marginBottom: "1.875rem",
  },
  h2: {
    fontSize: "1.6875rem",
    fontWeight: 300,
    color: "var(--color-gallery-white)",
    marginTop: "4rem",
    marginBottom: "1.25rem",
    paddingBottom: "0.875rem",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    letterSpacing: "-0.015em",
    lineHeight: 1.3,
  },
  h3: {
    fontSize: "1.0625rem",
    fontWeight: 500,
    color: "var(--color-gallery-accent)",
    marginTop: "2.5rem",
    marginBottom: "0.625rem",
    letterSpacing: "0.02em",
  },
  strong: {
    color: "var(--color-gallery-white)",
    fontWeight: 500,
  },
  em: {
    color: "var(--color-gallery-light)",
    fontStyle: "italic",
  },
  blockquote: {
    borderLeft: "2px solid rgba(201,168,76,0.5)",
    paddingLeft: "1.75rem",
    margin: "2.5rem 0",
    fontStyle: "italic",
    color: "var(--color-gallery-light)",
    fontSize: "1.1875rem",
    lineHeight: 1.75,
  },
};

const mdxComponents = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 style={prose.h2} {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 style={prose.h3} {...props} />,
  p:  (props: React.HTMLAttributes<HTMLParagraphElement>) => <p style={prose.p} {...props} />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong style={prose.strong} {...props} />,
  em: (props: React.HTMLAttributes<HTMLElement>) => <em style={prose.em} {...props} />,
  blockquote: (props: React.HTMLAttributes<HTMLElement>) => <blockquote style={prose.blockquote} {...props} />,
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      style={{
        listStyle: "none",
        margin: "0 0 1.875rem 0",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
      {...props}
    />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li style={{ display: "flex", gap: "0.875rem", fontSize: "1.125rem", lineHeight: 1.75, color: "rgba(232,232,232,0.75)" }}>
      <span style={{ color: "rgba(201,168,76,0.45)", flexShrink: 0, marginTop: "0.1em" }}>—</span>
      <span {...props} />
    </li>
  ),
  hr: () => (
    <div
      style={{
        margin: "4rem 0",
        height: "1px",
        background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.25) 25%, rgba(201,168,76,0.25) 75%, transparent 100%)",
      }}
    />
  ),
};

export default async function PredictionArticlePage({ params }: Props) {
  const { slug } = await params;
  const raw = getPredictionRaw(slug);
  if (!raw) notFound();

  const { content, frontmatter } = await compileMDX<PredictionMeta>({
    source: raw,
    options: { parseFrontmatter: true },
    components: mdxComponents,
  });

  const formattedDate = new Date(frontmatter.date + "T12:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gallery-black text-gallery-white" style={{ overflowY: "auto" }}>

      {/* Ambient glow — fixed so it stays during scroll */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.04) 0%, transparent 55%)",
          zIndex: 0,
        }}
      />

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-gallery-black/90 backdrop-blur-md">
        <Container className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/predictions"
              className="text-[10px] font-medium uppercase tracking-[0.3em] text-gallery-muted hover:text-gallery-accent transition-colors"
            >
              ← AI Predictions
            </Link>
            <span className="hidden sm:inline text-white/10 text-xs select-none">|</span>
            <span className="hidden sm:inline text-[10px] font-medium uppercase tracking-[0.3em] text-gallery-muted/40">
              {frontmatter.number}
            </span>
          </div>
          <Link
            href="/"
            className="text-[10px] font-medium uppercase tracking-[0.25em] text-gallery-muted hover:text-gallery-accent transition-colors"
          >
            The Gallery
          </Link>
        </Container>
      </nav>

      {/* ── Reading column ── */}
      <div className="relative z-10">
        <Container>
          {/*
            Reading column: max-w-[720px] centered within the Container.
            Container provides the generous outer margins at each breakpoint.
            This keeps the text comfortably away from edges on all screen sizes.
          */}
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>

            {/* ── Article header ── */}
            <header style={{ paddingTop: "6rem", paddingBottom: "4rem" }}>

              {/* Kicker */}
              <p
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  letterSpacing: "0.48em",
                  textTransform: "uppercase",
                  color: "var(--color-gallery-accent)",
                  marginBottom: "1.5rem",
                }}
              >
                AI Prediction {frontmatter.number}
              </p>

              {/* Title */}
              <h1
                style={{
                  fontSize: "clamp(2.125rem, 5vw, 3rem)",
                  fontWeight: 300,
                  color: "var(--color-gallery-white)",
                  lineHeight: 1.18,
                  letterSpacing: "-0.025em",
                  marginBottom: "2.5rem",
                }}
              >
                {frontmatter.title}
              </h1>

              {/* Core idea callout */}
              <div
                style={{
                  padding: "1.875rem 2rem",
                  borderRadius: "14px",
                  border: "1px solid rgba(201,168,76,0.2)",
                  background: "rgba(201,168,76,0.055)",
                  marginBottom: "2.5rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.5625rem",
                    fontWeight: 700,
                    letterSpacing: "0.42em",
                    textTransform: "uppercase",
                    color: "var(--color-gallery-accent)",
                    marginBottom: "1rem",
                  }}
                >
                  The Prediction
                </p>
                <p
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 300,
                    lineHeight: 1.6,
                    color: "var(--color-gallery-white)",
                    margin: 0,
                  }}
                >
                  {frontmatter.coreIdea}
                </p>
              </div>

              {/* Status */}
              <div style={{ marginBottom: "1.25rem" }}>
                <PredictionStatusBadge status={frontmatter.status} size="md" />
              </div>

              {/* Meta row */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "0.5rem 1.5rem",
                }}
              >
                <span style={{ fontSize: "0.8125rem", color: "rgba(138,138,138,0.85)" }}>
                  Published {formattedDate}
                </span>
                {frontmatter.lastUpdated && frontmatter.lastUpdated !== frontmatter.date && (
                  <>
                    <span style={{ color: "rgba(255,255,255,0.08)" }}>·</span>
                    <span style={{ fontSize: "0.8125rem", color: "rgba(138,138,138,0.85)" }}>
                      Updated{" "}
                      {new Date(frontmatter.lastUpdated + "T12:00:00").toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </>
                )}
                <span style={{ color: "rgba(255,255,255,0.08)" }}>·</span>
                <span style={{ fontSize: "0.8125rem", color: "rgba(138,138,138,0.85)" }}>
                  {frontmatter.category}
                </span>
                {frontmatter.readingTime && (
                  <>
                    <span style={{ color: "rgba(255,255,255,0.08)" }}>·</span>
                    <span style={{ fontSize: "0.8125rem", color: "rgba(138,138,138,0.85)" }}>
                      {frontmatter.readingTime} min read
                    </span>
                  </>
                )}
              </div>

              {/* Tags */}
              {frontmatter.tags?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1.25rem" }}>
                  {frontmatter.tags.map((tag: string) => (
                    <span
                      key={tag}
                      style={{
                        borderRadius: "9999px",
                        background: "rgba(201,168,76,0.08)",
                        border: "1px solid rgba(201,168,76,0.18)",
                        padding: "0.3rem 1rem",
                        fontSize: "0.6875rem",
                        fontWeight: 500,
                        color: "var(--color-gallery-accent)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Section divider */}
              <div
                style={{
                  marginTop: "3.5rem",
                  height: "1px",
                  background: "linear-gradient(90deg, rgba(201,168,76,0.35) 0%, rgba(255,255,255,0.06) 55%, transparent 100%)",
                }}
              />
            </header>

            {/* ── Article body ── */}
            <article style={{ paddingBottom: "2rem" }}>
              {content}
            </article>

            {/* ── Evidence & Updates timeline ── */}
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: "2.5rem",
              }}
            >
              <PredictionTimeline updates={frontmatter.updates ?? []} />
            </div>

            {/* ── Share row ── */}
            <div
              style={{
                paddingBottom: "3rem",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: "2rem",
              }}
            >
              <ShareButtons
                url={`https://createdbycoachb.com/predictions/${slug}`}
                title={`AI Prediction ${frontmatter.number}: ${frontmatter.title} — Created by Coach B`}
              />
            </div>

            {/* ── Footer CTA ── */}
            <footer
              style={{
                paddingTop: "3rem",
                paddingBottom: "6rem",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  padding: "2rem 2.25rem",
                  borderRadius: "16px",
                  border: "1px solid rgba(201,168,76,0.14)",
                  background: "rgba(201,168,76,0.04)",
                }}
              >
                <p
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    letterSpacing: "0.35em",
                    textTransform: "uppercase",
                    color: "var(--color-gallery-accent)",
                    marginBottom: "0.625rem",
                  }}
                >
                  Continue Exploring
                </p>
                <p
                  style={{
                    fontSize: "0.875rem",
                    lineHeight: 1.65,
                    color: "rgba(138,138,138,0.85)",
                    marginBottom: "1.25rem",
                  }}
                >
                  This prediction lives inside an immersive 3D gallery. Walk through the AI
                  Predictions Wing and explore more work.
                </p>
                <div style={{ display: "flex", gap: "1.75rem", flexWrap: "wrap" }}>
                  <Link
                    href="/predictions"
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      color: "var(--color-gallery-accent)",
                      textDecoration: "none",
                      letterSpacing: "0.04em",
                    }}
                  >
                    ← All Predictions
                  </Link>
                  <Link
                    href="/"
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      color: "var(--color-gallery-accent)",
                      textDecoration: "none",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Enter the 3D Gallery →
                  </Link>
                </div>
              </div>
            </footer>

          </div>
        </Container>
      </div>
    </div>
  );
}
