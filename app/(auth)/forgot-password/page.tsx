"use client"

import { useState, FormEvent } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setDone(true)
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

        {done ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
            <p className="text-emerald-400 font-semibold mb-2">Email envoyé</p>
            <p className="text-sm text-slate-400">
              Si un compte existe pour cette adresse, vous recevrez un lien de réinitialisation valable 1 heure.
            </p>
            <Link href="/login" className="inline-block mt-5 text-sm text-indigo-400 hover:text-indigo-300">
              ← Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-1">Mot de passe oublié</h1>
            <p className="text-slate-400 text-sm mb-8">
              Entrez votre email et nous vous enverrons un lien de réinitialisation.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="vous@agence.fr"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {loading ? "Envoi…" : "Envoyer le lien →"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
                ← Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
