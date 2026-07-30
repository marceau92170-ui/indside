import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Enregistre qu'un visiteur anonyme (avant création de compte) a atteint un écran
// de l'onboarding — sert à construire le funnel d'abandon en 100% first-party.
// Pas d'authentification : l'onboarding se déroule avant que le compte existe.
const BodySchema = z.object({
  anonId: z.string().min(10).max(64),
  // 0-20 = écrans réels ; 99 = sentinelle "compte réellement créé" (voir OnboardingWizard).
  step: z.number().int().min(0).max(99),
});

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const { anonId, step } = parsed.data;
  try {
    await prisma.onboardingFunnelEvent.create({ data: { anonId, step } });
  } catch {
    // déjà enregistré pour cet écran (contrainte unique) → non bloquant
  }

  return NextResponse.json({ ok: true });
}
