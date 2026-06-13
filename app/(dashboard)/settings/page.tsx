import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AUTO_REPLY_CATEGORIES } from "@/lib/constants"
import RulesEditor, { type RuleItem } from "@/components/RulesEditor"
import AgencySettings from "@/components/AgencySettings"
import BillingSection from "@/components/BillingSection"
import PromoCodeInput from "@/components/PromoCodeInput"

export const dynamic = "force-dynamic"

const SUCCESS_MESSAGES: Record<string, string> = {
  gmail_connected: "Boîte Gmail connectée avec succès.",
}
const ERROR_MESSAGES: Record<string, string> = {
  gmail_auth_failed: "La connexion Gmail a échoué. Réessayez.",
  gmail_no_tokens: "Google n'a pas renvoyé de refresh token. Révoquez l'accès dans votre compte Google puis reconnectez la boîte.",
  gmail_no_email: "Impossible de récupérer l'adresse Gmail.",
  gmail_callback_failed: "Erreur lors de la connexion. Réessayez.",
}

const CATEGORY_ORDER = [
  "LEAD_ACHAT", "LEAD_LOCATION", "DEMANDE_VISITE", "DOSSIER_PIECES",
  "LOCATAIRE", "PROPRIETAIRE", "FOURNISSEUR", "ADMIN", "AUTRE", "SPAM",
]

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.agencyId) redirect("/login")
  const agencyId = session.user.agencyId

  const [agency, mailboxes, rules, redemption] = await Promise.all([
    prisma.agency.findUnique({ where: { id: agencyId } }),
    prisma.mailbox.findMany({ where: { agencyId }, orderBy: { createdAt: "desc" } }),
    prisma.automationRule.findMany({ where: { agencyId } }),
    prisma.promoRedemption.findUnique({ where: { agencyId } }),
  ])

  const whitelist = AUTO_REPLY_CATEGORIES as readonly string[]
  const ruleItems: RuleItem[] = rules
    .map((r) => ({
      id: r.id,
      category: r.category,
      action: r.action,
      enabled: r.enabled,
      whitelisted: whitelist.includes(r.category),
      template: r.template ?? null,
    }))
    .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category))

  const successMsg = searchParams.success ? SUCCESS_MESSAGES[searchParams.success] : null
  const errorMsg = searchParams.error ? ERROR_MESSAGES[searchParams.error] ?? "Une erreur est survenue." : null

  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-6">
      <div className="mb-2">
        <h1 className="text-xl font-semibold text-white">Paramètres</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configurez l&apos;agent et connectez votre boîte Gmail.</p>
      </div>

      {successMsg && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Gmail */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5 gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Boîtes Gmail connectées</h2>
            <p className="text-xs text-slate-500 mt-0.5">L&apos;agent surveille ces boîtes en continu.</p>
          </div>
          <a
            href="/api/gmail/connect"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Connecter Gmail
          </a>
        </div>

        {mailboxes.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-800 rounded-lg">
            <p className="text-sm text-slate-600">Aucune boîte connectée pour le moment.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-800">
            {mailboxes.map((mb) => (
              <li key={mb.id} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-sm text-white">{mb.email}</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {mb.provider} · sync{" "}
                    {mb.lastSyncAt ? new Date(mb.lastSyncAt).toLocaleString("fr-FR") : "jamais"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${mb.status === "ACTIVE" ? "bg-emerald-400" : mb.status === "ERROR" ? "bg-red-400" : "bg-slate-600"}`}></div>
                  <span className="text-xs text-slate-500">{mb.status === "ACTIVE" ? "Actif" : mb.status === "ERROR" ? "Erreur" : mb.status}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Rules */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-1">Règles par catégorie</h2>
        <p className="text-xs text-slate-500 mb-5">
          La réponse automatique n&apos;est disponible que pour les catégories sans risque d&apos;engagement.
        </p>
        {ruleItems.length === 0 ? (
          <p className="text-sm text-slate-600">Règles non initialisées.</p>
        ) : (
          <RulesEditor rules={ruleItems} />
        )}
      </section>

      {/* Tone & signature */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-1">Ton &amp; signature</h2>
        <p className="text-xs text-slate-500 mb-5">Appliqués à toutes les réponses générées par l&apos;IA.</p>
        <AgencySettings
          initialTone={agency?.tone ?? "vouvoiement"}
          initialSignature={agency?.signature ?? ""}
        />
      </section>

      {/* Billing */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-1">Abonnement</h2>
        <p className="text-xs text-slate-500 mb-5">Votre plan actuel et l&apos;utilisation du quota mensuel.</p>
        <BillingSection
          plan={agency?.plan ?? "STARTER"}
          quotaUsed={agency?.emailQuotaUsed ?? 0}
          quotaMax={agency?.emailQuotaMax ?? 500}
          hasStripe={!!agency?.stripeCustomerId}
        />
      </section>

      {/* Promo code */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-1">Code d&apos;accès</h2>
        <p className="text-xs text-slate-500 mb-5">Entrez votre code d&apos;invitation pour activer ou prolonger votre accès.</p>
        <PromoCodeInput hasRedemption={!!redemption} />
      </section>
    </div>
  )
}
