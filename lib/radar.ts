import { prisma } from "@/lib/prisma";

// Radar "toile d'araignée" du joueur : chaque famille d'exercice est une branche.
// Chaque exercice fait DANS une séance validée nourrit sa branche → le profil se
// dessine avec le temps (façon attributs FIFA).

export type RadarAxis = { key: string; label: string; value: number }; // value 0..100

// 5 branches (le gardien est à part, non affiché ici).
export const AXES: { key: string; label: string }[] = [
  { key: "technique", label: "Technique" },
  { key: "renforcement", label: "Physique" },
  { key: "explosivite", label: "Explosivité" },
  { key: "cardio", label: "Endurance" },
  { key: "prevention", label: "Prévention" },
];

// Nombre d'exercices dans une catégorie pour "maxer" une branche (100). Réglable.
// Volontairement élevé : avec un rythme régulier, une branche se remplissait en
// ~2 semaines (bien avant même le 1er changement de palier), donnant l'impression
// que la toile ne bouge qu'aux promotions. Calé pour progresser sur toute la
// montée des paliers (jusqu'à Élite), pas seulement les premières semaines.
const TARGET = 90;

type Block = { slug?: string };

export async function categoryRadar(userId: string): Promise<RadarAxis[]> {
  const logs = await prisma.sessionLog.findMany({
    where: { userId, status: "done" },
    select: { sessionId: true },
  });
  const ids = [...new Set(logs.map((l) => l.sessionId))];

  const counts: Record<string, number> = {};
  if (ids.length) {
    const sessions = await prisma.trainingSession.findMany({
      where: { id: { in: ids } },
      select: { blocks: true },
    });
    const slugs = new Set<string>();
    const perSession: string[][] = [];
    for (const s of sessions) {
      const blocks = Array.isArray(s.blocks) ? (s.blocks as Block[]) : [];
      const ss = blocks.map((b) => b?.slug).filter((x): x is string => Boolean(x));
      perSession.push(ss);
      ss.forEach((x) => slugs.add(x));
    }
    if (slugs.size) {
      const exos = await prisma.exercise.findMany({
        where: { slug: { in: [...slugs] } },
        select: { slug: true, category: true },
      });
      const cat = new Map(exos.map((e) => [e.slug, e.category]));
      for (const ss of perSession)
        for (const slug of ss) {
          const c = cat.get(slug);
          if (c) counts[c] = (counts[c] ?? 0) + 1;
        }
    }
  }

  return AXES.map((a) => ({
    key: a.key,
    label: a.label,
    // plancher à 6 pour que la toile ait toujours une forme visible.
    value: Math.max(6, Math.min(100, Math.round((100 * (counts[a.key] ?? 0)) / TARGET))),
  }));
}
