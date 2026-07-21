import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { isPremium } from "@/lib/plan";
import { mondayOfWeek, categoryFromBirthYear } from "@/lib/categories";
import { computeStreak, totalDoneSessions } from "@/lib/gamification";
import { DAYS_FR, positionLabel } from "@/lib/constants";
import { lockedTeasers } from "@/lib/teaser";
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

  const realSessions =
    program?.sessions.filter(
      (s) => Array.isArray(s.blocks) && (s.blocks as unknown[]).length > 0
    ) ?? [];
  const hasRealBlocks = realSessions.length > 0;

  // Un Premium doit avoir un VRAI programme (≥ 2 séances). S'il est resté coincé sur
  // la séance "gratuite" (1 seule, générée avant l'abonnement), on lui propose bien
  // en évidence de générer son programme complet.
  const premiumThin = premium && hasRealBlocks && realSessions.length < 2;
  const needsGeneration = !program || !hasRealBlocks || premiumThin;
  const showFull = hasRealBlocks && !premiumThin;

  const doneCount = realSessions.filter((s) => s.logs[0]?.status === "done").length;
  const totalCount = realSessions.length;
  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const category = categoryFromBirthYear(user.profile.birthYear);

  // ----- Guidage "Aujourd'hui" : on dit clairement quoi faire -----
  const matchDay = user.profile.matchDay;
  const todaySession = realSessions.find((s) => s.dayOfWeek === todayDow);
  const todayDone = todaySession?.logs[0]?.status === "done";
  const isMatchToday = matchDay === todayDow;
  const isEveOfMatch =
    matchDay !== null && matchDay !== undefined && (todayDow + 1) % 7 === matchDay;
  // Prochaine séance à venir dans la semaine (jour ≥ aujourd'hui, non faite).
  const nextSession = realSessions.find(
    (s) => s.dayOfWeek >= todayDow && s.logs[0]?.status !== "done" && s.id !== todaySession?.id
  );

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
          Salut {user.profile.firstName} 👊 <span className="text-line">·</span>{" "}
          {positionLabel(user.profile.position)} <span className="text-line">·</span> {category}
        </p>
      </div>

      {/* Bandeau de stats */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <StatTile label="Série" value={`${streak}`} suffix="🔥" accent />
        <StatTile label="Cette semaine" value={totalCount ? `${doneCount}/${totalCount}` : "—"} />
        <StatTile label="Total séances" value={`${allTimeDone}`} />
      </div>

      {/* Guidage "Aujourd'hui" : la première chose qu'on voit → on sait quoi faire */}
      {showFull && (
        <Card className="mb-5 border-glow">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-glow">
            Aujourd&apos;hui · {DAYS_FR[todayDow]}
          </p>
          {isMatchToday ? (
            <p className="text-sm">
              ⚽ <span className="font-semibold">Jour de match.</span> Pas de séance : repose-toi et
              donne tout sur le terrain. Bon match !
            </p>
          ) : todaySession && todayDone ? (
            <p className="text-sm">
              ✅ <span className="font-semibold">Séance du jour faite.</span> Énorme — hydrate-toi et
              étire-toi, la récup fait partie du travail.
            </p>
          ) : todaySession ? (
            <>
              <p className="mb-2 text-sm">
                🎯 <span className="font-semibold">Ta séance du jour :</span> {todaySession.title}{" "}
                <span className="text-muted">· {todaySession.durationMin} min</span>
              </p>
              <ButtonLink href={`/seance/${todaySession.id}`} size="sm">
                Commencer ma séance →
              </ButtonLink>
            </>
          ) : isEveOfMatch ? (
            <p className="text-sm">
              😴 <span className="font-semibold">Veille de match.</span> Repos ou récup légère
              aujourd&apos;hui — sois frais demain.
            </p>
          ) : nextSession ? (
            <>
              <p className="mb-2 text-sm">
                🌙 <span className="font-semibold">Repos aujourd&apos;hui.</span> Ta prochaine séance :{" "}
                {nextSession.title}{" "}
                <span className="text-muted">· {DAYS_FR[nextSession.dayOfWeek]}</span>
              </p>
              <ButtonLink href={`/seance/${nextSession.id}`} size="sm" variant="ghost">
                Voir la séance
              </ButtonLink>
            </>
          ) : (
            <p className="text-sm">
              🌙 <span className="font-semibold">Repos aujourd&apos;hui.</span> Récupère bien — tu as
              tout donné cette semaine.
            </p>
          )}
        </Card>
      )}

      {/* Barre de progression de la semaine */}
      {showFull && totalCount > 0 && (
        <div className="mb-5">
          <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted">
            <span>Progression de la semaine</span>
            <span className="tnum">{pct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-line/60">
            <div className="h-full rounded-full bg-glow transition-all" style={{ width: `${pct}%` }} />
          </div>
          {motivation && <p className="mt-2 text-xs text-chalk">{motivation}</p>}
        </div>
      )}

      {needsGeneration && (
        <Card className="text-center">
          <p className="mb-3 text-sm text-muted">
            {premiumThin
              ? "Tu es Premium 🎉 Génère ton programme complet : 3 séances personnalisées, calées sur ton poste, ton niveau et ton calendrier."
              : program
                ? "Ta séance est prête à être générée avec les exercices. Lance ta semaine 👇"
                : "Ton programme de la semaine n'est pas encore généré."}
          </p>
          <GenerateProgramButton
            label={
              premiumThin
                ? "Générer mon programme complet"
                : program
                  ? "Générer mes exercices"
                  : "Générer ma semaine"
            }
          />
        </Card>
      )}

      {showFull && (
        <>
          {program?.summary && (
            <div className="mb-4 flex gap-2 rounded-card border-l-2 border-glow bg-surface/60 px-3 py-2.5">
              <span aria-hidden="true">🎯</span>
              <p className="text-xs leading-snug text-muted">{program.summary}</p>
            </div>
          )}

          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">
            Tes séances de la semaine
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

          {matchDay !== null && matchDay !== undefined && (
            <p className="mt-4 flex items-start gap-2 rounded-card bg-surface/60 px-3 py-2 text-xs text-muted">
              <span aria-hidden="true">⚽</span>
              <span>
                Match le {DAYS_FR[matchDay].toLowerCase()} — la veille, c&apos;est repos ou
                récupération. Ton programme le sait.
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
              match={matchTip(matchDay)}
            />
          </div>
        </>
      )}

      {!premium && user.profile && (
        <div className="mt-6">
          <p className="mb-2 font-condensed text-lg font-bold uppercase">
            Ton programme complet t&apos;attend
          </p>
          <p className="mb-3 text-sm text-muted">
            {positionLabel(user.profile.position)} · calé sur ton poste, ton objectif et ton match.
            Débloque-le pour cette semaine 👇
          </p>

          <ul className="space-y-2">
            {lockedTeasers({
              position: user.profile.position,
              goal: user.profile.goal,
              matchDay: user.profile.matchDay,
            }).map((t, i) => (
              <li key={i}>
                <Link href="/premium" className="block">
                  <Card className="relative overflow-hidden border-line/60">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 blur-[3px] select-none">
                        <p className="truncate font-condensed text-base font-bold uppercase">
                          {t.day} · {t.title}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {t.focus} · {t.duration} min
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-glow/15 px-2.5 py-1 text-xs font-bold text-glow">
                        🔒 Premium
                      </span>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>

          <Card className="mt-3 border-glow/40 bg-glow/5">
            <p className="mb-1 font-condensed text-base font-bold uppercase text-glow">
              7 jours gratuits
            </p>
            <p className="mb-3 text-sm text-muted">
              Débloque tout ton programme perso, adapté chaque semaine. Sans payer maintenant,
              résiliable en 1 clic.
            </p>
            <ButtonLink href="/premium" size="sm">
              Débloquer mon programme complet
            </ButtonLink>
          </Card>
        </div>
      )}

      {/* Parrainage : moteur de croissance, visible pour tous */}
      <Link href="/parrainage" className="mt-6 block">
        <Card className="flex items-center justify-between gap-3 border-line hover:border-glow/50">
          <div className="min-w-0">
            <p className="font-condensed text-base font-bold uppercase leading-tight">
              Invite ton équipe 🤝
            </p>
            <p className="text-sm text-muted">
              1 pote inscrit = 1 semaine de Premium offerte.
            </p>
          </div>
          <span className="flex-none text-glow" aria-hidden="true">→</span>
        </Card>
      </Link>
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
