import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Progressa — Ton programme perso de préparateur";

// Image de partage social (lien collé dans une bio TikTok, un DM, etc.) — générée
// par code, cohérente avec l'identité "carton rouge" du produit.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0C0D0F",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            left: 260,
            width: 900,
            height: 700,
            background:
              "radial-gradient(ellipse at center, rgba(225,42,58,0.22), rgba(225,42,58,0.04) 45%, transparent 70%)",
            display: "flex",
          }}
        />
        <span
          style={{
            color: "#93938D",
            fontSize: 28,
            letterSpacing: 6,
            fontWeight: 700,
            marginBottom: 28,
          }}
        >
          PROGRESSA
        </span>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 74, fontWeight: 800, lineHeight: 1.05, color: "#EDE9E0" }}>
          <span>Ton programme perso</span>
          <span>
            de <span style={{ color: "#E12A3A" }}>préparateur</span>.
          </span>
        </div>
        <span style={{ color: "#93938D", fontSize: 28, marginTop: 36, maxWidth: 800 }}>
          Généré pour ton poste, ton âge, ton niveau. 13-17 ans.
        </span>
      </div>
    ),
    { ...size }
  );
}
