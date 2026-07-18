import { cache } from "react";
import type { NextAuthOptions } from "next-auth";
import type { Provider } from "next-auth/providers/index";
import { getServerSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { magicLinkEmail, sendEmail } from "@/lib/email/resend";

// La connexion Google n'est active que si les identifiants sont configurés,
// sinon l'app fonctionne avec le lien e-mail seul.
export const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

const providers: Provider[] = [
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
];

if (googleEnabled) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Relie automatiquement un compte Google à un compte e-mail existant
      // portant la même adresse (les deux fournisseurs vérifient l'e-mail).
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: { strategy: "database" },
  pages: {
    signIn: "/connexion",
    verifyRequest: "/connexion/verifier",
  },
  providers,
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as { id?: string }).id = user.id;
      }
      return session;
    },
  },
};

// cache() = mémorisé le temps d'UNE requête serveur. Le layout ET la page
// appellent auth()/currentUser() : sans cache, ça faisait 2 décodages de session
// + 2 requêtes base identiques par navigation. Avec cache, une seule fois.
export const auth = cache(() => getServerSession(authOptions));

// Récupère l'utilisateur connecté avec profil + abonnement, ou null.
export const currentUser = cache(async () => {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  return prisma.user.findUnique({
    where: { email },
    include: { profile: true, subscription: true },
  });
});
