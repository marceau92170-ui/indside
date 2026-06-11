import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ESTIMATED_TIME_PER_EMAIL_MINUTES } from "@/lib/constants"
import { EmailStatus, DraftStatus } from "@prisma/client"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.agencyId) {
    redirect("/login")
  }

  const agencyId = session.user.agencyId

  const [emailsProcessed, pendingDrafts, recentEmails] = await Promise.all([
    prisma.usageLog.aggregate({
      where: { agencyId, type: "cron_run" },
      _sum: { emailsCount: true },
    }),
    prisma.draft.count({
      where: {
        status: DraftStatus.PENDING,
        emailMessage: {
          mailbox: { agencyId },
        },
      },
    }),
    prisma.emailMessage.findMany({
      where: {
        mailbox: { agencyId },
        status: { not: EmailStatus.NEW },
      },
      orderBy: { receivedAt: "desc" },
      take: 10,
      include: { draft: true },
    }),
  ])

  const totalProcessed = emailsProcessed._sum.emailsCount ?? 0
  const timeSavedMinutes = totalProcessed * ESTIMATED_TIME_PER_EMAIL_MINUTES
  const timeSavedHours = Math.floor(timeSavedMinutes / 60)
  const timeSavedRemainingMin = timeSavedMinutes % 60

  const categoryLabels: Record<string, string> = {
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

  const statusLabels: Record<string, { label: string; color: string }> = {
    CLASSIFIED: { label: "Classifié", color: "bg-blue-100 text-blue-800" },
    DRAFT_READY: { label: "Brouillon prêt", color: "bg-yellow-100 text-yellow-800" },
    AUTO_SENT: { label: "Auto-envoyé", color: "bg-green-100 text-green-800" },
    VALIDATED: { label: "Validé", color: "bg-green-100 text-green-800" },
    IGNORED: { label: "Ignoré", color: "bg-gray-100 text-gray-600" },
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Vue d&apos;ensemble de votre activité email</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500">Emails traités</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalProcessed}</p>
          <p className="text-xs text-gray-400 mt-1">Total depuis le début</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500">Brouillons en attente</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingDrafts}</p>
          <p className="text-xs text-gray-400 mt-1">À valider avant envoi</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500">Temps économisé</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {timeSavedHours > 0
              ? `${timeSavedHours}h${timeSavedRemainingMin.toString().padStart(2, "0")}`
              : `${timeSavedMinutes}min`}
          </p>
          <p className="text-xs text-gray-400 mt-1">Estimé à 3 min/email</p>
        </div>
      </div>

      {/* Recent emails */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Derniers emails classifiés</h2>
        </div>

        {recentEmails.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-lg font-medium">Aucun email traité pour l&apos;instant</p>
            <p className="text-sm mt-2">Connectez votre boîte Gmail pour commencer</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentEmails.map((email) => {
              const statusInfo = statusLabels[email.status] ?? { label: email.status, color: "bg-gray-100 text-gray-600" }
              return (
                <div key={email.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {email.category && (
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {categoryLabels[email.category] ?? email.category}
                          </span>
                        )}
                        {email.priority === "URGENT" && (
                          <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">{email.subject}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{email.from}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(email.receivedAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
