import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/semaine", label: "Semaine", emoji: "📅" },
  { href: "/bibliotheque", label: "Exos", emoji: "⚽" },
  { href: "/tests", label: "Tests", emoji: "📊" },
  { href: "/profil", label: "Profil", emoji: "🎴" },
  { href: "/reglages", label: "Réglages", emoji: "⚙️" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/connexion");
  if (!user.profile) redirect("/onboarding");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col">
      <header className="flex items-center justify-between px-4 pb-2 pt-4">
        <Link href="/semaine" className="font-display text-xl tracking-wider text-chalk">
          PROGRESSA
        </Link>
        <Link
          href="/premium"
          className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted hover:border-glow hover:text-glow"
        >
          {user.plan === "premium" || user.subscription?.status === "active" ? "Premium ✓" : "Passer Premium"}
        </Link>
      </header>

      <main className="flex-1 px-4 pb-24 pt-2">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-stretch justify-between">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold text-muted hover:text-glow"
            >
              <span className="text-lg leading-none">{item.emoji}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
