"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Ré-exécute les Server Components de la page à intervalle régulier — donne
// l'impression du direct sans WebSocket : suffisant pour un tableau de bord
// admin consulté ponctuellement, pas pour du temps réel pixel par pixel.
export function AutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
