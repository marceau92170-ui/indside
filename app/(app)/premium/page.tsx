import { currentUser } from "@/lib/auth";
import { isPremium } from "@/lib/plan";
import { isAdult } from "@/lib/categories";
import { Card } from "@/components/ui";
import { CheckoutButtons, ManageSubscriptionButton } from "@/components/CheckoutButtons";
import { ExerciseIllustration } from "@/components/ExerciseIllustration";

export const dynamic = "force-dynamic";

// Comparatif Gratuit vs Premium. free/premium : "yes" (✓), "no" (—) ou un texte.
const COMPARE: { label: string; free: string; premium: string }[] = [
  { label: "Programme de la semaine", free: "1 séance générique", premium: "Complet · jusqu'à 3 séances" },
  { label: "100 % personnalisé (poste, âge, niveau, matériel, calendrier club)", free: "no", premium: "yes" },
  { label: "S'adapte chaque semaine à tes retours (IA)", free: "no", premium: "yes" },
  { label: "Évite tout seul tes zones de douleur (IA)", free: "no", premium: "yes" },
  { label: "Exercices de la bibliothèque", free: "10", premium: "60" },
  { label: "Démonstrations en personnage réaliste (pas en bonhomme)", free: "no", premium: "yes" },
  { label: "Conseils du coach à chaque exercice", free: "no", premium: "yes" },
  { label: "Tests d'évaluation + graphiques de progression", free: "no", premium: "yes" },
  { label: "Conseils nutrition & hydratation calés sur tes matchs", free: "no", premium: "yes" },
  { label: "Carte joueur avec tes vraies stats", free: "no", premium: "yes" },
  { label: "Badges & séries pour tenir dans la durée", free: "yes", premium: "yes" },
];

function CompareCell({ value }: { value: string }) {
  if (value === "yes") return <span className="text-glow">✓</span>;
  if (value === "no") return <span className="text-muted">—</span>;
  return <span>{value}</span>;
}

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

      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">
        Gratuit vs Premium
      </p>
      <div className="mb-5 overflow-hidden rounded-card border border-line">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line bg-surface text-[11px] font-bold uppercase tracking-wide">
              <th className="px-3 py-2.5 text-left text-muted">Ce que tu débloques</th>
              <th className="px-2 py-2.5 text-center text-muted">Gratuit</th>
              <th className="px-2 py-2.5 text-center text-glow">Premium</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE.map((r) => (
              <tr key={r.label} className="border-b border-line last:border-0">
                <td className="px-3 py-2.5 text-xs leading-snug">{r.label}</td>
                <td className="px-2 py-2.5 text-center text-xs text-muted">
                  <CompareCell value={r.free} />
                </td>
                <td className="bg-glow/5 px-2 py-2.5 text-center text-xs font-semibold">
                  <CompareCell value={r.premium} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* La différence se VOIT : bonhomme bâton (gratuit) vs personnage réaliste (Premium) */}
      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">
        Vois la différence
      </p>
      <div className="mb-2 grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1.5 text-center text-xs font-bold uppercase tracking-wide text-muted">
            Gratuit
          </p>
          <ExerciseIllustration slug="conduite-en-huit" category="U16" premium={false} showCue={false} />
        </div>
        <div className="rounded-xl">
          <p className="mb-1.5 text-center text-xs font-bold uppercase tracking-wide text-glow">
            Premium
          </p>
          <ExerciseIllustration slug="conduite-en-huit" category="U16" premium showCue={false} />
        </div>
      </div>
      <p className="mb-6 text-center text-xs text-muted">
        Démonstrations en <span className="text-chalk">personnage réaliste</span>, gestes détaillés
        et conseils du coach à chaque exercice.
      </p>

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
