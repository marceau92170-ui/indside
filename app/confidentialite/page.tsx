import Link from "next/link";

export const metadata = { title: "Confidentialité — Progressa" };

export default function ConfidentialitePage() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8">
      <Link href="/" className="font-display text-lg tracking-wider">PROGRESSA</Link>
      <h1 className="mb-6 mt-4 font-condensed text-3xl font-bold uppercase">
        Politique de confidentialité
      </h1>
      <div className="space-y-5 text-sm leading-relaxed text-muted [&_h2]:font-condensed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:uppercase [&_h2]:text-chalk">
        <section>
          <h2>Le principe : le minimum</h2>
          <p>
            Progressa collecte uniquement les données nécessaires à la personnalisation du
            programme d&apos;entraînement. Pas de tracking publicitaire, pas de revente de données,
            pas de cookies tiers.
          </p>
        </section>
        <section>
          <h2>Données collectées</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>E-mail (connexion par lien magique, sans mot de passe).</li>
            <li>
              Profil sportif : prénom, année de naissance, poste, niveau, taille/poids, matériel,
              objectif, point faible déclaré.
            </li>
            <li>Activité : séances validées, difficulté ressentie, résultats des tests.</li>
            <li>
              E-mail du parent et date de consentement pour les utilisateurs de moins de 15 ans
              (obligation légale française).
            </li>
            <li>Abonnement : identifiants Stripe (aucune donnée bancaire ne transite par nos serveurs).</li>
          </ul>
        </section>
        <section>
          <h2>Utilisation</h2>
          <p>
            Ces données servent exclusivement à : générer et adapter le programme hebdomadaire,
            afficher la progression, envoyer les e-mails de service (lien de connexion, rappel de
            séance, programme prêt), et gérer l&apos;abonnement.
          </p>
        </section>
        <section>
          <h2>Mineurs de moins de 15 ans</h2>
          <p>
            Conformément à la loi française, l&apos;inscription d&apos;un joueur de moins de 15 ans
            requiert le consentement conjoint d&apos;un titulaire de l&apos;autorité parentale,
            recueilli à l&apos;inscription (case à cocher + e-mail du parent).
          </p>
        </section>
        <section>
          <h2>Sous-traitants</h2>
          <p>
            Hébergement : Vercel. Base de données : Postgres (Neon). E-mails : Resend. Paiement :
            Stripe. Génération des programmes : API Anthropic (le prénom et le profil sportif sont
            transmis pour composer les séances ; jamais l&apos;e-mail).
          </p>
        </section>
        <section>
          <h2>Tes droits</h2>
          <p>
            Accès, rectification, effacement : le profil est modifiable dans les réglages, et la
            suppression du compte (immédiate et définitive) est disponible en un clic dans{" "}
            <span className="text-chalk">Réglages → Compte</span>. Pour toute autre demande,
            contacte-nous.
          </p>
        </section>
      </div>
    </main>
  );
}
