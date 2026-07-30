import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Libellé lisible par écran (voir OnboardingWizard.tsx pour l'ordre exact).
const STEP_LABELS: Record<number, string> = {
  0: "Prénom & naissance",
  1: "Poste",
  2: "Niveau / club",
  3: "Gabarit (taille, poids)",
  4: "Rythme club",
  5: "Matériel",
  6: "Objectif",
  7: "Point faible",
  8: "Consentement parental / écran final",
  9: "Écran final (mineur)",
};

// Sentinelle "compte réellement créé" — voir OnboardingWizard.tsx / api/onboarding/funnel.
const ACCOUNT_CREATED_STEP = 99;

// Funnel de l'onboarding, mesuré AVANT même qu'un compte existe (anonId côté
// client) — 100% first-party, aucune dépendance à PostHog pour cette vue.
// Accès : /admin/onboarding?secret=ADMIN_SECRET
export default async function AdminOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string }>;
}) {
  const { secret } = await searchParams;
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted">
        Non autorisé.
      </main>
    );
  }

  const groups = await prisma.onboardingFunnelEvent.groupBy({
    by: ["step"],
    _count: { _all: true },
    orderBy: { step: "asc" },
  });

  const counts = new Map(groups.map((g) => [g.step, g._count._all]));
  const realSteps = [...counts.keys()].filter((s) => s !== ACCOUNT_CREATED_STEP).sort((a, b) => a - b);
  const started = counts.get(0) ?? 0;
  const accountsCreated = counts.get(ACCOUNT_CREATED_STEP) ?? 0;

  const rows = [
    ...realSteps.map((step) => ({
      label: STEP_LABELS[step] ?? `Écran ${step}`,
      count: counts.get(step) ?? 0,
    })),
    { label: "Compte créé", count: accountsCreated },
  ];

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 text-chalk">
      <Link href="/admin/stats" className="mb-4 inline-block text-xs text-muted hover:text-glow">
        ← Stats internes
      </Link>
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Funnel onboarding</h1>
      <p className="mb-6 text-sm text-muted">
        Où les gens abandonnent, écran par écran — mesuré avant même la création du compte
        (identifiant anonyme côté client, 100% first-party).
      </p>

      {rows.length === 0 || started === 0 ? (
        <p className="rounded-card border border-line bg-surface p-4 text-sm text-muted">
          Pas encore de données. Le suivi vient d&apos;être mis en place — reviens dans quelques
          heures/jours une fois que du monde sera passé par l&apos;onboarding.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row, i) => {
            const prevCount = i === 0 ? row.count : rows[i - 1].count;
            const pctOfStart = started > 0 ? Math.round((row.count / started) * 100) : 0;
            const dropVsPrev =
              i > 0 && prevCount > 0 ? Math.round(((prevCount - row.count) / prevCount) * 100) : 0;
            const barPct = started > 0 ? Math.max(2, Math.round((row.count / started) * 100)) : 2;
            return (
              <li key={i} className="rounded-card border border-line bg-surface p-3">
                <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold">
                    <span className="mr-2 text-muted">{i + 1}.</span>
                    {row.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="tnum font-condensed text-xl font-bold text-glow">{row.count}</span>
                    <span className="text-xs text-muted">{pctOfStart}%</span>
                    {i > 0 && dropVsPrev > 0 && (
                      <span className="text-xs font-semibold text-red-400">-{dropVsPrev}%</span>
                    )}
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/50">
                  <div className="h-full rounded-full bg-glow" style={{ width: `${barPct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
