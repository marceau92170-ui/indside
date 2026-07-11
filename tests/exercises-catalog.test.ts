import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ALL_EXERCISES } from "../lib/data/exercises";
import { ILLUSTRATION_MAP } from "../components/ExerciseIllustration";
import { assertSlugsInCatalog, ProgramSchema } from "../lib/ai/generateProgram";

describe("bibliothèque d'exercices", () => {
  test("contient exactement 60 exercices", () => {
    assert.equal(ALL_EXERCISES.length, 60);
  });

  test("aucun slug dupliqué", () => {
    const slugs = ALL_EXERCISES.map((e) => e.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  test("exactement 10 exercices accessibles en gratuit", () => {
    assert.equal(ALL_EXERCISES.filter((e) => e.isFree).length, 10);
  });

  test("minAge est toujours 13 ou 15 (les deux seuls seuils du produit)", () => {
    for (const e of ALL_EXERCISES) {
      assert.ok(e.minAge === 13 || e.minAge === 15, `${e.slug} a un minAge inattendu : ${e.minAge}`);
    }
  });

  test("chaque exercice a des étapes, une consigne d'erreurs, et une durée positive", () => {
    for (const e of ALL_EXERCISES) {
      assert.ok(e.steps.length >= 2, `${e.slug} a moins de 2 étapes`);
      assert.ok(e.mistakes.length > 10, `${e.slug} a une consigne d'erreurs trop courte`);
      assert.ok(e.durationMin > 0, `${e.slug} a une durée invalide`);
    }
  });

  test("tous les exercices ont une illustration animée mappée explicitement", () => {
    const missing = ALL_EXERCISES.filter((e) => !(e.slug in ILLUSTRATION_MAP));
    assert.deepEqual(missing.map((e) => e.slug), []);
  });
});

describe("garantie catalogue IA (les séances sont vraies)", () => {
  const validSlugs = new Set(ALL_EXERCISES.map((e) => e.slug));

  test("accepte un programme dont tous les slugs sont dans le catalogue", () => {
    const program = ProgramSchema.parse({
      summary: "Semaine de test",
      sessions: [
        {
          day_of_week: 3,
          title: "Séance test",
          duration_min: 30,
          objective: "Objectif test",
          advice: "Conseil test",
          blocks: [
            { slug: "squats", sets: 3, reps: "12 répétitions", rest: "45 s", instruction: "Vas-y" },
            { slug: "planche", sets: 3, reps: "30 s", rest: "30 s", instruction: "Tiens bon" },
            { slug: "toe-taps", sets: 2, reps: "30 s", rest: "20 s", instruction: "Reste léger" },
          ],
        },
        {
          day_of_week: 5,
          title: "Séance test 2",
          duration_min: 30,
          objective: "Objectif test",
          advice: "Conseil test",
          blocks: [
            { slug: "montees-genoux", sets: 2, reps: "20 m", rest: "30 s", instruction: "Reste grand" },
            { slug: "pont-fessier", sets: 3, reps: "12 répétitions", rest: "45 s", instruction: "Serre les fessiers" },
            { slug: "etirements-fin-seance", sets: 1, reps: "5 min", rest: "0 s", instruction: "Souffle" },
          ],
        },
      ],
    });
    assert.doesNotThrow(() => assertSlugsInCatalog(program, validSlugs));
  });

  test("rejette un programme contenant un slug halluciné hors catalogue", () => {
    const program = ProgramSchema.parse({
      summary: "Semaine de test",
      sessions: [
        {
          day_of_week: 3,
          title: "Séance test",
          duration_min: 30,
          objective: "Objectif test",
          advice: "Conseil test",
          blocks: [
            { slug: "squats", sets: 3, reps: "12 répétitions", rest: "45 s", instruction: "Vas-y" },
            { slug: "burpees-extremes-inventes", sets: 3, reps: "10", rest: "30 s", instruction: "..." },
            { slug: "toe-taps", sets: 2, reps: "30 s", rest: "20 s", instruction: "Reste léger" },
          ],
        },
        {
          day_of_week: 5,
          title: "Séance test 2",
          duration_min: 30,
          objective: "Objectif test",
          advice: "Conseil test",
          blocks: [
            { slug: "montees-genoux", sets: 2, reps: "20 m", rest: "30 s", instruction: "Reste grand" },
            { slug: "pont-fessier", sets: 3, reps: "12 répétitions", rest: "45 s", instruction: "Serre les fessiers" },
            { slug: "etirements-fin-seance", sets: 1, reps: "5 min", rest: "0 s", instruction: "Souffle" },
          ],
        },
      ],
    });
    assert.throws(() => assertSlugsInCatalog(program, validSlugs), /Slug hors catalogue/);
  });
});
