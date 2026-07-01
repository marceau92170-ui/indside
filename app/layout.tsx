import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/Providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ImmoMail — Agent IA email pour agences immobilières",
  description:
    "Classifiez, répondez et gérez vos emails immobiliers automatiquement grâce à l'IA. Vous validez en un clic, rien ne part sans vous.",
}

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="bg-ink-950 text-zinc-50 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
