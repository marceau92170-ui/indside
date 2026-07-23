"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { ExerciseDetail, type ExerciseView } from "@/components/ExerciseDetail";
import { ExerciseIllustration } from "@/components/ExerciseIllustration";
import { Icon } from "@/components/Icon";
import { badgeInfo } from "@/lib/constants";

export type SessionBlock = {
  slug: string;
  sets: number;
  reps: string;
  rest: string;
  instruction: string;
  exercise: ExerciseView;
};

type SessionInfo = {
  id: string;
  title: string;
  day: string;
  durationMin: number;
  objective: string;
  advice: string;
  alreadyLogged: boolean;
};

// Convertit "45 s" / "1 min 30" / "2 min" en secondes (timer de récupération)
function parseRest(text: string): number {
  const min = text.match(/(\d+)\s*min/i);
  const sec = text.match(/(\d+)\s*s(?!\w)/i);
  let total = 0;
  if (min) total += parseInt(min[1]) * 60;
  if (sec) total += parseInt(sec[1]);
  return total || 45;
}

export function SessionPlayer({
  session,
  blocks,
  premium = false,
}: {
  session: SessionInfo;
  blocks: SessionBlock[];
  premium?: boolean;
}) {
  const router = useRouter();
  const [doneBlocks, setDoneBlocks] = useState<Set<number>>(new Set());
  const [detail, setDetail] = useState<ExerciseView | null>(null);
  const [phase, setPhase] = useState<"train" | "rate" | "done">(
    session.alreadyLogged ? "done" : "train"
  );
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [result, setResult] = useState<{ streak: number; newBadges: string[] } | null>(null);
  const [saving, setSaving] = useState(false);
  const [adapting, setAdapting] = useState(false);
  const [adaptError, setAdaptError] = useState<string | null>(null);

  // Timer de récupération
  const [timer, setTimer] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timer === null || timer <= 0) return;
    intervalRef.current = setInterval(() => {
      setTimer((t) => (t !== null && t > 0 ? t - 1 : null));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timer]);

  function toggleBlock(i: number, rest: string) {
    setDoneBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
        if (i < blocks.length - 1) setTimer(parseRest(rest));
      }
      return next;
    });
  }

  async function submit(status: "done" | "skipped") {
    setSaving(true);
    const res = await fetch("/api/session/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: session.id, status, difficulty }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setResult({ streak: data.streak, newBadges: data.newBadges });
      setPhase("done");
    }
  }

  async function adaptToSmallSpace() {
    setAdapting(true);
    setAdaptError(null);
    const res = await fetch("/api/session/adapt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: session.id }),
    });
    setAdapting(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setAdaptError(
        data.error === "not_enough_exercises"
          ? "Pas assez d'exercices d'espace réduit disponibles pour ton profil."
          : "Impossible d'adapter la séance pour le moment."
      );
    }
  }

  const allDone = doneBlocks.size === blocks.length;

  if (phase === "done") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <div className="glow-flash mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-glow text-white">
          <Icon name="check" className="h-11 w-11" strokeWidth={2.4} />
        </div>
        <h1 className="mb-2 font-condensed text-3xl font-bold uppercase">Séance validée.</h1>
        {result && (
          <p className="stat-pop mb-1 font-condensed text-xl font-bold text-glow">
            +1 sur ta série → {result.streak}
          </p>
        )}
        {result?.newBadges.map((key) => {
          const b = badgeInfo(key);
          return b ? (
            <p key={key} className="stat-pop mt-2 rounded-full border border-glow/40 px-4 py-1.5 text-sm">
              Badge débloqué : <span className="font-bold">{b.label}</span>
            </p>
          ) : null;
        })}
        {session.alreadyLogged && !result && (
          <p className="text-sm text-muted">Cette séance est déjà dans ton historique.</p>
        )}
        <div className="mt-6 w-full max-w-xs rounded-card border border-line bg-surface p-4 text-left">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
            Récupération
          </p>
          <p className="mt-1 text-sm text-muted">
            Bois de l&apos;eau et étire-toi 5 minutes. La récup fait partie de la séance — c&apos;est
            là que le corps encaisse le travail.
          </p>
        </div>
        {!premium && (
          <div className="mt-6 w-full max-w-xs rounded-card border border-glow/40 bg-glow/5 p-4 text-left">
            <p className="font-condensed text-base font-bold uppercase text-glow">
              Sur ta lancée ?
            </p>
            <p className="mt-1 text-sm text-muted">
              Les joueurs Premium enchaînent <strong>3 séances</strong> cette semaine, calées sur ton
              poste et ton match. Essaie 7 jours gratuits — sans payer maintenant.
            </p>
            <Button className="mt-3 w-full" onClick={() => router.push("/premium")}>
              Débloquer la suite — 7 j gratuits
            </Button>
          </div>
        )}
        <Button
          variant={premium ? "primary" : "ghost"}
          className="mt-4"
          onClick={() => router.push("/semaine")}
        >
          Retour à ma semaine
        </Button>
      </div>
    );
  }

  if (phase === "rate") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <h1 className="mb-2 font-condensed text-2xl font-bold uppercase">
          C&apos;était comment ?
        </h1>
        <p className="mb-6 text-sm text-muted">
          Ta réponse ajuste la charge de la semaine prochaine.
        </p>
        <div className="mb-8 flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setDifficulty(n)}
              className={`flex h-14 w-14 items-center justify-center rounded-lg border font-condensed text-xl font-bold ${
                difficulty === n
                  ? "border-glow bg-glow text-night"
                  : "border-line bg-surface text-chalk"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="mb-6 text-xs text-muted">1 = très facile · 5 = très dur</p>
        <Button onClick={() => submit("done")} disabled={!difficulty || saving} size="lg">
          {saving ? "Enregistrement…" : "Valider ma séance"}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted">{session.day}</p>
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase leading-tight">
        {session.title}
      </h1>
      <p className="mb-4 text-sm text-muted">
        {session.durationMin} min · {session.objective}
      </p>

      {timer !== null && timer > 0 && (
        <div className="sticky top-2 z-30 mb-3 flex items-center justify-between rounded-card border border-glow bg-surface px-4 py-3">
          <span className="text-sm font-semibold">Récupération</span>
          <span className="tnum font-condensed text-2xl font-bold text-glow">
            {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
          </span>
          <button onClick={() => setTimer(null)} className="text-xs text-muted underline">
            passer
          </button>
        </div>
      )}

      <ol className="space-y-3">
        {blocks.map((b, i) => {
          const done = doneBlocks.has(i);
          return (
            <li key={i}>
              <Card className={done ? "border-glow/40 opacity-70" : ""}>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <p className="font-condensed text-lg font-bold leading-tight">
                    {i + 1}. {b.exercise.name}
                  </p>
                  <span className="tnum shrink-0 rounded bg-line/60 px-2 py-1 font-condensed text-sm font-bold">
                    {b.sets} × {b.reps}
                  </span>
                </div>

                {/* Démonstration animée du mouvement, directement dans la séance */}
                <ExerciseIllustration
                  slug={b.exercise.slug}
                  category={b.exercise.category}
                  premium={premium}
                />

                <p className="mb-1 mt-3 text-sm">{b.instruction}</p>
                <p className="mb-3 text-xs text-muted">Récup : {b.rest} entre les séries</p>

                <button
                  onClick={() => setDetail(b.exercise)}
                  className="mb-2 w-full rounded-lg border border-line py-2 text-center text-xs font-semibold text-muted hover:border-glow/50 hover:text-chalk"
                >
                  Étapes détaillées &amp; erreurs à éviter
                </button>
                <Button
                  variant={done ? "subtle" : "ghost"}
                  size="sm"
                  onClick={() => toggleBlock(i, b.rest)}
                  className="w-full"
                >
                  {done ? "✓ Bloc terminé" : "Marquer terminé"}
                </Button>
              </Card>
            </li>
          );
        })}
      </ol>

      <Card className="mt-4 border-grass bg-grass/20">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Conseil du jour</p>
        <p className="mt-1 text-sm">{session.advice}</p>
      </Card>

      <div className="mt-6 space-y-2">
        <Button onClick={() => setPhase("rate")} disabled={!allDone} size="lg" className="w-full">
          {allDone ? "Terminer la séance" : `${doneBlocks.size}/${blocks.length} blocs faits`}
        </Button>
        <button
          onClick={adaptToSmallSpace}
          disabled={adapting}
          className="w-full py-2 text-center text-xs text-muted underline"
        >
          {adapting ? "Adaptation…" : "Pas moyen d'aller au stade ? Adapter en petit espace"}
        </button>
        {adaptError && <p className="text-center text-xs text-glow">{adaptError}</p>}
        <button
          onClick={() => submit("skipped")}
          className="w-full py-2 text-center text-xs text-muted underline"
        >
          Je ne peux pas la faire cette semaine
        </button>
      </div>

      {detail && (
        <ExerciseDetail exercise={detail} onClose={() => setDetail(null)} premium={premium} />
      )}
    </div>
  );
}
