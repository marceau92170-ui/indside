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
  DOSSIER_PIECES: "Dossier pièces",
  FOURNISSEUR: "Fournisseur",
  ADMIN: "Administratif",
  SPAM: "Spam",
  AUTRE: "Autre",
}

const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  CLASSIFIED: { label: "Classifié", dot: "bg-blue-400" },
  DRAFT_READY: { label: "Brouillon prêt", dot: "bg-amber-400" },
  AUTO_SENT: { label: "Auto-envoyé", dot: "bg-emerald-400" },
  VALIDATED: { label: "Validé", dot: "bg-emerald-400" },
  IGNORED: { label: "Ignoré", dot: "bg-slate-600" },
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.agencyId) redirect("/login")

  const agencyId = session.user.agencyId
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const mailboxFilter = { mailbox: { agencyId } }

  const [totalProcessed, weekProcessed, pendingDrafts, autoSent, leads, byCategory, recentEmails] =
    await Promise.all([
      prisma.emailMessage.count({ where: { ...mailboxFilter, status: { not: EmailStatus.NEW } } }),
      prisma.emailMessage.count({ where: { ...mailboxFilter, status: { not: EmailStatus.NEW }, receivedAt: { gte: weekAgo } } }),
      prisma.emailMessage.count({ where: { ...mailboxFilter, status: EmailStatus.DRAFT_READY } }),
      prisma.emailMessage.count({ where: { ...mailboxFilter, status: EmailStatus.AUTO_SENT } }),
      prisma.emailMessage.count({ where: { ...mailboxFilter, category: { in: ["LEAD_ACHAT", "LEAD_LOCATION"] } } }),
      prisma.emailMessage.groupBy({ by: ["category"], where: { ...mailboxFilter, category: { not: null } }, _count: { _all: true } }),
      prisma.emailMessage.findMany({ where: { ...mailboxFilter, status: { not: EmailStatus.NEW } }, orderBy: { receivedAt: "desc" }, take: 10 }),
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
  const maxCount = Math.max(1, ...categoryStats.map((c) => c.count))

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Tableau de bord</h1>
        <p className="text-sm text-slate-500 mt-0.5">Vue d&apos;ensemble de votre activité email</p>
      </div>

      {/* Empty state */}
      {totalProcessed === 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
          <div>
            <p className="text-sm font-medium text-white">Aucune donnée pour l&apos;instant</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Chargez un jeu de démonstration pour voir l&apos;agent en action.
            </p>
          </div>
          <DemoSeedButton />
        </div>
      )}

      {/* Pending drafts alert */}
      {pendingDrafts > 0 && (
        <Link
          href="/validation"
          className="flex items-center justify-between bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-4 mb-8 hover:bg-indigo-600/15 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm font-semibold text-indigo-300">
                {pendingDrafts} brouillon{pendingDrafts > 1 ? "s" : ""} en attente
              </p>
              <p className="text-xs text-slate-500">Cliquez pour valider →</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-indigo-400">{pendingDrafts}</span>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Emails traités", value: totalProcessed, sub: `${weekProcessed} cette semaine` },
          { label: "Leads détectés", value: leads, sub: "achat + location" },
          { label: "Auto-réponses", value: autoSent, sub: "sans intervention" },
          { label: "Temps économisé", value: timeSavedLabel, sub: "≈ 3 min / email" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
            <p className="text-2xl font-bold text-white mt-2">{s.value}</p>
            <p className="text-xs text-slate-600 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Category breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">Répartition par catégorie</h2>
          {categoryStats.length === 0 ? (
            <p className="text-sm text-slate-600 py-8 text-center">Aucune donnée</p>
          ) : (
            <div className="space-y-4">
              {categoryStats.map((c) => (
                <div key={c.category}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">{CATEGORY_LABELS[c.category] ?? c.category}</span>
                    <span className="text-slate-500 font-medium tabular-nums">{c.count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(c.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white">Activité récente</h2>
          </div>
          {recentEmails.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-500">Aucun email traité pour l&apos;instant</p>
              <p className="text-xs text-slate-600 mt-1">Connectez Gmail pour commencer.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800 max-h-[380px] overflow-auto">
              {recentEmails.map((email) => {
                const st = STATUS_CONFIG[email.status] ?? { label: email.status, dot: "bg-slate-600" }
                return (
                  <div key={email.id} className="px-5 py-3.5 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {email.category && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                              {CATEGORY_LABELS[email.category] ?? email.category}
                            </span>
                          )}
                          {email.priority === "URGENT" && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-500/10 text-red-400">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white truncate">{email.subject || "(sans objet)"}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{email.from}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></div>
                        <span className="text-xs text-slate-500">{st.label}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
