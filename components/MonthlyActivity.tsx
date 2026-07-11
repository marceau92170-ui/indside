// Petit histogramme des séances validées par mois (6 derniers mois) — CSS pur.
export function MonthlyActivity({ months }: { months: { label: string; count: number }[] }) {
  const max = Math.max(...months.map((m) => m.count), 1);
  return (
    <div className="flex items-end gap-2" style={{ height: 96 }}>
      {months.map((m) => (
        <div key={m.label} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="tnum text-xs font-bold text-chalk">{m.count || ""}</span>
          <div
            className="w-full rounded-t bg-glow/70"
            style={{ height: `${Math.max((m.count / max) * 64, m.count > 0 ? 6 : 2)}px` }}
          />
          <span className="text-[10px] uppercase text-muted">{m.label}</span>
        </div>
      ))}
    </div>
  );
}
