import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ESTIMATED_TIME_PER_EMAIL_MINUTES } from "@/lib/constants"
import { EmailStatus } from "@prisma/client"
import DemoSeedButton from "@/components/DemoSeedButton"

export const dynamic = "force-dynamic"

const CATEGORY_LABELS: Record<string, string> = {
  LEAD_ACHAT: "Lead achat",
  LEAD_LOCATION: "Lead location",
  DEMANDE_VISITE: "Demande visite",
  LOCATAIRE: "Locataire",
  PROPRIETAIRE: "Propriétaire",
  DOSSIER_PIECES: "Dossier / pièces",
  FOURNISSEUR: "Fournisseur",
  ADMIN: "Administratif",
  SPAM: "Spam",
  AUTRE: "Autre",
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  CLASSIFIED: { label: "Classifié", color: "text-slate-400" },
  DRAFT_READY: { label: "À valider", color: "text-amber-400" },
  AUTO_SENT: { label: "Auto-envoyé", color: "text-emerald-400" },
  VALIDATED: { label: "Envoyé", color: "text-emerald-400" },
  IGNORED: { label: "Ignoré", color: "text-slate-600" },
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.agencyId) redirect("/login")

  const agencyId = session.user.agencyId
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const mailboxFilter = { mailbox: { agencyId } }

  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: { emailQuotaUsed: true, emailQuotaMax: true, plan: true },
  })

  const [totalProcessed, weekProcessed, pendingDrafts, autoSent, leads, byCategory, recentEmails] =
    await Promise.all([
      prisma.emailMessage.count({ where: { ...mailboxFilter, status: { not: EmailStatus.NEW } } }),
      prisma.emailMessage.count({ where: { ...mailboxFilter, status: { not: EmailStatus.NEW }, receivedAt: { gte: weekAgo } } }),
      prisma.emailMessage.count({ where: { ...mailboxFilter, status: EmailStatus.DRAFT_READY } }),
      prisma.emailMessage.count({ where: { ...mailboxFilter, status: EmailStatus.AUTO_SENT } }),
      prisma.emailMessage.count({ where: { ...mailboxFilter, category: { in: ["LEAD_ACHAT", "LEAD_LOCATION"] } } }),
      prisma.emailMessage.groupBy({ by: ["category"], where: { ...mailboxFilter, category: { not: null } }, _count: { _all: true } }),
      prisma.emailMessage.findMany({ where: { ...mailboxFilter, status: { not: EmailStatus.NEW } }, orderBy: { receivedAt: "desc" }, take: 15, select: { id: true, subject: true, from: true, category: true, status: true, receivedAt: true } }),
    ])

  const timeSavedMinutes = totalProcessed * ESTIMATED_TIME_PER_EMAIL_MINUTES
  const timeSavedHours = Math.floor(timeSavedMinutes / 60)
  const timeSavedMin = timeSavedMinutes % 60
  const timeSavedLabel = timeSavedHours > 0
    ? `${timeSavedHours}h${timeSavedMin.toString().padStart(2, "0")}`
    : `${timeSavedMinutes} min`

  const categoryStats = byCategory
    .map((c) => ({ category: c.category as string, count: c._count._all }))
    .sort((a, b) => b.count - a.count)

  const quotaPct = agency && agency.emailQuotaMax > 0
    ? Math.round((agency.emailQuotaUsed / agency.emailQuotaMax) * 100)
    : 0

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">

      {/* Alerts */}
      {agency && agency.emailQuotaMax === 0 && (
        <div className="flex items-center gap-3 border border-amber-500/30 bg-amber-500/5 rounded-lg px-4 py-3 mb-6 text-sm">
          <span className="text-amber-400">⚠</span>
          <span className="text-amber-300 font-medium">Aucun abonnement actif</span>
          <span className="text-slate-400">— les emails ne sont pas traités.</span>
          <a href="/pricing" className="ml-auto text-amber-400 hover:text-amber-300 font-medium shrink-0">Activer →</a>
        </div>
      )}
      {agency && agency.emailQuotaMax > 0 && quotaPct >= 100 && (
        <div className="flex items-center gap-3 border border-red-500/30 bg-red-500/5 rounded-lg px-4 py-3 mb-6 text-sm">
          <span className="text-red-400">⊘</span>
          <span className="text-red-300 font-medium">Quota atteint — traitement suspendu</span>
          <a href="/pricing" className="ml-auto text-red-400 hover:text-red-300 font-medium shrink-0">Upgrader →</a>
        </div>
      )}
      {agency && agency.emailQuotaMax > 0 && quotaPct >= 80 && quotaPct < 100 && (
        <div className="flex items-center gap-3 border border-amber-500/20 bg-amber-500/5 rounded-lg px-4 py-3 mb-6 text-sm">
          <span className="text-amber-400">⚠</span>
          <span className="text-slate-300">{quotaPct}% du quota utilisé — {agency.emailQuotaUsed} / {agency.emailQuotaMax} emails</span>
          <a href="/pricing" className="ml-auto text-amber-400 hover:text-amber-300 font-medium shrink-0">Voir les plans →</a>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-white">Vue d&apos;ensemble</h1>
          <p className="text-sm text-slate-500 mt-0.5">+{weekProcessed} email{weekProcessed !== 1 ? "s" : ""} cette semaine</p>
        </div>
        {pendingDrafts > 0 && (
          <Link
            href="/validation"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <span className="w-5 h-5 bg-white/20 rounded-full text-xs flex items-center justify-center font-bold">{pendingDrafts}</span>
            Valider
          </Link>
        )}
      </div>

      {/* Empty state */}
      {totalProcessed === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-slate-800 rounded-lg mb-6">
          <p className="text-sm font-medium text-white mb-1">Aucun email traité</p>
          <p className="text-xs text-slate-500 mb-5">Connectez Gmail dans les paramètres pour commencer.</p>
          <DemoSeedButton />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border border-slate-800 rounded-lg overflow-hidden mb-6">
        {[
          { label: "Emails traités", value: totalProcessed },
          { label: "Leads détectés", value: leads },
          { label: "Auto-réponses", value: autoSent },
          { label: "Temps économisé", value: timeSavedLabel },
        ].map((s, i) => (
          <div key={s.label} className={`p-5 ${i > 0 ? "border-l border-slate-800" : ""} ${i >= 2 ? "border-t lg:border-t-0 border-slate-800" : ""}`}>
            <p className="text-2xl font-bold text-white tabular-nums">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Recent emails — table */}
        <div className="lg:col-span-3 border border-slate-800 rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Activité récente</h2>
            {recentEmails.length > 0 && (
              <Link href="/validation" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Voir tout →
              </Link>
            )}
          </div>
          {recentEmails.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-600">Aucun email pour l&apos;instant</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {recentEmails.map((email) => {
                const st = STATUS_CONFIG[email.status] ?? { label: email.status, color: "text-slate-500" }
                return (
                  <div key={email.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-800/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate">{email.subject || "(sans objet)"}</p>
                      <p className="text-xs text-slate-600 truncate mt-0.5">{email.from}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {email.category && (
                        <span className="hidden sm:block text-xs text-slate-500">
                          {CATEGORY_LABELS[email.category] ?? email.category}
                        </span>
                      )}
                      <span className={`text-xs font-medium ${st.color}`}>{st.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="lg:col-span-2 border border-slate-800 rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-800">
            <h2 className="text-sm font-medium text-white">Par catégorie</h2>
          </div>
          {categoryStats.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-600">Aucune donnée</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {categoryStats.map((c) => (
                <div key={c.category} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-slate-300">{CATEGORY_LABELS[c.category] ?? c.category}</span>
                  <span className="text-sm font-medium text-white tabular-nums">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
