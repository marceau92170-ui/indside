// Illustrations animées en boucle, dessinées à la main (SVG + SMIL) — jamais générées.
// Un mouvement mal dessiné se corrige une fois pour toutes ; une vidéo IA mal générée
// apprendrait un mauvais geste à chaque joueur qui la regarde. D'où ce choix.
//
// Principe : un seul jeu de coordonnées par famille de mouvement (Archetype), rendu de
// deux façons :
//   - gratuit  → figure « bâton » épurée (Stick)
//   - premium  → même mouvement, mais personnage habillé façon appli de sport
//     (maillot, peau, short, chaussures, cheveux, contour) — PremiumFigure.
// Chaque exercice de la bibliothèque est mappé vers la famille la plus proche
// visuellement — aucun exercice n'est laissé sans illustration.

type BodyPart =
  | "head"
  | "torso"
  | "hips"
  | "thigh"
  | "shin"
  | "leg"
  | "arm"
  | "forearm"
  | "foot"
  | "ball"
  | "prop";

type Keyed = Partial<Record<"cx" | "cy" | "x1" | "y1" | "x2" | "y2", string>>;

type Segment =
  | { type: "circle"; r: number; fill?: string; part?: BodyPart; base?: Keyed; keys?: Keyed }
  | { type: "line"; part?: BodyPart; base?: Keyed; keys?: Keyed };

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
      { type: "circle", r: 10, part: "head", base: {}, keys: { cx: loop("100", "90"), cy: loop("65", "103") } },
      { type: "line", part: "torso", keys: { x1: loop("100", "85"), y1: loop("120", "165"), x2: loop("100", "95"), y2: loop("80", "118") } }, // torse
      { type: "line", part: "thigh", keys: { x1: loop("100", "85"), y1: loop("120", "165"), x2: loop("100", "108"), y2: loop("165", "178") } }, // cuisse
      { type: "line", part: "shin", keys: { x1: loop("100", "108"), y1: loop("165", "178"), x2: "100", y2: "205" } }, // tibia
      { type: "line", part: "foot", base: { x1: "88", y1: "205", x2: "118", y2: "205" } }, // pied
      { type: "line", part: "arm", keys: { x1: loop("100", "95"), y1: loop("80", "118"), x2: loop("118", "148"), y2: loop("102", "128") } }, // bras
    ],
  },
  // fente latérale : une jambe fléchie (appui, genou au-dessus du pied), l'autre
  // tendue sur le côté, buste penché vers la jambe d'appui, bras en avant.
  "lunge-lateral": {
    segments: [
      { type: "circle", r: 10, part: "head", keys: { cx: loop("100", "74"), cy: loop("65", "80") } },
      { type: "line", part: "torso", keys: { x1: loop("100", "74"), y1: loop("120", "140"), x2: loop("100", "78"), y2: loop("80", "95") } },
      // jambe fléchie (appui)
      { type: "line", part: "thigh", keys: { x1: loop("100", "74"), y1: loop("120", "140"), x2: loop("90", "58"), y2: loop("160", "176") } },
      { type: "line", part: "shin", keys: { x1: loop("90", "58"), y1: loop("160", "176"), x2: loop("88", "54"), y2: "205" } },
      { type: "line", part: "foot", keys: { x1: loop("76", "42"), y1: "205", x2: loop("100", "66"), y2: "205" } },
      // jambe tendue (opposée) qui reste au sol
      { type: "line", part: "leg", keys: { x1: loop("100", "74"), y1: loop("120", "140"), x2: loop("108", "150"), y2: loop("205", "203") } },
      { type: "line", part: "foot", keys: { x1: loop("96", "138"), y1: "205", x2: loop("120", "164"), y2: "205" } },
      { type: "line", part: "arm", keys: { x1: loop("100", "78"), y1: loop("88", "100"), x2: loop("122", "104"), y2: loop("100", "114") } },
    ],
  },
  // gainage statique / dynamique : planche, planche latérale, copenhagen
  plank: {
    ground: true,
    segments: [
      { type: "circle", r: 9, part: "head", base: { cx: "50", cy: "138" } },
      { type: "line", part: "torso", base: { x1: "60", y1: "140", x2: "115", y2: "150" } }, // torse
      { type: "line", part: "thigh", base: { x1: "115", y1: "150", x2: "150", y2: "155" } }, // hanche->cuisse
      { type: "line", part: "shin", base: { x1: "150", y1: "155", x2: "182", y2: "160" } }, // jambe
      { type: "line", part: "forearm", keys: { y1: loop("100", "170"), x1: "58", x2: "50", y2: loop("112", "182") } }, // avant-bras (contact sol)
    ],
    dur: "1.8s",
  },
  // gainage dynamique + montée de genoux : mountain climbers
  "mountain-climber": {
    ground: true,
    segments: [
      { type: "circle", r: 9, part: "head", base: { cx: "48", cy: "138" } },
      { type: "line", part: "torso", base: { x1: "58", y1: "140", x2: "110", y2: "150" } },
      { type: "line", part: "arm", base: { x1: "58", y1: "128", x2: "58", y2: "175" } },
      { type: "line", part: "thigh", keys: { x1: loop("110", "112"), y1: loop("150", "150"), x2: loop("170", "125"), y2: loop("158", "175") } }, // cuisse animée
      { type: "line", part: "shin", keys: { x1: loop("170", "125"), y1: loop("158", "175"), x2: loop("182", "142"), y2: loop("178", "180") } }, // tibia animé
    ],
    dur: "1s",
  },
  // pont fessier : allongé, bascule du bassin
  "glute-bridge": {
    segments: [
      { type: "circle", r: 9, part: "head", base: { cx: "40", cy: "175" } },
      { type: "line", part: "torso", base: { x1: "49", y1: "175", x2: "95", y2: "175" } }, // torse au sol
      { type: "line", part: "hips", keys: { x1: "95", y1: "175", x2: "95", y2: loop("175", "150") } }, // hanche qui monte (segment vertical symbolique)
      { type: "line", part: "thigh", base: { x1: "95", y1: "175", x2: "130", y2: "165" } }, // cuisse
      { type: "line", part: "shin", base: { x1: "130", y1: "165", x2: "130", y2: "205" } }, // tibia vertical (pied au sol)
      { type: "line", part: "foot", base: { x1: "116", y1: "205", x2: "144", y2: "205" } },
    ],
    dur: "1.6s",
  },
  // pompes : appui au sol, flexion des bras
  pushup: {
    ground: true,
    segments: [
      { type: "circle", r: 9, part: "head", base: {}, keys: { cx: loop("50", "52"), cy: loop("150", "162") } },
      { type: "line", part: "torso", keys: { x1: loop("60", "62"), y1: loop("152", "163"), x2: "150", y2: "170" } },
      { type: "line", part: "leg", base: { x1: "150", y1: "170", x2: "182", y2: "178" } },
      { type: "line", part: "arm", keys: { x1: loop("60", "62"), y1: loop("152", "163"), x2: loop("55", "40"), y2: loop("195", "185") } },
    ],
    dur: "1.6s",
  },
  // saut : flexion (bas) → envol bras en l'air, genoux fléchis, pieds décollés.
  jump: {
    segments: [
      { type: "circle", r: 10, part: "head", base: { cx: "100" }, keys: { cy: loop("95", "48") } },
      { type: "line", part: "torso", keys: { x1: "100", y1: loop("150", "108"), x2: "100", y2: loop("108", "60") } },
      { type: "line", part: "arm", keys: { x1: "100", y1: loop("118", "70"), x2: loop("124", "120"), y2: loop("138", "38") } }, // bras qui monte
      { type: "line", part: "arm", keys: { x1: "100", y1: loop("118", "70"), x2: loop("76", "80"), y2: loop("138", "38") } },
      { type: "line", part: "thigh", keys: { x1: "100", y1: loop("150", "108"), x2: loop("110", "118"), y2: loop("182", "150") } },
      { type: "line", part: "shin", keys: { x1: loop("110", "118"), y1: loop("182", "150"), x2: loop("104", "122"), y2: loop("205", "172") } }, // pied qui décolle
      { type: "line", part: "thigh", keys: { x1: "100", y1: loop("150", "108"), x2: loop("90", "82"), y2: loop("182", "150") } },
      { type: "line", part: "shin", keys: { x1: loop("90", "82"), y1: loop("182", "150"), x2: loop("96", "78"), y2: loop("205", "172") } },
    ],
    dur: "1.1s",
  },
  // course / montées de genoux / gammes / sprint / intermittent
  sprint: {
    segments: [
      { type: "circle", r: 9, part: "head", base: {}, keys: { cx: loop("95", "105"), cy: "62" } },
      { type: "line", part: "torso", keys: { x1: loop("100", "108"), y1: "118", x2: loop("100", "112"), y2: "72" } },
      { type: "line", part: "thigh", keys: { x1: loop("100", "108"), y1: "118", x2: loop("125", "80"), y2: loop("150", "155") } }, // cuisse avant
      { type: "line", part: "shin", keys: { x1: loop("125", "80"), y1: loop("150", "155"), x2: loop("110", "65"), y2: loop("195", "205") } },
      { type: "line", part: "thigh", keys: { x1: loop("100", "108"), y1: "118", x2: loop("78", "130"), y2: loop("150", "165") } }, // cuisse arrière
      { type: "line", part: "shin", keys: { x1: loop("78", "130"), y1: loop("150", "165"), x2: loop("95", "150"), y2: loop("120", "175") } },
      { type: "line", part: "arm", keys: { x1: loop("100", "112"), y1: "72", x2: loop("135", "90"), y2: loop("95", "60") } },
    ],
    dur: "0.85s",
  },
  // touches de balle au pied : jonglage, toe taps, foundations
  juggle: {
    segments: [
      { type: "circle", r: 6, fill: "#E12A3A", part: "ball", keys: { cy: loop("100", "150") } }, // ballon
      { type: "circle", r: 10, part: "head", base: { cx: "100", cy: "62" } },
      { type: "line", part: "torso", base: { x1: "100", y1: "72", x2: "100", y2: "118" } },
      // jambe d'appui plantée au sol (sinon la figure semble flotter)
      { type: "line", part: "thigh", base: { x1: "100", y1: "118", x2: "112", y2: "165" } },
      { type: "line", part: "shin", base: { x1: "112", y1: "165", x2: "112", y2: "205" } },
      { type: "line", part: "foot", base: { x1: "100", y1: "205", x2: "126", y2: "205" } },
      // jambe qui touche le ballon (animée)
      { type: "line", part: "thigh", keys: { x1: "100", y1: "118", x2: loop("90", "100"), y2: loop("160", "150") } },
      { type: "line", part: "shin", keys: { x1: loop("90", "100"), y1: loop("160", "150"), x2: loop("85", "96"), y2: loop("190", "165") } },
    ],
    dur: "0.9s",
  },
  // conduite / dribble : croquettes, v-cuts, crochet, cruyff, ciseaux, navette
  // Joueur penché en avant, une jambe d'appui (pied posé), une jambe qui pousse le
  // ballon devant, un bras tendu pour l'équilibre. Le ballon fait un va-et-vient.
  dribble: {
    segments: [
      { type: "circle", r: 6, fill: "#E12A3A", part: "ball", base: { cy: "199" }, keys: { cx: loop("126", "104") } }, // ballon
      { type: "circle", r: 10, part: "head", base: { cx: "98", cy: "60" } },
      { type: "line", part: "torso", base: { x1: "100", y1: "120", x2: "104", y2: "72" } }, // torse penché
      { type: "line", part: "arm", base: { x1: "103", y1: "88", x2: "126", y2: "100" } }, // bras équilibre
      { type: "line", part: "thigh", base: { x1: "100", y1: "120", x2: "88", y2: "160" } }, // cuisse d'appui
      { type: "line", part: "shin", base: { x1: "88", y1: "160", x2: "84", y2: "205" } }, // tibia d'appui
      { type: "line", part: "foot", base: { x1: "72", y1: "205", x2: "96", y2: "205" } }, // pied posé
      { type: "line", part: "thigh", keys: { x1: "100", y1: "120", x2: loop("112", "104"), y2: loop("158", "162") } }, // cuisse avant
      { type: "line", part: "shin", keys: { x1: loop("112", "104"), y1: loop("158", "162"), x2: loop("120", "100"), y2: "200" } }, // tibia qui pousse
    ],
    dur: "1.3s",
  },
  // passe / frappe contre un mur
  "wall-pass": {
    segments: [
      { type: "circle", r: 10, part: "head", base: { cx: "90", cy: "65" } },
      { type: "line", part: "torso", base: { x1: "90", y1: "75", x2: "95", y2: "118" } },
      { type: "line", part: "thigh", base: { x1: "95", y1: "118", x2: "90", y2: "165" } }, // jambe d'appui
      { type: "line", part: "shin", base: { x1: "90", y1: "165", x2: "85", y2: "205" } },
      { type: "line", part: "leg", keys: { x1: "95", y1: "118", x2: loop("120", "165"), y2: loop("140", "125") } }, // jambe frappe
      { type: "line", part: "arm", base: { x1: "95", y1: "100", x2: "115", y2: "110" } },
      { type: "line", part: "prop", base: { x1: "182", y1: "40", x2: "182", y2: "210" } }, // mur
    ],
    dur: "1.4s",
  },
  // plongeon gardien : détente latérale, bras tendus vers le ballon en haut.
  dive: {
    segments: [
      { type: "circle", r: 6, fill: "#E12A3A", part: "ball", keys: { cx: loop("150", "185"), cy: loop("75", "48") } }, // ballon
      { type: "circle", r: 10, part: "head", keys: { cx: loop("110", "148"), cy: loop("120", "86") } },
      { type: "line", part: "torso", keys: { x1: loop("100", "112"), y1: loop("160", "150"), x2: loop("112", "146"), y2: loop("128", "96") } },
      { type: "line", part: "arm", keys: { x1: loop("112", "146"), y1: loop("128", "96"), x2: loop("135", "176"), y2: loop("110", "60") } },
      { type: "line", part: "arm", keys: { x1: loop("112", "146"), y1: loop("128", "96"), x2: loop("128", "168"), y2: loop("122", "82") } },
      { type: "line", part: "leg", keys: { x1: loop("100", "112"), y1: loop("160", "150"), x2: loop("84", "58"), y2: loop("192", "176") } },
      { type: "line", part: "leg", keys: { x1: loop("100", "112"), y1: loop("160", "150"), x2: loop("92", "66"), y2: loop("200", "192") } },
    ],
    dur: "1.1s",
  },
  // équilibre / proprioception unipodal
  balance: {
    segments: [
      { type: "circle", r: 10, part: "head", base: { cx: "100", cy: "62" } },
      { type: "line", part: "torso", base: { x1: "100", y1: "72", x2: "100", y2: "120" } },
      { type: "line", part: "leg", base: { x1: "100", y1: "120", x2: "100", y2: "175" } },
      { type: "line", part: "foot", base: { x1: "88", y1: "205", x2: "112", y2: "205" } },
      { type: "line", part: "shin", base: { x1: "100", y1: "175", x2: "100", y2: "205" } },
      { type: "line", part: "leg", keys: { x1: "100", y1: "120", x2: loop("130", "150"), y2: loop("150", "130") } }, // jambe libre qui oscille
      { type: "line", part: "arm", keys: { x1: "100", y1: "80", x2: loop("70", "60"), y2: loop("100", "90") } },
    ],
    dur: "2.6s",
  },
  // mobilité articulaire / étirements
  mobility: {
    segments: [
      { type: "circle", r: 10, part: "head", base: {}, keys: { cx: loop("100", "108") } },
      { type: "line", part: "torso", keys: { x1: loop("100", "108"), y1: "72", x2: loop("100", "105"), y2: "125" } },
      { type: "line", part: "thigh", keys: { x1: loop("100", "105"), y1: "125", x2: loop("100", "130"), y2: loop("160", "150") } },
      { type: "line", part: "shin", keys: { x1: loop("100", "130"), y1: loop("160", "150"), x2: loop("100", "125"), y2: "205" } },
      { type: "line", part: "leg", base: { x1: "100", y1: "125", x2: "100", y2: "170" } },
      { type: "line", part: "foot", base: { x1: "88", y1: "205", x2: "112", y2: "205" } },
    ],
    dur: "2.4s",
  },
  // nordic hamstring : bascule contrôlée genoux au sol
  nordic: {
    ground: true,
    segments: [
      { type: "circle", r: 9, part: "head", base: {}, keys: { cx: loop("100", "150"), cy: loop("95", "130") } },
      { type: "line", part: "torso", keys: { x1: loop("100", "150"), y1: loop("104", "138"), x2: "100", y2: "150" } },
      { type: "line", part: "leg", base: { x1: "100", y1: "150", x2: "100", y2: "205" } },
      { type: "line", part: "foot", base: { x1: "88", y1: "205", x2: "112", y2: "205" } },
      { type: "line", part: "arm", keys: { x1: loop("100", "150"), y1: loop("104", "138"), x2: loop("70", "170"), y2: loop("130", "150") } },
    ],
    dur: "2.6s",
  },
  // superman : extension dorsale au sol
  superman: {
    ground: true,
    segments: [
      { type: "circle", r: 9, part: "head", base: {}, keys: { cx: loop("48", "50"), cy: loop("165", "155") } },
      { type: "line", part: "torso", keys: { x1: loop("57", "59"), y1: loop("166", "156"), x2: "150", y2: "168" } },
      { type: "line", part: "leg", keys: { x1: "150", y1: "168", x2: loop("182", "185"), y2: loop("178", "160") } },
      { type: "line", part: "arm", keys: { x1: loop("57", "59"), y1: loop("166", "156"), x2: loop("28", "25"), y2: loop("178", "150") } },
    ],
    dur: "2s",
  },
  // mollets : montée sur pointes
  "calf-raise": {
    segments: [
      { type: "circle", r: 10, part: "head", base: {}, keys: { cx: "100", cy: loop("70", "58") } },
      { type: "line", part: "torso", keys: { x1: "100", y1: loop("80", "68"), x2: "100", y2: loop("140", "128") } },
      { type: "line", part: "thigh", keys: { x1: "100", y1: loop("140", "128"), x2: "100", y2: loop("178", "170") } },
      { type: "line", part: "shin", keys: { x1: "100", y1: loop("178", "170"), x2: "100", y2: loop("205", "195") } },
      { type: "line", part: "foot", base: { x1: "88", y1: "205", x2: "112", y2: "205" } },
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

// Le point clé à surveiller pour CHAQUE famille de mouvement — tiré des
// consignes techniques de la bibliothèque. C'est ce qui transforme une animation
// en vrai repère d'exécution.
const COACHING_CUES: Record<keyof typeof ARCHETYPES, string> = {
  squat: "Genoux dans l'axe des pieds, talons au sol, dos droit.",
  "lunge-lateral": "Genou fléchi au-dessus de la cheville, buste droit.",
  plank: "Corps aligné tête–bassin–talons. Ne creuse pas le dos.",
  "mountain-climber": "Bassin bas et stable, comme en planche.",
  "glute-bridge": "Serre les fessiers en haut, ne cambre pas le bas du dos.",
  pushup: "Coudes à 45°, gainage serré, poitrine qui frôle le sol.",
  jump: "Atterris en douceur, genoux fléchis dans l'axe.",
  sprint: "Buste droit, appuis sous le bassin, bras rythmés.",
  juggle: "Cheville verrouillée, ballon à hauteur de ceinture.",
  dribble: "Petites touches, ballon proche, tête qui se lève.",
  "wall-pass": "Intérieur du pied, contrôle orienté vers ta prochaine passe.",
  dive: "Genou–hanche–épaule au sol, jamais le coude en premier.",
  balance: "Genou légèrement fléchi, regard loin devant.",
  mobility: "Amplitude progressive, souffle long, jamais d'à-coup.",
  nordic: "Descends le plus lentement possible, corps aligné.",
  superman: "Regarde le sol (nuque neutre), ne force pas sur les lombaires.",
  "calf-raise": "Monte haut sur les pointes, descente lente et contrôlée.",
};

// Position d'arrivée d'un mouvement animé (2ᵉ image-clé de "a;b;a") — sert à
// dessiner un « fantôme » du geste en extrême, pour visualiser l'amplitude.
function ghost(v: string | undefined, fallback: string): string {
  if (!v) return fallback;
  const parts = v.split(";");
  return parts[1] ?? parts[0] ?? fallback;
}

function GhostFigure({ archetype }: { archetype: Archetype }) {
  return (
    <g stroke="#EDE9E0" strokeOpacity="0.13" strokeWidth="6" strokeLinecap="round" fill="none">
      {archetype.segments.map((seg, i) => {
        if (seg.type === "circle") {
          const b = seg.base ?? {};
          const k = seg.keys ?? {};
          return (
            <circle
              key={i}
              cx={ghost(k.cx, b.cx ?? "100")}
              cy={ghost(k.cy, b.cy ?? "65")}
              r={seg.r}
              fill="#EDE9E0"
              fillOpacity="0.10"
              stroke="none"
            />
          );
        }
        const b = seg.base ?? {};
        const k = seg.keys ?? {};
        return (
          <line
            key={i}
            x1={ghost(k.x1, b.x1 ?? "100")}
            y1={ghost(k.y1, b.y1 ?? "100")}
            x2={ghost(k.x2, b.x2 ?? "100")}
            y2={ghost(k.y2, b.y2 ?? "100")}
          />
        );
      })}
    </g>
  );
}

function Stick({ archetype }: { archetype: Archetype }) {
  const dur = archetype.dur ?? DUR;
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 220" role="presentation" aria-hidden="true">
      <defs>
        <radialGradient id="ex-vignette" cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor="#17181A" />
          <stop offset="100%" stopColor="#0C0D0F" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="200" height="220" fill="url(#ex-vignette)" />

      {/* ombre au sol (figures debout) ou ligne de sol (figures au sol) */}
      {archetype.ground ? (
        <line x1="20" y1="205" x2="180" y2="205" stroke="#2A2B2D" strokeWidth="1.5" strokeDasharray="3 4" />
      ) : (
        <ellipse cx="100" cy="207" rx="46" ry="6" fill="#000" fillOpacity="0.35" />
      )}

      {/* fantôme de la position d'arrivée : montre l'amplitude du geste */}
      <GhostFigure archetype={archetype} />

      {/* figure animée */}
      <g stroke="#EDE9E0" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
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

// ---------- rendu premium : personnage habillé ----------

const SKIN = "#E7B183";
const JERSEY = "#E12A3A";
// Short assez clair pour bien se détacher du fond sombre : sinon la cuisse
// (qui utilise cette couleur) disparaît et le corps semble « cassé »/flottant.
const SHORTS = "#5C6E85";
const SHOE = "#E9ECEF";
const HAIR = "#211C19";
const OUTLINE = "#0A0B0D";

// Couleur + épaisseur du membre selon la partie du corps.
const PART_STYLE: Record<BodyPart, { stroke: string; width: number }> = {
  head: { stroke: SKIN, width: 0 }, // géré à part
  torso: { stroke: JERSEY, width: 22 },
  hips: { stroke: SHORTS, width: 20 },
  thigh: { stroke: SHORTS, width: 17 },
  shin: { stroke: SKIN, width: 13 },
  leg: { stroke: SKIN, width: 15 },
  arm: { stroke: SKIN, width: 13 },
  forearm: { stroke: SKIN, width: 12 },
  foot: { stroke: SHOE, width: 11 },
  ball: { stroke: JERSEY, width: 0 }, // géré à part
  prop: { stroke: "#3A3B3D", width: 6 },
};

// Décale chaque valeur d'un "a;b;a" (ou une valeur simple) — pour placer les
// cheveux légèrement au-dessus du centre de la tête, en suivant l'animation.
function shift(v: string | undefined, dy: number, fallback: string): string {
  const src = v ?? fallback;
  return src
    .split(";")
    .map((n) => String(Number(n) + dy))
    .join(";");
}

function lineAnims(keys: Keyed | undefined, dur: string) {
  if (!keys) return null;
  return (
    <>
      {keys.x1 && <animate attributeName="x1" values={keys.x1} {...animAttrs(dur)} />}
      {keys.y1 && <animate attributeName="y1" values={keys.y1} {...animAttrs(dur)} />}
      {keys.x2 && <animate attributeName="x2" values={keys.x2} {...animAttrs(dur)} />}
      {keys.y2 && <animate attributeName="y2" values={keys.y2} {...animAttrs(dur)} />}
    </>
  );
}

function PremiumFigure({ archetype }: { archetype: Archetype }) {
  const dur = archetype.dur ?? DUR;
  const segs = archetype.segments;
  const limbs = segs.filter(
    (s): s is Extract<Segment, { type: "line" }> => s.type === "line"
  );
  const heads = segs.filter((s) => s.type === "circle" && s.part === "head") as Extract<
    Segment,
    { type: "circle" }
  >[];
  const balls = segs.filter((s) => s.type === "circle" && s.part === "ball") as Extract<
    Segment,
    { type: "circle" }
  >[];

  function limbStroke(seg: Extract<Segment, { type: "line" }>) {
    const style = PART_STYLE[seg.part ?? "leg"];
    const base = seg.base ?? {};
    return {
      x1: base.x1 ?? "100",
      y1: base.y1 ?? "100",
      x2: base.x2 ?? "100",
      y2: base.y2 ?? "100",
      style,
      keys: seg.keys,
    };
  }

  return (
    <svg width="100%" height="100%" viewBox="0 0 200 220" role="presentation" aria-hidden="true">
      <defs>
        <radialGradient id="ex-vignette-pro" cx="50%" cy="40%" r="72%">
          <stop offset="0%" stopColor="#2B313A" />
          <stop offset="70%" stopColor="#1B1F25" />
          <stop offset="100%" stopColor="#14161A" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="200" height="220" fill="url(#ex-vignette-pro)" />

      {archetype.ground ? (
        <line x1="18" y1="206" x2="182" y2="206" stroke="#3A424D" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <ellipse cx="100" cy="208" rx="48" ry="6.5" fill="#000" fillOpacity="0.34" />
      )}

      {/* passe 1 : contour sombre (donne le rendu "flat illustration") */}
      <g stroke={OUTLINE} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9">
        {limbs.map((seg, i) => {
          const l = limbStroke(seg);
          return (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeWidth={l.style.width + 5}>
              {lineAnims(l.keys, dur)}
            </line>
          );
        })}
        {heads.map((seg, i) => {
          const b = seg.base ?? {};
          return (
            <circle key={`ho${i}`} cx={b.cx ?? "100"} cy={b.cy ?? "65"} r={seg.r + 3} fill={OUTLINE} stroke="none">
              {seg.keys?.cx && <animate attributeName="cx" values={seg.keys.cx} {...animAttrs(dur)} />}
              {seg.keys?.cy && <animate attributeName="cy" values={seg.keys.cy} {...animAttrs(dur)} />}
            </circle>
          );
        })}
      </g>

      {/* passe 2 : membres colorés */}
      <g strokeLinecap="round" strokeLinejoin="round" fill="none">
        {limbs.map((seg, i) => {
          const l = limbStroke(seg);
          return (
            <line
              key={i}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke={l.style.stroke}
              strokeWidth={l.style.width}
            >
              {lineAnims(l.keys, dur)}
            </line>
          );
        })}
      </g>

      {/* têtes : cheveux (légèrement au-dessus) puis visage peau */}
      {heads.map((seg, i) => {
        const b = seg.base ?? {};
        const hairCy = shift(seg.keys?.cy, -4, b.cy ?? "65");
        const hairCx = seg.keys?.cx ?? b.cx ?? "100";
        return (
          <g key={`h${i}`}>
            <circle cx={b.cx ?? "100"} cy={shift(undefined, -4, b.cy ?? "65")} r={seg.r + 1} fill={HAIR} stroke="none">
              {seg.keys?.cx && <animate attributeName="cx" values={hairCx} {...animAttrs(dur)} />}
              <animate attributeName="cy" values={hairCy} {...animAttrs(dur)} />
            </circle>
            <circle cx={b.cx ?? "100"} cy={b.cy ?? "65"} r={seg.r + 2} fill={SKIN} stroke="none">
              {seg.keys?.cx && <animate attributeName="cx" values={seg.keys.cx} {...animAttrs(dur)} />}
              {seg.keys?.cy && <animate attributeName="cy" values={seg.keys.cy} {...animAttrs(dur)} />}
            </circle>
          </g>
        );
      })}

      {/* ballon (blanc, liseré sombre + petit pentagone central) */}
      {balls.map((seg, i) => {
        const b = seg.base ?? {};
        const cxAnim = seg.keys?.cx && <animate attributeName="cx" values={seg.keys.cx} {...animAttrs(dur)} />;
        const cyAnim = seg.keys?.cy && <animate attributeName="cy" values={seg.keys.cy} {...animAttrs(dur)} />;
        return (
          <g key={`b${i}`}>
            <circle cx={b.cx ?? "100"} cy={b.cy ?? "100"} r={seg.r} fill="#F4F5F6" stroke={OUTLINE} strokeWidth="1.5">
              {cxAnim}
              {cyAnim}
            </circle>
            <circle cx={b.cx ?? "100"} cy={b.cy ?? "100"} r={seg.r * 0.34} fill="#1B1F25">
              {seg.keys?.cx && <animate attributeName="cx" values={seg.keys.cx} {...animAttrs(dur)} />}
              {seg.keys?.cy && <animate attributeName="cy" values={seg.keys.cy} {...animAttrs(dur)} />}
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

export function ExerciseIllustration({
  slug,
  category,
  premium = false,
  showCue = true,
}: {
  slug: string;
  category: string;
  premium?: boolean;
  showCue?: boolean;
}) {
  const key = ILLUSTRATION_MAP[slug] ?? CATEGORY_FALLBACK[category] ?? "squat";
  const archetype = ARCHETYPES[key];
  const cue = COACHING_CUES[key];
  return (
    <div className="mx-auto max-w-[280px] overflow-hidden rounded-lg border border-line bg-night">
      <div className="aspect-square w-full">
        {premium ? <PremiumFigure archetype={archetype} /> : <Stick archetype={archetype} />}
      </div>
      {showCue && cue && (
        <div className="flex items-start gap-2 border-t border-line px-3 py-2.5">
          <span aria-hidden="true" className="text-glow">👁</span>
          <p className="text-xs leading-snug text-chalk">
            <span className="font-semibold uppercase tracking-wide text-muted">À surveiller — </span>
            {cue}
          </p>
        </div>
      )}
    </div>
  );
}
