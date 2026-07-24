import { leagueName, countryName } from "@/lib/constants";

export function divisionLabel(p: {
  levelType: string;
  division: string;
  region: string;
  district?: string | null;
  country?: string | null;
}): string {
  // Hors France : niveau générique + ville/région (ou nom du pays).
  if (p.levelType === "GENERIC" || (p.country && p.country !== "FR")) {
    const place = p.district?.trim() || countryName(p.country ?? p.region);
    return place ? `${p.division} — ${place}` : p.division;
  }
  // France (système FFF, inchangé).
  if (p.levelType === "NATIONAL") return p.division;
  if (p.levelType === "REGIONAL") return `${p.division} — Ligue ${leagueName(p.region)}`;
  return `${p.division} — ${p.district ? `District ${p.district}` : leagueName(p.region)}`;
}
