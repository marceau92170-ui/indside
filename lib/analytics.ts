import posthog from "posthog-js";

// Mêmes garde-fous que components/PostHogProvider.tsx : sans clé configurée,
// tout est no-op (aucun appel réseau, aucune donnée envoyée).
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

export function track(event: string, properties?: Record<string, unknown>) {
  if (!KEY) return;
  posthog.capture(event, properties);
}

// Relie les événements au compte réel (identifiant interne uniquement, jamais
// l'e-mail) — sans ça, chaque événement reste anonyme et illisible d'une
// visite à l'autre.
export function identifyUser(id: string) {
  if (!KEY) return;
  posthog.identify(id);
}
