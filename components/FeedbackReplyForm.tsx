"use client";

import { useState } from "react";

export function FeedbackReplyForm({
  feedbackId,
  alreadyReplied,
}: {
  feedbackId: string;
  alreadyReplied: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(alreadyReplied);
  const [error, setError] = useState(false);

  async function send() {
    if (!message.trim() || sending) return;
    setSending(true);
    setError(false);
    try {
      const res = await fetch(`/api/admin/feedback/${feedbackId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      if (!res.ok) throw new Error();
      setSent(message.trim());
      setMessage("");
      setOpen(false);
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-3 border-t border-line pt-3">
      {sent && (
        <p className="mb-2 text-xs text-muted">
          <span className="font-semibold text-glow">Répondu</span> : « {sent} »
        </p>
      )}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs font-semibold text-glow underline"
        >
          {sent ? "Renvoyer une réponse" : "Répondre"}
        </button>
      ) : (
        <div className="space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ta réponse (envoyée par e-mail)…"
            rows={3}
            className="w-full rounded-lg border border-line bg-night px-3 py-2 text-sm text-chalk focus:border-glow focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={send}
              disabled={sending || !message.trim()}
              className="rounded-lg bg-glow px-4 py-1.5 text-xs font-bold uppercase text-white disabled:opacity-40"
            >
              {sending ? "Envoi…" : "Envoyer"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError(false);
              }}
              className="text-xs text-muted"
            >
              Annuler
            </button>
            {error && <span className="text-xs text-red-400">Échec de l&apos;envoi, réessaie.</span>}
          </div>
        </div>
      )}
    </div>
  );
}
