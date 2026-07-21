import { TESTIMONIALS, COACH_ENDORSEMENT, PLAYER_COUNT_THRESHOLD } from "@/lib/data/social";

// Bandeau de confiance : chiffres et gages VRAIS (jamais de faux avis).
export function TrustStrip({ playerCount }: { playerCount: number }) {
  const showCount = playerCount >= PLAYER_COUNT_THRESHOLD;
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-muted">
      <span className="font-semibold text-chalk">
        {showCount ? `${playerCount} joueurs s'entraînent déjà` : "Rejoins les premiers joueurs"}
      </span>
      <span aria-hidden="true">·</span>
      <span>Paiement sécurisé Stripe</span>
      <span aria-hidden="true">·</span>
      <span>Résiliable en 1 clic</span>
      <span aria-hidden="true">·</span>
      <span>Données minimales, sans pub</span>
    </div>
  );
}

// Endorsement coach + témoignages réels. Rien ne s'affiche tant que ce n'est pas rempli.
export function SocialProof() {
  const hasCoach = COACH_ENDORSEMENT.name.trim().length > 0;
  const hasTestimonials = TESTIMONIALS.length > 0;
  if (!hasCoach && !hasTestimonials) return null;

  return (
    <section className="mt-12 space-y-4">
      <h2 className="font-condensed text-2xl font-bold uppercase">Ils en parlent</h2>

      {hasCoach && (
        <figure className="rounded-card border border-glow/30 bg-surface p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-glow">
            Validé par un coach
          </p>
          <blockquote className="mt-2 text-sm text-chalk">
            « {COACH_ENDORSEMENT.quote} »
          </blockquote>
          <figcaption className="mt-2 text-xs text-muted">
            <span className="font-semibold text-chalk">{COACH_ENDORSEMENT.name}</span> —{" "}
            {COACH_ENDORSEMENT.role}
            {COACH_ENDORSEMENT.reach ? ` · ${COACH_ENDORSEMENT.reach}` : ""}
          </figcaption>
        </figure>
      )}

      {hasTestimonials && (
        <div className="grid gap-3 sm:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <figure key={i} className="rounded-card border border-line bg-surface p-4">
              <blockquote className="text-sm text-chalk">« {t.quote} »</blockquote>
              <figcaption className="mt-2 text-xs text-muted">
                <span className="font-semibold text-chalk">{t.name}</span> · {t.meta}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
