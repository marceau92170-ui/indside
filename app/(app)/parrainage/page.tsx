import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { isPremium } from "@/lib/plan";
import { SITE_URL } from "@/lib/site";
import {
  getOrCreateInviteCode,
  countReferrals,
  REFERRAL_FRIENDS_PER_WEEK,
  REFERRAL_MAX_WEEKS,
} from "@/lib/referral";
import { InviteShare } from "@/components/InviteShare";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ParrainagePage() {
  const user = await currentUser();
  if (!user) redirect("/connexion");

  const code = await getOrCreateInviteCode(user.id);
  const url = `${SITE_URL}/invite/${code}`;
  const referrals = await countReferrals(code);
  const weeksEarned = Math.min(Math.floor(referrals / REFERRAL_FRIENDS_PER_WEEK), REFERRAL_MAX_WEEKS);
  const premium = isPremium(user);
  const until =
    user.premiumUntil && user.premiumUntil > new Date()
      ? user.premiumUntil.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
      : null;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Invite ton équipe</h1>
      <p className="mb-5 text-sm text-muted">
        {REFERRAL_FRIENDS_PER_WEEK} coéquipiers qui créent leur programme via ton lien ={" "}
        <span className="font-semibold text-chalk">1 semaine de Premium offerte</span>. Cumulable
        jusqu&apos;à {REFERRAL_MAX_WEEKS} semaines.
      </p>

      <Card className="mb-4">
        <InviteShare url={url} />
      </Card>

      {(referrals > 0 || until) && (
        <Card className="mb-4 border-glow/30">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="font-condensed text-3xl font-bold text-glow tnum">{referrals}</p>
              <p className="text-[11px] uppercase tracking-wide text-muted">
                pote{referrals > 1 ? "s" : ""} rejoint{referrals > 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <p className="font-condensed text-3xl font-bold text-glow tnum">
                {weeksEarned}
              </p>
              <p className="text-[11px] uppercase tracking-wide text-muted">
                semaine{weeksEarned > 1 ? "s" : ""} gagnée{weeksEarned > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          {until && (
            <p className="mt-3 text-center text-sm text-chalk">
              🎉 Premium offert jusqu&apos;au <span className="font-semibold">{until}</span>
            </p>
          )}
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="font-condensed text-lg font-bold uppercase">Comment ça marche</h2>
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
