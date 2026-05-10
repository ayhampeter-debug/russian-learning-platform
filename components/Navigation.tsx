"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
];

export function Navigation() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useUser();

  return (
    <nav className="mx-auto mb-6 w-full max-w-7xl px-3 pt-16 sm:mb-10 sm:px-6 sm:pt-20 lg:pr-28 lg:pt-6 2xl:pr-6">
      <div className="rounded-2xl border border-white/10 bg-white/10 p-2 shadow-2xl shadow-cyan-950/20 backdrop-blur sm:rounded-3xl sm:p-3">
        <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <Link
            href="/"
            className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-slate-950/70 px-3 py-3 transition hover:bg-slate-900 sm:px-4"
          >
            <span className="truncate text-base font-black text-white sm:text-lg">
              RusQuest
            </span>
            <span className="shrink-0 rounded-full bg-cyan-400 px-3 py-1 text-xs font-black text-slate-950">
              Learn RU
            </span>
          </Link>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-300 sm:grid-cols-3 sm:text-sm lg:flex lg:items-center">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/lesson" && pathname.startsWith("/lesson/"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`min-w-0 rounded-2xl border px-2.5 py-3 text-center transition sm:px-4 lg:px-5 ${
                    isActive
                      ? "border-cyan-400 bg-cyan-400 text-slate-950"
                      : "border-white/10 bg-slate-900/70 hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {!isLoaded ? null : isSignedIn ? (
              <>
                <Link
                  href="/profile"
                  aria-current={pathname === "/profile" ? "page" : undefined}
                  className={`min-w-0 rounded-2xl border px-2.5 py-3 text-center transition sm:px-4 lg:px-5 ${
                    pathname === "/profile"
                      ? "border-cyan-400 bg-cyan-400 text-slate-950"
                      : "border-white/10 bg-slate-900/70 hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-white"
                  }`}
                >
                  Profile
                </Link>
                <div className="flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 px-3">
                  <UserButton />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  aria-current={pathname === "/login" ? "page" : undefined}
                  className={`min-w-0 rounded-2xl border px-2.5 py-3 text-center transition sm:px-4 lg:px-5 ${
                    pathname === "/login"
                      ? "border-cyan-400 bg-cyan-400 text-slate-950"
                      : "border-white/10 bg-slate-900/70 hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-white"
                  }`}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  aria-current={pathname === "/signup" ? "page" : undefined}
                  className={`min-w-0 rounded-2xl border px-2.5 py-3 text-center transition sm:px-4 lg:px-5 ${
                    pathname === "/signup"
                      ? "border-cyan-400 bg-cyan-400 text-slate-950"
                      : "border-white/10 bg-slate-900/70 hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-white"
                  }`}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
