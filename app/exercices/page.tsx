import type { Metadata } from "next";
import Link from "next/link";
import { ALL_EXERCISES, CATEGORY_INFO } from "@/lib/data/exercises";
import type { ExerciseCategory } from "@/lib/data/types";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "60 exercices de football à faire seul, expliqués pas à pas",
  description:
    "Bibliothèque gratuite de 60 exercices de foot à faire seul : technique, renforcement, explosivité, cardio, prévention des blessures et spécifique gardien. Chaque exercice est détaillé étape par étape, avec un ballon et un mur.",
  alternates: { canonical: "/exercices" },
  openGraph: {
    title: "60 exercices de football à faire seul — Progressa",
    description:
      "Technique, renforcement, vitesse, prévention : 60 exercices de foot détaillés pas à pas, à faire seul entre les entraînements.",
    url: `${SITE_URL}/exercices`,
    type: "website",
  },
};

const ORDER: ExerciseCategory[] = [
  "technique",
  "renforcement",
  "explosivite",
  "cardio",
  "prevention",
  "gardien",
];

export default function ExercicesHubPage() {
  const byCategory = ORDER.map((cat) => ({
    cat,
    info: CATEGORY_INFO[cat],
    items: ALL_EXERCISES.filter((e) => e.category === cat),
  })).filter((g) => g.items.length > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Exercices de football à faire seul",
    description:
      "Bibliothèque de 60 exercices de football à faire seul, expliqués pas à pas.",
    url: `${SITE_URL}/exercices`,
    hasPart: ALL_EXERCISES.map((e) => ({
      "@type": "HowTo",
      name: e.name,
      url: `${SITE_URL}/exercices/${e.slug}`,
    })),
  };

  return (
    <main className="pitch-bg min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto w-full max-w-2xl px-4 pb-20">
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

        <nav className="mb-4 text-xs text-muted">
          <Link href="/" className="hover:text-glow">Accueil</Link> <span className="text-line">/</span> Exercices
        </nav>

        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-glow">
          Bibliothèque gratuite
        </p>
        <h1 className="mt-1 font-condensed text-4xl font-bold uppercase leading-tight">
          60 exercices de foot à faire seul
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Technique, renforcement, vitesse, cardio, prévention des blessures et spécifique gardien.
          Chaque exercice est expliqué <span className="font-semibold text-chalk">étape par étape</span>,
          avec les erreurs à éviter — la plupart se font avec un simple ballon et un mur, entre tes
          entraînements de club.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {byCategory.map((g) => (
            <a
              key={g.cat}
              href={`#${g.cat}`}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-chalk hover:border-glow hover:text-glow"
            >
              {g.info.emoji} {g.info.label}
            </a>
          ))}
        </div>

        {byCategory.map((g) => (
          <section key={g.cat} id={g.cat} className="mt-10 scroll-mt-4">
            <h2 className="mb-3 font-condensed text-2xl font-bold uppercase">
              {g.info.emoji} {g.info.label}
              <span className="ml-2 text-sm font-semibold text-muted">{g.items.length} exercices</span>
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {g.items.map((e) => (
                <Link
                  key={e.slug}
                  href={`/exercices/${e.slug}`}
                  className="group flex items-start gap-3 rounded-card border border-line bg-surface p-3 transition-colors hover:border-glow"
                >
                  <span className="text-xl leading-none">{e.emoji}</span>
                  <span className="min-w-0">
                    <span className="block font-condensed font-bold uppercase leading-tight text-chalk group-hover:text-glow">
                      {e.name}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-xs text-muted">
                      {e.description}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-12 rounded-card border border-glow/30 bg-surface p-5 text-center">
          <h2 className="font-condensed text-xl font-bold uppercase">
            Un programme perso avec ces exercices ?
          </h2>
          <p className="mt-1 text-sm text-muted">
            Réponds à 8 questions, Progressa te construit un programme hebdo adapté à ton poste et ton
            niveau. Gratuit, sans carte.
          </p>
          <Link
            href="/onboarding"
            className="mt-4 inline-flex rounded-xl bg-glow px-6 py-3 font-condensed font-bold uppercase tracking-wide text-white shadow-lg shadow-glow/25 transition-all hover:bg-[#f13d4d]"
          >
            Créer mon programme gratuit
          </Link>
        </div>

        <SiteFooter />
      </div>
    </main>
  );
}
