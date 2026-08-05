"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackClick } from "@/lib/click-track";
import { btnClassName, type BtnVariant, type BtnSize } from "@/components/ui";

// Même rendu que <ButtonLink/>, mais avec le clic remonté en 100% first-party
// (voir /admin/usage) — pour les CTA qu'on veut voir dans le suivi sans passer
// par un composant client dédié à chaque fois.
export function TrackedLink({
  children,
  href,
  label,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: Omit<ComponentProps<typeof Link>, "href" | "className"> & {
  href: string;
  label: string;
  variant?: BtnVariant;
  size?: BtnSize;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={btnClassName(variant, size, className)}
      onClick={() => trackClick(label)}
      {...props}
    >
      {children}
    </Link>
  );
}

// Même principe mais sans le style bouton imposé — pour les liens texte
// (ex: "Lancer la séance guidée") où on veut juste le clic remonté.
export function TrackedTextLink({
  children,
  href,
  label,
  className = "",
  ...props
}: Omit<ComponentProps<typeof Link>, "href" | "className"> & {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link href={href} className={className} onClick={() => trackClick(label)} {...props}>
      {children}
    </Link>
  );
}
