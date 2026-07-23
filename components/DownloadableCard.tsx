"use client";

import { useEffect, useRef, useState } from "react";
import { PlayerCard, type PlayerCardData } from "@/components/PlayerCard";
import { Button } from "@/components/ui";
import { Icon } from "@/components/Icon";

// Rend la carte joueur en PNG et propose le partage natif (TikTok/Instagram/Snap) —
// c'est le levier d'acquisition organique visé par le produit, la friction ici compte.
export function DownloadableCard({ data }: { data: PlayerCardData }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    // navigator.share existe sans garantir le partage de fichiers : on vérifie
    // juste la présence de l'API ici, le vrai test canShare({files}) se fait au clic
    // (il exige une instance de File, qu'on ne veut générer qu'à la demande).
    setCanNativeShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  async function renderPng(): Promise<Blob> {
    const svg = ref.current?.querySelector("svg");
    if (!svg) throw new Error("carte introuvable");
    const clone = svg.cloneNode(true) as SVGElement;
    clone.setAttribute("width", "680");
    clone.setAttribute("height", "960");
    // remplace les variables de police par des valeurs sûres pour la sérialisation
    const xml = new XMLSerializer()
      .serializeToString(clone)
      .replaceAll("var(--font-display), ", "")
      .replaceAll("var(--font-condensed), ", "");
    const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("échec du rendu de l'image"));
        img.src = url;
      });

      const canvas = document.createElement("canvas");
      canvas.width = 680;
      canvas.height = 960;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, 680, 960);

      return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("échec PNG"))), "image/png");
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function shareOrDownload() {
    setBusy(true);
    try {
      const blob = await renderPng();
      const file = new File([blob], `progressa-${data.firstName.toLowerCase()}.png`, { type: "image/png" });

      const shareData = { files: [file], title: "Ma carte Progressa", text: "Ma carte joueur sur Progressa ⚽" };
      if (navigator.share && navigator.canShare?.(shareData)) {
        try {
          await navigator.share(shareData);
          return;
        } catch (err) {
          if ((err as Error).name === "AbortError") return; // annulé par le joueur, pas une erreur
          // sinon on tombe sur le téléchargement classique ci-dessous
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = file.name;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div ref={ref}>
        <PlayerCard data={data} />
      </div>
      <Button variant="ghost" size="sm" className="mt-4 inline-flex items-center gap-2" onClick={shareOrDownload} disabled={busy}>
        {busy ? (
          "Préparation…"
        ) : (
          <>
            <Icon name={canNativeShare ? "share" : "download"} className="h-4 w-4" />
            {canNativeShare ? "Partager ma carte" : "Télécharger ma carte"}
          </>
        )}
      </Button>
    </div>
  );
}
