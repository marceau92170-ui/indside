"use client"

import { useState, FormEvent, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") ?? ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas"); return }
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Erreur"); return }
      setDone(true)
      setTimeout(() => router.push("/login"), 2000)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full px-3.5 py-2.5 bg-ink-850 border border-line rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 focus:bg-ink-900 text-sm transition-all"

  if (!token) return (
    <div className="text-center">
      <p className="text-red-400 text-sm">Lien invalide.</p>
      <Link href="/forgot-password" className="text-brand-hover text-sm mt-3 inline-block">Faire une nouvelle demande →</Link>
    </div>
  )

  if (done) return (
    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
      <p className="text-emerald-400 font-semibold mb-2">Mot de passe mis à jour</p>
      <p className="text-sm text-zinc-400">Redirection vers la connexion…</p>
    </div>
  )

  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-tight mb-1.5">Nouveau mot de passe</h1>
      <p className="text-zinc-400 text-[13.5px] mb-7">Choisissez un mot de passe d&apos;au moins 8 caractères.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-[13px] font-medium text-zinc-300 mb-1.5">Nouveau mot de passe</label>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-zinc-300 mb-1.5">Confirmer</label>
          <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} placeholder="••••••••" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white font-medium rounded-lg text-sm transition-all hover:shadow-glow disabled:opacity-50"
        >
          {loading ? "Enregistrement…" : "Enregistrer →"}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 text-white px-6">
      <div className="w-full max-w-sm animate-fade-up">
        <Link href="/" className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-[0_2px_8px_rgba(99,102,241,0.4)]">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-semibold tracking-tight">ImmoMail</span>
        </Link>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
