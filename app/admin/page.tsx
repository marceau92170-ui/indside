import { isAdminAuthorized } from "@/lib/admin-auth";
import { LiveSection } from "@/components/admin/LiveSection";
import { StatsSection } from "@/components/admin/StatsSection";
import { UsageSection } from "@/components/admin/UsageSection";
import { OnboardingFunnelSection } from "@/components/admin/OnboardingFunnelSection";

export const dynamic = "force-dynamic";

// Tout sur un seul lien : en direct, vue d'ensemble, usage des pages/boutons,
// funnel onboarding — pour ne plus avoir à naviguer entre 4 pages différentes.
// Accès : /admin?secret=ADMIN_SECRET
export default async function AdminPage({
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
    <main className="mx-auto max-w-3xl px-4 py-8 text-chalk">
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Tableau de bord</h1>
      <p className="mb-4 text-sm text-muted">Tout sur un seul lien — garde-le en favori.</p>

      <nav className="mb-8 flex flex-wrap gap-x-4 gap-y-1 border-y border-line py-2 text-xs font-semibold uppercase tracking-wide">
        <a href="#direct" className="text-glow hover:underline">En direct</a>
        <a href="#vue-ensemble" className="text-glow hover:underline">Vue d&apos;ensemble</a>
        <a href="#usage" className="text-glow hover:underline">Usage</a>
        <a href="#onboarding" className="text-glow hover:underline">Onboarding</a>
      </nav>

      <section id="direct" className="mb-12 scroll-mt-4">
        <LiveSection />
      </section>

      <section id="vue-ensemble" className="mb-12 scroll-mt-4">
        <StatsSection />
      </section>

      <section id="usage" className="mb-12 scroll-mt-4">
        <UsageSection />
      </section>

      <section id="onboarding" className="scroll-mt-4">
        <OnboardingFunnelSection />
      </section>
    </main>
  );
}
