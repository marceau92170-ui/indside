/** @type {import('next').NextConfig} */

// En-têtes de sécurité appliqués à toutes les pages. Bonnes pratiques web
// (protection clickjacking, sniffing MIME, HTTPS forcé…) + petit signal de
// confiance côté référencement. Pas de Content-Security-Policy ici : elle
// casserait Clerk/Stripe/Google si mal réglée — à faire séparément avec soin.
const securityHeaders = [
  // Force le HTTPS pendant 2 ans (le site est déjà 100% HTTPS).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Empêche le navigateur de "deviner" un type de fichier (anti-injection).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Empêche que le site soit chargé dans une iframe d'un autre domaine (anti-clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Limite les infos de provenance envoyées aux autres sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Désactive des capacités non utilisées par l'app (caméra, micro, géoloc).
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
