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

  // Refs "miroir" des props les plus récentes, pour que le listener wheel
  // natif (enregistré une seule fois) lise toujours la valeur à jour sans
  // avoir à le ré-attacher à chaque render.
  const valueRef = useRef(value);
  const optionsRef = useRef(options);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    valueRef.current = value;
    optionsRef.current = options;
    onChangeRef.current = onChange;
  });

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

  // Tap direct sur une année visible (même non centrée) : on la centre et on
  // sélectionne tout de suite, sans dépendre du seul geste de scroll (qui
  // pouvait, avec l'accroche rapide, sauter une année sur deux).
  function selectIndex(idx: number) {
    const el = ref.current;
    if (el) el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
    const v = options[idx];
    if (v !== undefined) onChange(v);
  }

  // Molette de souris : un cran de molette envoie souvent un deltaY de
  // ~100px, soit plusieurs lignes d'un coup (44px chacune) — l'accroche CSS
  // seule laissait alors la roulette sauter 2-3 années par cran. On reprend
  // la main : chaque cran ne déplace que d'une année, jamais plus.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let locked = false;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      if (locked) return;
      locked = true;
      const opts = optionsRef.current;
      const curIdx = valueRef.current !== null ? opts.indexOf(valueRef.current) : 0;
      const dir = e.deltaY > 0 ? 1 : -1;
      const nextIdx = Math.min(Math.max(curIdx + dir, 0), opts.length - 1);
      el!.scrollTo({ top: nextIdx * ITEM_H, behavior: "smooth" });
      const v = opts[nextIdx];
      if (v !== undefined) onChangeRef.current(v);
      setTimeout(() => {
        locked = false;
      }, 200);
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

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
        {options.map((y, idx) => (
          <div
            key={y}
            onClick={() => selectIndex(idx)}
            style={{ height: ITEM_H, scrollSnapAlign: "center", scrollSnapStop: "always" }}
            className={`flex cursor-pointer items-center justify-center font-condensed text-lg font-bold transition-colors ${
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
