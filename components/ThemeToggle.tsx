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
      className="group relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-white/15 bg-slate-900/70 p-1 text-slate-300 shadow-sm shadow-slate-950/10 transition hover:border-cyan-400/50 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 dark:border-white/15 dark:bg-slate-900/70 dark:text-slate-300"
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
          className={isDark ? "text-slate-500" : "text-cyan-200"}
        >
          {lightIcon}
        </span>
        <span
          aria-hidden="true"
          className={isDark ? "text-yellow-200" : "text-slate-500"}
        >
          {darkIcon}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-cyan-400 text-[0.7rem] text-slate-950 shadow-sm shadow-slate-950/20 transition-transform duration-200 dark:bg-yellow-300 ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {isDark ? darkIcon : lightIcon}
      </span>
    </button>
  );
}
