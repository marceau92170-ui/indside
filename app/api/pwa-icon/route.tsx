import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const dynamic = "force-static";

// Icônes PWA (192×192, 512×512) référencées par le manifest — générées par code,
// même identité que le favicon/apple-icon, mais tailles imposées par la spec manifest.
export async function GET(req: NextRequest) {
  const size = Number(req.nextUrl.searchParams.get("size")) || 512;
  const nameSize = Math.round(size * 0.6);
  const barW = Math.round(size * 0.42);
  const barH = Math.round(size * 0.08);

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
          <span style={{ color: "#EDE9E0", fontSize: nameSize, fontWeight: 900 }}>P</span>
          <div
            style={{
              width: barW,
              height: barH,
              background: "#E12A3A",
              borderRadius: barH / 2,
              marginTop: -Math.round(size * 0.03),
            }}
          />
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
