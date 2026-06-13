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

  const token = crypto.randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 heure

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiresAt: expires },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://indside-production.up.railway.app"
  const resetUrl = `${appUrl}/reset-password?token=${token}`

  await getResend().emails.send({
    from: "ImmoMail <noreply@immomail.fr>",
    to: user.email,
    subject: "Réinitialisation de votre mot de passe ImmoMail",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1e293b; margin-bottom: 8px;">Réinitialisation de mot de passe</h2>
        <p style="color: #64748b; margin-bottom: 24px;">
          Vous avez demandé à réinitialiser votre mot de passe ImmoMail. Cliquez sur le bouton ci-dessous.
          Ce lien est valable <strong>1 heure</strong>.
        </p>
        <a href="${resetUrl}"
           style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Réinitialiser mon mot de passe →
        </a>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
          Si vous n'avez pas fait cette demande, ignorez cet email. Votre mot de passe ne changera pas.
        </p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true })
}
