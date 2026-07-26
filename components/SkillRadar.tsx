import type { RadarAxis } from "@/lib/radar";

// Toile d'araignée (radar) des familles d'exercices, teintée à la couleur du palier.
export function SkillRadar({
  axes,
  color,
  light,
}: {
  axes: RadarAxis[];
  color: string;
  light: string;
}) {
  const n = axes.length;
  const cx = 120;
  const cy = 100;
  const R = 60;
  const angle = (i: number) => (-90 + (360 / n) * i) * (Math.PI / 180);
  const pt = (i: number, r: number): [number, number] => [
    cx + r * Math.cos(angle(i)),
    cy + r * Math.sin(angle(i)),
  ];
  const poly = (r: (i: number) => number) =>
    axes.map((_, i) => pt(i, r(i)).map((v) => v.toFixed(1)).join(",")).join(" ");

  const rings = [0.25, 0.5, 0.75, 1];
  const valuePts = axes.map((a, i) => pt(i, R * (a.value / 100)));

  return (
    <svg viewBox="0 0 240 200" className="h-[180px] w-full" role="img" aria-label="Profil de joueur">
      {/* grille concentrique */}
      {rings.map((rr, ri) => (
        <polygon key={ri} points={poly(() => R * rr)} fill="none" stroke="#2A2B2D" strokeWidth="1" />
      ))}
      {/* rayons */}
      {axes.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#2A2B2D" strokeWidth="1" />;
      })}
      {/* zone du joueur */}
      <polygon
        points={valuePts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}
        fill={`${color}44`}
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {valuePts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.6" fill={light} />
      ))}
      {/* labels */}
      {axes.map((a, i) => {
        const [x, y] = pt(i, R + 15);
        const anchor = Math.abs(x - cx) < 8 ? "middle" : x > cx ? "start" : "end";
        return (
          <text
            key={i}
            x={x}
            y={y + 3}
            textAnchor={anchor}
            fontSize="9"
            fontWeight="600"
            fill="#8E8F89"
            fontFamily="system-ui, sans-serif"
          >
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}
