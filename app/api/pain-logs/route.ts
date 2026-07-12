import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const Schema = z.object({
  bodyPart: z.string().min(2).max(60),
  intensity: z.number().int().min(1).max(5),
  note: z.string().max(300).nullable(),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { bodyPart, intensity, note } = parsed.data;

  await prisma.painLog.create({ data: { userId: user.id, bodyPart, intensity, note } });

  // Alerte douce (pas alarmiste) si la même zone revient souvent en 14 jours.
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const recentSameZone = await prisma.painLog.count({
    where: { userId: user.id, bodyPart, resolved: false, date: { gte: twoWeeksAgo } },
  });

  return NextResponse.json({ ok: true, recurring: recentSameZone >= 3 });
}

const ResolveSchema = z.object({ id: z.string().min(1), resolved: z.boolean() });

export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = ResolveSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  await prisma.painLog.updateMany({
    where: { id: parsed.data.id, userId: user.id },
    data: { resolved: parsed.data.resolved },
  });

  return NextResponse.json({ ok: true });
}
