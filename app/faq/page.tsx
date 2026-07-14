import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ — Questions fréquentes | Progressa",
  description:
    "Comment marche Progressa, à qui s'adresse l'app, prix, sécurité des mineurs, résiliation, données personnelles. Toutes les réponses sur l'app d'entraînement foot personnalisé.",
  alternates: { canonical: "/faq" },
};

type QA = { q: string; a: string };

const FAQ: QA[] = [
  {
    q: "C'est quoi Progressa ?",
    a: "Une application d'entraînement de football personnalisé pour les jeunes joueurs amateurs de 13 à 17 ans. Chaque semaine, elle génère un programme individuel adapté à ton poste, ton âge, ton niveau et ton calendrier de club, à faire seul entre tes entraînements — à la maison, au city ou dans une petite cour.",
  },
  {
    q: "À qui s'adresse l'application ?",
    a: "Aux joueurs et joueuses de 13 à 17 ans (catégories U14 à U18) qui veulent progresser en plus de leurs entraînements en club. Les séances sont conçues selon les standards de préparation physique des jeunes : avant 15 ans, aucune charge externe ni pliométrie intensive.",
  },
  {
    q: "Les exercices sont-ils fiables et sans danger ?",
    a: "Oui. Tous les programmes sont composés uniquement à partir d'une bibliothèque de 60 exercices validés — l'application n'invente jamais un exercice. Chaque exercice est expliqué pas à pas, avec les erreurs à éviter et une illustration animée du mouvement. Les intensités sont adaptées à ta catégorie d'âge.",
  },
  {
    q: "Combien ça coûte ?",
    a: "L'inscription est gratuite : tu as accès à une séance générique par semaine et à 10 exercices. La formule Premium coûte 8,99 € par mois ou 59 € par an, et débloque le programme complet personnalisé, l'adaptation chaque semaine, les tests de progression, la carte joueur et les conseils nutrition.",
  },
  {
    q: "Comment se génère le programme ?",
    a: "Tu réponds à 8 questions (poste, catégorie, niveau, gabarit, matériel disponible, jour de match, point faible), et le programme se construit à partir de la bibliothèque validée, jamais la veille d'un match. Tu notes chaque séance, et la semaine suivante s'ajuste selon tes retours.",
  },
  {
    q: "Faut-il du matériel ?",
    a: "Non, le strict minimum suffit : un ballon et un mur pour la plupart des séances. Certains exercices se font au poids du corps sans rien. Si tu ne peux pas sortir, un bouton adapte la séance pour un espace réduit (balcon, hall, petite cour).",
  },
  {
    q: "Mon enfant a moins de 15 ans, c'est adapté ?",
    a: "Oui, et c'est encadré : un consentement parental est demandé à l'inscription pour les moins de 15 ans. Les séances excluent automatiquement toute charge externe et toute pliométrie intensive avant 15 ans. L'abonnement se souscrit par un parent ou tuteur légal.",
  },
  {
    q: "Comment fonctionne le suivi de la progression ?",
    a: "Quatre tests auto-mesurés (jonglage max, navette 5×10 m, gainage planche, détente verticale) sont proposés toutes les 4 semaines, avec des graphiques d'évolution. Tu peux aussi tenir un carnet de match et un suivi de forme quotidien.",
  },
  {
    q: "Puis-je résilier facilement ?",
    a: "Oui, l'abonnement Premium est résiliable à tout moment, en 1 clic, directement depuis l'application. Aucun engagement de durée.",
  },
  {
    q: "Que faites-vous de mes données ?",
    a: "Le strict nécessaire au fonctionnement de l'app, et aucun tracking publicitaire. Les données de mineurs sont protégées, et la suppression du compte (avec toutes les données) se fait en 1 clic. Voir la page Confidentialité pour le détail.",
  },
  {
    q: "L'app remplace-t-elle un entraîneur ou un club ?",
    a: "Non, elle vient en complément. Progressa t'aide à travailler entre les séances de ton club pour combler l'écart avec ceux qui s'entraînent tous les jours. Le club, le collectif et l'encadrement restent essentiels.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main className="pitch-bg min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto w-full max-w-lg px-4 pb-20">
        <header className="flex items-center justify-between py-5">
          <Link href="/" className="font-display text-xl tracking-wider">
            PROGRESSA
          </Link>
          <Link
            href="/connexion"
            className="rounded-full border border-line px-4 py-1.5 text-sm font-semibold text-chalk hover:border-glow hover:text-glow"
          >
            Connexion
          </Link>
        </header>

        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-glow">
          On répond à tout
        </p>
        <h1 className="mt-1 font-condensed text-4xl font-bold uppercase leading-tight">
          Questions fréquentes
        </h1>
        <p className="mt-2 text-sm text-muted">
          Tout ce qu&apos;un joueur — ou un parent — se demande avant de commencer.
        </p>

        <div className="mt-8 space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-card border border-line bg-surface p-4 [&_summary]:cursor-pointer"
            >
              <summary className="flex list-none items-center justify-between gap-3 font-condensed text-lg font-bold leading-tight">
                {item.q}
                <span className="shrink-0 text-glow transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-10 rounded-card border border-glow/30 bg-surface p-5 text-center">
          <h2 className="font-condensed text-xl font-bold uppercase">Prêt à t&apos;y mettre ?</h2>
          <p className="mt-1 text-sm text-muted">90 secondes pour répondre. Aucune carte demandée.</p>
          <Link
            href="/connexion"
            className="mt-4 inline-flex rounded-lg bg-glow px-6 py-3 font-condensed font-bold uppercase tracking-wide text-white hover:bg-[#f13d4d]"
          >
            Créer mon programme gratuit
          </Link>
        </div>

        <footer className="mt-12 border-t border-line pt-6 text-center text-xs text-muted">
          <p>
            <Link href="/" className="underline">Accueil</Link> ·{" "}
            <Link href="/cgu" className="underline">CGU</Link> ·{" "}
            <Link href="/confidentialite" className="underline">Confidentialité</Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
