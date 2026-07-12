"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@/components/ui";
import { ProgressChart } from "@/components/ProgressChart";

export function BodyMeasurementTracker({
  history,
}: {
  history: { heightCm: number; weightKg: number }[];
}) {
  const router = useRouter();
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [saving, setSaving] = useState(false);

  const latest = history[history.length - 1];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/body-measurements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heightCm: Number(heightCm), weightKg: Number(weightKg) }),
    });
    setSaving(false);
    if (res.ok) {
      setHeightCm("");
      setWeightKg("");
      router.refresh();
    }
  }

  return (
    <Card>
      <h2 className="mb-1 font-condensed text-lg font-bold uppercase">Suivi de croissance</h2>
      <p className="mb-3 text-xs text-muted">
        En pleine puberté, ton gabarit change vite — ça sert à garder ton programme ajusté.
      </p>

      {latest && (
        <p className="tnum mb-3 text-sm">
          Dernière mesure : <span className="font-bold text-glow">{latest.heightCm} cm</span> ·{" "}
          <span className="font-bold text-glow">{latest.weightKg} kg</span>
        </p>
      )}

      {history.length >= 2 && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1 text-[10px] uppercase text-muted">Taille</p>
            <ProgressChart values={history.map((h) => h.heightCm)} />
          </div>
          <div>
            <p className="mb-1 text-[10px] uppercase text-muted">Poids</p>
            <ProgressChart values={history.map((h) => h.weightKg)} />
          </div>
        </div>
      )}

      <form onSubmit={submit} className="flex gap-2">
        <Input
          type="number"
          placeholder="Taille (cm)"
          value={heightCm}
          onChange={(e) => setHeightCm(e.target.value)}
          required
        />
        <Input
          type="number"
          placeholder="Poids (kg)"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          required
        />
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "…" : "Ajouter"}
        </Button>
      </form>
    </Card>
  );
}
