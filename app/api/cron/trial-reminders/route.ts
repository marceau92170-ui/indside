import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/resend";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Rappel « ton essai gratuit se termine dans 2 jours » — LE plus important des
// e-mails automatiques : sans lui, un joueur peut être débité par surprise (litige,
// remboursement, image de marque). Isolé dans son propre cron, programmé tôt le
// matin (avant nurture 10h et rappels de séance 15h), pour être toujours envoyé en
// premier et ne jamais être sacrifié si le quota d'e-mails du jour est serré.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

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
          <p style="color:#93938D">Si tu n'as pas ajouté de moyen de paiement, rien ne sera débité automatiquement — l'abonnement s'arrêtera simplement à la fin de l'essai. Pour continuer, ajoute une carte depuis l'app avant cette date.</p>
          <a href="${SITE_URL}/reglages" style="display:inline-block;background:#E12A3A;color:#fff;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:12px">Gérer mon abonnement</a>
          <p style="color:#93938D;font-size:13px;margin-top:16px">Déjà une carte enregistrée ? Aucune action requise, ton abonnement continue normalement (8,99€/mois), résiliable à tout moment.</p>
        </div>`,
      });
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { trialReminderSent: true },
      });
      sent++;
    } catch {
      // non bloquant — pas de flag posé, sera retenté au prochain passage du cron
    }
  }

  return NextResponse.json({ sent });
}
