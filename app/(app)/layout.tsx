import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { AppNav } from "@/components/AppNav";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/connexion");

  // Attribution "premier lien gagne" : si le joueur n'a pas encore d'affilié et
  // qu'un cookie de parrainage valide existe, on le grave une fois pour toutes.
  if (!user.referredByCode) {
    const ref = (await cookies()).get("ref_code")?.value;
    if (ref) {
      const affiliate = await prisma.affiliate.findUnique({ where: { code: ref } });
      if (affiliate && affiliate.email.toLowerCase() !== user.email.toLowerCase()) {
        await prisma.user.update({
          where: { id: user.id },
          data: { referredByCode: affiliate.code },
        });
      }
    }
  }

  if (!user.profile) redirect("/onboarding");

  const isAffiliate = user.role === "affiliate" || user.role === "admin";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col">
      <header className="flex items-center justify-between px-4 pb-2 pt-4">
        <Link href="/semaine" className="font-display text-xl tracking-wider text-chalk">
          PROGRESSA
        </Link>
        <div className="flex items-center gap-2">
          {user.role === "admin" && (
            <Link
              href="/admin/affiliation"
              className="rounded-full border border-glow/40 px-3 py-1 text-xs font-semibold text-glow hover:bg-glow hover:text-night"
            >
              Admin
            </Link>
          )}
          {user.role === "affiliate" && (
            <Link
              href="/partenaire"
              className="rounded-full border border-glow/40 px-3 py-1 text-xs font-semibold text-glow hover:bg-glow hover:text-night"
            >
              Partenaire
            </Link>
          )}
          <Link
            href="/premium"
            className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted hover:border-glow hover:text-glow"
          >
            {user.plan === "premium" || user.subscription?.status === "active" ? "Premium ✓" : "Passer Premium"}
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 pb-24 pt-2">{children}</main>

      <FeedbackWidget />

      <AppNav />
    </div>
  );
}
