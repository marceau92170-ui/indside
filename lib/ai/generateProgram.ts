import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { Exercise, PlayerProfile } from "@prisma/client";
import {
  ageFromBirthYear,
  categoryFromBirthYear,
  personaFromBirthYear,
} from "@/lib/categories";
import { DAYS_FR, goalLabel, leagueName, positionLabel } from "@/lib/constants";

// ---------- Schéma strict de sortie (validation Zod) ----------

const BlockSchema = z.object({
  slug: z.string(),
  sets: z.number().int().min(1).max(6),
  reps: z.string().min(1), // ex: "12 répétitions" ou "30 s"
  rest: z.string().min(1), // ex: "45 s"
  instruction: z.string().min(1), // consigne personnalisée pour CE joueur
});

const SessionSchema = z.object({
  day_of_week: z.number().int().min(0).max(6), // 0 = dimanche
  title: z.string().min(1),
  duration_min: z.number().int().min(15).max(45),
  objective: z.string().min(1),
  advice: z.string().min(1),
  blocks: z.array(BlockSchema).min(3).max(8),
});

export const ProgramSchema = z.object({
  summary: z.string().min(1),
  sessions: z.array(SessionSchema).min(2).max(4),
});

export type GeneratedProgram = z.infer<typeof ProgramSchema>;

// ---------- Prompt système : préparateur physique jeunes ----------

function buildSystemPrompt(persona: "junior" | "senior"): string {
  const juniorRules = `RÈGLES ABSOLUES POUR CE JOUEUR DE 13-14 ANS (catégorie U14/U15) :
- AUCUNE charge externe, uniquement le poids du corps.
- AUCUNE pliométrie intensive : n'utilise JAMAIS les exercices marqués "15 ans+" (ils sont exclus du catalogue fourni).
- Séances de 25 minutes MAXIMUM.
- Beaucoup de ballon, approche ludique : au moins la moitié des blocs avec ballon quand le matériel le permet.
- Ton des textes : encourageant, simple, motivant, tutoiement. Pas de jargon.
- Focus prioritaire : coordination, technique, motricité, gainage léger.`;

  const seniorRules = `RÈGLES POUR CE JOUEUR DE 15-17 ANS (catégorie U16/U17/U18) :
- Renforcement au poids du corps complet autorisé + pliométrie progressive (volumes modérés : max 3 séries par exercice pliométrique).
- Élastiques uniquement si présents dans son matériel.
- Séances de 30 à 40 minutes, structure pro : échauffement → corps de séance → retour au calme.
- Ton des textes : sérieux et direct, "méthodes de centre de formation", tutoiement, zéro bavardage.
- Focus prioritaire : explosivité, vitesse, force fonctionnelle, technique sous fatigue.`;

  return `Tu es un préparateur physique et technique spécialisé dans la formation des jeunes footballeurs (13-17 ans), avec l'expérience des centres de formation français. Tu construis des programmes hebdomadaires individuels que le joueur réalise SEUL, en complément de ses entraînements club, sans jamais créer de surcharge.

${persona === "junior" ? juniorRules : seniorRules}

RÈGLES DE COMPOSITION (NON NÉGOCIABLES) :
1. Tu ne peux utiliser QUE les exercices du catalogue fourni, identifiés par leur "slug". Tu n'inventes JAMAIS un exercice, un slug, ou une variante hors catalogue.
2. Calendrier : le programme se cale AUTOUR du club. Jamais de séance la veille du match ni le jour du match. Le lendemain de match : uniquement récupération légère (prévention, mobilité, technique douce) si tu places une séance ce jour-là. Évite les jours d'entraînement club pour les séances intenses.
3. Chaque séance suit la structure : 1-2 blocs d'échauffement/activation en premier, corps de séance, et se termine par un bloc calme (prévention, étirements ou technique douce).
4. La charge totale doit rester raisonnable : c'est un complément, pas un deuxième club.
5. "instruction" de chaque bloc = consigne courte PERSONNALISÉE pour ce joueur précis (son poste, son point faible, son objectif). Pas une redite de la description de l'exercice.
6. Vocabulaire : tutoiement, direct, concret. Style vestiaire sans caricature.
7. Prends en compte le point faible déclaré par le joueur : au moins un bloc par semaine doit l'attaquer frontalement.
8. Si le joueur est gardien, la majorité des blocs techniques viennent de la catégorie "gardien".
9. Si une gêne ou douleur non résolue est signalée (section DOULEURS SIGNALÉES ci-dessous si présente), évite tout exercice sollicitant directement cette zone cette semaine ; privilégie à la place des exercices de la catégorie "prevention" ciblant la zone concernée (mobilité douce, renforcement léger), jamais d'explosivité ni de charge dessus.

FORMAT DE SORTIE : uniquement du JSON valide, sans texte autour, sans balises markdown, respectant exactement ce schéma :
{
  "summary": "résumé du programme en 1-2 phrases adressées au joueur",
  "sessions": [
    {
      "day_of_week": 0-6 (0 = dimanche, 1 = lundi, ..., 6 = samedi),
      "title": "titre court de la séance",
      "duration_min": nombre,
      "objective": "objectif de la séance en une phrase",
      "advice": "conseil du jour personnalisé (hydratation, sommeil, mental, nutrition simple...)",
      "blocks": [
        { "slug": "slug-du-catalogue", "sets": nombre, "reps": "texte", "rest": "texte", "instruction": "consigne personnalisée" }
      ]
    }
  ]
}`;
}

// ---------- Catalogue compact envoyé au modèle ----------

function catalogFor(profile: PlayerProfile, exercises: Exercise[]): Exercise[] {
  const age = ageFromBirthYear(profile.birthYear);
  const equipment = new Set(profile.equipment);
  // le mur est quasi universel ; "aucun" toujours dispo
  return exercises.filter((ex) => {
    if (ex.minAge > age) return false;
    if (profile.position !== "GB" && ex.category === "gardien") return false;
    const ok = ex.equipment.every(
      (e) => e === "aucun" || equipment.has(e) || (e === "mur" && equipment.has("city"))
    );
    return ok;
  });
}

function catalogText(exercises: Exercise[]): string {
  return exercises
    .map(
      (ex) =>
        `- ${ex.slug} | ${ex.name} | cat: ${ex.category} | ~${ex.durationMin} min | matériel: ${ex.equipment.join(
          "+"
        )}${ex.positions.length ? ` | postes: ${ex.positions.join(",")}` : ""}${
          ex.minAge >= 15 ? " | 15 ans+" : ""
        }`
    )
    .join("\n");
}

// ---------- Message utilisateur : profil + contraintes + historique ----------

export type WeekFeedback = {
  sessionTitle: string;
  status: string;
  difficulty: number | null;
}[];

function buildUserMessage(
  profile: PlayerProfile,
  exercises: Exercise[],
  feedback?: WeekFeedback,
  injuryNotes?: string[]
): string {
  const category = categoryFromBirthYear(profile.birthYear);
  const age = ageFromBirthYear(profile.birthYear);

  const parts = [
    `PROFIL DU JOUEUR :
- Prénom : ${profile.firstName}
- Âge : ${age} ans (catégorie ${category})
- Poste : ${positionLabel(profile.position)}
- Niveau : ${profile.division} (${profile.levelType.toLowerCase()}), ligue ${leagueName(profile.region)}${profile.district ? `, district ${profile.district}` : ""}
- Gabarit : ${profile.heightCm} cm / ${profile.weightKg} kg
- Rythme club : ${profile.clubTrainingsPerWeek} entraînement(s) club par semaine${
      profile.matchDay !== null && profile.matchDay !== undefined
        ? `, match le ${DAYS_FR[profile.matchDay].toLowerCase()}`
        : ", pas de match régulier"
    }
- Matériel disponible : ${profile.equipment.length ? profile.equipment.join(", ") : "aucun"}
- Objectif principal : ${goalLabel(profile.goal)}
- Point faible déclaré : ${profile.weakness || "non précisé"}`,
  ];

  if (feedback && feedback.length > 0) {
    const lines = feedback
      .map(
        (f) =>
          `- "${f.sessionTitle}" : ${f.status === "done" ? "faite" : "sautée"}${
            f.difficulty ? `, difficulté ressentie ${f.difficulty}/5` : ""
          }`
      )
      .join("\n");
    parts.push(`BILAN DE LA SEMAINE PASSÉE (adapte la charge en conséquence — si tout était trop dur (4-5/5), allège ; si tout était facile (1-2/5), progresse ; si des séances ont été sautées, simplifie la logistique) :
${lines}`);
  }

  if (injuryNotes && injuryNotes.length > 0) {
    parts.push(`DOULEURS SIGNALÉES (non résolues, via le carnet de santé du joueur) — n'aggrave jamais ces zones :
${injuryNotes.map((n) => `- ${n}`).join("\n")}`);
  }

  parts.push(`CATALOGUE D'EXERCICES AUTORISÉS (les seuls utilisables, par slug) :
${catalogText(exercises)}`);

  parts.push(
    `Génère le programme de la semaine : ${
      personaFromBirthYear(profile.birthYear) === "junior" ? "2 à 3" : "3"
    } séances individuelles calées autour du club. Réponds UNIQUEMENT avec le JSON.`
  );

  return parts.join("\n\n");
}

// ---------- Appel API + validation ----------

function extractJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Pas de JSON dans la réponse");
  return JSON.parse(cleaned.slice(start, end + 1));
}

// Garantie "les séances sont vraies" : tout slug hors catalogue = rejet.
// Extrait en fonction pure pour être testable sans appel réseau.
export function assertSlugsInCatalog(program: GeneratedProgram, validSlugs: Set<string>): void {
  for (const session of program.sessions) {
    for (const block of session.blocks) {
      if (!validSlugs.has(block.slug)) {
        throw new Error(`Slug hors catalogue : ${block.slug}`);
      }
    }
  }
}

export async function generateProgramWithAI(
  profile: PlayerProfile,
  allExercises: Exercise[],
  feedback?: WeekFeedback,
  injuryNotes?: string[]
): Promise<GeneratedProgram> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY manquant");
  }

  const client = new Anthropic();
  const catalog = catalogFor(profile, allExercises);
  const validSlugs = new Set(catalog.map((e) => e.slug));
  const persona = personaFromBirthYear(profile.birthYear);
  const system = buildSystemPrompt(persona);
  const userMessage = buildUserMessage(profile, catalog, feedback, injuryNotes);

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await client.messages.create({
        model: "claude-sonnet-5",
        max_tokens: 6000,
        // Tâche structurée (JSON) : pas besoin de « réflexion » — désactivée pour
        // une génération rapide (quelques secondes au lieu de ~30 s).
        thinking: { type: "disabled" },
        system,
        messages: [
          {
            role: "user",
            content:
              attempt === 0
                ? userMessage
                : `${userMessage}\n\nATTENTION : ta réponse précédente était invalide (${String(
                    lastError
                  ).slice(0, 300)}). Corrige et renvoie UNIQUEMENT le JSON valide.`,
          },
        ],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") throw new Error("Réponse vide");

      const parsed = ProgramSchema.parse(extractJson(textBlock.text));
      assertSlugsInCatalog(parsed, validSlugs);
      return parsed;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
