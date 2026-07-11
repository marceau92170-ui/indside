import type { MetadataRoute } from "next";

// Permet "Ajouter à l'écran d'accueil" — public cible mobile-first.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Progressa — Ton préparateur perso",
    short_name: "Progressa",
    description:
      "Programme d'entraînement foot personnalisé pour jeunes joueurs (13-17 ans). Généré pour ton poste, ton âge, ton niveau.",
    start_url: "/semaine",
    display: "standalone",
    background_color: "#0C0D0F",
    theme_color: "#0C0D0F",
    orientation: "portrait",
    icons: [
      { src: "/api/pwa-icon?size=192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/api/pwa-icon?size=512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/api/pwa-icon?size=192", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/api/pwa-icon?size=512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
