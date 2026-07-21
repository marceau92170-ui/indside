"use client";

import { useEffect, useRef, useState } from "react";

// Aperçu du produit dans un cadre de téléphone (la vraie app, pas une pub).
// Anime discrètement quand il entre à l'écran — montre la valeur en un coup d'œil.
export function PhoneDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLive(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="mx-auto w-[248px]">
      <div className="relative rounded-[34px] border-2 border-line bg-black p-2.5 shadow-2xl">
        <div className="absolute left-1/2 top-2.5 z-10 h-4 w-20 -translate-x-1/2 rounded-b-xl bg-black" />
        <div className="overflow-hidden rounded-[26px] bg-night px-4 pb-4 pt-6">
          {/* barre appli */}
          <div className="flex items-center justify-between">
            <span className="font-condensed text-base font-bold uppercase tracking-wide text-glow">
              Ma semaine
            </span>
            <span className="text-[10px] text-muted">Latéral · U17</span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted">Salut Rayan 👊</p>

          {/* stat tiles */}
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {[
              ["5", "série 🔥"],
              ["2/3", "semaine"],
              ["23", "séances"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-lg border border-line bg-surface px-1 py-1.5 text-center">
                <p className="font-condensed text-base font-bold leading-none text-chalk">{n}</p>
                <p className="mt-0.5 text-[8px] uppercase tracking-wide text-muted">{l}</p>
              </div>
            ))}
          </div>

          {/* séance du jour */}
          <div className="mt-3 rounded-xl border border-glow/40 bg-glow/5 p-2.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-glow">Aujourd&apos;hui · Mardi</p>
            <p className="mt-0.5 font-condensed text-sm font-bold uppercase leading-tight">
              Vitesse de couloir
            </p>
            <p className="text-[10px] text-muted">32 min · spécial latéral</p>
            <div
              className={`mt-2 rounded-lg bg-glow py-2 text-center font-condensed text-xs font-bold uppercase text-white ${
                live ? "animate-pulse" : ""
              }`}
            >
              Commencer ma séance →
            </div>
          </div>

          {/* progression semaine */}
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[9px] text-muted">
              <span>Progression</span>
              <span>{live ? "66%" : "0%"}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-glow transition-[width] duration-1000 ease-out"
                style={{ width: live ? "66%" : "0%" }}
              />
            </div>
          </div>

          {/* séance verrouillée */}
          <div className="mt-2.5 flex items-center justify-between rounded-lg border border-line bg-surface p-2">
            <div className="min-w-0">
              <p className="truncate font-condensed text-xs font-bold uppercase text-muted">
                Jeu · Explosivité
              </p>
              <p className="text-[9px] text-muted">28 min</p>
            </div>
            <span className="text-[10px]">🔒</span>
          </div>
        </div>
      </div>
    </div>
  );
}
