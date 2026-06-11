import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">ImmoMail</span>
          <nav className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Tarifs
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Essai gratuit
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Agent IA pour agences immobilières
          </div>

          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
            L&apos;IA email conçue pour les{" "}
            <span className="text-blue-600">agences immobilières</span>
          </h1>

          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            ImmoMail classe automatiquement vos emails, génère des brouillons de réponse
            professionnels et libère vos agents de la gestion chronophage des emails.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Essai gratuit 14 jours
            </Link>
            <Link
              href="/pricing"
              className="text-gray-600 px-8 py-3.5 rounded-xl text-base font-medium hover:text-gray-900 transition-colors"
            >
              Voir les tarifs →
            </Link>
          </div>

          <p className="text-sm text-gray-400 mt-6">
            Sans carte bancaire · 14 jours d&apos;essai · Annulation à tout moment
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 text-left">
            <div className="p-6 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Classification automatique</h3>
              <p className="text-sm text-gray-500">
                Leads achat, location, demandes de visite, locataires — chaque email est classifié en quelques secondes.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Brouillons intelligents</h3>
              <p className="text-sm text-gray-500">
                Des réponses professionnelles générées automatiquement, dans le ton de votre agence, à valider en un clic.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Réponses automatiques</h3>
              <p className="text-sm text-gray-500">
                Pour les leads qualifiés avec haute confiance, l&apos;IA répond directement et vous notifie.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-400">
          © 2024 ImmoMail · Conçu pour les agences immobilières françaises
        </div>
      </footer>
    </div>
  )
}
