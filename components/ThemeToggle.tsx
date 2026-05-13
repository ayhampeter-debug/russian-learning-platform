"use client";

import { useTheme } from "@/components/ThemeProvider";

const themeLabels = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

const lightIcon = "\u2600";
const darkIcon = "\u263E";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className="group relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-[var(--card-border)] bg-[var(--app-surface-muted)] p-1 text-[var(--app-text-muted)] shadow-sm shadow-slate-950/10 transition hover:border-[var(--brand-teal)] hover:bg-[var(--app-surface-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
      aria-label={`Theme: ${themeLabels[theme]}. Switch to ${themeLabels[nextTheme]}.`}
      aria-pressed={isDark}
      title={`Theme: ${themeLabels[theme]} (${resolvedTheme})`}
    >
      <span className="sr-only">
        Theme: {themeLabels[theme]}. Switch to {themeLabels[nextTheme]}.
      </span>
      <span className="flex flex-1 items-center justify-between px-1.5 text-[0.625rem] leading-none">
        <span
          aria-hidden="true"
          className={isDark ? "text-[var(--app-text-faint)]" : "text-[var(--brand-cyan)]"}
        >
          {lightIcon}
        </span>
        <span
          aria-hidden="true"
          className={isDark ? "text-[var(--brand-lime)]" : "text-[var(--app-text-faint)]"}
        >
          {darkIcon}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-[color:rgb(17_32_59_/_0.12)] bg-[var(--primary)] text-[0.7rem] text-[var(--primary-foreground)] shadow-sm shadow-slate-950/20 transition-transform duration-200 dark:bg-[var(--brand-lime)] ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {isDark ? darkIcon : lightIcon}
      </span>
    </button>
  );
}
