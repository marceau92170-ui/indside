"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { PRICING } from "@/lib/plan";

export function CheckoutButtons({ hasUsedTrial = false }: { hasUsedTrial?: boolean }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canTrial = !hasUsedTrial;

  async function checkout(plan: "monthly" | "annual", trial: boolean) {
    const key = `${plan}:${trial ? "t" : "p"}`;
    setLoading(key);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, trial }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.url) {
        window.location.href = data.url;
        return;
      }
      setError(data?.message || data?.error || `Erreur ${res.status}`);
      setLoading(null);
    } catch {
      setError("Connexion impossible. Vérifie ta connexion et réessaie.");
      setLoading(null);
    }
  }

  const busy = loading !== null;

  return (
    <div>
      <div className="mb-3 rounded-card border border-glow/40 bg-glow/10 px-4 py-3 text-center">
        {canTrial ? (
          <>
            <p className="font-condensed text-lg font-bold uppercase text-glow">7 jours gratuits</p>
            <p className="text-xs text-muted">
              Débloque tout, sans payer maintenant. Aucun débit si tu résilies avant la fin — en 1 clic.
              Tu peux aussi payer directement.
            </p>
          </>
        ) : (
          <>
            <p className="font-condensed text-lg font-bold uppercase text-glow">Passe Premium</p>
            <p className="text-xs text-muted">
              Ton essai gratuit a déjà été utilisé sur ce compte. Abonne-toi quand tu veux, résiliable
              en 1 clic.
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PlanCard
          highlighted
          badge="★ Meilleure offre"
          tagline="Le plus choisi"
          amount={PRICING.annual.amount}
          sub={`${PRICING.annual.period} · ${PRICING.annual.saving}`}
          canTrial={canTrial}
          loading={loading}
          plan="annual"
          onTrial={() => checkout("annual", true)}
          onPay={() => checkout("annual", false)}
          busy={busy}
          footer={`puis ${PRICING.annual.amount}${PRICING.annual.period}`}
        />
        <PlanCard
          tagline="Souple"
          amount={PRICING.monthly.amount}
          sub={PRICING.monthly.period}
          canTrial={canTrial}
          loading={loading}
          plan="monthly"
          onTrial={() => checkout("monthly", true)}
          onPay={() => checkout("monthly", false)}
          busy={busy}
          footer={`puis ${PRICING.monthly.amount}${PRICING.monthly.period}`}
        />
        {error && (
          <div className="col-span-full rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-center">
            <p className="text-xs font-semibold text-red-300">Paiement indisponible pour le moment.</p>
            <p className="mt-1 break-words text-[11px] text-red-300/80">Détail : {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PlanCard({
  highlighted = false,
  badge,
  tagline,
  amount,
  sub,
  canTrial,
  loading,
  plan,
  onTrial,
  onPay,
  busy,
  footer,
}: {
  highlighted?: boolean;
  badge?: string;
  tagline: string;
  amount: string;
  sub: string;
  canTrial: boolean;
  loading: string | null;
  plan: "monthly" | "annual";
  onTrial: () => void;
  onPay: () => void;
  busy: boolean;
  footer: string;
}) {
  const trialKey = `${plan}:t`;
  const payKey = `${plan}:p`;
  return (
    <Card className={`relative flex flex-col items-center ${highlighted ? "border-glow" : ""}`}>
      {badge && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 animate-pulse rounded-full bg-glow px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
          {badge}
        </span>
      )}
      <p
        className={`mb-1 mt-1 text-xs font-bold uppercase tracking-wide ${
          highlighted ? "text-glow" : "text-muted"
        }`}
      >
        {tagline}
      </p>
      <p className="tnum font-condensed text-3xl font-bold">{amount}</p>
      <p className="mb-3 text-xs text-muted">{sub}</p>

      {canTrial ? (
        <>
          <Button
            variant={highlighted ? "primary" : "ghost"}
            onClick={onTrial}
            disabled={busy}
            className="w-full"
          >
            {loading === trialKey ? "Redirection…" : "Essayer 7 jours gratuits"}
          </Button>
          <button
            type="button"
            onClick={onPay}
            disabled={busy}
            className="mt-2 text-[11px] font-semibold text-muted underline underline-offset-2 hover:text-chalk disabled:opacity-50"
          >
            {loading === payKey ? "Redirection…" : "ou payer directement"}
          </button>
          <p className="mt-1 text-[11px] text-muted">{footer}</p>
        </>
      ) : (
        <>
          <Button
            variant={highlighted ? "primary" : "ghost"}
            onClick={onPay}
            disabled={busy}
            className="w-full"
          >
            {loading === payKey ? "Redirection…" : "S'abonner"}
          </Button>
          <p className="mt-1 text-[11px] text-muted">Débit immédiat · {amount}</p>
        </>
      )}
    </Card>
  );
}

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function portal() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    } else {
      setLoading(false);
    }
  }

  return (
    <Button variant="ghost" onClick={portal} disabled={loading}>
      {loading ? "Redirection…" : "Gérer mon abonnement"}
    </Button>
  );
}
