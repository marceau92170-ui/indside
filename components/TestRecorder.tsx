"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

export function TestRecorder({
  testType,
  unit,
  locked,
}: {
  testType: string;
  unit: string;
  locked: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function save() {
    const num = Number(value.replace(",", "."));
    if (!num || num <= 0) return;
    setSaving(true);
    setError(false);
    const res = await fetch("/api/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testType, value: num }),
    });
    setSaving(false);
    if (res.ok) {
      setValue("");
      router.refresh();
    } else {
      setError(true);
    }
  }

  if (locked) {
    return <p className="text-xs text-muted">🔒 Enregistrement réservé aux membres Premium.</p>;
  }

  return (
    <div className="flex gap-2">
      <Input
        type="number"
        inputMode="decimal"
        step="0.1"
        placeholder={`Résultat (${unit})`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1"
      />
      <Button size="sm" onClick={save} disabled={saving || !value}>
        {saving ? "…" : "Enregistrer"}
      </Button>
      {error && <p className="text-xs text-red-400">Erreur</p>}
    </div>
  );
}
