import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { createWeeklyProgram, feedbackForWeek } from "@/lib/program/create";
import { mondayOfWeek } from "@/lib/categories";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Cooldown anti-spam : une régénération manuelle appelle l'API Anthropic (payant en
// Premium). Sans limite, un clic répété peut faire grimper la facture pour rien.
const COOLDOWN_MS = 3 * 60 * 60 * 1000; // 3 h

// Régénère le programme de la semaine courante (après modification du profil ou passage premium).
export async function POST() {
  const user = await currentUser();
  if (!user || !user.profile) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const weekStart = mondayOfWeek();
  const existing = await prisma.program.findFirst({ where: { userId: user.id, weekStart } });
  if (existing) {
    const elapsed = Date.now() - existing.updatedAt.getTime();
    if (elapsed < COOLDOWN_MS) {
      const retryAfterMin = Math.ceil((COOLDOWN_MS - elapsed) / 60000);
      return NextResponse.json(
        { error: "cooldown", retryAfterMin, message: `Réessaie dans ${retryAfterMin} min. Ton programme vient d'être généré.` },
        { status: 429 }
      );
    }
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
