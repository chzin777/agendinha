"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Calendar as CalendarIcon, CalendarDays, NotebookPen, Plus } from "lucide-react";
import { GoldenButton } from "@/components/GoldenButton";
import { SignOutButton } from "@/components/SignOutButton";

export type AppSection = "agenda" | "cadernos";

interface AppShellProps {
  active: AppSection;
  children: ReactNode;
  /** Primary action: floating button on mobile, gold button on desktop */
  fab?: { label: string; onClick: () => void };
  /** Replaces the brand block with a back link + title (inner screens) */
  back?: { href?: string; onClick?: () => void; title: ReactNode; subtitle?: ReactNode };
  /** Extra buttons on the right of the top bar */
  actions?: ReactNode;
  /** Hide the bottom navigation (e.g. full-screen editor on mobile) */
  hideBottomNav?: boolean;
}

const SECTIONS: { id: AppSection; href: string; label: string; icon: typeof CalendarDays }[] = [
  { id: "agenda", href: "/", label: "Agenda", icon: CalendarDays },
  { id: "cadernos", href: "/cadernos", label: "Cadernos", icon: NotebookPen },
];

export function AppShell({ active, children, fab, back, actions, hideBottomNav }: AppShellProps) {
  const backClass =
    "-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted active:bg-muted";

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16">
          {back ? (
            <div className="flex min-w-0 items-center gap-1.5">
              {back.href ? (
                <Link href={back.href} aria-label="Voltar" className={backClass}>
                  <ArrowLeft size={20} />
                </Link>
              ) : (
                <button type="button" onClick={back.onClick} aria-label="Voltar" className={backClass}>
                  <ArrowLeft size={20} />
                </button>
              )}
              <div className="min-w-0 leading-tight">
                <h1 className="truncate text-base font-bold tracking-tight text-foreground sm:text-lg">{back.title}</h1>
                {back.subtitle && <p className="truncate text-[11px] text-muted-foreground sm:text-xs">{back.subtitle}</p>}
              </div>
            </div>
          ) : (
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm sm:h-10 sm:w-10">
                <CalendarIcon size={19} />
              </div>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-lg font-bold tracking-tight text-foreground sm:text-xl">Agendinha</p>
                <p className="truncate text-[11px] text-muted-foreground sm:text-xs">Sua agenda acadêmica</p>
              </div>
            </Link>
          )}

          <nav className="hidden items-center gap-1 rounded-full border border-border bg-background/60 p-1 lg:flex" aria-label="Seções">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = s.id === active;
              return (
                <Link
                  key={s.id}
                  href={s.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={16} />
                  {s.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            {actions}
            <SignOutButton />
            {fab && (
              <div className="hidden lg:block">
                <GoldenButton onClick={fab.onClick}>
                  <Plus size={16} />
                  {fab.label}
                </GoldenButton>
              </div>
            )}
          </div>
        </div>
      </header>

      <main
        className={`mx-auto max-w-6xl px-3 pt-4 sm:px-4 lg:pb-12 lg:pt-8 ${
          hideBottomNav ? "pb-[calc(1.5rem+env(safe-area-inset-bottom))]" : "pb-[calc(6.5rem+env(safe-area-inset-bottom))]"
        }`}
      >
        {children}
      </main>

      {!hideBottomNav && (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
          aria-label="Navegação"
        >
          <div className="mx-auto grid h-16 max-w-md grid-cols-3 items-center">
            {[SECTIONS[0], null, SECTIONS[1]].map((s) => {
              if (!s) {
                return (
                  <div key="fab" className="flex justify-center">
                    {fab && (
                      <GoldenButton
                        onClick={fab.onClick}
                        aria-label={fab.label}
                        className="!h-14 !w-14 -translate-y-4 !rounded-full !p-0 shadow-lg"
                      >
                        <Plus size={26} />
                      </GoldenButton>
                    )}
                  </div>
                );
              }
              const Icon = s.icon;
              const isActive = s.id === active;
              return (
                <Link
                  key={s.id}
                  href={s.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                  {s.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

/** Two-option pill switch used inside screens (e.g. Calendário / Próximos, Grade / Lista) */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className = "",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: typeof CalendarDays; badge?: number; iconOnly?: boolean }[];
  className?: string;
}) {
  return (
    <div className={`flex rounded-full border border-border bg-card p-1 shadow-sm ${className}`} role="tablist">
      {options.map((o) => {
        const Icon = o.icon;
        const isActive = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={o.label}
            onClick={() => onChange(o.value)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {Icon && <Icon size={16} />}
            <span className={o.iconOnly ? "sr-only" : ""}>{o.label}</span>
            {!!o.badge && (
              <span
                className={`rounded-full px-1.5 text-[10px] font-bold leading-4 ${
                  isActive ? "bg-primary-foreground/25 text-primary-foreground" : "bg-accent-marsala text-accent-marsala-foreground"
                }`}
              >
                {o.badge > 9 ? "9+" : o.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
