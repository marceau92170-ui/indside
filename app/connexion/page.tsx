import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

// Connexion / création de compte via Clerk (Google + email code).
// Le nouveau flux : le joueur arrive ici après avoir répondu aux 8 questions
// (« Crée ton compte pour recevoir ton programme »). Après connexion → /semaine,
// puis le layout redirige vers /onboarding pour finaliser s'il n'a pas de profil.
export default function ConnexionPage() {
  return (
    <main className="pitch-bg flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-6 block text-center font-display text-3xl tracking-wider text-chalk">
        PROGRESSA
      </Link>
      <SignIn
        routing="hash"
        fallbackRedirectUrl="/semaine"
        signUpFallbackRedirectUrl="/semaine"
      />
      <p className="mt-6 max-w-xs text-center text-xs text-muted">
        Connexion en un geste, sans mot de passe. Gratuit, aucune carte demandée.
      </p>
    </main>
  );
}
