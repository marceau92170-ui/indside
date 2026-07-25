import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPremium } from "@/lib/plan";
import { SITE_URL } from "@/lib/site";
import {
  getOrCreateInviteCode,
  countReferrals,
  REFERRAL_FRIENDS_PER_WEEK,
  REFERRAL_MAX_WEEKS,
  PAID_REFERRAL_REWARD_DAYS,
  STORY_SHARE_REWARD_DAYS,
} from "@/lib/referral";
import { InviteShare } from "@/components/InviteShare";
import { StoryShareReward } from "@/components/StoryShareReward";
import { Card } from "@/components/ui";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";

export default async function ParrainagePage() {
  const user = await currentUser();
  if (!user) redirect("/connexion");

  const [code, flags] = await Promise.all([
    getOrCreateInviteCode(user.id),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { storyShareRewardGranted: true },
    }),
  ]);
  const url = `${SITE_URL}/invite/${code}`;
  const referrals = await countReferrals(code);
  const weeksEarned = Math.min(Math.floor(referrals / REFERRAL_FRIENDS_PER_WEEK), REFERRAL_MAX_WEEKS);
  const premium = isPremium(user);
  const until =
    user.premiumUntil && user.premiumUntil > new Date()
      ? user.premiumUntil.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
      : null;

  const paidWeeks = Math.round(PAID_REFERRAL_REWARD_DAYS / 7);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Gagne du Premium gratuit</h1>
      <p className="mb-5 text-sm text-muted">
        Plusieurs façons de prolonger ton Premium, sans payer. Elles se cumulent.
      </p>

      {/* Compteur perso — visible dès qu'il y a du progrès */}
      {(referrals > 0 || until) && (
        <Card className="mb-6 border-glow/30">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="font-condensed text-3xl font-bold text-glow tnum">{referrals}</p>
              <p className="text-[11px] uppercase tracking-wide text-muted">
                pote{referrals > 1 ? "s" : ""} rejoint{referrals > 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <p className="font-condensed text-3xl font-bold text-glow tnum">{weeksEarned}</p>
              <p className="text-[11px] uppercase tracking-wide text-muted">
                semaine{weeksEarned > 1 ? "s" : ""} gagnée{weeksEarned > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          {until && (
            <p className="mt-3 text-center text-sm text-chalk">
              Premium offert jusqu&apos;au <span className="font-semibold">{until}</span>
            </p>
          )}
        </Card>
      )}

      {/* FAÇON 1 — Parrainage (le plus fort) */}
      <Way
        n="1"
        title="Parraine tes potes"
        reward={`${REFERRAL_FRIENDS_PER_WEEK} inscrits = 1 semaine`}
      >
        <p className="mb-1 text-sm text-muted">
          {REFERRAL_FRIENDS_PER_WEEK} coéquipiers qui créent leur programme via ton lien ={" "}
          <span className="font-semibold text-chalk">1 semaine de Premium</span>. Cumulable jusqu&apos;à{" "}
          {REFERRAL_MAX_WEEKS} semaines.
        </p>
        <div className="my-3 flex items-start gap-2 rounded-lg border border-glow/25 bg-glow/10 p-3">
          <Icon name="flame" className="mt-0.5 h-4 w-4 shrink-0 text-glow" />
          <p className="text-[13px] leading-relaxed">
            <span className="font-semibold text-glow">Bonus abonné :</span> un pote qui passe Premium
            via ton lien = <span className="font-semibold text-glow">{paidWeeks} semaines d&apos;un coup</span>.
            Le meilleur moyen de rester Premium gratuitement.
          </p>
        </div>
        <InviteShare url={url} />
      </Way>

      {/* FAÇON 2 — Partage en story */}
      <Way n="2" title="Partage en story" reward={`+${STORY_SHARE_REWARD_DAYS} jours`}>
        <p className="mb-3 text-sm text-muted">
          Montre Progressa en story et tag <span className="font-semibold text-chalk">@progressafoot</span> :{" "}
          <span className="font-semibold text-chalk">+{STORY_SHARE_REWARD_DAYS} jours</span> de Premium,
          une seule fois.
        </p>
        <StoryShareReward
          shareUrl={url}
          days={STORY_SHARE_REWARD_DAYS}
          alreadyClaimed={Boolean(flags?.storyShareRewardGranted)}
        />
      </Way>

      {/* Comment marche le parrainage */}
      <h2 className="mb-2 mt-8 font-condensed text-lg font-bold uppercase">Comment marche le parrainage</h2>
      <div className="space-y-3">
        {[
          ["1", "Partage ton lien", "À tes coéquipiers, sur ton groupe d'équipe, en story…"],
          ["2", "Tes potes créent leur programme", "Ils répondent aux questions et reçoivent leur programme perso."],
          [
            "3",
            `Tous les ${REFERRAL_FRIENDS_PER_WEEK} potes : 1 semaine`,
            `Premium crédité automatiquement, jusqu'à ${REFERRAL_MAX_WEEKS} semaines gratuites.`,
          ],
        ].map(([n, t, d]) => (
          <div key={n} className="flex gap-4 rounded-card border border-line bg-surface p-4">
            <span className="font-condensed text-2xl font-bold text-glow">{n}</span>
            <div>
              <p className="font-condensed text-base font-bold uppercase leading-tight">{t}</p>
              <p className="mt-0.5 text-sm text-muted">{d}</p>
            </div>
          </div>
        ))}
      </div>

      {!premium && (
        <p className="mt-5 text-center text-xs text-muted">
          Astuce : {REFERRAL_MAX_WEEKS * REFERRAL_FRIENDS_PER_WEEK} potes = {REFERRAL_MAX_WEEKS} semaines
          de Premium gratuites, de quoi tester tout le programme complet sans payer.
        </p>
      )}
    </div>
  );
}

// Une « façon de gagner du Premium » : numéro + titre + récompense en évidence.
function Way({
  n,
  title,
  reward,
  children,
}: {
  n: string;
  title: string;
  reward: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="mb-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-glow/15 font-condensed text-lg font-bold text-glow">
          {n}
        </span>
        <p className="flex-1 font-condensed text-lg font-bold uppercase leading-none">{title}</p>
        <span className="flex-none rounded-full bg-glow/15 px-2.5 py-1 text-xs font-bold text-glow">
          {reward}
        </span>
      </div>
      {children}
    </Card>
  );
}
