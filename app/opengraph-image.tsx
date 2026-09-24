import { ImageResponse } from "next/og";

// Rendered on the edge rather than prerendered at build time. next/og's
// build-time path resolution is broken on Windows, so a local `next build`
// fails on this route otherwise.
export const runtime = "edge";

export const alt = "Bjorn Lindqvist — Full Stack Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #000319 0%, #0c0e23 60%, #1b1350 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#BEC1DD",
          }}
        >
          Bjorn Lindqvist
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 82,
            fontWeight: 700,
            lineHeight: 1.1,
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          Full Stack Engineer,&nbsp;<span style={{ color: "#CBACF9" }}>interface to database</span>
        </div>

        <div style={{ marginTop: 36, fontSize: 30, color: "#C1C2D3" }}>
          Web development · UI/UX · Databases · Automation · Applied AI
        </div>

        <div
          style={{
            marginTop: 48,
            height: 8,
            width: 200,
            borderRadius: 4,
            background: "#CBACF9",
          }}
        />
      </div>
    ),
    size
  );
}
