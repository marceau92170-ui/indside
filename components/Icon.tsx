// Jeu d'icônes « ligne » monochromes (stroke = couleur du texte courant).
// On remplace les emojis (qui font « amateur / généré ») par des pictos nets,
// à la manière des applis de sport pro (Nike Training, Strava, Adidas).
// Chaque icône hérite de la couleur via `currentColor` → active/inactive géré
// par la classe texte du parent (text-muted / text-glow).

export type IconName =
  // catégories d'exercices
  | "technique"
  | "renforcement"
  | "explosivite"
  | "cardio"
  | "prevention"
  | "gardien"
  // navigation
  | "calendar"
  | "dumbbell"
  | "chart"
  | "player"
  | "settings"
  | "home"
  | "lock";

export function Icon({
  name,
  className = "h-5 w-5",
  strokeWidth = 1.8,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

const PATHS: Record<IconName, React.ReactNode> = {
  // ballon (technique & conduite)
  technique: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5l4.3 3.1-1.6 5h-5.4l-1.6-5z" />
    </>
  ),
  // haltère (renforcement)
  renforcement: (
    <>
      <path d="M6.5 9v6M9 8v8M15 8v8M17.5 9v6" />
      <path d="M9 12h6" />
    </>
  ),
  // éclair (explosivité & vitesse)
  explosivite: <path d="M13 2 4 14h6l-1 8 9-12h-6z" />,
  // tracé cardiaque (cardio & endurance)
  cardio: <path d="M2 12h4l2.5-6 4 12 2.5-6h5" />,
  // bouclier (prévention blessures)
  prevention: (
    <>
      <path d="M12 3l7 3v5c0 4.4-3 8-7 10-4-2-7-5.6-7-10V6z" />
      <path d="M9.2 12l2 2 3.6-3.8" />
    </>
  ),
  // gant (spécifique gardien)
  gardien: (
    <>
      <path d="M8 21v-5" />
      <path d="M16 21v-6" />
      <path d="M8 16V9a1.6 1.6 0 0 1 3.2 0M11.2 9V7.4a1.6 1.6 0 0 1 3.2 0V9M14.4 9a1.6 1.6 0 0 1 1.6 1.6V15" />
      <path d="M8 12.5 6.2 10a1.5 1.5 0 0 1 2.4-1.8" />
      <path d="M8 21h8" />
    </>
  ),
  // calendrier (semaine)
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </>
  ),
  // haltère (exos) — même picto que renforcement
  dumbbell: (
    <>
      <path d="M6.5 9v6M9 8v8M15 8v8M17.5 9v6" />
      <path d="M9 12h6" />
    </>
  ),
  // histogramme (tests)
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-8M20 20H3" />
    </>
  ),
  // carte joueur / profil
  player: (
    <>
      <circle cx="12" cy="9" r="3.2" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  // réglages (curseurs)
  settings: (
    <>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2.2" />
      <circle cx="8" cy="17" r="2.2" />
    </>
  ),
  home: (
    <>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 10v9h12v-9" />
    </>
  ),
  // cadenas (exercice verrouillé / Premium)
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
};
