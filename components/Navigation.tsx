"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSelector, useExplanationLanguage } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getExplanationDirection } from "@/lib/language-preference";
import { getUiText } from "@/lib/ui-translations";

type NavItem = {
  id: string;
  href: string | ((isSignedIn: boolean) => string);
  labelKey: keyof ReturnType<typeof getUiText>["nav"];
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  isActive: (pathname: string, isSignedIn: boolean) => boolean;
};

const primaryNavItems: NavItem[] = [
  {
    id: "home",
    href: (isSignedIn) => (isSignedIn ? "/dashboard" : "/"),
    labelKey: "home",
    icon: HomeIcon,
    isActive: (pathname, isSignedIn) =>
      isSignedIn ? isRouteActive(pathname, "/dashboard") : pathname === "/",
  },
  {
    id: "start-learning",
    href: "/worlds",
    labelKey: "startLearning",
    icon: StartLearningIcon,
    isActive: (pathname) => isRouteActive(pathname, "/worlds") || isRouteActive(pathname, "/lesson"),
  },
  {
    id: "writing",
    href: "/writing",
    labelKey: "writingPractice",
    icon: WritingPracticeIcon,
    isActive: (pathname) => isRouteActive(pathname, "/writing"),
  },
  {
    id: "profile",
    href: "/profile",
    labelKey: "profile",
    icon: ProfileIcon,
    isActive: (pathname) => isRouteActive(pathname, "/profile"),
  },
  {
    id: "settings",
    href: "/settings",
    labelKey: "settings",
    icon: SettingsIcon,
    isActive: (pathname) => isRouteActive(pathname, "/settings"),
  },
];

export function Navigation() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useUser();
  const { language } = useExplanationLanguage();
  const text = getUiText(language);
  const direction = getExplanationDirection(language);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isSignedInUser = Boolean(isSignedIn);

  return (
    <nav
      className="mx-auto mb-5 w-full max-w-7xl px-3 pt-3 sm:mb-8 sm:px-6 sm:pt-5"
      aria-label="Primary navigation"
      dir={direction}
    >
      <div className="overflow-hidden rounded-[1.35rem] border border-white/80 bg-[linear-gradient(135deg,rgb(248_251_255_/_0.96),rgb(255_255_255_/_0.86))] shadow-[0_22px_70px_rgb(17_32_59_/_0.13)] backdrop-blur-2xl dark:border-white/10 dark:bg-[linear-gradient(135deg,rgb(12_26_48_/_0.94),rgb(8_19_35_/_0.9))]">
        <div className="flex min-h-16 min-w-0 items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4 xl:px-5">
          <div className="flex min-w-0 shrink-0 items-center">
            <BrandLogo />
          </div>

          <div className="hidden min-w-0 items-center justify-center gap-1 rounded-full border border-[var(--card-border)] bg-white/68 p-1 shadow-inner shadow-cyan-950/5 dark:bg-white/5 lg:flex">
            {primaryNavItems.map((item) => {
              const href = getNavItemHref(item, isSignedInUser);
              const isActive = item.isActive(pathname, isSignedInUser);
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex min-h-10 max-w-[11rem] items-center gap-2 whitespace-nowrap rounded-full px-3 text-sm font-bold transition xl:px-4 ${
                    isActive
                      ? "bg-[var(--brand-navy)] text-white shadow-[0_10px_24px_rgb(17_32_59_/_0.18)] dark:bg-[var(--brand-lime)] dark:text-[var(--brand-navy)]"
                      : "text-[var(--app-text-muted)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--brand-navy)] dark:hover:text-[var(--app-text)]"
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? "text-[var(--brand-cyan)] dark:text-[var(--brand-navy)]" : "text-[var(--brand-teal)]"
                    }`}
                  />
                  <span className="truncate">{text.nav[item.labelKey]}</span>
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--app-surface-muted)] text-[var(--app-text-soft)] shadow-sm shadow-slate-950/10 transition hover:border-[var(--brand-teal)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:ring-offset-2 focus:ring-offset-[var(--background)] lg:hidden"
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
          className={`border-t border-[var(--card-border)] bg-[linear-gradient(180deg,rgb(255_255_255_/_0.24),rgb(87_212_232_/_0.08))] px-3 transition dark:bg-[linear-gradient(180deg,rgb(255_255_255_/_0.04),rgb(20_184_166_/_0.08))] lg:hidden ${
            isMenuOpen
              ? "max-h-[36rem] py-3 opacity-100"
              : "max-h-0 overflow-hidden py-0 opacity-0"
          }`}
        >
          <div className="grid gap-2">
            {primaryNavItems.map((item) => {
              const href = getNavItemHref(item, isSignedInUser);
              const isActive = item.isActive(pathname, isSignedInUser);
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setIsMenuOpen(false)}
                  className={`group flex min-h-14 items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-bold transition ${
                    isActive
                      ? "border-[var(--brand-teal)] bg-[var(--brand-navy)] text-white shadow-[0_14px_32px_rgb(17_32_59_/_0.18)] dark:bg-[var(--brand-lime)] dark:text-[var(--brand-navy)]"
                      : "border-[var(--card-border)] bg-white/64 text-[var(--app-text-muted)] hover:border-[var(--brand-teal)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-text)] dark:bg-white/5"
                  }`}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                      isActive
                        ? "bg-white/14 text-[var(--brand-cyan)] dark:bg-[var(--brand-navy)] dark:text-[var(--brand-lime)]"
                        : "bg-[var(--app-primary-soft)] text-[var(--brand-teal)] group-hover:text-[var(--brand-navy)] dark:group-hover:text-[var(--brand-cyan)]"
                    }`}
                    aria-hidden="true"
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{text.nav[item.labelKey]}</span>
                  {isActive ? (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--brand-lime)] dark:bg-[var(--brand-navy)]" aria-hidden="true" />
                  ) : null}
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

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getNavItemHref(item: NavItem, isSignedIn: boolean) {
  return typeof item.href === "function" ? item.href(isSignedIn) : item.href;
}

function IconBase({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6.5 9.5V20h11V9.5" />
      <path d="M10 20v-5h4v5" />
    </IconBase>
  );
}

function StartLearningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M4.5 6.5v12l5-2.5 5 2.5 5-2.5v-12l-5 2.5-5-2.5-5 2.5Z" />
      <path d="M9.5 4v12" />
      <path d="M14.5 6.5v12" />
      <path d="m11.2 10 3.1 2-3.1 2v-4Z" />
    </IconBase>
  );
}

function WritingPracticeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M5 5.5h14a2 2 0 0 1 2 2V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z" />
      <path d="M7 9h.01" />
      <path d="M11 9h.01" />
      <path d="M15 9h.01" />
      <path d="M9 13h6" />
      <path d="M8 20h8" />
    </IconBase>
  );
}

function ProfileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </IconBase>
  );
}

function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.05.05a2.05 2.05 0 0 1-2.9 2.9l-.05-.05A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6l-.08.1a2.05 2.05 0 0 1-3.84 0L10 20a1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.88.34l-.05.05a2.05 2.05 0 0 1-2.9-2.9l.05-.05A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1l-.1-.08a2.05 2.05 0 0 1 0-3.84L4 10a1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.88l-.05-.05a2.05 2.05 0 0 1 2.9-2.9l.05.05A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6l.08-.1a2.05 2.05 0 0 1 3.84 0L14 4a1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.88-.34l.05-.05a2.05 2.05 0 0 1 2.9 2.9l-.05.05A1.7 1.7 0 0 0 19.4 9c.18.36.4.7.6 1l.1.08a2.05 2.05 0 0 1 0 3.84L20 14a1.7 1.7 0 0 0-.6 1Z" />
    </IconBase>
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
