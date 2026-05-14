"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSelector, useExplanationLanguage } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getUiText } from "@/lib/ui-translations";

type NavItem = {
  href: string;
  labelKey: keyof ReturnType<typeof getUiText>["nav"];
};

const navItems: NavItem[] = [
  { href: "/", labelKey: "home" },
  { href: "/dashboard", labelKey: "dashboard" },
  { href: "/worlds", labelKey: "worlds" },
  { href: "/lesson", labelKey: "lesson" },
  { href: "/challenge", labelKey: "challenge" },
  { href: "/profile", labelKey: "profile" },
];

export function Navigation() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useUser();
  const { language } = useExplanationLanguage();
  const text = getUiText(language);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isNavActive = (href: string) =>
    pathname === href ||
    (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <nav className="mx-auto mb-5 w-full max-w-7xl px-3 pt-3 sm:mb-8 sm:px-6 sm:pt-5" aria-label="Primary navigation">
      <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl shadow-cyan-950/20 backdrop-blur">
        <div className="flex h-14 min-w-0 items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4">
          <div className="flex min-w-0 items-center">
            <BrandLogo />
          </div>

          <div className="hidden min-w-0 items-center justify-center gap-1 lg:flex">
            {navItems.map((item) => {
              const isActive = isNavActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-full px-3 py-2 text-sm font-semibold transition xl:px-4 ${
                    isActive
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm shadow-cyan-950/20"
                      : "text-[var(--app-text-muted)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-text)]"
                  }`}
                >
                  {text.nav[item.labelKey]}
                </Link>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2">
            <LanguageSelector className="hidden sm:flex" />
            <ThemeToggle />
            <AuthActions
              isLoaded={isLoaded}
              isSignedIn={Boolean(isSignedIn)}
              pathname={pathname}
              signInLabel={text.nav.signIn}
              signUpLabel={text.nav.signUp}
            />
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--app-surface-muted)] text-[var(--app-text-soft)] transition hover:border-[var(--brand-teal)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:ring-offset-2 focus:ring-offset-[var(--background)] lg:hidden"
              aria-label={isMenuOpen ? text.nav.closeMenu : text.nav.openMenu}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              <span className="sr-only">
                {isMenuOpen ? text.nav.closeMenu : text.nav.openMenu}
              </span>
              <span className="flex h-4 w-4 flex-col justify-center gap-1">
                <span
                  className={`h-0.5 rounded-full bg-current transition ${
                    isMenuOpen ? "translate-y-1.5 rotate-45" : ""
                  }`}
                />
                <span
                  className={`h-0.5 rounded-full bg-current transition ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`h-0.5 rounded-full bg-current transition ${
                    isMenuOpen ? "-translate-y-1.5 -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        <div
          id="mobile-navigation"
          className={`border-t border-[var(--card-border)] px-3 transition lg:hidden ${
            isMenuOpen
              ? "max-h-96 py-3 opacity-100"
              : "max-h-0 overflow-hidden py-0 opacity-0"
          }`}
        >
          <div className="grid gap-1.5">
            {navItems.map((item) => {
              const isActive = isNavActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setIsMenuOpen(false)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "text-[var(--app-text-muted)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-text)]"
                  }`}
                >
                  {text.nav[item.labelKey]}
                </Link>
              );
            })}
            <div className="mt-2 border-t border-[var(--card-border)] pt-3">
              <LanguageSelector variant="panel" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

type AuthActionsProps = {
  isLoaded: boolean;
  isSignedIn: boolean;
  pathname: string;
  signInLabel: string;
  signUpLabel: string;
};

function AuthActions({
  isLoaded,
  isSignedIn,
  pathname,
  signInLabel,
  signUpLabel,
}: AuthActionsProps) {
  if (!isLoaded) {
    return (
      <span
        className="h-9 w-9 animate-pulse rounded-full border border-[var(--card-border)] bg-[var(--app-surface-muted)]"
        aria-hidden="true"
      />
    );
  }

  if (isSignedIn) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--app-surface-muted)]">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
              userButtonPopoverCard: "shadow-2xl",
            },
          }}
        />
      </div>
    );
  }

  const authLinkClass =
    "rounded-full border px-2.5 py-2 text-xs font-bold leading-none transition sm:px-3";
  const inactiveClass =
    "border-[var(--card-border)] bg-[var(--app-surface-muted)] text-[var(--app-text-soft)] hover:border-[var(--brand-teal)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-text)]";
  const activeClass = "border-[var(--brand-teal)] bg-[var(--primary)] text-[var(--primary-foreground)]";

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href="/login"
        aria-current={pathname.startsWith("/login") ? "page" : undefined}
        className={`${authLinkClass} ${
          pathname.startsWith("/login") ? activeClass : inactiveClass
        }`}
      >
        {signInLabel}
      </Link>
      <Link
        href="/signup"
        aria-current={pathname.startsWith("/signup") ? "page" : undefined}
        className={`${authLinkClass} ${
          pathname.startsWith("/signup") ? activeClass : inactiveClass
        }`}
      >
        {signUpLabel}
      </Link>
    </div>
  );
}
