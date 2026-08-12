import { ButtonLink } from "@/components/ui";
import { GenerateProgramButton } from "@/components/GenerateProgramButton";
import { Icon } from "@/components/Icon";
import { TrackOnView } from "@/components/TrackOnView";

export const dynamic = "force-dynamic";

export default async function MerciPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <TrackOnView event="premium_checkout_completed" properties={{ plan: plan ?? null }} />
      <div className="glow-flash mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-glow text-white">
        <Icon name="check" className="h-11 w-11" strokeWidth={2.4} />
      </div>
      <h1 className="mb-2 font-condensed text-3xl font-bold uppercase">Bienvenue chez les Premium</h1>
      <p className="mb-2 max-w-sm text-sm text-muted">
        Tout est débloqué (l&apos;activation prend parfois quelques secondes). Génère ton programme
        complet et attaque dès maintenant.
      </p>
      <p className="mb-6 max-w-sm text-xs text-muted">
        Résiliable à tout moment, en 1 clic, depuis Réglages.
      </p>
      <GenerateProgramButton label="Générer mon programme complet" />
      <ButtonLink href="/semaine" variant="ghost" size="sm" className="mt-4">
        Voir ma semaine
      </ButtonLink>
    </div>
  );
}
