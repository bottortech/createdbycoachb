import { ImageResponse } from "next/og";
import { getAllPredictionMeta } from "@/lib/predictions";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PredictionOGImage({ params }: Props) {
  const { slug } = await params;
  const prediction = getAllPredictionMeta().find((p) => p.slug === slug);

  const title = prediction?.title ?? "AI Predictions";
  const number = prediction?.number ?? "";
  const summary = prediction
    ? prediction.summary.length > 130
      ? prediction.summary.slice(0, 130) + "…"
      : prediction.summary
    : "Future-focused essays, frameworks, and predictions from Created by Coach B.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#08080c",
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px 64px",
          position: "relative",
        }}
      >
        {/* Top gold accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, transparent 0%, #c9a84c 30%, #c9a84c 70%, transparent 100%)",
            opacity: 0.6,
            display: "flex",
          }}
        />

        {/* Kicker label */}
        <div
          style={{
            color: "#c9a84c",
            fontSize: "13px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginBottom: "28px",
            display: "flex",
            opacity: 0.9,
          }}
        >
          {number ? `AI PREDICTION · ${number}` : "AI PREDICTIONS"}
        </div>

        {/* Title */}
        <div
          style={{
            color: "#f0f0ee",
            fontSize: title.length > 65 ? "40px" : "52px",
            fontWeight: 300,
            lineHeight: 1.2,
            marginBottom: "28px",
            display: "flex",
            flexWrap: "wrap",
            maxWidth: "920px",
          }}
        >
          {title}
        </div>

        {/* Summary */}
        <div
          style={{
            color: "#8a8a8a",
            fontSize: "19px",
            lineHeight: 1.55,
            maxWidth: "840px",
            display: "flex",
            marginBottom: "48px",
          }}
        >
          {summary}
        </div>

        {/* Bottom divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "20px",
            borderTop: "1px solid rgba(201,168,76,0.18)",
          }}
        >
          <div
            style={{
              color: "#c9a84c",
              fontSize: "13px",
              letterSpacing: "0.28em",
              display: "flex",
              opacity: 0.85,
            }}
          >
            CREATED BY COACH B
          </div>
          <div
            style={{
              color: "rgba(138,138,138,0.5)",
              fontSize: "12px",
              letterSpacing: "0.06em",
              display: "flex",
            }}
          >
            createdbycoachb.com
          </div>
        </div>

        {/* Bottom gold accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.35) 30%, rgba(201,168,76,0.35) 70%, transparent 100%)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
