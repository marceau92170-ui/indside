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
    <div className="min-h-screen flex flex-col bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-white font-bold">ImmoMail</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
              Connexion
            </Link>
            <Link href="/register" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 font-medium transition-colors">
              Créer un compte
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h1 className="text-4xl font-bold text-white mb-4">Tarifs simples et transparents</h1>
            <p className="text-slate-400 text-lg">Sans engagement · Hébergement EU · Données sécurisées</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-7 flex flex-col ${
                  plan.highlighted
                    ? "border-indigo-500/50 bg-indigo-500/5"
                    : "border-slate-800 bg-slate-900"
                }`}
              >
                {plan.highlighted && (
                  <span className="self-start text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-3">
                    {plan.tagline}
                  </span>
                )}
                {!plan.highlighted && (
                  <span className="text-xs font-medium text-slate-500 mb-3">{plan.tagline}</span>
                )}
                <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                <div className="mt-3 mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}€</span>
                  <span className="text-slate-500"> / mois</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                      <svg className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <PricingButtons planKey={plan.key} highlighted={plan.highlighted} />
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-600 mt-10">
            Tous les prix sont hors taxes. Hébergement des données en Union Européenne.{" "}
            <Link href="/confidentialite" className="underline hover:text-slate-400">
              Politique de confidentialité
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
