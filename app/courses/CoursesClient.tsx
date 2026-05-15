"use client";

import { Navigation } from "@/components/Navigation";
import { useExplanationLanguage } from "@/components/LanguageSelector";
import { worlds } from "@/lib/learning-data";
import {
  getUiText,
  localizeActionLabel,
  uiTextProps,
} from "@/lib/ui-translations";
import {
  getProgressSummary,
  useProgress,
} from "@/lib/progress-storage";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

const comingSoonCourseKeys = [
  "englishTitle",
  "germanTitle",
  "spanishTitle",
  "frenchTitle",
] as const;

export function CoursesClient() {
  const { language } = useExplanationLanguage();
  const text = getUiText(language);
  const progress = useProgress();
  const summary = getProgressSummary(progress);
  const { isSignedIn } = useUser();
  const primaryHref = isSignedIn ? summary.continueHref : "/signup";
  const explanationLanguage =
    language === "ar"
      ? text.common.explanationLanguageValueArabic
      : text.common.explanationLanguageValueEnglish;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_0.7fr] lg:items-end">
          <div {...uiTextProps(language)}>
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
              {text.courses.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl md:text-6xl">
              {text.courses.title}
            </h1>
            <p className="mt-4 max-w-3xl text-slate-400">
              {text.courses.intro}
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 sm:rounded-3xl sm:p-5">
            <p className="font-bold text-cyan-200" {...uiTextProps(language)}>
              {text.courses.currentCourse}
            </p>
            <p className="mt-2 text-sm text-slate-300" {...uiTextProps(language)}>
              {text.courses.explanationLanguage}: {explanationLanguage}
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="rounded-2xl border border-cyan-400/25 bg-white/10 p-5 shadow-2xl shadow-cyan-950/30 sm:rounded-3xl sm:p-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div {...uiTextProps(language)}>
                <span className="inline-flex rounded-full bg-cyan-400 px-3 py-1 text-xs font-black text-slate-950">
                  {text.courses.available}
                </span>
                <h2 className="mt-5 text-2xl font-black sm:text-4xl">
                  {text.courses.russianTitle}
                </h2>
                <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                  {text.courses.russianSubtitle}
                </p>
              </div>
              <span className="w-fit rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950">
                {text.courses.betaReady}
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <CourseStat label={text.courses.worldsAvailable} value="2" />
              <CourseStat label="XP" value={progress.totalXp.toLocaleString()} />
              <CourseStat
                label={text.dashboard.completedLessons}
                value={`${summary.totalCompletedLessons}/${worlds.flatMap((world) => world.lessons).length}`}
              />
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href={primaryHref}
                className="w-full rounded-full bg-cyan-400 px-6 py-3 text-center font-bold text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
              >
                {isSignedIn
                  ? localizeActionLabel(summary.continueLabel, language)
                  : text.courses.startContinue}
              </Link>
              <Link
                href="/worlds"
                className="w-full rounded-full border border-white/10 bg-white/10 px-6 py-3 text-center font-bold text-white transition hover:border-white/30 hover:bg-white/15 sm:w-auto"
              >
                {text.courses.exploreWorlds}
              </Link>
            </div>
          </section>

          <aside className="rounded-2xl border border-white/10 bg-white/10 p-5 sm:rounded-3xl sm:p-7">
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-300" {...uiTextProps(language)}>
              {text.courses.courseLanguages}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400" {...uiTextProps(language)}>
              {text.courses.noDbSupport}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {comingSoonCourseKeys.map((courseKey) => (
                <div
                  key={courseKey}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-black" {...uiTextProps(language)}>{text.courses[courseKey]}</h3>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-400">
                      {text.courses.comingSoon}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400" {...uiTextProps(language)}>
                    {text.courses.comingSoonText}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function CourseStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
