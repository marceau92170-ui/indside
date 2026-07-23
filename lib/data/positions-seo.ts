// Contenu SEO des pages "programme d'entraînement par poste".
// Public, indexable : cible les recherches "programme foot ailier",
// "exercices défenseur central", "entraînement gardien de but", etc.

export type PositionSeo = {
  slug: string; // URL : /programme/<slug>
  posKey: string; // clé du profil (GB, DC, LAT, MDF, MOF, AIL, ATT)
  label: string; // "Ailier"
  emoji: string;
  intro: string;
  qualities: { title: string; desc: string }[];
  focus: string[];
};

export const POSITIONS_SEO: PositionSeo[] = [
  {
    slug: "gardien",
    posKey: "GB",
    label: "Gardien de but",
    emoji: "🧤",
    intro:
      "Le gardien moderne doit être explosif sur sa ligne, vif dans ses appuis et propre au pied. Entre les entraînements club, un gardien progresse surtout sur la vitesse de réaction, la détente latérale et la relance.",
    qualities: [
      { title: "Explosivité latérale", desc: "Détente et poussée sur les côtés pour couvrir les angles — la qualité n°1 d'un gardien." },
      { title: "Vitesse de réaction", desc: "Déclencher vite sur un ballon proche : travail des appuis et de la prise d'information." },
      { title: "Jeu au pied", desc: "Relance courte et longue précise, des deux pieds — le gardien est devenu le premier relanceur." },
      { title: "Gainage & sécurité", desc: "Renforcement du tronc et prévention des épaules/poignets pour encaisser les chocs." },
    ],
    focus: [
      "Travail d'appuis et de déplacements courts (échelle de rythme, plots)",
      "Détente et poussée latérale (au poids du corps avant 15 ans)",
      "Précision de relance contre un mur, des deux pieds",
      "Gainage et prévention spécifique haut du corps",
    ],
  },
  {
    slug: "defenseur-central",
    posKey: "DC",
    label: "Défenseur central",
    emoji: "🛡️",
    intro:
      "Le défenseur central s'appuie sur la puissance dans les duels, le jeu de tête et la relance propre. Le travail individuel porte sur le renforcement, l'explosivité sur les premiers appuis et la qualité de passe.",
    qualities: [
      { title: "Puissance & duels", desc: "Renforcement bas du corps et gainage pour gagner les duels au sol et en l'air." },
      { title: "Détente verticale", desc: "Impulsion sur le jeu de tête, offensif comme défensif." },
      { title: "Vitesse de démarrage", desc: "Explosivité sur les 5 premiers mètres pour couper les trajectoires et repartir." },
      { title: "Relance propre", desc: "Qualité de passe courte et longue sous pression, des deux pieds." },
    ],
    focus: [
      "Renforcement jambes + gainage (progressif selon l'âge)",
      "Détente verticale et impulsion sur un appui",
      "Accélérations courtes 5-10 m",
      "Passes longues et courtes précises contre un mur",
    ],
  },
  {
    slug: "lateral",
    posKey: "LAT",
    label: "Latéral",
    emoji: "🏃",
    intro:
      "Le latéral parcourt d'énormes distances : c'est un poste d'endurance et de répétition d'efforts. Le travail individuel cible la vitesse de couloir, la répétition de sprints et la qualité de centre.",
    qualities: [
      { title: "Endurance de couloir", desc: "Capacité à monter et redescendre tout le match sans baisse de régime." },
      { title: "Répétition de sprints", desc: "Enchaîner des accélérations avec peu de récupération (capacité aérobie + explosivité)." },
      { title: "Vitesse pure", desc: "Prendre le dos de l'adversaire sur les débordements." },
      { title: "Qualité de centre", desc: "Centres précis en course, du pied fort et de l'autre." },
    ],
    focus: [
      "Fractionné court (répétition de sprints)",
      "Accélérations et changements d'appui",
      "Endurance aérobie (footing rythmé, navettes)",
      "Centres répétés contre un mur ou vers une cible",
    ],
  },
  {
    slug: "milieu-defensif",
    posKey: "MDF",
    label: "Milieu défensif",
    emoji: "⚙️",
    intro:
      "Le milieu défensif (sentinelle) est le poumon de l'équipe : volume de course, récupération et première passe. Le travail individuel porte sur l'endurance, l'orientation du corps et la qualité de passe sous pression.",
    qualities: [
      { title: "Volume de course", desc: "Endurance pour couvrir, presser et se replacer en permanence." },
      { title: "Récupération & duels", desc: "Timing d'interception et solidité dans les duels au milieu." },
      { title: "Première passe", desc: "Recevoir orienté et casser les lignes avec une passe propre." },
      { title: "Vision & prise d'info", desc: "Regarder avant de recevoir pour jouer vite." },
    ],
    focus: [
      "Endurance aérobie (footing rythmé, navettes longues)",
      "Contrôles orientés et passes des deux pieds contre un mur",
      "Gainage pour la solidité dans les duels",
      "Jeu à une-deux touches en conduite",
    ],
  },
  {
    slug: "milieu-offensif",
    posKey: "MOF",
    label: "Milieu offensif",
    emoji: "🎯",
    intro:
      "Le milieu offensif (numéro 10) vit dans les petits espaces : technique dans un mouchoir de poche, changement de rythme et frappe. Le travail individuel cible la conduite serrée, les crochets et la finition.",
    qualities: [
      { title: "Technique en espace réduit", desc: "Contrôles, crochets et conduite serrée pour se sortir de la pression." },
      { title: "Changement de rythme", desc: "Casser le rythme pour éliminer et créer des décalages." },
      { title: "Qualité de frappe", desc: "Frappe et passe décisive précises, des deux pieds." },
      { title: "Vision du jeu", desc: "Trouver le dernier ballon entre les lignes." },
    ],
    focus: [
      "Conduite de balle serrée et enchaînements de crochets",
      "Jonglage et toucher de balle (relation pied-ballon)",
      "Frappes et passes précises contre un mur",
      "Accélérations courtes après un contrôle",
    ],
  },
  {
    slug: "ailier",
    posKey: "AIL",
    label: "Ailier",
    emoji: "⚡",
    intro:
      "L'ailier fait la différence par la vitesse et le dribble : c'est un poste d'explosivité et de percussion. Le travail individuel porte sur la vitesse pure, le dribble en course et la finition/centre.",
    qualities: [
      { title: "Vitesse & explosivité", desc: "Prendre le dessus dans les courses et les un-contre-un." },
      { title: "Dribble en course", desc: "Éliminer balle au pied à pleine vitesse (crochets, feintes)." },
      { title: "Changement de direction", desc: "Appuis vifs pour repiquer ou déborder." },
      { title: "Finition & centre", desc: "Conclure ou centrer avec précision après le débordement." },
    ],
    focus: [
      "Accélérations et sprints courts (explosivité)",
      "Conduite rapide + crochets à vitesse",
      "Changements de direction sur plots",
      "Frappes et centres répétés",
    ],
  },
  {
    slug: "attaquant",
    posKey: "ATT",
    label: "Attaquant",
    emoji: "🥅",
    intro:
      "L'attaquant vit pour marquer : explosivité dans la surface, jeu dos au but et finition sous toutes les formes. Le travail individuel cible la vitesse de démarrage, la frappe et le jeu de corps.",
    qualities: [
      { title: "Explosivité surface", desc: "Vitesse de démarrage sur les 2-3 premiers mètres pour prendre le dos de la défense." },
      { title: "Finition", desc: "Frappe précise et variée (intérieur, coup de patte, tête)." },
      { title: "Jeu dos au but", desc: "Protéger le ballon, remiser, se retourner — le gainage est clé." },
      { title: "Détente", desc: "Impulsion sur le jeu de tête et les centres." },
    ],
    focus: [
      "Démarrages explosifs 2-5 m",
      "Frappes répétées des deux pieds contre un mur ou vers une cible",
      "Gainage et jeu de corps (protection de balle)",
      "Détente verticale sur un appui",
    ],
  },
];

export function positionSeoBySlug(slug: string): PositionSeo | undefined {
  return POSITIONS_SEO.find((p) => p.slug === slug);
}
