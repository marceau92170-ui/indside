import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Messages de feedback affichés après le retour du flux OAuth Gmail
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

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.agencyId) {
    redirect("/login")
  }

  const mailboxes = await prisma.mailbox.findMany({
    where: { agencyId: session.user.agencyId },
    orderBy: { createdAt: "desc" },
  })

  const successMsg = searchParams.success
    ? SUCCESS_MESSAGES[searchParams.success]
    : null
  const errorMsg = searchParams.error
    ? ERROR_MESSAGES[searchParams.error] ?? "Une erreur est survenue."
    : null

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Règles &amp; Paramètres
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Connectez votre boîte email et configurez l'agent.
      </p>

      {successMsg && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {errorMsg}
        </div>
      )}

      {/* Section connexion Gmail */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Boîtes email connectées
            </h2>
            <p className="text-sm text-gray-500">
              L'agent surveille ces boîtes et traite les emails entrants.
            </p>
          </div>
          <a
            href="/api/gmail/connect"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 11l8-5H4l8 5zm0 2L4 8v10h16V8l-8 5z" />
            </svg>
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
              <li
                key={mb.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {mb.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {mb.provider} · dernière synchro :{" "}
                    {mb.lastSyncAt
                      ? new Date(mb.lastSyncAt).toLocaleString("fr-FR")
                      : "jamais"}
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
    </div>
  )
}
