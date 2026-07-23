"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { Icon } from "@/components/Icon";

type SaveResult = { isBest?: boolean; isFirst?: boolean; delta?: number | null };

export function TestRecorder({
  testType,
  unit,
  label,
  locked,
  timed = false,
  inviteUrl,
}: {
  testType: string;
  unit: string;
  label: string;
  locked: boolean;
  timed?: boolean;
  inviteUrl?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [celebration, setCelebration] = useState<null | { record: boolean; delta: number | null }>(null);

  // ---- Chronomètre guidé (tests en secondes) ----
  const [phase, setPhase] = useState<"idle" | "countdown" | "running">("idle");
  const [count, setCount] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function startCountdown() {
    setPhase("countdown");
    setCount(3);
    let c = 3;
    const id = setInterval(() => {
      c -= 1;
      if (c <= 0) {
        clearInterval(id);
        beginTimer();
      } else {
        setCount(c);
      }
    }, 1000);
  }

  function beginTimer() {
    setPhase("running");
    startRef.current = Date.now();
    const tick = () => {
      setElapsed((Date.now() - startRef.current) / 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function stopTimer() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const secs = (Date.now() - startRef.current) / 1000;
    setPhase("idle");
    setValue(secs.toFixed(1));
  }

  async function save() {
    const num = Number(value.replace(",", "."));
    if (!num || num <= 0) return;
    setSaving(true);
    setError(false);
    const res = await fetch("/api/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testType, value: num }),
    });
    setSaving(false);
    if (res.ok) {
      const data: SaveResult = await res.json().catch(() => ({}));
      setValue("");
      setElapsed(0);
      if (data.isBest) {
        setCelebration({ record: true, delta: data.delta ?? null });
      } else if (data.isFirst) {
        setCelebration({ record: false, delta: null });
      }
      router.refresh();
    } else {
      setError(true);
    }
  }

  async function shareRecord() {
    const url = inviteUrl ?? "https://progressafoot.fr";
    const msg = `Je viens de battre mon record de ${label} sur Progressa 🔥 Rejoins-moi : ${url}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Progressa", text: msg, url });
        return;
      } catch {
        /* annulé */
      }
    }
    try {
      await navigator.clipboard.writeText(msg);
    } catch {
      /* presse-papier indispo */
    }
  }

  if (locked) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted">
        <Icon name="lock" className="h-3.5 w-3.5" /> Enregistrement réservé aux membres Premium.
      </p>
    );
  }

  // Célébration record / première mesure
  if (celebration) {
    return (
      <div className="ob-pop rounded-card border border-glow/40 bg-glow/5 p-4 text-center">
        {celebration.record ? (
          <>
            <p className="font-condensed text-2xl font-bold uppercase text-glow">
              Record battu !
            </p>
            {celebration.delta !== null && (
              <p className="stat-pop mt-1 font-condensed text-3xl font-bold tnum">
                +{Number(celebration.delta.toFixed(1))} {unit}
              </p>
            )}
            <p className="mt-1 text-sm text-muted">Ta carte joueur monte. Continue comme ça.</p>
            <div className="mt-3 flex flex-col gap-2">
              <Button size="sm" onClick={shareRecord}>
                Partager mon record
              </Button>
              <button
                type="button"
                onClick={() => setCelebration(null)}
                className="text-xs text-muted underline"
              >
                Continuer
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="font-condensed text-xl font-bold uppercase">Première mesure enregistrée</p>
            <p className="mt-1 text-sm text-muted">
              C&apos;est ton point de départ. Refais le test dans 4 semaines pour voir ta progression.
            </p>
            <button
              type="button"
              onClick={() => setCelebration(null)}
              className="mt-3 text-xs text-muted underline"
            >
              Continuer
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Chronomètre guidé pour les tests en secondes */}
      {timed && (
        <div className="mb-3 rounded-card border border-line bg-night p-3 text-center">
          {phase === "idle" && (
            <>
              <p className="mb-2 text-xs text-muted">
                Pas besoin de chrono : l&apos;app compte pour toi.
              </p>
              <Button size="sm" onClick={startCountdown} className="w-full">
                Démarrer le chrono
              </Button>
            </>
          )}
          {phase === "countdown" && (
            <div className="py-2">
              <p className="text-xs uppercase tracking-widest text-muted">En place…</p>
              <p className="stat-pop font-condensed text-5xl font-bold text-glow" key={count}>
                {count}
              </p>
            </div>
          )}
          {phase === "running" && (
            <div className="py-1">
              <p className="tnum font-condensed text-5xl font-bold">{elapsed.toFixed(1)}<span className="text-lg text-muted"> s</span></p>
              <Button size="sm" onClick={stopTimer} className="mt-2 w-full !bg-red-500 !text-white">
                Stop
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder={timed ? `ou saisis le temps (${unit})` : `Résultat (${unit})`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1"
        />
        <Button size="sm" onClick={save} disabled={saving || !value}>
          {saving ? "…" : "Enregistrer"}
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">Erreur, réessaie.</p>}
    </div>
  );
}
