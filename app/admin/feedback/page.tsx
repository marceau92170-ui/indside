import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Tous les retours utilisateurs, du plus récent au plus ancien. Réservé à l'admin.
export default async function AdminFeedbackPage() {
  const me = await currentUser();
  if (me?.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted">
        Non autorisé.
      </main>
    );
  }

  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-condensed text-3xl font-bold uppercase">Retours utilisateurs</h1>
          <p className="text-sm text-muted">{feedbacks.length} message(s) — le plus récent en premier.</p>
        </div>
        <Link href="/admin/affiliation" className="text-sm text-muted underline">
          ← Affiliation
        </Link>
      </div>

      {feedbacks.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-6 text-center text-sm text-muted">
          Aucun retour pour le moment. La petite bulle 💬 dans l&apos;app permet à chacun d&apos;en
          envoyer.
        </p>
      ) : (
        <ul className="space-y-3">
          {feedbacks.map((f) => (
            <li key={f.id} className="rounded-card border border-line bg-surface p-4">
              <p className="whitespace-pre-wrap text-sm text-chalk">{f.message}</p>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
                <span>
                  {f.createdAt.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {f.email && (
                  <a href={`mailto:${f.email}`} className="text-glow underline">
                    {f.email}
                  </a>
                )}
                {f.page && <span>· {f.page}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
