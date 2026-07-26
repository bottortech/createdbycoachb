import PredictionStatusBadge from "./PredictionStatusBadge";
import type { PredictionUpdate } from "@/types/prediction";

interface PredictionTimelineProps {
  updates: PredictionUpdate[];
}

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** "Evidence & Updates" — the living-archive timeline shown beneath the
 *  full article. Each entry records why a prediction's status changed;
 *  an empty timeline means it's published but hasn't moved yet. */
export default function PredictionTimeline({ updates }: PredictionTimelineProps) {
  const sorted = [...updates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div style={{ paddingTop: "1rem", paddingBottom: "3rem" }}>
      <p
        style={{
          fontSize: "0.625rem",
          fontWeight: 700,
          letterSpacing: "0.42em",
          textTransform: "uppercase",
          color: "var(--color-gallery-accent)",
          marginBottom: "1.75rem",
        }}
      >
        Evidence &amp; Updates
      </p>

      {sorted.length === 0 ? (
        <div
          style={{
            padding: "1.5rem 1.75rem",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.015)",
          }}
        >
          <p style={{ fontSize: "0.875rem", color: "rgba(138,138,138,0.85)", margin: 0 }}>
            No updates yet. This prediction is currently being monitored.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {sorted.map((update, i) => (
            <div
              key={`${update.date}-${i}`}
              style={{
                padding: "1.75rem",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", marginBottom: "0.875rem" }}>
                <span style={{ fontSize: "0.75rem", color: "rgba(138,138,138,0.75)" }}>
                  {formatDate(update.date)}
                </span>
                <span style={{ color: "rgba(255,255,255,0.08)" }}>·</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <PredictionStatusBadge status={update.previousStatus} size="sm" />
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(138,138,138,0.5)" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <PredictionStatusBadge status={update.newStatus} size="sm" />
                </div>
              </div>

              <h3 style={{ fontSize: "1.0625rem", fontWeight: 400, color: "var(--color-gallery-white)", marginBottom: "0.5rem" }}>
                {update.title}
              </h3>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "rgba(138,138,138,0.9)", margin: 0 }}>
                {update.summary}
              </p>

              {update.sourceUrl && (
                <a
                  href={update.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    marginTop: "0.875rem",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "var(--color-gallery-accent)",
                    textDecoration: "none",
                  }}
                >
                  View source
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4.5M14 4h6v6M20 4L10 14" />
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
