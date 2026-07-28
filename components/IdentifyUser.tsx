"use client";

import { useEffect, useRef } from "react";
import { identifyUser } from "@/lib/analytics";

// Relie les événements PostHog au compte réel (identifiant interne, jamais
// l'e-mail). Sans ça, tout le funnel gratuit → Premium reste anonyme par
// session et impossible à recouper d'une visite à l'autre.
export function IdentifyUser({ id }: { id: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    identifyUser(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
