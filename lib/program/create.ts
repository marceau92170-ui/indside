import { prisma } from "@/lib/prisma";
import type { PlayerProfile, User } from "@prisma/client";
import { generateProgramWithAI, type GeneratedProgram, type WeekFeedback } from "@/lib/ai/generateProgram";
import { buildFallbackProgram, buildFreeSession } from "@/lib/program/templates";
import { isPremium } from "@/lib/plan";
import { mondayOfWeek } from "@/lib/categories";

// Génère (ou régénère) le programme d'une semaine pour un utilisateur et l'écrit en BDD.
//
// Important : si une régénération a lieu en cours de semaine (modification de profil,
// passage Premium, adaptation hebdo), les séances DÉJÀ VALIDÉES (avec un log) ne sont
// jamais supprimées — sinon le joueur perdrait sa série et son historique pour une
// séance qu'il a réellement faite. Seuls les jours pas encore joués sont remplacés.
export async function createWeeklyProgram(
  user: User & { profile: PlayerProfile | null; subscription: { status: string; currentPeriodEnd: Date | null } | null },
  opts: { weekStart?: Date; feedback?: WeekFeedback } = {}
) {
  const profile = user.profile;
  if (!profile) throw new Error("Profil manquant");

  const weekStart = opts.weekStart ?? mondayOfWeek();
  const exercises = await prisma.exercise.findMany();
  const premium = isPremium(user);

  const existing = await prisma.program.findFirst({
    where: { userId: user.id, weekStart },
    include: { sessions: { include: { logs: { where: { userId: user.id } } } } },
  });
  const keptSessions = existing?.sessions.filter((s) => s.logs.length > 0) ?? [];
  const keptDays = new Set(keptSessions.map((s) => s.dayOfWeek));

  let generated: GeneratedProgram;
  let source = "template";

  if (premium) {
    try {
      generated = await generateProgramWithAI(profile, exercises, opts.feedback);
      source = "ai";
    } catch (err) {
      console.error("Génération IA échouée, fallback template :", err);
      generated = buildFallbackProgram(profile, exercises);
    }
  } else {
    generated = buildFreeSession(profile, exercises);
  }

  // Ne jamais écraser un jour déjà validé par le joueur.
  const newSessions = generated.sessions.filter((s) => !keptDays.has(s.day_of_week));
  const nextOrderStart = keptSessions.length;

  if (existing) {
    // Supprime uniquement les séances non validées de cette semaine.
    await prisma.trainingSession.deleteMany({
      where: { programId: existing.id, id: { notIn: keptSessions.map((s) => s.id) } },
    });
    const program = await prisma.program.update({
      where: { id: existing.id },
      data: {
        source,
        summary: generated.summary,
        sessions: {
          create: newSessions.map((s, i) => ({
            dayOfWeek: s.day_of_week,
            title: s.title,
            durationMin: s.duration_min,
            objective: s.objective,
            advice: s.advice,
            blocks: s.blocks,
            order: nextOrderStart + i,
          })),
        },
      },
      include: { sessions: true },
    });
    return program;
  }

  const program = await prisma.program.create({
    data: {
      userId: user.id,
      weekStart,
      source,
      summary: generated.summary,
      sessions: {
        create: newSessions.map((s, i) => ({
          dayOfWeek: s.day_of_week,
          title: s.title,
          durationMin: s.duration_min,
          objective: s.objective,
          advice: s.advice,
          blocks: s.blocks,
          order: i,
        })),
      },
    },
    include: { sessions: true },
  });

  return program;
}

// Bilan de la semaine passée pour l'adaptation
export async function feedbackForWeek(userId: string, weekStart: Date): Promise<WeekFeedback> {
  const program = await prisma.program.findFirst({
    where: { userId, weekStart },
    include: { sessions: { include: { logs: { where: { userId } } } } },
  });
  if (!program) return [];
  return program.sessions.map((s) => {
    const log = s.logs[0];
    return {
      sessionTitle: s.title,
      status: log?.status ?? "skipped",
      difficulty: log?.difficulty ?? null,
    };
  });
}
