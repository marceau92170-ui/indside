import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/Providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ImmoMail — Agent IA email pour agences immobilières",
  description:
    "Classifiez, répondez et gérez vos emails immobiliers automatiquement grâce à l'IA.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
