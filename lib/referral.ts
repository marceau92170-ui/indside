import { prisma } from "@/lib/prisma";

// Parrainage entre joueurs : chaque pote qui s'inscrit ET finit son onboarding
// via ton lien → +1 semaine de Premium offerte (cumulable, plafonnée).
export const REFERRAL_REWARD_DAYS = 7;
export const REFERRAL_MAX_DAYS = 56; // plafond anti-abus (8 semaines cumulées max)

const DAY_MS = 24 * 60 * 60 * 1000;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans I/O/0/1 (lisible)

function randomCode(len = 6): string {
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out;
}

// Retourne le code d'invitation du joueur, en le créant à la volée si besoin.
export async function getOrCreateInviteCode(userId: string): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { inviteCode: true },
  });
  if (existing?.inviteCode) return existing.inviteCode;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    try {
      await prisma.user.update({ where: { id: userId }, data: { inviteCode: code } });
      return code;
    } catch {
      // collision (contrainte unique) → on réessaie avec un autre code
    }
  }
  throw new Error("Impossible de générer un code d'invitation");
}

// Verse la récompense au parrain (identifié par son inviteCode). Plafonné.
export async function grantReferralReward(inviterCode: string): Promise<void> {
  const inviter = await prisma.user.findUnique({
    where: { inviteCode: inviterCode },
    select: { id: true, premiumUntil: true },
  });
  if (!inviter) return;

  const now = Date.now();
  const base = inviter.premiumUntil && inviter.premiumUntil.getTime() > now
    ? inviter.premiumUntil.getTime()
    : now;
  const capped = Math.min(base + REFERRAL_REWARD_DAYS * DAY_MS, now + REFERRAL_MAX_DAYS * DAY_MS);

  await prisma.user.update({
    where: { id: inviter.id },
    data: { premiumUntil: new Date(capped) },
  });
}

// Nombre de filleuls d'un joueur (pour l'affichage « X potes rejoints »).
export async function countReferrals(inviteCode: string): Promise<number> {
  if (!inviteCode) return 0;
  return prisma.user.count({ where: { invitedByCode: inviteCode, inviteRewardGranted: true } });
}
