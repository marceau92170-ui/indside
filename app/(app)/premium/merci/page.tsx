import { ButtonLink } from "@/components/ui";
import { GenerateProgramButton } from "@/components/GenerateProgramButton";

export const dynamic = "force-dynamic";

export default function MerciPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="glow-flash mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-glow text-4xl">
        🔥
      </div>
      <h1 className="mb-2 font-condensed text-3xl font-bold uppercase">Bienvenue en Premium</h1>
      <p className="mb-6 max-w-sm text-sm text-muted">
        Ton paiement est confirmé (l&apos;activation prend parfois quelques secondes). Génère ton
        programme complet dès maintenant.
      </p>
      <GenerateProgramButton label="Générer mon programme complet" />
      <ButtonLink href="/semaine" variant="ghost" size="sm" className="mt-4">
        Voir ma semaine
      </ButtonLink>
    </div>
  );
}
