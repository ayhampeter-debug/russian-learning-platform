"use client";

import { getNextTheme, useTheme } from "@/components/ThemeProvider";

const themeLabels = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const nextTheme = getNextTheme(theme);

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className="min-h-11 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-3 text-center text-xs font-semibold text-slate-300 transition hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-white sm:px-4 sm:text-sm lg:px-5"
      aria-label={`Theme: ${themeLabels[theme]}. Switch to ${themeLabels[nextTheme]}.`}
      title={`Theme: ${themeLabels[theme]} (${resolvedTheme})`}
    >
      Theme: {themeLabels[theme]}
    </button>
  );
}
