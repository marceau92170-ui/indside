// Gating freemium.
// Gratuit : 1 séance générique / semaine + 10 exercices de la bibliothèque.
// Premium : programme complet personnalisé, adaptation hebdo, tests, bibliothèque entière.

type UserWithSub = {
  plan: string;
  premiumUntil?: Date | null;
  subscription?: { status: string; currentPeriodEnd: Date | null } | null;
};

export function isPremium(user: UserWithSub | null): boolean {
  if (!user) return false;
  if (user.plan === "premium") return true;
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
