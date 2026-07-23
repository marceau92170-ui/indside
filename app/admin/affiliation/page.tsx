import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { allAffiliateStats } from "@/lib/affiliate-stats";
import { formatEuros } from "@/lib/affiliate";

export const dynamic = "force-dynamic";

// Dashboard admin d'affiliation. Réservé au compte admin (connecté) : /admin/affiliation
export default async function AdminAffiliationPage() {
  const me = await currentUser();
  if (me?.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted">
        Non autorisé.
      </main>
    );
  }

  const [stats, totalUsers, premiumActive, totalClicks] = await Promise.all([
    allAffiliateStats(),
    prisma.user.count(),
    prisma.user.count({ where: { plan: "premium" } }),
    prisma.linkClick.count(),
  ]);

  const t = stats.reduce(
    (acc, s) => ({
      gross: acc.gross + s.grossCents,
      commission: acc.commission + s.commissionCents,
      bonus: acc.bonus + s.bonusCents,
      owed: acc.owed + s.owedCents,
      paid: acc.paid + s.paidCents,
      signups: acc.signups + s.signups,
      sales: acc.sales + s.sales,
    }),
    { gross: 0, commission: 0, bonus: 0, owed: 0, paid: 0, signups: 0, sales: 0 }
  );

  // Ce qui te reste après avoir payé commissions + bonus (avant frais/impôts) :
  const yourShare = t.gross - t.commission - t.bonus;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Affiliation — Admin</h1>
          <p className="text-sm text-muted">Vue globale et détail par affilié. Données 100% first-party.</p>
        </div>
        <Link
          href="/admin/feedback"
          className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:border-glow hover:text-glow"
        >
          Retours
        </Link>
      </div>

      {/* Vue globale */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Utilisateurs" value={String(totalUsers)} />
        <Stat label="Premium actifs" value={String(premiumActive)} />
        <Stat label="Clics affiliés" value={String(totalClicks)} />
        <Stat label="Inscrits via affiliés" value={String(t.signups)} />
        <Stat label="CA généré (affiliés)" value={formatEuros(t.gross)} />
        <Stat label="Commissions dues" value={formatEuros(t.commission)} />
        <Stat label="Bonus dus" value={formatEuros(t.bonus)} />
        <Stat label="À payer maintenant" value={formatEuros(t.owed)} highlight />
      </div>

      <div className="mb-6 rounded-card border border-line bg-surface p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Ta part (avant frais Stripe & impôts)</p>
        <p className="mt-1 font-condensed text-2xl font-bold text-glow">{formatEuros(yourShare)}</p>
        <p className="mt-1 text-xs text-muted">
          = CA affiliés {formatEuros(t.gross)} − commissions {formatEuros(t.commission)} − bonus {formatEuros(t.bonus)}.
          Le récurrent (2e mois et +) n&apos;est pas compté ici et te revient à 100%.
        </p>
      </div>

      {/* Détail par affilié */}
      <h2 className="mb-3 font-condensed text-xl font-bold uppercase">Par affilié</h2>
      {stats.length === 0 ? (
        <p className="text-sm text-muted">Aucun affilié enregistré pour le moment.</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-surface text-left text-[11px] uppercase tracking-wide text-muted">
              <tr>
                <Th>Affilié</Th>
                <Th>Clics</Th>
                <Th>Inscrits</Th>
                <Th>Ventes</Th>
                <Th>CA généré</Th>
                <Th>Commission</Th>
                <Th>Bonus</Th>
                <Th>En attente</Th>
                <Th>Versé</Th>
                <Th>À payer</Th>
                <Th> </Th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.code} className="border-t border-line">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5 font-semibold">
                      {s.displayName}
                      {s.isHouse && (
                        <span className="rounded-full border border-line px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted">
                          maison
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted">/r/{s.code}</div>
                  </td>
                  <td className="px-3 py-2 tnum">{s.clicks}</td>
                  <td className="px-3 py-2 tnum">{s.signups}</td>
                  <td className="px-3 py-2 tnum">{s.sales}</td>
                  <td className="px-3 py-2 tnum">{formatEuros(s.grossCents)}</td>
                  <td className="px-3 py-2 tnum">{formatEuros(s.commissionCents)}</td>
                  <td className="px-3 py-2 tnum">{formatEuros(s.bonusCents)}</td>
                  <td className="px-3 py-2 tnum text-muted">{formatEuros(s.pendingCents)}</td>
                  <td className="px-3 py-2 tnum text-muted">{formatEuros(s.paidCents)}</td>
                  <td className="px-3 py-2 tnum font-bold text-glow">{formatEuros(s.owedCents)}</td>
                  <td className="px-3 py-2">
                    {s.owedCents > 0 && (
                      <form action="/api/admin/commissions/pay" method="post">
                        <input type="hidden" name="code" value={s.code} />
                        <button
                          type="submit"
                          className="whitespace-nowrap rounded-full bg-glow px-3 py-1 text-[11px] font-bold text-night"
                        >
                          Marquer payé
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-muted">
        « En attente » = ventes de moins de 15 jours (délai anti-remboursement). « À payer » ne compte que
        l&apos;argent validé. Paie tes affiliés une fois par mois, puis clique « Marquer payé ».
      </p>
    </main>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-card border p-3 ${highlight ? "border-glow bg-glow/10" : "border-line bg-surface"}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1 font-condensed text-xl font-bold ${highlight ? "text-glow" : "text-chalk"}`}>{value}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 font-semibold">{children}</th>;
}
