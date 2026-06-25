import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.agencyId) redirect("/login")

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto animate-fade-up">
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mx-auto mb-4 shadow-[0_4px_16px_rgba(99,102,241,0.4)]">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Bienvenue sur ImmoMail</h1>
        <p className="text-zinc-400 mt-2 text-sm">
          Votre agent IA est prêt. Encore deux étapes pour le mettre au travail.
        </p>
      </div>

      <ol className="space-y-3">
        <li className="flex gap-4 bg-ink-900 border border-line rounded-xl p-5 transition-colors hover:border-line-strong">
          <span className="shrink-0 w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-sm font-bold">
            1
          </span>
          <div className="flex-1">
            <h2 className="font-semibold">Connectez votre boîte Gmail</h2>
            <p className="text-sm text-zinc-400 mt-1 mb-4">
              L&apos;agent lira les nouveaux emails pour les classer et préparer les réponses.
            </p>
            <a
              href="/api/gmail/connect"
              className="inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-hover px-4 py-2 text-[13px] font-medium text-white transition-all hover:-translate-y-px hover:shadow-glow"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Connecter Gmail
            </a>
          </div>
        </li>

        <li className="flex gap-4 bg-ink-900 border border-line rounded-xl p-5">
          <span className="shrink-0 w-8 h-8 rounded-full bg-ink-800 text-zinc-300 flex items-center justify-center text-sm font-bold">
            2
          </span>
          <div className="flex-1">
            <h2 className="font-semibold">Vérifiez vos règles</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Par défaut, seuls les accusés de réception simples partent automatiquement.
              Tout le reste vous est proposé en brouillon à valider. Ajustez depuis les paramètres.
            </p>
          </div>
        </li>
      </ol>

      <div className="mt-8 flex items-center justify-between">
        <Link href="/settings" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          Voir les paramètres
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg bg-brand hover:bg-brand-hover px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:shadow-glow"
        >
          C&apos;est parti →
        </Link>
      </div>
    </div>
  )
}
