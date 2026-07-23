"use client";

import { useState } from "react";
import { Icon } from "./Icon";

// Petit bouton flottant présent partout dans l'app : n'importe qui
// (abonné ou pas) peut envoyer une idée, un bug, un avis. Le message part par
// email au créateur ET est sauvegardé en base (visible dans l'admin).
export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function send() {
    if (message.trim().length < 3) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          email: email.trim() || undefined,
          page: typeof window !== "undefined" ? window.location.pathname : undefined,
        }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  function close() {
    setOpen(false);
    // petit délai pour ne pas voir le formulaire se vider pendant la fermeture
    setTimeout(() => {
      if (status === "sent") {
        setMessage("");
        setEmail("");
      }
      setStatus("idle");
    }, 200);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Donner mon avis"
        className="fixed bottom-20 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-glow/50 bg-surface text-chalk shadow-lg hover:bg-glow hover:text-night"
      >
        <Icon name="chat" className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-night/80 backdrop-blur-sm sm:items-center"
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-t-2xl border border-line bg-surface p-5 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 className="font-condensed text-xl font-bold uppercase leading-tight">
                Aide-nous à améliorer l&apos;app
              </h2>
              <button
                onClick={close}
                className="text-2xl leading-none text-muted hover:text-chalk"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            {status === "sent" ? (
              <div className="py-6 text-center">
                <p className="font-condensed text-lg font-bold uppercase">Merci pour ton retour !</p>
                <p className="mt-1 text-sm text-muted">
                  Chaque idée compte pour rendre l&apos;app meilleure.
                </p>
                <button
                  onClick={close}
                  className="mt-5 rounded-full bg-glow px-5 py-2 text-sm font-bold text-night"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <p className="mb-3 text-sm text-muted">
                  Une idée, un bug, un truc pas clair ? Dis-nous tout — on lit tout.
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  autoFocus
                  placeholder="Ton message…"
                  className="w-full rounded-lg border border-line bg-night px-3 py-2.5 text-sm text-chalk focus:border-glow focus:outline-none"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ton email (facultatif, si tu veux une réponse)"
                  className="mt-2 w-full rounded-lg border border-line bg-night px-3 py-2.5 text-sm text-chalk focus:border-glow focus:outline-none"
                />
                {status === "error" && (
                  <p className="mt-2 text-xs text-glow">
                    Oups, l&apos;envoi a échoué. Réessaie dans un instant.
                  </p>
                )}
                <button
                  onClick={send}
                  disabled={status === "sending" || message.trim().length < 3}
                  className="mt-4 w-full rounded-full bg-glow px-5 py-2.5 text-sm font-bold text-night disabled:opacity-50"
                >
                  {status === "sending" ? "Envoi…" : "Envoyer mon avis"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
