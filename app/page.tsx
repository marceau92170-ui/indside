import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-ink-950 text-white">

      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-[0_2px_8px_rgba(99,102,241,0.4)]">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-bold text-base tracking-tight">ImmoMail</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Connexion
          </Link>
          <Link href="/pricing" className="text-sm bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-lg font-medium transition-all hover:shadow-glow">
            Voir les tarifs
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-2xl mx-auto w-full relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-[radial-gradient(ellipse,rgba(99,102,241,0.12),transparent_70%)] pointer-events-none" />

        <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 text-brand-hover text-xs font-medium px-3 py-1.5 rounded-full mb-8 relative animate-fade-up">
          <span className="w-1.5 h-1.5 bg-brand-hover rounded-full" />
          Réservé aux agences immobilières
        </div>

        <h1 className="text-4xl md:text-[52px] font-bold leading-[1.1] tracking-tightest mb-6 relative animate-fade-up">
          Votre boîte Gmail.<br />
          <span className="gradient-text">Gérée par l&apos;IA.</span>
        </h1>

        <p className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-lg relative animate-fade-up">
          ImmoMail lit vos emails, les classe et rédige les réponses.
          Vous validez en un clic. Vos clients reçoivent une réponse le jour même.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center relative animate-fade-up">
          <Link
            href="/register"
            className="bg-brand hover:bg-brand-hover text-white px-8 py-3.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-glow"
          >
            Créer mon compte gratuitement
          </Link>
          <Link
            href="/pricing"
            className="border border-line hover:border-line-strong bg-ink-900 text-zinc-300 hover:text-white px-8 py-3.5 rounded-xl text-sm font-medium transition-colors"
          >
            Voir les tarifs
          </Link>
        </div>

        <p className="text-xs text-zinc-600 mt-5 relative">Accès sur invitation · Aucune carte bancaire requise pour commencer</p>

        {/* Product preview (mockup statique) */}
        <div className="mt-16 w-full relative animate-fade-up" aria-hidden="true">
          <div className="absolute inset-x-0 -top-10 h-40 bg-[radial-gradient(ellipse,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />
          <div className="relative rounded-2xl border border-line bg-ink-900 shadow-card-lg overflow-hidden text-left">
            {/* Barre fenêtre */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-line bg-ink-900">
              <span className="w-2.5 h-2.5 rounded-full bg-ink-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-ink-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-ink-800" />
              <span className="ml-3 text-[11px] text-zinc-600">app.immomail — Brouillons à valider</span>
            </div>
            {/* Contenu mockup */}
            <div className="p-4 sm:p-5 space-y-2.5">
              {[
                { cat: "Lead achat", catCls: "bg-indigo-500/10 text-indigo-300", subject: "Nouveau contact — Appartement T3 Lyon 3e", status: "Réponse prête", statusCls: "text-emerald-400", dot: "bg-emerald-400" },
                { cat: "Demande de visite", catCls: "bg-amber-500/10 text-amber-400", subject: "Visite appartement rue Garibaldi", status: "À valider", statusCls: "text-amber-400", dot: "bg-amber-400" },
                { cat: "Locataire", catCls: "bg-violet-500/10 text-violet-300", subject: "Problème chauffe-eau — 12 rue des Lilas", status: "À valider", statusCls: "text-amber-400", dot: "bg-amber-400" },
              ].map((r) => (
                <div key={r.subject} className="flex items-center gap-3 rounded-lg border border-line bg-ink-950/60 px-3.5 py-2.5">
                  <span className={`hidden sm:inline-flex text-[10.5px] font-medium px-2 py-[3px] rounded-md shrink-0 ${r.catCls}`}>{r.cat}</span>
                  <span className="text-[12.5px] text-zinc-200 truncate flex-1">{r.subject}</span>
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium shrink-0 ${r.statusCls}`}>
                    <span className={`w-[5px] h-[5px] rounded-full ${r.dot}`} />
                    {r.status}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1.5">
                <span className="text-[11px] text-zinc-600">L&apos;IA a rédigé 3 réponses — relisez et envoyez.</span>
                <span className="inline-flex items-center gap-1.5 bg-brand text-white text-[11px] font-medium px-3 py-1.5 rounded-md">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  Approuver &amp; envoyer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 steps */}
        <div className="mt-20 grid grid-cols-3 gap-6 text-left w-full relative">
          {[
            { num: "1", title: "Connectez Gmail", desc: "2 clics, aucune installation." },
            { num: "2", title: "L'IA classe et rédige", desc: "Lead, visite, locataire… réponse prête en secondes." },
            { num: "3", title: "Vous envoyez", desc: "Vous relisez et cliquez. Rien ne part sans vous." },
          ].map((s) => (
            <div key={s.num} className="flex flex-col gap-3">
              <span className="w-7 h-7 bg-brand/15 text-brand-hover text-xs font-bold rounded-lg flex items-center justify-center">{s.num}</span>
              <h3 className="text-sm font-semibold">{s.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 pt-8 border-t border-line w-full flex flex-col sm:flex-row gap-6 justify-center text-center relative">
          {[
            { value: "< 1h", label: "Temps de réponse moyen" },
            { value: "100%", label: "Contrôle humain conservé" },
            { value: "0€", label: "Pour démarrer" },
          ].map((s) => (
            <div key={s.label} className="flex-1">
              <p className="text-2xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-5 border-t border-line text-center text-xs text-zinc-600">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>ImmoMail · Pour les agences immobilières françaises</span>
          <Link href="/confidentialite" className="hover:text-zinc-400 transition-colors underline underline-offset-2">
            Politique de confidentialité
          </Link>
        </div>
      </footer>
    </div>
  )
}
