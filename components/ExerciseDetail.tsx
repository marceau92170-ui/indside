"use client";

export type ExerciseView = {
  id: string;
  slug: string;
  name: string;
  category: string;
  emoji: string;
  description: string;
  steps: string[];
  mistakes: string;
  breathing?: string | null;
  equipment: string[];
  minAge: number;
  positions: string[];
  variantEasy: string;
  variantHard: string;
  durationMin: number;
  locked?: boolean;
  tooYoung?: boolean;
};

export function ExerciseDetail({
  exercise,
  onClose,
}: {
  exercise: ExerciseView;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-night/80 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-line bg-surface p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="font-condensed text-2xl font-bold uppercase leading-tight">
            {exercise.emoji} {exercise.name}
          </h2>
          <button onClick={onClose} className="text-2xl leading-none text-muted hover:text-chalk">
            ×
          </button>
        </div>

        <p className="mb-4 text-sm text-muted">{exercise.description}</p>

        <Section title="Exécution">
          <ol className="list-decimal space-y-1.5 pl-5 text-sm">
            {exercise.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </Section>

        <Section title="Erreurs fréquentes">
          <p className="text-sm">{exercise.mistakes}</p>
        </Section>

        {exercise.breathing && (
          <Section title="Respiration">
            <p className="text-sm">{exercise.breathing}</p>
          </Section>
        )}

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-line p-3">
            <p className="mb-1 text-xs font-bold uppercase text-muted">Plus facile</p>
            <p className="text-sm">{exercise.variantEasy}</p>
          </div>
          <div className="rounded-lg border border-line p-3">
            <p className="mb-1 text-xs font-bold uppercase text-glow">Plus dur</p>
            <p className="text-sm">{exercise.variantHard}</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted">
          ~{exercise.durationMin} min · matériel : {exercise.equipment.join(", ")}
          {exercise.minAge >= 15 && " · réservé aux 15 ans et +"}
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="mb-1.5 font-condensed text-sm font-bold uppercase tracking-wide text-glow">
        {title}
      </p>
      {children}
    </div>
  );
}
