"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

// Émet un événement PostHog une seule fois au montage — pour instrumenter une
// page serveur (RSC) sans devoir la transformer en composant client. Ne rend rien.
export function TrackOnView({
  event,
  properties,
}: {
  event: string;
  properties?: Record<string, unknown>;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, properties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
