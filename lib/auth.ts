import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

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
    agencyId: string
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
    })
  )
}

export const authOptions: NextAuthOptions = {
  // @ts-expect-error - PrismaAdapter type mismatch between @auth/prisma-adapter and next-auth v4
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.agencyId = (user as { agencyId: string }).agencyId
      }
      return session
    },
  },
}
