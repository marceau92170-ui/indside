import { prisma } from "@/lib/prisma";
import {
  bonusEurosForRevenue,
  commissionCents as calcCommission,
  isWithinLaunchWindow,
  PAYOUT_HOLD_DAYS,
} from "@/lib/affiliate";

// Prix catalogue (centimes) pour estimer la commission « en approche » d'un essai
// en cours (le montant réel se fige au 1er paiement).
const PRICE_MONTHLY_CENTS = 899;
const PRICE_ANNUAL_CENTS = 5900;

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
  trialingCount: number; // essais gratuits en cours attribués à cet affilié
  pipelineCents: number; // commission estimée « en approche » de ces essais
};

// Calcule les stats d'un affilié. « Validé » = commission de plus de 15 jours
// (le délai anti-remboursement) : on ne considère « à payer » que l'argent sûr.
export async function affiliateStats(aff: {
  code: string;
  displayName: string;
  email: string;
  isHouse?: boolean;
  promoStartsAt?: Date | null;
  createdAt?: Date;
}): Promise<AffiliateStats> {
  const code = aff.code;
  const isHouse = aff.isHouse ?? false;
  const holdDate = new Date(Date.now() - PAYOUT_HOLD_DAYS * 24 * 60 * 60 * 1000);

  const [clicks, signups, commissions, payoutAgg, trialing] = await Promise.all([
    prisma.linkClick.count({ where: { affiliateCode: code } }),
    prisma.user.count({ where: { referredByCode: code } }),
    prisma.commission.findMany({ where: { affiliateCode: code, refunded: false } }),
    prisma.payout.aggregate({ where: { affiliateCode: code }, _sum: { amountCents: true } }),
    prisma.subscription.findMany({
      where: { status: "trialing", user: { referredByCode: code } },
      select: { priceId: true },
    }),
  ]);

  // Commission estimée des essais en cours (« en approche ») : se confirme au 1er paiement.
  const promoStart = aff.promoStartsAt ?? aff.createdAt ?? new Date();
  const withinLaunch = isWithinLaunchWindow(promoStart);
  const trialingCount = trialing.length;
  const pipelineCents = isHouse
    ? 0
    : trialing.reduce((sum, t) => {
        const annual = t.priceId === process.env.STRIPE_PRICE_ANNUAL;
        return (
          sum +
          calcCommission(
            annual ? PRICE_ANNUAL_CENTS : PRICE_MONTHLY_CENTS,
            annual ? "annual" : "monthly",
            withinLaunch
          )
        );
      }, 0);

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
      trialingCount,
      pipelineCents: 0,
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
    trialingCount,
    pipelineCents,
  };
}

// Un point de la série quotidienne (pour les courbes du dashboard partenaire).
export type DailyPoint = {
  date: string; // AAAA-MM-JJ (UTC)
  clicks: number;
  signups: number;
  sales: number;
  grossCents: number;
  commissionCents: number;
};

// Série jour par jour sur les `days` derniers jours (aujourd'hui inclus), avec des
// zéros pour les jours sans activité — pour tracer des courbes propres et comparer
// chaque jour à la veille.
export async function affiliateDailySeries(code: string, days = 30): Promise<DailyPoint[]> {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const [clicks, signups, commissions] = await Promise.all([
    prisma.linkClick.findMany({
      where: { affiliateCode: code, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.user.findMany({
      where: { referredByCode: code, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.commission.findMany({
      where: { affiliateCode: code, refunded: false, createdAt: { gte: since } },
      select: { createdAt: true, grossCents: true, commissionCents: true },
    }),
  ]);

  const key = (d: Date) => d.toISOString().slice(0, 10);
  const map = new Map<string, DailyPoint>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    const k = key(d);
    map.set(k, { date: k, clicks: 0, signups: 0, sales: 0, grossCents: 0, commissionCents: 0 });
  }
  for (const c of clicks) {
    const p = map.get(key(c.createdAt));
    if (p) p.clicks++;
  }
  for (const s of signups) {
    const p = map.get(key(s.createdAt));
    if (p) p.signups++;
  }
  for (const c of commissions) {
    const p = map.get(key(c.createdAt));
    if (p) {
      p.sales++;
      p.grossCents += c.grossCents;
      p.commissionCents += c.commissionCents;
    }
  }
  return [...map.values()];
}

export async function allAffiliateStats(): Promise<AffiliateStats[]> {
  const affs = await prisma.affiliate.findMany({ orderBy: { createdAt: "asc" } });
  const stats = await Promise.all(affs.map((a) => affiliateStats(a)));
  // Les plus gros vendeurs en haut.
  return stats.sort((a, b) => b.grossCents - a.grossCents);
}
