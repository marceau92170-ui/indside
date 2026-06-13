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
        <div className="w-12 h-12 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Bienvenue sur ImmoMail</h1>
        <p className="text-slate-400 mt-2 text-sm">
          Votre agent IA est prêt. Encore deux étapes pour le mettre au travail.
        </p>
      </div>

      <ol className="space-y-3">
        <li className="flex gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <span className="shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
            1
          </span>
          <div className="flex-1">
            <h2 className="font-semibold text-white">Connectez votre boîte Gmail</h2>
            <p className="text-sm text-slate-400 mt-1 mb-4">
              L&apos;agent lira les nouveaux emails pour les classer et préparer les réponses.
            </p>
            <a
              href="/api/gmail/connect"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Connecter Gmail
            </a>
          </div>
        </li>

        <li className="flex gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <span className="shrink-0 w-8 h-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold">
            2
          </span>
          <div className="flex-1">
            <h2 className="font-semibold text-white">Vérifiez vos règles</h2>
            <p className="text-sm text-slate-400 mt-1">
              Par défaut, seuls les accusés de réception simples partent automatiquement.
              Tout le reste vous est proposé en brouillon à valider. Ajustez depuis les paramètres.
            </p>
          </div>
        </li>
      </ol>

      <div className="mt-8 flex items-center justify-between">
        <Link href="/settings" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
          Voir les paramètres
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition-colors"
        >
          C&apos;est parti →
        </Link>
      </div>
    </div>
  )
}
