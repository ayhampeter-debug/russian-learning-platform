"use client";

import { Navigation } from "@/components/Navigation";
import { useExplanationLanguage } from "@/components/LanguageSelector";
import { worldOne } from "@/lib/learning-data";
import { getUiText, uiTextProps } from "@/lib/ui-translations";
import Link from "next/link";

export function LessonNotFoundClient({ lessonId }: { lessonId: string }) {
  const { language } = useExplanationLanguage();
  const text = getUiText(language);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-3xl items-center px-4 pb-8 sm:px-6">
        <div className="w-full rounded-2xl border border-white/10 bg-white/10 p-5 text-center shadow-2xl shadow-cyan-950/30 sm:rounded-3xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300 sm:text-sm sm:tracking-[0.35em]" {...uiTextProps(language)}>
            {text.lesson.lessonNotFound}
          </p>
          <h1 className="mt-4 text-3xl font-black md:text-5xl" {...uiTextProps(language)}>
            {text.lesson.couldNotFindLesson}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-400" {...uiTextProps(language)}>
            {text.lesson.noLessonMatches} &quot;{lessonId}&quot;. {text.lesson.chooseAvailableStage}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/worlds"
              className="inline-flex flex-1 justify-center rounded-full bg-cyan-400 px-7 py-4 font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              {text.lesson.backToWorlds}
            </Link>
            <Link
              href={`/lesson/${worldOne.lessons[0].id}`}
              className="inline-flex flex-1 justify-center rounded-full border border-white/10 bg-white/10 px-7 py-4 font-bold text-white transition hover:border-white/30 hover:bg-white/15"
            >
              {text.lesson.startFirstLesson}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
