import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Clerk fournit le contexte d'authentification. Il ne bloque AUCUNE route : la
// protection reste gérée dans le layout (app) qui redirige vers /connexion.
// Seule règle ici : un utilisateur CONNECTÉ qui arrive sur la racine "/" est
// envoyé directement sur son espace (onglet Profil) au lieu de la landing
// marketing. Les visiteurs non connectés voient la landing normalement.
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  if (userId && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/profil", req.url));
  }
});

export const config = {
  matcher: [
    // toutes les pages sauf les fichiers statiques et _next
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|svg|ico|webp|woff2?|ttf|map|webmanifest)).*)",
    // les routes API
    "/(api|trpc)(.*)",
  ],
};
