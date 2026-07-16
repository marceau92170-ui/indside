"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function GenerateProgramButton({
  label,
  variant = "primary",
}: {
  label: string;
  variant?: "primary" | "link";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/program/generate", { method: "POST" });
    if (res.ok) {
      router.refresh();
      setLoading(false);
    } else if (res.status === 429) {
      const data = await res.json().catch(() => null);
      setError(data?.message ?? "Réessaie un peu plus tard.");
      setLoading(false);
    } else {
      setError("Échec, réessaie dans un instant.");
      setLoading(false);
    }
  }

  if (variant === "link") {
    return (
      <span>
        <button
          onClick={generate}
          disabled={loading}
          className="text-sm text-muted underline disabled:opacity-60"
        >
          {loading ? "Régénération…" : label}
        </button>
        {error && <span className="ml-2 text-xs text-red-400">{error}</span>}
      </span>
    );
  }

  return (
    <div>
      <Button onClick={generate} disabled={loading}>
        {loading ? "Génération…" : label}
      </Button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
