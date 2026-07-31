import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Libellé lisible par section de l'app (1er segment du chemin — voir app/(app)/*).
const ROUTE_LABELS: Record<string, string> = {
  "/semaine": "Semaine (dashboard)",
  "/seance": "Séance (détail)",
  "/bibliotheque": "Bibliothèque d'exercices",
  "/historique": "Historique des semaines",
  "/matchs": "Carnet de match",
  "/objectifs": "Objectifs personnels",
  "/parrainage": "Parrainage",
  "/partenaire": "Espace partenaire",
  "/premium": "Premium / abonnement",
  "/profil": "Carte joueur / profil",
  "/reglages": "Réglages",
  "/ressources": "Ressources",
  "/sante": "Suivi santé",
  "/tests": "Tests d'évaluation",
  "/avis": "Avis",
};

const WINDOW_DAYS = 30;

function normalizePath(path: string): string {
  const seg = path.split("/").filter(Boolean)[0];
  return seg ? `/${seg}` : "/";
}

// Usage quotidien dans l'app : quelles pages sont visitées, par combien de
// joueurs distincts, et lesquelles sont largement ignorées — en 100%
// first-party (pas besoin d'aller sur PostHog pour cette vue).
// Accès : /admin/usage?secret=ADMIN_SECRET
export default async function AdminUsagePage({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string }>;
}) {
  const { secret } = await searchParams;
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted">
        Non autorisé.
      </main>
    );
  }

  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const rows = await prisma.pageView.findMany({
    where: { createdAt: { gte: since } },
    select: { path: true, userId: true },
  });

  const viewsByRoute = new Map<string, number>();
  const usersByRoute = new Map<string, Set<string>>();
  const allActiveUsers = new Set<string>();

  for (const r of rows) {
    const route = normalizePath(r.path);
    viewsByRoute.set(route, (viewsByRoute.get(route) ?? 0) + 1);
    if (!usersByRoute.has(route)) usersByRoute.set(route, new Set());
    usersByRoute.get(route)!.add(r.userId);
    allActiveUsers.add(r.userId);
  }

  const totalActive = allActiveUsers.size;
  const maxViews = Math.max(1, ...viewsByRoute.values());

  const ranked = [...viewsByRoute.entries()]
    .map(([route, views]) => ({
      route,
      label: ROUTE_LABELS[route] ?? route,
      views,
      uniqueUsers: usersByRoute.get(route)?.size ?? 0,
    }))
    .sort((a, b) => b.views - a.views);

  // Sections connues qui n'apparaissent dans AUCUNE visite sur la période —
  // les plus utiles à repérer : des fonctionnalités entièrement ignorées.
  const neverVisited = Object.entries(ROUTE_LABELS)
    .filter(([route]) => !viewsByRoute.has(route))
    .map(([route, label]) => ({ route, label }));

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 text-chalk">
      <Link href="/admin/stats" className="mb-4 inline-block text-xs text-muted hover:text-glow">
        ← Stats internes
      </Link>
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Usage des pages</h1>
      <p className="mb-6 text-sm text-muted">
        Ce que les joueurs utilisent vraiment au quotidien, {WINDOW_DAYS} derniers jours — 100%
        first-party, sans dépendre de PostHog pour cette vue.
      </p>

      {ranked.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-4 text-sm text-muted">
          Pas encore de données. Le suivi vient d&apos;être mis en place — reviens dans quelques
          heures/jours une fois que des joueurs auront navigué dans l&apos;app.
        </p>
      ) : (
        <>
          <p className="mb-4 text-xs text-muted">
            <span className="font-semibold text-chalk">{totalActive}</span> joueur
            {totalActive > 1 ? "s" : ""} actif{totalActive > 1 ? "s" : ""} sur la période.
          </p>
          <ul className="space-y-3">
            {ranked.map((r) => {
              const barPct = Math.max(2, Math.round((r.views / maxViews) * 100));
              const pctOfActive = totalActive > 0 ? Math.round((r.uniqueUsers / totalActive) * 100) : 0;
              return (
                <li key={r.route} className="rounded-card border border-line bg-surface p-3">
                  <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold">{r.label}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="tnum font-condensed text-xl font-bold text-glow">{r.views}</span>
                      <span className="text-xs text-muted">vues</span>
                      <span className="text-xs text-muted">
                        · {r.uniqueUsers} joueur{r.uniqueUsers > 1 ? "s" : ""} ({pctOfActive}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/50">
                    <div className="h-full rounded-full bg-glow" style={{ width: `${barPct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>

          {neverVisited.length > 0 && (
            <div className="mt-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
                Jamais visitées sur la période
              </p>
              <ul className="space-y-1">
                {neverVisited.map((r) => (
                  <li key={r.route} className="text-sm text-muted">
                    {r.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </main>
  );
}
