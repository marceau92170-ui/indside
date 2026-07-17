import Link from "next/link";
import { LEGAL, isEditorRegistered } from "@/lib/data/legal";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = { title: "Mentions légales — Progressa" };

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8">
      <Link href="/" className="font-display text-lg tracking-wider">PROGRESSA</Link>
      <h1 className="mb-6 mt-4 font-condensed text-3xl font-bold uppercase">Mentions légales</h1>

      <div className="space-y-5 text-sm leading-relaxed text-muted [&_h2]:font-condensed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:uppercase [&_h2]:text-chalk">
        <section>
          <h2>Éditeur du site</h2>
          <p>
            Le site {LEGAL.siteName} ({LEGAL.siteUrl}) est édité par&nbsp;:
          </p>
          <ul className="mt-2 space-y-1">
            {LEGAL.editorName ? (
              <li>Nom : {LEGAL.editorName}</li>
            ) : (
              <li>Éditeur : {LEGAL.siteName}</li>
            )}
            <li>Statut : {LEGAL.editorStatus}</li>
            {LEGAL.siren ? (
              <li>SIREN : {LEGAL.siren}</li>
            ) : (
              <li>Immatriculation : en cours (SIREN publié dès obtention).</li>
            )}
            {LEGAL.address && <li>Adresse : {LEGAL.address}</li>}
            <li>{LEGAL.vatNote}</li>
            <li>
              Contact :{" "}
              <a href={`mailto:${LEGAL.contactEmail}`} className="text-glow underline">
                {LEGAL.contactEmail}
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2>Directeur de la publication</h2>
          <p>{LEGAL.editorName || `Le représentant légal de ${LEGAL.siteName}.`}</p>
        </section>

        <section>
          <h2>Hébergeur</h2>
          <p>
            {LEGAL.hostName}
            <br />
            {LEGAL.hostAddress}
            <br />
            <a href={LEGAL.hostUrl} className="text-glow underline" target="_blank" rel="noreferrer">
              {LEGAL.hostUrl}
            </a>
          </p>
        </section>

        <section>
          <h2>Paiement</h2>
          <p>
            Les paiements des abonnements sont traités par {LEGAL.paymentProvider}. {LEGAL.siteName}{" "}
            ne stocke aucune donnée bancaire.
          </p>
        </section>

        <section>
          <h2>Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des contenus du site (textes, exercices, illustrations, marque
            « {LEGAL.siteName} ») est protégé. Toute reproduction sans autorisation est interdite.
          </p>
        </section>

        <section>
          <h2>Contact & réclamation</h2>
          <p>
            Pour toute question ou réclamation :{" "}
            <a href={`mailto:${LEGAL.contactEmail}`} className="text-glow underline">
              {LEGAL.contactEmail}
            </a>
            . Voir aussi les{" "}
            <Link href="/cgv" className="text-glow underline">CGV</Link>, les{" "}
            <Link href="/cgu" className="text-glow underline">CGU</Link> et la{" "}
            <Link href="/confidentialite" className="text-glow underline">politique de confidentialité</Link>.
          </p>
        </section>

        {!isEditorRegistered && (
          <p className="rounded-lg border border-line p-3 text-xs">
            Les informations d&apos;immatriculation sont en cours de publication et seront
            complétées ici dès leur obtention.
          </p>
        )}
      </div>

      <SiteFooter />
    </main>
  );
}
