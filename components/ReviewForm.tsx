"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";

type Existing = { rating: number; text: string; status: string } | null;

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente de validation",
  approved: "Publié ✓",
  rejected: "Non retenu",
};

export function ReviewForm({ existing }: { existing?: Existing }) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState(existing?.text ?? "");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    if (rating < 1) {
      setError("Choisis une note (1 à 5 étoiles).");
      return;
    }
    if (text.trim().length < 15) {
      setError("Ton avis est un peu court (15 caractères minimum).");
      return;
    }
    setState("saving");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, text: text.trim() }),
      });
      setState(res.ok ? "done" : "error");
      if (!res.ok) setError("Une erreur est survenue. Réessaie.");
    } catch {
      setState("error");
      setError("Une erreur est survenue. Réessaie.");
    }
  }

  if (state === "done") {
    return (
      <Card className="border-glow/30 text-center">
        <p className="font-condensed text-lg font-bold uppercase">Merci !</p>
        <p className="mt-1 text-sm text-muted">
          Ton avis a bien été envoyé. Il sera publié après une rapide validation.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      {existing && (
        <p className="mb-3 text-xs text-muted">
          Tu as déjà laissé un avis — statut :{" "}
          <span className="font-semibold text-chalk">{STATUS_LABEL[existing.status] ?? existing.status}</span>. Tu
          peux le modifier ci-dessous (il repassera en validation).
        </p>
      )}

      <label className="mb-1 block text-sm font-semibold">Ta note</label>
      <div className="mb-4 flex gap-1" role="radiogroup" aria-label="Note">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
            aria-checked={rating === n}
            role="radio"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className="text-3xl leading-none transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/50 rounded"
          >
            <span className={(hover || rating) >= n ? "text-glow" : "text-line"}>★</span>
          </button>
        ))}
      </div>

      <label htmlFor="review-text" className="mb-1 block text-sm font-semibold">
        Ton avis
      </label>
      <textarea
        id="review-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={400}
        rows={4}
        placeholder="Ex : En 3 semaines je suis passé de 34 à 61 jonglages. Les séances sont courtes et je les fais chez moi."
        className="w-full rounded-lg border border-line bg-night px-4 py-3 text-sm text-chalk placeholder:text-muted focus:border-glow focus:outline-none"
      />
      <p className="mt-1 text-right text-[11px] text-muted">{text.length}/400</p>

      {error && <p className="mb-2 text-sm text-glow">{error}</p>}

      <Button onClick={submit} disabled={state === "saving"} className="mt-1 w-full">
        {state === "saving" ? "Envoi…" : existing ? "Mettre à jour mon avis" : "Envoyer mon avis"}
      </Button>
      <p className="mt-2 text-center text-[11px] text-muted">
        Publié avec ton prénom + ta catégorie uniquement. Aucun nom complet.
      </p>
    </Card>
  );
}
