// URL publique de référence pour le SEO (sitemap, robots, canoniques, JSON-LD).
// On réutilise NEXTAUTH_URL (déjà configuré) ; fallback sur le domaine de prod.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  "https://progressa.app"
).replace(/\/$/, "");

export const SITE_NAME = "Progressa";
