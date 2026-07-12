"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@/components/ui";

type PainEntry = { id: string; bodyPart: string; intensity: number; note: string | null; resolved: boolean; date: string };

const COMMON_ZONES = ["Genou", "Cheville", "Ischio-jambiers", "Adducteurs", "Mollet", "Dos", "Épaule", "Hanche"];

export function PainLogTracker({ entries }: { entries: PainEntry[] }) {
  const router = useRouter();
  const [bodyPart, setBodyPart] = useState("");
  const [intensity, setIntensity] = useState(2);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [warning, setWarning] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!bodyPart.trim()) return;
    setSaving(true);
    setWarning(false);
    const res = await fetch("/api/pain-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bodyPart: bodyPart.trim(), intensity, note: note.trim() || null }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      if (data.recurring) setWarning(true);
      setBodyPart("");
      setNote("");
      setIntensity(2);
      router.refresh();
    }
  }

  async function toggleResolved(id: string, resolved: boolean) {
    await fetch("/api/pain-logs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, resolved }),
    });
    router.refresh();
  }

  const unresolved = entries.filter((e) => !e.resolved);

  return (
    <Card>
      <h2 className="mb-1 font-condensed text-lg font-bold uppercase">Carnet de douleurs</h2>
      <p className="mb-3 text-xs text-muted">
        Repérer une gêne qui revient AVANT qu&apos;elle devienne une vraie blessure — c&apos;est ce
        que font les pros avec leur staff médical.
      </p>

      {warning && (
        <div className="mb-3 rounded-lg border border-glow bg-glow/10 p-3 text-xs">
          ⚠️ Cette zone revient souvent ces 2 dernières semaines. Ce n&apos;est pas anodin — parles-en
          à un parent, un éducateur, ou un professionnel de santé.
        </div>
      )}

      <form onSubmit={submit} className="mb-4 space-y-2">
        <Input
          list="zones"
          placeholder="Zone concernée (ex : genou droit)"
          value={bodyPart}
          onChange={(e) => setBodyPart(e.target.value)}
        />
        <datalist id="zones">
          {COMMON_ZONES.map((z) => (
            <option key={z} value={z} />
          ))}
        </datalist>
        <div>
          <p className="mb-1 text-xs font-semibold text-muted">Intensité</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setIntensity(n)}
                className={`flex h-9 flex-1 items-center justify-center rounded-lg border font-condensed text-base font-bold ${
                  intensity === n ? "border-glow bg-glow/10 text-glow" : "border-line text-muted"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <Input placeholder="Note (optionnel)" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button type="submit" size="sm" disabled={saving || !bodyPart.trim()} className="w-full">
          {saving ? "…" : "Signaler"}
        </Button>
      </form>

      {unresolved.length > 0 && (
        <ul className="space-y-2">
          {unresolved.map((e) => (
            <li key={e.id} className="flex items-center justify-between rounded-lg border border-line p-2.5 text-sm">
              <div>
                <p className="font-semibold">
                  {e.bodyPart} <span className="tnum text-muted">· {e.intensity}/5</span>
                </p>
                <p className="text-[11px] text-muted">
                  {new Date(e.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  {e.note ? ` — ${e.note}` : ""}
                </p>
              </div>
              <button onClick={() => toggleResolved(e.id, true)} className="shrink-0 text-xs text-glow underline">
                Résolu
              </button>
            </li>
          ))}
        </ul>
      )}
      {unresolved.length === 0 && entries.length > 0 && (
        <p className="text-xs text-muted">Rien à signaler en ce moment. 👍</p>
      )}
    </Card>
  );
}
