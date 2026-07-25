import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { grantStoryShareReward, STORY_SHARE_REWARD_DAYS } from "@/lib/referral";

export const dynamic = "force-dynamic";

// Le joueur déclare avoir partagé Progressa en story → +3 jours de Premium, une
// seule fois par compte (verrou atomique côté lib). Honnête et non re-farmable.
export async function POST() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const granted = await grantStoryShareReward(user.id);
  return NextResponse.json({ granted, days: STORY_SHARE_REWARD_DAYS });
}
