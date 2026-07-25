"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Confetti } from "@/components/Confetti";

// Bouton « J'ai fait cette séance » : marque une séance comme faite en 1 clic,
// sans passer par le lecteur guidé (utile quand on l'a faite dehors / au city).
// Récompense visible au clic : série mise à jour + confettis.
export function QuickDoneButton({
  sessionId,
  done,
}: {
  sessionId: string;
  done: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(done);
  const [streak, setStreak] = useState<number | null>(null);
  const [justDone, setJustDone] = useState(false);

  if (ok) {
    return (
      <>
        {justDone && <Confetti />}
        <span
          className={`flex-none rounded-full border border-glow/40 bg-glow/10 px-3 py-1.5 text-xs font-bold text-glow ${
            justDone ? "stat-pop" : ""
          }`}
        >
          {streak != null ? `Validée · série ${streak}` : "Fait ✓"}
        </span>
      </>
    );
  }

  async function mark() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/session/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, status: "done", difficulty: null }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && typeof data.streak === "number") setStreak(data.streak);
        setJustDone(true);
        setOk(true);
        router.refresh();
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={mark}
      disabled={loading}
      className="flex-none rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-chalk transition-colors hover:border-glow hover:text-glow disabled:opacity-50"
    >
      {loading ? "…" : "J'ai fait ✓"}
    </button>
  );
}
