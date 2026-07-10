import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { categoryFromBirthYear } from "@/lib/categories";
import { divisionLabel } from "@/lib/profile";
import { BADGES, positionLabel, TEST_TYPES } from "@/lib/constants";
import { computeStreak, totalDoneSessions } from "@/lib/gamification";
import { DownloadableCard } from "@/components/DownloadableCard";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const user = await currentUser();
  if (!user || !user.profile) return null;
  const p = user.profile;

  const [results, badges, streak, total] = await Promise.all([
    prisma.testResult.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.badge.findMany({ where: { userId: user.id } }),
    computeStreak(user.id),
    totalDoneSessions(user.id),
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
