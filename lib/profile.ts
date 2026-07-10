import { leagueName } from "@/lib/constants";

export function divisionLabel(p: {
  levelType: string;
  division: string;
  region: string;
  district?: string | null;
}): string {
  if (p.levelType === "NATIONAL") return p.division;
  if (p.levelType === "REGIONAL") return `${p.division} — Ligue ${leagueName(p.region)}`;
  return `${p.division} — ${p.district ? `District ${p.district}` : leagueName(p.region)}`;
}
