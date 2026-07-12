import Link from "next/link";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function FiliereProPage() {
  return (
    <div>
      <Link href="/ressources" className="mb-3 inline-block text-sm text-muted underline">
        ← Retour aux ressources
      </Link>
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Le vrai chemin vers le pro</h1>
      <p className="mb-5 text-sm text-muted">
        Pas de promesse magique ici — juste comment la filière fonctionne vraiment en France, pour
        que tu saches où mettre ton énergie.
      </p>

      <div className="space-y-4 text-sm leading-relaxed [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:font-condensed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:uppercase [&_h2]:text-glow">
        <Card>
          <p>
            En France, la détection des jeunes joueurs est pilotée par la <strong>Direction
            Technique Nationale (DTN)</strong> via le <strong>Plan de Performance Fédéral (PPF)</strong>,
            qui accompagne les joueurs à partir de 13 ans vers le haut niveau.
          </p>
        </Card>

        <h2>Les âges clés</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>U10-U12</strong> : phase de pré-détection. Les recruteurs commencent à observer
            en compétition, sans démarche formelle.
          </li>
          <li>
            <strong>U13-U14</strong> : entrée possible en pôle espoirs ou en pré-formation dans
            certains clubs. C&apos;est aussi l&apos;âge où les détections de ligue régionale se
            concentrent, sur la base des joueurs déjà repérés par les districts.
          </li>
          <li>
            <strong>U15-U16</strong> : âge officiel d&apos;intégration en centre de formation pour
            la majorité des clubs professionnels.
          </li>
          <li>
            <strong>À partir de 16 ans</strong> : possibilité de signer un premier contrat
            stagiaire.
          </li>
        </ul>

        <h2>Les structures qui existent vraiment</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>16 pôles espoirs masculins</strong> gérés par la DTN forment environ 450 jeunes
            par saison. L&apos;INF Clairefontaine, le plus ancien, prépare spécifiquement les
            garçons de 13-14 ans.
          </li>
          <li>
            Côté féminin : <strong>8 pôles espoirs</strong> (dont le pôle France à l&apos;INSEP)
            forment 177 joueuses de 16 à 18 ans chaque saison.
          </li>
          <li>
            La France compte environ <strong>30 centres de formation agréés</strong>, qui
            accueillent les 15-19 ans dans un protocole qui allie sport, scolarité et éducation.
          </li>
        </ul>

        <h2>Ce que ça veut dire pour toi</h2>
        <p>
          Les places sont rares et la sélection commence tôt. Mais rien n&apos;est joué à 13 ans :
          la marge de progression entre U14 et U16 est énorme, et c&apos;est justement la période
          où un travail personnel sérieux — technique, physique, mental — fait la différence entre
          deux joueurs du même âge.
        </p>
        <p>
          <strong>Le double projet n&apos;est pas un plan B.</strong> Même dans un centre de
          formation, l&apos;école reste obligatoire — parce que la réalité est que la grande
          majorité des joueurs formés ne deviendront pas professionnels. Garder de bons résultats
          scolaires n&apos;est jamais du temps perdu.
        </p>

        <Card className="border-glow/30">
          <p className="text-xs text-muted">
            Ces informations décrivent le fonctionnement général de la filière fédérale française
            à titre indicatif — chaque ligue, district et club a ses propres modalités précises de
            détection. Renseigne-toi auprès de ton club et de ton district pour les démarches
            exactes.
          </p>
        </Card>
      </div>
    </div>
  );
}
