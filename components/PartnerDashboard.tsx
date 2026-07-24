"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CopyLink } from "@/components/CopyLink";
import { Icon } from "@/components/Icon";
import type { DailyPoint } from "@/lib/affiliate-stats";

const CASH = "#54C06A"; // vert : progression
const LOSS = "#E12A3A"; // rouge (glow) : baisse

type Totals = {
  clicks: number;
  signups: number;
  sales: number;
  grossCents: number;
  commissionCents: number;
  bonusCents: number;
  pendingCents: number;
  paidCents: number;
  owedCents: number;
  trialingCount: number;
  pipelineCents: number;
};

type MetricKey = "commission" | "gross" | "sales" | "signups" | "clicks";

const METRICS: {
  key: MetricKey;
  label: string;
  money: boolean;
  pick: (p: DailyPoint) => number;
  total: (t: Totals) => number;
}[] = [
  { key: "clicks", label: "Clics", money: false, pick: (p) => p.clicks, total: (t) => t.clicks },
  { key: "signups", label: "Inscrits", money: false, pick: (p) => p.signups, total: (t) => t.signups },
  { key: "sales", label: "Ventes", money: false, pick: (p) => p.sales, total: (t) => t.sales },
  { key: "gross", label: "CA généré", money: true, pick: (p) => p.grossCents, total: (t) => t.grossCents },
  { key: "commission", label: "Commissions", money: true, pick: (p) => p.commissionCents, total: (t) => t.commissionCents },
];

function euros(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}
function eurosShort(cents: number): string {
  return `${Math.round(cents / 100)} €`;
}
function frDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export function PartnerDashboard({
  displayName,
  link,
  isHouse,
  totals,
  series,
  next,
  tiers,
}: {
  displayName: string;
  link: string;
  isHouse: boolean;
  totals: Totals;
  series: DailyPoint[];
  next: { thresholdEuros: number; bonusEuros: number } | null;
  tiers: { thresholdEuros: number; bonusEuros: number }[];
}) {
  const [metric, setMetric] = useState<MetricKey>(isHouse ? "clicks" : "commission");
  const active = METRICS.find((m) => m.key === metric)!;
  const shownMetrics = isHouse ? METRICS.filter((m) => m.key !== "commission") : METRICS;

  const grossEuros = totals.grossCents / 100;
  const progressPct = next ? Math.min(100, Math.round((grossEuros / next.thresholdEuros) * 100)) : 100;
  const remainingCents = next ? next.thresholdEuros * 100 - totals.grossCents : 0;

  return (
    <div>
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase leading-none">Espace partenaire</h1>
      <p className="mb-4 text-sm text-muted">
        Salut {displayName}. Voici tes résultats en direct.
      </p>

      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">Ton lien de parrainage</p>
      <CopyLink url={link} />

      {/* HERO : l'argent d'abord (sauf lien maison) */}
      {!isHouse && <PayoutHero totals={totals} />}

      {/* PIPELINE : essais en cours → commissions en approche (tue la peur du 0 €) */}
      {!isHouse && totals.trialingCount > 0 && (
        <div className="mt-3 flex items-center gap-3 rounded-card border border-[#ECC53A]/30 bg-[#ECC53A]/10 p-4">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "rgba(236,197,58,.16)", color: "#ECC53A" }}
          >
            <Icon name="timer" className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-condensed text-lg font-bold uppercase leading-tight">
              {totals.trialingCount} essai{totals.trialingCount > 1 ? "s" : ""} en cours
            </p>
            <p className="text-xs text-muted">
              Environ{" "}
              <span className="font-bold" style={{ color: "#ECC53A" }}>{euros(totals.pipelineCents)}</span>{" "}
              en approche — versés dès la fin de la semaine gratuite.
            </p>
          </div>
        </div>
      )}

      {isHouse && (
        <div className="mt-5 rounded-card border border-line bg-surface p-4 text-sm text-muted">
          Lien « maison » — on suit les clics, inscrits et ventes de ton canal, sans commission.
        </div>
      )}

      {/* STATS CLIQUABLES */}
      <p className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-muted">
        Tes chiffres · appuie pour voir la courbe
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {shownMetrics.map((m) => (
          <StatTile
            key={m.key}
            label={m.label}
            value={m.money ? eurosShort(m.total(totals)) : String(m.total(totals))}
            trend={trendOf(series, m.pick)}
            active={metric === m.key}
            onClick={() => setMetric(m.key)}
          />
        ))}
      </div>

      {/* COURBE */}
      <div className="mt-3 rounded-card border border-line bg-surface p-4">
        <TrendChart series={series} metric={active} />
      </div>

      {/* ENTONNOIR */}
      <p className="mb-2 mt-7 text-[11px] font-bold uppercase tracking-widest text-muted">
        Ton entonnoir · 30 derniers jours
      </p>
      <div className="rounded-card border border-line bg-surface p-4">
        <Funnel clicks={totals.clicks} signups={totals.signups} sales={totals.sales} />
        <div className="mt-3 flex gap-2.5 rounded-lg border border-glow/25 bg-glow/10 p-3">
          <Icon name="trendingUp" className="mt-0.5 h-5 w-5 shrink-0 text-glow" />
          <p className="text-[12.5px] leading-relaxed">
            {funnelInsight(totals)}
          </p>
        </div>
        {!isHouse && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <ValueCard title="1 abonné mensuel" amount="+7,19 €" />
            <ValueCard title="1 annuel (mois lancement)" amount="+47,20 €" />
          </div>
        )}
      </div>

      {/* BONUS PALIERS */}
      {!isHouse && (
        <>
          <p className="mb-2 mt-7 text-[11px] font-bold uppercase tracking-widest text-muted">
            Bonus paliers · cumulatifs, à vie
          </p>
          <div className="rounded-card border border-line bg-surface p-4">
            <TierTrack grossCents={totals.grossCents} tiers={tiers} progressPct={progressPct} />
            {next ? (
              <p className="mt-3 text-[13px] leading-relaxed">
                Plus que{" "}
                <span className="font-condensed text-base font-bold text-glow">{euros(remainingCents)}</span> de CA
                pour débloquer <span className="font-bold text-glow">+{next.bonusEuros} €</span> de bonus.
              </p>
            ) : (
              <p className="mt-3 text-[13px]">Tous les paliers sont débloqués. Chapeau.</p>
            )}
            <p className="mt-2 text-[11px] text-muted">
              500 € de CA → +50 € · 1000 € de CA → +100 € de plus (soit 150 € au total à 1000 €).
            </p>
          </div>
        </>
      )}

      {/* COMMENT GAGNER PLUS */}
      <p className="mb-2 mt-7 text-[11px] font-bold uppercase tracking-widest text-muted">Comment gagner plus</p>
      <div className="rounded-card border border-line bg-surface p-4">
        <Tip n={1} title="Mets ton lien en bio + épinglé">
          Tes vidéos qui marchent rapportent des clics pendant des mois. Le lien doit être là où on te trouve.
        </Tip>
        <Tip n={2} title="Montre l'appli en vrai">
          Une démo de 20 s (carte joueur, semaine) convertit mieux qu'un simple « lien en bio ». Filme, on t'aide.
        </Tip>
        {!isHouse && (
          <Tip n={3} title="Pousse l'annuel pendant ton lancement">
            Ce mois, l'annuel te rapporte <span style={{ color: CASH }} className="font-semibold">47 €</span> au
            lieu de 23,60 €. C'est le moment d'en parler.
          </Tip>
        )}
      </div>

      <p className="mt-5 text-[11px] text-muted">
        Commissions versées 1×/mois, après un délai de 15 jours (couvre les remboursements). Une question ?{" "}
        <Link href="/reglages" className="underline">
          Contacte-nous
        </Link>
        .
      </p>
    </div>
  );
}

// ---------- Hero paiement ----------

function PayoutHero({ totals }: { totals: Totals }) {
  const target = totals.owedCents;
  const [shown, setShown] = useState(target);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const start = performance.now();
    const dur = 850;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setShown(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setShown(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <div
      className="mt-5 overflow-hidden rounded-2xl border border-[#3a2a2d] p-5"
      style={{
        background:
          "radial-gradient(120% 90% at 15% 0%, rgba(225,42,58,.16), transparent 60%), #1F2228",
      }}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#e7b6bb]">À te verser</p>
      <p className="my-1 font-condensed text-[56px] font-bold leading-none tnum">{euros(shown)}</p>
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
        style={{ background: "rgba(84,192,106,.14)", color: CASH }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: CASH }} />
        Validé
      </span>
      {totals.pendingCents > 0 && (
        <p className="mt-3 text-[13px] text-muted">
          + <span className="font-condensed text-base font-bold" style={{ color: "#ECC53A" }}>{euros(totals.pendingCents)}</span>{" "}
          en attente <span className="text-muted">(ventes de moins de 15 j)</span>
        </p>
      )}
      {totals.paidCents > 0 && (
        <p className="mt-1 text-xs text-muted">Déjà versé : {euros(totals.paidCents)}.</p>
      )}
    </div>
  );
}

// ---------- Tuile stat cliquable ----------

function StatTile({
  label,
  value,
  trend,
  active,
  onClick,
}: {
  label: string;
  value: string;
  trend: number | null;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`min-w-[104px] flex-1 shrink-0 rounded-card border p-3 text-left transition-colors ${
        active ? "border-glow bg-glow/10" : "border-line bg-surface hover:border-glow/50"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-condensed text-2xl font-bold leading-none">{value}</p>
      {trend !== null && trend !== 0 ? (
        <p
          className="mt-1.5 text-[11px] font-bold"
          style={{ color: trend > 0 ? CASH : LOSS }}
        >
          {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}% <span className="text-muted">/ 7 j</span>
        </p>
      ) : (
        <p className="mt-1.5 text-[11px] text-muted">— stable</p>
      )}
    </button>
  );
}

// ---------- Courbe interactive ----------

const VBW = 340;
const VBH = 150;
const PADX = 10;
const TOP = 14;
const BOTTOM = 26;

function TrendChart({
  series,
  metric,
}: {
  series: DailyPoint[];
  metric: (typeof METRICS)[number];
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const values = useMemo(() => series.map((p) => metric.pick(p)), [series, metric]);
  const total = values.reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...values);
  const n = values.length;
  const plotW = VBW - 2 * PADX;
  const plotH = VBH - TOP - BOTTOM;
  const stepX = n > 1 ? plotW / (n - 1) : 0;
  const x = (i: number) => PADX + i * stepX;
  const y = (v: number) => TOP + (1 - v / max) * plotH;

  const fmt = (v: number) => (metric.money ? euros(v) : String(v));

  function onMove(clientX: number) {
    const svg = svgRef.current;
    if (!svg || n === 0) return;
    const rect = svg.getBoundingClientRect();
    const vx = ((clientX - rect.left) / rect.width) * VBW;
    let i = Math.round((vx - PADX) / (stepX || 1));
    i = Math.max(0, Math.min(n - 1, i));
    setActive(i);
  }

  if (total === 0) {
    return (
      <div>
        <ChartHeader metric={metric} total={total} />
        <div className="flex h-[110px] items-center justify-center rounded-lg border border-dashed border-line px-4 text-center text-xs text-muted">
          Ta courbe se remplit dès tes premiers {metric.label.toLowerCase()}. Partage ton lien pour lancer la machine.
        </div>
      </div>
    );
  }

  const areaPath =
    `M ${x(0)} ${y(values[0])} ` +
    values.map((v, i) => `L ${x(i)} ${y(v)}`).join(" ") +
    ` L ${x(n - 1)} ${TOP + plotH} L ${x(0)} ${TOP + plotH} Z`;

  return (
    <div>
      <ChartHeader metric={metric} total={total} />
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VBW} ${VBH}`}
        className="w-full touch-none select-none"
        onPointerMove={(e) => onMove(e.clientX)}
        onPointerDown={(e) => onMove(e.clientX)}
        onPointerLeave={() => setActive(null)}
        role="img"
        aria-label={`Courbe ${metric.label}`}
      >
        <defs>
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EDE9E0" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#EDE9E0" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grille horizontale légère */}
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={PADX}
            x2={VBW - PADX}
            y1={TOP + t * plotH}
            y2={TOP + t * plotH}
            stroke="#2A2B2D"
            strokeWidth="1"
            strokeDasharray={t === 1 ? "0" : "3 4"}
          />
        ))}

        {/* aire sous la courbe */}
        <path d={areaPath} fill="url(#area-grad)" />

        {/* segments colorés : vert si le jour progresse vs la veille, rouge sinon */}
        {values.slice(1).map((v, idx) => {
          const i = idx + 1;
          const up = v >= values[i - 1];
          return (
            <line
              key={i}
              x1={x(i - 1)}
              y1={y(values[i - 1])}
              x2={x(i)}
              y2={y(v)}
              stroke={up ? CASH : LOSS}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          );
        })}

        {/* point actif + guide */}
        {active !== null && (
          <>
            <line x1={x(active)} x2={x(active)} y1={TOP} y2={TOP + plotH} stroke="#EDE9E0" strokeOpacity="0.25" strokeWidth="1" />
            <circle cx={x(active)} cy={y(values[active])} r="4.5" fill="#131418" stroke="#EDE9E0" strokeWidth="2" />
          </>
        )}

        {/* labels dates début/fin */}
        <text x={PADX} y={VBH - 8} fontSize="10" fill="#8E8F89">{frDate(series[0].date)}</text>
        <text x={VBW - PADX} y={VBH - 8} fontSize="10" fill="#8E8F89" textAnchor="end">
          {frDate(series[n - 1].date)}
        </text>
      </svg>

      {/* tooltip sous la courbe */}
      <div className="mt-1 flex items-center justify-between text-xs">
        {active !== null ? (
          <>
            <span className="text-muted">{frDate(series[active].date)}</span>
            <span className="font-condensed text-base font-bold">
              {fmt(values[active])}
              {active > 0 && (
                <span
                  className="ml-2 text-[11px] font-bold"
                  style={{ color: values[active] >= values[active - 1] ? CASH : LOSS }}
                >
                  {values[active] >= values[active - 1] ? "▲" : "▼"} vs veille
                </span>
              )}
            </span>
          </>
        ) : (
          <span className="text-muted">Glisse le doigt sur la courbe pour le détail jour par jour</span>
        )}
      </div>
    </div>
  );
}

function ChartHeader({ metric, total }: { metric: (typeof METRICS)[number]; total: number }) {
  return (
    <div className="mb-2 flex items-baseline justify-between">
      <p className="font-condensed text-lg font-bold uppercase">{metric.label}</p>
      <p className="text-xs text-muted">
        Total 30 j :{" "}
        <span className="font-condensed text-sm font-bold text-chalk">
          {metric.money ? euros(total) : total}
        </span>
      </p>
    </div>
  );
}

// ---------- Entonnoir ----------

function Funnel({ clicks, signups, sales }: { clicks: number; signups: number; sales: number }) {
  const base = Math.max(1, clicks);
  const rows = [
    { label: "Clics sur ton lien", value: clicks, pct: 100, tint: "linear-gradient(90deg,#7c1620,#E12A3A)" },
    {
      label: "Comptes créés",
      value: signups,
      pct: Math.round((signups / base) * 100),
      note: clicks > 0 ? `${Math.round((signups / base) * 100)}% des clics` : "",
      tint: "linear-gradient(90deg,#7c1620,#c72c3a)",
    },
    {
      label: "Abonnements payés",
      value: sales,
      pct: Math.round((sales / base) * 100),
      note: clicks > 0 ? `${((sales / base) * 100).toFixed(1).replace(".", ",")}% des clics` : "",
      tint: "linear-gradient(90deg,#8B1E27,#E12A3A)",
    },
  ];
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-[12px] text-chalk">{r.label}</span>
            <span className="font-condensed text-lg font-bold tnum">{r.value}</span>
          </div>
          <div className="h-[30px] overflow-hidden rounded-lg bg-night">
            <div
              className="flex h-full items-center justify-end rounded-lg pr-2.5"
              style={{ width: `${Math.max(12, r.pct)}%`, background: r.tint }}
            >
              {r.note && <span className="text-[10px] font-bold tracking-wide text-white/85">{r.note}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function funnelInsight(t: Totals): string {
  if (t.clicks === 0) return "Partage ton lien pour lancer la machine : chaque clic est une chance de vente.";
  if (t.sales === 0 && t.trialingCount > 0)
    return `Tes ${t.trialingCount} essai${t.trialingCount > 1 ? "s" : ""} en cours deviennent des commissions dès la fin de la semaine gratuite. Continue à poster, ça arrive.`;
  if (t.sales === 0)
    return "Tu as des clics — maintenant transforme-les en abonnés : montre l'appli en action dans tes vidéos.";
  const rate = (t.sales / t.clicks) * 100;
  const extra = Math.round((t.commissionCents / Math.max(1, t.sales)) * 5) / 100;
  return `Ton taux clic → vente : ${rate.toFixed(1).replace(".", ",")}%. Continue — +5 ventes ≈ +${Math.round(extra)} € pour toi.`;
}

function ValueCard({ title, amount }: { title: string; amount: string }) {
  return (
    <div className="rounded-lg border border-line bg-night px-3 py-2.5">
      <p className="text-[11px] font-semibold text-muted">{title}</p>
      <p className="mt-0.5 font-condensed text-xl font-bold" style={{ color: CASH }}>
        {amount} <span className="text-xs font-semibold text-muted">pour toi</span>
      </p>
    </div>
  );
}

// ---------- Jauge paliers ----------

function TierTrack({
  grossCents,
  tiers,
  progressPct,
}: {
  grossCents: number;
  tiers: { thresholdEuros: number; bonusEuros: number }[];
  progressPct: number;
}) {
  const maxTier = Math.max(...tiers.map((t) => t.thresholdEuros));
  const grossEuros = grossCents / 100;
  return (
    <div>
      <div className="relative my-3 h-3 rounded-full bg-night">
        <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#E12A3A,#ff5a67)" }} />
        {tiers.map((t) => {
          const left = Math.min(100, (t.thresholdEuros / maxTier) * 100);
          const hit = grossEuros >= t.thresholdEuros;
          return (
            <span
              key={t.thresholdEuros}
              className="absolute -top-[7px] flex h-[26px] w-[26px] -translate-x-1/2 items-center justify-center rounded-full font-condensed text-[10px] font-bold"
              style={{
                left: `${left}%`,
                background: hit ? "#E12A3A" : "#1F2228",
                border: `2px solid ${hit ? "#E12A3A" : "#2A2B2D"}`,
                color: hit ? "#fff" : "#8E8F89",
              }}
            >
              {t.bonusEuros}
            </span>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-muted">
        <span>0 €</span>
        {tiers.map((t) => (
          <span key={t.thresholdEuros}>{t.thresholdEuros} €</span>
        ))}
      </div>
    </div>
  );
}

function Tip({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 border-t border-line py-3 first:border-t-0 first:pt-0">
      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-glow/10 font-condensed text-sm font-bold text-glow">
        {n}
      </span>
      <div>
        <p className="font-condensed text-sm font-bold uppercase">{title}</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{children}</p>
      </div>
    </div>
  );
}

// 7 derniers jours vs 7 précédents → % (pour la tendance sur les tuiles).
function trendOf(series: DailyPoint[], pick: (p: DailyPoint) => number): number | null {
  if (series.length < 14) return null;
  const n = series.length;
  const last = series.slice(n - 7).reduce((s, p) => s + pick(p), 0);
  const prev = series.slice(n - 14, n - 7).reduce((s, p) => s + pick(p), 0);
  if (prev === 0) return last > 0 ? 100 : 0;
  return Math.round(((last - prev) / prev) * 100);
}
