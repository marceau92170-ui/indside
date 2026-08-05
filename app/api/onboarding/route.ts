import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { createWeeklyProgram } from "@/lib/program/create";
import { isEligibleBirthYear } from "@/lib/categories";
import { cookies } from "next/headers";
import { sendEmail } from "@/lib/email/resend";
import { welcomeEmail } from "@/lib/email/nurture";
import { grantReferralReward } from "@/lib/referral";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // génération IA incluse

const OnboardingSchema = z.object({
  firstName: z.string().min(2).max(20),
  birthYear: z.number().int(),
  position: z.enum(["GB", "DC", "LAT", "MDF", "MOF", "AIL", "ATT"]),
  country: z.string().min(2).max(8).optional().default("FR"),
  levelType: z.enum(["DISTRICT", "REGIONAL", "NATIONAL", "GENERIC"]),
  division: z.string().min(1).max(30),
  region: z.string().min(2).max(8),
  district: z.string().max(40).nullable(),
  heightCm: z.number().int().min(120).max(210),
  weightKg: z.number().int().min(30).max(110),
  clubTrainingsPerWeek: z.number().int().min(0).max(5),
  matchDay: z.number().int().min(0).max(6).nullable(),
  equipment: z.array(z.enum(["ballon", "plots", "mur", "city", "elastiques"])),
  goal: z.enum(["vitesse", "technique", "physique", "endurance", "frappe", "polyvalent"]),
  weakness: z.string().max(120).nullable(),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = OnboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  // Cible acceptée : catégories jeunes U14-U18, OU adultes 18 ans et + (option
  // « 18 ans et + » ouverte pour les affiliés).
  if (!isEligibleBirthYear(data.birthYear)) {
    return NextResponse.json({ error: "birthYear hors cible" }, { status: 400 });
  }

  const profileData = {
    firstName: data.firstName,
    birthYear: data.birthYear,
    position: data.position,
    country: data.country,
    levelType: data.levelType,
    division: data.division,
    region: data.region,
    district: data.district,
    heightCm: data.heightCm,
    weightKg: data.weightKg,
    clubTrainingsPerWeek: data.clubTrainingsPerWeek,
    matchDay: data.matchDay,
    equipment: data.equipment,
    goal: data.goal,
    weakness: data.weakness,
  };

  await prisma.$transaction([
    prisma.playerProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...profileData },
      update: profileData,
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { name: data.firstName },
    }),
  ]);

  // Génère le premier programme (IA si premium, sinon séance générique). Le
  // profil vient déjà d'être enregistré au-dessus : si la génération échoue
  // (souci ponctuel, DB, etc.), on ne fait PAS échouer toute la création de
  // compte pour autant — /semaine proposera "Générer ma semaine" à l'arrivée
  // du joueur plutôt que de lui coller une inscription en échec.
  const fresh = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    include: { profile: true, subscription: true },
  });
  try {
    await createWeeklyProgram(fresh);
  } catch (err) {
    console.error("[onboarding] génération du programme initial échouée :", err);
  }

  // E-mail de bienvenue (une seule fois par joueur — garde-fou EmailEvent).
  try {
    await prisma.emailEvent.create({ data: { userId: user.id, key: "welcome" } });
    const { subject, html } = welcomeEmail(data.firstName);
    await sendEmail({ to: fresh.parentEmail ?? fresh.email, subject, html });
  } catch {
    // déjà envoyé (contrainte unique) ou erreur d'envoi → non bloquant
  }

  // Parrainage entre joueurs : si le filleul vient d'un lien d'invitation, on
  // grave le lien (une seule fois) et on offre 1 semaine de Premium au parrain.
  try {
    const inviteCode = (await cookies()).get("invite_code")?.value?.toUpperCase();
    if (inviteCode && fresh.inviteCode !== inviteCode) {
      const claimed = await prisma.user.updateMany({
        where: { id: user.id, inviteRewardGranted: false, invitedByCode: null },
        data: { invitedByCode: inviteCode, inviteRewardGranted: true },
      });
      if (claimed.count === 1) await grantReferralReward(inviteCode);
    }
  } catch {
    // non bloquant
  }

  return NextResponse.json({ ok: true });
}
