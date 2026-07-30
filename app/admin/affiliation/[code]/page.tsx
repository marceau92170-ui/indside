import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { isPremium } from "@/lib/plan";

export const dynamic = "force-dynamic";

// Détail nominatif d'un affilié : qui s'est inscrit via son lien, et ce qu'il en a
// fait (profil complété, actif, statut Premium) — de quoi donner un retour précis
// à CET affilié, plutôt qu'un chiffre global. Réservé au compte admin.
export default async function AdminAffiliateDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const me = await currentUser();
  if (me?.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted">
        Non autorisé.
      </main>
    );
  }

  const { code } = await params;
  const affiliate = await prisma.affiliate.findUnique({ where: { code } });
  if (!affiliate) notFound();

  const users = await prisma.user.findMany({
    where: { referredByCode: code },
    include: {
      profile: true,
      subscription: true,
      _count: { select: { sessionLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const withProfile = users.filter((u) => u.profile).length;
  const active = users.filter((u) => u._count.sessionLogs > 0).length;
  const premiumCount = users.filter((u) => isPremium(u)).length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/admin/affiliation" className="mb-4 inline-block text-xs text-muted hover:text-glow">
        ← Tous les affiliés
      </Link>
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">{affiliate.displayName}</h1>
      <p className="mb-6 text-sm text-muted">/r/{affiliate.code} — détail des inscrits</p>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Inscrits" value={users.length} />
        <Stat label="Profil complété" value={withProfile} sub={users.length ? `${Math.round((withProfile / users.length) * 100)}%` : undefined} />
        <Stat label="Actifs (≥1 séance)" value={active} sub={users.length ? `${Math.round((active / users.length) * 100)}%` : undefined} />
        <Stat label="Premium (essai + payant)" value={premiumCount} />
      </div>

      {users.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-4 text-sm text-muted">
          Personne ne s&apos;est encore inscrit via ce lien.
        </p>
      ) : (
        <ul className="space-y-2">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-line bg-surface p-3 text-sm"
            >
              <div>
                <span className="font-semibold">{u.profile?.firstName ?? u.name ?? u.email}</span>
                <span className="ml-2 text-xs text-muted">{u.email}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge active={!!u.profile}>{u.profile ? "profil complété" : "onboarding inachevé"}</Badge>
                <Badge active={u._count.sessionLogs > 0}>
                  {u._count.sessionLogs > 0 ? `${u._count.sessionLogs} séance${u._count.sessionLogs > 1 ? "s" : ""}` : "jamais actif"}
                </Badge>
                {isPremium(u) && (
                  <span className="rounded-full bg-glow/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-glow">
                    {u.subscription?.status === "trialing" ? "essai" : "premium"}
                  </span>
                )}
                <span className="text-[11px] text-muted">
                  {u.createdAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-card border border-line bg-surface p-3 text-center">
      <p className="tnum font-condensed text-2xl font-bold text-glow">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      {sub && <p className="mt-0.5 text-[10px] text-muted">{sub}</p>}
    </div>
  );
}

function Badge({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        active ? "bg-glow/15 text-glow" : "bg-line/60 text-muted"
      }`}
    >
      {children}
    </span>
  );
}
