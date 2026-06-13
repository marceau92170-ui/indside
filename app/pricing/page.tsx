import Link from "next/link"
import PricingButtons from "@/components/PricingButtons"

const PLANS = [
  {
    key: "STARTER" as const,
    name: "Starter",
    price: 99,
    tagline: "Pour démarrer",
    features: [
      "1 boîte email connectée",
      "Classification automatique",
      "Brouillons de réponse illimités",
      "500 emails / mois",
      "Support par email",
    ],
    highlighted: false,
  },
  {
    key: "PRO" as const,
    name: "Pro",
    price: 249,
    tagline: "Le plus populaire",
    features: [
      "3 boîtes email connectées",
      "Tout Starter, plus :",
      "Réponses automatiques (liste blanche)",
      "2 000 emails / mois",
      "Statistiques avancées",
    ],
    highlighted: true,
  },
  {
    key: "AGENCY_PLUS" as const,
    name: "Agence+",
    price: 499,
    tagline: "Pour les réseaux",
    features: [
      "Boîtes illimitées",
      "Multi-agences",
      "Emails illimités",
      "Statistiques avancées",
      "Support prioritaire",
    ],
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            ImmoMail
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Connexion
            </Link>
            <Link
              href="/register"
              className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
            >
              Créer un compte
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Des tarifs simples et transparents
            </h1>
            <p className="text-lg text-gray-500">
              Sans engagement. Hébergement des données en Union Européenne.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-7 flex flex-col ${
                  plan.highlighted
                    ? "border-blue-600 shadow-lg ring-1 ring-blue-600"
                    : "border-gray-200"
                }`}
              >
                {plan.highlighted && (
                  <span className="self-start text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-3">
                    {plan.tagline}
                  </span>
                )}
                {!plan.highlighted && (
                  <span className="text-xs font-medium text-gray-400 mb-3">{plan.tagline}</span>
                )}
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <div className="mt-3 mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}€</span>
                  <span className="text-gray-500"> / mois</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <PricingButtons planKey={plan.key} highlighted={plan.highlighted} />
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-10">
            Tous les prix sont hors taxes. Hébergement des données en Union Européenne.{" "}
            <Link href="/confidentialite" className="underline hover:text-gray-600">
              Politique de confidentialité
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
