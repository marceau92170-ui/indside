import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">

      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-bold text-base">ImmoMail</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
            Connexion
          </Link>
          <Link href="/pricing" className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Voir les tarifs
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-2xl mx-auto w-full">

        <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
          Réservé aux agences immobilières
        </div>

        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          Votre boîte Gmail.<br />
          <span className="text-indigo-400">Gérée par l&apos;IA.</span>
        </h1>

        <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg">
          ImmoMail lit vos emails, les classe et rédige les réponses.
          Vous validez en un clic. Vos clients reçoivent une réponse le jour même.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
          <Link
            href="/register"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Créer mon compte gratuitement
          </Link>
          <Link
            href="/pricing"
            className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-3.5 rounded-xl text-sm font-medium transition-colors"
          >
            Voir les tarifs
          </Link>
        </div>

        <p className="text-xs text-slate-600 mt-5">Accès sur invitation · Aucune carte bancaire requise pour commencer</p>

        {/* 3 steps */}
        <div className="mt-20 grid grid-cols-3 gap-6 text-left w-full">
          {[
            { num: "1", title: "Connectez Gmail", desc: "2 clics, aucune installation." },
            { num: "2", title: "L'IA classe et rédige", desc: "Lead, visite, locataire… réponse prête en secondes." },
            { num: "3", title: "Vous envoyez", desc: "Vous relisez et cliquez. Rien ne part sans vous." },
          ].map((s) => (
            <div key={s.num} className="flex flex-col gap-3">
              <span className="w-7 h-7 bg-indigo-600/20 text-indigo-400 text-xs font-bold rounded-lg flex items-center justify-center">{s.num}</span>
              <h3 className="text-sm font-semibold text-white">{s.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Social proof placeholder */}
        <div className="mt-16 pt-8 border-t border-slate-800/60 w-full flex flex-col sm:flex-row gap-6 justify-center text-center">
          {[
            { value: "< 1h", label: "Temps de réponse moyen" },
            { value: "100%", label: "Contrôle humain conservé" },
            { value: "0€", label: "Pour démarrer" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-5 border-t border-slate-800/60 text-center text-xs text-slate-600">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>ImmoMail · Pour les agences immobilières françaises</span>
          <Link href="/confidentialite" className="hover:text-slate-400 transition-colors underline underline-offset-2">
            Politique de confidentialité
          </Link>
        </div>
      </footer>
    </div>
  )
}
