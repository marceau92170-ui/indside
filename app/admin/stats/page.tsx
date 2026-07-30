import { prisma } from "@/lib/prisma";
import { mondayOfWeek } from "@/lib/categories";
import { badgeInfo } from "@/lib/constants";
import { MonthlyActivity } from "@/components/MonthlyActivity";
import { premiumBreakdown } from "@/lib/premium-stats";

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
    premium,
    sessionsThisWeek,
    sessionsAllTime,
    testsRecorded,
    signupsRecent,
    badgeGroups,
    juniorCount,
    seniorCount,
    matchesLogged,
    goalsActive,
    goalsDone,
    wellnessCheckins,
    unresolvedPain,
    recentGrants,
    trialingSubs,
    referralFreeUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { profile: { isNot: null } } }),
    premiumBreakdown(),
    prisma.sessionLog.count({ where: { status: "done", completedAt: { gte: currentWeek } } }),
    prisma.sessionLog.count({ where: { status: "done" } }),
    prisma.testResult.count(),
    prisma.user.findMany({ where: { createdAt: { gte: eightWeeksAgo } }, select: { createdAt: true } }),
    prisma.badge.groupBy({ by: ["key"], _count: { key: true } }),
    prisma.playerProfile.count({ where: { birthYear: { gt: new Date().getFullYear() - 15 } } }),
    prisma.playerProfile.count({ where: { birthYear: { lte: new Date().getFullYear() - 15 } } }),
    prisma.matchLog.count(),
    prisma.goal.count({ where: { done: false } }),
    prisma.goal.count({ where: { done: true } }),
    prisma.wellnessCheckin.count({ where: { date: { gte: currentWeek } } }),
    prisma.painLog.count({ where: { resolved: false } }),
    prisma.adminActionLog.findMany({ orderBy: { createdAt: "desc" }, take: 15 }),
    prisma.subscription.findMany({
      where: { status: "trialing" },
      include: { user: { include: { profile: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { premiumUntil: { gt: new Date() }, subscription: null },
      include: { profile: true },
      orderBy: { premiumUntil: "desc" },
    }),
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
  const payingRate = usersWithProfile > 0 ? Math.round((premium.paying / usersWithProfile) * 100) : 0;

  const badgeCounts = new Map(badgeGroups.map((b) => [b.key, b._count.key]));

  // Nombre de filleuls confirmés par parrain (pour afficher "X potes" à côté de
  // chaque compte en semaine offerte par parrainage).
  const inviteCodes = referralFreeUsers.map((u) => u.inviteCode).filter((c): c is string => !!c);
  const referralCounts = new Map(
    (
      await prisma.user.groupBy({
        by: ["invitedByCode"],
        where: { invitedByCode: { in: inviteCodes }, inviteRewardGranted: true },
        _count: { invitedByCode: true },
      })
    ).map((g) => [g.invitedByCode as string, g._count.invitedByCode])
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-chalk">
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Stats internes</h1>
      <p className="mb-6 text-sm text-muted">
        Premier tenant — aucune donnée n&apos;est envoyée à un service tiers.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Comptes créés" value={totalUsers} />
        <Stat label="Profils complets" value={usersWithProfile} sub={`${onboardingRate}% des comptes`} />
        <Stat label="Payants réels" value={premium.paying} sub={`${payingRate}% des profils · facturés`} />
        <Stat label="En essai gratuit" value={premium.trialing} sub="pas encore facturés" />
        <Stat label="Parrainage (gratuit)" value={premium.referralFree} sub="sans Stripe" />
        <Stat label="Accordé à la main" value={premium.manualGrant} sub="sans Stripe ni parrainage" />
        <Stat label="Impayés" value={premium.pastDue} sub="prélèvement en échec" />
        <Stat label="Résiliés (total)" value={premium.canceled} sub="depuis le début" />
        <Stat label="Tests enregistrés" value={testsRecorded} />
        <Stat label="Séances cette semaine" value={sessionsThisWeek} />
        <Stat label="Séances (total)" value={sessionsAllTime} />
        <Stat label="Junior (13-14)" value={juniorCount} />
        <Stat label="Senior (15-17)" value={seniorCount} />
        <Stat label="Matchs loggés" value={matchesLogged} />
        <Stat label="Objectifs actifs" value={goalsActive} sub={`${goalsDone} atteints`} />
        <Stat label="Check-ins forme (sem.)" value={wellnessCheckins} />
        <Stat label="Douleurs non résolues" value={unresolvedPain} />
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
              <p className="text-sm">{info?.label ?? key}</p>
              <p className="tnum font-condensed text-xl font-bold text-glow">{count}</p>
            </li>
          );
        })}
        {badgeCounts.size === 0 && <p className="text-sm text-muted">Aucun badge débloqué pour l&apos;instant.</p>}
      </ul>

      <h2 className="mb-2 mt-8 font-condensed text-xl font-bold uppercase">
        En essai gratuit ({trialingSubs.length})
      </h2>
      <p className="mb-3 text-xs text-muted">Essai Stripe 7 j en cours, rien encaissé pour l&apos;instant.</p>
      {trialingSubs.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-4 text-sm text-muted">
          Personne en essai gratuit pour l&apos;instant.
        </p>
      ) : (
        <ul className="mb-8 space-y-2">
          {trialingSubs.map((sub) => (
            <li
              key={sub.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-line bg-surface p-3 text-sm"
            >
              <div>
                <span className="font-semibold">{sub.user.profile?.firstName ?? sub.user.name ?? sub.user.email}</span>
                <span className="ml-2 text-xs text-muted">{sub.user.email}</span>
                {sub.user.referredByCode && (
                  <span className="ml-2 rounded-full bg-glow/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-glow">
                    r/{sub.user.referredByCode}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-muted">
                {sub.trialEnd
                  ? `fin d'essai le ${sub.trialEnd.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}`
                  : "—"}
              </span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-2 mt-8 font-condensed text-xl font-bold uppercase">
        Parrainage gratuit ({referralFreeUsers.length})
      </h2>
      <p className="mb-3 text-xs text-muted">
        Semaine(s) de Premium offerte(s) via le parrainage entre joueurs (3 potes inscrits = 1
        semaine, cumulable jusqu&apos;à 4) — sans aucun abonnement Stripe.
      </p>
      {referralFreeUsers.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-4 text-sm text-muted">
          Personne en Premium par parrainage pour l&apos;instant.
        </p>
      ) : (
        <ul className="mb-8 space-y-2">
          {referralFreeUsers.map((u) => (
            <li
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-line bg-surface p-3 text-sm"
            >
              <div>
                <span className="font-semibold">{u.profile?.firstName ?? u.name ?? u.email}</span>
                <span className="ml-2 text-xs text-muted">{u.email}</span>
                {u.inviteCode && (
                  <span className="ml-2 rounded-full bg-glow/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-glow">
                    {referralCounts.get(u.inviteCode) ?? 0} pote{(referralCounts.get(u.inviteCode) ?? 0) > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-muted">
                {u.premiumUntil
                  ? `jusqu'au ${u.premiumUntil.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}`
                  : "—"}
              </span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-2 font-condensed text-xl font-bold uppercase">
        Accès Premium accordés à la main
      </h2>
      <p className="mb-3 text-xs text-muted">
        Journal de /api/admin/grant-premium — le seul endroit où l&apos;accès Premium est changé sans
        laisser de trace ailleurs (pas de Stripe, pas de parrainage).
      </p>
      {recentGrants.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-4 text-sm text-muted">
          Aucun accès accordé à la main pour l&apos;instant.
        </p>
      ) : (
        <ul className="space-y-2">
          {recentGrants.map((g) => (
            <li
              key={g.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-line bg-surface p-3 text-sm"
            >
              <div>
                <span
                  className={`mr-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    g.action === "grant_premium" ? "bg-glow/15 text-glow" : "bg-line/60 text-muted"
                  }`}
                >
                  {g.action === "grant_premium" ? "Accordé" : "Retiré"}
                </span>
                <span className="font-semibold">{g.email}</span>
                {g.note && <span className="ml-2 text-xs text-muted">— {g.note}</span>}
              </div>
              <span className="text-[11px] text-muted">
                {g.createdAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </li>
          ))}
        </ul>
      )}
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
