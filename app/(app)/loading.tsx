// Écran de chargement instantané, commun à toutes les pages de l'app.
// Next.js l'affiche IMMÉDIATEMENT au clic (pendant que le serveur prépare la page
// et interroge la base), puis le remplace par le contenu réel. Résultat : la
// navigation paraît fluide au lieu de « figée ». Le menu du bas (layout) reste visible.
export default function Loading() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      {/* titre */}
      <div className="mb-2 h-8 w-1/2 rounded bg-line/70" />
      <div className="mb-6 h-4 w-3/4 rounded bg-line/40" />

      {/* quelques blocs façon cartes */}
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-card border border-line bg-surface p-4">
            <div className="mb-2 h-5 w-2/5 rounded bg-line/60" />
            <div className="h-3 w-4/5 rounded bg-line/30" />
          </div>
        ))}
      </div>

      <span className="sr-only">Chargement…</span>
    </div>
  );
}
