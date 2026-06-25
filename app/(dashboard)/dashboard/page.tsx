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
  DEMANDE_VISITE: "Demande de visite",
  LOCATAIRE: "Locataire",
  PROPRIETAIRE: "Propriétaire",
  DOSSIER_PIECES: "Dossier / pièces",
  FOURNISSEUR: "Fournisseur",
  ADMIN: "Administratif",
  SPAM: "Spam",
  AUTRE: "Autre",
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  CLASSIFIED: { label: "Classifié", color: "text-zinc-400", dot: "bg-zinc-500" },
  DRAFT_READY: { label: "À valider", color: "text-amber-400", dot: "bg-amber-400" },
  AUTO_SENT: { label: "Envoyé", color: "text-emerald-400", dot: "bg-emerald-400" },
  VALIDATED: { label: "Envoyé", color: "text-emerald-400", dot: "bg-emerald-400" },
  IGNORED: { label: "Ignoré", color: "text-zinc-500", dot: "bg-zinc-600" },
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
      prisma.emailMessage.findMany({ where: { ...mailboxFilter, status: { not: EmailStatus.NEW } }, orderBy: { receivedAt: "desc" }, take: 12, select: { id: true, subject: true, from: true, category: true, status: true, receivedAt: true } }),
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

  const quotaPct = agency && agency.emailQuotaMax > 0
    ? Math.round((agency.emailQuotaUsed / agency.emailQuotaMax) * 100)
    : 0

  const stats = [
    {
      label: "Emails traités",
      value: totalProcessed,
      trend: weekProcessed > 0 ? `+${weekProcessed} cette semaine` : "cette semaine",
      trendUp: weekProcessed > 0,
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
      ic: "bg-indigo-500/10 text-indigo-300",
    },
    {
      label: "Leads détectés",
      value: leads,
      trend: "achat & location",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
      ic: "bg-emerald-500/10 text-emerald-400",
    },
    {
      label: "Auto-réponses",
      value: autoSent,
      trend: "sans intervention",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />,
      ic: "bg-violet-500/10 text-violet-300",
    },
    {
      label: "Temps économisé",
      value: timeSavedLabel,
      trend: "≈ 3 min / email",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
      ic: "bg-amber-500/10 text-amber-400",
    },
  ]

  return (
    <div className="flex flex-col min-h-full">
      {/* Topbar */}
      <div className="h-[60px] border-b border-line px-6 md:px-7 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-base font-semibold tracking-tight">Vue d&apos;ensemble</h1>
          <p className="text-[12.5px] text-zinc-500 mt-px">
            {weekProcessed > 0 ? `+${weekProcessed} email${weekProcessed > 1 ? "s" : ""} traité${weekProcessed > 1 ? "s" : ""} cette semaine` : "Activité de votre agent IA"}
          </p>
        </div>
        {pendingDrafts > 0 && (
          <Link
            href="/validation"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-all hover:-translate-y-px hover:shadow-glow"
          >
            <span className="min-w-[18px] h-[18px] px-1 bg-white/20 rounded-full text-[11px] font-semibold flex items-center justify-center">{pendingDrafts}</span>
            Valider les brouillons
          </Link>
        )}
      </div>

      <div className="p-6 md:p-7 max-w-6xl w-full mx-auto animate-fade-up">
        {/* Alerts */}
        {agency && agency.emailQuotaMax === 0 && (
          <div className="flex items-center gap-3 bg-amber-500/[0.07] border border-amber-500/20 rounded-xl px-4 py-3 mb-6">
            <svg className="w-[17px] h-[17px] text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-amber-300">Aucun abonnement actif</p>
              <p className="text-xs text-zinc-400 mt-0.5">Choisissez un plan pour activer le traitement IA de vos emails.</p>
            </div>
            <a href="/pricing" className="text-xs bg-amber-500 hover:bg-amber-400 text-ink-950 font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0">Voir les plans →</a>
          </div>
        )}
        {agency && agency.emailQuotaMax > 0 && quotaPct >= 100 && (
          <div className="flex items-center gap-3 bg-red-500/[0.07] border border-red-500/20 rounded-xl px-4 py-3 mb-6">
            <svg className="w-[17px] h-[17px] text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-red-300">Quota mensuel atteint — traitement suspendu</p>
              <p className="text-xs text-zinc-400 mt-0.5">Les nouveaux emails ne sont plus traités jusqu&apos;au renouvellement.</p>
            </div>
            <a href="/pricing" className="text-xs bg-red-500 hover:bg-red-400 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0">Upgrader</a>
          </div>
        )}
        {agency && agency.emailQuotaMax > 0 && quotaPct >= 80 && quotaPct < 100 && (
          <div className="flex items-center gap-3 bg-amber-500/[0.07] border border-amber-500/20 rounded-xl px-4 py-3 mb-6">
            <svg className="w-[17px] h-[17px] text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-amber-300">{quotaPct}% du quota utilisé</p>
              <p className="text-xs text-zinc-400 mt-0.5">{agency.emailQuotaUsed} / {agency.emailQuotaMax} emails ce mois-ci.</p>
            </div>
            <a href="/pricing" className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors shrink-0">Voir les plans →</a>
          </div>
        )}

        {/* Empty state */}
        {totalProcessed === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-line rounded-2xl mb-6">
            <div className="w-12 h-12 bg-ink-850 border border-line rounded-[13px] flex items-center justify-center mb-4">
              <svg className="w-[22px] h-[22px] text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold mb-1">Aucun email traité pour l&apos;instant</p>
            <p className="text-[12.5px] text-zinc-500 mb-5">Connectez Gmail dans les paramètres pour commencer.</p>
            <DemoSeedButton />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="group bg-ink-900 border border-line rounded-xl p-[18px] transition-all hover:border-line-strong hover:-translate-y-0.5 hover:shadow-card">
              <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center mb-3.5 ${s.ic}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{s.icon}</svg>
              </div>
              <p className="text-[26px] font-bold tracking-tightest tabular-nums leading-none">{s.value}</p>
              <p className="text-[12.5px] text-zinc-500 mt-[7px] font-medium">{s.label}</p>
              <p className={`text-[11.5px] mt-2 flex items-center gap-1 font-medium ${s.trendUp ? "text-emerald-400" : "text-zinc-600"}`}>
                {s.trendUp && (
                  <svg className="w-[11px] h-[11px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                )}
                {s.trend}
              </p>
            </div>
          ))}
        </div>

        {/* Panels */}
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Recent activity */}
          <div className="lg:col-span-3 bg-ink-900 border border-line rounded-xl overflow-hidden">
            <div className="px-[18px] py-[15px] border-b border-line flex items-center justify-between">
              <h2 className="text-[13.5px] font-semibold tracking-tight">Activité récente</h2>
              {recentEmails.length > 0 && (
                <Link href="/validation" className="text-xs text-zinc-500 hover:text-brand-hover transition-colors">Voir tout →</Link>
              )}
            </div>
            {recentEmails.length === 0 ? (
              <div className="py-12 text-center"><p className="text-sm text-zinc-600">Aucun email pour l&apos;instant</p></div>
            ) : (
              <div>
                {recentEmails.map((email) => {
                  const st = STATUS_CONFIG[email.status] ?? { label: email.status, color: "text-zinc-500", dot: "bg-zinc-600" }
                  return (
                    <div key={email.id} className="flex items-center gap-3.5 px-[18px] py-[13px] border-b border-line last:border-0 hover:bg-ink-850 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium truncate">{email.subject || "(sans objet)"}</p>
                        <p className="text-[11.5px] text-zinc-600 truncate mt-0.5">{email.from}</p>
                      </div>
                      {email.category && (
                        <span className="hidden sm:inline-flex text-[11px] font-medium px-2 py-[3px] rounded-md bg-indigo-500/10 text-indigo-300 shrink-0">
                          {CATEGORY_LABELS[email.category] ?? email.category}
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium shrink-0 ${st.color}`}>
                        <span className={`w-[5px] h-[5px] rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Category breakdown */}
          <div className="lg:col-span-2 bg-ink-900 border border-line rounded-xl overflow-hidden">
            <div className="px-[18px] py-[15px] border-b border-line">
              <h2 className="text-[13.5px] font-semibold tracking-tight">Répartition par catégorie</h2>
            </div>
            {categoryStats.length === 0 ? (
              <div className="py-12 text-center"><p className="text-sm text-zinc-600">Aucune donnée</p></div>
            ) : (
              <div>
                {categoryStats.map((c) => (
                  <div key={c.category} className="px-[18px] py-[13px] border-b border-line last:border-0">
                    <div className="flex justify-between text-[12.5px] mb-2">
                      <span className="text-zinc-300 font-medium">{CATEGORY_LABELS[c.category] ?? c.category}</span>
                      <span className="text-zinc-500 tabular-nums">{c.count}</span>
                    </div>
                    <div className="h-[5px] bg-ink-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${(c.count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
