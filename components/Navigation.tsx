"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/worlds", label: "Worlds" },
  { href: "/lesson", label: "Lesson" },
  { href: "/challenge", label: "Challenge" },
  { href: "/profile", label: "Profile" },
];

export function Navigation() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isNavActive = (href: string) =>
    pathname === href ||
    (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <nav className="mx-auto mb-5 w-full max-w-7xl px-3 pt-3 sm:mb-8 sm:px-6 sm:pt-5" aria-label="Primary navigation">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-xl shadow-cyan-950/20 backdrop-blur">
        <div className="flex h-14 min-w-0 items-center justify-between gap-3 px-3 sm:px-4">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-white/10"
            aria-label="YazkUp home"
          >
            <BrandLogo />
          </Link>

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
                      ? "bg-cyan-400 text-slate-950 shadow-sm shadow-cyan-950/20"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2">
            <ThemeToggle />
            <AuthActions
              isLoaded={isLoaded}
              isSignedIn={Boolean(isSignedIn)}
              pathname={pathname}
            />
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-900/70 text-slate-200 transition hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 lg:hidden"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              <span className="sr-only">
                {isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
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
          className={`border-t border-white/10 px-3 transition lg:hidden ${
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
                      ? "bg-cyan-400 text-slate-950"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
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
};

function AuthActions({ isLoaded, isSignedIn, pathname }: AuthActionsProps) {
  if (!isLoaded) {
    return (
      <span
        className="h-9 w-9 animate-pulse rounded-full border border-white/10 bg-slate-900/70"
        aria-hidden="true"
      />
    );
  }

  if (isSignedIn) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-900/70">
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
    "border-white/10 bg-slate-900/70 text-slate-200 hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-white";
  const activeClass = "border-cyan-400 bg-cyan-400 text-slate-950";

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href="/login"
        aria-current={pathname.startsWith("/login") ? "page" : undefined}
        className={`${authLinkClass} ${
          pathname.startsWith("/login") ? activeClass : inactiveClass
        }`}
      >
        Login
      </Link>
      <Link
        href="/signup"
        aria-current={pathname.startsWith("/signup") ? "page" : undefined}
        className={`${authLinkClass} ${
          pathname.startsWith("/signup") ? activeClass : inactiveClass
        }`}
      >
        Sign up
      </Link>
    </div>
  );
}
