"use client";

import { useState } from "react";
import { Button, Card, Input } from "@/components/ui";

type Goal = { id: string; title: string; targetDate: string | null; done: boolean };

export function GoalsList({ initialGoals }: { initialGoals: Goal[] }) {
  const [goals, setGoals] = useState(initialGoals);
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = goals.filter((g) => !g.done);
  const done = goals.filter((g) => g.done);

  async function addGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), targetDate: targetDate || null }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setGoals((prev) => [{ ...data.goal, targetDate: data.goal.targetDate }, ...prev]);
      setTitle("");
      setTargetDate("");
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Échec, réessaie.");
    }
  }

  async function toggleDone(goal: Goal) {
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, done: !g.done } : g)));
    await fetch("/api/goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: goal.id, done: !goal.done }),
    });
  }

  async function remove(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    await fetch("/api/goals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  return (
    <div>
      <form onSubmit={addGoal} className="mb-5 space-y-2">
        <Input
          placeholder="Ex : jongler 100 fois sans faire tomber le ballon"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
        <div className="flex gap-2">
          <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="flex-1" />
          <Button type="submit" disabled={saving || !title.trim()} size="sm">
            {saving ? "…" : "Ajouter"}
          </Button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>

      {active.length === 0 && done.length === 0 && (
        <Card className="text-center text-sm text-muted">Aucun objectif pour l&apos;instant.</Card>
      )}

      <ul className="space-y-2">
        {active.map((g) => (
          <li key={g.id}>
            <Card className="flex items-center justify-between gap-3">
              <div>
                <p className="font-condensed text-lg font-bold leading-tight">{g.title}</p>
                {g.targetDate && (
                  <p className="text-xs text-muted">
                    Cible : {new Date(g.targetDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => toggleDone(g)}
                  className="rounded-full border border-glow px-3 py-1 text-xs font-bold text-glow"
                >
                  ✓ Atteint
                </button>
                <button onClick={() => remove(g.id)} className="text-xs text-muted underline">
                  Suppr.
                </button>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {done.length > 0 && (
        <>
          <h2 className="mb-2 mt-6 font-condensed text-lg font-bold uppercase text-muted">Atteints</h2>
          <ul className="space-y-2">
            {done.map((g) => (
              <li key={g.id}>
                <Card className="flex items-center justify-between gap-3 opacity-60">
                  <p className="text-sm line-through">{g.title}</p>
                  <button onClick={() => toggleDone(g)} className="text-xs text-muted underline">
                    Rouvrir
                  </button>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
