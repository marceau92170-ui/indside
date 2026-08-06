"use client";

import { useState } from "react";
import { Card } from "@/components/ui";

const ACQUISITION_OPTIONS = [
  "TikTok",
  "Instagram",
  "YouTube",
  "Un ami / bouche-à-oreille",
  "Mon club",
  "Autre",
];

const PREMIUM_OBJECTION_OPTIONS = [
  "Trop cher",
  "Je n'en ai pas besoin",
  "Je n'avais pas vu l'offre",
  "Je n'ai pas confiance",
  "Autre raison",
];

type Kind = "acquisition" | "premium_objection";

const COPY: Record<Kind, { title: string; options: string[] }> = {
  acquisition: { title: "Comment as-tu connu Progressa ?", options: ACQUISITION_OPTIONS },
  premium_objection: {
    title: "Pourquoi Premium ne t'intéresse pas (pour l'instant) ?",
    options: PREMIUM_OBJECTION_OPTIONS,
  },
};

// Micro-sondage posé une seule fois à l'écran fin de séance — voir
// app/(app)/seance/[id]/page.tsx pour la logique "à qui / quand" l'afficher.
export function SessionSurvey({ kind }: { kind: Kind }) {
  const [answered, setAnswered] = useState(false);
  const [busy, setBusy] = useState(false);
  const { title, options } = COPY[kind];

  async function respond(value: string) {
    if (busy) return;
    setBusy(true);
    setAnswered(true); // optimiste : pas la peine de faire attendre pour un simple tag
    try {
      await fetch("/api/account/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, value }),
      });
    } finally {
      setBusy(false);
    }
  }

  if (answered) {
    return (
      <Card className="mt-6 w-full max-w-xs border-glow/30 text-center">
        <p className="text-sm font-semibold text-glow">Merci pour ta réponse !</p>
      </Card>
    );
  }

  return (
    <Card className="mt-6 w-full max-w-xs text-left">
      <p className="mb-3 text-sm font-semibold">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => respond(opt)}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-chalk transition-colors hover:border-glow hover:text-glow"
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => respond("skipped")}
        className="mt-3 text-xs text-muted underline"
      >
        Passer cette question
      </button>
    </Card>
  );
}
