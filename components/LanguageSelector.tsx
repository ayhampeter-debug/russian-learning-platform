"use client";

import {
  defaultExplanationLanguage,
  explanationLanguageOptions,
  explanationLanguageStorageKey,
  normalizeExplanationLanguage,
  type ExplanationLanguage,
} from "@/lib/language-preference";
import { tUi } from "@/lib/russian-explanations";
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
  const labelId = useId();
  const isPanel = variant === "panel";

  return (
    <div
      className={`min-w-0 ${
        isPanel
          ? "rounded-2xl border border-white/10 bg-slate-900/80 p-4"
          : "flex items-center gap-2"
      } ${className}`}
    >
      <label
        id={labelId}
        className={`shrink-0 text-xs font-bold uppercase tracking-wider ${
          isPanel ? "text-slate-400" : "hidden text-slate-400 xl:block"
        }`}
      >
        {isPanel ? tUi("explanationLanguage", language) : tUi("learnRussianWith", language)}
      </label>
      <div
        className={`grid grid-cols-2 rounded-full border border-white/10 bg-slate-950/70 p-1 ${
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
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {isPanel ? option.label : option.shortLabel}
            </button>
          );
        })}
      </div>
      {isPanel ? (
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {language === "ar"
            ? "ستبقى الروسية كما هي، وستظهر المعاني والشرح بالعربية حيث تتوفر."
            : "Russian stays the course language; meanings and explanations appear in English."}
        </p>
      ) : null}
    </div>
  );
}
