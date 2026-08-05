// Garde-fou partagé par toutes les pages /admin/* — un seul endroit à
// vérifier plutôt que de répéter la même condition dans chaque page.
export function isAdminAuthorized(secret: string | undefined): boolean {
  return Boolean(process.env.ADMIN_SECRET) && secret === process.env.ADMIN_SECRET;
}
