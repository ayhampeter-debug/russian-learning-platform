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
      className="group fixed right-4 top-4 z-[9999] inline-flex h-12 w-24 items-center rounded-full border border-slate-950/25 bg-white p-1 text-slate-950 shadow-2xl shadow-slate-950/25 transition hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-white dark:border-white/35 dark:bg-slate-950 dark:text-white dark:shadow-cyan-950/50 dark:focus:ring-cyan-300 dark:focus:ring-offset-slate-950"
      aria-label={`Theme: ${themeLabels[theme]}. Switch to ${themeLabels[nextTheme]}.`}
      aria-pressed={isDark}
      title={`Theme: ${themeLabels[theme]} (${resolvedTheme})`}
    >
      <span className="sr-only">
        Theme: {themeLabels[theme]}. Switch to {themeLabels[nextTheme]}.
      </span>
      <span className="flex flex-1 items-center justify-between px-2 text-[0.625rem] font-semibold uppercase leading-none tracking-normal">
        <span
          aria-hidden="true"
          className={isDark ? "text-slate-500" : "text-slate-950"}
        >
          Light
        </span>
        <span
          aria-hidden="true"
          className={isDark ? "text-white" : "text-slate-500"}
        >
          Dark
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`absolute left-1 top-1 flex h-10 w-10 items-center justify-center rounded-full border border-slate-950/10 bg-cyan-500 text-base text-white shadow-lg shadow-slate-950/30 transition-transform duration-200 dark:border-white/20 dark:bg-yellow-300 dark:text-slate-950 ${
          isDark ? "translate-x-12" : "translate-x-0"
        }`}
      >
        {isDark ? darkIcon : lightIcon}
      </span>
    </button>
  );
}
