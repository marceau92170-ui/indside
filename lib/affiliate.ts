// Règles d'affiliation — centralisées et testées, car ça touche à l'argent.
//
// Deal validé avec le créateur :
//  - Commission MENSUEL : 80% du PREMIER paiement (8,99 €) → l'affilié prend ~7,19 €,
//    les renouvellements (mois 2 et +) reviennent 100% au créateur.
//  - Commission ANNUEL : 40% du paiement (59 €) → l'affilié prend ~23,60 €. Taux plus
//    bas car l'annuel est un gros paiement unique sans renouvellement avant 12 mois ;
//    à 80% le créateur ne gardait presque rien et l'affilié était incité à ne pousser
//    que l'annuel. À 40% l'affilié gagne quand même 3× plus qu'un mensuel.
//  - Bonus de paliers CUMULATIFS, débloqués une fois (à vie), sur le CA total généré :
//    500 € → +50 € ; 1000 € → +100 € de plus (soit 150 € au total à 1000 €).
//  - Attribution : "premier lien gagne", fenêtre de 30 jours entre le clic et le paiement.
//  - Paiement manuel, avec un délai anti-remboursement.

export const COMMISSION_RATE = 0.8; // mensuel (toujours)
export const COMMISSION_RATE_ANNUAL = 0.4; // annuel, APRÈS le mois de lancement

// Offre de lancement : pendant les 30 premiers jours de chaque affilié (à partir de
// sa 1ère vidéo / date de démarrage), l'annuel est AUSSI payé à 80%. Après, il passe
// à 40%. Le mensuel, lui, reste à 80% en permanence.
export const LAUNCH_WINDOW_DAYS = 30;

// Fenêtre d'attribution : un clic reste valable 30 jours pour convertir en vente.
export const ATTRIBUTION_WINDOW_DAYS = 30;

// Délai avant de considérer une commission "à payer" : laisse passer les
// remboursements (droit de rétractation) avant de verser l'argent à l'affilié.
export const PAYOUT_HOLD_DAYS = 15;

// Paliers de bonus cumulatifs, en euros de CA généré → bonus en euros.
export const BONUS_TIERS: { thresholdEuros: number; bonusEuros: number }[] = [
  { thresholdEuros: 500, bonusEuros: 50 },
  { thresholdEuros: 1000, bonusEuros: 100 },
];

export type Plan = "monthly" | "annual";

// La vente tombe-t-elle dans le mois de lancement de l'affilié ?
export function isWithinLaunchWindow(
  promoStart: Date,
  now: Date = new Date()
): boolean {
  const end = new Date(promoStart);
  end.setDate(end.getDate() + LAUNCH_WINDOW_DAYS);
  return now.getTime() <= end.getTime();
}

// Taux de commission selon le plan payé et la période :
// - mensuel : 80% toujours ;
// - annuel : 80% pendant le mois de lancement, 40% ensuite.
export function commissionRate(plan: Plan, withinLaunch = false): number {
  if (plan === "annual" && !withinLaunch) return COMMISSION_RATE_ANNUAL;
  return COMMISSION_RATE;
}

// Commission (en centimes) sur un paiement brut (en centimes), selon le plan
// et la période de lancement. Le plan par défaut est "monthly".
export function commissionCents(
  grossCents: number,
  plan: Plan = "monthly",
  withinLaunch = false
): number {
  return Math.round(grossCents * commissionRate(plan, withinLaunch));
}

// Bonus total (en euros) débloqué pour un CA généré (en centimes) — cumulatif.
export function bonusEurosForRevenue(totalGrossCents: number): number {
  const revenueEuros = totalGrossCents / 100;
  return BONUS_TIERS.reduce(
    (sum, tier) => (revenueEuros >= tier.thresholdEuros ? sum + tier.bonusEuros : sum),
    0
  );
}

// Prochain palier à atteindre (pour la jauge de motivation côté affilié), ou null si tout atteint.
export function nextTier(totalGrossCents: number): { thresholdEuros: number; bonusEuros: number } | null {
  const revenueEuros = totalGrossCents / 100;
  return BONUS_TIERS.find((t) => revenueEuros < t.thresholdEuros) ?? null;
}

export function eurosFromCents(cents: number): number {
  return Math.round(cents) / 100;
}

// Formate un montant en centimes en chaîne "12,34 €".
export function formatEuros(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}
