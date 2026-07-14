import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { isPremium } from "@/lib/plan";
import { categoryFromBirthYear } from "@/lib/categories";
import { divisionLabel } from "@/lib/profile";
import { goalLabel, positionLabel, DAYS_FR } from "@/lib/constants";
import { Card } from "@/components/ui";
import { ManageSubscriptionButton } from "@/components/CheckoutButtons";
import { SignOutButton, DeleteAccountButton } from "@/components/AccountButtons";
import { PushToggle } from "@/components/PushToggle";

export const dynamic = "force-dynamic";

export default async function ReglagesPage() {
  const user = await currentUser();
  if (!user || !user.profile) return null;
  const p = user.profile;
  const premium = isPremium(user);

  return (
    <div>
      <h1 className="mb-4 font-condensed text-3xl font-bold uppercase">Réglages</h1>

      <Card className="mb-4">
        <h2 className="mb-2 font-condensed text-lg font-bold uppercase">Mon profil</h2>
        <dl className="space-y-1 text-sm">
          <Row label="Prénom" value={p.firstName} />
          <Row label="Catégorie" value={categoryFromBirthYear(p.birthYear)} />
          <Row label="Poste" value={positionLabel(p.position)} />
          <Row label="Niveau" value={divisionLabel(p)} />
          <Row label="Gabarit" value={`${p.heightCm} cm · ${p.weightKg} kg`} />
          <Row
            label="Club"
            value={`${p.clubTrainingsPerWeek} entraînement(s)/sem${
              p.matchDay !== null ? ` · match le ${DAYS_FR[p.matchDay].toLowerCase()}` : ""
            }`}
          />
          <Row label="Objectif" value={goalLabel(p.goal)} />
          <Row label="Point faible" value={p.weakness || "—"} />
        </dl>
        <Link
          href="/onboarding?edit=1"
          className="mt-3 inline-block text-sm font-semibold text-glow underline"
        >
          Modifier mon profil (regénère le programme)
        </Link>
      </Card>

      <Card className="mb-4">
        <h2 className="mb-2 font-condensed text-lg font-bold uppercase">Abonnement</h2>
        <p className="mb-3 text-sm text-muted">
          {premium ? "Premium actif. Résiliation en 1 clic via le portail." : "Plan gratuit."}
        </p>
        {premium ? (
          <ManageSubscriptionButton />
        ) : (
          <Link href="/premium" className="text-sm font-semibold text-glow underline">
            Passer Premium
          </Link>
        )}
      </Card>

      <Card className="mb-4">
        <h2 className="mb-2 font-condensed text-lg font-bold uppercase">Notifications</h2>
        <p className="mb-3 text-sm text-muted">
          Un e-mail le jour de chaque séance et quand ta nouvelle semaine est prête. Active aussi
          les notifications push pour un rappel direct sur ton téléphone.
        </p>
        <PushToggle vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null} />
      </Card>

      <Card>
        <h2 className="mb-3 font-condensed text-lg font-bold uppercase">Compte</h2>
        <p className="mb-3 text-sm text-muted">{user.email}</p>
        <div className="flex flex-wrap gap-3">
          <SignOutButton />
          <DeleteAccountButton />
        </div>
      </Card>

      <p className="mt-6 text-center text-xs text-muted">
        <Link href="/faq" className="underline">FAQ</Link> ·{" "}
        <Link href="/cgu" className="underline">CGU</Link> ·{" "}
        <Link href="/confidentialite" className="underline">Confidentialité</Link>
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
