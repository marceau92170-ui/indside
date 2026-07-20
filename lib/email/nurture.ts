import { SITE_URL } from "@/lib/site";

// Gabarit commun (fond sombre, couleurs Progressa).
function shell(inner: string): string {
  return `<div style="background:#0C0D0F;padding:32px;font-family:Arial,sans-serif;border-radius:12px;color:#EDE9E0;max-width:520px">
    <p style="font-size:22px;font-weight:900;letter-spacing:1px;margin:0 0 20px">PROGRESSA</p>
    ${inner}
    <p style="color:#5f5f59;font-size:12px;margin-top:28px">Progressa — ton préparateur physique de foot. Tu reçois cet e-mail car tu as créé un compte.</p>
  </div>`;
}

function cta(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#E12A3A;color:#fff;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:8px">${label}</a>`;
}

// Jour 0 — bienvenue, on montre le chemin (activation).
export function welcomeEmail(firstName?: string | null): { subject: string; html: string } {
  return {
    subject: "Bienvenue sur Progressa 🔥 ta première séance t'attend",
    html: shell(`
      <p>${firstName ? firstName + "," : "Salut,"} bienvenue dans l'équipe.</p>
      <p style="color:#93938D">Ton programme est prêt. Le plus dur, c'est de lancer la première séance — après, ça roule tout seul.</p>
      <p style="color:#93938D">👉 20 à 40 min, faisables seul, calées autour de ton club.</p>
      ${cta(`${SITE_URL}/semaine`, "Lancer ma première séance")}
    `),
  };
}

// Jour 1 — relance douce vers la valeur Premium.
export function nurtureDay1Email(firstName?: string | null): { subject: string; html: string } {
  return {
    subject: "Ta séance du jour est prête",
    html: shell(`
      <p>${firstName ? firstName + "," : "Salut,"} t'as fait ta séance ?</p>
      <p style="color:#93938D">Les joueurs qui progressent le plus s'entraînent <strong>3 fois par semaine</strong> entre les entraînements club. C'est exactement ce que débloque Premium : un programme complet calé sur ton poste, adapté chaque semaine.</p>
      ${cta(`${SITE_URL}/semaine`, "Voir ma semaine")}
    `),
  };
}

// Jour 3 — offre claire : essai 7 jours.
export function nurtureDay3Email(firstName?: string | null): { subject: string; html: string } {
  return {
    subject: "Débloque ton programme complet — 7 jours gratuits",
    html: shell(`
      <p>${firstName ? firstName + "," : "Salut,"} passe au niveau au-dessus.</p>
      <p style="color:#93938D">En Premium, tu as <strong>3 séances par semaine</strong> personnalisées (poste, objectif, calendrier de match), qui s'adaptent à tes retours. Un coach individuel coûte 30 à 50 € la séance — ici c'est 8,99 €/mois.</p>
      <p style="color:#93938D">Teste <strong>7 jours gratuits</strong> : tu débloques tout, sans payer maintenant, résiliable en 1 clic.</p>
      ${cta(`${SITE_URL}/premium`, "Essayer 7 jours gratuits")}
    `),
  };
}
