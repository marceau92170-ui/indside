"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button, Card, Input } from "@/components/ui";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
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

  return (
    <main className="pitch-bg flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center font-display text-3xl tracking-wider text-chalk">
          PROGRESSA
        </Link>
        <Card className="p-6">
          {sent ? (
            <div className="text-center">
              <p className="mb-2 text-4xl">📬</p>
              <h1 className="mb-2 font-condensed text-2xl font-bold uppercase">Vérifie tes mails</h1>
              <p className="text-muted">
                On t&apos;a envoyé un lien de connexion à <span className="text-chalk">{email}</span>.
                Pas de mot de passe à retenir.
              </p>
            </div>
          ) : (
            <>
              <h1 className="mb-1 font-condensed text-2xl font-bold uppercase">Connexion</h1>
              <p className="mb-6 text-sm text-muted">
                Entre ton e-mail, on t&apos;envoie un lien. Zéro mot de passe.
              </p>
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
            </>
          )}
        </Card>
        <p className="mt-4 text-center text-xs text-muted">
          Première fois ? Le lien crée ton compte automatiquement.
        </p>
      </div>
    </main>
  );
}
