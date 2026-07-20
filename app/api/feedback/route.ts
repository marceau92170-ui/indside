import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { sendEmail } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  message: z.string().min(3).max(2000),
  email: z.string().email().max(120).optional().or(z.literal("")),
  page: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const user = await currentUser().catch(() => null);
  const { message, email, page } = parsed.data;
  const contactEmail = email?.trim() || user?.email || null;

  // 1) On garde une trace en base (rien n'est perdu, visible dans l'admin).
  await prisma.feedback.create({
    data: {
      userId: user?.id ?? null,
      email: contactEmail,
      message: message.trim(),
      page: page?.slice(0, 120) ?? null,
    },
  });

  // 2) On notifie le créateur par email (arrive dans sa boîte contact@).
  const to = process.env.FEEDBACK_EMAIL || "contact@progressafoot.fr";
  await sendEmail({
    to,
    subject: "💬 Nouveau retour utilisateur — Progressa",
    html: `
      <div style="font-family:Arial,sans-serif;color:#16171A;line-height:1.6">
        <h2 style="margin:0 0 8px">Nouveau retour utilisateur</h2>
        <p style="white-space:pre-wrap;background:#f4f1ea;padding:14px;border-radius:8px;border-left:3px solid #E12A3A">${escapeHtml(
          message.trim()
        )}</p>
        <p style="color:#75726b;font-size:13px">
          De : ${contactEmail ? escapeHtml(contactEmail) : "anonyme"}${
            user ? ` (compte ${escapeHtml(user.email)})` : ""
          }<br>
          Page : ${page ? escapeHtml(page) : "—"}
        </p>
      </div>`,
  }).catch(() => {
    // L'email peut échouer (quota, config) : le retour est déjà sauvegardé en base.
  });

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
