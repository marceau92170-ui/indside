import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { eligibleBirthYears } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const user = await currentUser();
  // Accessible SANS compte : on répond aux questions d'abord, on crée le compte
  // à la fin pour sauvegarder (bien meilleure conversion). Un joueur déjà inscrit
  // (avec profil) est renvoyé sur sa semaine, sauf s'il vient modifier son profil.
  if (user?.profile && edit !== "1") redirect("/semaine");

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-4 py-6">
      <OnboardingWizard birthYears={eligibleBirthYears()} authed={Boolean(user)} />
    </main>
  );
}
