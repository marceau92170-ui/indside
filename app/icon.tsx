import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Favicon généré par code (aucun outil de génération d'image nécessaire) :
// fond asphalte, "P" en Archivo Black, accent rouge carton en soulignement.
export default function Icon() {
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
          borderRadius: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#EDE9E0", fontSize: 38, fontWeight: 900 }}>P</span>
          <div style={{ width: 26, height: 5, background: "#E12A3A", borderRadius: 2, marginTop: -2 }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
