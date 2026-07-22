import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "En attente", cls: "text-glow border-glow/40" },
  approved: { label: "Publié", cls: "text-green-400 border-green-400/40" },
  rejected: { label: "Refusé", cls: "text-muted border-line" },
};

// Modération des avis. Réservé à l'admin : /admin/avis
export default async function AdminReviewsPage() {
  const me = await currentUser();
  if (me?.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted">
        Non autorisé.
      </main>
    );
  }

  const reviews = await prisma.review.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }] });
  const pending = reviews.filter((r) => r.status === "pending");
  const others = reviews.filter((r) => r.status !== "pending");

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Avis — Modération</h1>
          <p className="text-sm text-muted">
            {pending.length} en attente · {reviews.filter((r) => r.status === "approved").length} publiés
          </p>
        </div>
        <Link
          href="/admin/affiliation"
          className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:border-glow hover:text-glow"
        >
          Affiliation
        </Link>
      </div>

      {reviews.length === 0 && (
        <p className="text-sm text-muted">Aucun avis pour le moment.</p>
      )}

      {pending.length > 0 && (
        <>
          <h2 className="mb-3 font-condensed text-xl font-bold uppercase">À valider</h2>
          <div className="mb-8 space-y-3">
            {pending.map((r) => (
              <ReviewCard key={r.id} r={r} />
            ))}
          </div>
        </>
      )}

      {others.length > 0 && (
        <>
          <h2 className="mb-3 font-condensed text-xl font-bold uppercase text-muted">Traités</h2>
          <div className="space-y-3">
            {others.map((r) => (
              <ReviewCard key={r.id} r={r} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function ReviewCard({
  r,
}: {
  r: { id: string; rating: number; text: string; displayName: string; meta: string; status: string };
}) {
  const st = STATUS[r.status] ?? STATUS.pending;
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-glow" aria-label={`${r.rating} sur 5`}>
          {"★".repeat(r.rating)}
          <span className="text-line">{"★".repeat(5 - r.rating)}</span>
        </span>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${st.cls}`}>
          {st.label}
        </span>
      </div>
      <blockquote className="text-sm text-chalk">« {r.text} »</blockquote>
      <p className="mt-2 text-xs text-muted">
        <span className="font-semibold text-chalk">{r.displayName}</span> · {r.meta}
      </p>

      <div className="mt-3 flex gap-2">
        {r.status !== "approved" && (
          <form action="/api/admin/reviews" method="post">
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="action" value="approve" />
            <button
              type="submit"
              className="rounded-full bg-glow px-3 py-1 text-[11px] font-bold uppercase text-white"
            >
              Publier
            </button>
          </form>
        )}
        {r.status !== "rejected" && (
          <form action="/api/admin/reviews" method="post">
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="action" value="reject" />
            <button
              type="submit"
              className="rounded-full border border-line px-3 py-1 text-[11px] font-bold uppercase text-muted hover:border-glow hover:text-glow"
            >
              Refuser
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
