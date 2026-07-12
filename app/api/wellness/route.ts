import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const Scale = z.number().int().min(1).max(5);

const WellnessSchema = z.object({
  sleepHours: z.number().min(0).max(16).nullable(),
  sleepQuality: Scale,
  energy: Scale,
  soreness: Scale,
  mood: Scale,
});

function today(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = WellnessSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const d = parsed.data;
  const date = today();

  const checkin = await prisma.wellnessCheckin.upsert({
    where: { userId_date: { userId: user.id, date } },
    create: { userId: user.id, date, ...d },
    update: { ...d },
  });

  return NextResponse.json({ ok: true, checkin });
}
