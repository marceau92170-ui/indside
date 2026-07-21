import Link from "next/link";
import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-card border border-line bg-surface p-4 ${className}`}>
      {children}
    </div>
  );
}

const btnBase =
  "inline-flex select-none items-center justify-center gap-2 rounded-xl font-condensed font-bold uppercase tracking-wide transition-all duration-150 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/50 focus-visible:ring-offset-2 focus-visible:ring-offset-night disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100";

const btnVariants = {
  primary:
    "bg-glow text-white shadow-lg shadow-glow/25 hover:bg-[#f13d4d] hover:shadow-glow/40 hover:-translate-y-px active:bg-[#c22230] active:shadow-md",
  ghost:
    "border border-line bg-surface/40 text-chalk hover:border-glow hover:bg-glow/5 hover:text-glow",
  subtle: "bg-line/50 text-chalk hover:bg-line",
} as const;

const btnSizes = {
  md: "px-5 py-3 text-base",
  sm: "px-3.5 py-2 text-sm",
  lg: "px-7 py-4 text-lg",
} as const;

type BtnVariant = keyof typeof btnVariants;
type BtnSize = keyof typeof btnSizes;

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: BtnSize;
}) {
  return (
    <button className={`${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
}: {
  children: ReactNode;
  href: string;
  variant?: BtnVariant;
  size?: BtnSize;
  className?: string;
}) {
  return (
    <Link href={href} className={`${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${className}`}>
      {children}
    </Link>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-line bg-night px-4 py-3 text-chalk placeholder:text-muted focus:border-glow focus:outline-none ${props.className ?? ""}`}
    />
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-condensed text-2xl font-bold uppercase tracking-wide text-chalk">
      {children}
    </h2>
  );
}

export function Tag({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
        active ? "bg-glow text-white" : "bg-line/60 text-muted"
      }`}
    >
      {children}
    </span>
  );
}
