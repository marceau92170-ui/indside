import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { GoalsList } from "@/components/GoalsList";

export const dynamic = "force-dynamic";

export default async function ObjectifsPage() {
  const user = await currentUser();
  if (!user) return null;

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: [{ done: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <Link href="/profil" className="mb-3 inline-block text-sm text-muted underline">
        ← Retour au profil
      </Link>
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Mes objectifs</h1>
      <p className="mb-5 text-sm text-muted">
        Au-delà du programme de la semaine : ce que tu veux vraiment accomplir. 5 actifs maximum —
        mieux vaut peu d&apos;objectifs tenus que dix abandonnés.
      </p>

      <GoalsList
        initialGoals={goals.map((g) => ({
          id: g.id,
          title: g.title,
          targetDate: g.targetDate?.toISOString() ?? null,
          done: g.done,
        }))}
      />
    </div>
  );
}
