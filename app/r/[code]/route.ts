import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ATTRIBUTION_WINDOW_DAYS } from "@/lib/affiliate";

export const dynamic = "force-dynamic";

// Lien de parrainage : progressafoot.fr/r/<code>
// Enregistre le clic, pose le cookie d'attribution (30 j), puis redirige vers l'accueil.
// Règle d'or : un lien marketing ne DOIT jamais renvoyer d'erreur. En cas de souci
// (base indisponible, code inconnu…), on redirige quand même vers l'accueil.
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const clean = code.trim().toLowerCase();

  // On redirige vers l'accueil du domaine réellement visité — pas de dépendance à
  // une variable d'environnement (SITE_URL) qui pourrait être mal configurée.
  const res = NextResponse.redirect(new URL("/", new URL(req.url).origin));

  try {
    const affiliate = await prisma.affiliate.findUnique({ where: { code: clean } });
    // Code inconnu : on redirige sans rien attribuer.
    if (!affiliate) return res;

    // Suivi du clic (best-effort, ne bloque jamais la redirection).
    try {
      await prisma.linkClick.create({ data: { affiliateCode: affiliate.code } });
    } catch {
      /* ignore */
    }

    // Cookie d'attribution — "premier lien gagne" est géré à l'inscription :
    // on n'écrase pas un cookie existant si le visiteur revient par un autre lien.
    res.cookies.set("ref_code", affiliate.code, {
      maxAge: ATTRIBUTION_WINDOW_DAYS * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });
  } catch {
    // Base indisponible ou autre erreur : on redirige quand même, jamais de 500.
  }

  return res;
}
