"use client"

import { useState, FormEvent } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email ou mot de passe incorrect")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setError("Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 border-r border-slate-800 flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-white font-bold">ImmoMail</span>
        </Link>

        <div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            Votre assistant email
            <br />
            <span className="text-indigo-400">travaille pour vous</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Classification automatique, brouillons intelligents, validation en un clic.
            Vos emails immobiliers traités 3x plus vite.
          </p>

          <div className="space-y-3">
            {[
              "Leads classés automatiquement",
              "Réponses dans le ton de votre agence",
              "Aucun engagement sans votre validation",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-indigo-600/20 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600">© 2026 ImmoMail · Agences immobilières françaises</p>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-white font-bold">ImmoMail</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Connexion</h1>
          <p className="text-slate-400 text-sm mb-8">Accédez à votre espace agence</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="vous@agence.fr"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Connexion..." : "Se connecter →"}
            </button>

            <p className="text-center text-sm text-slate-500 pt-2">
              Pas encore de compte ?{" "}
              <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Créer un compte
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
