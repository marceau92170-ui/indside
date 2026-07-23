"use client";

import { useMemo, useState } from "react";
import { ExerciseDetail, type ExerciseView } from "./ExerciseDetail";
import { QuickSessionPlayer } from "./QuickSessionPlayer";
import { Icon, type IconName } from "./Icon";

type Cat = { key: string; label: string; emoji: string };

const EQUIPMENT_FILTERS = [
  { key: "", label: "Tout matériel" },
  { key: "aucun", label: "Sans matériel" },
  { key: "ballon", label: "Ballon" },
  { key: "mur", label: "Mur" },
  { key: "plots", label: "Plots" },
];

// Nombre d'exercices max dans une séance flash (pour rester ~20-30 min).
const MAX_SESSION = 6;

export function ExerciseLibrary({
  exercises,
  categories,
  premium = false,
}: {
  exercises: ExerciseView[];
  categories: Cat[];
  premium?: boolean;
}) {
  const [cat, setCat] = useState("");
  const [equip, setEquip] = useState("");
  const [smallSpaceOnly, setSmallSpaceOnly] = useState(false);
  const [open, setOpen] = useState<ExerciseView | null>(null);
  const [sessionOn, setSessionOn] = useState(false);

  const filtered = useMemo(
    () =>
      exercises.filter(
        (ex) =>
          (!cat || ex.category === cat) &&
          (!equip || ex.equipment.includes(equip)) &&
          (!smallSpaceOnly || ex.smallSpaceFriendly)
      ),
    [exercises, cat, equip, smallSpaceOnly]
  );

  // Exercices réellement faisables (débloqués + adaptés à l'âge) pour la séance flash.
  const playable = useMemo(
    () => filtered.filter((ex) => !ex.locked && !ex.tooYoung),
    [filtered]
  );
  const sessionExercises = useMemo(() => playable.slice(0, MAX_SESSION), [playable]);
  const lockedCount = filtered.length - playable.length;

  // Titre de la séance à partir des filtres actifs.
  const catLabel = categories.find((c) => c.key === cat)?.label;
  const equipLabel = EQUIPMENT_FILTERS.find((f) => f.key === equip && f.key)?.label;
  const sessionTitle =
    [catLabel, equipLabel].filter(Boolean).join(" · ") || "Séance complète";

  return (
    <div>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        <FilterChip active={cat === ""} onClick={() => setCat("")}>
          Tous
        </FilterChip>
        {categories.map((c) => (
          <FilterChip key={c.key} active={cat === c.key} onClick={() => setCat(c.key)}>
            <span className="flex items-center gap-1.5">
              <Icon name={c.key as IconName} className="h-4 w-4" />
              {c.label}
            </span>
          </FilterChip>
        ))}
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {EQUIPMENT_FILTERS.map((f) => (
          <FilterChip key={f.key} active={equip === f.key} onClick={() => setEquip(f.key)}>
            {f.label}
          </FilterChip>
        ))}
        <FilterChip active={smallSpaceOnly} onClick={() => setSmallSpaceOnly((v) => !v)}>
          <span className="flex items-center gap-1.5">
            <Icon name="home" className="h-4 w-4" />
            Espace réduit
          </span>
        </FilterChip>
      </div>

      {/* Lancer une vraie séance guidée à partir des filtres choisis */}
      {sessionExercises.length >= 2 && (
        <button
          onClick={() => setSessionOn(true)}
          className="mb-4 flex w-full items-center justify-between rounded-card border border-glow bg-glow/10 px-4 py-3 text-left transition-colors hover:bg-glow/20"
        >
          <span>
            <span className="block font-condensed text-lg font-bold uppercase leading-tight">
              ▶ Séance libre
            </span>
            <span className="block text-xs text-muted">
              {sessionTitle} · {sessionExercises.length} exercices · en plus de ton programme, quand tu veux
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-glow px-3 py-1.5 font-condensed text-sm font-bold text-white">
            Lancer
          </span>
        </button>
      )}
      {sessionExercises.length < 2 && lockedCount > 0 && (
        <p className="mb-4 rounded-card border border-glow/30 bg-surface px-4 py-3 text-xs text-muted">
          Passe Premium pour lancer une séance guidée avec ces {filtered.length} exercices.
        </p>
      )}

      <ul className="space-y-2">
        {filtered.map((ex) => (
          <li key={ex.slug}>
            <button
              onClick={() => !ex.locked && setOpen(ex)}
              className={`w-full rounded-card border border-line bg-surface p-3 text-left transition-colors ${
                ex.locked ? "opacity-50" : "hover:border-glow/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-night ${
                    ex.locked ? "text-muted" : "text-glow"
                  }`}
                >
                  <Icon name={ex.category as IconName} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-condensed text-lg font-bold leading-tight">{ex.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    ~{ex.durationMin} min
                    {ex.minAge >= 15 && " · 15 ans+"}
                    {ex.tooYoung && " · pas encore pour ta catégorie"}
                  </p>
                </div>
                <span className="shrink-0 text-muted">
                  {ex.locked ? <Icon name="lock" className="h-4 w-4" /> : "→"}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted">Aucun exercice pour ces filtres.</p>
      )}

      {open && <ExerciseDetail exercise={open} onClose={() => setOpen(null)} premium={premium} />}

      {sessionOn && (
        <QuickSessionPlayer
          title={sessionTitle}
          exercises={sessionExercises}
          premium={premium}
          onClose={() => setSessionOn(false)}
        />
      )}
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? "bg-glow text-night" : "bg-line/50 text-muted hover:text-chalk"
      }`}
    >
      {children}
    </button>
  );
}
