import Link from "next/link";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { LiveSection } from "@/components/admin/LiveSection";

export const dynamic = "force-dynamic";

// Vue seule (voir aussi /admin pour tout sur un seul lien).
// Accès : /admin/live?secret=ADMIN_SECRET
export default async function AdminLivePage({
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
      <LiveSection />
    </main>
  );
}
