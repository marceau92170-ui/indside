// Carte joueur — signature visuelle de Progressa.
// SVG pur : rendue à l'identique partout et sérialisable en PNG pour le partage.
// Sobre, mate, texture subtile type maillot — pas de brillance FUT.

export type PlayerCardData = {
  firstName: string;
  position: string; // libellé court (AIL, DC…)
  positionLabel: string;
  category: string; // U16…
  divisionLabel: string; // "D2 — District des Yvelines"
  stats: { label: string; value: string }[]; // 4 stats
};

export function PlayerCard({ data, width = 340 }: { data: PlayerCardData; width?: number }) {
  const height = (width * 480) / 340;
  const name = data.firstName.toUpperCase();
  // taille du flocage adaptée à la longueur du prénom
  const nameSize = name.length <= 6 ? 58 : name.length <= 9 ? 44 : 34;

  return (
    <svg
      viewBox="0 0 340 480"
      width={width}
      height={height}
      role="img"
      aria-label={`Carte joueur de ${data.firstName}`}
      style={{ display: "block" }}
    >
      <defs>
        {/* texture maillot : fines diagonales quasi invisibles */}
        <pattern id="jersey" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#1A2432" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#202c3d" strokeWidth="2" />
        </pattern>
      </defs>

      {/* fond */}
      <rect x="0" y="0" width="340" height="480" rx="18" fill="url(#jersey)" />
      <rect x="0.75" y="0.75" width="338.5" height="478.5" rx="17.5" fill="none" stroke="#2A3648" strokeWidth="1.5" />

      {/* marquage terrain : rond central discret en bas */}
      <circle cx="170" cy="500" r="150" fill="none" stroke="#F2F4F0" strokeOpacity="0.06" strokeWidth="2" />
      <line x1="20" y1="350" x2="320" y2="350" stroke="#F2F4F0" strokeOpacity="0.06" strokeWidth="2" />

      {/* en-tête */}
      <text x="24" y="40" fill="#8A94A3" fontSize="13" fontWeight="700" letterSpacing="3" fontFamily="var(--font-condensed), 'Barlow Condensed', sans-serif">
        PROGRESSA
      </text>
      <text x="316" y="40" fill="#D8F34E" fontSize="16" fontWeight="700" textAnchor="end" letterSpacing="2" fontFamily="var(--font-condensed), 'Barlow Condensed', sans-serif">
        {data.category}
      </text>
      <line x1="24" y1="54" x2="316" y2="54" stroke="#2A3648" strokeWidth="1" />

      {/* flocage prénom */}
      <text
        x="170"
        y="150"
        fill="#F2F4F0"
        fontSize={nameSize}
        fontWeight="900"
        textAnchor="middle"
        letterSpacing="2"
        fontFamily="var(--font-display), 'Archivo Black', sans-serif"
      >
        {name}
      </text>
      {/* soulignement projecteur — seul accent */}
      <rect x="120" y="168" width="100" height="4" rx="2" fill="#D8F34E" />

      {/* poste + division */}
      <text x="170" y="210" fill="#F2F4F0" fontSize="20" fontWeight="700" textAnchor="middle" letterSpacing="1.5" fontFamily="var(--font-condensed), 'Barlow Condensed', sans-serif">
        {data.positionLabel.toUpperCase()}
      </text>
      <text x="170" y="234" fill="#8A94A3" fontSize="13" textAnchor="middle" letterSpacing="0.5" fontFamily="Inter, sans-serif">
        {data.divisionLabel}
      </text>

      {/* stats */}
      <line x1="24" y1="262" x2="316" y2="262" stroke="#2A3648" strokeWidth="1" />
      {data.stats.slice(0, 4).map((s, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 24 + col * 160;
        const y = 300 + row * 84;
        return (
          <g key={s.label}>
            <text
              x={x}
              y={y}
              fill="#D8F34E"
              fontSize="34"
              fontWeight="900"
              fontFamily="var(--font-condensed), 'Barlow Condensed', sans-serif"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {s.value}
            </text>
            <text x={x} y={y + 20} fill="#8A94A3" fontSize="11" letterSpacing="1.5" fontFamily="Inter, sans-serif">
              {s.label.toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* pied de carte */}
      <text x="24" y="456" fill="#8A94A3" fontSize="10" letterSpacing="2" fontFamily="Inter, sans-serif">
        SAISON {new Date().getFullYear()}–{(new Date().getFullYear() + 1).toString().slice(2)}
      </text>
      <circle cx="308" cy="452" r="7" fill="none" stroke="#23402E" strokeWidth="2.5" />
    </svg>
  );
}
