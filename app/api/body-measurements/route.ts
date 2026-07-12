import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const Schema = z.object({
  heightCm: z.number().min(100).max(230),
  weightKg: z.number().min(25).max(150),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  await prisma.bodyMeasurement.create({
    data: { userId: user.id, heightCm: parsed.data.heightCm, weightKg: parsed.data.weightKg },
  });

  // Garde le profil (utilisé par la génération IA) à jour avec le dernier gabarit connu.
  await prisma.playerProfile.updateMany({
    where: { userId: user.id },
    data: { heightCm: Math.round(parsed.data.heightCm), weightKg: Math.round(parsed.data.weightKg) },
  });

  return NextResponse.json({ ok: true });
}
