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

  const inputCls = "w-full px-3.5 py-2.5 bg-ink-850 border border-line rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 focus:bg-ink-900 text-sm transition-all"

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 text-white px-6">
      <div className="w-full max-w-sm animate-fade-up">
        <Link href="/login" className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-[0_2px_8px_rgba(99,102,241,0.4)]">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-semibold tracking-tight">ImmoMail</span>
        </Link>

        {step === "email" ? (
          <>
            <h1 className="text-[22px] font-semibold tracking-tight mb-1.5">Mot de passe oublié</h1>
            <p className="text-zinc-400 text-[13.5px] mb-7">Entrez votre email — nous vous envoyons un code à 6 chiffres.</p>
            <form onSubmit={sendCode} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-zinc-300 mb-1.5">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="vous@agence.fr" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white font-medium rounded-lg text-sm transition-all hover:shadow-glow disabled:opacity-50">
                {loading ? "Envoi…" : "Envoyer le code →"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-[22px] font-semibold tracking-tight mb-1.5">Entrez votre code</h1>
            <p className="text-zinc-400 text-[13.5px] mb-7">
              Un code à 6 chiffres a été envoyé à <span className="text-white">{email}</span>. Valable 15 min.
            </p>
            <form onSubmit={resetPassword} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
              )}
              <div>
                <label className="block text-[13px] font-medium text-zinc-300 mb-1.5">Code de vérification</label>
                <input type="text" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className={`${inputCls} font-mono tracking-[0.3em] text-center text-xl`} placeholder="000000" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-zinc-300 mb-1.5">Nouveau mot de passe</label>
                <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-zinc-300 mb-1.5">Confirmer</label>
                <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white font-medium rounded-lg text-sm transition-all hover:shadow-glow disabled:opacity-50">
                {loading ? "Enregistrement…" : "Réinitialiser →"}
              </button>
              <button type="button" onClick={() => { setStep("email"); setError("") }}
                className="w-full text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors">
                ← Changer d&apos;email
              </button>
            </form>
          </>
        )}

        <p className="text-center text-[13px] text-zinc-600 mt-8">
          <Link href="/login" className="text-brand-hover hover:text-indigo-300">← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  )
}
