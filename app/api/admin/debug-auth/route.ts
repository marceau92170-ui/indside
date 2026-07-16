import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Outil de diagnostic TEMPORAIRE pour la connexion Google.
// Ne renvoie aucune valeur secrète en clair : seulement des longueurs / booléens
// pour repérer une faute de frappe, un espace parasite, ou une table manquante.
//   GET /api/admin/debug-auth?key=verif2607
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("key") !== "verif2607") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const id = process.env.GOOGLE_CLIENT_ID ?? "";
  const secret = process.env.GOOGLE_CLIENT_SECRET ?? "";
  const nextauthUrl = process.env.NEXTAUTH_URL ?? "";

  // Vérifie que la table Account (utilisée uniquement par la connexion Google)
  // existe bien et est interrogeable.
  let accountTableOk = false;
  let accountTableError: string | null = null;
  try {
    await prisma.account.count();
    accountTableOk = true;
  } catch (e) {
    accountTableError = String(e).slice(0, 300);
  }

  // Dernière erreur d'authentification capturée (voir logger dans lib/auth.ts).
  let lastAuthError: string | null = null;
  try {
    const row = await prisma.debugLog.findUnique({ where: { key: "last_auth_error" } });
    lastAuthError = row?.value ?? null;
  } catch {
    lastAuthError = "(table DebugLog pas encore créée — attends le déploiement)";
  }

  return NextResponse.json({
    googleClientId: id, // valeur publique (visible côté navigateur de toute façon)
    googleClientIdLength: id.length,
    googleClientIdNoWhitespace: id === id.trim(),
    googleClientIdEndsCorrectly: id.endsWith(".apps.googleusercontent.com"),
    googleSecretSet: secret.length > 0,
    googleSecretLength: secret.length,
    googleSecretExpectedLength: 35,
    googleSecretPrefixOk: secret.startsWith("GOCSPX-"),
    googleSecretNoWhitespace: secret === secret.trim(),
    nextauthUrl,
    nextauthUrlNoWhitespace: nextauthUrl === nextauthUrl.trim(),
    nextauthSecretSet: Boolean(process.env.NEXTAUTH_SECRET),
    databaseUrlSet: Boolean(process.env.DATABASE_URL),
    accountTableOk,
    accountTableError,
    lastAuthError,
  });
}
