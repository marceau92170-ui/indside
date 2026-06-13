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
    <div className="p-6 md:p-8 max-w-5xl mx-auto">

      {/* Quota / plan alerts */}
      {agency && agency.emailQuotaMax === 0 && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
          <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-300">Aucun abonnement actif</p>
            <p className="text-xs text-slate-400 mt-0.5">Choisissez un plan pour activer le traitement IA de vos emails.</p>
          </div>
          <a href="/pricing" className="text-xs bg-amber-500 hover:bg-amber-400 text-white px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0">Voir les plans →</a>
        </div>
      )}
      {agency && agency.emailQuotaMax > 0 && agency.emailQuotaMax < 999999 && (() => {
        const pct = Math.round((agency.emailQuotaUsed / agency.emailQuotaMax) * 100)
        if (pct >= 100) return (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-300">Quota mensuel atteint — traitement suspendu</p>
              <p className="text-xs text-slate-400 mt-0.5">Les nouveaux emails ne sont plus traités jusqu&apos;au renouvellement.</p>
            </div>
            <a href="/pricing" className="text-xs bg-red-500 hover:bg-red-400 text-white px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0">Upgrader</a>
          </div>
        )
        if (pct >= 80) return (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
            <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-300">{pct}% du quota utilisé</p>
              <p className="text-xs text-slate-400 mt-0.5">{agency.emailQuotaUsed} / {agency.emailQuotaMax} emails ce mois-ci.</p>
            </div>
            <a href="/pricing" className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors shrink-0">Voir les plans →</a>
          </div>
        )
        return null
      })()}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-1">Activité de votre agent IA email</p>
        </div>
        {pendingDrafts > 0 && (
          <Link
            href="/validation"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <span className="w-5 h-5 bg-white/20 rounded-full text-xs flex items-center justify-center font-bold">{pendingDrafts}</span>
            Valider les brouillons
          </Link>
        )}
      </div>

      {/* Empty state */}
      {totalProcessed === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-slate-800 rounded-2xl mb-8">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-white mb-1">Aucun email traité pour l&apos;instant</p>
          <p className="text-xs text-slate-500 mb-5">Connectez Gmail dans les paramètres pour commencer.</p>
          <DemoSeedButton />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Emails traités",
            value: totalProcessed,
            sub: `+${weekProcessed} cette semaine`,
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
          },
          {
            label: "Leads détectés",
            value: leads,
            sub: "achat & location",
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Auto-réponses",
            value: autoSent,
            sub: "sans intervention",
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
          },
          {
            label: "Temps économisé",
            value: timeSavedLabel,
            sub: "≈ 3 min / email",
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
            <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center`}>
              <svg className={`w-4 h-4 ${s.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">{s.icon}</svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
            <p className="text-xs text-slate-600">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Category breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">Répartition par catégorie</h2>
          {categoryStats.length === 0 ? (
            <p className="text-sm text-slate-600 py-8 text-center">Aucune donnée</p>
          ) : (
            <div className="space-y-4">
              {categoryStats.map((c) => (
                <div key={c.category}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-300 font-medium">{CATEGORY_LABELS[c.category] ?? c.category}</span>
                    <span className="text-slate-500 tabular-nums">{c.count}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(c.count / maxCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Activité récente</h2>
            {recentEmails.length > 0 && (
              <Link href="/validation" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Voir tout →
              </Link>
            )}
          </div>
          {recentEmails.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-500">Aucun email traité pour l&apos;instant</p>
              <p className="text-xs text-slate-600 mt-1">Connectez Gmail pour commencer.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60 max-h-[400px] overflow-auto">
              {recentEmails.map((email) => {
                const st = STATUS_CONFIG[email.status] ?? { label: email.status, dot: "bg-slate-600" }
                return (
                  <div key={email.id} className="px-6 py-4 hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {email.category && (
                          <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 mb-1.5">
                            {CATEGORY_LABELS[email.category] ?? email.category}
                          </span>
                        )}
                        <p className="text-sm text-white truncate font-medium">{email.subject || "(sans objet)"}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{email.from}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></div>
                        <span className="text-xs text-slate-500 whitespace-nowrap">{st.label}</span>
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
