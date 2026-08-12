"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { PRICING } from "@/lib/plan";
import { track } from "@/lib/analytics";
import { trackClick } from "@/lib/click-track";

export function CheckoutButtons() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(plan: "monthly" | "annual") {
    const key = plan;
    setLoading(key);
    setError(null);
    track("premium_checkout_started", { plan });
    trackClick(`checkout_${plan}_pay`);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
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
        <p className="font-condensed text-lg font-bold uppercase text-glow">Passe Premium</p>
        <p className="text-xs text-muted">
          Débit immédiat, puis renouvellement automatique. Résiliable à tout moment en 1 clic.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PlanCard
          highlighted
          badge="★ Meilleure offre"
          tagline="Le plus choisi"
          amount={PRICING.annual.amount}
          sub={`${PRICING.annual.period} · ${PRICING.annual.saving}`}
          loading={loading}
          plan="annual"
          onPay={() => checkout("annual")}
          busy={busy}
        />
        <PlanCard
          tagline="Souple"
          amount={PRICING.monthly.amount}
          sub={PRICING.monthly.period}
          loading={loading}
          plan="monthly"
          onPay={() => checkout("monthly")}
          busy={busy}
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
  loading,
  plan,
  onPay,
  busy,
}: {
  highlighted?: boolean;
  badge?: string;
  tagline: string;
  amount: string;
  sub: string;
  loading: string | null;
  plan: "monthly" | "annual";
  onPay: () => void;
  busy: boolean;
}) {
  const payKey = plan;
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

      <Button
        variant={highlighted ? "primary" : "ghost"}
        onClick={onPay}
        disabled={busy}
        className="w-full"
      >
        {loading === payKey ? "Redirection…" : "S'abonner"}
      </Button>
      <p className="mt-1 text-[11px] text-muted">Débit immédiat · {amount}</p>
    </Card>
  );
}

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function portal() {
    trackClick("manage_subscription");
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
