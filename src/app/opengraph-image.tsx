import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Created by Coach B";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0a0a0a 0%, #141414 50%, #0a0a0a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Gold accent glow */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <p
            style={{
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#c9a84c",
              margin: 0,
            }}
          >
            The Gallery
          </p>
          <h1
            style={{
              fontSize: 64,
              fontWeight: 200,
              color: "#f5f5f5",
              margin: 0,
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            Created by Coach B
          </h1>
          <p
            style={{
              fontSize: 20,
              fontWeight: 300,
              color: "#8a8a8a",
              margin: 0,
              marginTop: 8,
            }}
          >
            Builder. Designer. Founder. Author.
          </p>
          <p
            style={{
              fontSize: 14,
              color: "rgba(138,138,138,0.6)",
              margin: 0,
              marginTop: 24,
            }}
          >
            createdbycoachb.com
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}
