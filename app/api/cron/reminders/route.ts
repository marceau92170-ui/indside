import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mondayOfWeek } from "@/lib/categories";
import { sendEmail } from "@/lib/email/resend";
import { sendPushToUser } from "@/lib/push";
import { SITE_URL } from "@/lib/site";

// Rappel « ton essai gratuit se termine dans 2 jours » : envoyé une seule fois,
// ~2 jours avant la fin de l'essai. Réduit les surprises de débit (et donc les
// remboursements / litiges), tout en laissant l'inertie faire son travail.
async function sendTrialEndingReminders(): Promise<number> {
  const now = new Date();
  const soon = new Date(now.getTime() + 2.5 * 24 * 60 * 60 * 1000);

  const subs = await prisma.subscription.findMany({
    where: {
      status: "trialing",
      trialReminderSent: false,
      trialEnd: { gte: now, lte: soon },
    },
    include: { user: { include: { profile: true } } },
  });

  let sent = 0;
  for (const sub of subs) {
    const user = sub.user;
    const to = user.parentEmail ?? user.email;
    const end = sub.trialEnd
      ? sub.trialEnd.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
      : "bientôt";
    try {
      await sendEmail({
        to,
        subject: "Ton essai Premium se termine dans 2 jours",
        html: `<div style="background:#0C0D0F;padding:32px;font-family:Arial,sans-serif;border-radius:12px;color:#EDE9E0">
          <p style="font-size:22px;font-weight:900;letter-spacing:1px;margin:0 0 16px">PROGRESSA</p>
          <p>${user.profile?.firstName ?? "Salut"}, ton essai gratuit se termine le <strong>${end}</strong>.</p>
          <p style="color:#93938D">Si tu continues, ton abonnement démarre automatiquement (8,99€/mois). Tu peux résilier en 1 clic depuis l'app, sans aucun débit, tant que l'essai n'est pas terminé.</p>
          <a href="${SITE_URL}/semaine" style="display:inline-block;background:#E12A3A;color:#fff;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:12px">Continuer ma progression</a>
          <p style="color:#93938D;font-size:13px;margin-top:16px">Pour gérer ou résilier ton abonnement : Réglages → Gérer mon abonnement.</p>
        </div>`,
      });
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { trialReminderSent: true },
      });
      sent++;
    } catch {
      // non bloquant
    }
  }
  return sent;
}

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

  let emailSent = 0;
  let pushSent = 0;
  for (const s of sessions) {
    const user = s.program.user;
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

  const trialReminders = await sendTrialEndingReminders();

  return NextResponse.json({ emailSent, pushSent, trialReminders });
}
