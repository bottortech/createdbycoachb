import Link from "next/link";
import { getAllPredictionMeta } from "@/lib/predictions";
import Container from "@/components/Container";
import PredictionStatusBadge from "@/components/PredictionStatusBadge";

import type { Metadata } from "next";

// Re-checked hourly so a scheduled prediction's releaseDate crossing over
// actually reveals it without waiting on a redeploy.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "AI Predictions | Created by Coach B",
  description:
    "Future-focused essays, frameworks, and predictions about AI, creativity, business, technology, and society.",
  openGraph: {
    title: "AI Predictions | Created by Coach B",
    description:
      "Future-focused essays, frameworks, and predictions about AI, creativity, business, technology, and society.",
    url: "https://www.createdbycoachb.com/predictions",
    siteName: "Created by Coach B",
    type: "website",
    images: [
      {
        url: "/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "AI Predictions — Created by Coach B",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Predictions | Created by Coach B",
    description:
      "Future-focused essays, frameworks, and predictions about AI, creativity, business, technology, and society.",
    images: ["/images/og-default.png"],
  },
};

export default function PredictionsPage() {
  const predictions = getAllPredictionMeta();

  return (
    <div className="min-h-screen bg-gallery-black text-gallery-white" style={{ overflowY: "auto" }}>

      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.05) 0%, transparent 55%)",
          zIndex: 0,
        }}
      />

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-gallery-black/90 backdrop-blur-md">
        <Container className="py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-[10px] font-medium uppercase tracking-[0.3em] text-gallery-muted hover:text-gallery-accent transition-colors"
          >
            ← The Gallery
          </Link>
          <span
            style={{
              fontSize: "0.625rem",
              fontWeight: 600,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(201,168,76,0.5)",
            }}
          >
            AI Predictions Wing
          </span>
        </Container>
      </nav>

      {/* Page header */}
      <div className="relative z-10">
        <Container className="pt-20 pb-14">
          <p
            style={{
              fontSize: "0.625rem",
              fontWeight: 600,
              letterSpacing: "0.48em",
              textTransform: "uppercase",
              color: "var(--color-gallery-accent)",
              marginBottom: "1.5rem",
            }}
          >
            Exhibit Wing
          </p>
          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 300,
              color: "var(--color-gallery-white)",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              marginBottom: "1.25rem",
            }}
          >
            AI Predictions
          </h1>
          <p
            style={{
              fontSize: "1.0625rem",
              lineHeight: 1.75,
              color: "rgba(138,138,138,0.9)",
              maxWidth: "560px",
            }}
          >
            Future-focused essays, frameworks, and predictions about AI, creativity,
            business, technology, and society. Each entry is a documented view of
            where things are heading — and why.
          </p>
          <div
            style={{
              marginTop: "3rem",
              height: "1px",
              background:
                "linear-gradient(90deg, rgba(201,168,76,0.25) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
            }}
          />
        </Container>
      </div>

      {/* List */}
      <div className="relative z-10">
        <Container className="pb-32">
          {predictions.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "rgba(138,138,138,0.7)" }}>
              No predictions yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "820px" }}>
              {predictions.map((p) => (
                <Link
                  key={p.slug}
                  href={`/predictions/${p.slug}`}
                  className="group block"
                  style={{
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "16px",
                    padding: "2.25rem 2.5rem",
                    background: "rgba(20,20,20,0.6)",
                    textDecoration: "none",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                >
                  {/* Top row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "1rem",
                      flexWrap: "wrap",
                      marginBottom: "1.125rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "0.625rem",
                          fontWeight: 600,
                          letterSpacing: "0.35em",
                          textTransform: "uppercase",
                          color: "var(--color-gallery-accent)",
                        }}
                      >
                        AI Prediction {p.number}
                      </span>
                      <PredictionStatusBadge status={p.status} />
                      {p.featured && (
                        <span
                          style={{
                            fontSize: "0.5625rem",
                            fontWeight: 600,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: "rgba(201,168,76,0.6)",
                            background: "rgba(201,168,76,0.08)",
                            border: "1px solid rgba(201,168,76,0.15)",
                            borderRadius: "9999px",
                            padding: "0.2rem 0.6rem",
                          }}
                        >
                          Featured
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                      {p.readingTime && (
                        <span style={{ fontSize: "0.6875rem", color: "rgba(138,138,138,0.6)" }}>
                          {p.readingTime} min read
                        </span>
                      )}
                      <span style={{ fontSize: "0.6875rem", color: "rgba(138,138,138,0.6)" }}>
                        Published{" "}
                        {new Date(p.date + "T12:00:00").toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {p.lastUpdated && p.lastUpdated !== p.date && (
                        <span style={{ fontSize: "0.6875rem", color: "rgba(138,138,138,0.6)" }}>
                          · Updated{" "}
                          {new Date(p.lastUpdated + "T12:00:00").toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h2
                    className="group-hover:text-gallery-accent transition-colors"
                    style={{
                      fontSize: "1.375rem",
                      fontWeight: 300,
                      color: "var(--color-gallery-white)",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.3,
                      marginBottom: "0.875rem",
                    }}
                  >
                    {p.title}
                  </h2>

                  {/* Summary */}
                  <p
                    style={{
                      fontSize: "0.9375rem",
                      lineHeight: 1.75,
                      color: "rgba(138,138,138,0.85)",
                      marginBottom: "1.375rem",
                    }}
                  >
                    {p.summary}
                  </p>

                  {/* Tags + read CTA */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            borderRadius: "9999px",
                            background: "rgba(201,168,76,0.08)",
                            border: "1px solid rgba(201,168,76,0.16)",
                            padding: "0.2rem 0.75rem",
                            fontSize: "0.625rem",
                            fontWeight: 500,
                            color: "var(--color-gallery-accent)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span
                      className="group-hover:opacity-100 transition-opacity"
                      style={{ fontSize: "0.6875rem", fontWeight: 500, color: "var(--color-gallery-accent)", letterSpacing: "0.06em", opacity: 0 }}
                    >
                      Read →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Coming soon */}
          <div
            style={{
              marginTop: "1.5rem",
              border: "1px solid rgba(255,255,255,0.04)",
              borderRadius: "14px",
              padding: "2rem",
              textAlign: "center",
              maxWidth: "820px",
            }}
          >
            <p style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(138,138,138,0.5)", marginBottom: "0.5rem" }}>
              More Coming
            </p>
            <p style={{ fontSize: "0.8125rem", color: "rgba(138,138,138,0.45)" }}>
              {(() => {
                const nums = predictions.map((p) => parseInt(p.number.replace(/\D/g, ""), 10)).filter((n) => !isNaN(n));
                const next = Math.max(...nums) + 1;
                return `AI Prediction #${String(next).padStart(3, "0")} and beyond are in progress.`;
              })()}
            </p>
          </div>
        </Container>
      </div>
    </div>
  );
}
