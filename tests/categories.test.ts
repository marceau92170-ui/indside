import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  categoryFromBirthYear,
  ageFromBirthYear,
  personaFromBirthYear,
  eligibleBirthYears,
  isEligibleBirthYear,
  isAdult,
  mondayOfWeek,
  nextMonday,
} from "../lib/categories";

// Date de référence fixe pour des tests déterministes.
// 11 juillet 2026 → la nouvelle saison (2026-27) a déjà démarré (bascule au 1er juillet).
const REF = new Date("2026-07-11T12:00:00Z");
const BEFORE_JULY = new Date("2026-05-01T12:00:00Z"); // encore saison 2025-26

describe("categories", () => {
  test("categoryFromBirthYear : saison déjà basculée après le 1er juillet", () => {
    assert.equal(categoryFromBirthYear(2010, REF), "U17");
  });

  test("categoryFromBirthYear : avant le 1er juillet, saison précédente", () => {
    assert.equal(categoryFromBirthYear(2010, BEFORE_JULY), "U16");
  });

  test("ageFromBirthYear", () => {
    assert.equal(ageFromBirthYear(2010, REF), 16);
    assert.equal(ageFromBirthYear(2013, REF), 13);
  });

  test("personaFromBirthYear : junior avant 15 ans, senior à partir de 15", () => {
    assert.equal(personaFromBirthYear(2013, REF), "junior"); // 13 ans
    assert.equal(personaFromBirthYear(2012, REF), "junior"); // 14 ans
    assert.equal(personaFromBirthYear(2011, REF), "senior"); // 15 ans
    assert.equal(personaFromBirthYear(2009, REF), "senior"); // 17 ans
  });

  test("eligibleBirthYears couvre U14 à U18 pour la saison en cours", () => {
    const years = eligibleBirthYears(REF);
    assert.equal(years.length, 5);
    assert.deepEqual(years, [2013, 2012, 2011, 2010, 2009]);
  });

  test("isEligibleBirthYear accepte les jeunes U14-U18 ET les adultes 18+", () => {
    // jeunes ciblés
    assert.equal(isEligibleBirthYear(2010, REF), true); // U17
    assert.equal(isEligibleBirthYear(2013, REF), true); // U14
    // adulte (option « 18 ans et + ») — c'était le bug : refusé côté serveur
    assert.equal(isEligibleBirthYear(2006, REF), true); // 20 ans
    assert.equal(isEligibleBirthYear(2008, REF), true); // 18 ans
    assert.equal(isEligibleBirthYear(1996, REF), true); // 30 ans
    // hors cible : trop jeune (moins de 13 ans) ou absurde
    assert.equal(isEligibleBirthYear(2015, REF), false); // 11 ans
    assert.equal(isEligibleBirthYear(1950, REF), false); // 76 ans
  });

  test("isAdult : vrai à partir de 18 ans", () => {
    assert.equal(isAdult(2006, REF), true); // 20 ans
    assert.equal(isAdult(2009, REF), false); // 17 ans
  });

  test("mondayOfWeek renvoie bien un lundi", () => {
    const monday = mondayOfWeek(REF);
    assert.equal(monday.getUTCDay(), 1);
  });

  test("nextMonday est 7 jours après mondayOfWeek", () => {
    const monday = mondayOfWeek(REF);
    const next = nextMonday(REF);
    const diffDays = (next.getTime() - monday.getTime()) / 86400000;
    assert.equal(diffDays, 7);
  });
});
