import Link from "next/link";
import { LEGAL } from "@/lib/data/legal";

// Pied de page public : liens légaux + contact. Le crawler des vérificateurs de
// confiance (et Google) suit ces liens — ils doivent être présents sur les pages
// publiques (accueil, pages légales).
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line pt-6 text-center text-xs text-muted">
      <p className="mb-2 font-display text-sm tracking-wider text-chalk">PROGRESSA</p>
      <p className="mb-2 flex flex-wrap justify-center gap-x-2 gap-y-1">
        <Link href="/exercices" className="underline">Exercices</Link> ·{" "}
        <Link href="/clubs" className="underline">Clubs</Link> ·{" "}
        <Link href="/faq" className="underline">FAQ</Link> ·{" "}
        <Link href="/mentions-legales" className="underline">Mentions légales</Link> ·{" "}
        <Link href="/cgv" className="underline">CGV</Link> ·{" "}
        <Link href="/cgu" className="underline">CGU</Link> ·{" "}
        <Link href="/confidentialite" className="underline">Confidentialité</Link> ·{" "}
        <Link href="/connexion" className="underline">Connexion</Link>
      </p>
      <p>
        Contact :{" "}
        <a href={`mailto:${LEGAL.contactEmail}`} className="underline">
          {LEGAL.contactEmail}
        </a>
      </p>
    </footer>
  );
}
