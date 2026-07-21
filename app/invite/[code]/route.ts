import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

// Lien d'invitation entre joueurs : progressafoot.fr/invite/<code>
// Pose un cookie d'invitation (30 j) puis envoie directement à l'onboarding.
// La récompense du parrain est versée quand le filleul FINIT son onboarding.
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const clean = code.trim().toUpperCase().slice(0, 12);

  const res = NextResponse.redirect(new URL("/onboarding", SITE_URL));
  if (clean) {
    res.cookies.set("invite_code", clean, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });
  }
  return res;
}
