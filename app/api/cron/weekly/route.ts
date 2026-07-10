import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createWeeklyProgram, feedbackForWeek } from "@/lib/program/create";
import { mondayOfWeek, nextMonday } from "@/lib/categories";
import { sendEmail } from "@/lib/email/resend";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Cron du dimanche soir : génère le programme de la semaine suivante pour tous les
// utilisateurs avec profil, en s'adaptant au bilan de la semaine écoulée.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { profile: { isNot: null } },
    include: { profile: true, subscription: true },
  });

  const weekStart = nextMonday();
  const endedWeek = mondayOfWeek();
  let generated = 0;
  let failed = 0;

  for (const user of users) {
    try {
      const feedback = await feedbackForWeek(user.id, endedWeek);
      await createWeeklyProgram(user, { weekStart, feedback });
      generated++;

      try {
        await sendEmail({
          to: user.email,
          subject: "Ton programme de la semaine est prêt 🔥",
          html: `<div style="background:#101823;padding:32px;font-family:Arial,sans-serif;border-radius:12px;color:#F2F4F0">
            <p style="font-size:22px;font-weight:900;letter-spacing:1px;margin:0 0 16px">PROGRESSA</p>
            <p>${user.profile?.firstName ?? ""}, ta nouvelle semaine d'entraînement est en ligne, calée autour de ton club.</p>
            <a href="${process.env.NEXTAUTH_URL}/semaine" style="display:inline-block;background:#D8F34E;color:#101823;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:12px">Voir ma semaine</a>
          </div>`,
        });
      } catch {
        // l'e-mail n'est pas bloquant
      }
    } catch (err) {
      failed++;
      console.error(`Génération échouée pour ${user.id}:`, err);
    }
  }

  return NextResponse.json({ generated, failed, weekStart });
}
