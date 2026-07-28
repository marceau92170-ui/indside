import type { TierMilestone } from "@/lib/tiers";

// "Ton parcours" : les paliers déjà atteints, avec leur date. Non interactif —
// juste un rappel du chemin parcouru ; seule la carte du palier ACTUEL (RankCard
// au-dessus) est vivante (progression, partage, confettis).
export function TierHistory({ milestones }: { milestones: TierMilestone[] }) {
  if (milestones.length < 2) return null; // rien à montrer avant la 1ère vraie promotion

  const ordered = [...milestones].reverse(); // le plus récent en premier

  return (
    <div className="mt-5">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">Ton parcours</p>
      <ul className="space-y-2">
        {ordered.map((m) => (
          <li
            key={m.tier.key}
            className="flex items-center gap-3 rounded-card border border-line bg-surface p-3"
          >
            <span
              className="flex h-9 w-9 flex-none items-center justify-center rounded-full font-condensed text-xs font-bold text-white"
              style={{
                background: `linear-gradient(150deg, ${m.tier.light}, ${m.tier.dark})`,
                border: `2px solid ${m.tier.color}`,
              }}
            >
              {m.tier.mono.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="font-condensed text-base font-bold uppercase leading-tight"
                style={{ color: m.tier.color }}
              >
                {m.tier.name}
              </p>
              <p className="text-[11px] text-muted">
                {m.reachedAt
                  ? `Atteint le ${m.reachedAt.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}`
                  : "Ton point de départ"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
