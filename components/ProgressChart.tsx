// Graphique de progression minimaliste en SVG pur (mobile-first, zéro dépendance).
export function ProgressChart({
  values,
  lowerIsBetter = false,
}: {
  values: number[]; // ordre chronologique
  lowerIsBetter?: boolean;
}) {
  if (values.length < 2) return null;

  const w = 300;
  const h = 100;
  const pad = 10;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values.map((v, i) => {
    const x = pad + (i * (w - 2 * pad)) / (values.length - 1);
    const y = pad + ((max - v) / span) * (h - 2 * pad);
    return { x, y };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const last = values[values.length - 1];
  const prev = values[values.length - 2];
  const improving = lowerIsBetter ? last < prev : last > prev;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Progression">
      <path d={path} fill="none" stroke={improving ? "#E12A3A" : "#93938D"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === points.length - 1 ? 4.5 : 3}
          fill={i === points.length - 1 ? "#E12A3A" : "#2A2B2D"}
          stroke="#EDE9E0"
          strokeWidth={i === points.length - 1 ? 1.5 : 0.5}
        />
      ))}
    </svg>
  );
}
