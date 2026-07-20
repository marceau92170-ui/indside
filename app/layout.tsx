import type { Metadata, Viewport } from "next";
import { Archivo_Black, Barlow_Condensed, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { PostHogProvider } from "@/components/PostHogProvider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const display = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const condensed = Barlow_Condensed({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-condensed",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const TITLE = "Progressa — Ton préparateur physique perso de foot";
const DESCRIPTION =
  "Programme d'entraînement de football personnalisé, pour ados comme adultes. Généré pour ton poste, ton âge et ton niveau : des séances de 20 à 40 min faisables seul, calées autour de ton club. Gratuit pour commencer.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Progressa",
  },
  description: DESCRIPTION,
  applicationName: "Progressa",
  manifest: "/manifest.webmanifest",
  keywords: [
    "entraînement foot jeune",
    "programme football personnalisé",
    "préparation physique football ado",
    "exercices foot maison",
    "progresser au foot 13 17 ans",
    "travail individuel footballeur",
    "s'entraîner seul football",
  ],
  authors: [{ name: "Progressa" }],
  category: "sports",
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Progressa",
    locale: "fr_FR",
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0C0D0F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#E12A3A",
          colorBackground: "#16181b",
          colorForeground: "#ece8df",
          colorInput: "#0c0d0f",
          colorInputForeground: "#ece8df",
        },
      }}
    >
      <html lang="fr" className={`${display.variable} ${condensed.variable} ${body.variable}`}>
        <body>
          <PostHogProvider>{children}</PostHogProvider>
          {/* Web Analytics Vercel : mesure TOUT le trafic (toutes sources : TikTok,
              Google, Instagram, direct…), sans cookie ni donnée perso (RGPD-friendly).
              Visible sur vercel.com → onglet Analytics. */}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
