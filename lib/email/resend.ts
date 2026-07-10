import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM || "Progressa <onboarding@resend.dev>";

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  const resend = client();
  if (!resend) {
    // Pas de clé Resend (dev local) : on log au lieu d'envoyer.
    console.log(`[email non envoyé — RESEND_API_KEY absent] → ${opts.to} : ${opts.subject}`);
    return;
  }
  await resend.emails.send({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html });
}

export function magicLinkEmail(url: string): string {
  return `
  <div style="background:#101823;padding:32px;font-family:Arial,sans-serif;border-radius:12px;color:#F2F4F0">
    <p style="font-size:22px;font-weight:900;letter-spacing:1px;margin:0 0 16px">PROGRESSA</p>
    <p style="margin:0 0 24px">Clique pour te connecter. Le lien est valable 24 h.</p>
    <a href="${url}" style="display:inline-block;background:#D8F34E;color:#101823;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none">Me connecter</a>
    <p style="color:#8A94A3;font-size:12px;margin-top:24px">Si tu n'as pas demandé ce lien, ignore cet e-mail.</p>
  </div>`;
}
