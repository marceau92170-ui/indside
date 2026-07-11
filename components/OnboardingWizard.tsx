"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { PlayerCard } from "@/components/PlayerCard";
import {
  EQUIPMENT,
  GOALS,
  LEAGUES,
  LEVEL_TYPES,
  POSITIONS,
  DAYS_FR,
} from "@/lib/constants";

type State = {
  firstName: string;
  birthYear: number | null;
  position: string;
  levelType: string;
  division: string;
  region: string;
  district: string;
  heightCm: string;
  weightKg: string;
  clubTrainings: number;
  matchDay: number | null; // -1 encodé null = pas de match
  equipment: string[];
  goal: string;
  weakness: string;
  parentEmail: string;
  parentConsent: boolean;
};

const INITIAL: State = {
  firstName: "",
  birthYear: null,
  position: "",
  levelType: "",
  division: "",
  region: "",
  district: "",
  heightCm: "",
  weightKg: "",
  clubTrainings: 2,
  matchDay: 6,
  equipment: ["ballon"],
  goal: "",
  weakness: "",
  parentEmail: "",
  parentConsent: false,
};

function categoryOf(birthYear: number): string {
  const now = new Date();
  const end = now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear();
  return `U${end - birthYear}`;
}

function ageOf(birthYear: number): number {
  return new Date().getFullYear() - birthYear;
}

// Un ado interrompu (appel, notif, batterie) ne doit pas repartir de zéro.
const STORAGE_KEY = "progressa-onboarding-v1";

export function OnboardingWizard({ birthYears }: { birthYears: number[] }) {
  const router = useRouter();
  const [s, setS] = useState<State>(INITIAL);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Restaure une session interrompue (localStorage) au premier rendu client.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: Partial<State>; step?: number };
        if (parsed.state) setS((prev) => ({ ...prev, ...parsed.state }));
        if (typeof parsed.step === "number") setStep(parsed.step);
      }
    } catch {
      // localStorage indisponible ou corrompu : on repart simplement de zéro
    }
    setHydrated(true);
  }, []);

  // Sauvegarde à chaque changement, une fois la restauration initiale faite.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: s, step }));
    } catch {
      // quota dépassé ou navigation privée : tant pis, pas bloquant
    }
  }, [s, step, hydrated]);

  const isMinor15 = s.birthYear !== null && ageOf(s.birthYear) < 15;

  // 8 questions + consentement parental éventuel + carte finale
  const totalSteps = 8 + (isMinor15 ? 1 : 0);

  const set = (patch: Partial<State>) => setS((prev) => ({ ...prev, ...patch }));

  const canNext = useMemo(() => {
    switch (step) {
      case 0:
        return s.firstName.trim().length >= 2 && s.birthYear !== null;
      case 1:
        return Boolean(s.position);
      case 2:
        return Boolean(s.levelType && s.division && s.region);
      case 3: {
        const h = Number(s.heightCm);
        const w = Number(s.weightKg);
        return h >= 120 && h <= 210 && w >= 30 && w <= 110;
      }
      case 4:
        return s.clubTrainings >= 0;
      case 5:
        return true; // matériel : "rien" est un choix valide
      case 6:
        return Boolean(s.goal);
      case 7:
        return true; // point faible optionnel
      case 8:
        return !isMinor15 || (s.parentConsent && /.+@.+\..+/.test(s.parentEmail));
      default:
        return true;
    }
  }, [step, s, isMinor15]);

  async function finish() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: s.firstName.trim(),
          birthYear: s.birthYear,
          position: s.position,
          levelType: s.levelType,
          division: s.division,
          region: s.region,
          district: s.district.trim() || null,
          heightCm: Number(s.heightCm),
          weightKg: Number(s.weightKg),
          clubTrainingsPerWeek: s.clubTrainings,
          matchDay: s.matchDay,
          equipment: s.equipment,
          goal: s.goal,
          weakness: s.weakness.trim() || null,
          parentEmail: isMinor15 ? s.parentEmail.trim() : null,
          parentConsent: isMinor15 ? s.parentConsent : false,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // pas bloquant
      }
      router.push("/semaine");
      router.refresh();
    } catch {
      setError("Un problème est survenu. Réessaie.");
      setSubmitting(false);
    }
  }

  const lastQuestionStep = totalSteps - 1;

  return (
    <div>
      {/* progression visible */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-lg tracking-wider">PROGRESSA</span>
          <span className="tnum text-xs text-muted">
            {Math.min(step + 1, totalSteps)}/{totalSteps}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-glow transition-all duration-300"
            style={{ width: `${(Math.min(step + 1, totalSteps) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {step === 0 && (
        <StepShell title="C'est quoi ton prénom ?">
          <Input
            placeholder="Ton prénom"
            value={s.firstName}
            onChange={(e) => set({ firstName: e.target.value })}
            autoFocus
            maxLength={20}
          />
          <p className="mb-2 mt-6 font-condensed text-lg font-bold uppercase">Ton année de naissance ?</p>
          <div className="grid grid-cols-3 gap-2">
            {birthYears.map((y) => (
              <Choice key={y} active={s.birthYear === y} onClick={() => set({ birthYear: y })}>
                {y}
              </Choice>
            ))}
          </div>
          {s.birthYear && (
            <p className="stat-pop mt-4 text-center font-condensed text-xl font-bold text-glow">
              Tu joues en {categoryOf(s.birthYear)} 👊
            </p>
          )}
        </StepShell>
      )}

      {step === 1 && (
        <StepShell title="Ton poste ?">
          <div className="grid grid-cols-2 gap-2">
            {POSITIONS.map((p) => (
              <Choice key={p.key} active={s.position === p.key} onClick={() => set({ position: p.key })}>
                {p.label}
              </Choice>
            ))}
          </div>
        </StepShell>
      )}

      {step === 2 && (
        <StepShell title="Ton niveau actuel ?">
          <div className="space-y-2">
            {LEVEL_TYPES.map((lt) => (
              <Choice
                key={lt.key}
                active={s.levelType === lt.key}
                onClick={() => set({ levelType: lt.key, division: "" })}
                full
              >
                <span className="block">{lt.label}</span>
                <span className="block text-xs font-normal text-muted">{lt.hint}</span>
              </Choice>
            ))}
          </div>
          {s.levelType && (
            <>
              <p className="mb-2 mt-5 font-condensed text-lg font-bold uppercase">Ta division ?</p>
              <div className="flex flex-wrap gap-2">
                {LEVEL_TYPES.find((l) => l.key === s.levelType)!.divisions.map((d) => (
                  <Choice key={d} active={s.division === d} onClick={() => set({ division: d })}>
                    {d}
                  </Choice>
                ))}
              </div>
            </>
          )}
          {s.division && (
            <>
              <p className="mb-2 mt-5 font-condensed text-lg font-bold uppercase">Ta ligue ?</p>
              <select
                value={s.region}
                onChange={(e) => set({ region: e.target.value })}
                className="w-full rounded-lg border border-line bg-night px-4 py-3 text-chalk focus:border-glow focus:outline-none"
              >
                <option value="">Choisis ta ligue…</option>
                {LEAGUES.map((l) => (
                  <option key={l.key} value={l.key}>
                    {l.name}
                  </option>
                ))}
              </select>
              {s.levelType === "DISTRICT" && (
                <div className="mt-3">
                  <Input
                    placeholder="Ton district (ex : Hauts-de-Seine) — optionnel"
                    value={s.district}
                    onChange={(e) => set({ district: e.target.value })}
                    maxLength={40}
                  />
                </div>
              )}
            </>
          )}
        </StepShell>
      )}

      {step === 3 && (
        <StepShell
          title="Ton gabarit ?"
          subtitle="Pour adapter le programme : un joueur léger ne travaille pas comme un joueur en pleine croissance."
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">Taille (cm)</label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="172"
                value={s.heightCm}
                onChange={(e) => set({ heightCm: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">Poids (kg)</label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="60"
                value={s.weightKg}
                onChange={(e) => set({ weightKg: e.target.value })}
              />
            </div>
          </div>
        </StepShell>
      )}

      {step === 4 && (
        <StepShell
          title="Ton rythme club ?"
          subtitle="Ton programme se cale autour : jamais de grosse séance la veille d'un match."
        >
          <p className="mb-2 text-sm font-semibold text-muted">Entraînements club par semaine</p>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((n) => (
              <Choice key={n} active={s.clubTrainings === n} onClick={() => set({ clubTrainings: n })}>
                {n}
              </Choice>
            ))}
          </div>
          <p className="mb-2 mt-5 text-sm font-semibold text-muted">Jour de match</p>
          <div className="grid grid-cols-4 gap-2">
            {DAYS_FR.map((d, i) => (
              <Choice key={d} active={s.matchDay === i} onClick={() => set({ matchDay: i })}>
                {d.slice(0, 3)}
              </Choice>
            ))}
            <Choice active={s.matchDay === null} onClick={() => set({ matchDay: null })}>
              Aucun
            </Choice>
          </div>
        </StepShell>
      )}

      {step === 5 && (
        <StepShell title="Ton matériel ?" subtitle="Coche tout ce que tu as sous la main.">
          <div className="space-y-2">
            {EQUIPMENT.map((eq) => {
              const active = s.equipment.includes(eq.key);
              return (
                <Choice
                  key={eq.key}
                  active={active}
                  full
                  onClick={() =>
                    set({
                      equipment: active
                        ? s.equipment.filter((k) => k !== eq.key)
                        : [...s.equipment, eq.key],
                    })
                  }
                >
                  {eq.label} {active && "✓"}
                </Choice>
              );
            })}
            <Choice active={s.equipment.length === 0} full onClick={() => set({ equipment: [] })}>
              Rien du tout {s.equipment.length === 0 && "✓"}
            </Choice>
          </div>
        </StepShell>
      )}

      {step === 6 && (
        <StepShell title="Ton objectif n°1 ?">
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((g) => (
              <Choice key={g.key} active={s.goal === g.key} onClick={() => set({ goal: g.key })} full>
                <span className="mr-1">{g.emoji}</span> {g.label}
              </Choice>
            ))}
          </div>
        </StepShell>
      )}

      {step === 7 && (
        <StepShell
          title="Ton point faible ?"
          subtitle="Dis-le avec tes mots : « mon pied gauche », « je perds mes duels »… Ton programme l'attaquera chaque semaine."
        >
          <Input
            placeholder="Ex : mon pied gauche"
            value={s.weakness}
            onChange={(e) => set({ weakness: e.target.value })}
            maxLength={120}
          />
        </StepShell>
      )}

      {step === 8 && isMinor15 && (
        <StepShell
          title="Accord parental"
          subtitle="Tu as moins de 15 ans : la loi française demande l'accord d'un parent pour créer ton profil."
        >
          <Input
            type="email"
            placeholder="E-mail d'un parent"
            value={s.parentEmail}
            onChange={(e) => set({ parentEmail: e.target.value })}
          />
          <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={s.parentConsent}
              onChange={(e) => set({ parentConsent: e.target.checked })}
              className="mt-0.5 h-5 w-5 accent-[#E12A3A]"
            />
            <span>
              Mon parent (ou tuteur légal) est d&apos;accord pour que j&apos;utilise Progressa et
              pour le traitement de mes données selon la{" "}
              <a href="/confidentialite" target="_blank" className="text-glow underline">
                politique de confidentialité
              </a>
              .
            </span>
          </label>
        </StepShell>
      )}

      {step === totalSteps && s.birthYear && (
        <div className="text-center">
          <h2 className="mb-1 font-condensed text-2xl font-bold uppercase">Ta carte joueur</h2>
          <p className="mb-4 text-sm text-muted">
            Tes stats se rempliront avec tes premiers tests.
          </p>
          <div className="mb-6 flex justify-center">
            <PlayerCard
              data={{
                firstName: s.firstName,
                position: s.position,
                positionLabel: POSITIONS.find((p) => p.key === s.position)?.label ?? s.position,
                category: categoryOf(s.birthYear),
                divisionLabel:
                  s.levelType === "NATIONAL"
                    ? s.division
                    : `${s.division} — ${
                        s.levelType === "REGIONAL"
                          ? `Ligue ${LEAGUES.find((l) => l.key === s.region)?.name ?? ""}`
                          : s.district
                            ? `District ${s.district}`
                            : LEAGUES.find((l) => l.key === s.region)?.name ?? ""
                      }`,
                stats: [
                  { label: "Jonglage", value: "—" },
                  { label: "Navette", value: "—" },
                  { label: "Planche", value: "—" },
                  { label: "Détente", value: "—" },
                ],
              }}
            />
          </div>
          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
          <Button onClick={finish} disabled={submitting} size="lg" className="w-full">
            {submitting ? "Génération de ton programme…" : "Générer mon programme 🔥"}
          </Button>
          {submitting && (
            <p className="mt-3 text-xs text-muted">
              Ton préparateur compose ta semaine… (quelques secondes)
            </p>
          )}
        </div>
      )}

      {step < totalSteps && (
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)} className="flex-none">
              ←
            </Button>
          )}
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canNext}
            className="flex-1"
          >
            {step === lastQuestionStep ? "Voir ma carte" : "Continuer"}
          </Button>
        </div>
      )}
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="mb-1 font-condensed text-2xl font-bold uppercase">{title}</h1>
      {subtitle && <p className="mb-4 text-sm text-muted">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  );
}

function Choice({
  children,
  active,
  onClick,
  full = false,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-4 py-3 text-left font-condensed text-base font-bold transition-colors ${
        full ? "w-full" : "flex-1"
      } ${
        active
          ? "border-glow bg-glow/10 text-glow"
          : "border-line bg-surface text-chalk hover:border-glow/50"
      }`}
    >
      {children}
    </button>
  );
}
