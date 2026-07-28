import { prisma } from "@/lib/prisma";

// Un seul endroit qui définit "combien de comptes ont accès Premium, et pourquoi" —
// pour ne jamais avoir deux chiffres "Premium actifs" qui se contredisent entre
// deux pages admin. Reflète exactement la logique de isPremium() (lib/plan.ts) :
// un compte est Premium via Stripe (payant ou en essai), via parrainage (gratuit,
// premiumUntil), ou via un accès accordé à la main (grant-premium, sans Stripe).
export type PremiumBreakdown = {
  paying: number; // Stripe, facturé (status active)
  trialing: number; // Stripe, essai 7 j en cours (rien encaissé)
  pastDue: number; // Stripe, prélèvement en échec (accès déjà coupé par isPremium())
  canceled: number; // Stripe, résilié (total historique)
  referralFree: number; // Premium offert par parrainage, sans abonnement Stripe
  manualGrant: number; // Premium accordé à la main (admin), sans Stripe ni parrainage
  totalWithAccess: number; // exactement ce que isPremium() compterait "oui" aujourd'hui
};

export async function premiumBreakdown(): Promise<PremiumBreakdown> {
  const now = new Date();
  const [subsByStatus, referralFree, manualGrant] = await Promise.all([
    prisma.subscription.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.user.count({ where: { premiumUntil: { gt: now }, subscription: null } }),
    prisma.user.count({
      where: {
        plan: "premium",
        subscription: null,
        OR: [{ premiumUntil: null }, { premiumUntil: { lte: now } }],
      },
    }),
  ]);

  const byStatus = (s: string) => subsByStatus.find((r) => r.status === s)?._count.status ?? 0;
  const paying = byStatus("active");
  const trialing = byStatus("trialing");
  const pastDue = byStatus("past_due");
  const canceled = byStatus("canceled");

  return {
    paying,
    trialing,
    pastDue,
    canceled,
    referralFree,
    manualGrant,
    totalWithAccess: paying + trialing + referralFree + manualGrant,
  };
}
