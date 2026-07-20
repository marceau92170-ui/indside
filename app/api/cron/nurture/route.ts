import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/resend";
import { nurtureDay1Email, nurtureDay3Email } from "@/lib/email/nurture";
import { sendPushToUser } from "@/lib/push";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const DAY = 24 * 60 * 60 * 1000;

// Envoie un e-mail de nurture à un lot de joueurs GRATUITS, une seule fois par clé.
async function runStep(
  key: string,
  from: Date,
  to: Date,
  build: (firstName?: string | null) => { subject: string; html: string },
  push: { title: string; body: string; url: string },
): Promise<number> {
  const users = await prisma.user.findMany({
    where: {
      plan: "free", // les joueurs en essai/Premium ont plan "premium" → jamais relancés
      createdAt: { gte: from, lte: to },
      emailEvents: { none: { key } },
    },
    include: { profile: true },
  });

  let sent = 0;
  for (const user of users) {
    const to2 = user.parentEmail ?? user.email;
    const { subject, html } = build(user.profile?.firstName);
    try {
      await sendEmail({ to: to2, subject, html });
      await prisma.emailEvent.create({ data: { userId: user.id, key } });
      sent++;
    } catch {
      // déjà envoyé ou erreur → non bloquant
    }
    // Bonus : notification push si le joueur l'a activée (best-effort).
    try {
      await sendPushToUser(user.id, push);
    } catch {
      // non bloquant
    }
  }
  return sent;
}

// Cron quotidien : relances J+1 et J+3 vers l'essai gratuit.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();

  const day1 = await runStep(
    "nurture_d1",
    new Date(now - 2 * DAY),
    new Date(now - 1 * DAY),
    nurtureDay1Email,
    { title: "Ta séance du jour t'attend 🔥", body: "20 min pour progresser. On y va ?", url: "/semaine" },
  );
  const day3 = await runStep(
    "nurture_d3",
    new Date(now - 4 * DAY),
    new Date(now - 3 * DAY),
    nurtureDay3Email,
    { title: "7 jours gratuits", body: "Débloque ton programme complet, sans payer maintenant.", url: "/premium" },
  );

  return NextResponse.json({ day1, day3 });
}
