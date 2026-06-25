import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AUTO_REPLY_CATEGORIES } from "@/lib/constants"
import RulesEditor, { type RuleItem } from "@/components/RulesEditor"
import AgencySettings from "@/components/AgencySettings"
import BillingSection from "@/components/BillingSection"
import PromoCodeInput from "@/components/PromoCodeInput"
import DisconnectMailboxButton from "@/components/DisconnectMailboxButton"

export const dynamic = "force-dynamic"

const SUCCESS_MESSAGES: Record<string, string> = {
  gmail_connected: "Boîte Gmail connectée avec succès.",
}
const MAILBOX_LIMITS: Record<string, number> = {
  STARTER: 1,
  PRO: 3,
  AGENCY_PLUS: 999,
}

const ERROR_MESSAGES: Record<string, string> = {
  gmail_auth_failed: "La connexion Gmail a échoué. Réessayez.",
  gmail_no_tokens: "Google n'a pas renvoyé de refresh token. Révoquez l'accès dans votre compte Google puis reconnectez la boîte.",
  gmail_no_email: "Impossible de récupérer l'adresse Gmail.",
  gmail_callback_failed: "Erreur lors de la connexion. Réessayez.",
  no_plan: "Activez un abonnement avant de connecter une boîte Gmail.",
  mailbox_limit_starter: "Limite atteinte — le plan Starter inclut 1 boîte Gmail. Passez au plan Pro pour en connecter jusqu'à 3.",
  mailbox_limit_pro: "Limite atteinte — le plan Pro inclut 3 boîtes Gmail. Passez à l'Agence+ pour un nombre illimité.",
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

  const limit = agency?.plan ? MAILBOX_LIMITS[agency.plan] ?? 1 : 1
  const canConnect = !agency?.plan || mailboxes.length < limit

  return (
    <div className="flex flex-col min-h-full">
      {/* Topbar */}
      <div className="h-[60px] border-b border-line px-6 md:px-7 flex items-center shrink-0">
        <div>
          <h1 className="text-base font-semibold tracking-tight">Paramètres</h1>
          <p className="text-[12.5px] text-zinc-500 mt-px">Configurez l&apos;agent et vos boîtes connectées</p>
        </div>
      </div>

      <div className="p-6 md:p-7 max-w-3xl w-full mx-auto space-y-5 animate-fade-up">
        {successMsg && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        {/* No quota banner */}
        {agency && agency.emailQuotaMax === 0 && (
          <div className="flex items-start gap-3 bg-amber-500/[0.07] border border-amber-500/20 rounded-xl p-4">
            <svg className="w-[17px] h-[17px] text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <p className="text-[13px] font-semibold text-amber-300">Aucun accès actif</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Entrez un code d&apos;invitation ou choisissez un plan pour que l&apos;agent commence à traiter vos emails.
              </p>
            </div>
          </div>
        )}

        {/* Gmail */}
        <section className="bg-ink-900 border border-line rounded-xl overflow-hidden">
          <div className="px-[18px] py-[15px] border-b border-line flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[13.5px] font-semibold tracking-tight">Boîtes Gmail connectées</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">
                {agency?.plan && MAILBOX_LIMITS[agency.plan] < 999
                  ? `${mailboxes.length} / ${MAILBOX_LIMITS[agency.plan]} boîte${MAILBOX_LIMITS[agency.plan] > 1 ? "s" : ""} utilisée${MAILBOX_LIMITS[agency.plan] > 1 ? "s" : ""} — plan ${agency.plan === "STARTER" ? "Starter" : "Pro"}`
                  : agency?.plan === "AGENCY_PLUS"
                  ? "Boîtes illimitées — plan Agence+"
                  : "Connectez votre première boîte"}
              </p>
            </div>
            {canConnect ? (
              <a
                href="/api/gmail/connect"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand hover:bg-brand-hover text-white text-[13px] font-medium rounded-lg transition-all hover:-translate-y-px hover:shadow-glow shrink-0"
              >
                <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Connecter Gmail
              </a>
            ) : (
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-ink-850 hover:bg-ink-800 text-zinc-300 text-[13px] font-medium rounded-lg border border-line hover:border-line-strong transition-colors shrink-0"
              >
                Upgrader →
              </a>
            )}
          </div>

          <div className="px-[18px]">
            {mailboxes.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-[13px] text-zinc-600">Aucune boîte connectée pour le moment.</p>
              </div>
            ) : (
              <ul>
                {mailboxes.map((mb) => (
                  <li key={mb.id} className="flex items-center justify-between py-3.5 gap-4 border-b border-line last:border-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-[34px] h-[34px] rounded-[9px] bg-ink-800 flex items-center justify-center shrink-0">
                        <svg className="w-[17px] h-[17px] text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-medium truncate">{mb.email}</p>
                        <p className="text-[11.5px] text-zinc-600 mt-0.5">
                          Dernière sync : {mb.lastSyncAt ? new Date(mb.lastSyncAt).toLocaleString("fr-FR") : "jamais"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 shrink-0">
                      <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${mb.status === "ACTIVE" ? "text-emerald-400" : mb.status === "ERROR" ? "text-red-400" : "text-zinc-500"}`}>
                        <span className={`w-[5px] h-[5px] rounded-full ${mb.status === "ACTIVE" ? "bg-emerald-400" : mb.status === "ERROR" ? "bg-red-400" : "bg-zinc-600"}`} />
                        {mb.status === "ACTIVE" ? "Actif" : mb.status === "ERROR" ? "Erreur" : mb.status}
                      </span>
                      <DisconnectMailboxButton mailboxId={mb.id} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Rules */}
        <section className="bg-ink-900 border border-line rounded-xl p-[18px]">
          <h2 className="text-[13.5px] font-semibold tracking-tight mb-1">Règles par catégorie</h2>
          <p className="text-[12px] text-zinc-500 mb-5">
            La réponse automatique n&apos;est disponible que pour les catégories sans risque d&apos;engagement.
          </p>
          {ruleItems.length === 0 ? (
            <p className="text-sm text-zinc-600">Règles non initialisées.</p>
          ) : (
            <RulesEditor rules={ruleItems} />
          )}
        </section>

        {/* Tone & signature */}
        <section className="bg-ink-900 border border-line rounded-xl p-[18px]">
          <h2 className="text-[13.5px] font-semibold tracking-tight mb-1">Ton &amp; signature</h2>
          <p className="text-[12px] text-zinc-500 mb-5">Appliqués à toutes les réponses générées par l&apos;IA.</p>
          <AgencySettings
            initialTone={agency?.tone ?? "vouvoiement"}
            initialSignature={agency?.signature ?? ""}
          />
        </section>

        {/* Billing */}
        <section className="bg-ink-900 border border-line rounded-xl p-[18px]">
          <h2 className="text-[13.5px] font-semibold tracking-tight mb-1">Abonnement</h2>
          <p className="text-[12px] text-zinc-500 mb-5">Votre plan actuel et l&apos;utilisation du quota mensuel.</p>
          <BillingSection
            plan={agency?.plan ?? "STARTER"}
            quotaUsed={agency?.emailQuotaUsed ?? 0}
            quotaMax={agency?.emailQuotaMax ?? 500}
            hasStripe={!!agency?.stripeCustomerId}
          />
        </section>

        {/* Promo code */}
        <section className="bg-ink-900 border border-line rounded-xl p-[18px]">
          <h2 className="text-[13.5px] font-semibold tracking-tight mb-1">Code d&apos;accès</h2>
          <p className="text-[12px] text-zinc-500 mb-5">Entrez votre code d&apos;invitation pour activer ou prolonger votre accès.</p>
          <PromoCodeInput hasRedemption={!!redemption} />
        </section>
      </div>
    </div>
  )
}
