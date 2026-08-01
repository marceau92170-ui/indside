import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { sendEmail } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  message: z.string().min(1).max(2000),
});

// Répond par e-mail à un retour utilisateur laissé via la bulle de feedback
// dans l'app — réservé à l'admin. Le message original est cité pour le
// contexte, puisque la personne ne se souvient pas forcément de ce qu'elle
// a écrit.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentUser();
  if (me?.role !== "admin") return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const feedback = await prisma.feedback.findUnique({ where: { id } });
  if (!feedback) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!feedback.email) return NextResponse.json({ error: "no_email" }, { status: 400 });

  const { message } = parsed.data;

  await sendEmail({
    to: feedback.email,
    subject: "Réponse à ton message — Progressa",
    html: `<div style="background:#0C0D0F;padding:32px;font-family:Arial,sans-serif;border-radius:12px;color:#EDE9E0">
      <p style="font-size:22px;font-weight:900;letter-spacing:1px;margin:0 0 16px">PROGRESSA</p>
      <p style="white-space:pre-wrap">${message}</p>
      <div style="margin-top:20px;padding:12px 16px;border-left:2px solid #38383A;color:#93938D;font-size:13px;white-space:pre-wrap">
        Ton message : « ${feedback.message} »
      </div>
      <p style="color:#93938D;font-size:12px;margin-top:20px">— L'équipe Progressa</p>
    </div>`,
  });

  await prisma.feedback.update({
    where: { id },
    data: { replyMessage: message, repliedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
