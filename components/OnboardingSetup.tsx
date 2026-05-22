"use client";

import { useExplanationLanguage } from "@/components/LanguageSelector";
import {
  completeOnboarding,
  defaultCourse,
  type CourseKey,
  useOnboardingComplete,
} from "@/lib/onboarding-preferences";
import { getUiText, uiTextProps } from "@/lib/ui-translations";
import type { ExplanationLanguage } from "@/lib/language-preference";
import { useEffect, useState } from "react";

type Step = 1 | 2;

const comingSoonCourses = ["englishTitle", "germanTitle", "spanishTitle", "frenchTitle"] as const;

export function OnboardingSetup() {
  const { language, setLanguage } = useExplanationLanguage();
  const onboardingComplete = useOnboardingComplete();
  const [step, setStep] = useState<Step>(1);
  const [selectedLanguage, setSelectedLanguage] =
    useState<ExplanationLanguage>(language);
  const [selectedCourse, setSelectedCourse] = useState<CourseKey>(defaultCourse);

  useEffect(() => {
    if (onboardingComplete) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.dataset.yazkupOnboarding = "open";

    return () => {
      document.body.style.overflow = previousOverflow;
      delete document.body.dataset.yazkupOnboarding;
    };
  }, [onboardingComplete]);

  if (onboardingComplete) {
    return null;
  }

  const text = getUiText(selectedLanguage);
  const progressWidth = step === 1 ? "50%" : "100%";

  function finishSetup() {
    setLanguage(selectedLanguage);
    completeOnboarding(selectedCourse);
  }

  return (
    <div
      className="fixed inset-0 z-[100] grid min-h-dvh place-items-center overflow-y-auto bg-slate-950/85 px-4 py-5 backdrop-blur-2xl sm:px-6 sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="yazkup-onboarding-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(87,212,232,0.20),transparent_34%),linear-gradient(180deg,rgba(8,19,35,0.48),rgba(8,19,35,0.84))]" aria-hidden="true" />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[1.35rem] border border-white/20 bg-[var(--app-surface)] p-4 text-[var(--app-text)] shadow-[0_32px_90px_rgba(2,8,23,0.52)] ring-1 ring-white/10 sm:rounded-[1.75rem] sm:p-7">
        <div
          className="absolute inset-x-0 top-0 h-1.5 bg-[var(--app-surface-muted)]"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-r-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: progressWidth }}
          />
        </div>

        <div className="mt-3 flex items-start justify-between gap-3 sm:gap-4">
          <div {...uiTextProps(selectedLanguage)}>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--app-primary-strong)]">
              YazkUp
            </p>
            <h2
              id="yazkup-onboarding-title"
              className="mt-2 text-2xl font-black leading-tight tracking-tight sm:text-4xl"
            >
              {step === 1 ? text.onboarding.chooseLanguage : text.onboarding.whatLearn}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--app-text-muted)] sm:text-base sm:leading-7">
              {step === 1
                ? text.onboarding.languageDescription
                : text.onboarding.youCanChangeLater}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-strong)] px-3 py-1.5 text-xs font-black text-[var(--app-text-soft)] shadow-sm">
            {step}/2
          </span>
        </div>

        {step === 1 ? (
          <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2">
            <LanguageChoice
              label="English"
              description="App interface and explanations in English."
              selected={selectedLanguage === "en"}
              onClick={() => setSelectedLanguage("en")}
              language="en"
            />
            <LanguageChoice
              label="العربية"
              description="واجهة الموقع وشرح الدروس باللغة العربية."
              selected={selectedLanguage === "ar"}
              onClick={() => setSelectedLanguage("ar")}
              language="ar"
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-3">
            <button
              type="button"
              aria-pressed={selectedCourse === "russian"}
              onClick={() => setSelectedCourse("russian")}
              className="rounded-2xl border border-[var(--primary)] bg-[var(--app-primary-soft)] p-4 text-left shadow-sm transition hover:border-[var(--brand-cyan)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]"
              {...uiTextProps(selectedLanguage)}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black">{text.onboarding.russian}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
                    {text.courses.russianSubtitle}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-black text-[var(--primary-foreground)]">
                  {text.onboarding.available}
                </span>
              </div>
            </button>

            <div className="grid gap-3 sm:grid-cols-2">
              {comingSoonCourses.map((courseKey) => (
                <div
                  key={courseKey}
                  className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4 opacity-75"
                  {...uiTextProps(selectedLanguage)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-black">{text.courses[courseKey]}</h3>
                    <span className="rounded-full border border-[var(--app-border)] px-3 py-1 text-xs font-bold text-[var(--app-text-muted)]">
                      {text.onboarding.comingSoon}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[var(--app-border-muted)] pt-4 sm:mt-8 sm:flex-row sm:justify-between sm:pt-5">
          <button
            type="button"
            onClick={() => setStep(1)}
            disabled={step === 1}
            className="min-h-12 rounded-full border border-[var(--app-border)] px-5 py-3 font-bold text-[var(--app-text)] transition hover:bg-[var(--app-surface-muted)] disabled:pointer-events-none disabled:opacity-0"
          >
            {text.onboarding.back}
          </button>
          <button
            type="button"
            onClick={step === 1 ? () => setStep(2) : finishSetup}
            className="min-h-12 rounded-full bg-[var(--primary)] px-7 py-3 font-black text-[var(--primary-foreground)] shadow-lg shadow-cyan-950/20 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:ring-offset-2 focus:ring-offset-[var(--app-surface)]"
          >
            {step === 1 ? text.onboarding.continue : text.onboarding.startYazkUp}
          </button>
        </div>
      </div>
    </div>
  );
}

function LanguageChoice({
  label,
  description,
  selected,
  onClick,
  language,
}: {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  language: ExplanationLanguage;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] ${
        selected
          ? "border-[var(--primary)] bg-[var(--app-primary-soft)] ring-1 ring-[var(--primary)]"
          : "border-[var(--app-border)] bg-[var(--app-surface-muted)] hover:border-[var(--brand-cyan)]"
      }`}
      {...uiTextProps(language)}
    >
      <span className="text-xl font-black text-[var(--app-text)]">{label}</span>
      <span className="mt-3 block text-sm leading-6 text-[var(--app-text-muted)]">
        {description}
      </span>
    </button>
  );
}
