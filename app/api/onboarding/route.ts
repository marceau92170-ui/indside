import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { createWeeklyProgram } from "@/lib/program/create";
import { ageFromBirthYear, eligibleBirthYears } from "@/lib/categories";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // génération IA incluse

const OnboardingSchema = z.object({
  firstName: z.string().min(2).max(20),
  birthYear: z.number().int(),
  position: z.enum(["GB", "DC", "LAT", "MDF", "MOF", "AIL", "ATT"]),
  levelType: z.enum(["DISTRICT", "REGIONAL", "NATIONAL"]),
  division: z.string().min(1).max(20),
  region: z.string().min(2).max(4),
  district: z.string().max(40).nullable(),
  heightCm: z.number().int().min(120).max(210),
  weightKg: z.number().int().min(30).max(110),
  clubTrainingsPerWeek: z.number().int().min(0).max(5),
  matchDay: z.number().int().min(0).max(6).nullable(),
  equipment: z.array(z.enum(["ballon", "plots", "mur", "city", "elastiques"])),
  goal: z.enum(["vitesse", "technique", "physique", "endurance", "frappe", "polyvalent"]),
  weakness: z.string().max(120).nullable(),
  parentEmail: z.string().email().nullable(),
  parentConsent: z.boolean(),
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

  if (!eligibleBirthYears().includes(data.birthYear)) {
    return NextResponse.json({ error: "birthYear hors cible (U14-U18)" }, { status: 400 });
  }

  // Obligation légale française : consentement parental sous 15 ans
  if (ageFromBirthYear(data.birthYear) < 15 && (!data.parentConsent || !data.parentEmail)) {
    return NextResponse.json({ error: "consentement parental requis" }, { status: 400 });
  }

  const profileData = {
    firstName: data.firstName,
    birthYear: data.birthYear,
    position: data.position,
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
      data: {
        name: data.firstName,
        parentEmail: data.parentEmail,
        parentConsentAt: data.parentConsent ? new Date() : null,
      },
    }),
  ]);

  // Génère le premier programme (IA si premium, sinon séance générique)
  const fresh = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    include: { profile: true, subscription: true },
  });
  await createWeeklyProgram(fresh);

  return NextResponse.json({ ok: true });
}
