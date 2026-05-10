"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
};

const storageKey = "rusquest-theme";
const themeModes: ThemeMode[] = ["light", "dark", "system"];

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function getSystemTheme(): ResolvedTheme {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

function resolveTheme(theme: ThemeMode): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

function applyTheme(resolvedTheme: ResolvedTheme) {
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.style.colorScheme = resolvedTheme;
}

function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedTheme = window.localStorage.getItem(storageKey);

  return isThemeMode(storedTheme) ? storedTheme : "system";
}

function subscribeToTheme(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function handleThemeChange() {
    applyTheme(resolveTheme(getStoredTheme()));
    onStoreChange();
  }

  mediaQuery.addEventListener("change", handleThemeChange);
  window.addEventListener("storage", handleThemeChange);
  window.addEventListener("rusquest-theme-change", handleThemeChange);

  return () => {
    mediaQuery.removeEventListener("change", handleThemeChange);
    window.removeEventListener("storage", handleThemeChange);
    window.removeEventListener("rusquest-theme-change", handleThemeChange);
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore<ThemeMode>(
    subscribeToTheme,
    getStoredTheme,
    () => "system",
  );
  const resolvedTheme = resolveTheme(theme);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme(nextTheme) {
        const nextResolvedTheme = resolveTheme(nextTheme);

        window.localStorage.setItem(storageKey, nextTheme);
        applyTheme(nextResolvedTheme);
        window.dispatchEvent(new Event("rusquest-theme-change"));
      },
    }),
    [resolvedTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}

export function getNextTheme(theme: ThemeMode): ThemeMode {
  const currentIndex = themeModes.indexOf(theme);
  const nextIndex = (currentIndex + 1) % themeModes.length;

  return themeModes[nextIndex];
}

export const themeStorageKey = storageKey;
