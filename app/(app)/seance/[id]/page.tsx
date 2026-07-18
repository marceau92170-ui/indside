import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { isPremium } from "@/lib/plan";
import { SessionPlayer, type SessionBlock } from "@/components/SessionPlayer";
import { DAYS_FR } from "@/lib/constants";

export const dynamic = "force-dynamic";

type RawBlock = {
  slug: string;
  sets: number;
  reps: string;
  rest: string;
  instruction: string;
};

export default async function SeancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) return null;

  const session = await prisma.trainingSession.findFirst({
    where: { id, program: { userId: user.id } },
    include: { logs: { where: { userId: user.id } } },
  });
  if (!session) notFound();

  const rawBlocks = (session.blocks as RawBlock[]) ?? [];
  const exercises = await prisma.exercise.findMany({
    where: { slug: { in: rawBlocks.map((b) => b.slug) } },
  });
  const bySlug = new Map(exercises.map((e) => [e.slug, e]));

  const blocks: SessionBlock[] = rawBlocks
    .filter((b) => bySlug.has(b.slug))
    .map((b) => {
      const ex = bySlug.get(b.slug)!;
      return {
        slug: b.slug,
        sets: b.sets,
        reps: b.reps,
        rest: b.rest,
        instruction: b.instruction,
        exercise: {
          id: ex.id,
          slug: ex.slug,
          name: ex.name,
          category: ex.category,
          emoji: ex.emoji,
          description: ex.description,
          steps: ex.steps,
          mistakes: ex.mistakes,
          breathing: ex.breathing,
          equipment: ex.equipment,
          minAge: ex.minAge,
          positions: ex.positions,
          variantEasy: ex.variantEasy,
          variantHard: ex.variantHard,
          durationMin: ex.durationMin,
        },
      };
    });

  return (
    <SessionPlayer
      session={{
        id: session.id,
        title: session.title,
        day: DAYS_FR[session.dayOfWeek],
        durationMin: session.durationMin,
        objective: session.objective,
        advice: session.advice,
        alreadyLogged: session.logs.length > 0,
      }}
      blocks={blocks}
      premium={isPremium(user)}
    />
  );
}
