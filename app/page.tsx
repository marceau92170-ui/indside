import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">ImmoMail</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
              Tarifs
            </Link>
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
              Connexion
            </Link>
            <Link
              href="/register"
              className="text-sm bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-sm"
            >
              Créer un compte →
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-3xl rounded-full pointer-events-none"></div>

          <div className="relative max-w-5xl mx-auto px-6 py-32 text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold px-4 py-2 rounded-full mb-8 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
              Agent IA pour agences immobilières françaises
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
              Votre assistant email
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                intelligent pour l&apos;immobilier
              </span>
            </h1>

            <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              ImmoMail connecte votre boîte Gmail, classe chaque email entrant et rédige une réponse professionnelle —
              vous n&apos;avez plus qu&apos;à valider.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 w-full sm:w-auto"
              >
                Créer un compte
              </Link>
              <Link
                href="/pricing"
                className="text-slate-300 hover:text-white px-8 py-4 rounded-xl text-base font-medium transition-colors border border-slate-700 hover:border-slate-500 w-full sm:w-auto"
              >
                Voir les tarifs
              </Link>
            </div>

            <p className="text-sm text-slate-600 mt-6">
              Accès sur invitation · Contactez-nous pour un accès
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-lg mx-auto border-t border-slate-800 pt-10">
              <div>
                <div className="text-3xl font-bold text-white">3 min</div>
                <div className="text-sm text-slate-500 mt-1">économisées par email</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">10</div>
                <div className="text-sm text-slate-500 mt-1">catégories détectées</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">85%</div>
                <div className="text-sm text-slate-500 mt-1">de précision IA</div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Trois étapes simples pour ne plus jamais perdre de temps sur vos emails.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: (
                    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  ),
                  title: "Connectez Gmail",
                  desc: "Autorisez ImmoMail à accéder à votre boîte mail en quelques secondes. Vos données restent privées et chiffrées.",
                },
                {
                  step: "02",
                  icon: (
                    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  ),
                  title: "L'IA classe et rédige",
                  desc: "Chaque email entrant est analysé, classifié (lead, visite, locataire…) et une réponse professionnelle est générée.",
                },
                {
                  step: "03",
                  icon: (
                    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: "Vous validez en un clic",
                  desc: "Relisez, modifiez si besoin, et envoyez. Vous gardez le contrôle total sur chaque réponse engageante.",
                },
              ].map((item) => (
                <div key={item.step} className="relative p-8 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="absolute top-6 right-6 text-4xl font-black text-gray-100">{item.step}</div>
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-5">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 px-6 bg-slate-950 text-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Tout ce dont votre agence a besoin</h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Conçu spécifiquement pour les agences immobilières françaises.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "10 catégories immobilières", desc: "Leads achat/location, demandes de visite, locataires, propriétaires, dossiers, fournisseurs, spam…", color: "indigo" },
                { title: "Brouillons dans votre ton", desc: "Paramétrez le vouvoiement/tutoiement et la signature — chaque réponse respecte l'identité de votre agence.", color: "blue" },
                { title: "Règles d'automatisation", desc: "Choisissez ce qui part automatiquement, ce qui attend validation, et ce qui est simplement classé.", color: "violet" },
                { title: "Sécurité humain-in-the-loop", desc: "Les engagements (prix, RDV, disponibilité) ne partent JAMAIS sans votre validation. Toujours.", color: "emerald" },
                { title: "Portails reconnus", desc: "SeLoger, Leboncoin, BienIci, LogicImmo, PAP — les leads des portails sont identifiés automatiquement.", color: "orange" },
                { title: "Quota et statistiques", desc: "Suivez le nombre d'emails traités, les leads entrants, le temps économisé chaque semaine.", color: "pink" },
              ].map((f) => (
                <div key={f.title} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
                  <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Prêt à gagner du temps ?
            </h2>
            <p className="text-gray-500 mb-8 text-lg">
              Rejoignez les agences qui utilisent ImmoMail pour traiter leurs emails 3x plus vite.
            </p>
            <Link
              href="/register"
              className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-xl text-base font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
            >
              Créer un compte →
            </Link>
            <p className="text-sm text-gray-400 mt-4">Accès sur code d&apos;invitation</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-slate-400 font-medium">ImmoMail</span>
            <span>· Conçu pour les agences immobilières françaises</span>
          </div>
          <Link href="/confidentialite" className="hover:text-slate-300 underline underline-offset-2">
            Politique de confidentialité
          </Link>
        </div>
      </footer>
    </div>
  )
}
