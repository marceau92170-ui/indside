import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { isPremium } from "@/lib/plan";
import { awardBadges } from "@/lib/gamification";
import { TEST_COOLDOWN_DAYS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const TestSchema = z.object({
  testType: z.enum(["jonglage", "navette", "planche", "sprint20m"]),
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

  // Anti-spam : un test ne rapporte de l'XP (via le palier) qu'une fois tous les
  // TEST_COOLDOWN_DAYS jours — sinon on peut gonfler son palier en répétant le
  // même test en boucle, sans avoir vraiment progressé.
  const last = await prisma.testResult.findFirst({
    where: { userId: user.id, testType },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (last) {
    const nextAvailableAt = new Date(last.createdAt.getTime() + TEST_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
    if (nextAvailableAt > new Date()) {
      return NextResponse.json(
        { error: "cooldown", nextAvailableAt: nextAvailableAt.toISOString() },
        { status: 429 }
      );
    }
  }

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
