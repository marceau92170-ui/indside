import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_EXERCISES, CATEGORY_INFO } from "@/lib/data/exercises";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_EXERCISES.map((e) => ({ slug: e.slug }));
}

const EQUIPMENT_LABEL: Record<string, string> = {
  ballon: "un ballon",
  mur: "un mur",
  plots: "des plots (ou repères au sol)",
  elastiques: "un élastique",
  aucun: "aucun matériel",
};

function findExercise(slug: string) {
  return ALL_EXERCISES.find((e) => e.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ex = findExercise(slug);
  if (!ex) return {};
  const cat = CATEGORY_INFO[ex.category].label.toLowerCase();
  const desc = `${ex.description} Exercice de football (${cat}) à faire seul, expliqué pas à pas avec les erreurs à éviter.`;
  return {
    title: `${ex.name} — exercice de foot expliqué`,
    description: desc.length > 158 ? desc.slice(0, 155) + "…" : desc,
    alternates: { canonical: `/exercices/${ex.slug}` },
    openGraph: {
      title: `${ex.name} — exercice de football`,
      description: ex.description,
      url: `${SITE_URL}/exercices/${ex.slug}`,
      type: "article",
    },
  };
}

export default async function ExercicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ex = findExercise(slug);
  if (!ex) notFound();

  const cat = CATEGORY_INFO[ex.category];
  const equipment =
    ex.equipment.length > 0
      ? ex.equipment.map((e) => EQUIPMENT_LABEL[e] ?? e).join(", ")
      : "aucun matériel";

  // Exercices proches (même catégorie) pour le maillage interne.
  const related = ALL_EXERCISES.filter(
    (e) => e.category === ex.category && e.slug !== ex.slug,
  ).slice(0, 4);

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: ex.name,
    description: ex.description,
    totalTime: `PT${ex.durationMin}M`,
    tool: ex.equipment
      .filter((e) => e !== "aucun")
      .map((e) => ({ "@type": "HowToTool", name: EQUIPMENT_LABEL[e] ?? e })),
    step: ex.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: s,
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Exercices", item: `${SITE_URL}/exercices` },
      { "@type": "ListItem", position: 3, name: ex.name, item: `${SITE_URL}/exercices/${ex.slug}` },
    ],
  };

  return (
    <main className="pitch-bg min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
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
          <Link href="/" className="hover:text-glow">Accueil</Link> <span className="text-line">/</span>{" "}
          <Link href="/exercices" className="hover:text-glow">Exercices</Link>{" "}
          <span className="text-line">/</span> {ex.name}
        </nav>

        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-glow">
          {cat.emoji} {cat.label}
        </p>
        <h1 className="mt-1 flex items-start gap-2 font-condensed text-3xl font-bold uppercase leading-tight sm:text-4xl">
          <span>{ex.emoji}</span>
          <span>{ex.name}</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{ex.description}</p>

        <dl className="mt-5 grid grid-cols-3 divide-x divide-line rounded-card border border-line bg-surface py-3 text-center">
          <div className="px-2">
            <dt className="text-[10px] uppercase tracking-wide text-muted">Durée</dt>
            <dd className="font-condensed text-lg font-bold text-glow">{ex.durationMin} min</dd>
          </div>
          <div className="px-2">
            <dt className="text-[10px] uppercase tracking-wide text-muted">Matériel</dt>
            <dd className="font-condensed text-sm font-bold leading-tight text-chalk">
              {ex.equipment.length ? ex.equipment.join(" + ") : "aucun"}
            </dd>
          </div>
          <div className="px-2">
            <dt className="text-[10px] uppercase tracking-wide text-muted">À partir de</dt>
            <dd className="font-condensed text-lg font-bold text-chalk">{ex.minAge} ans</dd>
          </div>
        </dl>

        <section className="mt-8">
          <h2 className="mb-3 font-condensed text-2xl font-bold uppercase">Comment faire</h2>
          <ol className="space-y-3">
            {ex.steps.map((s, i) => (
              <li key={i} className="flex gap-3 rounded-card border border-line bg-surface p-3">
                <span className="font-condensed text-2xl font-bold leading-none text-glow">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-chalk">{s}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 rounded-card border border-grass bg-grass/15 p-4">
          <h2 className="font-condensed text-lg font-bold uppercase">Les erreurs à éviter</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">{ex.mistakes}</p>
        </section>

        {ex.breathing && (
          <section className="mt-4 rounded-card border border-line bg-surface p-4">
            <h2 className="font-condensed text-lg font-bold uppercase">Respiration</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{ex.breathing}</p>
          </section>
        )}

        <section className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-card border border-line bg-surface p-4">
            <h2 className="font-condensed text-base font-bold uppercase text-chalk">Plus facile</h2>
            <p className="mt-1 text-sm text-muted">{ex.variantEasy}</p>
          </div>
          <div className="rounded-card border border-line bg-surface p-4">
            <h2 className="font-condensed text-base font-bold uppercase text-chalk">Plus dur</h2>
            <p className="mt-1 text-sm text-muted">{ex.variantHard}</p>
          </div>
        </section>

        <p className="mt-5 text-sm text-muted">
          Matériel nécessaire : <span className="font-semibold text-chalk">{equipment}</span>.
          {ex.smallSpaceFriendly
            ? " Faisable dans un espace réduit (balcon, hall, petite cour)."
            : " Prévois un peu d'espace pour cet exercice."}
        </p>

        <div className="mt-10 rounded-card border border-glow/30 bg-surface p-5 text-center">
          <h2 className="font-condensed text-xl font-bold uppercase">
            Intègre cet exercice à ton programme
          </h2>
          <p className="mt-1 text-sm text-muted">
            Progressa te construit un programme hebdo perso (ton poste, ton niveau) à partir de 60
            exercices comme celui-ci. Gratuit, sans carte.
          </p>
          <Link
            href="/onboarding"
            className="mt-4 inline-flex rounded-xl bg-glow px-6 py-3 font-condensed font-bold uppercase tracking-wide text-white shadow-lg shadow-glow/25 transition-all hover:bg-[#f13d4d]"
          >
            Créer mon programme gratuit
          </Link>
        </div>

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 font-condensed text-xl font-bold uppercase">
              Autres exercices · {cat.label}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {related.map((e) => (
                <Link
                  key={e.slug}
                  href={`/exercices/${e.slug}`}
                  className="group flex items-center gap-3 rounded-card border border-line bg-surface p-3 hover:border-glow"
                >
                  <span className="text-xl leading-none">{e.emoji}</span>
                  <span className="font-condensed font-bold uppercase leading-tight text-chalk group-hover:text-glow">
                    {e.name}
                  </span>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-sm">
              <Link href="/exercices" className="font-semibold text-glow underline">
                ← Voir les 60 exercices
              </Link>
            </p>
          </section>
        )}

        <SiteFooter />
      </div>
    </main>
  );
}
