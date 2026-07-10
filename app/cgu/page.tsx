import Link from "next/link";

export const metadata = { title: "CGU — Progressa" };

export default function CGUPage() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8">
      <Link href="/" className="font-display text-lg tracking-wider">PROGRESSA</Link>
      <h1 className="mb-6 mt-4 font-condensed text-3xl font-bold uppercase">
        Conditions générales d&apos;utilisation
      </h1>
      <div className="space-y-5 text-sm leading-relaxed text-muted [&_h2]:font-condensed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:uppercase [&_h2]:text-chalk">
        <section>
          <h2>1. Le service</h2>
          <p>
            Progressa propose des programmes d&apos;entraînement de football individuels destinés
            aux joueurs de 13 à 17 ans, en complément de leur pratique en club. Les séances sont
            composées à partir d&apos;une bibliothèque d&apos;exercices validés, adaptés à
            l&apos;âge du joueur.
          </p>
        </section>
        <section>
          <h2>2. Compte et âge</h2>
          <p>
            Le service s&apos;adresse aux joueurs des catégories U14 à U18. Pour les utilisateurs
            de moins de 15 ans, le consentement d&apos;un parent ou tuteur légal est requis à
            l&apos;inscription, conformément à la loi française (art. 45 de la loi Informatique et
            Libertés).
          </p>
        </section>
        <section>
          <h2>3. Abonnement Premium</h2>
          <p>
            L&apos;abonnement Premium (8,99 €/mois ou 59 €/an) doit être souscrit par un parent ou
            tuteur légal. Il est résiliable à tout moment depuis l&apos;application (portail de
            gestion), la résiliation prenant effet à la fin de la période en cours. Le paiement est
            traité par Stripe.
          </p>
        </section>
        <section>
          <h2>4. Santé et sécurité</h2>
          <p>
            Les programmes sont conçus avec des règles strictes par âge (aucune charge externe ni
            pliométrie intensive avant 15 ans). Ils ne remplacent pas un avis médical : en cas de
            douleur, de blessure ou de condition médicale particulière, arrête l&apos;exercice et
            consulte un professionnel de santé. La pratique se fait sous la responsabilité du
            joueur et de ses représentants légaux.
          </p>
        </section>
        <section>
          <h2>5. Données personnelles</h2>
          <p>
            Voir la <Link href="/confidentialite" className="text-glow underline">politique de confidentialité</Link>.
            Le compte et toutes les données associées peuvent être supprimés à tout moment depuis
            les réglages.
          </p>
        </section>
        <section>
          <h2>6. Contact</h2>
          <p>Pour toute question : via l&apos;adresse e-mail indiquée sur la page d&apos;accueil.</p>
        </section>
      </div>
    </main>
  );
}
