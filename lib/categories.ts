// Calcul de la catégorie FFF à partir de l'année de naissance.
// Règle : catégorie = U(année de fin de saison - année de naissance).
// La saison N/N+1 démarre le 1er juillet N.

export function seasonEndYear(now = new Date()): number {
  const y = now.getFullYear();
  return now.getMonth() >= 6 ? y + 1 : y; // mois 6 = juillet
}

export function categoryFromBirthYear(birthYear: number, now = new Date()): string {
  const u = seasonEndYear(now) - birthYear;
  // Au-delà des catégories jeunes (U6→U18), on est en Senior (adultes 18+).
  return u > 18 ? "Senior" : `U${u}`;
}

// Année de naissance représentative d'un adulte (18 ans et +), pour l'onboarding.
export function adultBirthYear(now = new Date()): number {
  return now.getFullYear() - 20;
}

export function isAdult(birthYear: number, now = new Date()): boolean {
  return ageFromBirthYear(birthYear, now) >= 18;
}

export function ageFromBirthYear(birthYear: number, now = new Date()): number {
  return now.getFullYear() - birthYear;
}

// Persona produit : "junior" (13-14 ans, U14-U15) ou "senior" (15-17 ans, U16-U18).
// Détermine les interdits (pliométrie, charges) et le ton des textes.
export function personaFromBirthYear(birthYear: number, now = new Date()): "junior" | "senior" {
  return ageFromBirthYear(birthYear, now) < 15 ? "junior" : "senior";
}

// Années de naissance proposées à l'onboarding (cible U14 → U18)
export function eligibleBirthYears(now = new Date()): number[] {
  const end = seasonEndYear(now);
  // U14 à U18 → naissance entre end-18 et end-13
  const years: number[] = [];
  for (let u = 14; u <= 18; u++) years.push(end - u);
  return years.sort((a, b) => b - a);
}

// Lundi de la semaine courante (UTC) — clé des programmes hebdo
export function mondayOfWeek(d = new Date()): Date {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay(); // 0 = dimanche
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}

export function nextMonday(d = new Date()): Date {
  const monday = mondayOfWeek(d);
  monday.setUTCDate(monday.getUTCDate() + 7);
  return monday;
}
