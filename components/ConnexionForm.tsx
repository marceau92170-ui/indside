"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button, Card, Input } from "@/components/ui";

export function ConnexionForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("email", { email, redirect: false, callbackUrl: "/semaine" });
    setLoading(false);
    if (res?.error) setError("Impossible d'envoyer le lien. Vérifie ton adresse.");
    else setSent(true);
  }

  function google() {
    setGoogleLoading(true);
    signIn("google", { callbackUrl: "/semaine" });
  }

  if (sent) {
    return (
      <Card className="p-6 text-center">
        <p className="mb-2 text-4xl">📬</p>
        <h1 className="mb-2 font-condensed text-2xl font-bold uppercase">Vérifie tes mails</h1>
        <p className="text-muted">
          On t&apos;a envoyé un lien de connexion à <span className="text-chalk">{email}</span>. Pas
          de mot de passe à retenir.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h1 className="mb-1 font-condensed text-2xl font-bold uppercase">On commence 💪</h1>
      <p className="mb-6 text-sm text-muted">
        Ton compte se crée en un geste, sans mot de passe. C&apos;est gratuit, aucune carte
        demandée — juste ton email pour retrouver ton programme.
      </p>

      {googleEnabled && (
        <>
          <button
            onClick={google}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-card border border-line bg-chalk px-4 py-3 font-semibold text-night transition-colors hover:bg-white disabled:opacity-60"
          >
            <GoogleIcon />
            {googleLoading ? "Connexion…" : "Continuer avec Google"}
          </button>
          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            ou par e-mail
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      <form onSubmit={submit} className="space-y-4">
        <Input
          type="email"
          required
          placeholder="ton@email.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Envoi..." : "Recevoir mon lien"}
        </Button>
      </form>
    </Card>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
