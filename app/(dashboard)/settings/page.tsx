import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AUTO_REPLY_CATEGORIES } from "@/lib/constants"
import RulesEditor, { type RuleItem } from "@/components/RulesEditor"
import AgencySettings from "@/components/AgencySettings"
import BillingSection from "@/components/BillingSection"

export const dynamic = "force-dynamic"

const SUCCESS_MESSAGES: Record<string, string> = {
  gmail_connected: "Boîte Gmail connectée avec succès.",
}
const ERROR_MESSAGES: Record<string, string> = {
  gmail_auth_failed: "La connexion Gmail a échoué. Réessayez.",
  gmail_no_tokens:
    "Google n'a pas renvoyé de refresh token. Révoquez l'accès dans votre compte Google puis reconnectez la boîte.",
  gmail_no_email: "Impossible de récupérer l'adresse Gmail.",
  gmail_callback_failed: "Erreur lors de la connexion. Réessayez.",
}

// Ordre d'affichage logique des catégories
const CATEGORY_ORDER = [
  "LEAD_ACHAT",
  "LEAD_LOCATION",
  "DEMANDE_VISITE",
  "DOSSIER_PIECES",
  "LOCATAIRE",
  "PROPRIETAIRE",
  "FOURNISSEUR",
  "ADMIN",
  "AUTRE",
  "SPAM",
]

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.agencyId) redirect("/login")
  const agencyId = session.user.agencyId

  const [agency, mailboxes, rules] = await Promise.all([
    prisma.agency.findUnique({ where: { id: agencyId } }),
    prisma.mailbox.findMany({ where: { agencyId }, orderBy: { createdAt: "desc" } }),
    prisma.automationRule.findMany({ where: { agencyId } }),
  ])

  const whitelist = AUTO_REPLY_CATEGORIES as readonly string[]
  const ruleItems: RuleItem[] = rules
    .map((r) => ({
      id: r.id,
      category: r.category,
      action: r.action,
      enabled: r.enabled,
      whitelisted: whitelist.includes(r.category),
    }))
    .sort(
      (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
    )

  const successMsg = searchParams.success ? SUCCESS_MESSAGES[searchParams.success] : null
  const errorMsg = searchParams.error
    ? ERROR_MESSAGES[searchParams.error] ?? "Une erreur est survenue."
    : null

  return (
    <div className="p-6 md:p-8 max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Règles &amp; Paramètres</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configurez le comportement de votre agent et connectez votre boîte.
        </p>
      </div>

      {successMsg && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {errorMsg}
        </div>
      )}

      {/* Connexion Gmail */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Boîtes email connectées</h2>
            <p className="text-sm text-gray-500">
              L&apos;agent surveille ces boîtes et traite les emails entrants.
            </p>
          </div>
          <a
            href="/api/gmail/connect"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shrink-0"
          >
            Connecter Gmail
          </a>
        </div>

        {mailboxes.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded-lg">
            Aucune boîte connectée pour le moment.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {mailboxes.map((mb) => (
              <li key={mb.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{mb.email}</p>
                  <p className="text-xs text-gray-500">
                    {mb.provider} · dernière synchro :{" "}
                    {mb.lastSyncAt ? new Date(mb.lastSyncAt).toLocaleString("fr-FR") : "jamais"}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    mb.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : mb.status === "ERROR"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {mb.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Règles d'automatisation */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900">Règles par catégorie</h2>
        <p className="text-sm text-gray-500 mb-4">
          Pour chaque type d&apos;email, choisissez l&apos;action de l&apos;agent. La réponse
          automatique n&apos;est proposée que pour les cas sans risque.
        </p>
        {ruleItems.length === 0 ? (
          <p className="text-sm text-gray-400">Règles non initialisées.</p>
        ) : (
          <RulesEditor rules={ruleItems} />
        )}
      </section>

      {/* Ton & signature */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ton &amp; signature</h2>
        <AgencySettings
          initialTone={agency?.tone ?? "vouvoiement"}
          initialSignature={agency?.signature ?? ""}
        />
      </section>

      {/* Abonnement */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Abonnement &amp; quota</h2>
        <BillingSection
          plan={agency?.plan ?? "STARTER"}
          quotaUsed={agency?.emailQuotaUsed ?? 0}
          quotaMax={agency?.emailQuotaMax ?? 500}
          hasStripe={!!agency?.stripeCustomerId}
        />
      </section>
    </div>
  )
}
