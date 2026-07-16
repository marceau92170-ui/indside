"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard indisponible */
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-card border border-glow/40 bg-surface p-3">
      <code className="flex-1 overflow-x-auto whitespace-nowrap text-sm text-chalk">{url}</code>
      <button
        onClick={copy}
        className="shrink-0 rounded-full bg-glow px-3 py-1.5 text-xs font-bold text-night"
      >
        {copied ? "Copié ✓" : "Copier"}
      </button>
    </div>
  );
}
