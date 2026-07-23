import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { mondayOfWeek } from "@/lib/categories";
import { DAYS_FR } from "@/lib/constants";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setUTCDate(end.getUTCDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return `${fmt(weekStart)} – ${fmt(end)}`;
}

export default async function HistoriquePage() {
  const user = await currentUser();
  if (!user) return null;

  const currentWeek = mondayOfWeek();
  const programs = await prisma.program.findMany({
    where: { userId: user.id, weekStart: { lt: currentWeek } },
    orderBy: { weekStart: "desc" },
    include: {
      sessions: {
        orderBy: { dayOfWeek: "asc" },
        include: { logs: { where: { userId: user.id } } },
      },
    },
    take: 26, // ~6 mois d'historique
  });

  return (
    <div>
      <Link href="/semaine" className="mb-3 inline-block text-sm text-muted underline">
        ← Retour à ma semaine
      </Link>
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Historique</h1>
      <p className="mb-5 text-sm text-muted">Tes semaines précédentes, une par une.</p>

      {programs.length === 0 && (
        <Card className="text-center text-sm text-muted">
          Rien pour l&apos;instant — reviens ici après ta première semaine complète.
        </Card>
      )}

      <ul className="space-y-3">
        {programs.map((p) => {
          const done = p.sessions.filter((s) => s.logs[0]?.status === "done").length;
          const total = p.sessions.length;
          return (
            <li key={p.id}>
              <Card>
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-condensed text-lg font-bold uppercase">{formatWeekRange(p.weekStart)}</p>
                  <span className="tnum rounded-full bg-line/50 px-2.5 py-1 text-xs font-bold">
                    {done}/{total}
                  </span>
                </div>
                <ul className="space-y-1">
                  {p.sessions.map((s) => {
                    const log = s.logs[0];
                    const isDone = log?.status === "done";
                    const isSkipped = log?.status === "skipped";
                    return (
                      <li key={s.id} className="flex items-center justify-between text-sm">
                        <span className={`flex items-center gap-1.5 ${isDone ? "" : "text-muted"}`}>
                          <span
                            className={
                              isDone ? "text-glow" : isSkipped ? "text-muted" : "text-line"
                            }
                          >
                            {isDone ? "✓" : isSkipped ? "—" : "○"}
                          </span>
                          {DAYS_FR[s.dayOfWeek]} — {s.title}
                        </span>
                        {isDone && log?.difficulty && (
                          <span className="tnum text-xs text-muted">{log.difficulty}/5</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
