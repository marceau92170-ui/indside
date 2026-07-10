import { prisma } from "@/lib/prisma";
import type { PlayerProfile, User } from "@prisma/client";
import { generateProgramWithAI, type GeneratedProgram, type WeekFeedback } from "@/lib/ai/generateProgram";
import { buildFallbackProgram, buildFreeSession } from "@/lib/program/templates";
import { isPremium } from "@/lib/plan";
import { mondayOfWeek } from "@/lib/categories";

// Génère (ou régénère) le programme d'une semaine pour un utilisateur et l'écrit en BDD.
export async function createWeeklyProgram(
  user: User & { profile: PlayerProfile | null; subscription: { status: string; currentPeriodEnd: Date | null } | null },
  opts: { weekStart?: Date; feedback?: WeekFeedback } = {}
) {
  const profile = user.profile;
  if (!profile) throw new Error("Profil manquant");

  const weekStart = opts.weekStart ?? mondayOfWeek();
  const exercises = await prisma.exercise.findMany();
  const premium = isPremium(user);

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

  // Remplace le programme existant de la semaine (regénération idempotente)
  await prisma.program.deleteMany({ where: { userId: user.id, weekStart } });

  const program = await prisma.program.create({
    data: {
      userId: user.id,
      weekStart,
      source,
      summary: generated.summary,
      sessions: {
        create: generated.sessions.map((s, i) => ({
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
