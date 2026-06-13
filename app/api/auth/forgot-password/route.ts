import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import crypto from "crypto"

const getResend = () => new Resend(process.env.RESEND_API_KEY ?? "missing")

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}))
  if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })

  // Toujours répondre OK pour ne pas révéler si l'email existe
  if (!user || !user.password) {
    return NextResponse.json({ ok: true })
  }

  // Code à 6 chiffres, valable 15 minutes
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const expires = new Date(Date.now() + 1000 * 60 * 15)

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: code, resetTokenExpiresAt: expires },
  })

  await getResend().emails.send({
    from: "ImmoMail <onboarding@resend.dev>",
    to: user.email,
    subject: "Votre code de réinitialisation ImmoMail",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1e293b; margin-bottom: 8px;">Réinitialisation de mot de passe</h2>
        <p style="color: #64748b; margin-bottom: 24px;">
          Voici votre code de vérification. Il est valable <strong>15 minutes</strong>.
        </p>
        <div style="background: #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #1e293b;">${code}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">
          Si vous n'avez pas fait cette demande, ignorez cet email.
        </p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true })
}
