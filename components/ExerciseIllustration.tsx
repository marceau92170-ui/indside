// Illustrations animées en boucle, dessinées à la main (SVG + SMIL) — jamais générées.
// Un mouvement mal dessiné se corrige une fois pour toutes ; une vidéo IA mal générée
// apprendrait un mauvais geste à chaque joueur qui la regarde. D'où ce choix.
//
// Principe : un seul moteur de rendu (Stick) + un jeu de coordonnées par famille de
// mouvement (Archetype). Chaque exercice de la bibliothèque est mappé vers la famille
// la plus proche visuellement — aucun exercice n'est laissé sans illustration.

type Keyed = Partial<Record<"cx" | "cy" | "x1" | "y1" | "x2" | "y2", string>>;

type Segment =
  | { type: "circle"; r: number; fill?: string; base?: Keyed; keys?: Keyed }
  | { type: "line"; base?: Keyed; keys?: Keyed };

type Archetype = { segments: Segment[]; dur?: string; ground?: boolean };

const DUR = "2.2s";
const SPLINE = "0.4 0 0.2 1;0.4 0 0.2 1";
const TIMES = "0;0.5;1";

function loop(a: string, b: string): string {
  return `${a};${b};${a}`;
}

function animAttrs(dur: string) {
  return { dur, keyTimes: TIMES, calcMode: "spline" as const, keySplines: SPLINE, repeatCount: "indefinite" as const };
}

// ---------- familles de mouvement ----------

const ARCHETYPES: Record<string, Archetype> = {
  // flexion de jambes profonde : squats, chaise, fentes avant, squat jumps
  squat: {
    segments: [
      { type: "circle", r: 10, base: {}, keys: { cx: loop("100", "90"), cy: loop("65", "103") } },
      { type: "line", keys: { x1: loop("100", "85"), y1: loop("120", "165"), x2: loop("100", "95"), y2: loop("80", "118") } }, // torse
      { type: "line", keys: { x1: loop("100", "85"), y1: loop("120", "165"), x2: loop("100", "108"), y2: loop("165", "178") } }, // cuisse
      { type: "line", keys: { x1: loop("100", "108"), y1: loop("165", "178"), x2: "100", y2: "205" } }, // tibia
      { type: "line", base: { x1: "88", y1: "205", x2: "118", y2: "205" } }, // pied
      { type: "line", keys: { x1: loop("100", "95"), y1: loop("80", "118"), x2: loop("118", "148"), y2: loop("102", "128") } }, // bras
    ],
  },
  // fente / pas latéral : fentes latérales, skater jumps, déplacements gardien
  "lunge-lateral": {
    segments: [
      { type: "circle", r: 10, base: {}, keys: { cx: loop("100", "70"), cy: loop("65", "78") } },
      { type: "line", keys: { x1: loop("100", "72"), y1: loop("120", "140"), x2: loop("100", "76"), y2: loop("80", "93") } },
      { type: "line", keys: { x1: loop("100", "72"), y1: loop("120", "140"), x2: loop("100", "55"), y2: loop("165", "185") } },
      { type: "line", keys: { x1: loop("100", "55"), y1: loop("165", "185"), x2: "45", y2: "205" } },
      { type: "line", keys: { x1: loop("100", "72"), y1: loop("120", "140"), x2: loop("100", "140"), y2: loop("150", "158") } },
      { type: "line", keys: { x1: loop("100", "140"), y1: loop("150", "158"), x2: "150", y2: "205" } },
      { type: "line", base: { x1: "32", y1: "205", x2: "58", y2: "205" } },
      { type: "line", base: { x1: "138", y1: "205", x2: "164", y2: "205" } },
      { type: "line", keys: { x1: loop("100", "76"), y1: loop("80", "93"), x2: loop("125", "100"), y2: loop("100", "70") } },
    ],
  },
  // gainage statique / dynamique : planche, planche latérale, copenhagen
  plank: {
    ground: true,
    segments: [
      { type: "circle", r: 9, base: { cx: "50", cy: "138" } },
      { type: "line", base: { x1: "60", y1: "140", x2: "115", y2: "150" } }, // torse
      { type: "line", base: { x1: "115", y1: "150", x2: "150", y2: "155" } }, // hanche->cuisse
      { type: "line", base: { x1: "150", y1: "155", x2: "182", y2: "160" } }, // jambe
      { type: "line", keys: { y1: loop("100", "170"), x1: "58", x2: "50", y2: loop("112", "182") } }, // avant-bras (contact sol)
    ],
    dur: "1.8s",
  },
  // gainage dynamique + montée de genoux : mountain climbers
  "mountain-climber": {
    ground: true,
    segments: [
      { type: "circle", r: 9, base: { cx: "48", cy: "138" } },
      { type: "line", base: { x1: "58", y1: "140", x2: "110", y2: "150" } },
      { type: "line", base: { x1: "58", y1: "128", x2: "58", y2: "175" } },
      { type: "line", keys: { x1: loop("110", "112"), y1: loop("150", "150"), x2: loop("170", "125"), y2: loop("158", "175") } }, // cuisse animée
      { type: "line", keys: { x1: loop("170", "125"), y1: loop("158", "175"), x2: loop("182", "142"), y2: loop("178", "180") } }, // tibia animé
    ],
    dur: "1s",
  },
  // pont fessier : allongé, bascule du bassin
  "glute-bridge": {
    segments: [
      { type: "circle", r: 9, base: { cx: "40", cy: "175" } },
      { type: "line", base: { x1: "49", y1: "175", x2: "95", y2: "175" } }, // torse au sol
      { type: "line", keys: { x1: "95", y1: "175", x2: "95", y2: loop("175", "150") } }, // hanche qui monte (segment vertical symbolique)
      { type: "line", base: { x1: "95", y1: "175", x2: "130", y2: "165" } }, // cuisse
      { type: "line", base: { x1: "130", y1: "165", x2: "130", y2: "205" } }, // tibia vertical (pied au sol)
      { type: "line", base: { x1: "116", y1: "205", x2: "144", y2: "205" } },
    ],
    dur: "1.6s",
  },
  // pompes : appui au sol, flexion des bras
  pushup: {
    ground: true,
    segments: [
      { type: "circle", r: 9, base: {}, keys: { cx: loop("50", "52"), cy: loop("150", "162") } },
      { type: "line", keys: { x1: loop("60", "62"), y1: loop("152", "163"), x2: "150", y2: "170" } },
      { type: "line", base: { x1: "150", y1: "170", x2: "182", y2: "178" } },
      { type: "line", keys: { x1: loop("60", "62"), y1: loop("152", "163"), x2: loop("55", "40"), y2: loop("195", "185") } },
    ],
    dur: "1.6s",
  },
  // saut vertical / horizontal : squat jumps, bondissements, détente
  jump: {
    segments: [
      { type: "circle", r: 10, base: {}, keys: { cy: loop("103", "55") } },
      { type: "line", keys: { x1: "100", y1: loop("165", "125"), x2: "100", y2: loop("118", "70") } }, // torse
      { type: "line", keys: { x1: "100", y1: loop("165", "125"), x2: "100", y2: loop("178", "150") } }, // cuisse
      { type: "line", keys: { x1: "100", y1: loop("178", "150"), x2: "100", y2: loop("205", "185") } }, // tibia
      { type: "line", keys: { x2: "70", y2: loop("205", "185"), x1: "100", y1: loop("205", "185") } },
      { type: "line", keys: { x1: "100", y1: loop("118", "70"), x2: "130", y2: loop("140", "50") } }, // bras levé au sommet
    ],
    dur: "1.1s",
  },
  // course / montées de genoux / gammes / sprint / intermittent
  sprint: {
    segments: [
      { type: "circle", r: 9, base: {}, keys: { cx: loop("95", "105"), cy: "62" } },
      { type: "line", keys: { x1: loop("100", "108"), y1: "118", x2: loop("100", "112"), y2: "72" } },
      { type: "line", keys: { x1: loop("100", "108"), y1: "118", x2: loop("125", "80"), y2: loop("150", "155") } }, // cuisse avant
      { type: "line", keys: { x1: loop("125", "80"), y1: loop("150", "155"), x2: loop("110", "65"), y2: loop("195", "205") } },
      { type: "line", keys: { x1: loop("100", "108"), y1: "118", x2: loop("78", "130"), y2: loop("150", "165") } }, // cuisse arrière
      { type: "line", keys: { x1: loop("78", "130"), y1: loop("150", "165"), x2: loop("95", "150"), y2: loop("120", "175") } },
      { type: "line", keys: { x1: loop("100", "112"), y1: "72", x2: loop("135", "90"), y2: loop("95", "60") } },
    ],
    dur: "0.85s",
  },
  // touches de balle au pied : jonglage, toe taps, foundations
  juggle: {
    segments: [
      { type: "circle", r: 6, fill: "#E12A3A", keys: { cy: loop("100", "150") } }, // ballon
      { type: "circle", r: 10, base: { cx: "100", cy: "62" } },
      { type: "line", base: { x1: "100", y1: "72", x2: "100", y2: "118" } },
      { type: "line", keys: { x1: "100", y1: "118", x2: loop("90", "108"), y2: loop("160", "158") } },
      { type: "line", keys: { x1: loop("90", "108"), y1: loop("160", "158"), x2: loop("85", "100"), y2: loop("190", "178") } },
    ],
    dur: "0.9s",
  },
  // conduite / dribble latéral : croquettes, v-cuts, crochet, cruyff, ciseaux
  dribble: {
    segments: [
      { type: "circle", r: 6, fill: "#E12A3A", keys: { cx: loop("120", "80"), cy: "195" } }, // ballon
      { type: "circle", r: 10, base: {}, keys: { cx: loop("98", "82") } },
      { type: "line", keys: { x1: loop("100", "84"), y1: "118", x2: loop("100", "84"), y2: "72" } },
      { type: "line", keys: { x1: loop("100", "84"), y1: "118", x2: loop("108", "70"), y2: "168" } },
      { type: "line", keys: { x1: loop("108", "70"), y1: "168", x2: loop("120", "82"), y2: "205" } },
      { type: "line", keys: { x1: loop("100", "84"), y1: "118", x2: loop("85", "60"), y2: "160" } },
      { type: "line", keys: { x1: loop("85", "60"), y1: "160", x2: loop("70", "50"), y2: "205" } },
    ],
    dur: "1.3s",
  },
  // passe / frappe contre un mur
  "wall-pass": {
    segments: [
      { type: "circle", r: 10, base: { cx: "90", cy: "65" } },
      { type: "line", base: { x1: "90", y1: "75", x2: "95", y2: "118" } },
      { type: "line", base: { x1: "95", y1: "118", x2: "90", y2: "165" } }, // jambe d'appui
      { type: "line", base: { x1: "90", y1: "165", x2: "85", y2: "205" } },
      { type: "line", keys: { x1: "95", y1: "118", x2: loop("120", "165"), y2: loop("140", "125") } }, // jambe frappe
      { type: "line", base: { x1: "95", y1: "100", x2: "115", y2: "110" } },
      { type: "line", base: { x1: "182", y1: "40", x2: "182", y2: "210" } }, // mur
    ],
    dur: "1.4s",
  },
  // plongeon gardien
  dive: {
    segments: [
      { type: "circle", r: 10, base: {}, keys: { cx: loop("100", "150"), cy: loop("80", "165") } },
      { type: "line", keys: { x1: loop("100", "150"), y1: loop("90", "175"), x2: loop("100", "155"), y2: loop("140", "195") } },
      { type: "line", keys: { x1: loop("100", "155"), y1: loop("140", "195"), x2: loop("115", "175"), y2: loop("175", "200") } },
      { type: "line", keys: { x1: loop("100", "150"), y1: loop("90", "175"), x2: loop("70", "185"), y2: loop("105", "160") } },
    ],
    dur: "0.9s",
  },
  // équilibre / proprioception unipodal
  balance: {
    segments: [
      { type: "circle", r: 10, base: { cx: "100", cy: "62" } },
      { type: "line", base: { x1: "100", y1: "72", x2: "100", y2: "120" } },
      { type: "line", base: { x1: "100", y1: "120", x2: "100", y2: "175" } },
      { type: "line", base: { x1: "88", y1: "205", x2: "112", y2: "205" } },
      { type: "line", base: { x1: "100", y1: "175", x2: "100", y2: "205" } },
      { type: "line", keys: { x1: "100", y1: "120", x2: loop("130", "150"), y2: loop("150", "130") } }, // jambe libre qui oscille
      { type: "line", keys: { x1: "100", y1: "80", x2: loop("70", "60"), y2: loop("100", "90") } },
    ],
    dur: "2.6s",
  },
  // mobilité articulaire / étirements
  mobility: {
    segments: [
      { type: "circle", r: 10, base: {}, keys: { cx: loop("100", "108") } },
      { type: "line", keys: { x1: loop("100", "108"), y1: "72", x2: loop("100", "105"), y2: "125" } },
      { type: "line", keys: { x1: loop("100", "105"), y1: "125", x2: loop("100", "130"), y2: loop("160", "150") } },
      { type: "line", keys: { x1: loop("100", "130"), y1: loop("160", "150"), x2: loop("100", "125"), y2: "205" } },
      { type: "line", base: { x1: "100", y1: "125", x2: "100", y2: "170" } },
      { type: "line", base: { x1: "88", y1: "205", x2: "112", y2: "205" } },
    ],
    dur: "2.4s",
  },
  // nordic hamstring : bascule contrôlée genoux au sol
  nordic: {
    ground: true,
    segments: [
      { type: "circle", r: 9, base: {}, keys: { cx: loop("100", "150"), cy: loop("95", "130") } },
      { type: "line", keys: { x1: loop("100", "150"), y1: loop("104", "138"), x2: "100", y2: "150" } },
      { type: "line", base: { x1: "100", y1: "150", x2: "100", y2: "205" } },
      { type: "line", base: { x1: "88", y1: "205", x2: "112", y2: "205" } },
      { type: "line", keys: { x1: loop("100", "150"), y1: loop("104", "138"), x2: loop("70", "170"), y2: loop("130", "150") } },
    ],
    dur: "2.6s",
  },
  // superman : extension dorsale au sol
  superman: {
    ground: true,
    segments: [
      { type: "circle", r: 9, base: {}, keys: { cx: loop("48", "50"), cy: loop("165", "155") } },
      { type: "line", keys: { x1: loop("57", "59"), y1: loop("166", "156"), x2: "150", y2: "168" } },
      { type: "line", keys: { x1: "150", y1: "168", x2: loop("182", "185"), y2: loop("178", "160") } },
      { type: "line", keys: { x1: loop("57", "59"), y1: loop("166", "156"), x2: loop("28", "25"), y2: loop("178", "150") } },
    ],
    dur: "2s",
  },
  // mollets : montée sur pointes
  "calf-raise": {
    segments: [
      { type: "circle", r: 10, base: {}, keys: { cx: "100", cy: loop("70", "58") } },
      { type: "line", keys: { x1: "100", y1: loop("80", "68"), x2: "100", y2: loop("140", "128") } },
      { type: "line", keys: { x1: "100", y1: loop("140", "128"), x2: "100", y2: loop("178", "170") } },
      { type: "line", keys: { x1: "100", y1: loop("178", "170"), x2: "100", y2: loop("205", "195") } },
      { type: "line", base: { x1: "88", y1: "205", x2: "112", y2: "205" } },
    ],
    dur: "1.4s",
  },
};

// ---------- mapping exercice → famille (couverture des 60 exercices) ----------

export const ILLUSTRATION_MAP: Record<string, keyof typeof ARCHETYPES> = {
  // technique / conduite
  "toe-taps": "juggle",
  "semelles-alternees": "juggle",
  foundations: "juggle",
  "conduite-en-huit": "dribble",
  "sole-rolls": "dribble",
  croquettes: "dribble",
  "jonglage-pied-fort": "juggle",
  "jonglage-pied-faible": "juggle",
  "jonglage-enchainements": "juggle",
  "passes-mur-deux-touches": "wall-pass",
  "passes-mur-une-touche": "wall-pass",
  "controle-oriente-mur": "wall-pass",
  "v-cuts": "dribble",
  "pull-push": "dribble",
  ciseaux: "dribble",
  "crochet-court": "dribble",
  "cruyff-turn": "dribble",
  "conduite-tete-levee": "dribble",
  // renforcement
  planche: "plank",
  "planche-laterale": "plank",
  "planche-dynamique": "mountain-climber",
  squats: "squat",
  "fentes-avant": "squat",
  "fentes-laterales": "lunge-lateral",
  "pont-fessier": "glute-bridge",
  "pont-fessier-unijambiste": "glute-bridge",
  "pompes-progression": "pushup",
  "mountain-climbers": "mountain-climber",
  superman: "superman",
  chaise: "squat",
  "mollets-marche": "calf-raise",
  "copenhagen-plank": "plank",
  // explosivité
  "squat-jumps": "jump",
  "fentes-sautees": "squat",
  "skater-jumps": "lunge-lateral",
  "sprints-courts": "sprint",
  "departs-varies": "sprint",
  "montees-genoux": "sprint",
  "talons-fesses": "sprint",
  "gammes-athletiques": "sprint",
  "bondissements-horizontaux": "jump",
  "appuis-rapides": "sprint",
  // cardio
  "fartlek-15": "sprint",
  "intermittent-30-30": "sprint",
  "navette-conduite": "dribble",
  "gamme-progressive": "sprint",
  "pyramide-30-45-60": "sprint",
  // prévention
  "equilibre-unipodal": "balance",
  "proprioception-yeux-fermes": "balance",
  "nordic-hamstring-assiste": "nordic",
  "mobilite-chevilles": "mobility",
  "mobilite-hanches": "mobility",
  "mollets-excentrique": "calf-raise",
  "etirements-fin-seance": "mobility",
  // gardien
  "appuis-plongeons-souple": "dive",
  "deplacements-lateraux-gardien": "lunge-lateral",
  "jeu-au-pied-mur": "wall-pass",
  "prises-de-balle-mur": "dive",
  "detente-verticale-gardien": "jump",
  "reflexes-balle-mur": "dive",
};

const CATEGORY_FALLBACK: Record<string, keyof typeof ARCHETYPES> = {
  technique: "dribble",
  renforcement: "squat",
  explosivite: "jump",
  cardio: "sprint",
  prevention: "balance",
  gardien: "dive",
};

function Stick({ archetype }: { archetype: Archetype }) {
  const dur = archetype.dur ?? DUR;
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 220" role="presentation" aria-hidden="true">
      {archetype.ground && (
        <line x1="20" y1="205" x2="180" y2="205" stroke="#2A2B2D" strokeWidth="1" strokeDasharray="3 4" />
      )}
      <g stroke="#EDE9E0" strokeWidth="5" strokeLinecap="round" fill="none">
        {archetype.segments.map((seg, i) => {
          if (seg.type === "circle") {
            const base = seg.base ?? {};
            return (
              <circle key={i} cx={base.cx ?? "100"} cy={base.cy ?? "65"} r={seg.r} fill={seg.fill ?? "#EDE9E0"} stroke="none">
                {seg.keys?.cx && <animate attributeName="cx" values={seg.keys.cx} {...animAttrs(dur)} />}
                {seg.keys?.cy && <animate attributeName="cy" values={seg.keys.cy} {...animAttrs(dur)} />}
              </circle>
            );
          }
          const base = seg.base ?? {};
          return (
            <line
              key={i}
              x1={base.x1 ?? "100"}
              y1={base.y1 ?? "100"}
              x2={base.x2 ?? "100"}
              y2={base.y2 ?? "100"}
            >
              {seg.keys?.x1 && <animate attributeName="x1" values={seg.keys.x1} {...animAttrs(dur)} />}
              {seg.keys?.y1 && <animate attributeName="y1" values={seg.keys.y1} {...animAttrs(dur)} />}
              {seg.keys?.x2 && <animate attributeName="x2" values={seg.keys.x2} {...animAttrs(dur)} />}
              {seg.keys?.y2 && <animate attributeName="y2" values={seg.keys.y2} {...animAttrs(dur)} />}
            </line>
          );
        })}
      </g>
    </svg>
  );
}

export function ExerciseIllustration({ slug, category }: { slug: string; category: string }) {
  const key = ILLUSTRATION_MAP[slug] ?? CATEGORY_FALLBACK[category] ?? "squat";
  const archetype = ARCHETYPES[key];
  return (
    <div className="flex justify-center rounded-lg border border-line bg-night py-3">
      <div className="h-40 w-40">
        <Stick archetype={archetype} />
      </div>
    </div>
  );
}
