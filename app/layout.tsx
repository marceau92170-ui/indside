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

export const metadata: Metadata = {
  title: "Progressa — Ton préparateur perso",
  description:
    "Programme d'entraînement foot personnalisé pour jeunes joueurs. Généré pour ton poste, ton âge, ton niveau. Séances de 20 à 40 min faisables seul.",
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
