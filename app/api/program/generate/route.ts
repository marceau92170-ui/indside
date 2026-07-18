import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { createWeeklyProgram, feedbackForWeek } from "@/lib/program/create";
import { isPremium } from "@/lib/plan";
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
  const existing = await prisma.program.findFirst({
    where: { userId: user.id, weekStart },
    include: { sessions: true },
  });
  // Le cooldown protège la facture API (génération IA = Premium). En gratuit, la
  // séance est un template déterministe (coût nul) → on ne bloque pas la régénération.
  // On ne bloque pas non plus si le programme actuel est incomplet : cassé (séances
  // sans exercices) OU trop maigre pour un Premium (< 2 séances, ex : resté sur la
  // version gratuite) — il doit pouvoir générer son vrai programme tout de suite.
  const realCount =
    existing?.sessions.filter(
      (s) => Array.isArray(s.blocks) && (s.blocks as unknown[]).length > 0
    ).length ?? 0;
  const isComplete = realCount >= 2;
  if (existing && isPremium(user) && isComplete) {
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
