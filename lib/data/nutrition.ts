// Conseils nutrition hebdomadaires — Premium.
// Rédigés à partir du contenu vérifié de /ressources/nutrition : hydratation,
// repas avant/après effort, croissance, sommeil. AUCUN conseil à risque
// (pas de compléments, pas de restriction, pas de dosage médical).
// On fait tourner un conseil "de la semaine" + un rappel adapté au jour de match.

export type NutritionTip = {
  title: string;
  body: string;
  emoji: string;
};

// Conseil général qui tourne chaque semaine (rythme par numéro de semaine).
export const WEEKLY_TIPS: NutritionTip[] = [
  {
    emoji: "💧",
    title: "Bois avant d'avoir soif",
    body: "La soif = tu es déjà déshydraté, et ça fait chuter tes performances. Garde une gourde à portée toute la journée, pas seulement à l'entraînement. Vise ~750 ml dans les 2 h avant une séance.",
  },
  {
    emoji: "🍝",
    title: "Le repas d'avant-séance",
    body: "2 à 3 h avant l'effort : des glucides (pâtes, riz, pain, fruits) + un peu de protéines (œuf, poulet, légumineuses). Ni le ventre vide, ni un repas trop lourd juste avant.",
  },
  {
    emoji: "🔄",
    title: "La fenêtre de récup",
    body: "Dans l'heure ou deux après une grosse séance : des protéines pour réparer le muscle + des glucides pour refaire le plein d'énergie. Un vrai repas fait le job, pas besoin de poudre.",
  },
  {
    emoji: "📈",
    title: "Tu grandis ET tu t'entraînes",
    body: "Entre 13 et 17 ans, tes besoins en énergie sont réellement plus élevés qu'un adulte. Ne te prive pas : repas réguliers et variés (féculents, légumes, protéines, laitages, fruits).",
  },
  {
    emoji: "😴",
    title: "Le sommeil, moitié de la récup",
    body: "8 à 9 h par nuit en période de croissance et d'entraînement, ce n'est pas un luxe. C'est là que le corps répare et que la progression se fixe. Écrans coupés 30 min avant le lit.",
  },
  {
    emoji: "🧂",
    title: "Après avoir beaucoup transpiré",
    body: "De l'eau, et un peu de sel (sodium) pour bien restaurer ce que tu as perdu. Une soupe, un plat un peu salé, ça suffit — inutile d'acheter des boissons spéciales.",
  },
  {
    emoji: "🚫",
    title: "Les compléments avant 18 ans ?",
    body: "Pas nécessaires si tu manges varié — et certains présentent de vrais risques (dosages non contrôlés, substances non déclarées). Un besoin réel, ça se décide avec un médecin, jamais seul.",
  },
  {
    emoji: "🥤",
    title: "Attention aux boissons sucrées",
    body: "Sodas et boissons énergisantes ne sont pas des boissons de sport : trop de sucre, parfois de la caféine à éviter à ton âge. Pour t'hydrater, l'eau reste imbattable.",
  },
];

// Rappel spécifique au jour de match (montré en plus quand un match approche).
export const MATCH_DAY_TIP: NutritionTip = {
  emoji: "⚽",
  title: "Jour de match",
  body: "Dernier vrai repas 3 h avant le coup d'envoi (glucides + un peu de protéines, rien de gras ou de nouveau). Bois régulièrement le matin. À la mi-temps : quelques gorgées d'eau, pas un litre d'un coup.",
};

// Veille de match.
export const PRE_MATCH_TIP: NutritionTip = {
  emoji: "🛏️",
  title: "Veille de match",
  body: "La performance de demain se prépare ce soir : un repas complet en glucides (pâtes, riz), bien s'hydrater dans la journée, et surtout une bonne nuit de sommeil. Pas de nouvel aliment inhabituel.",
};

export function weeklyTip(weekStart: Date): NutritionTip {
  // Index déterministe basé sur le numéro de semaine ISO approximatif.
  const days = Math.floor(weekStart.getTime() / (1000 * 60 * 60 * 24));
  const week = Math.floor(days / 7);
  return WEEKLY_TIPS[week % WEEKLY_TIPS.length];
}

// Retourne le rappel calendaire pertinent selon le jour de match du joueur.
export function matchTip(matchDay: number | null | undefined): NutritionTip | null {
  if (matchDay === null || matchDay === undefined) return null;
  const today = new Date().getDay(); // 0 = dimanche
  if (today === matchDay) return MATCH_DAY_TIP;
  const eve = (matchDay + 6) % 7;
  if (today === eve) return PRE_MATCH_TIP;
  return null;
}
