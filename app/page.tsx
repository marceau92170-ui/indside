import Link from "next/link";
import { PlayerCard } from "@/components/PlayerCard";
import { ButtonLink } from "@/components/ui";

// Landing — conversion jeune ET parent. Direction "Nocturne city-stade".
export default function LandingPage() {
  return (
    <main className="pitch-bg min-h-screen">
      <div className="mx-auto w-full max-w-lg px-4 pb-16">
        {/* header */}
        <header className="flex items-center justify-between py-5">
          <span className="font-display text-xl tracking-wider">PROGRESSA</span>
          <Link
            href="/connexion"
            className="rounded-full border border-line px-4 py-1.5 text-sm font-semibold text-chalk hover:border-glow hover:text-glow"
          >
            Connexion
          </Link>
        </header>

        {/* hero */}
        <section className="pt-6 text-center">
          <h1 className="font-condensed text-4xl font-bold uppercase leading-tight">
            Ton programme perso
            <br />
            de préparateur.
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
            Généré pour <span className="font-semibold text-chalk">TON poste</span>,{" "}
            <span className="font-semibold text-chalk">TON âge</span>,{" "}
            <span className="font-semibold text-chalk">TON niveau</span>. Des séances de 20 à 40
            minutes, faisables seul, calées autour de tes entraînements club.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <ButtonLink href="/connexion" size="lg">
              Créer mon programme gratuit
            </ButtonLink>
            <p className="text-xs text-muted">90 secondes pour répondre. Aucune carte demandée.</p>
          </div>

          <div className="mt-10 flex justify-center">
            <PlayerCard
              width={280}
              data={{
                firstName: "Rayan",
                position: "AIL",
                positionLabel: "Ailier",
                category: "U16",
                divisionLabel: "D3 — District des Hauts-de-Seine",
                stats: [
                  { label: "Jonglage", value: "61" },
                  { label: "Navette", value: "11.2" },
                  { label: "Planche", value: "95" },
                  { label: "Détente", value: "43" },
                ],
              }}
            />
          </div>
          <p className="mt-3 text-xs text-muted">
            Ta carte joueur, avec tes vraies stats mesurées.
          </p>
        </section>

        {/* l'écart injuste */}
        <section className="mt-14">
          <h2 className="font-condensed text-2xl font-bold uppercase">
            Lui, il s&apos;entraîne tous les jours.
          </h2>
          <p className="mt-2 text-sm text-muted">
            En centre de formation, c&apos;est entraînement quotidien. Toi, c&apos;est 2 séances
            club par semaine. La différence se joue sur ce que tu fais{" "}
            <span className="font-semibold text-chalk">entre les entraînements</span> — à la maison,
            au city, avec un ballon et un mur.
          </p>
        </section>

        {/* comment ça marche */}
        <section className="mt-10 space-y-3">
          <h2 className="font-condensed text-2xl font-bold uppercase">Comment ça marche</h2>
          {[
            ["1", "Tu réponds à 8 questions", "Poste, catégorie, niveau (ta vraie division), gabarit, matériel, point faible."],
            ["2", "Ton programme se génère", "Des séances composées uniquement d'exercices validés, jamais la veille de match."],
            ["3", "Tu t'entraînes, ça s'adapte", "Tu notes chaque séance. La semaine suivante est ajustée. Tests mesurés toutes les 4 semaines."],
          ].map(([n, title, desc]) => (
            <div key={n} className="flex gap-4 rounded-card border border-line bg-surface p-4">
              <span className="font-condensed text-3xl font-bold text-glow">{n}</span>
              <div>
                <p className="font-condensed text-lg font-bold uppercase leading-tight">{title}</p>
                <p className="mt-1 text-sm text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* anti-bullshit */}
        <section className="mt-10 rounded-card border border-grass bg-grass/15 p-5">
          <h2 className="font-condensed text-xl font-bold uppercase">
            Pas de compléments. Pas de gadgets.
          </h2>
          <p className="mt-1 text-sm text-muted">
            Un ballon, un mur, 25 minutes. Renforcement au poids du corps, technique, vitesse,
            prévention des blessures. Adapté à ta catégorie : avant 15 ans, zéro charge, zéro
            pliométrie intensive — c&apos;est non négociable.
          </p>
        </section>

        {/* preuve */}
        <section className="mt-10">
          <h2 className="font-condensed text-2xl font-bold uppercase">La progression se mesure</h2>
          <p className="mt-2 text-sm text-muted">
            Jonglage max, navette 5×10 m, planche, détente verticale : 4 tests auto-mesurés toutes
            les 4 semaines, avec graphiques. Passer de 34 à 61 jonglages en 3 semaines, ça ne se
            discute pas.
          </p>
        </section>

        {/* bloc parent */}
        <section className="mt-12 rounded-card border border-line bg-surface p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Pour les parents</p>
          <h2 className="mt-1 font-condensed text-xl font-bold uppercase">
            Un coach individuel : 40 € la séance.
            <br />
            Progressa : 59 € l&apos;année.
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm text-muted">
            <li>• Séances conçues selon les standards de préparation physique des jeunes (13-17 ans).</li>
            <li>• Consentement parental demandé à l&apos;inscription pour les moins de 15 ans.</li>
            <li>• Abonnement souscrit par un parent ou tuteur légal, résiliable en 1 clic.</li>
            <li>• Données minimales, pas de tracking publicitaire.</li>
          </ul>
        </section>

        {/* CTA final */}
        <section className="mt-12 text-center">
          <h2 className="font-condensed text-3xl font-bold uppercase leading-tight">
            La saison prochaine
            <br />
            commence maintenant.
          </h2>
          <div className="mt-5">
            <ButtonLink href="/connexion" size="lg">
              Commencer gratuitement
            </ButtonLink>
          </div>
          <p className="mt-3 text-xs text-muted">
            Gratuit : 1 séance/semaine + 10 exercices. Premium : 8,99 €/mois ou 59 €/an.
          </p>
        </section>

        <footer className="mt-16 border-t border-line pt-6 text-center text-xs text-muted">
          <p className="mb-2 font-display text-sm tracking-wider text-chalk">PROGRESSA</p>
          <p>
            <Link href="/cgu" className="underline">CGU</Link> ·{" "}
            <Link href="/confidentialite" className="underline">Confidentialité</Link> ·{" "}
            <Link href="/connexion" className="underline">Connexion</Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
