import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { categoryFromBirthYear } from "@/lib/categories";
import { divisionLabel } from "@/lib/profile";
import { BADGES, positionLabel, TEST_TYPES } from "@/lib/constants";
import { computeStreak, totalDoneSessions } from "@/lib/gamification";
import { DownloadableCard } from "@/components/DownloadableCard";
import { MonthlyActivity } from "@/components/MonthlyActivity";
import { Card } from "@/components/ui";

const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const user = await currentUser();
  if (!user || !user.profile) return null;
  const p = user.profile;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const [results, badges, streak, total, recentLogs, goalsOpen, matchCount, painsOpen] =
    await Promise.all([
      prisma.testResult.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      prisma.badge.findMany({ where: { userId: user.id } }),
      computeStreak(user.id),
      totalDoneSessions(user.id),
      prisma.sessionLog.findMany({
        where: { userId: user.id, status: "done", completedAt: { gte: sixMonthsAgo } },
        select: { completedAt: true },
      }),
      prisma.goal.count({ where: { userId: user.id, done: false } }),
      prisma.matchLog.count({ where: { userId: user.id } }),
      prisma.painLog.count({ where: { userId: user.id, resolved: false } }),
    ]);

  // Outils de progression (au-delà des séances) — avec un aperçu de ce qu'ils contiennent.
  const devLinks = [
    {
      href: "/objectifs",
      emoji: "🎯",
      label: "Objectifs",
      desc: "Fixe tes objectifs et coche-les au fur et à mesure",
      badge: goalsOpen > 0 ? `${goalsOpen} en cours` : "À définir",
    },
    {
      href: "/matchs",
      emoji: "📋",
      label: "Carnet de match",
      desc: "Note chaque match : buts, passes, ressenti, à travailler",
      badge: matchCount > 0 ? `${matchCount} noté${matchCount > 1 ? "s" : ""}` : "Commence ici",
    },
    {
      href: "/sante",
      emoji: "🩺",
      label: "Suivi santé",
      desc: "Douleurs, sommeil, forme du jour, croissance",
      badge: painsOpen > 0 ? `${painsOpen} douleur${painsOpen > 1 ? "s" : ""}` : "À jour",
    },
    {
      href: "/ressources",
      emoji: "📚",
      label: "Ressources",
      desc: "Nutrition, mental, et la vraie filière vers le pro",
      badge: "Guides",
    },
  ];

  const latestByType = new Map<string, number>();
  for (const r of results) {
    if (!latestByType.has(r.testType)) latestByType.set(r.testType, r.value);
  }

  const stats = TEST_TYPES.map((t) => ({
    label: t.label.split(" ")[0],
    value: latestByType.has(t.key)
      ? `${Number(latestByType.get(t.key)!.toFixed(1))}`
      : "—",
  }));

  const owned = new Set(badges.map((b) => b.key));

  // Histogramme des 6 derniers mois
  const months: { label: string; count: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: MONTH_LABELS[d.getMonth()], count: 0 });
  }
  for (const log of recentLogs) {
    const monthsAgo =
      (now.getFullYear() - log.completedAt.getFullYear()) * 12 + (now.getMonth() - log.completedAt.getMonth());
    const idx = 5 - monthsAgo;
    if (idx >= 0 && idx < months.length) months[idx].count++;
  }

  // Progression par test : première mesure vs dernière
  const progressionByType = TEST_TYPES.map((t) => {
    const values = results.filter((r) => r.testType === t.key).map((r) => r.value);
    if (values.length < 2) return null;
    const last = values[0]; // results est trié desc
    const first = values[values.length - 1];
    const lowerIsBetter = "lowerIsBetter" in t && Boolean(t.lowerIsBetter);
    const improved = lowerIsBetter ? last < first : last > first;
    const delta = last - first;
    return { key: t.key, label: t.label, emoji: t.emoji, unit: t.unit, first, last, delta, improved };
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <div>
      <h1 className="mb-4 font-condensed text-3xl font-bold uppercase">Profil</h1>

      <DownloadableCard
        data={{
          firstName: p.firstName,
          position: p.position,
          positionLabel: positionLabel(p.position),
          category: categoryFromBirthYear(p.birthYear),
          divisionLabel: divisionLabel(p),
          stats,
        }}
      />

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="tnum font-condensed text-3xl font-bold text-glow">{streak}</p>
          <p className="text-xs uppercase tracking-wide text-muted">Série en cours 🔥</p>
        </Card>
        <Card className="text-center">
          <p className="tnum font-condensed text-3xl font-bold text-glow">{total}</p>
          <p className="text-xs uppercase tracking-wide text-muted">Séances validées</p>
        </Card>
      </div>

      <h2 className="mb-1 mt-8 font-condensed text-xl font-bold uppercase">Progresser pour devenir pro</h2>
      <p className="mb-3 text-xs text-muted">
        Le foot, c&apos;est plus que les séances. Ici tu notes, tu suis et tu apprends — c&apos;est
        ce qui fait la différence sur la durée. Appuie pour ouvrir.
      </p>
      <div className="space-y-2">
        {devLinks.map((l) => (
          <Link key={l.href} href={l.href} className="block">
            <Card className="flex items-center gap-3 transition-colors hover:border-glow/60">
              <span className="text-2xl" aria-hidden="true">
                {l.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-condensed text-base font-bold uppercase leading-tight">
                  {l.label}
                </p>
                <p className="text-[11px] leading-tight text-muted">{l.desc}</p>
              </div>
              <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                {l.badge}
              </span>
              <span className="shrink-0 text-lg text-muted">→</span>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mb-2 mt-8 font-condensed text-xl font-bold uppercase">Activité (6 mois)</h2>
      <Card>
        <MonthlyActivity months={months} />
      </Card>

      {progressionByType.length > 0 && (
        <>
          <h2 className="mb-2 mt-8 font-condensed text-xl font-bold uppercase">Progression</h2>
          <div className="space-y-2">
            {progressionByType.map((p) => (
              <Card key={p.key} className="flex items-center justify-between">
                <div>
                  <p className="font-condensed text-sm font-bold uppercase">
                    {p.emoji} {p.label}
                  </p>
                  <p className="tnum text-xs text-muted">
                    {Number(p.first.toFixed(1))} → {Number(p.last.toFixed(1))} {p.unit}
                  </p>
                </div>
                <span
                  className={`tnum rounded-full px-2.5 py-1 text-xs font-bold ${
                    p.improved ? "bg-glow/15 text-glow" : "bg-line/50 text-muted"
                  }`}
                >
                  {p.delta > 0 ? "+" : ""}
                  {Number(p.delta.toFixed(1))} {p.unit}
                </span>
              </Card>
            ))}
          </div>
        </>
      )}

      <h2 className="mb-2 mt-8 font-condensed text-xl font-bold uppercase">Badges</h2>
      <ul className="grid grid-cols-2 gap-2">
        {BADGES.map((b) => {
          const has = owned.has(b.key);
          return (
            <li
              key={b.key}
              className={`rounded-card border p-3 ${
                has ? "border-glow/50 bg-surface" : "border-line bg-surface/50 opacity-45"
              }`}
            >
              <p className="text-xl">{b.emoji}</p>
              <p className="font-condensed text-sm font-bold uppercase">{b.label}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-muted">{b.desc}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
