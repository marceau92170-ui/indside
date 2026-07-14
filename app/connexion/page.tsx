import Link from "next/link";
import { googleEnabled } from "@/lib/auth";
import { ConnexionForm } from "@/components/ConnexionForm";

export default function ConnexionPage() {
  return (
    <main className="pitch-bg flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center font-display text-3xl tracking-wider text-chalk">
          PROGRESSA
        </Link>
        <ConnexionForm googleEnabled={googleEnabled} />
        <p className="mt-4 text-center text-xs text-muted">
          Première fois ? Ton compte se crée tout seul à la première connexion.
        </p>
      </div>
    </main>
  );
}
