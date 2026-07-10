import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { createWeeklyProgram, feedbackForWeek } from "@/lib/program/create";
import { mondayOfWeek } from "@/lib/categories";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Régénère le programme de la semaine courante (après modification du profil ou passage premium).
export async function POST() {
  const user = await currentUser();
  if (!user || !user.profile) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const lastWeek = mondayOfWeek();
  lastWeek.setUTCDate(lastWeek.getUTCDate() - 7);
  const feedback = await feedbackForWeek(user.id, lastWeek);

  const fresh = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    include: { profile: true, subscription: true },
  });
  const program = await createWeeklyProgram(fresh, { feedback });

  return NextResponse.json({ ok: true, programId: program.id });
}
