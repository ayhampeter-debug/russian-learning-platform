"use client";

import {
  defaultExplanationLanguage,
  explanationLanguageOptions,
  explanationLanguageStorageKey,
  normalizeExplanationLanguage,
  type ExplanationLanguage,
} from "@/lib/language-preference";
import { getUiText, uiTextProps } from "@/lib/ui-translations";
import { useId, useSyncExternalStore } from "react";

type LanguageSelectorProps = {
  variant?: "compact" | "panel";
  className?: string;
};

export function useExplanationLanguage() {
  const language = useSyncExternalStore(
    subscribeToLanguagePreference,
    getLanguagePreferenceSnapshot,
    getLanguagePreferenceServerSnapshot,
  );

  function setLanguage(nextLanguage: ExplanationLanguage) {
    const normalizedLanguage = normalizeExplanationLanguage(nextLanguage);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(explanationLanguageStorageKey, normalizedLanguage);
      window.dispatchEvent(
        new CustomEvent("yazkup:explanation-language-change", {
          detail: normalizedLanguage,
        }),
      );
    }
  }

  return { language, setLanguage };
}

function getLanguagePreferenceSnapshot() {
  if (typeof window === "undefined") {
    return defaultExplanationLanguage;
  }

  return normalizeExplanationLanguage(
    window.localStorage.getItem(explanationLanguageStorageKey),
  );
}

function getLanguagePreferenceServerSnapshot() {
  return defaultExplanationLanguage;
}

function subscribeToLanguagePreference(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === explanationLanguageStorageKey) {
      onStoreChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener("yazkup:explanation-language-change", onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("yazkup:explanation-language-change", onStoreChange);
  };
}

export function LanguageSelector({
  variant = "compact",
  className = "",
}: LanguageSelectorProps) {
  const { language, setLanguage } = useExplanationLanguage();
  const text = getUiText(language);
  const labelId = useId();
  const isPanel = variant === "panel";

  return (
    <div
      className={`min-w-0 ${
        isPanel
          ? "rounded-2xl border border-[var(--card-border)] bg-[var(--app-surface-muted)] p-4"
          : "flex items-center gap-2"
      } ${className}`}
    >
      <label
        id={labelId}
        className={`shrink-0 text-xs font-bold uppercase tracking-wider ${
          isPanel ? "text-[var(--app-text-muted)]" : "hidden text-[var(--app-text-muted)] xl:block"
        }`}
      >
        {isPanel ? text.nav.explanationLanguage : text.nav.learnRussianWith}
      </label>
      <div
        className={`grid grid-cols-2 rounded-full border border-[var(--card-border)] bg-[var(--app-surface)] p-1 ${
          isPanel ? "mt-3 w-full max-w-xs" : "w-[7.25rem]"
        }`}
        role="radiogroup"
        aria-labelledby={labelId}
      >
        {explanationLanguageOptions.map((option) => {
          const isSelected = language === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setLanguage(option.value)}
              className={`min-w-0 rounded-full px-2 py-1.5 text-xs font-black transition ${
                isSelected
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--app-text-muted)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-text)]"
              }`}
            >
              {isPanel ? (option.value === "ar" ? text.common.arabic : text.common.english) : option.shortLabel}
            </button>
          );
        })}
      </div>
      {isPanel ? (
        <p
          className="mt-3 text-sm leading-6 text-[var(--app-text-muted)]"
          {...uiTextProps(language)}
        >
          {language === "ar"
            ? "تبقى الروسية لغة المساق، وتظهر المعاني والشرح بالعربية حيث تتوفر."
            : "Russian stays the course language; meanings and explanations appear in English."}
        </p>
      ) : null}
    </div>
  );
}
