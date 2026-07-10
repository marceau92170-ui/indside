import Link from "next/link";
import { Card } from "@/components/ui";

export default function VerifierPage() {
  return (
    <main className="pitch-bg flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center font-display text-3xl tracking-wider text-chalk">
          PROGRESSA
        </Link>
        <Card className="p-6 text-center">
          <p className="mb-2 text-4xl">📬</p>
          <h1 className="mb-2 font-condensed text-2xl font-bold uppercase">Vérifie tes mails</h1>
          <p className="text-muted">
            Ton lien de connexion est parti. Clique dessus depuis ton téléphone, tu arrives direct
            sur ta semaine.
          </p>
        </Card>
      </div>
    </main>
  );
}
