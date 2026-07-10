import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { magicLinkEmail, sendEmail } from "@/lib/email/resend";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: { strategy: "database" },
  pages: {
    signIn: "/connexion",
    verifyRequest: "/connexion/verifier",
  },
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM || "Progressa <onboarding@resend.dev>",
      maxAge: 24 * 60 * 60,
      async sendVerificationRequest({ identifier, url }) {
        if (!process.env.RESEND_API_KEY) {
          // Dev sans Resend : le lien est loggé côté serveur.
          console.log(`[magic link] ${identifier} → ${url}`);
          return;
        }
        await sendEmail({
          to: identifier,
          subject: "Ton lien de connexion Progressa",
          html: magicLinkEmail(url),
        });
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as { id?: string }).id = user.id;
      }
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}

// Récupère l'utilisateur connecté avec profil + abonnement, ou null.
export async function currentUser() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  return prisma.user.findUnique({
    where: { email },
    include: { profile: true, subscription: true },
  });
}
