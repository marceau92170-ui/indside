"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Enregistre chaque page visitée dans l'app (une fois connecté), en 100%
// first-party — voir /admin/usage. Fire-and-forget : ne doit jamais bloquer
// ni faire échouer la navigation du joueur.
export function PageViewTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return;
    lastSent.current = pathname;
    fetch("/api/track/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {
      // non bloquant
    });
  }, [pathname]);

  return null;
}
