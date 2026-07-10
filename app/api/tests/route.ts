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

  await prisma.testResult.create({
    data: { userId: user.id, testType: parsed.data.testType, value: parsed.data.value },
  });
  const newBadges = await awardBadges(user.id);

  return NextResponse.json({ ok: true, newBadges });
}
