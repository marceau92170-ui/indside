import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { isPremium } from "@/lib/plan";
import { mondayOfWeek } from "@/lib/categories";
import { computeStreak } from "@/lib/gamification";
import { DAYS_FR } from "@/lib/constants";
import { Card, ButtonLink } from "@/components/ui";
import { GenerateProgramButton } from "@/components/GenerateProgramButton";

export const dynamic = "force-dynamic";

export default async function SemainePage() {
  const user = await currentUser();
  if (!user || !user.profile) return null; // le layout redirige déjà

  const weekStart = mondayOfWeek();
  const [program, streak] = await Promise.all([
    prisma.program.findFirst({
      where: { userId: user.id, weekStart },
      include: {
        sessions: { orderBy: { order: "asc" }, include: { logs: { where: { userId: user.id } } } },
      },
    }),
    computeStreak(user.id),
  ]);

  const todayDow = new Date().getDay();
  const premium = isPremium(user);

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="font-condensed text-3xl font-bold uppercase leading-none">Ma semaine</h1>
          <p className="mt-1 text-sm text-muted">Salut {user.profile.firstName} 👊</p>
        </div>
        <div className="text-right">
          <p className="tnum font-condensed text-3xl font-bold leading-none text-glow">{streak}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Série 🔥</p>
        </div>
      </div>

      {!program && (
        <Card className="text-center">
          <p className="mb-3 text-sm text-muted">
            Ton programme de la semaine n&apos;est pas encore généré.
          </p>
          <GenerateProgramButton label="Générer ma semaine" />
        </Card>
      )}

      {program && (
        <>
          {program.summary && <p className="mb-4 text-sm text-muted">{program.summary}</p>}
          <ul className="space-y-3">
            {program.sessions.map((s) => {
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
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
                            {DAYS_FR[s.dayOfWeek]}
                            {isToday && !done && (
                              <span className="ml-2 rounded-full bg-glow px-2 py-0.5 text-[10px] text-night">
                                Aujourd&apos;hui
                              </span>
                            )}
                          </p>
                          <p className="mt-1 font-condensed text-xl font-bold leading-tight">
                            {done ? "✅ " : ""}
                            {s.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">
                            {s.durationMin} min · {s.objective}
                          </p>
                        </div>
                        <span className="text-xl text-muted">→</span>
                      </div>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>

          {user.profile.matchDay !== null && (
            <p className="mt-4 text-xs text-muted">
              ⚽ Match le {DAYS_FR[user.profile.matchDay].toLowerCase()} — la veille, c&apos;est
              repos ou récupération. Ton programme le sait.
            </p>
          )}
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
