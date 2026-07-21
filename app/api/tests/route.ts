import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { isPremium } from "@/lib/plan";
import { awardBadges } from "@/lib/gamification";

export const dynamic = "force-dynamic";

const TestSchema = z.object({
  testType: z.enum(["jonglage", "navette", "planche", "detente"]),
  value: z.number().positive().max(10000),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isPremium(user)) {
    return NextResponse.json({ error: "premium_required" }, { status: 403 });
  }

  const parsed = TestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const { testType, value } = parsed.data;

  // Meilleure valeur PRÉCÉDENTE → pour fêter un record battu (« +X »).
  const lowerIsBetter = testType === "navette";
  const previous = await prisma.testResult.findMany({
    where: { userId: user.id, testType },
    select: { value: true },
  });
  const previousBest = previous.length
    ? lowerIsBetter
      ? Math.min(...previous.map((p) => p.value))
      : Math.max(...previous.map((p) => p.value))
    : null;
  const isFirst = previousBest === null;
  const isBest =
    !isFirst && (lowerIsBetter ? value < previousBest! : value > previousBest!);
  const delta = isBest ? Math.abs(value - previousBest!) : null;

  await prisma.testResult.create({
    data: { userId: user.id, testType, value },
  });
  const newBadges = await awardBadges(user.id);

  return NextResponse.json({ ok: true, newBadges, isBest, isFirst, delta, previousBest });
}
