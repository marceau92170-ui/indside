"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function GenerateProgramButton({ label }: { label: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function generate() {
    setLoading(true);
    setError(false);
    const res = await fetch("/api/program/generate", { method: "POST" });
    if (res.ok) {
      router.refresh();
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={generate} disabled={loading}>
        {loading ? "Génération…" : label}
      </Button>
      {error && <p className="mt-2 text-xs text-red-400">Échec, réessaie dans un instant.</p>}
    </div>
  );
}
