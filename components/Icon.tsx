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
  | "lock"
  // divers app
  | "share"
  | "download"
  | "target"
  | "notebook"
  | "health"
  | "book"
  | "flame"
  | "trophy"
  | "badgeCheck"
  | "trendingUp"
  | "chat"
  | "timer"
  | "alert"
  | "gift"
  | "check";

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
  // partager
  share: (
    <>
      <path d="M12 15V4M8.5 7.5 12 4l3.5 3.5" />
      <path d="M5 12v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6" />
    </>
  ),
  // télécharger
  download: (
    <>
      <path d="M12 4v11M8.5 11.5 12 15l3.5-3.5" />
      <path d="M5 20h14" />
    </>
  ),
  // cible (objectifs)
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.6" />
    </>
  ),
  // carnet (carnet de match)
  notebook: (
    <>
      <rect x="6" y="3" width="13" height="18" rx="2" />
      <path d="M6 3v18" />
      <path d="M10 8h5M10 12h5" />
    </>
  ),
  // cœur (suivi santé)
  health: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  // livre (ressources)
  book: (
    <>
      <path d="M6.5 4H17a1 1 0 0 1 1 1v13H8a2 2 0 0 0-2 2V5a1 1 0 0 1 .5-1z" />
      <path d="M6 20a2 2 0 0 1 2-2h10" />
    </>
  ),
  // flamme (série)
  flame: <path d="M12 3c.5 3 4 4.2 4 8a4 4 0 0 1-8 0c0-1.6.6-2.6 1.2-3.2.2 1 .9 1.6 1.5 1.6C10 8.2 11 5.4 12 3z" />,
  // trophée
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
      <path d="M8 5.5H5.5v1A2.5 2.5 0 0 0 8 9M16 5.5h2.5v1A2.5 2.5 0 0 1 16 9" />
      <path d="M12 13v3M9 20h6M10.5 20l.6-4M13.5 20l-.6-4" />
    </>
  ),
  // pastille validée (badge obtenu)
  badgeCheck: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </>
  ),
  // courbe montante (progression mesurée)
  trendingUp: (
    <>
      <path d="M3 17l6-6 4 4 7-7" />
      <path d="M15 8h5v5" />
    </>
  ),
  // bulle (feedback)
  chat: (
    <>
      <path d="M4 5.5h16v10H9l-4 3v-3H4z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>
  ),
  // chronomètre
  timer: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 13V8.5M9.5 3h5M18.5 6.5l1.5-1.5" />
    </>
  ),
  // alerte (triangle)
  alert: (
    <>
      <path d="M12 4l9 15.5H3z" />
      <path d="M12 10v4.5M12 17.5h.01" />
    </>
  ),
  // cadeau (offre)
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <path d="M4 13h16M12 9v11" />
      <path d="M12 9S10.5 4 8 5.2 9.5 9 12 9zM12 9s1.5-5 4-3.8S14.5 9 12 9z" />
    </>
  ),
  // coche seule
  check: <path d="M5 12.5l4.5 4.5L19 6.5" />,
};
