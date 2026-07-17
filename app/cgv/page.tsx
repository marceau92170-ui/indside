import Link from "next/link";
import { LEGAL } from "@/lib/data/legal";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = { title: "CGV — Progressa" };

export default function CGVPage() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8">
      <Link href="/" className="font-display text-lg tracking-wider">PROGRESSA</Link>
      <h1 className="mb-6 mt-4 font-condensed text-3xl font-bold uppercase">
        Conditions générales de vente
      </h1>

      <div className="space-y-5 text-sm leading-relaxed text-muted [&_h2]:font-condensed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:uppercase [&_h2]:text-chalk">
        <section>
          <h2>1. Objet</h2>
          <p>
            Les présentes conditions régissent la vente de l&apos;abonnement Premium du service{" "}
            {LEGAL.siteName} ({LEGAL.siteUrl}), édité par l&apos;éditeur indiqué dans les{" "}
            <Link href="/mentions-legales" className="text-glow underline">mentions légales</Link>.
          </p>
        </section>

        <section>
          <h2>2. Produit et prix</h2>
          <p>
            L&apos;abonnement Premium donne accès à l&apos;ensemble des fonctionnalités (programme
            personnalisé, bibliothèque complète, tests et suivi). Tarifs, toutes taxes comprises :
          </p>
          <ul className="mt-2 space-y-1">
            <li>Formule mensuelle : {LEGAL.priceMonthly}</li>
            <li>Formule annuelle : {LEGAL.priceAnnual}</li>
          </ul>
          <p className="mt-2">
            L&apos;abonnement d&apos;un joueur mineur est souscrit par un parent ou tuteur légal.
          </p>
        </section>

        <section>
          <h2>3. Paiement</h2>
          <p>
            Le paiement s&apos;effectue en ligne par carte bancaire via {LEGAL.paymentProvider}.{" "}
            {LEGAL.siteName} ne conserve aucune donnée bancaire. L&apos;abonnement est reconduit
            automatiquement à échéance, au même tarif, jusqu&apos;à résiliation.
          </p>
        </section>

        <section>
          <h2>4. Résiliation</h2>
          <p>
            L&apos;abonnement est résiliable à tout moment, en un clic, depuis l&apos;espace de
            gestion de l&apos;application. La résiliation prend effet à la fin de la période déjà
            payée ; aucun prélèvement supplémentaire n&apos;intervient ensuite. Les périodes déjà
            entamées ne sont pas remboursées, sauf disposition légale contraire.
          </p>
        </section>

        <section>
          <h2>5. Droit de rétractation</h2>
          <p>
            Conformément à l&apos;article L221-18 du Code de la consommation, tu disposes d&apos;un
            délai de 14 jours pour te rétracter. Toutefois, en demandant l&apos;accès immédiat au
            contenu numérique, tu acceptes de renoncer à ce droit une fois le service commencé
            (article L221-28). En cas de doute, contacte-nous : nous traitons chaque demande avec
            bon sens.
          </p>
        </section>

        <section>
          <h2>6. Service et responsabilité</h2>
          <p>
            Les programmes sont des contenus d&apos;entraînement à visée pédagogique et ne
            remplacent pas un avis médical. En cas de douleur ou de blessure, arrête et consulte un
            professionnel de santé. Voir les{" "}
            <Link href="/cgu" className="text-glow underline">CGU</Link>.
          </p>
        </section>

        <section>
          <h2>7. Contact & médiation</h2>
          <p>
            Pour toute réclamation :{" "}
            <a href={`mailto:${LEGAL.contactEmail}`} className="text-glow underline">
              {LEGAL.contactEmail}
            </a>
            . À défaut de solution amiable, le consommateur peut recourir gratuitement à un
            médiateur de la consommation.
          </p>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
