import { prisma } from "@/lib/prisma";

// Parrainage entre joueurs : tous les 3 potes inscrits (onboarding fini) via ton
// lien → +1 semaine de Premium offerte, cumulable jusqu'à 4 semaines.
export const REFERRAL_FRIENDS_PER_WEEK = 3;
export const REFERRAL_REWARD_DAYS = 7;
export const REFERRAL_MAX_WEEKS = 4;
export const REFERRAL_MAX_DAYS = REFERRAL_MAX_WEEKS * REFERRAL_REWARD_DAYS; // 28 j

// Bonus plus fort : un filleul qui S'ABONNE (vrai paiement) rapporte 2 semaines
// au parrain (au lieu d'1 pour une simple inscription). Récompense une seule fois,
// au premier vrai paiement du filleul.
export const PAID_REFERRAL_REWARD_DAYS = 14;

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

// Verse la récompense au parrain (identifié par son inviteCode) UNIQUEMENT quand
// le total de filleuls atteint un nouveau multiple de 3 (3 potes = 1 semaine).
// Plafonné à 4 semaines cumulées.
export async function grantReferralReward(inviterCode: string): Promise<void> {
  const inviter = await prisma.user.findUnique({
    where: { inviteCode: inviterCode },
    select: { id: true, premiumUntil: true },
  });
  if (!inviter) return;

  // Nombre de filleuls confirmés (celui qui vient de finir est déjà compté).
  const total = await prisma.user.count({
    where: { invitedByCode: inviterCode, inviteRewardGranted: true },
  });
  // On ne crédite qu'au franchissement d'un palier de 3 (3, 6, 9, 12…).
  if (total % REFERRAL_FRIENDS_PER_WEEK !== 0) return;

  const now = Date.now();
  const base =
    inviter.premiumUntil && inviter.premiumUntil.getTime() > now
      ? inviter.premiumUntil.getTime()
      : now;
  const capped = Math.min(base + REFERRAL_REWARD_DAYS * DAY_MS, now + REFERRAL_MAX_DAYS * DAY_MS);

  await prisma.user.update({
    where: { id: inviter.id },
    data: { premiumUntil: new Date(capped) },
  });
}

// Bonus « filleul abonné » : quand un joueur parrainé effectue son PREMIER vrai
// paiement, on offre 2 semaines de Premium à son parrain. Déclenché depuis le
// webhook Stripe (invoice.payment_succeeded). Idempotent : un verrou atomique
// (updateMany sur le flag) garantit une seule récompense, même si l'événement
// est rejoué ou arrive en double.
export async function grantPaidReferralReward(payerUserId: string): Promise<void> {
  const payer = await prisma.user.findUnique({
    where: { id: payerUserId },
    select: { invitedByCode: true, paidInviteRewardGranted: true },
  });
  if (!payer?.invitedByCode || payer.paidInviteRewardGranted) return;

  // Verrou atomique : on "réclame" la récompense. Si 0 ligne modifiée, c'est
  // qu'un autre traitement l'a déjà fait → on s'arrête (jamais de double crédit).
  const claim = await prisma.user.updateMany({
    where: { id: payerUserId, paidInviteRewardGranted: false },
    data: { paidInviteRewardGranted: true },
  });
  if (claim.count === 0) return;

  const inviter = await prisma.user.findUnique({
    where: { inviteCode: payer.invitedByCode },
    select: { id: true, premiumUntil: true },
  });
  if (!inviter) return; // code d'invitation inconnu → personne à récompenser

  const now = Date.now();
  const base =
    inviter.premiumUntil && inviter.premiumUntil.getTime() > now
      ? inviter.premiumUntil.getTime()
      : now;

  await prisma.user.update({
    where: { id: inviter.id },
    data: { premiumUntil: new Date(base + PAID_REFERRAL_REWARD_DAYS * DAY_MS) },
  });
}

// Nombre de filleuls d'un joueur (pour l'affichage « X potes rejoints »).
export async function countReferrals(inviteCode: string): Promise<number> {
  if (!inviteCode) return 0;
  return prisma.user.count({ where: { invitedByCode: inviteCode, inviteRewardGranted: true } });
}
