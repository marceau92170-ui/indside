import { prisma } from "@/lib/prisma";
import { mondayOfWeek } from "@/lib/categories";
import { badgeInfo } from "@/lib/constants";
import { MonthlyActivity } from "@/components/MonthlyActivity";

export const dynamic = "force-dynamic";

// Tableau de bord interne — 100% first-party (nos propres requêtes Postgres),
// aucun tracker tiers, conforme à l'engagement pris dans /confidentialite.
// Accès : /admin/stats?secret=ADMIN_SECRET
export default async function AdminStatsPage({
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

  const currentWeek = mondayOfWeek();
  const eightWeeksAgo = new Date(currentWeek);
  eightWeeksAgo.setUTCDate(eightWeeksAgo.getUTCDate() - 7 * 7);

  const [
    totalUsers,
    usersWithProfile,
    premiumActive,
    sessionsThisWeek,
    sessionsAllTime,
    testsRecorded,
    signupsRecent,
    badgeGroups,
    juniorCount,
    seniorCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { profile: { isNot: null } } }),
    prisma.subscription.count({ where: { status: { in: ["active", "trialing"] } } }),
    prisma.sessionLog.count({ where: { status: "done", completedAt: { gte: currentWeek } } }),
    prisma.sessionLog.count({ where: { status: "done" } }),
    prisma.testResult.count(),
    prisma.user.findMany({ where: { createdAt: { gte: eightWeeksAgo } }, select: { createdAt: true } }),
    prisma.badge.groupBy({ by: ["key"], _count: { key: true } }),
    prisma.playerProfile.count({ where: { birthYear: { gt: new Date().getFullYear() - 15 } } }),
    prisma.playerProfile.count({ where: { birthYear: { lte: new Date().getFullYear() - 15 } } }),
  ]);

  // Inscriptions par semaine (8 dernières)
  const weeks: { label: string; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    weeks.push({ label: i === 0 ? "S0" : `S-${i}`, count: 0 });
  }
  for (const u of signupsRecent) {
    const weeksAgo = Math.floor((currentWeek.getTime() - mondayOfWeek(u.createdAt).getTime()) / (7 * 86400000));
    const idx = 7 - weeksAgo;
    if (idx >= 0 && idx < weeks.length) weeks[idx].count++;
  }

  const onboardingRate = totalUsers > 0 ? Math.round((usersWithProfile / totalUsers) * 100) : 0;
  const premiumRate = usersWithProfile > 0 ? Math.round((premiumActive / usersWithProfile) * 100) : 0;

  const badgeCounts = new Map(badgeGroups.map((b) => [b.key, b._count.key]));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-chalk">
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Stats internes</h1>
      <p className="mb-6 text-sm text-muted">
        Premier tenant — aucune donnée n&apos;est envoyée à un service tiers.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Comptes créés" value={totalUsers} />
        <Stat label="Profils complets" value={usersWithProfile} sub={`${onboardingRate}% des comptes`} />
        <Stat label="Premium actifs" value={premiumActive} sub={`${premiumRate}% des profils`} />
        <Stat label="Tests enregistrés" value={testsRecorded} />
        <Stat label="Séances cette semaine" value={sessionsThisWeek} />
        <Stat label="Séances (total)" value={sessionsAllTime} />
        <Stat label="Junior (13-14)" value={juniorCount} />
        <Stat label="Senior (15-17)" value={seniorCount} />
      </div>

      <h2 className="mb-2 font-condensed text-xl font-bold uppercase">Inscriptions (8 semaines)</h2>
      <div className="mb-6 rounded-card border border-line bg-surface p-4">
        <MonthlyActivity months={weeks} />
      </div>

      <h2 className="mb-2 font-condensed text-xl font-bold uppercase">Badges débloqués</h2>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[...badgeCounts.entries()].map(([key, count]) => {
          const info = badgeInfo(key);
          return (
            <li key={key} className="rounded-card border border-line bg-surface p-3">
              <p className="text-sm">
                {info?.emoji} {info?.label ?? key}
              </p>
              <p className="tnum font-condensed text-xl font-bold text-glow">{count}</p>
            </li>
          );
        })}
        {badgeCounts.size === 0 && <p className="text-sm text-muted">Aucun badge débloqué pour l&apos;instant.</p>}
      </ul>
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-card border border-line bg-surface p-3 text-center">
      <p className="tnum font-condensed text-2xl font-bold text-glow">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      {sub && <p className="mt-0.5 text-[10px] text-muted">{sub}</p>}
    </div>
  );
}
