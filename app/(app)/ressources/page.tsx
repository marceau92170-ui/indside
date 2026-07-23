import Link from "next/link";
import { Card } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icon";

export const dynamic = "force-dynamic";

const ARTICLES: { slug: string; icon: IconName; title: string; desc: string }[] = [
  {
    slug: "filiere-pro",
    icon: "trendingUp",
    title: "Le vrai chemin vers le pro",
    desc: "Comment fonctionne la détection en France, les âges clés, ce qui compte vraiment.",
  },
  {
    slug: "nutrition",
    icon: "health",
    title: "Nutrition & hydratation",
    desc: "Ce qu'il faut manger et boire avant, pendant, après — sans complément inutile.",
  },
  {
    slug: "mental",
    icon: "target",
    title: "Préparation mentale",
    desc: "Gérer la pression, rester concentré, transformer l'échec en information.",
  },
];

export default function RessourcesPage() {
  return (
    <div>
      <Link href="/profil" className="mb-3 inline-block text-sm text-muted underline">
        ← Retour au profil
      </Link>
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Ressources</h1>
      <p className="mb-5 text-sm text-muted">
        Ce que les séances ne suffisent pas à couvrir : la filière, le corps, la tête.
      </p>
      <ul className="space-y-3">
        {ARTICLES.map((a) => (
          <li key={a.slug}>
            <Link href={`/ressources/${a.slug}`}>
              <Card className="flex items-start gap-3 transition-colors hover:border-glow/60">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-night text-glow">
                  <Icon name={a.icon} className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-condensed text-xl font-bold leading-tight">{a.title}</p>
                  <p className="mt-1 text-sm text-muted">{a.desc}</p>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
