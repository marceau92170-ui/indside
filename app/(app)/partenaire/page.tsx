import { redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { affiliateStats } from "@/lib/affiliate-stats";
import { formatEuros, nextTier, BONUS_TIERS } from "@/lib/affiliate";
import { SITE_URL } from "@/lib/site";
import { CopyLink } from "@/components/CopyLink";
import { Card } from "@/components/ui";

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

  const s = await affiliateStats(affiliate);
  const link = `${SITE_URL}/r/${affiliate.code}`;
  const next = nextTier(s.grossCents);
  const grossEuros = s.grossCents / 100;
  const progressPct = next ? Math.min(100, Math.round((grossEuros / next.thresholdEuros) * 100)) : 100;

  return (
    <div>
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase leading-none">Espace partenaire</h1>
      <p className="mb-4 text-sm text-muted">Salut {affiliate.displayName} 👊 Voici tes résultats en direct.</p>

      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Ton lien de parrainage</p>
      <CopyLink url={link} />
      <p className="mt-2 text-xs text-muted">
        Partage ce lien. Toute personne qui clique puis s&apos;abonne dans les 30 jours te rapporte
        <span className="font-semibold text-chalk"> 80% de son 1er paiement</span>.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat label="Clics" value={String(s.clicks)} />
        <Stat label="Inscrits via ton lien" value={String(s.signups)} />
        <Stat label="Ventes" value={String(s.sales)} />
        <Stat label="CA généré" value={formatEuros(s.grossCents)} />
        <Stat label="Commissions" value={formatEuros(s.commissionCents)} />
        <Stat label="Bonus paliers" value={formatEuros(s.bonusCents)} />
      </div>

      <Card className="mt-4 border-glow bg-glow/10">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">À te verser (validé)</p>
        <p className="mt-1 font-condensed text-3xl font-bold text-glow">{formatEuros(s.owedCents)}</p>
        {s.pendingCents > 0 && (
          <p className="mt-1 text-xs text-muted">
            + {formatEuros(s.pendingCents)} en attente de validation (ventes de moins de 15 jours).
          </p>
        )}
        {s.paidCents > 0 && (
          <p className="mt-1 text-xs text-muted">Déjà versé : {formatEuros(s.paidCents)}.</p>
        )}
      </Card>

      {/* Progression vers le prochain bonus */}
      <Card className="mt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Bonus paliers</p>
        {next ? (
          <>
            <div className="mb-2 h-3 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-glow" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-sm">
              Plus que <span className="font-bold text-glow">{formatEuros(next.thresholdEuros * 100 - s.grossCents)}</span> de CA
              pour débloquer <span className="font-bold">+{next.bonusEuros}€</span> de bonus.
            </p>
          </>
        ) : (
          <p className="text-sm">🎉 Tous les paliers de bonus sont débloqués. Bravo !</p>
        )}
        <p className="mt-2 text-[11px] text-muted">
          Paliers : {BONUS_TIERS.map((t) => `${t.thresholdEuros}€ → +${t.bonusEuros}€`).join(" · ")} (cumulatifs).
        </p>
      </Card>

      <p className="mt-4 text-xs text-muted">
        Les commissions sont versées une fois par mois (après un délai de 15 jours qui couvre les
        remboursements éventuels). Une question ?{" "}
        <Link href="/reglages" className="underline">
          Contacte-nous
        </Link>
        .
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-surface p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-condensed text-2xl font-bold text-chalk">{value}</p>
    </div>
  );
}
