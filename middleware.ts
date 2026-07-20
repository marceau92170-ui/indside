import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk a besoin de ce middleware pour fournir le contexte d'authentification.
// Il ne bloque AUCUNE route par défaut : la protection reste gérée dans le layout
// (app) qui redirige vers /connexion si l'utilisateur n'est pas connecté.
export default clerkMiddleware();

export const config = {
  matcher: [
    // toutes les pages sauf les fichiers statiques et _next
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|svg|ico|webp|woff2?|ttf|map|webmanifest)).*)",
    // les routes API
    "/(api|trpc)(.*)",
  ],
};
