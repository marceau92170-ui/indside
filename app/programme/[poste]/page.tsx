import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSITIONS_SEO, positionSeoBySlug } from "@/lib/data/positions-seo";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return POSITIONS_SEO.map((p) => ({ poste: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ poste: string }>;
}): Promise<Metadata> {
  const { poste } = await params;
  const p = positionSeoBySlug(poste);
  if (!p) return {};
  return {
    title: `Programme d'entraînement de foot pour ${p.label.toLowerCase()}`,
    description: `${p.intro} Programme perso, séances à faire seul, exercices ciblés pour ${p.label.toLowerCase()}.`.slice(
      0,
      158,
    ),
    alternates: { canonical: `/programme/${p.slug}` },
    openGraph: {
      title: `Entraînement foot pour ${p.label.toLowerCase()} — Progressa`,
      description: p.intro,
      url: `${SITE_URL}/programme/${p.slug}`,
      type: "article",
    },
  };
}

export default async function ProgrammePostePage({
  params,
}: {
  params: Promise<{ poste: string }>;
}) {
  const { poste } = await params;
  const p = positionSeoBySlug(poste);
  if (!p) notFound();

  const others = POSITIONS_SEO.filter((x) => x.slug !== p.slug);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: `Programme ${p.label}`, item: `${SITE_URL}/programme/${p.slug}` },
    ],
  };

  return (
    <main className="pitch-bg min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <div className="mx-auto w-full max-w-2xl px-4 pb-24">
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
          <Link href="/" className="hover:text-glow">Accueil</Link> <span className="text-line">/</span> Programme{" "}
          {p.label}
        </nav>

        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-glow">
            Entraînement par poste
          </p>
          <h1 className="mt-2 font-condensed text-3xl font-bold uppercase leading-tight sm:text-4xl">
            Programme de foot pour {p.label.toLowerCase()}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{p.intro}</p>
          <div className="mt-6">
            <Link
              href="/onboarding"
              className="inline-flex rounded-xl bg-glow px-6 py-3 font-condensed font-bold uppercase tracking-wide text-white shadow-lg shadow-glow/25 transition-all hover:bg-[#f13d4d]"
            >
              Créer mon programme {p.label.toLowerCase()} gratuit
            </Link>
            <p className="mt-2 text-xs text-muted">90 secondes · adapté à ton âge et ton niveau · sans carte</p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-3 font-condensed text-2xl font-bold uppercase">
            Les qualités à travailler
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {p.qualities.map((q) => (
              <div key={q.title} className="rounded-card border border-line bg-surface p-4">
                <p className="font-condensed text-lg font-bold uppercase leading-tight">{q.title}</p>
                <p className="mt-1 text-sm text-muted">{q.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-card border border-grass bg-grass/15 p-5">
          <h2 className="font-condensed text-xl font-bold uppercase">
            Ce que tu travailles seul, entre les entraînements
          </h2>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            {p.focus.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">
            Avant 15 ans : aucune charge externe ni pliométrie intensive — les intensités s&apos;adaptent à ta
            catégorie.
          </p>
        </section>

        <div className="mt-10 rounded-card border border-glow/30 bg-surface p-5 text-center">
          <h2 className="font-condensed text-xl font-bold uppercase">
            Un programme construit pour ton poste
          </h2>
          <p className="mt-1 text-sm text-muted">
            Progressa génère un programme hebdo perso ({p.label.toLowerCase()}, ton âge, ton niveau), avec des
            séances de 20 à 40 min à faire seul. Gratuit pour commencer.
          </p>
          <Link
            href="/onboarding"
            className="mt-4 inline-flex rounded-xl bg-glow px-6 py-3 font-condensed font-bold uppercase tracking-wide text-white shadow-lg shadow-glow/25 transition-all hover:bg-[#f13d4d]"
          >
            Créer mon programme gratuit
          </Link>
          <p className="mt-3 text-xs text-muted">
            Voir aussi la{" "}
            <Link href="/exercices" className="underline hover:text-glow">
              bibliothèque des 60 exercices
            </Link>
          </p>
        </div>

        <section className="mt-10">
          <h2 className="mb-3 font-condensed text-xl font-bold uppercase">Autres postes</h2>
          <div className="flex flex-wrap gap-2">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/programme/${o.slug}`}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-chalk hover:border-glow hover:text-glow"
              >
                {o.label}
              </Link>
            ))}
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
