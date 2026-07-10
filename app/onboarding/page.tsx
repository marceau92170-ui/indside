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
  if (!user) redirect("/connexion");
  if (user.profile && edit !== "1") redirect("/semaine");

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-4 py-6">
      <OnboardingWizard birthYears={eligibleBirthYears()} />
    </main>
  );
}
