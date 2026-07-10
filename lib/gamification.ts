import { prisma } from "@/lib/prisma";

// Série = nombre de séances validées d'affilée (une séance sautée casse la série).
export async function computeStreak(userId: string): Promise<number> {
  const logs = await prisma.sessionLog.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
    take: 100,
    select: { status: true },
  });
  let streak = 0;
  for (const log of logs) {
    if (log.status === "done") streak++;
    else break;
  }
  return streak;
}

export async function totalDoneSessions(userId: string): Promise<number> {
  return prisma.sessionLog.count({ where: { userId, status: "done" } });
}

// Attribue les badges manquants ; retourne les clés des badges gagnés à l'instant.
export async function awardBadges(userId: string): Promise<string[]> {
  const [streak, total, existing, testCount] = await Promise.all([
    computeStreak(userId),
    totalDoneSessions(userId),
    prisma.badge.findMany({ where: { userId }, select: { key: true } }),
    prisma.testResult.count({ where: { userId } }),
  ]);
  const owned = new Set(existing.map((b) => b.key));
  const earned: string[] = [];

  const checks: [string, boolean][] = [
    ["first_session", total >= 1],
    ["serie_3", streak >= 3],
    ["serie_7", streak >= 7],
    ["sessions_10", total >= 10],
    ["sessions_25", total >= 25],
    ["first_test", testCount >= 1],
  ];

  // test_progress : une amélioration sur un même test
  if (!owned.has("test_progress") && testCount >= 2) {
    const results = await prisma.testResult.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    const byType = new Map<string, number[]>();
    for (const r of results) {
      const arr = byType.get(r.testType) ?? [];
      arr.push(r.value);
      byType.set(r.testType, arr);
    }
    for (const [type, values] of byType) {
      if (values.length < 2) continue;
      const last = values[values.length - 1];
      const prev = values[values.length - 2];
      const improved = type === "navette" ? last < prev : last > prev;
      if (improved) {
        checks.push(["test_progress", true]);
        break;
      }
    }
  }

  for (const [key, ok] of checks) {
    if (ok && !owned.has(key)) {
      await prisma.badge.create({ data: { userId, key } });
      earned.push(key);
    }
  }
  return earned;
}
