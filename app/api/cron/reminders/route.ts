import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mondayOfWeek } from "@/lib/categories";
import { sendEmail } from "@/lib/email/resend";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Cron quotidien : rappel aux joueurs qui ont une séance aujourd'hui et ne l'ont pas faite.
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

  let sent = 0;
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
          <a href="${process.env.NEXTAUTH_URL}/seance/${s.id}" style="display:inline-block;background:#E12A3A;color:#fff;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:12px">Lancer ma séance</a>
        </div>`,
      });
      sent++;
    } catch {
      // non bloquant
    }
  }

  return NextResponse.json({ sent });
}
