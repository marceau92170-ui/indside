"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@/components/ui";

type Checkin = {
  sleepHours: number | null;
  sleepQuality: number;
  energy: number;
  soreness: number;
  mood: number;
} | null;

const SCALES: { key: "sleepQuality" | "energy" | "soreness" | "mood"; label: string; low: string; high: string }[] = [
  { key: "sleepQuality", label: "Qualité du sommeil", low: "Mauvaise", high: "Excellente" },
  { key: "energy", label: "Niveau d'énergie", low: "Épuisé", high: "En pleine forme" },
  { key: "soreness", label: "Courbatures", low: "Aucune", high: "Beaucoup" },
  { key: "mood", label: "Humeur", low: "Difficile", high: "Au top" },
];

export function WellnessForm({ today }: { today: Checkin }) {
  const router = useRouter();
  const [values, setValues] = useState({
    sleepHours: today?.sleepHours?.toString() ?? "",
    sleepQuality: today?.sleepQuality ?? 3,
    energy: today?.energy ?? 3,
    soreness: today?.soreness ?? 3,
    mood: today?.mood ?? 3,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function submit() {
    setSaving(true);
    const res = await fetch("/api/wellness", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sleepHours: values.sleepHours ? Number(values.sleepHours) : null,
        sleepQuality: values.sleepQuality,
        energy: values.energy,
        soreness: values.soreness,
        mood: values.mood,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <Card>
      <h2 className="mb-1 font-condensed text-lg font-bold uppercase">Check-in du jour</h2>
      <p className="mb-3 text-xs text-muted">
        30 secondes, comme les pros avant l&apos;entraînement. Ça n&apos;influence pas ta note —
        ça sert juste à repérer quand lever le pied.
      </p>

      <div className="mb-3">
        <label className="mb-1 block text-xs font-semibold text-muted">Heures de sommeil (optionnel)</label>
        <Input
          type="number"
          step="0.5"
          min={0}
          max={16}
          value={values.sleepHours}
          onChange={(e) => setValues({ ...values, sleepHours: e.target.value })}
          className="w-24"
        />
      </div>

      {SCALES.map((s) => (
        <div key={s.key} className="mb-3">
          <p className="mb-1 text-xs font-semibold">{s.label}</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setValues({ ...values, [s.key]: n })}
                className={`flex h-9 flex-1 items-center justify-center rounded-lg border font-condensed text-base font-bold ${
                  values[s.key] === n ? "border-glow bg-glow/10 text-glow" : "border-line text-muted"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="mt-0.5 flex justify-between text-[10px] text-muted">
            <span>{s.low}</span>
            <span>{s.high}</span>
          </div>
        </div>
      ))}

      <Button onClick={submit} disabled={saving} size="sm" className="w-full">
        {saving ? "…" : saved ? "✓ Mis à jour" : "Enregistrer mon check-in"}
      </Button>
    </Card>
  );
}
