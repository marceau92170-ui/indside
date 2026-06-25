"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"

export default function RegisterPage() {
  const router = useRouter()
  const [agencyName, setAgencyName] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyName, name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erreur lors de la création du compte")
        return
      }

      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (loginResult?.error) {
        router.push("/login")
      } else {
        if (promoCode.trim()) {
          await fetch("/api/promo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: promoCode.trim() }),
          })
        }
        router.push("/onboarding")
        router.refresh()
      }
    } catch {
      setError("Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-ink-950 text-white">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden border-r border-line bg-gradient-to-b from-ink-900 to-ink-950">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.18),transparent_70%)] pointer-events-none" />

        <Link href="/" className="flex items-center gap-2.5 relative">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-[0_2px_8px_rgba(99,102,241,0.4)]">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-semibold tracking-tight">ImmoMail</span>
        </Link>

        <div className="relative">
          <h2 className="text-[30px] font-bold leading-[1.18] tracking-tightest mb-3.5">
            Rejoignez ImmoMail
            <br />
            <span className="gradient-text">sur invitation</span>
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-sm">
            En moins de 5 minutes, connectez votre Gmail et laissez l&apos;IA
            gérer la classification et les brouillons de vos emails immobiliers.
          </p>

          <div className="space-y-4">
            {[
              { label: "Configuration en 5 min", sub: "Connectez Gmail, c'est tout" },
              { label: "Accès sur code d'invitation", sub: "Activez votre code après inscription" },
              { label: "Contrôle total", sub: "Vous validez chaque réponse avant envoi" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-indigo-500/15 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-[13.5px] font-medium text-zinc-200">{item.label}</div>
                  <div className="text-xs text-zinc-500">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11.5px] text-zinc-600 relative">© 2026 ImmoMail · Agences immobilières françaises</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold">ImmoMail</span>
          </div>

          <h1 className="text-[22px] font-semibold tracking-tight mb-1.5">Créer votre espace</h1>
          <p className="text-zinc-400 text-[13.5px] mb-7">Accès sur invitation · Activez votre compte avec un code</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="agencyName" className="block text-[13px] font-medium text-zinc-300 mb-1.5">
                Nom de l&apos;agence
              </label>
              <input
                id="agencyName"
                type="text"
                required
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-ink-850 border border-line rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 focus:bg-ink-900 text-sm transition-all"
                placeholder="Agence Dupont Immobilier"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-[13px] font-medium text-zinc-300 mb-1.5">
                Votre nom
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-ink-850 border border-line rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 focus:bg-ink-900 text-sm transition-all"
                placeholder="Jean Dupont"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-zinc-300 mb-1.5">
                Email professionnel
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-ink-850 border border-line rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 focus:bg-ink-900 text-sm transition-all"
                placeholder="jean@agence.fr"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[13px] font-medium text-zinc-300 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-11 bg-ink-850 border border-line rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 focus:bg-ink-900 text-sm transition-all"
                  placeholder="8 caractères minimum"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="promoCode" className="block text-[13px] font-medium text-zinc-300 mb-1.5">
                Code d&apos;invitation <span className="text-zinc-600 font-normal">(optionnel)</span>
              </label>
              <input
                id="promoCode"
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-ink-850 border border-line rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 focus:bg-ink-900 text-sm font-mono tracking-widest transition-all"
                placeholder="XXXXXXXX"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-brand hover:bg-brand-hover text-white font-medium rounded-lg text-sm transition-all hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed mt-1 flex items-center justify-center gap-2"
            >
              {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
              {loading ? "Création en cours..." : "Créer mon compte →"}
            </button>

            <p className="text-center text-[13px] text-zinc-500 pt-2">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-brand-hover hover:text-indigo-300 font-medium">
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
