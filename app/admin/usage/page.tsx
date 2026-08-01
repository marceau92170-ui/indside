import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Libellé lisible par bouton/action trackée (voir lib/click-track.ts, trackClick).
// Instrumenté au fil de l'eau — tous les boutons ne sont pas encore suivis.
const CLICK_LABELS: Record<string, string> = {
  program_regenerate: "Régénérer le programme",
};

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
// Au-delà de ce délai d'inactivité, on considère qu'une nouvelle "session"
// commence — sert à repérer la DERNIÈRE page vue avant que le joueur ne
// quitte, session par session (pas juste la dernière page vue au global).
const SESSION_GAP_MS = 20 * 60 * 1000;

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
    select: { path: true, userId: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const viewsByRoute = new Map<string, number>();
  const usersByRoute = new Map<string, Set<string>>();
  const allActiveUsers = new Set<string>();
  const viewsByUser = new Map<string, { path: string; at: Date }[]>();

  for (const r of rows) {
    const route = normalizePath(r.path);
    viewsByRoute.set(route, (viewsByRoute.get(route) ?? 0) + 1);
    if (!usersByRoute.has(route)) usersByRoute.set(route, new Set());
    usersByRoute.get(route)!.add(r.userId);
    allActiveUsers.add(r.userId);
    if (!viewsByUser.has(r.userId)) viewsByUser.set(r.userId, []);
    viewsByUser.get(r.userId)!.push({ path: r.path, at: r.createdAt });
  }

  // Dernière page vue avant chaque coupure d'activité (session par session) —
  // répond directement à "à quel moment ils quittent".
  const exitCounts = new Map<string, number>();
  for (const views of viewsByUser.values()) {
    for (let i = 0; i < views.length; i++) {
      const isEndOfSession =
        i === views.length - 1 ||
        views[i + 1].at.getTime() - views[i].at.getTime() > SESSION_GAP_MS;
      if (isEndOfSession) {
        const route = normalizePath(views[i].path);
        exitCounts.set(route, (exitCounts.get(route) ?? 0) + 1);
      }
    }
  }
  const totalSessions = [...exitCounts.values()].reduce((a, b) => a + b, 0);
  const exitRanked = [...exitCounts.entries()]
    .map(([route, count]) => ({ route, label: ROUTE_LABELS[route] ?? route, count }))
    .sort((a, b) => b.count - a.count);
  const maxExit = Math.max(1, ...exitCounts.values());

  const clickRows = await prisma.appClickEvent.groupBy({
    by: ["label"],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
    orderBy: { _count: { label: "desc" } },
  });
  const clickRanked = clickRows.map((c) => ({
    label: c.label,
    displayLabel: CLICK_LABELS[c.label] ?? c.label,
    count: c._count._all,
  }));
  const maxClicks = Math.max(1, ...clickRanked.map((c) => c.count));

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

          {clickRanked.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-1 font-condensed text-xl font-bold uppercase">Boutons cliqués</h2>
              <p className="mb-4 text-xs text-muted">
                Instrumenté au fil de l&apos;eau — pas encore tous les boutons de l&apos;app.
              </p>
              <ul className="space-y-3">
                {clickRanked.map((c) => {
                  const barPct = Math.max(2, Math.round((c.count / maxClicks) * 100));
                  return (
                    <li key={c.label} className="rounded-card border border-line bg-surface p-3">
                      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-semibold">{c.displayLabel}</p>
                        <span className="tnum font-condensed text-xl font-bold text-glow">{c.count}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/50">
                        <div className="h-full rounded-full bg-glow" style={{ width: `${barPct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

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

          {exitRanked.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-1 font-condensed text-xl font-bold uppercase">Où ils quittent</h2>
              <p className="mb-4 text-xs text-muted">
                Dernière page vue avant {Math.round(SESSION_GAP_MS / 60000)} min d&apos;inactivité —{" "}
                {totalSessions} session{totalSessions > 1 ? "s" : ""} sur la période.
              </p>
              <ul className="space-y-3">
                {exitRanked.map((r) => {
                  const barPct = Math.max(2, Math.round((r.count / maxExit) * 100));
                  const pct = totalSessions > 0 ? Math.round((r.count / totalSessions) * 100) : 0;
                  return (
                    <li key={r.route} className="rounded-card border border-line bg-surface p-3">
                      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-semibold">{r.label}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="tnum font-condensed text-xl font-bold text-glow">{r.count}</span>
                          <span className="text-xs text-muted">
                            fin{r.count > 1 ? "s" : ""} de session ({pct}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/50">
                        <div className="h-full rounded-full bg-[#ECC53A]" style={{ width: `${barPct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </main>
  );
}
