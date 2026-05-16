"use client";

import { LanguageSelector, useExplanationLanguage } from "@/components/LanguageSelector";
import { Navigation } from "@/components/Navigation";
import { useTheme, type ThemeMode } from "@/components/ThemeProvider";
import { getUiText, uiTextProps } from "@/lib/ui-translations";
import { SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

const themeModes: ThemeMode[] = ["light", "dark", "system"];

export function SettingsClient() {
  const { language } = useExplanationLanguage();
  const text = getUiText(language);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { isLoaded, isSignedIn } = useUser();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="mb-8" {...uiTextProps(language)}>
          <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
            {text.settings.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl md:text-6xl">
            {text.settings.title}
          </h1>
          <p className="mt-4 max-w-3xl text-slate-400">
            {text.settings.intro}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <section className="rounded-2xl border border-white/10 bg-white/10 p-5 sm:rounded-3xl sm:p-7">
            <SectionHeader
              title={text.settings.explanationTitle}
              text={text.settings.explanationText}
              language={language}
            />
            <div className="mt-5">
              <LanguageSelector variant="panel" />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/10 p-5 sm:rounded-3xl sm:p-7">
            <SectionHeader
              title={text.settings.themeTitle}
              text={`${text.settings.themeText} ${text.common.current}: ${themeLabel(theme, text)} (${themeLabel(resolvedTheme, text)}).`}
              language={language}
            />
            <div className="mt-5 grid gap-2 rounded-2xl border border-white/10 bg-slate-900/70 p-2 sm:grid-cols-3">
              {themeModes.map((mode) => {
                const selected = theme === mode;

                return (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setTheme(mode)}
                    className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                      selected
                        ? "bg-cyan-400 text-slate-950"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {themeLabel(mode, text)}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/10 p-5 sm:rounded-3xl sm:p-7">
            <SectionHeader
              title={text.settings.accountTitle}
              text={
                isLoaded && isSignedIn
                  ? text.settings.accountSignedIn
                  : text.settings.accountSignedOut
              }
              language={language}
            />
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {isLoaded && isSignedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="w-full rounded-full bg-cyan-400 px-6 py-3 text-center font-bold text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
                  >
                    {text.settings.profile}
                  </Link>
                  <SignOutButton>
                    <button
                      type="button"
                      className="w-full rounded-full border border-white/10 bg-white/10 px-6 py-3 font-bold text-white transition hover:border-white/30 hover:bg-white/15 sm:w-auto"
                    >
                      {text.settings.signOut}
                    </button>
                  </SignOutButton>
                </>
              ) : (
                <Link
                  href="/login"
                  className="w-full rounded-full bg-cyan-400 px-6 py-3 text-center font-bold text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
                >
                  {text.settings.signIn}
                </Link>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5 sm:rounded-3xl sm:p-7">
            <SectionHeader
              title={text.settings.learningTitle}
              text={text.settings.savedLocally}
              language={language}
            />
            <div className="mt-5 grid gap-3">
              <PreferenceLine label={text.settings.currentCourse} />
              <PreferenceLine label={text.settings.moreCourses} />
              <PreferenceLine label={text.settings.betaNote} />
              <Link
                href="/feedback"
                className="rounded-2xl border border-cyan-400/30 bg-slate-900/70 px-4 py-3 text-center font-bold text-cyan-100 transition hover:border-cyan-400/50 hover:bg-cyan-400/10"
              >
                {text.settings.sendFeedback}
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function SectionHeader({
  title,
  text,
  language,
}: {
  title: string;
  text: string;
  language: "en" | "ar";
}) {
  return (
    <div {...uiTextProps(language)}>
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-3 leading-7 text-slate-400">{text}</p>
    </div>
  );
}

function PreferenceLine({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 font-semibold text-slate-200">
      {label}
    </div>
  );
}

function themeLabel(mode: ThemeMode | "light" | "dark", text: ReturnType<typeof getUiText>) {
  return mode === "light"
    ? text.common.light
    : mode === "dark"
      ? text.common.dark
      : text.common.system;
}
