"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Confetti } from "@/components/Confetti";
import { Icon } from "@/components/Icon";
import { SkillRadar } from "@/components/SkillRadar";
import type { Rank, Tier } from "@/lib/tiers";
import type { RadarAxis } from "@/lib/radar";

// Carte de rang évolutive : emblème métallique du palier, note globale, barre de
// promotion, échelle des paliers. Confettis quand le joueur vient de monter de
// palier ; mur de paiement pour les joueurs gratuits (promotion = Premium).
export function RankCard({
  firstName,
  positionLabel,
  category,
  divisionLabel,
  rank,
  tiers,
  radar,
  justPromoted,
}: {
  firstName: string;
  positionLabel: string;
  category: string;
  divisionLabel: string;
  rank: Rank;
  tiers: Tier[];
  radar: RadarAxis[];
  justPromoted: boolean;
}) {
  const t = rank.tier;

  useEffect(() => {
    if (justPromoted) {
      fetch("/api/rank/seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierIndex: t.index }),
      }).catch(() => {});
    }
  }, [justPromoted, t.index]);

  return (
    <div>
      {justPromoted && <Confetti />}

      {justPromoted && (
        <div
          className="mb-3 rounded-card border px-4 py-3 text-center"
          style={{ borderColor: `${t.color}66`, background: `${t.color}18` }}
        >
          <p className="font-condensed text-lg font-bold uppercase" style={{ color: t.color }}>
            Promotion — tu passes {t.name} !
          </p>
          <p className="text-xs text-muted">Ta carte évolue. Continue, le palier suivant t&apos;attend.</p>
        </div>
      )}

      {/* Cadre foil (bordure métallique) */}
      <div
        className="rounded-[22px] p-[2px]"
        style={{
          background: `linear-gradient(150deg, ${t.light}, ${t.color} 45%, ${t.dark})`,
          boxShadow: `0 24px 60px -26px ${t.color}80`,
        }}
      >
        <div
          className="relative overflow-hidden rounded-[20px] p-5"
          style={{
            background: `radial-gradient(120% 70% at 50% -8%, ${t.color}30, transparent 55%), linear-gradient(165deg,#20232a,#111318 62%,#0c0d11)`,
          }}
        >
          {/* texture + reflet */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{ background: "repeating-linear-gradient(115deg,#fff 0 1px,transparent 1px 7px)" }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(125deg,rgba(255,255,255,.13),transparent 34%,transparent 70%,rgba(255,255,255,.05))",
            }}
          />

          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="font-condensed font-bold leading-[0.82]">
                <div className="text-[52px] text-chalk">{rank.note}</div>
                <div className="mt-0.5 text-sm tracking-wide" style={{ color: t.color }}>
                  {positionLabel}
                </div>
              </div>
              <div className="text-right font-condensed font-bold uppercase">
                <div className="text-lg leading-none" style={{ color: t.color }}>
                  {t.name}
                </div>
                <div className="mt-1 font-sans text-[10px] font-semibold tracking-widest text-muted">
                  Palier {t.index + 1}/{tiers.length} · Div {rank.subDiv}
                </div>
              </div>
            </div>

            {/* Toile d'araignée : chaque famille d'exercice est une branche */}
            <div className="my-1">
              <SkillRadar axes={radar} color={t.color} light={t.light} />
            </div>

            <p className="text-center font-condensed text-[30px] font-bold uppercase leading-none">{firstName}</p>
            <p className="mt-1 text-center text-[11.5px] text-muted">
              {positionLabel} · <span className="text-chalk">{category}</span> · {divisionLabel}
            </p>

            {/* Barre de progression / promotion */}
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-muted">
                <span>Note {rank.note}</span>
                <span style={{ color: t.color }}>
                  {rank.isMaxTier
                    ? "Palier max"
                    : rank.locked
                      ? "Promotion → Premium"
                      : `→ ${rank.nextTier?.name} à 85`}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ background: "#0b0c0f" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${rank.progressPct}%`,
                    background: `linear-gradient(90deg, ${t.dark}, ${t.color}, ${t.light})`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Échelle des paliers */}
      <div className="mt-5 flex items-start justify-between">
        {tiers.map((tier, i) => {
          const done = i < t.index;
          const current = i === t.index;
          return (
            <div key={tier.key} className="flex w-1/6 flex-col items-center text-center">
              <span
                className="flex items-center justify-center rounded-full font-condensed font-bold"
                style={{
                  width: current ? 40 : 32,
                  height: current ? 40 : 32,
                  marginTop: current ? -4 : 0,
                  fontSize: current ? 14 : 12,
                  color: done || current ? "#fff" : "#8E8F89",
                  background: current
                    ? `linear-gradient(150deg, ${tier.color}, ${tier.dark})`
                    : done
                      ? `${tier.color}33`
                      : "#15171b",
                  border: `2px solid ${done || current ? tier.color : "#2A2B2D"}`,
                  boxShadow: current ? `0 0 0 4px ${tier.color}22` : "none",
                }}
              >
                {current || done || !rank.locked ? (
                  tier.mono.slice(0, 1)
                ) : (
                  <Icon name="lock" className="h-3.5 w-3.5" />
                )}
              </span>
              <span
                className={`mt-1.5 text-[8.5px] uppercase leading-tight tracking-wide ${
                  current ? "font-bold text-chalk" : "text-muted"
                }`}
              >
                {tier.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mur de paiement — gratuit qui a atteint le haut de son palier */}
      {rank.locked && rank.readyToPromote && (
        <div
          className="mt-5 overflow-hidden rounded-card border p-4"
          style={{ borderColor: "rgba(225,42,58,.4)", background: "radial-gradient(120% 90% at 20% 0%, rgba(225,42,58,.16), transparent 60%), #16181d" }}
        >
          <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#e7b6bb]">Palier Débutant terminé</p>
          <p className="mt-1 font-condensed text-xl font-bold uppercase leading-tight">
            {rank.realStartTier.index > 1
              ? `Débloque ton vrai niveau : ${rank.realStartTier.name}`
              : "Prêt à passer Amateur."}
          </p>
          <p className="mt-1 text-sm text-muted">
            Ta promotion et ta nouvelle carte t&apos;attendent. Passe Premium pour grimper les paliers.
          </p>
          <Link
            href="/premium"
            className="mt-3 block w-full rounded-xl bg-glow px-4 py-3 text-center font-condensed text-base font-bold uppercase tracking-wide text-white"
          >
            Réclamer ma promotion — 7 j gratuits
          </Link>
        </div>
      )}

      {/* Gratuit encore en train de grimper Débutant */}
      {rank.locked && !rank.readyToPromote && (
        <p className="mt-3 text-center text-xs text-muted">
          Continue à t&apos;entraîner pour finir ton palier. La promotion vers{" "}
          <span className="font-semibold" style={{ color: TIERS_NEXT_COLOR(rank) }}>Amateur</span> se débloque en Premium.
        </p>
      )}
    </div>
  );
}

function TIERS_NEXT_COLOR(rank: Rank): string {
  return rank.nextTier?.color ?? "#B98A57";
}
