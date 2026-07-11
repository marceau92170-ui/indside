import type { Metadata, Viewport } from "next";
import { Archivo_Black, Barlow_Condensed, Inter } from "next/font/google";
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

const TITLE = "Progressa — Ton préparateur perso";
const DESCRIPTION =
  "Programme d'entraînement foot personnalisé pour jeunes joueurs. Généré pour ton poste, ton âge, ton niveau. Séances de 20 à 40 min faisables seul.";

export const metadata: Metadata = {
  metadataBase: process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL) : undefined,
  title: TITLE,
  description: DESCRIPTION,
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Progressa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0C0D0F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${condensed.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
