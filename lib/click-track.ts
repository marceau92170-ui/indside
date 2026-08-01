// Enregistre un clic sur un bouton/action jugé important, en 100%
// first-party — voir /admin/usage. Fire-and-forget, ne doit jamais bloquer
// l'action de l'utilisateur ni faire échouer le clic si ça rate.
export function trackClick(label: string) {
  if (typeof window === "undefined") return;
  fetch("/api/track/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label, path: window.location.pathname }),
    keepalive: true,
  }).catch(() => {
    // non bloquant
  });
}
