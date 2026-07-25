"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { Icon } from "@/components/Icon";

// « Partage en story = +3 jours », réclamable UNE seule fois par compte.
// On propose d'abord le partage natif (le vrai geste), puis la réclamation.
export function StoryShareReward({
  shareUrl,
  days,
  alreadyClaimed,
}: {
  shareUrl: string;
  days: number;
  alreadyClaimed: boolean;
}) {
  const router = useRouter();
  const [claimed, setClaimed] = useState(alreadyClaimed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const message = `Je progresse au foot avec Progressa 🔥 programme perso gratuit pour commencer. Tag @progressafoot : ${shareUrl}`;

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Progressa", text: message, url: shareUrl });
      } catch {
        // partage annulé → on ne bloque pas la suite
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${message}`);
      } catch {
        /* presse-papier indisponible */
      }
    }
  }

  async function claim() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rewards/story-share", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "erreur");
      setClaimed(true);
      router.refresh(); // met à jour l'affichage du Premium offert
    } catch {
      setError("Réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  if (claimed) {
    return (
      <div className="flex items-center gap-2 text-sm text-glow">
        <Icon name="check" className="h-4 w-4" />
        <span className="font-semibold">Récompense réclamée · +{days} jours de Premium ajoutés.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <Button onClick={share} variant="ghost" size="sm" className="w-full">
        Partager en story
      </Button>
      <Button onClick={claim} size="sm" className="w-full" disabled={loading}>
        {loading ? "…" : `J'ai partagé — réclamer +${days} jours`}
      </Button>
      {error && <p className="text-xs text-glow">{error}</p>}
      <p className="text-[11px] text-muted">
        Une seule fois par compte. Pense à tagguer @progressafoot pour qu&apos;on te repère.
      </p>
    </div>
  );
}
