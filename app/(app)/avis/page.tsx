import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReviewForm } from "@/components/ReviewForm";

export const dynamic = "force-dynamic";

export default async function AvisPage() {
  const user = await currentUser();
  if (!user) return null;

  const existing = await prisma.review.findUnique({ where: { userId: user.id } });

  return (
    <div>
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Ton avis</h1>
      <p className="mb-5 text-sm text-muted">
        Tu utilises Progressa ? Dis honnêtement ce que tu en penses — même les critiques nous
        aident. Les meilleurs avis aident les prochains joueurs à se lancer.
      </p>

      <ReviewForm
        existing={
          existing ? { rating: existing.rating, text: existing.text, status: existing.status } : null
        }
      />
    </div>
  );
}
