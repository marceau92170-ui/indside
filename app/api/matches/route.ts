import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MatchSchema = z.object({
  date: z.string().min(1),
  opponent: z.string().max(80).nullable(),
  competition: z.string().max(80).nullable(),
  minutesPlayed: z.number().int().min(0).max(200).nullable(),
  goals: z.number().int().min(0).max(50),
  assists: z.number().int().min(0).max(50),
  rating: z.number().int().min(1).max(10).nullable(),
  note: z.string().max(500).nullable(),
  focusNext: z.string().max(300).nullable(),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = MatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const d = parsed.data;

  const match = await prisma.matchLog.create({
    data: {
      userId: user.id,
      date: new Date(d.date),
      opponent: d.opponent,
      competition: d.competition,
      minutesPlayed: d.minutesPlayed,
      goals: d.goals,
      assists: d.assists,
      rating: d.rating,
      note: d.note,
      focusNext: d.focusNext,
    },
  });

  return NextResponse.json({ ok: true, match });
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await req.json().catch(() => ({ id: null }));
  if (typeof id !== "string") return NextResponse.json({ error: "invalid" }, { status: 400 });

  await prisma.matchLog.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
