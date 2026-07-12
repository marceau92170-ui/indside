import Link from "next/link";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function NutritionPage() {
  return (
    <div>
      <Link href="/ressources" className="mb-3 inline-block text-sm text-muted underline">
        ← Retour aux ressources
      </Link>
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Nutrition & hydratation</h1>
      <p className="mb-5 text-sm text-muted">
        Anti-bullshit : pas de compléments, pas de poudre magique. Juste ce qui marche vraiment.
      </p>

      <div className="space-y-4 text-sm leading-relaxed [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:font-condensed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:uppercase [&_h2]:text-glow">
        <Card className="border-glow/30">
          <p>
            <strong>Le point le plus sous-estimé chez les jeunes joueurs : l&apos;hydratation.</strong>{" "}
            Ne jamais attendre d&apos;avoir soif pour boire — la soif signifie que tu es déjà
            déshydraté, et la déshydratation baisse directement tes performances et augmente le
            risque de blessure.
          </p>
        </Card>

        <h2>Avant l&apos;entraînement ou le match</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Environ 750 ml d&apos;eau dans les 2 heures qui précèdent l&apos;effort.</li>
          <li>
            2 à 3 heures avant, un repas léger riche en glucides (féculents, fruits) et en
            protéines (œuf, poulet, légumineuses) — ni trop lourd, ni le ventre vide.
          </li>
        </ul>

        <h2>Pendant l&apos;effort</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Moins d&apos;une heure d&apos;effort : de l&apos;eau seule suffit largement.</li>
          <li>
            Effort plus long : 50 à 100 ml toutes les 5 à 10 minutes pour limiter les pertes.
          </li>
        </ul>

        <h2>Après l&apos;effort</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>De l&apos;eau, et un peu de sel (sodium) pour bien restaurer ce que tu as perdu en transpirant.</li>
          <li>
            Un repas dans l&apos;heure ou deux qui suit, avec des protéines pour la récupération
            musculaire et des glucides pour reconstituer l&apos;énergie.
          </li>
        </ul>

        <h2>En pleine croissance</h2>
        <p>
          Entre 13 et 17 ans, ton corps grandit ET s&apos;entraîne — tes besoins en énergie et en
          protéines sont réellement plus élevés qu&apos;un adulte sédentaire. Ça ne veut pas dire
          manger n&apos;importe quoi : ça veut dire ne pas te priver, avec des repas réguliers et
          variés (féculents, légumes, protéines, produits laitiers, fruits).
        </p>

        <h2>Et les compléments alimentaires ?</h2>
        <p>
          Avant 18 ans, ils ne sont pas nécessaires si l&apos;alimentation est correcte et
          variée — et certains présentent des risques (dosages non contrôlés, produits interdits
          non déclarés). Si un besoin spécifique est identifié, ça se décide avec un médecin, pas
          en autonomie.
        </p>

        <h2>Le sommeil compte aussi</h2>
        <p>
          Ce n&apos;est pas de la nutrition à proprement parler, mais c&apos;est la moitié de la
          récupération : viser 8 à 9 heures de sommeil par nuit en période de croissance et
          d&apos;entraînement intensif n&apos;est pas un luxe.
        </p>
      </div>
    </div>
  );
}
