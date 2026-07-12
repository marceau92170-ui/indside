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

const DEV_LINKS = [
  { href: "/objectifs", emoji: "🎯", label: "Objectifs" },
  { href: "/matchs", emoji: "📋", label: "Carnet de match" },
  { href: "/sante", emoji: "🩺", label: "Suivi santé" },
  { href: "/ressources", emoji: "📚", label: "Ressources" },
];

const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const user = await currentUser();
  if (!user || !user.profile) return null;
  const p = user.profile;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const [results, badges, streak, total, recentLogs] = await Promise.all([
    prisma.testResult.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.badge.findMany({ where: { userId: user.id } }),
    computeStreak(user.id),
    totalDoneSessions(user.id),
    prisma.sessionLog.findMany({
      where: { userId: user.id, status: "done", completedAt: { gte: sixMonthsAgo } },
      select: { completedAt: true },
    }),
  ]);

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

      <h2 className="mb-2 mt-8 font-condensed text-xl font-bold uppercase">Progresser pour devenir pro</h2>
      <div className="grid grid-cols-2 gap-2">
        {DEV_LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="text-center transition-colors hover:border-glow/60">
              <p className="text-xl">{l.emoji}</p>
              <p className="mt-1 font-condensed text-sm font-bold uppercase">{l.label}</p>
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
