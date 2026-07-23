import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { LEGAL } from "@/lib/data/legal";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Progressa pour les clubs — vos joueurs progressent, votre caisse aussi",
  description:
    "Un partenariat gratuit pour votre club de foot : vos joueurs s'entraînent seuls entre les séances avec un programme perso, les familles bénéficient d'un tarif club, et une commission revient à la caisse du club (goûters, tournois, matériel). Sans engagement.",
  alternates: { canonical: "/clubs" },
  openGraph: {
    title: "Progressa pour les clubs",
    description:
      "Vos joueurs progressent, votre club gagne de l'argent pour ses projets, ça ne vous coûte rien.",
    url: `${SITE_URL}/clubs`,
    type: "website",
  },
};

const mailto = `mailto:${LEGAL.contactEmail}?subject=${encodeURIComponent(
  "Partenariat club — Progressa",
)}&body=${encodeURIComponent(
  "Bonjour,\n\nJe représente le club : \nVille / département : \nNombre de licenciés (catégories jeunes) : \nMon rôle dans le club : \n\nJe souhaite en savoir plus sur le partenariat Progressa.\n\nMerci !",
)}`;

export default function ClubsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: "Progressa pour les clubs",
    description:
      "Partenariat gratuit pour les clubs de football : tarif club pour les familles et commission reversée à la caisse du club.",
    url: `${SITE_URL}/clubs`,
    seller: { "@type": "Organization", name: "Progressa", url: SITE_URL },
    price: "0",
    priceCurrency: "EUR",
  };

  return (
    <main className="pitch-bg min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto w-full max-w-2xl px-4 pb-24">
        {/* header */}
        <header className="flex items-center justify-between py-5">
          <Link href="/" className="font-display text-xl tracking-wider">
            PROGRESSA
          </Link>
          <Link
            href="/connexion"
            className="rounded-lg border border-line bg-surface/40 px-4 py-1.5 text-sm font-semibold text-chalk transition-colors hover:border-glow hover:text-glow"
          >
            Connexion
          </Link>
        </header>

        {/* hero */}
        <section className="pt-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-glow">
            Pour les clubs & académies
          </p>
          <h1 className="mt-2 font-condensed text-4xl font-bold uppercase leading-tight">
            Vos joueurs progressent.
            <br />
            Votre caisse aussi.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
            Progressa donne à vos licenciés un <span className="font-semibold text-chalk">programme d&apos;entraînement perso</span> à faire seuls entre vos séances (technique, physique, prévention des blessures), adapté à leur poste et leur âge. Et pour chaque famille abonnée, <span className="font-semibold text-chalk">une commission revient à la caisse du club</span>.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <a
              href={mailto}
              className="inline-flex rounded-xl bg-glow px-7 py-4 font-condensed text-lg font-bold uppercase tracking-wide text-white shadow-lg shadow-glow/25 transition-all hover:bg-[#f13d4d] hover:-translate-y-px"
            >
              Devenir club partenaire
            </a>
            <p className="text-xs text-muted">Gratuit · sans engagement · réponse sous 48 h</p>
          </div>
        </section>

        {/* win-win-win */}
        <section className="mt-12 grid gap-3 sm:grid-cols-3">
          {[
            ["⚽", "Vos joueurs", "Ils s'entraînent entre les séances et progressent — moins de blessures, plus de niveau."],
            ["💰", "Votre club", "Une commission par famille abonnée pour financer goûters, tournois, matériel."],
            ["🆓", "Votre budget", "Zéro coût, zéro engagement. Le club ne paie rien, jamais."],
          ].map(([emoji, title, desc]) => (
            <div key={title} className="rounded-card border border-line bg-surface p-4 text-center">
              <div className="text-3xl">{emoji}</div>
              <p className="mt-2 font-condensed text-lg font-bold uppercase">{title}</p>
              <p className="mt-1 text-sm text-muted">{desc}</p>
            </div>
          ))}
        </section>

        {/* comment ça marche */}
        <section className="mt-12 space-y-3">
          <h2 className="font-condensed text-2xl font-bold uppercase">Comment ça marche</h2>
          {[
            ["1", "Le club recommande", "On vous donne un lien dédié à votre club, à partager à vos familles (groupe d'équipe, réunion de rentrée…)."],
            ["2", "Les familles s'abonnent au tarif club", "Elles bénéficient d'une réduction en passant par votre lien. Chaque famille reste libre de son choix."],
            ["3", "La caisse du club se remplit", "Pour chaque famille abonnée, une commission revient automatiquement au club. Vous suivez tout, en toute transparence."],
          ].map(([n, t, d]) => (
            <div key={n} className="flex gap-4 rounded-card border border-line bg-surface p-4">
              <span className="font-condensed text-3xl font-bold text-glow">{n}</span>
              <div>
                <p className="font-condensed text-lg font-bold uppercase leading-tight">{t}</p>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </div>
            </div>
          ))}
        </section>

        {/* exemple chiffré */}
        <section className="mt-10 rounded-card border border-glow/30 bg-surface p-5 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-glow">Exemple concret</p>
          <p className="mt-2 font-condensed text-2xl font-bold uppercase leading-tight">
            30 familles abonnées
            <br />≈ 210 € pour la caisse
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            De quoi payer les goûters d&apos;une saison, financer un tournoi ou renouveler du matériel —
            sans toucher aux cotisations. Et ça se renouvelle à chaque nouvelle famille.
          </p>
        </section>

        {/* ce que le club reçoit */}
        <section className="mt-10">
          <h2 className="font-condensed text-2xl font-bold uppercase">Ce que reçoit votre club</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>✅ Un <span className="font-semibold text-chalk">lien dédié</span> + un suivi transparent des abonnements générés.</li>
            <li>✅ Une <span className="font-semibold text-chalk">commission reversée</span> à la caisse pour chaque famille abonnée.</li>
            <li>✅ Un <span className="font-semibold text-chalk">accès Premium gratuit pour les coachs</span> (ils voient les exercices et le suivi).</li>
            <li>✅ Des <span className="font-semibold text-chalk">jeunes qui progressent</span> — un vrai plus pour retenir et faire grandir vos licenciés.</li>
          </ul>
        </section>

        {/* cadre / confiance */}
        <section className="mt-10 rounded-card border border-grass bg-grass/15 p-5">
          <h2 className="font-condensed text-xl font-bold uppercase">Un cadre sérieux et sécurisé</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            <li>• Séances conçues selon les standards de préparation physique des jeunes (avant 15 ans : zéro charge, zéro pliométrie intensive).</li>
            <li>• Consentement parental demandé pour les moins de 15 ans ; abonnement souscrit par un parent ou tuteur légal.</li>
            <li>• Données minimales, sans tracking publicitaire. Résiliation en 1 clic.</li>
            <li>• Le club ne vend rien, ne gère aucun paiement — il recommande, c&apos;est tout.</li>
          </ul>
        </section>

        {/* CTA final */}
        <section className="mt-12 text-center">
          <h2 className="font-condensed text-3xl font-bold uppercase leading-tight">
            On en parle ?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Dites-nous le nom de votre club et votre secteur, on vous explique tout en 10 minutes.
          </p>
          <div className="mt-5">
            <a
              href={mailto}
              className="inline-flex rounded-xl bg-glow px-7 py-4 font-condensed text-lg font-bold uppercase tracking-wide text-white shadow-lg shadow-glow/25 transition-all hover:bg-[#f13d4d] hover:-translate-y-px"
            >
              Devenir club partenaire
            </a>
          </div>
          <p className="mt-3 text-xs text-muted">
            Ou écrivez-nous à{" "}
            <a href={`mailto:${LEGAL.contactEmail}`} className="underline">
              {LEGAL.contactEmail}
            </a>
          </p>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
