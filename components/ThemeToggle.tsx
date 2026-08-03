"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

// Bascule instantanée côté client (pas d'attente réseau pour voir l'effet) +
// sauvegarde en base pour que le choix suive le compte sur les prochaines
// visites/appareils. Le data-theme est porté par #app-root (voir (app)/layout.tsx).
export function ThemeToggle({ initial }: { initial: "dark" | "light" }) {
  const [theme, setTheme] = useState<"dark" | "light">(initial);
  const [busy, setBusy] = useState(false);

  async function choose(next: "dark" | "light") {
    if (next === theme || busy) return;
    setBusy(true);
    setTheme(next);
    document.getElementById("app-root")?.setAttribute("data-theme", next);
    try {
      await fetch("/api/account/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: next }),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant={theme === "dark" ? "primary" : "ghost"}
        size="sm"
        onClick={() => choose("dark")}
        disabled={busy}
      >
        Sombre
      </Button>
      <Button
        type="button"
        variant={theme === "light" ? "primary" : "ghost"}
        size="sm"
        onClick={() => choose("light")}
        disabled={busy}
      >
        Clair
      </Button>
    </div>
  );
}
