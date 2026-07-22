// URL publique de référence pour le SEO (sitemap, robots, canoniques, JSON-LD)
// et les URLs de retour Stripe. On réutilise NEXT_PUBLIC_SITE_URL / NEXTAUTH_URL ;
// fallback sur le domaine de prod.
//
// Robustesse : on garantit TOUJOURS une URL absolue avec un schéma. Si la variable
// d'env est renseignée sans « https:// » (ex. « www.progressafoot.fr »), on le rajoute —
// sinon `new URL(...)` plante (500 sur /r/<code>) et Stripe rejette les URLs de retour.
function normalizeUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().replace(/\/$/, "");
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export const SITE_URL =
  normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
  normalizeUrl(process.env.NEXTAUTH_URL) ||
  "https://www.progressafoot.fr";

export const SITE_NAME = "Progressa";
