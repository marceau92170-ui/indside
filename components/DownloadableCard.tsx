"use client";

import { useRef, useState } from "react";
import { PlayerCard, type PlayerCardData } from "@/components/PlayerCard";
import { Button } from "@/components/ui";

// Rend la carte joueur et permet de la télécharger en PNG (partage TikTok/stories).
export function DownloadableCard({ data }: { data: PlayerCardData }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function download() {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    setBusy(true);
    try {
      const clone = svg.cloneNode(true) as SVGElement;
      clone.setAttribute("width", "680");
      clone.setAttribute("height", "960");
      // remplace les variables de police par des valeurs sûres pour la sérialisation
      const xml = new XMLSerializer()
        .serializeToString(clone)
        .replaceAll("var(--font-display), ", "")
        .replaceAll("var(--font-condensed), ", "");
      const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });

      const canvas = document.createElement("canvas");
      canvas.width = 680;
      canvas.height = 960;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, 680, 960);
      URL.revokeObjectURL(url);

      const a = document.createElement("a");
      a.download = `progressa-${data.firstName.toLowerCase()}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div ref={ref}>
        <PlayerCard data={data} />
      </div>
      <Button variant="ghost" size="sm" className="mt-4" onClick={download} disabled={busy}>
        {busy ? "Préparation…" : "⬇️ Télécharger ma carte"}
      </Button>
    </div>
  );
}
