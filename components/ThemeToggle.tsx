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
      className="group fixed right-3 top-3 z-50 flex h-11 w-[5.25rem] items-center rounded-full border border-white/20 bg-slate-950/90 p-1 shadow-2xl shadow-cyan-950/40 backdrop-blur transition hover:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950 sm:right-5 sm:top-5"
      aria-label={`Theme: ${themeLabels[theme]}. Switch to ${themeLabels[nextTheme]}.`}
      aria-pressed={isDark}
      title={`Theme: ${themeLabels[theme]} (${resolvedTheme})`}
    >
      <span className="sr-only">
        Theme: {themeLabels[theme]}. Switch to {themeLabels[nextTheme]}.
      </span>
      <span className="flex flex-1 items-center justify-between px-2 text-sm leading-none">
        <span aria-hidden="true" className={isDark ? "text-slate-500" : "text-yellow-300"}>
          {lightIcon}
        </span>
        <span aria-hidden="true" className={isDark ? "text-cyan-200" : "text-slate-500"}>
          {darkIcon}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`absolute left-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-base shadow-lg shadow-slate-950/30 transition-transform duration-200 ${
          isDark ? "translate-x-10 text-slate-950" : "translate-x-0 text-yellow-500"
        }`}
      >
        {isDark ? darkIcon : lightIcon}
      </span>
    </button>
  );
}
