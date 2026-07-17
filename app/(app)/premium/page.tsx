import { currentUser } from "@/lib/auth";
import { isPremium } from "@/lib/plan";
import { isAdult } from "@/lib/categories";
import { Card } from "@/components/ui";
import { CheckoutButtons, ManageSubscriptionButton } from "@/components/CheckoutButtons";

export const dynamic = "force-dynamic";

const INCLUDED = [
  "Programme hebdo 100 % personnalisé (poste, âge, niveau, matériel, calendrier club)",
  "Adaptation chaque semaine selon tes retours de séances",
  "Ton programme évite automatiquement les zones où tu as signalé une douleur",
  "Conseils nutrition & hydratation chaque semaine, calés sur tes matchs",
  "Les 60 exercices de la bibliothèque, expliqués pas à pas",
  "Tests d'évaluation + graphiques de progression",
  "Carte joueur avec tes vraies stats",
  "Badges et séries pour tenir sur la durée",
];

export default async function PremiumPage() {
  const user = await currentUser();
  const premium = isPremium(user);
  const adult = user?.profile ? isAdult(user.profile.birthYear) : false;
  // Réduction affilié active : le joueur est venu par un lien de parrainage.
  const hasReferralDiscount = Boolean(user?.referredByCode && process.env.STRIPE_COUPON_AFFILIATE);

  if (premium) {
    return (
      <div>
        <h1 className="mb-2 font-condensed text-3xl font-bold uppercase">Premium ✓</h1>
        <p className="mb-6 text-sm text-muted">
          Ton abonnement est actif. Gestion et résiliation en 1 clic ci-dessous.
        </p>
        <ManageSubscriptionButton />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Passe Premium</h1>
      <p className="mb-5 text-sm text-muted">
        Ton préparateur perso, moins cher qu&apos;un seul cours particulier.
      </p>

      {hasReferralDiscount && (
        <div className="mb-5 flex items-center gap-2 rounded-card border border-glow bg-glow/10 px-4 py-3">
          <span className="text-xl">🎁</span>
          <p className="text-sm font-semibold">
            -10 % appliqués automatiquement grâce à ton lien — la remise se voit au paiement.
          </p>
        </div>
      )}

      <Card className="mb-5">
        <ul className="space-y-2">
          {INCLUDED.map((item) => (
            <li key={item} className="flex gap-2 text-sm">
              <span className="text-glow">✓</span> {item}
            </li>
          ))}
        </ul>
      </Card>

      <CheckoutButtons />

      {adult ? (
        <Card className="mt-6 border-grass bg-grass/15">
          <p className="mb-1 font-condensed text-base font-bold uppercase">Bon à savoir</p>
          <ul className="space-y-1.5 text-sm text-muted">
            <li>• Un coach individuel coûte 30 à 50 € la séance. Ici : 59 € pour l&apos;année entière.</li>
            <li>• Programme calé sur ton niveau, ton calendrier et ta prévention blessure.</li>
            <li>• Si tu signales une douleur, le programme s&apos;adapte tout seul pour ne pas aggraver la zone.</li>
            <li>• Résiliable à tout moment, en 1 clic, depuis l&apos;app.</li>
            <li>• Données minimales, aucun tracking publicitaire. <a href="/confidentialite" className="underline">Confidentialité</a></li>
          </ul>
        </Card>
      ) : (
        <Card className="mt-6 border-grass bg-grass/15">
          <p className="mb-1 font-condensed text-base font-bold uppercase">Pour les parents</p>
          <ul className="space-y-1.5 text-sm text-muted">
            <li>• Un coach individuel coûte 30 à 50 € la séance. Ici : 59 € pour l&apos;année entière.</li>
            <li>• Séances conçues selon les standards de préparation des jeunes : poids du corps uniquement avant 15 ans, charge calée autour du club, prévention des blessures intégrée.</li>
            <li>• Si ton enfant signale une douleur (genou, cheville...), le programme Premium s&apos;adapte tout seul pour ne pas aggraver la zone — pas besoin d&apos;y penser.</li>
            <li>• Résiliable à tout moment, en 1 clic, depuis l&apos;app.</li>
            <li>• Données minimales, aucun tracking publicitaire. <a href="/confidentialite" className="underline">Confidentialité</a></li>
          </ul>
          <p className="mt-3 text-xs text-muted">
            Abonnement à souscrire par un parent ou tuteur légal.
          </p>
        </Card>
      )}
    </div>
  );
}
