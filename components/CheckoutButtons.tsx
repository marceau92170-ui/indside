"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { PRICING } from "@/lib/plan";

export function CheckoutButtons() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState(false);

  async function checkout(plan: "monthly" | "annual") {
    setLoading(plan);
    setError(false);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    } else {
      setError(true);
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="mb-3 rounded-card border border-glow/40 bg-glow/10 px-4 py-3 text-center">
        <p className="font-condensed text-lg font-bold uppercase text-glow">
          7 jours gratuits
        </p>
        <p className="text-xs text-muted">
          Débloque tout, sans payer maintenant. Aucun débit si tu résilies avant la fin — en 1 clic.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card className="flex flex-col items-center border-glow">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-glow">Le plus choisi</p>
          <p className="tnum font-condensed text-3xl font-bold">{PRICING.annual.amount}</p>
          <p className="mb-3 text-xs text-muted">{PRICING.annual.period} · {PRICING.annual.saving}</p>
          <Button onClick={() => checkout("annual")} disabled={loading !== null} className="w-full">
            {loading === "annual" ? "Redirection…" : "Essayer 7 jours gratuits"}
          </Button>
          <p className="mt-1 text-[11px] text-muted">puis {PRICING.annual.amount}{PRICING.annual.period}</p>
        </Card>
        <Card className="flex flex-col items-center">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">Souple</p>
          <p className="tnum font-condensed text-3xl font-bold">{PRICING.monthly.amount}</p>
          <p className="mb-3 text-xs text-muted">{PRICING.monthly.period}</p>
          <Button
            variant="ghost"
            onClick={() => checkout("monthly")}
            disabled={loading !== null}
            className="w-full"
          >
            {loading === "monthly" ? "Redirection…" : "Essayer 7 jours gratuits"}
          </Button>
          <p className="mt-1 text-[11px] text-muted">puis {PRICING.monthly.amount}{PRICING.monthly.period}</p>
        </Card>
        {error && (
          <p className="col-span-full text-center text-xs text-red-400">
            Paiement indisponible pour le moment. Réessaie plus tard.
          </p>
        )}
      </div>
    </div>
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
