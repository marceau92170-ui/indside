"use client";

import { useMemo, useState } from "react";
import { ExerciseDetail, type ExerciseView } from "./ExerciseDetail";

type Cat = { key: string; label: string; emoji: string };

const EQUIPMENT_FILTERS = [
  { key: "", label: "Tout matériel" },
  { key: "aucun", label: "Sans matériel" },
  { key: "ballon", label: "Ballon" },
  { key: "mur", label: "Mur" },
  { key: "plots", label: "Plots" },
];

export function ExerciseLibrary({
  exercises,
  categories,
}: {
  exercises: ExerciseView[];
  categories: Cat[];
}) {
  const [cat, setCat] = useState("");
  const [equip, setEquip] = useState("");
  const [smallSpaceOnly, setSmallSpaceOnly] = useState(false);
  const [open, setOpen] = useState<ExerciseView | null>(null);

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

  return (
    <div>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        <FilterChip active={cat === ""} onClick={() => setCat("")}>
          Tous
        </FilterChip>
        {categories.map((c) => (
          <FilterChip key={c.key} active={cat === c.key} onClick={() => setCat(c.key)}>
            {c.emoji} {c.label}
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
          🏠 Espace réduit
        </FilterChip>
      </div>

      <ul className="space-y-2">
        {filtered.map((ex) => (
          <li key={ex.slug}>
            <button
              onClick={() => !ex.locked && setOpen(ex)}
              className={`w-full rounded-card border border-line bg-surface p-3 text-left transition-colors ${
                ex.locked ? "opacity-50" : "hover:border-glow/60"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-condensed text-lg font-bold leading-tight">
                    {ex.emoji} {ex.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    ~{ex.durationMin} min
                    {ex.minAge >= 15 && " · 15 ans+"}
                    {ex.tooYoung && " · pas encore pour ta catégorie"}
                  </p>
                </div>
                <span className="shrink-0 text-lg">{ex.locked ? "🔒" : "→"}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted">Aucun exercice pour ces filtres.</p>
      )}

      {open && <ExerciseDetail exercise={open} onClose={() => setOpen(null)} />}
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
