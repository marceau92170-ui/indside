import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { awardBadges, computeStreak } from "@/lib/gamification";

export const dynamic = "force-dynamic";

const LogSchema = z.object({
  sessionId: z.string().min(1),
  status: z.enum(["done", "skipped"]),
  difficulty: z.number().int().min(1).max(5).nullable(),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = LogSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { sessionId, status, difficulty } = parsed.data;

  // La séance doit appartenir à un programme de cet utilisateur
  const session = await prisma.trainingSession.findFirst({
    where: { id: sessionId, program: { userId: user.id } },
  });
  if (!session) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await prisma.sessionLog.upsert({
    where: { sessionId_userId: { sessionId, userId: user.id } },
    create: { sessionId, userId: user.id, status, difficulty },
    update: { status, difficulty, completedAt: new Date() },
  });

  const newBadges = await awardBadges(user.id);
  const streak = await computeStreak(user.id);

  return NextResponse.json({ ok: true, streak, newBadges });
}
