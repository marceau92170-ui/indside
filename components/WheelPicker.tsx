"use client";

import { useEffect, useRef } from "react";

const ITEM_H = 44;
const VISIBLE_ROWS = 3;

// Roulette de sélection (façon date picker natif) : évite une grille de
// nombreuses cases pour un choix dans une liste ordonnée (ex : année de
// naissance). Le scroll-snap CSS gère l'accroche, on lit juste la position
// pour mettre à jour la valeur sélectionnée.
export function WheelPicker({
  options,
  value,
  onChange,
  renderLabel,
}: {
  options: number[];
  value: number | null;
  onChange: (v: number) => void;
  renderLabel?: (v: number) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const idx = value !== null ? options.indexOf(value) : -1;
    const startIdx = idx >= 0 ? idx : 0;
    el.scrollTop = startIdx * ITEM_H;
    // Le premier item est centré dès l'affichage : on aligne l'état dessus
    // tout de suite, pour ne pas montrer une valeur en surbrillance sans
    // qu'elle soit encore sélectionnée dans le state.
    if (value === null && options[startIdx] !== undefined) onChange(options[startIdx]);
    // Positionnement initial uniquement — pas de dépendance sur value/options
    // pour ne pas re-scroller pendant que l'utilisateur manipule la roulette.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleScroll() {
    const el = ref.current;
    if (!el) return;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const idx = Math.min(Math.max(Math.round(el.scrollTop / ITEM_H), 0), options.length - 1);
      const v = options[idx];
      if (v !== undefined && v !== value) onChange(v);
    }, 120);
  }

  return (
    <div className="relative mx-auto w-full max-w-[220px]">
      <div
        ref={ref}
        onScroll={handleScroll}
        className="hide-scrollbar overflow-y-auto"
        style={{
          height: ITEM_H * VISIBLE_ROWS,
          scrollSnapType: "y mandatory",
          paddingTop: ITEM_H,
          paddingBottom: ITEM_H,
        }}
      >
        {options.map((y) => (
          <div
            key={y}
            style={{ height: ITEM_H, scrollSnapAlign: "center" }}
            className={`flex items-center justify-center font-condensed text-lg font-bold transition-colors ${
              value === y ? "text-chalk" : "text-muted/40"
            }`}
          >
            {renderLabel ? renderLabel(y) : y}
          </div>
        ))}
      </div>
      {/* bande de sélection centrale, purement visuelle */}
      <div
        className="pointer-events-none absolute inset-x-0 rounded-lg border-y-2 border-glow/40 bg-glow/5"
        style={{ top: ITEM_H, height: ITEM_H }}
      />
    </div>
  );
}
