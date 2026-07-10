"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui";

export function SignOutButton() {
  return (
    <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
      Me déconnecter
    </Button>
  );
}

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function deleteAccount() {
    setLoading(true);
    const res = await fetch("/api/account/delete", { method: "POST" });
    if (res.ok) {
      await signOut({ callbackUrl: "/" });
    } else {
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setConfirming(true)} className="!border-red-900 !text-red-400">
        Supprimer mon compte
      </Button>
    );
  }

  return (
    <div className="w-full rounded-lg border border-red-900 p-3">
      <p className="mb-2 text-sm">
        Toutes tes données (profil, programmes, tests, badges) seront supprimées définitivement.
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
          Annuler
        </Button>
        <Button size="sm" onClick={deleteAccount} disabled={loading} className="!bg-red-500 !text-white">
          {loading ? "Suppression…" : "Confirmer la suppression"}
        </Button>
      </div>
    </div>
  );
}
