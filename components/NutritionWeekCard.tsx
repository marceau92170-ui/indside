import Link from "next/link";
import type { NutritionTip } from "@/lib/data/nutrition";
import { Icon } from "@/components/Icon";

// Carte "Nutrition de la semaine" — Premium.
// Pour les gratuits : aperçu flouté + incitation à passer Premium.
export function NutritionWeekCard({
  premium,
  weekly,
  match,
}: {
  premium: boolean;
  weekly: NutritionTip;
  match: NutritionTip | null;
}) {
  if (!premium) {
    return (
      <div className="relative overflow-hidden rounded-card border border-line bg-surface p-4">
        <div className="pointer-events-none select-none blur-[3px]">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
            Nutrition de la semaine
          </p>
          <p className="mt-1 font-condensed text-lg font-bold">{weekly.title}</p>
          <p className="mt-1 text-sm text-muted line-clamp-2">{weekly.body}</p>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-night/40 text-center">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <Icon name="lock" className="h-4 w-4" /> Conseils nutrition inclus dans Premium
          </p>
          <Link
            href="/premium"
            className="rounded-full bg-glow px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white"
          >
            Débloquer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {match && (
        <div className="rounded-card border border-glow bg-glow/10 p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-glow">
            Rappel nutrition
          </p>
          <p className="mt-1 font-condensed text-lg font-bold">{match.title}</p>
          <p className="mt-1 text-sm text-muted">{match.body}</p>
        </div>
      )}
      <div className="rounded-card border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
            Nutrition de la semaine
          </p>
          <Link href="/ressources/nutrition" className="text-[11px] text-muted underline">
            tout voir
          </Link>
        </div>
        <p className="mt-1 font-condensed text-lg font-bold">{weekly.title}</p>
        <p className="mt-1 text-sm text-muted">{weekly.body}</p>
      </div>
    </div>
  );
}
