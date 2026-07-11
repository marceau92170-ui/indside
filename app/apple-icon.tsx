import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Icône iOS (écran d'accueil) — même identité que le favicon, en plus grand.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0C0D0F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ color: "#EDE9E0", fontSize: 108, fontWeight: 900 }}>P</span>
          <div style={{ width: 74, height: 14, background: "#E12A3A", borderRadius: 6, marginTop: -6 }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
