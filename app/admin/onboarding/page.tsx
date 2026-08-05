import Link from "next/link";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { OnboardingFunnelSection } from "@/components/admin/OnboardingFunnelSection";

export const dynamic = "force-dynamic";

// Vue seule (voir aussi /admin pour tout sur un seul lien).
// Accès : /admin/onboarding?secret=ADMIN_SECRET
export default async function AdminOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string }>;
}) {
  const { secret } = await searchParams;
  if (!isAdminAuthorized(secret)) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted">
        Non autorisé.
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 text-chalk">
      <Link href={`/admin?secret=${secret}`} className="mb-4 inline-block text-xs text-muted hover:text-glow">
        ← Tout le tableau de bord
      </Link>
      <OnboardingFunnelSection />
    </main>
  );
}
