import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.agencyId) redirect("/login")

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="text-4xl mb-3">👋</div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenue sur ImmoMail</h1>
        <p className="text-gray-500 mt-2">
          Votre agent IA est prêt. Encore deux étapes pour le mettre au travail.
        </p>
      </div>

      <ol className="space-y-4">
        <li className="flex gap-4 bg-white border border-gray-200 rounded-xl p-5">
          <span className="shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
            1
          </span>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">Connectez votre boîte Gmail</h2>
            <p className="text-sm text-gray-500 mt-1 mb-3">
              L&apos;agent lira les nouveaux emails pour les classer et préparer les réponses.
            </p>
            <a
              href="/api/gmail/connect"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Connecter Gmail
            </a>
          </div>
        </li>

        <li className="flex gap-4 bg-white border border-gray-200 rounded-xl p-5">
          <span className="shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold">
            2
          </span>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">Vérifiez vos règles (préréglage prudent)</h2>
            <p className="text-sm text-gray-500 mt-1">
              Par défaut, seuls les accusés de réception de leads partent automatiquement.
              Tout le reste vous est proposé en brouillon à valider. Vous pouvez tout ajuster
              dans les paramètres.
            </p>
          </div>
        </li>
      </ol>

      <div className="mt-8 flex items-center justify-between">
        <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900">
          Voir les paramètres
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          C&apos;est parti →
        </Link>
      </div>
    </div>
  )
}
