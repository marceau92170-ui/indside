import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mondayOfWeek } from "@/lib/categories";
import { sendEmail } from "@/lib/email/resend";
import { sendPushToUser } from "@/lib/push";
import { SITE_URL } from "@/lib/site";

// Le rappel "essai qui se termine dans 2 jours" a été déplacé dans son propre cron
// (/api/cron/trial-reminders, programmé plus tôt le matin) : c'est le seul e-mail
// automatique qui ne doit JAMAIS être sacrifié si le quota d'envoi du jour est
// serré (surprise de débit sinon). Celui-ci ne gère plus que les rappels de
// séance, moins critiques.

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Cron quotidien : rappel aux joueurs qui ont une séance aujourd'hui et ne l'ont pas faite.
// Envoie e-mail (toujours) + notification push (si le joueur l'a activée).
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const weekStart = mondayOfWeek();
  const todayDow = new Date().getDay();

  const sessions = await prisma.trainingSession.findMany({
    where: {
      dayOfWeek: todayDow,
      program: { weekStart },
      logs: { none: {} },
    },
    include: { program: { include: { user: { include: { profile: true } } } } },
  });

  // Comptes jamais activés (aucune séance loguée depuis l'inscription) au-delà de la
  // fenêtre d'activation : on arrête de les relancer chaque jour, indéfiniment — ça
  // consomme le quota d'e-mails pour des comptes tests/dormants qui ne reviendront pas.
  const ACTIVATION_WINDOW_MS = 10 * 24 * 60 * 60 * 1000;
  const candidateIds = sessions.map((s) => s.program.user.id);
  const activeUserIds = new Set(
    (
      await prisma.sessionLog.findMany({
        where: { userId: { in: candidateIds } },
        select: { userId: true },
        distinct: ["userId"],
      })
    ).map((l) => l.userId)
  );

  let emailSent = 0;
  let pushSent = 0;
  for (const s of sessions) {
    const user = s.program.user;
    const neverActivated =
      !activeUserIds.has(user.id) && Date.now() - user.createdAt.getTime() > ACTIVATION_WINDOW_MS;
    if (neverActivated) continue;
    try {
      await sendEmail({
        to: user.email,
        subject: `Séance ${s.title.toLowerCase()} — ${s.durationMin} min — avant 20h ?`,
        html: `<div style="background:#0C0D0F;padding:32px;font-family:Arial,sans-serif;border-radius:12px;color:#EDE9E0">
          <p style="font-size:22px;font-weight:900;letter-spacing:1px;margin:0 0 16px">PROGRESSA</p>
          <p>${user.profile?.firstName ?? ""}, c'est le jour de ta séance <strong>${s.title}</strong> (${s.durationMin} min).</p>
          <p style="color:#93938D">${s.objective}</p>
          <a href="${SITE_URL}/seance/${s.id}" style="display:inline-block;background:#E12A3A;color:#fff;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:12px">Lancer ma séance</a>
        </div>`,
      });
      emailSent++;
    } catch {
      // non bloquant
    }

    try {
      const n = await sendPushToUser(user.id, {
        title: `Séance du jour — ${s.durationMin} min`,
        body: `${s.title}. ${s.objective}`,
        url: `/seance/${s.id}`,
      });
      pushSent += n;
    } catch {
      // non bloquant
    }
  }

  return NextResponse.json({ emailSent, pushSent });
}
