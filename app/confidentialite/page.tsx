import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-xl font-bold text-blue-600">
            ImmoMail
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 prose-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Politique de confidentialité
        </h1>
        <p className="text-sm text-gray-400 mb-8">Dernière mise à jour : 2026</p>

        <div className="space-y-8 text-gray-700 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Responsable du traitement</h2>
            <p>
              ImmoMail propose un service d&apos;assistance email par intelligence
              artificielle destiné aux agences immobilières. Le présent document décrit
              la manière dont les données sont collectées, traitées et protégées,
              conformément au Règlement Général sur la Protection des Données (RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Données collectées</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Données de compte : nom, email professionnel, nom de l&apos;agence.</li>
              <li>
                Jetons d&apos;accès à votre boîte email (Gmail), stockés{" "}
                <strong>chiffrés</strong> et utilisés uniquement pour traiter vos emails.
              </li>
              <li>
                Métadonnées et contenu des emails entrants, le temps nécessaire à leur
                classification et à la génération de réponses.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Hébergement et localisation</h2>
            <p>
              Les données sont hébergées au sein de l&apos;Union Européenne. Les
              traitements par intelligence artificielle sont réalisés via des
              prestataires conformes au RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Minimisation et conservation</h2>
            <p>
              Nous minimisons la conservation du corps des emails : il n&apos;est conservé
              que le temps nécessaire au traitement. Les données de compte sont conservées
              pendant la durée de votre abonnement et supprimées à la résiliation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Vos droits</h2>
            <p>
              Vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression
              et de portabilité de vos données. La déconnexion de votre boîte email
              révoque immédiatement notre accès. La résiliation entraîne la suppression
              de vos données.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Sécurité</h2>
            <p>
              Les jetons d&apos;accès sont chiffrés au repos. Les accès aux boîtes email
              utilisent les autorisations minimales nécessaires au fonctionnement du
              service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Contact</h2>
            <p>
              Pour toute question relative à vos données, contactez-nous à l&apos;adresse
              de support indiquée dans votre espace client.
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    </div>
  )
}
