import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { affiliateStats, affiliateDailySeries } from "@/lib/affiliate-stats";
import { nextTier, BONUS_TIERS } from "@/lib/affiliate";
import { SITE_URL } from "@/lib/site";
import { PartnerDashboard } from "@/components/PartnerDashboard";

export const dynamic = "force-dynamic";

export default async function PartenairePage() {
  const user = await currentUser();
  if (!user) redirect("/connexion");
  if (user.role !== "affiliate" && user.role !== "admin") redirect("/semaine");

  const affiliate = await prisma.affiliate.findFirst({
    where: { OR: [{ userId: user.id }, { email: user.email.toLowerCase() }] },
  });

  if (!affiliate) {
    return (
      <div>
        <h1 className="mb-2 font-condensed text-3xl font-bold uppercase">Espace partenaire</h1>
        <p className="text-sm text-muted">
          Ton compte affilié n&apos;est pas encore configuré. Contacte l&apos;administrateur.
        </p>
      </div>
    );
  }

  const [s, series] = await Promise.all([
    affiliateStats(affiliate),
    affiliateDailySeries(affiliate.code, 30),
  ]);
  const link = `${SITE_URL}/r/${affiliate.code}`;

  return (
    <PartnerDashboard
      displayName={affiliate.displayName}
      link={link}
      isHouse={s.isHouse}
      totals={{
        clicks: s.clicks,
        signups: s.signups,
        sales: s.sales,
        grossCents: s.grossCents,
        commissionCents: s.commissionCents,
        bonusCents: s.bonusCents,
        pendingCents: s.pendingCents,
        paidCents: s.paidCents,
        owedCents: s.owedCents,
        trialingCount: s.trialingCount,
        pipelineCents: s.pipelineCents,
      }}
      series={series}
      next={nextTier(s.grossCents)}
      tiers={BONUS_TIERS}
    />
  );
}
