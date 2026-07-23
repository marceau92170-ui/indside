"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { lockedTeasers } from "@/lib/teaser";
import {
  EQUIPMENT,
  GOALS,
  LEAGUES,
  LEVEL_TYPES,
  POSITIONS,
  DAYS_FR,
  divisionsFor,
  positionLabel,
  goalLabel,
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
  const u = end - birthYear;
  return u > 18 ? "Senior" : `U${u}`;
}

function ageOf(birthYear: number): number {
  return new Date().getFullYear() - birthYear;
}

// Estimation de départ (déterministe, sans IA) pour l'écran de révélation.
// Honnête : c'est une base, elle se précisera avec les vrais tests.
function startingProfile(s: State): { rating: number; stats: { label: string; value: number }[] } {
  const lvl = s.levelType === "NATIONAL" ? 8 : s.levelType === "REGIONAL" ? 4 : 1;
  const boost = (keys: string[], base: number) => Math.min(90, base + lvl + (keys.includes(s.goal) ? 6 : 0));
  const stats = [
    { label: "Vitesse", value: boost(["vitesse", "polyvalent"], 66) },
    { label: "Physique", value: boost(["physique", "endurance", "polyvalent"], 64) },
    { label: "Technique", value: boost(["technique", "frappe", "polyvalent"], 63) },
    { label: "Mental", value: boost(["polyvalent"], 68) },
  ];
  const rating = Math.round(stats.reduce((a, b) => a + b.value, 0) / stats.length);
  return { rating, stats };
}

// Année de naissance représentative pour l'option « 18 ans et + » (amateurs, seniors, vétérans).
const ADULT_BIRTH_YEAR = new Date().getFullYear() - 20;

// Un ado interrompu (appel, notif, batterie) ne doit pas repartir de zéro.
const STORAGE_KEY = "progressa-onboarding-v1";

export function OnboardingWizard({
  birthYears,
  authed = false,
}: {
  birthYears: number[];
  authed?: boolean;
}) {
  const router = useRouter();
  const [s, setS] = useState<State>(INITIAL);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  // Écran final : "analyze" (animation de calcul) → "show" (révélation carte + programme).
  const [reveal, setReveal] = useState<"analyze" | "show">("analyze");

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

  // À l'arrivée sur l'écran final : joue l'animation d'analyse (~2,6 s) puis révèle.
  useEffect(() => {
    if (step === totalSteps) {
      setReveal("analyze");
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const t = setTimeout(() => setReveal("show"), reduce ? 200 : 2600);
      return () => clearTimeout(t);
    }
  }, [step, totalSteps]);

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
    // Pas encore de compte : les réponses sont déjà gardées (localStorage).
    // On envoie créer le compte ; au retour (connecté), le joueur finalise ici même.
    if (!authed) {
      router.push("/connexion");
      return;
    }
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
          <div className="mt-2">
            <Choice
              active={s.birthYear === ADULT_BIRTH_YEAR}
              onClick={() => set({ birthYear: ADULT_BIRTH_YEAR })}
            >
              18 ans et + (adulte)
            </Choice>
          </div>
          {s.birthYear && (
            <p className="stat-pop mt-4 text-center font-condensed text-xl font-bold text-glow">
              {s.birthYear === ADULT_BIRTH_YEAR
                ? "Catégorie Senior"
                : `Tu joues en ${categoryOf(s.birthYear)}`}
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
                {divisionsFor(
                  s.levelType,
                  s.birthYear !== null && ageOf(s.birthYear) >= 18
                ).map((d) => (
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
                {g.label}
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

      {step === totalSteps && s.birthYear && reveal === "analyze" && (
        <AnalyzeScreen state={s} />
      )}

      {step === totalSteps && s.birthYear && reveal === "show" && (
        <RevealScreen
          state={s}
          authed={authed}
          submitting={submitting}
          error={error}
          onFinish={finish}
        />
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

// Écran d'analyse : donne l'impression qu'un vrai préparateur compose le programme.
function AnalyzeScreen({ state: s }: { state: State }) {
  const [bar, setBar] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setBar(100), 60);
    return () => clearTimeout(t);
  }, []);

  const lines = [
    `Profil de ${positionLabel(s.position)} analysé`,
    s.matchDay !== null && s.matchDay !== undefined
      ? `Calendrier calé sur ton match du ${DAYS_FR[s.matchDay].toLowerCase()}`
      : "Séances réparties sur ta semaine",
    `Exercices choisis pour ${goalLabel(s.goal).toLowerCase()}`,
    s.birthYear ? `Adapté à ton niveau ${categoryOf(s.birthYear)} · ${s.division}` : "Programme ajusté à ton niveau",
  ];

  return (
    <div className="flex min-h-[52vh] flex-col items-center justify-center text-center">
      <div className="relative mb-7 h-24 w-24">
        <div className="absolute inset-0 rounded-full border-2 border-line" />
        <div
          className="absolute inset-0 animate-spin rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(225,42,58,.55) 60deg, transparent 120deg)",
            animationDuration: "1.1s",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-glow">
          <Icon name="technique" className="h-8 w-8" />
        </div>
      </div>
      <h2 className="mb-6 font-condensed text-2xl font-bold uppercase">
        On construit ton programme…
      </h2>
      <div className="mb-6 flex w-full max-w-xs flex-col gap-3 text-left">
        {lines.map((line, i) => (
          <div
            key={i}
            className="ob-rise flex items-center gap-3 text-sm"
            style={{ animationDelay: `${300 + i * 480}ms` }}
          >
            <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-glow text-[11px] font-black text-white">
              ✓
            </span>
            <span className="text-chalk">{line}</span>
          </div>
        ))}
      </div>
      <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-glow transition-[width] ease-linear"
          style={{ width: `${bar}%`, transitionDuration: "2200ms" }}
        />
      </div>
    </div>
  );
}

// Révélation : la carte joueur + le programme perso, AVANT l'inscription (sunk-cost).
function RevealScreen({
  state: s,
  authed,
  submitting,
  error,
  onFinish,
}: {
  state: State;
  authed: boolean;
  submitting: boolean;
  error: string | null;
  onFinish: () => void;
}) {
  const { rating, stats } = startingProfile(s);
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 480);
    return () => clearTimeout(t);
  }, []);

  const teasers = lockedTeasers({ position: s.position, goal: s.goal, matchDay: s.matchDay });
  const category = s.birthYear ? categoryOf(s.birthYear) : "";
  const league = LEAGUES.find((l) => l.key === s.region)?.name ?? "";
  const sub = [category, s.division, s.goal ? `objectif ${goalLabel(s.goal).toLowerCase()}` : ""]
    .filter(Boolean)
    .join(" · ");

  return (
    <div>
      <p className="mb-1 text-center font-condensed text-sm font-bold uppercase tracking-widest text-glow">
        Ton programme est prêt
      </p>
      <h2 className="ob-rise mb-4 text-center font-condensed text-2xl font-bold uppercase">
        Voilà <span className="text-glow">ta</span> carte joueur
      </h2>

      {/* Carte joueur */}
      <div className="ob-pop ob-shine relative mx-auto max-w-xs overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-surface to-night p-4 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-condensed text-5xl font-bold leading-none tnum">{rating}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-muted">Estimation de départ</p>
          </div>
          <span className="rounded-lg bg-glow px-2.5 py-1 font-condensed text-xs font-bold uppercase tracking-wide text-white">
            {positionLabel(s.position)}
          </span>
        </div>
        <p className="mt-3 font-condensed text-2xl font-bold uppercase">{s.firstName}</p>
        {sub && <p className="text-xs text-muted">{sub}</p>}
        <div className="mt-3 flex flex-col gap-2">
          {stats.map((st) => (
            <div key={st.label} className="flex items-center gap-2 text-[11px]">
              <span className="w-16 uppercase tracking-wide text-muted">{st.label}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-night">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-glow to-[#ff5763] transition-[width] duration-700 ease-out"
                  style={{ width: filled ? `${st.value}%` : "0%" }}
                />
              </span>
              <span className="w-6 text-right font-bold tnum">{st.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Programme perso */}
      <div className="ob-rise mt-4 rounded-xl border border-line bg-surface p-4" style={{ animationDelay: "250ms" }}>
        <p className="mb-2 font-condensed text-sm font-bold uppercase tracking-wide text-glow">
          3 séances rien que pour toi cette semaine
        </p>
        <ul>
          {teasers.map((t, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 border-t border-line py-2 first:border-t-0"
            >
              <div className={`min-w-0 ${i === 0 ? "" : "select-none blur-[2.5px]"}`}>
                <p className="truncate font-condensed text-sm font-bold uppercase">
                  <span className="text-muted">{t.day.slice(0, 3)} · </span>
                  {t.title}
                </p>
                <p className="truncate text-[11px] text-muted">
                  {t.duration} min · {t.focus}
                </p>
              </div>
              <span className="flex-none text-muted">
                {i === 0 ? <Icon name="check" className="h-4 w-4 text-glow" /> : <Icon name="lock" className="h-3.5 w-3.5" />}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}

      <Button onClick={onFinish} disabled={submitting} size="lg" className="mt-5 w-full">
        {submitting
          ? "Génération de ton programme…"
          : authed
            ? "Générer mon programme"
            : "Créer mon compte & recevoir mon programme"}
      </Button>
      {!authed && !submitting && (
        <p className="mt-2 text-center text-xs text-muted">
          Tes réponses sont gardées. Connexion en 1 geste (Google ou email), gratuit, sans carte.
        </p>
      )}
      {submitting && (
        <p className="mt-3 text-center text-xs text-muted">
          Ton préparateur compose ta semaine… (quelques secondes)
        </p>
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
