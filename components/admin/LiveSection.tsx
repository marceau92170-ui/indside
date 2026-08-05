import { prisma } from "@/lib/prisma";
import { CLICK_LABELS, ROUTE_LABELS, normalizePath } from "@/lib/admin-labels";
import { AutoRefresh } from "@/components/AutoRefresh";

// Fenêtre sur laquelle on regarde l'activité récente (au-delà, on ne montre
// plus personne — sinon "en direct" finirait par lister toute la semaine).
const HISTORY_WINDOW_MS = 30 * 60 * 1000;
// En-deçà de ce délai depuis la dernière action, on considère le joueur "en
// ligne" plutôt que juste "récemment actif".
const ONLINE_WINDOW_MS = 3 * 60 * 1000;
// Rafraîchissement auto de la page — donne l'impression du direct sans
// WebSocket (voir components/AutoRefresh.tsx).
const REFRESH_MS = 6000;

type Event = { at: Date; kind: "vue" | "clic"; label: string };

function timeAgo(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 5) return "à l'instant";
  if (s < 60) return `il y a ${s} s`;
  const m = Math.round(s / 60);
  return `il y a ${m} min`;
}

// Qui est connecté MAINTENANT, ce qu'il fait, où il va — en 100% first-party
// (les mêmes pages vues / clics que UsageSection, mais sur les dernières
// minutes plutôt qu'agrégées sur 30 jours). Pas un remplacement de la
// relecture de session PostHog (activée séparément) : ceci montre le fil des
// pages et des boutons suivis, pas chaque pixel.
export async function LiveSection() {
  const since = new Date(Date.now() - HISTORY_WINDOW_MS);
  const [views, clicks] = await Promise.all([
    prisma.pageView.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      include: { user: { include: { profile: true } } },
    }),
    prisma.appClickEvent.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      include: { user: { include: { profile: true } } },
    }),
  ]);

  type UserRow = { id: string; name: string; events: Event[] };
  const byUser = new Map<string, UserRow>();

  function upsert(userId: string, displayName: string) {
    if (!byUser.has(userId)) byUser.set(userId, { id: userId, name: displayName, events: [] });
    return byUser.get(userId)!;
  }

  for (const v of views) {
    const name = v.user.profile?.firstName || v.user.name || v.user.email.split("@")[0];
    upsert(v.userId, name).events.push({
      at: v.createdAt,
      kind: "vue",
      label: ROUTE_LABELS[normalizePath(v.path)] ?? v.path,
    });
  }
  for (const c of clicks) {
    const name = c.user.profile?.firstName || c.user.name || c.user.email.split("@")[0];
    upsert(c.userId, name).events.push({
      at: c.createdAt,
      kind: "clic",
      label: CLICK_LABELS[c.label] ?? c.label,
    });
  }

  const now = Date.now();
  const rows = [...byUser.values()]
    .map((u) => {
      const events = u.events.sort((a, b) => b.at.getTime() - a.at.getTime());
      const lastAt = events[0]?.at ?? new Date(0);
      const sinceMs = now - lastAt.getTime();
      return { ...u, events: events.slice(0, 8), sinceMs, online: sinceMs <= ONLINE_WINDOW_MS };
    })
    .sort((a, b) => a.sinceMs - b.sinceMs);

  const onlineCount = rows.filter((r) => r.online).length;

  return (
    <div>
      <AutoRefresh intervalMs={REFRESH_MS} />
      <div className="mb-1 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-glow opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-glow" />
        </span>
        <h2 className="font-condensed text-xl font-bold uppercase">En direct</h2>
      </div>
      <p className="mb-4 text-xs text-muted">
        Actualisé toutes les {Math.round(REFRESH_MS / 1000)} s — 100% first-party (pages vues + boutons
        suivis). Pour la relecture pixel par pixel d&apos;une session, c&apos;est PostHog (session
        replay).
      </p>

      {rows.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-4 text-sm text-muted">
          Personne d&apos;actif sur les {Math.round(HISTORY_WINDOW_MS / 60000)} dernières minutes.
        </p>
      ) : (
        <>
          <p className="mb-4 text-xs text-muted">
            <span className="font-semibold text-glow">{onlineCount}</span> en ligne maintenant ·{" "}
            {rows.length} actif{rows.length > 1 ? "s" : ""} sur les {Math.round(HISTORY_WINDOW_MS / 60000)}{" "}
            dernières minutes.
          </p>
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.id} className="rounded-card border border-line bg-surface p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {r.online && (
                      <span className="h-2 w-2 flex-none rounded-full bg-glow" title="En ligne" />
                    )}
                    {r.name}
                  </p>
                  <span className="text-xs text-muted">{timeAgo(r.sinceMs)}</span>
                </div>
                <ul className="space-y-1 border-l border-line/60 pl-3">
                  {r.events.map((e, i) => (
                    <li key={i} className="flex items-baseline justify-between gap-2 text-xs">
                      <span className={e.kind === "clic" ? "text-glow" : "text-chalk"}>
                        {e.kind === "clic" ? "→ " : "· "}
                        {e.label}
                      </span>
                      <span className="flex-none text-muted">{timeAgo(now - e.at.getTime())}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
