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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  CLASSIFIED: { label: "Classifié", color: "bg-blue-100 text-blue-800" },
  DRAFT_READY: { label: "Brouillon prêt", color: "bg-yellow-100 text-yellow-800" },
  AUTO_SENT: { label: "Auto-envoyé", color: "bg-green-100 text-green-800" },
  VALIDATED: { label: "Validé", color: "bg-green-100 text-green-800" },
  IGNORED: { label: "Ignoré", color: "bg-gray-100 text-gray-600" },
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.agencyId) redirect("/login")

  const agencyId = session.user.agencyId
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const mailboxFilter = { mailbox: { agencyId } }

  const [
    totalProcessed,
    weekProcessed,
    pendingDrafts,
    autoSent,
    leads,
    byCategory,
    recentEmails,
  ] = await Promise.all([
    prisma.emailMessage.count({
      where: { ...mailboxFilter, status: { not: EmailStatus.NEW } },
    }),
    prisma.emailMessage.count({
      where: { ...mailboxFilter, status: { not: EmailStatus.NEW }, receivedAt: { gte: weekAgo } },
    }),
    prisma.emailMessage.count({
      where: { ...mailboxFilter, status: EmailStatus.DRAFT_READY },
    }),
    prisma.emailMessage.count({
      where: { ...mailboxFilter, status: EmailStatus.AUTO_SENT },
    }),
    prisma.emailMessage.count({
      where: { ...mailboxFilter, category: { in: ["LEAD_ACHAT", "LEAD_LOCATION"] } },
    }),
    prisma.emailMessage.groupBy({
      by: ["category"],
      where: { ...mailboxFilter, category: { not: null } },
      _count: { _all: true },
    }),
    prisma.emailMessage.findMany({
      where: { ...mailboxFilter, status: { not: EmailStatus.NEW } },
      orderBy: { receivedAt: "desc" },
      take: 10,
    }),
  ])

  const timeSavedMinutes = totalProcessed * ESTIMATED_TIME_PER_EMAIL_MINUTES
  const timeSavedHours = Math.floor(timeSavedMinutes / 60)
  const timeSavedMin = timeSavedMinutes % 60
  const timeSavedLabel =
    timeSavedHours > 0
      ? `${timeSavedHours}h${timeSavedMin.toString().padStart(2, "0")}`
      : `${timeSavedMinutes} min`

  const categoryStats = byCategory
    .map((c) => ({ category: c.category as string, count: c._count._all }))
    .sort((a, b) => b.count - a.count)
  const maxCount = Math.max(1, ...categoryStats.map((c) => c.count))

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 mt-1">Vue d&apos;ensemble de votre activité email</p>
      </div>

      {totalProcessed === 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
          <div>
            <p className="font-medium text-gray-900">Aperçu du produit</p>
            <p className="text-sm text-gray-500">
              Pas encore de boîte connectée ? Chargez un jeu de données de démonstration
              pour voir l&apos;agent en action.
            </p>
          </div>
          <DemoSeedButton />
        </div>
      )}

      {/* Stats principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Emails traités" value={totalProcessed} hint={`${weekProcessed} cette semaine`} color="text-gray-900" />
        <StatCard label="Leads détectés" value={leads} hint="achat + location" color="text-blue-600" />
        <StatCard label="Auto-réponses" value={autoSent} hint="envoyées sans intervention" color="text-green-600" />
        <StatCard label="Temps économisé" value={timeSavedLabel} hint="≈ 3 min/email" color="text-green-600" />
      </div>

      {/* Brouillons en attente — CTA */}
      {pendingDrafts > 0 && (
        <Link
          href="/validation"
          className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-8 hover:bg-yellow-100 transition-colors"
        >
          <div>
            <p className="font-semibold text-yellow-900">
              {pendingDrafts} brouillon{pendingDrafts > 1 ? "s" : ""} en attente de validation
            </p>
            <p className="text-sm text-yellow-700">Cliquez pour les valider en un clic →</p>
          </div>
          <span className="text-3xl font-bold text-yellow-600">{pendingDrafts}</span>
        </Link>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Répartition par catégorie */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition par catégorie</h2>
          {categoryStats.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Aucune donnée pour l&apos;instant.</p>
          ) : (
            <div className="space-y-3">
              {categoryStats.map((c) => (
                <div key={c.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{CATEGORY_LABELS[c.category] ?? c.category}</span>
                    <span className="text-gray-500 font-medium">{c.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(c.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Derniers emails */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Activité récente</h2>
          </div>
          {recentEmails.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <p className="font-medium">Aucun email traité pour l&apos;instant</p>
              <p className="text-sm mt-1">Connectez votre boîte Gmail pour commencer.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[420px] overflow-auto">
              {recentEmails.map((email) => {
                const st = STATUS_LABELS[email.status] ?? { label: email.status, color: "bg-gray-100 text-gray-600" }
                return (
                  <div key={email.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {email.category && (
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              {CATEGORY_LABELS[email.category] ?? email.category}
                            </span>
                          )}
                          {email.priority === "URGENT" && (
                            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">Urgent</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">{email.subject || "(sans objet)"}</p>
                        <p className="text-xs text-gray-500 truncate">{email.from}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded shrink-0 ${st.color}`}>
                        {st.label}
                      </span>
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

function StatCard({
  label,
  value,
  hint,
  color,
}: {
  label: string
  value: string | number
  hint: string
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{hint}</p>
    </div>
  )
}
