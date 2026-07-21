"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

// Partage du lien d'invitation : partage natif (mobile) + copie (fallback).
export function InviteShare({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const message = `Rejoins-moi sur Progressa 🔥 ton programme d'entraînement de foot perso, gratuit pour commencer : ${url}`;

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Progressa", text: message, url });
        return;
      } catch {
        // partage annulé → on ne fait rien
      }
    }
    copy();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // presse-papier indisponible
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 rounded-lg border border-line bg-night px-3 py-2.5">
        <span className="min-w-0 flex-1 truncate text-sm text-muted">{url}</span>
        <button
          type="button"
          onClick={copy}
          className="flex-none text-xs font-bold uppercase tracking-wide text-glow"
        >
          {copied ? "Copié ✓" : "Copier"}
        </button>
      </div>
      <Button onClick={share} size="lg" className="mt-3 w-full">
        Partager à mon équipe
      </Button>
    </div>
  );
}
