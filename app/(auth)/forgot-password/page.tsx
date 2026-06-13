"use client"

import { useState, FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "code">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function sendCode(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setStep("code")
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword(e: FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas"); return }
    if (password.length < 8) { setError("Au moins 8 caractères requis"); return }
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: code, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Code invalide ou expiré"); return }
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md">
        <Link href="/login" className="flex items-center gap-2 mb-10">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-white font-bold">ImmoMail</span>
        </Link>

        {step === "email" ? (
          <>
            <h1 className="text-2xl font-bold text-white mb-1">Mot de passe oublié</h1>
            <p className="text-slate-400 text-sm mb-8">Entrez votre email — nous vous envoyons un code à 6 chiffres.</p>
            <form onSubmit={sendCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="vous@agence.fr"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50">
                {loading ? "Envoi…" : "Envoyer le code →"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-1">Entrez votre code</h1>
            <p className="text-slate-400 text-sm mb-8">
              Un code à 6 chiffres a été envoyé à <span className="text-white">{email}</span>. Valable 15 min.
            </p>
            <form onSubmit={resetPassword} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Code de vérification</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono tracking-widest text-center text-xl"
                  placeholder="000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirmer</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50">
                {loading ? "Enregistrement…" : "Réinitialiser →"}
              </button>
              <button type="button" onClick={() => { setStep("email"); setError("") }}
                className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors">
                ← Changer d&apos;email
              </button>
            </form>
          </>
        )}

        <p className="text-center text-sm text-slate-600 mt-8">
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300">← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  )
}
