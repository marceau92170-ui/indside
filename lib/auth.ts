import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { seedDefaultRules } from "@/lib/automation/defaults"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      agencyId: string
      email?: string | null
      name?: string | null
      image?: string | null
    }
  }
  interface User {
    agencyId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    agencyId: string
  }
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Mot de passe", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email et mot de passe requis")
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email.toLowerCase() },
      })

      if (!user || !user.password) {
        throw new Error("Identifiants invalides")
      }

      const isValid = await bcrypt.compare(credentials.password, user.password)
      if (!isValid) {
        throw new Error("Identifiants invalides")
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        agencyId: user.agencyId,
      }
    },
  }),
]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  )
}

/**
 * Garantit qu'un utilisateur possède une agence (et ses règles par défaut).
 * Utilisé pour les comptes créés via Google sign-in, qui arrivent sans agence.
 * Retourne l'agencyId résolu.
 */
async function ensureAgencyForUser(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user?.agencyId) return user.agencyId

  const agency = await prisma.agency.create({
    data: { name: user?.name ? `Agence ${user.name}` : "Mon agence" },
  })
  await prisma.user.update({
    where: { id: userId },
    data: { agencyId: agency.id },
  })
  await seedDefaultRules(agency.id)
  return agency.id
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  // JWT obligatoire : CredentialsProvider ne fonctionne pas avec les sessions
  // "database" dans NextAuth v4. Les comptes Google restent persistés via l'adapter.
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // À la connexion, `user` est présent : on mémorise id + agencyId
      if (user) {
        token.id = user.id
        const uid = user.id as string
        const agencyId = (user as { agencyId?: string | null }).agencyId
        token.agencyId = agencyId || (await ensureAgencyForUser(uid))
      }
      // Filet de sécurité : si jamais l'agencyId manque encore, on le résout
      if (token.id && !token.agencyId) {
        token.agencyId = await ensureAgencyForUser(token.id as string)
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.agencyId = token.agencyId as string
      }
      return session
    },
  },
}
