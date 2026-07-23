"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

// Barre de navigation basse, façon appli de sport pro :
// pictos « ligne » monochromes + onglet actif surligné en rouge (pas d'emoji).
const NAV = [
  { href: "/semaine", label: "Semaine", icon: "calendar" as const },
  { href: "/bibliotheque", label: "Exos", icon: "dumbbell" as const },
  { href: "/tests", label: "Tests", icon: "chart" as const },
  { href: "/profil", label: "Profil", icon: "player" as const },
  { href: "/reglages", label: "Réglages", icon: "settings" as const },
];

export function AppNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-stretch justify-between">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                active ? "text-glow" : "text-muted hover:text-chalk"
              }`}
            >
              {active && (
                <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-glow" />
              )}
              <Icon name={item.icon} className="h-[22px] w-[22px]" strokeWidth={active ? 2.1 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
