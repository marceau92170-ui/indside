"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { ExerciseIllustration } from "@/components/ExerciseIllustration";
import { Icon } from "@/components/Icon";
import type { ExerciseView } from "@/components/ExerciseDetail";

// Séance « flash » : on enchaîne les exercices filtrés comme une vraie séance de sport,
// un exercice à la fois, avec une consigne, un timer de récup, et un écran de fin.
// Volontairement 100 % local (aucune écriture en base) — c'est un entraînement libre,
// distinct du programme hebdo personnalisé (qui, lui, compte pour la série).

// Prescription par défaut selon la catégorie (séries × format + récup en secondes).
function prescription(ex: ExerciseView): { sets: number; reps: string; restSec: number } {
  switch (ex.category) {
    case "renforcement":
      return { sets: 3, reps: "12 répétitions", restSec: 45 };
    case "explosivite":
      return { sets: 4, reps: "6 répétitions explosives", restSec: 60 };
    case "technique":
      return { sets: 3, reps: "45 secondes", restSec: 30 };
    case "cardio":
      return { sets: 1, reps: `${Math.max(2, ex.durationMin)} min en continu`, restSec: 45 };
    case "prevention":
      return { sets: 2, reps: "30 secondes par côté", restSec: 30 };
    case "gardien":
      return { sets: 3, reps: "8 répétitions", restSec: 45 };
    default:
      return { sets: 3, reps: "12 répétitions", restSec: 45 };
  }
}

export function QuickSessionPlayer({
  title,
  exercises,
  premium = false,
  onClose,
}: {
  title: string;
  exercises: ExerciseView[];
  premium?: boolean;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [resting, setResting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Compte à rebours de récupération. À 0, on passe à l'exercice suivant.
  useEffect(() => {
    if (!resting) return;
    if (timer <= 0) {
      setResting(false);
      return;
    }
    intervalRef.current = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [resting, timer]);

  const ex = exercises[index];
  const presc = ex ? prescription(ex) : null;
  const isLast = index === exercises.length - 1;

  function next() {
    if (isLast) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setTimer(presc?.restSec ?? 45);
    setResting(true);
  }

  function skipRest() {
    setResting(false);
    setTimer(0);
  }

  // ----- écran de fin -----
  if (finished) {
    return (
      <Shell onClose={onClose}>
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
          <div className="glow-flash mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-glow text-white">
            <Icon name="check" className="h-11 w-11" strokeWidth={2.4} />
          </div>
          <h2 className="mb-2 font-condensed text-3xl font-bold uppercase">Séance terminée !</h2>
          <p className="mb-1 text-sm text-muted">
            {exercises.length} exercices bouclés. Beau boulot.
          </p>
          <div className="mt-6 w-full max-w-xs rounded-card border border-line bg-surface p-4 text-left">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Récupération</p>
            <p className="mt-1 text-sm text-muted">
              Bois de l&apos;eau et étire-toi 5 minutes. C&apos;est là que le corps encaisse le travail.
            </p>
          </div>
          <Button className="mt-6" onClick={onClose}>
            Terminer
          </Button>
        </div>
      </Shell>
    );
  }

  if (!ex || !presc) return null;

  // ----- écran de récupération entre deux exercices -----
  if (resting) {
    return (
      <Shell onClose={onClose}>
        <Progress index={index} total={exercises.length} />
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Récupération</p>
          <p className="tnum my-3 font-condensed text-7xl font-bold text-glow">
            {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
          </p>
          <p className="mb-6 text-sm text-muted">
            Prochain : <span className="font-semibold text-chalk">{ex.name}</span>
          </p>
          <Button variant="ghost" onClick={skipRest}>
            Passer la récup →
          </Button>
        </div>
      </Shell>
    );
  }

  // ----- écran d'exercice en cours -----
  return (
    <Shell onClose={onClose}>
      <Progress index={index} total={exercises.length} />
      <h2 className="mb-1 font-condensed text-2xl font-bold uppercase leading-tight">{ex.name}</h2>
      <p className="mb-3 font-condensed text-lg font-bold text-glow">
        {presc.sets} × {presc.reps}
      </p>

      <div className="mb-4">
        <ExerciseIllustration slug={ex.slug} category={ex.category} premium={premium} />
      </div>

      <p className="mb-3 text-sm text-muted">{ex.description}</p>

      <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-sm">
        {ex.steps.slice(0, 4).map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>

      <Button onClick={next} size="lg" className="w-full">
        {isLast ? "Terminer la séance ✓" : "Exercice suivant →"}
      </Button>
      <p className="mt-2 text-center text-xs text-muted">
        Récup {presc.restSec} s avant le prochain exercice
      </p>
    </Shell>
  );
}

function Shell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-night">
      <div className="mx-auto max-w-lg px-4 py-4">
        <button
          onClick={onClose}
          className="mb-2 text-sm text-muted underline underline-offset-4 hover:text-chalk"
        >
          ← Quitter la séance
        </button>
        {children}
      </div>
    </div>
  );
}

function Progress({ index, total }: { index: number; total: number }) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-muted">
        <span>Exercice {index + 1}/{total}</span>
        <span>Séance flash</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/60">
        <div
          className="h-full rounded-full bg-glow transition-all"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
