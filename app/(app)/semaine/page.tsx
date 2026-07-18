import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { isPremium } from "@/lib/plan";
import { mondayOfWeek, categoryFromBirthYear } from "@/lib/categories";
import { computeStreak, totalDoneSessions } from "@/lib/gamification";
import { DAYS_FR, positionLabel } from "@/lib/constants";
import { Card, ButtonLink } from "@/components/ui";
import { GenerateProgramButton } from "@/components/GenerateProgramButton";
import { NutritionWeekCard } from "@/components/NutritionWeekCard";
import { weeklyTip, matchTip } from "@/lib/data/nutrition";

export const dynamic = "force-dynamic";

export default async function SemainePage() {
  const user = await currentUser();
  if (!user || !user.profile) return null; // le layout redirige déjà

  const weekStart = mondayOfWeek();
  const [program, streak, allTimeDone] = await Promise.all([
    prisma.program.findFirst({
      where: { userId: user.id, weekStart },
      include: {
        sessions: { orderBy: { order: "asc" }, include: { logs: { where: { userId: user.id } } } },
      },
    }),
    computeStreak(user.id),
    totalDoneSessions(user.id),
  ]);

  const todayDow = new Date().getDay();
  const premium = isPremium(user);

  // Une séance "vide" (sans exercices) survient si le programme a été généré avant que
  // la bibliothèque soit chargée. On propose alors de recharger la semaine.
  const realSessions =
    program?.sessions.filter(
      (s) => Array.isArray(s.blocks) && (s.blocks as unknown[]).length > 0
    ) ?? [];
  const hasRealBlocks = realSessions.length > 0;
  const needsGeneration = !program || !hasRealBlocks;

  const doneCount = realSessions.filter((s) => s.logs[0]?.status === "done").length;
  const totalCount = realSessions.length;
  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const category = categoryFromBirthYear(user.profile.birthYear);

  // Petit mot personnalisé selon l'avancement — enlève le côté "vide / robot".
  const motivation =
    totalCount === 0
      ? ""
      : doneCount === 0
        ? "C'est parti — attaque ta première séance de la semaine. 💪"
        : doneCount < totalCount
          ? `Bien joué. Plus que ${totalCount - doneCount} séance${totalCount - doneCount > 1 ? "s" : ""} pour boucler ta semaine. 🔥`
          : "Semaine bouclée, énorme ! Récup bien méritée. 🏆";

  return (
    <div>
      {/* En-tête + identité joueur */}
      <div className="mb-4">
        <h1 className="font-condensed text-3xl font-bold uppercase leading-none">Ma semaine</h1>
        <p className="mt-1 text-sm text-muted">
          Salut {user.profile.firstName} 👊{" "}
          <span className="text-line">·</span> {positionLabel(user.profile.position)}{" "}
          <span className="text-line">·</span> {category}
        </p>
      </div>

      {/* Bandeau de stats — donne un vrai côté "tableau de bord" */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <StatTile label="Série" value={`${streak}`} suffix="🔥" accent />
        <StatTile label="Cette semaine" value={totalCount ? `${doneCount}/${totalCount}` : "—"} />
        <StatTile label="Total séances" value={`${allTimeDone}`} />
      </div>

      {/* Barre de progression de la semaine */}
      {totalCount > 0 && (
        <div className="mb-5">
          <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted">
            <span>Progression de la semaine</span>
            <span className="tnum">{pct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-line/60">
            <div
              className="h-full rounded-full bg-glow transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          {motivation && <p className="mt-2 text-xs text-chalk">{motivation}</p>}
        </div>
      )}

      {needsGeneration && (
        <Card className="text-center">
          <p className="mb-3 text-sm text-muted">
            {program
              ? "Ta séance est prête à être générée avec les exercices. Lance ta semaine 👇"
              : "Ton programme de la semaine n'est pas encore généré."}
          </p>
          <GenerateProgramButton label={program ? "Générer mes exercices" : "Générer ma semaine"} />
        </Card>
      )}

      {program && hasRealBlocks && (
        <>
          {program.summary && (
            <div className="mb-4 flex gap-2 rounded-card border-l-2 border-glow bg-surface/60 px-3 py-2.5">
              <span aria-hidden="true">🎯</span>
              <p className="text-xs leading-snug text-muted">{program.summary}</p>
            </div>
          )}

          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">
            Tes séances
          </p>
          <ul className="space-y-3">
            {realSessions.map((s) => {
              const log = s.logs[0];
              const isToday = s.dayOfWeek === todayDow;
              const done = log?.status === "done";
              return (
                <li key={s.id}>
                  <Link href={`/seance/${s.id}`}>
                    <Card
                      className={`transition-colors hover:border-glow/60 ${
                        isToday && !done ? "border-glow" : ""
                      } ${done ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
                            {DAYS_FR[s.dayOfWeek]}
                            {isToday && !done && (
                              <span className="ml-2 rounded-full bg-glow px-2 py-0.5 text-[10px] text-night">
                                Aujourd&apos;hui
                              </span>
                            )}
                            {done && (
                              <span className="ml-2 rounded-full border border-glow/40 px-2 py-0.5 text-[10px] text-glow">
                                Fait ✓
                              </span>
                            )}
                          </p>
                          <p className="mt-1 font-condensed text-xl font-bold leading-tight">
                            {done ? "✅ " : ""}
                            {s.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">
                            ⏱ {s.durationMin} min · {s.objective}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-line/50 px-2.5 py-1 text-sm text-chalk">
                          →
                        </span>
                      </div>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>

          {user.profile.matchDay !== null && (
            <p className="mt-4 flex items-start gap-2 rounded-card bg-surface/60 px-3 py-2 text-xs text-muted">
              <span aria-hidden="true">⚽</span>
              <span>
                Match le {DAYS_FR[user.profile.matchDay].toLowerCase()} — la veille, c&apos;est repos
                ou récupération. Ton programme le sait.
              </span>
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/historique" className="text-sm text-muted underline">
              Voir mes semaines précédentes →
            </Link>
            <GenerateProgramButton label="Régénérer ma semaine" variant="link" />
          </div>

          <div className="mt-6">
            <NutritionWeekCard
              premium={premium}
              weekly={weeklyTip(weekStart)}
              match={matchTip(user.profile.matchDay)}
            />
          </div>
        </>
      )}

      {!premium && (
        <Card className="mt-6 border-glow/30">
          <p className="mb-1 font-condensed text-lg font-bold uppercase">
            Une seule séance par semaine ?
          </p>
          <p className="mb-3 text-sm text-muted">
            En Premium : programme complet personnalisé (poste, calendrier, point faible), adapté
            chaque semaine selon tes retours.
          </p>
          <ButtonLink href="/premium" size="sm">
            Débloquer mon programme complet
          </ButtonLink>
        </Card>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-card border p-3 text-center ${
        accent ? "border-glow/40 bg-glow/10" : "border-line bg-surface"
      }`}
    >
      <p
        className={`font-condensed text-2xl font-bold leading-none tnum ${
          accent ? "text-glow" : "text-chalk"
        }`}
      >
        {value}
        {suffix && <span className="ml-0.5 text-base">{suffix}</span>}
      </p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}
