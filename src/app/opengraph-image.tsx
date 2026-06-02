import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Created by Coach B — The Gallery";
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
          background: "#07060a",
          overflow: "hidden",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Floor gradient */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 220, background: "linear-gradient(to top, #0d0b08 0%, transparent 100%)", display: "flex" }} />

        {/* Ceiling gradient */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, background: "linear-gradient(to bottom, #050403 0%, transparent 100%)", display: "flex" }} />

        {/* Gallery wall — left */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 200, background: "linear-gradient(to right, #0c0a08 0%, transparent 100%)", display: "flex" }} />

        {/* Gallery wall — right */}
        <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 200, background: "linear-gradient(to left, #0c0a08 0%, transparent 100%)", display: "flex" }} />

        {/* Perspective corridor lines */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Left wall perspective line */}
          <div style={{ position: "absolute", top: 90, left: 80, width: 420, height: 1, background: "linear-gradient(to right, rgba(201,168,76,0.25), rgba(201,168,76,0.05))", transform: "rotate(8deg)", display: "flex" }} />
          <div style={{ position: "absolute", bottom: 110, left: 80, width: 420, height: 1, background: "linear-gradient(to right, rgba(201,168,76,0.25), rgba(201,168,76,0.05))", transform: "rotate(-8deg)", display: "flex" }} />
          {/* Right wall perspective line */}
          <div style={{ position: "absolute", top: 90, right: 80, width: 420, height: 1, background: "linear-gradient(to left, rgba(201,168,76,0.25), rgba(201,168,76,0.05))", transform: "rotate(-8deg)", display: "flex" }} />
          <div style={{ position: "absolute", bottom: 110, right: 80, width: 420, height: 1, background: "linear-gradient(to left, rgba(201,168,76,0.25), rgba(201,168,76,0.05))", transform: "rotate(8deg)", display: "flex" }} />
        </div>

        {/* Left artwork frame */}
        <div style={{ position: "absolute", left: 52, top: 140, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 120, height: 155, border: "3px solid #c9a84c", background: "linear-gradient(135deg, #1a1408 0%, #0d0c0a 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(201,168,76,0.15), inset 0 0 20px rgba(0,0,0,0.5)" }}>
            <div style={{ width: 90, height: 115, background: "linear-gradient(135deg, #1c2a1a 0%, #0e1a0c 100%)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.7 }}>
              <div style={{ fontSize: 36, color: "rgba(201,168,76,0.3)", display: "flex" }}>W</div>
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 9, color: "rgba(201,168,76,0.5)", letterSpacing: "0.3em", display: "flex" }}>WIGGLEWOO</div>
        </div>

        {/* Right artwork frame */}
        <div style={{ position: "absolute", right: 52, top: 155, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 110, height: 135, border: "3px solid #c9a84c", background: "linear-gradient(135deg, #1a1408 0%, #0d0c0a 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(201,168,76,0.12), inset 0 0 20px rgba(0,0,0,0.5)" }}>
            <div style={{ width: 84, height: 105, background: "linear-gradient(135deg, #1a0e1a 0%, #100c18 100%)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.7 }}>
              <div style={{ fontSize: 32, color: "rgba(201,168,76,0.3)", display: "flex" }}>R</div>
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 9, color: "rgba(201,168,76,0.5)", letterSpacing: "0.3em", display: "flex" }}>RETRORACK</div>
        </div>

        {/* Spotlight cone — left */}
        <div style={{ position: "absolute", top: 0, left: 112, width: 0, height: 0, borderLeft: "45px solid transparent", borderRight: "45px solid transparent", borderTop: "160px solid rgba(255,240,200,0.04)", display: "flex" }} />

        {/* Spotlight cone — right */}
        <div style={{ position: "absolute", top: 0, right: 112, width: 0, height: 0, borderLeft: "45px solid transparent", borderRight: "45px solid transparent", borderTop: "150px solid rgba(255,240,200,0.04)", display: "flex" }} />

        {/* Spotlight cone — center */}
        <div style={{ position: "absolute", top: 0, left: "50%", width: 0, height: 0, borderLeft: "90px solid transparent", borderRight: "90px solid transparent", borderTop: "220px solid rgba(255,240,200,0.05)", marginLeft: -90, display: "flex" }} />

        {/* Central gold glow */}
        <div style={{ position: "absolute", top: "50%", left: "50%", width: 560, height: 320, background: "radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)", transform: "translate(-50%, -50%)", display: "flex" }} />

        {/* Center content */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0 }}>
          {/* Top label */}
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.55em", textTransform: "uppercase", color: "rgba(201,168,76,0.75)", marginBottom: 18, display: "flex" }}>
            The Gallery
          </div>

          {/* Divider top */}
          <div style={{ width: 340, height: 1, background: "linear-gradient(to right, transparent, rgba(201,168,76,0.45), transparent)", marginBottom: 22, display: "flex" }} />

          {/* Main title */}
          <div style={{ fontSize: 68, fontWeight: 200, color: "#f0ede8", lineHeight: 1.05, textAlign: "center", letterSpacing: "-0.01em", display: "flex" }}>
            Created by{" "}
            <span style={{ color: "#c9a84c", marginLeft: 16, display: "flex" }}>Coach B</span>
          </div>

          {/* Subtitle */}
          <div style={{ marginTop: 20, fontSize: 17, fontWeight: 300, color: "rgba(200,196,188,0.55)", letterSpacing: "0.06em", display: "flex" }}>
            Builder · Designer · Founder · Author
          </div>

          {/* Divider bottom */}
          <div style={{ width: 280, height: 1, background: "linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent)", marginTop: 24, marginBottom: 18, display: "flex" }} />

          {/* URL */}
          <div style={{ fontSize: 12, color: "rgba(201,168,76,0.4)", letterSpacing: "0.28em", display: "flex" }}>
            CREATEDBYCOACHB.COM
          </div>
        </div>

        {/* Floor line */}
        <div style={{ position: "absolute", bottom: 80, left: 140, right: 140, height: 1, background: "linear-gradient(to right, transparent, rgba(201,168,76,0.12), transparent)", display: "flex" }} />
      </div>
    ),
    { ...size }
  );
}
