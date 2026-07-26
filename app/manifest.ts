import type { MetadataRoute } from "next";

// Permet "Ajouter à l'écran d'accueil" — public cible mobile-first.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Progressa — Ton préparateur perso",
    short_name: "Progressa",
    description:
      "Programme d'entraînement foot personnalisé pour jeunes joueurs (13-17 ans). Généré pour ton poste, ton âge, ton niveau.",
    start_url: "/profil",
    scope: "/",
    lang: "fr",
    dir: "ltr",
    categories: ["sports", "health", "lifestyle"],
    display: "standalone",
    background_color: "#15171C",
    theme_color: "#15171C",
    orientation: "portrait",
    icons: [
      { src: "/api/pwa-icon?size=192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/api/pwa-icon?size=512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/api/pwa-icon?size=192", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/api/pwa-icon?size=512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
