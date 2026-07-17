import { prisma } from "@/lib/prisma";
import { bonusEurosForRevenue, PAYOUT_HOLD_DAYS } from "@/lib/affiliate";

export type AffiliateStats = {
  code: string;
  displayName: string;
  email: string;
  isHouse: boolean; // lien "maison" : suivi sans commission
  clicks: number;
  signups: number; // comptes créés via son lien
  sales: number; // ventes (1er paiements non remboursés)
  grossCents: number; // CA total généré (non remboursé)
  commissionCents: number; // commissions totales (non remboursées)
  bonusCents: number; // bonus paliers acquis (sur CA validé)
  pendingCents: number; // commissions pas encore validées (< 15 j) — en attente
  paidCents: number; // déjà versé
  owedCents: number; // à payer maintenant (validé − déjà versé)
};

// Calcule les stats d'un affilié. « Validé » = commission de plus de 15 jours
// (le délai anti-remboursement) : on ne considère « à payer » que l'argent sûr.
export async function affiliateStats(aff: {
  code: string;
  displayName: string;
  email: string;
  isHouse?: boolean;
}): Promise<AffiliateStats> {
  const code = aff.code;
  const isHouse = aff.isHouse ?? false;
  const holdDate = new Date(Date.now() - PAYOUT_HOLD_DAYS * 24 * 60 * 60 * 1000);

  const [clicks, signups, commissions, payoutAgg] = await Promise.all([
    prisma.linkClick.count({ where: { affiliateCode: code } }),
    prisma.user.count({ where: { referredByCode: code } }),
    prisma.commission.findMany({ where: { affiliateCode: code, refunded: false } }),
    prisma.payout.aggregate({ where: { affiliateCode: code }, _sum: { amountCents: true } }),
  ]);

  const grossCents = commissions.reduce((s, c) => s + c.grossCents, 0);

  // Lien "maison" : on garde clics/inscriptions/ventes/CA pour mesurer le canal,
  // mais aucune commission, aucun bonus, rien à verser.
  if (isHouse) {
    return {
      code,
      displayName: aff.displayName,
      email: aff.email,
      isHouse: true,
      clicks,
      signups,
      sales: commissions.length,
      grossCents,
      commissionCents: 0,
      bonusCents: 0,
      pendingCents: 0,
      paidCents: 0,
      owedCents: 0,
    };
  }

  const commissionCents = commissions.reduce((s, c) => s + c.commissionCents, 0);

  const settled = commissions.filter((c) => c.createdAt < holdDate);
  const settledGross = settled.reduce((s, c) => s + c.grossCents, 0);
  const settledCommission = settled.reduce((s, c) => s + c.commissionCents, 0);

  const pendingCents = commissionCents - settledCommission;
  const bonusCents = Math.round(bonusEurosForRevenue(settledGross) * 100);
  const paidCents = payoutAgg._sum.amountCents ?? 0;
  const owedCents = Math.max(0, settledCommission + bonusCents - paidCents);

  return {
    code,
    displayName: aff.displayName,
    email: aff.email,
    isHouse: false,
    clicks,
    signups,
    sales: commissions.length,
    grossCents,
    commissionCents,
    bonusCents,
    pendingCents,
    paidCents,
    owedCents,
  };
}

export async function allAffiliateStats(): Promise<AffiliateStats[]> {
  const affs = await prisma.affiliate.findMany({ orderBy: { createdAt: "asc" } });
  const stats = await Promise.all(affs.map((a) => affiliateStats(a)));
  // Les plus gros vendeurs en haut.
  return stats.sort((a, b) => b.grossCents - a.grossCents);
}
