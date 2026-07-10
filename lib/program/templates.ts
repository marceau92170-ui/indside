import type { Exercise, PlayerProfile } from "@prisma/client";
import type { GeneratedProgram } from "@/lib/ai/generateProgram";
import { ageFromBirthYear, personaFromBirthYear } from "@/lib/categories";

// Programmes "template" déterministes, composés depuis la bibliothèque :
// - la séance générique hebdo du plan GRATUIT ;
// - le fallback si l'API Anthropic est indisponible.

function pick(exercises: Exercise[], slugs: string[]): Exercise[] {
  const bySlug = new Map(exercises.map((e) => [e.slug, e]));
  return slugs.map((s) => bySlug.get(s)).filter((e): e is Exercise => Boolean(e));
}

function freeDays(profile: PlayerProfile): number[] {
  // Jours à éviter : match, veille de match. On propose mercredi/jeudi/samedi/dimanche par défaut.
  const banned = new Set<number>();
  if (profile.matchDay !== null && profile.matchDay !== undefined) {
    banned.add(profile.matchDay);
    banned.add((profile.matchDay + 6) % 7); // veille
  }
  const preferred = [3, 4, 6, 0, 2, 5, 1]; // mercredi, jeudi, samedi, dimanche…
  return preferred.filter((d) => !banned.has(d));
}

function block(ex: Exercise, sets: number, reps: string, rest: string, instruction: string) {
  return { slug: ex.slug, sets, reps, rest, instruction };
}

// Séance générique du plan gratuit : technique + physique de base, tous postes, tous âges.
export function buildFreeSession(profile: PlayerProfile, exercises: Exercise[]): GeneratedProgram {
  const persona = personaFromBirthYear(profile.birthYear);
  const day = freeDays(profile)[0] ?? 3;
  const isGK = profile.position === "GB";

  const slugs = isGK
    ? ["montees-genoux", "deplacements-lateraux-gardien", "prises-de-balle-mur", "planche", "equilibre-unipodal"]
    : ["montees-genoux", "toe-taps", "passes-mur-deux-touches", "squats", "planche", "equilibre-unipodal"];

  const exos = pick(exercises, slugs);
  const blocks = exos.map((ex, i) => {
    if (ex.slug === "montees-genoux")
      return block(ex, 2, "20 m", "30 s", "Échauffement : reste grand, appuis dynamiques.");
    if (ex.slug === "toe-taps")
      return block(ex, 3, "30 s", "30 s", "Accélère seulement quand le contact reste propre.");
    if (ex.slug === "passes-mur-deux-touches")
      return block(ex, 2, "25 passes", "45 s", "Alterne les pieds à chaque passe : ton pied faible compte double.");
    if (ex.slug === "squats")
      return block(ex, 3, persona === "junior" ? "10 répétitions" : "15 répétitions", "45 s", "Technique parfaite avant tout : talons au sol, dos droit.");
    if (ex.slug === "planche")
      return block(ex, 3, persona === "junior" ? "20 s" : "40 s", "30 s", "Arrête la série dès que l'alignement casse.");
    if (ex.slug === "deplacements-lateraux-gardien")
      return block(ex, 3, "6 allers-retours", "45 s", "Reste bas du début à la fin, ne croise jamais les pieds.");
    if (ex.slug === "prises-de-balle-mur")
      return block(ex, 2, "20 prises", "45 s", "Mains en W, coudes souples : zéro rebond.");
    return block(ex, 2, "30 s par jambe", "20 s", `Retour au calme, bloc ${i + 1}.`);
  });

  return {
    summary:
      "Ta séance de la semaine : les fondamentaux, à faire une fois cette semaine. Passe Premium pour un vrai programme complet calé sur ton poste et ton calendrier.",
    sessions: [
      {
        day_of_week: day,
        title: "Fondamentaux de la semaine",
        duration_min: persona === "junior" ? 25 : 30,
        objective: "Entretenir la base : toucher de balle, force et équilibre.",
        advice: "Bois de l'eau avant, pendant et après. Une séance bien faite vaut mieux que trois bâclées.",
        blocks,
      },
    ],
  };
}

// Fallback premium si l'IA est indisponible : 3 séances solides adaptées âge/poste/matériel.
export function buildFallbackProgram(
  profile: PlayerProfile,
  exercises: Exercise[]
): GeneratedProgram {
  const persona = personaFromBirthYear(profile.birthYear);
  const age = ageFromBirthYear(profile.birthYear);
  const days = freeDays(profile);
  const isGK = profile.position === "GB";
  const junior = persona === "junior";

  const allowed = exercises.filter((e) => e.minAge <= age);

  const techSlugs = isGK
    ? ["deplacements-lateraux-gardien", "jeu-au-pied-mur", "prises-de-balle-mur", "reflexes-balle-mur", "etirements-fin-seance"]
    : ["toe-taps", "foundations", "conduite-en-huit", "passes-mur-deux-touches", "controle-oriente-mur", "etirements-fin-seance"];

  const forceSlugs = ["montees-genoux", "squats", "fentes-avant", "pont-fessier", "planche", "planche-laterale", "mobilite-hanches"];

  const speedSlugs = junior
    ? ["gammes-athletiques", "appuis-rapides", "departs-varies", "sprints-courts", "equilibre-unipodal"]
    : ["gammes-athletiques", "squat-jumps", "skater-jumps", "sprints-courts", "etirements-fin-seance"];

  const mkBlocks = (slugs: string[], defaultInstr: string) =>
    pick(allowed, slugs).map((ex) =>
      block(
        ex,
        ex.category === "explosivite" ? 3 : 2,
        ex.category === "renforcement"
          ? junior
            ? "10 répétitions"
            : "12-15 répétitions"
          : ex.category === "explosivite"
            ? "5-6 répétitions"
            : "45 s",
        "45 s",
        defaultInstr
      )
    );

  const sessions: GeneratedProgram["sessions"] = [
    {
      day_of_week: days[0] ?? 3,
      title: isGK ? "Séance gardien : mains et appuis" : "Séance technique",
      duration_min: junior ? 25 : 35,
      objective: "La qualité de ton premier contact et de tes appuis.",
      advice: "Filme un exercice de temps en temps : tu verras ce que tu ne sens pas.",
      blocks: mkBlocks(techSlugs, `Applique-toi sur ton point faible : ${profile.weakness || "la régularité du geste"}.`),
    },
    {
      day_of_week: days[1] ?? 4,
      title: "Séance force fonctionnelle",
      duration_min: junior ? 25 : 35,
      objective: "Un corps solide pour les duels et les sprints.",
      advice: "Le sommeil, c'est 50 % de la progression : vise 8-9 h cette nuit.",
      blocks: mkBlocks(forceSlugs, "Contrôle chaque descente : c'est là que tu deviens fort."),
    },
    {
      day_of_week: days[2] ?? 6,
      title: junior ? "Séance vitesse & coordination" : "Séance explosivité",
      duration_min: junior ? 25 : 35,
      objective: "Gagner tes premiers mètres : la vitesse se travaille frais.",
      advice: "Échauffement sérieux obligatoire avant tout travail de vitesse.",
      blocks: mkBlocks(speedSlugs, "Chaque répétition à fond, récupération complète entre les séries."),
    },
  ];

  return {
    summary:
      "Programme de la semaine calé autour de ton club : technique, force, vitesse. Trois séances, jamais la veille de match.",
    sessions: sessions.filter((s) => s.blocks.length >= 3),
  };
}
