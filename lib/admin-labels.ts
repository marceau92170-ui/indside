// Libellés lisibles partagés entre les pages admin (/admin/usage, /admin/live)
// — un seul endroit à mettre à jour quand on instrumente un nouveau bouton
// ou qu'on ajoute une section à l'app.

// Libellé lisible par bouton/action trackée (voir lib/click-track.ts, trackClick).
// Instrumenté au fil de l'eau — tous les boutons ne sont pas encore suivis.
export const CLICK_LABELS: Record<string, string> = {
  program_regenerate: "Régénérer le programme",
  checkout_annual_trial: "Checkout · Annuel, essai gratuit",
  checkout_annual_pay: "Checkout · Annuel, paiement direct",
  checkout_monthly_trial: "Checkout · Mensuel, essai gratuit",
  checkout_monthly_pay: "Checkout · Mensuel, paiement direct",
  semaine_commencer_seance: "Commencer ma séance (Aujourd'hui)",
  semaine_lancer_guidee: "Lancer la séance guidée",
  semaine_trial_banner: "Débloquer mon programme (bannière essai)",
  session_quick_done: "J'ai fait ✓ (validation rapide)",
  nav_premium: "Premium (nav)",
  manage_subscription: "Gérer mon abonnement",
  wellness_checkin_save: "Check-in du jour",
  match_log_save: "Enregistrer un match",
  push_enable: "Activer les notifications",
  push_disable: "Désactiver les notifications",
  referral_share: "Partager mon lien de parrainage",
  account_signout: "Se déconnecter",
  account_delete_confirm: "Confirmer la suppression du compte",
};

// Libellé lisible par section de l'app (1er segment du chemin — voir app/(app)/*).
export const ROUTE_LABELS: Record<string, string> = {
  "/semaine": "Semaine (dashboard)",
  "/seance": "Séance (détail)",
  "/bibliotheque": "Bibliothèque d'exercices",
  "/historique": "Historique des semaines",
  "/matchs": "Carnet de match",
  "/objectifs": "Objectifs personnels",
  "/parrainage": "Parrainage",
  "/partenaire": "Espace partenaire",
  "/premium": "Premium / abonnement",
  "/profil": "Carte joueur / profil",
  "/reglages": "Réglages",
  "/ressources": "Ressources",
  "/sante": "Suivi santé",
  "/tests": "Tests d'évaluation",
  "/avis": "Avis",
};

export function normalizePath(path: string): string {
  const seg = path.split("/").filter(Boolean)[0];
  return seg ? `/${seg}` : "/";
}
