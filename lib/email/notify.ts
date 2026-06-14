import { Resend } from "resend"

const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

export async function notifyNewDrafts(to: string, count: number) {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    await resend.emails.send({
      from: "ImmoMail <onboarding@resend.dev>",
      to,
      subject: `${count} brouillon${count > 1 ? "s" : ""} en attente — ImmoMail`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 32px; background: #fff;">
          <p style="font-size: 14px; font-weight: 700; color: #4f46e5; margin: 0 0 32px;">ImmoMail</p>
          <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 12px; line-height: 1.3;">
            ${count} brouillon${count > 1 ? "s" : ""} prêt${count > 1 ? "s" : ""} à valider
          </h1>
          <p style="font-size: 15px; color: #475569; margin: 0 0 32px; line-height: 1.6;">
            L'IA a rédigé ${count === 1 ? "une réponse" : `${count} réponses`} pour vos derniers emails.
            Relisez et envoyez en un clic — rien ne part sans votre accord.
          </p>
          <a href="${APP_URL}/validation"
             style="display: inline-block; background: #4f46e5; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">
            Valider les brouillons →
          </a>
          <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">ImmoMail · Agent email pour agences immobilières</p>
          </div>
        </div>
      `,
    })
  } catch (e) {
    console.error("Notification email failed:", e)
  }
}
