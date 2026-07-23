import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { MatchLogForm } from "@/components/MatchLogForm";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function MatchsPage() {
  const user = await currentUser();
  if (!user) return null;

  const matches = await prisma.matchLog.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 50,
  });

  const season = matches.filter((m) => m.date > new Date(new Date().getFullYear() - 1, 6, 1));
  const totalGoals = season.reduce((sum, m) => sum + m.goals, 0);
  const totalAssists = season.reduce((sum, m) => sum + m.assists, 0);
  const ratings = matches.filter((m) => m.rating !== null).map((m) => m.rating as number);
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "—";

  return (
    <div>
      <Link href="/profil" className="mb-3 inline-block text-sm text-muted underline">
        ← Retour au profil
      </Link>
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Carnet de match</h1>
      <p className="mb-5 text-sm text-muted">
        Ta trace réelle, match après match. C&apos;est ce qui compte le jour où un recruteur
        demande « qu&apos;est-ce que tu as fait cette saison ? ».
      </p>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="tnum font-condensed text-2xl font-bold text-glow">{totalGoals}</p>
          <p className="text-[10px] uppercase text-muted">Buts (saison)</p>
        </Card>
        <Card className="text-center">
          <p className="tnum font-condensed text-2xl font-bold text-glow">{totalAssists}</p>
          <p className="text-[10px] uppercase text-muted">Passes D. (saison)</p>
        </Card>
        <Card className="text-center">
          <p className="tnum font-condensed text-2xl font-bold text-glow">{avgRating}</p>
          <p className="text-[10px] uppercase text-muted">Note moyenne</p>
        </Card>
      </div>

      <MatchLogForm />

      <h2 className="mb-2 mt-6 font-condensed text-lg font-bold uppercase">Historique</h2>
      {matches.length === 0 && <Card className="text-center text-sm text-muted">Aucun match enregistré.</Card>}
      <ul className="space-y-2">
        {matches.map((m) => (
          <li key={m.id}>
            <Card>
              <div className="mb-1 flex items-center justify-between">
                <p className="font-condensed text-base font-bold">
                  {m.opponent ? `vs ${m.opponent}` : "Match"}
                  {m.competition && <span className="ml-2 text-xs font-normal text-muted">{m.competition}</span>}
                </p>
                {m.rating !== null && (
                  <span className="tnum rounded-full bg-glow/15 px-2 py-0.5 text-xs font-bold text-glow">{m.rating}/10</span>
                )}
              </div>
              <p className="text-xs text-muted">{m.date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
              <p className="tnum mt-1 text-sm">
                {m.goals} but(s) · {m.assists} passe(s) D.{m.minutesPlayed !== null ? ` · ${m.minutesPlayed} min` : ""}
              </p>
              {m.focusNext && <p className="mt-2 text-xs text-muted">À travailler : {m.focusNext}</p>}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
