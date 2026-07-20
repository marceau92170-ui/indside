import { cache } from "react";
import { currentUser as clerkCurrentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// ---------- Pont Clerk ↔ notre base ----------
//
// L'authentification est gérée par Clerk (Google + email code). Notre base reste
// la source de vérité pour les données app (profil, abonnement, affiliation, rôle).
// À chaque requête, on relie l'utilisateur Clerk connecté à SON utilisateur en base :
//   1) par clerkId (déjà lié) ;
//   2) sinon par email → on relie le compte existant (migration des anciens users) ;
//   3) sinon on crée l'utilisateur.
// Mémorisé le temps d'une requête (cache) : une seule résolution par rendu.

export const currentUser = cache(async () => {
  const clerk = await clerkCurrentUser();
  if (!clerk) return null;

  const email = (
    clerk.emailAddresses.find((e) => e.id === clerk.primaryEmailAddressId)?.emailAddress ??
    clerk.emailAddresses[0]?.emailAddress ??
    ""
  )
    .trim()
    .toLowerCase();
  if (!email) return null;

  const include = { profile: true, subscription: true } as const;

  // 1) déjà lié à Clerk
  const byClerk = await prisma.user.findUnique({ where: { clerkId: clerk.id }, include });
  if (byClerk) return byClerk;

  // 2) compte existant (même email) → on le relie (les 20 comptes NextAuth restent intacts)
  const byEmail = await prisma.user.findUnique({ where: { email }, include });
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: { clerkId: clerk.id },
      include,
    });
  }

  // 3) nouveau : on crée
  return prisma.user.create({
    data: { email, clerkId: clerk.id, name: clerk.firstName ?? null },
    include,
  });
});
