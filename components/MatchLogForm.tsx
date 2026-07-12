"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@/components/ui";

export function MatchLogForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    opponent: "",
    competition: "",
    minutesPlayed: "",
    goals: "0",
    assists: "0",
    rating: "",
    note: "",
    focusNext: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: form.date,
        opponent: form.opponent.trim() || null,
        competition: form.competition.trim() || null,
        minutesPlayed: form.minutesPlayed ? Number(form.minutesPlayed) : null,
        goals: Number(form.goals) || 0,
        assists: Number(form.assists) || 0,
        rating: form.rating ? Number(form.rating) : null,
        note: form.note.trim() || null,
        focusNext: form.focusNext.trim() || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setOpen(false);
      setForm({ ...form, opponent: "", competition: "", minutesPlayed: "", goals: "0", assists: "0", rating: "", note: "", focusNext: "" });
      router.refresh();
    } else {
      setError("Échec, vérifie les champs.");
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="sm" className="w-full">
        + Ajouter un match
      </Button>
    );
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-2">
        <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        <Input
          placeholder="Adversaire (optionnel)"
          value={form.opponent}
          onChange={(e) => setForm({ ...form, opponent: e.target.value })}
        />
        <Input
          placeholder="Compétition (championnat, coupe...)"
          value={form.competition}
          onChange={(e) => setForm({ ...form, competition: e.target.value })}
        />
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="mb-1 block text-[10px] uppercase text-muted">Minutes</label>
            <Input type="number" value={form.minutesPlayed} onChange={(e) => setForm({ ...form, minutesPlayed: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase text-muted">Buts</label>
            <Input type="number" value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase text-muted">Passes D.</label>
            <Input type="number" value={form.assists} onChange={(e) => setForm({ ...form, assists: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[10px] uppercase text-muted">Ta note sur 10</label>
          <Input type="number" min={1} max={10} value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
        </div>
        <Input
          placeholder="Un truc à travailler la prochaine fois"
          value={form.focusNext}
          onChange={(e) => setForm({ ...form, focusNext: e.target.value })}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button type="submit" size="sm" disabled={saving} className="flex-1">
            {saving ? "Enregistrement…" : "Enregistrer le match"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
