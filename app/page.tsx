import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/60 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-white font-bold">ImmoMail</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">
              Tarifs
            </Link>
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
              Connexion
            </Link>
            <Link
              href="/register"
              className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 font-medium transition-colors"
            >
              Créer un compte
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 py-24 md:py-32 border-b border-slate-800/60">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-6">
              Pour les agences immobilières françaises
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Traitez vos emails<br />deux fois plus vite.
            </h1>
            <p className="text-lg text-slate-400 mb-10 max-w-xl leading-relaxed">
              ImmoMail se connecte à votre Gmail, classe chaque email entrant et rédige une réponse professionnelle.
              Vous relisez, vous approuvez, vous envoyez.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-indigo-500 transition-colors"
              >
                Créer un compte →
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center text-slate-300 px-6 py-3 rounded-lg text-sm font-medium border border-slate-700 hover:border-slate-500 hover:text-white transition-colors"
              >
                Voir les tarifs
              </Link>
            </div>
            <p className="text-xs text-slate-600 mt-5">Accès sur invitation · Sans engagement</p>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-20 border-b border-slate-800/60">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-12">
              Comment ça marche
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  num: "1",
                  title: "Connectez Gmail",
                  desc: "Autorisez l'accès à votre boîte mail. La connexion est chiffrée, vos tokens ne sont jamais exposés.",
                },
                {
                  num: "2",
                  title: "L'agent classifie et rédige",
                  desc: "Chaque email entrant est analysé (lead, visite, locataire…) et une réponse est générée dans votre ton.",
                },
                {
                  num: "3",
                  title: "Vous validez",
                  desc: "Relisez, modifiez si besoin, puis envoyez. Vous gardez le contrôle total. Rien ne part sans vous.",
                },
              ].map((s) => (
                <div key={s.num} className="flex gap-5">
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0 mt-0.5">
                    {s.num}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">{s.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-20 border-b border-slate-800/60">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-12">
              Ce que ça fait
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                {
                  title: "10 catégories immobilières",
                  desc: "Leads achat/location, demandes de visite, locataires, propriétaires, dossiers, fournisseurs, spam — classés automatiquement.",
                },
                {
                  title: "Réponses dans votre ton",
                  desc: "Vouvoiement ou tutoiement, votre signature, le nom de votre agence — chaque brouillon respecte votre identité.",
                },
                {
                  title: "Règles configurables",
                  desc: "Choisissez ce qui part automatiquement, ce qui attend votre validation, et ce qui est simplement classé.",
                },
                {
                  title: "Humain en dernier recours",
                  desc: "Les engagements — prix, rendez-vous, disponibilité — ne partent jamais sans votre validation. C'est une règle non négociable.",
                },
                {
                  title: "Portails immobiliers reconnus",
                  desc: "SeLoger, Leboncoin, BienIci, LogicImmo, PAP — les leads des portails sont identifiés et traités en priorité.",
                },
                {
                  title: "Suivi de l'activité",
                  desc: "Volume traité, leads détectés, temps économisé — un tableau de bord clair pour piloter votre agence.",
                },
              ].map((f) => (
                <div key={f.title} className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                  <h3 className="text-white font-semibold text-sm mb-1.5">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-24">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-3">
              Prêt à gagner du temps ?
            </h2>
            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
              Rejoignez les agences qui utilisent ImmoMail pour traiter leurs emails plus vite, sans sacrifier la qualité de leurs réponses.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-indigo-500 transition-colors"
            >
              Créer un compte →
            </Link>
            <p className="text-xs text-slate-600 mt-4">Accès sur code d&apos;invitation</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 px-6 py-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span>ImmoMail · Conçu pour les agences immobilières françaises</span>
          </div>
          <Link href="/confidentialite" className="hover:text-slate-400 underline underline-offset-2">
            Politique de confidentialité
          </Link>
        </div>
      </footer>
    </div>
  )
}
