// Gating freemium.
// Gratuit : 1 séance générique / semaine + 10 exercices de la bibliothèque.
// Premium : programme complet personnalisé, adaptation hebdo, tests, bibliothèque entière.

type UserWithSub = {
  email?: string | null;
  plan: string;
  premiumUntil?: Date | null;
  subscription?: { status: string; currentPeriodEnd: Date | null } | null;
};

// Affiliés à qui on offre l'accès Premium le temps qu'ils tournent leurs vidéos /
// recommandent l'app — sans passer par Stripe. Ajouter un e-mail ici suffit ;
// pas besoin de toucher la base en direct ni de connaître l'ADMIN_SECRET.
const AFFILIATE_FREE_EMAILS = ["issadiabatepro@gmail.com"];

export function isPremium(user: UserWithSub | null): boolean {
  if (!user) return false;
  if (user.plan === "premium") return true;
  if (user.email && AFFILIATE_FREE_EMAILS.includes(user.email.toLowerCase())) return true;
  // Premium offert par parrainage (encore valable ?)
  if (user.premiumUntil && user.premiumUntil > new Date()) return true;
  const sub = user.subscription;
  if (!sub) return false;
  if (!["active", "trialing"].includes(sub.status)) return false;
  if (sub.currentPeriodEnd && sub.currentPeriodEnd < new Date()) return false;
  return true;
}

export const PRICING = {
  monthly: { amount: "8,99 €", period: "/ mois" },
  annual: { amount: "59 €", period: "/ an", saving: "≈ 4,92 € / mois" },
};
