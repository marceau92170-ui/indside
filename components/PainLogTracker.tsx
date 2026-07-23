"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input } from "@/components/ui";
import { Icon } from "@/components/Icon";

type PainEntry = { id: string; bodyPart: string; intensity: number; note: string | null; resolved: boolean; date: string };

const COMMON_ZONES = ["Genou", "Cheville", "Ischio-jambiers", "Adducteurs", "Mollet", "Dos", "Épaule", "Hanche"];

export function PainLogTracker({ entries, premium }: { entries: PainEntry[]; premium: boolean }) {
  const router = useRouter();
  const [bodyPart, setBodyPart] = useState("");
  const [intensity, setIntensity] = useState(2);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [warning, setWarning] = useState(false);
  const [justLogged, setJustLogged] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!bodyPart.trim()) return;
    setSaving(true);
    setWarning(false);
    setJustLogged(false);
    const res = await fetch("/api/pain-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bodyPart: bodyPart.trim(), intensity, note: note.trim() || null }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      if (data.recurring) setWarning(true);
      setJustLogged(true);
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
        <div className="mb-3 flex gap-2 rounded-lg border border-glow bg-glow/10 p-3 text-xs">
          <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0 text-glow" />
          <span>
            Cette zone revient souvent ces 2 dernières semaines. Ce n&apos;est pas anodin — parles-en
            à un parent, un éducateur, ou un professionnel de santé.
          </span>
        </div>
      )}

      {justLogged && !premium && (
        <div className="mb-3 rounded-lg border border-line bg-night p-3 text-xs">
          Enregistré. En <span className="font-bold text-glow">Premium</span>, ton prochain
          programme aurait évité automatiquement cette zone — là, c&apos;est à toi d&apos;y penser.{" "}
          <Link href="/premium" className="text-glow underline">
            En savoir plus
          </Link>
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

      <div className="mb-4 rounded-lg border border-line bg-night p-3 text-xs text-muted">
        Cet outil aide ton programme à s&apos;adapter, mais il ne remplace pas un avis médical.
        Une douleur qui persiste, qui revient, ou qui t&apos;empêche de jouer :{" "}
        <span className="font-semibold text-chalk">
          parles-en à un médecin, un kiné ou le staff de ton club
        </span>
        . En cas de douleur vive pendant un exercice, arrête-toi.
      </div>

      {!premium && unresolved.length > 0 && (
        <div className="mb-3 rounded-lg border border-glow/40 bg-glow/5 p-3 text-xs">
          {unresolved.length} gêne{unresolved.length > 1 ? "s" : ""} active{unresolved.length > 1 ? "s" : ""}, pas
          encore prise{unresolved.length > 1 ? "s" : ""} en compte dans tes séances.{" "}
          <Link href="/premium" className="font-bold text-glow underline">
            Passer Premium
          </Link>{" "}
          pour que ton programme s&apos;adapte tout seul.
        </div>
      )}

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
        <p className="text-xs text-muted">Rien à signaler en ce moment.</p>
      )}
    </Card>
  );
}
