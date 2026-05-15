"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { useExplanationLanguage } from "@/components/LanguageSelector";
import {
  isRussianText,
  normalizeRussianText,
  PronounceButton,
} from "@/components/PronounceButton";
import {
  clearMistakes,
  removeMistake,
  useMistakes,
  type MistakeRecord,
} from "@/lib/mistake-storage";
import {
  getUiText,
  uiTextProps,
} from "@/lib/ui-translations";
import {
  explanationTextProps,
  localizeExplanation,
  localizeLearningText,
  localizeMeaning,
} from "@/lib/russian-explanations";
import type { ExplanationLanguage } from "@/lib/language-preference";

export function PracticeClient() {
  const { language } = useExplanationLanguage();
  const text = getUiText(language);
  const practiceText = text.practice;
  const mistakes = useMistakes();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const boundedActiveIndex =
    mistakes.length === 0 ? 0 : Math.min(activeIndex, mistakes.length - 1);
  const activeMistake = mistakes[boundedActiveIndex] ?? null;

  const savedAt = useMemo(() => {
    if (!activeMistake) {
      return "";
    }

    return formatSavedDate(activeMistake.timestamp, language);
  }, [activeMistake, language]);

  function handleRemoveActiveMistake() {
    if (!activeMistake) {
      return;
    }

    removeMistake(activeMistake.id);
    setShowAnswer(false);
  }

  function handleClearMistakes() {
    const confirmed = window.confirm(practiceText.clearConfirm);

    if (confirmed) {
      clearMistakes();
      setShowAnswer(false);
      setActiveIndex(0);
    }
  }

  function moveActiveMistake(offset: number) {
    setActiveIndex((currentIndex) => {
      const nextIndex = Math.min(Math.max(currentIndex + offset, 0), mistakes.length - 1);

      return nextIndex;
    });
    setShowAnswer(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300" {...uiTextProps(language)}>
              {practiceText.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-5xl" {...uiTextProps(language)}>
              {practiceText.title}
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300" {...uiTextProps(language)}>
              {practiceText.intro}
            </p>
          </div>
          {mistakes.length > 0 ? (
            <button
              type="button"
              onClick={handleClearMistakes}
              className="w-full rounded-full border border-red-300/40 px-5 py-3 font-black text-red-100 transition hover:bg-red-400/10 sm:w-auto"
            >
              {practiceText.clearAllMistakes}
            </button>
          ) : null}
        </div>

        {mistakes.length === 0 || !activeMistake ? (
          <section className="rounded-2xl border border-white/10 bg-white/10 p-5 text-center shadow-2xl shadow-cyan-950/30 sm:rounded-3xl sm:p-8">
            <p className="text-2xl font-black text-cyan-100" {...uiTextProps(language)}>
              {practiceText.noMistakesToReviewYet}
            </p>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-300" {...uiTextProps(language)}>
              {practiceText.noMistakesHint}
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex rounded-full bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300"
            >
              {practiceText.backToDashboard}
            </Link>
          </section>
        ) : (
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <MistakePracticeCard
              mistake={activeMistake}
              showAnswer={showAnswer}
              savedAt={savedAt}
              activeNumber={boundedActiveIndex + 1}
              totalCount={mistakes.length}
              language={language}
              onToggleAnswer={() => setShowAnswer((current) => !current)}
              onRemove={handleRemoveActiveMistake}
            />

            <aside className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:rounded-3xl sm:p-5">
              <p className="text-sm text-slate-400" {...uiTextProps(language)}>{practiceText.mistakesToReview}</p>
              <p className="mt-2 text-4xl font-black text-yellow-200">{mistakes.length}</p>
              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={() => moveActiveMistake(-1)}
                  disabled={boundedActiveIndex === 0}
                  aria-disabled={boundedActiveIndex === 0}
                  className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-3 font-bold transition hover:border-cyan-300/40 disabled:text-slate-600 disabled:hover:border-white/10"
                >
                  {practiceText.previousMistake}
                </button>
                <button
                  type="button"
                  onClick={() => moveActiveMistake(1)}
                  disabled={boundedActiveIndex >= mistakes.length - 1}
                  aria-disabled={boundedActiveIndex >= mistakes.length - 1}
                  className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-3 font-bold transition hover:border-cyan-300/40 disabled:text-slate-600 disabled:hover:border-white/10"
                >
                  {practiceText.nextMistake}
                </button>
              </div>
            </aside>
          </section>
        )}
      </section>
    </main>
  );
}

function MistakePracticeCard({
  mistake,
  showAnswer,
  savedAt,
  activeNumber,
  totalCount,
  language,
  onToggleAnswer,
  onRemove,
}: {
  mistake: MistakeRecord;
  showAnswer: boolean;
  savedAt: string;
  activeNumber: number;
  totalCount: number;
  language: ExplanationLanguage;
  onToggleAnswer: () => void;
  onRemove: () => void;
}) {
  const practiceText = getUiText(language).practice;

  return (
    <article className="min-w-0 rounded-2xl border border-cyan-400/20 bg-white/10 p-5 shadow-2xl shadow-cyan-950/30 sm:rounded-3xl sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300" {...uiTextProps(language)}>
            {practiceText.reviewMistakes} {activeNumber}/{totalCount}
          </p>
          <p className="mt-2 text-sm text-slate-400" {...uiTextProps(language)}>
            {practiceText.savedAt}: {savedAt}
          </p>
        </div>
        {mistake.exerciseOrder ? (
          <span className="w-fit rounded-full bg-yellow-300 px-4 py-2 text-sm font-black text-slate-950">
            #{mistake.exerciseOrder}
          </span>
        ) : null}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
        <p className="text-sm font-bold text-slate-400" {...uiTextProps(language)}>{practiceText.question}</p>
        <p className="mt-3 break-words text-2xl font-black leading-9" {...explanationTextProps(language)}>
          {localizeLearningText(mistake.questionText, language)}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 sm:p-5">
        <p className="text-sm font-bold text-red-100" {...uiTextProps(language)}>{practiceText.yourAnswer}</p>
        <AnswerText answer={mistake.userAnswer} language={language} />
      </div>

      {showAnswer ? (
        <div className="mt-4 grid gap-4">
          <div className="rounded-2xl border border-green-300/20 bg-green-400/10 p-4 sm:p-5">
            <p className="text-sm font-bold text-green-100" {...uiTextProps(language)}>{practiceText.correctAnswer}</p>
            <AnswerText answer={mistake.correctAnswer} language={language} />
          </div>

          {mistake.explanation ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">
              <p className="text-sm font-bold text-slate-400" {...uiTextProps(language)}>{practiceText.explanation}</p>
              <p className="mt-2 leading-7 text-slate-300" {...explanationTextProps(language)}>
                {localizeExplanation(mistake.explanation, language)}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onToggleAnswer}
          className="rounded-full bg-cyan-400 px-5 py-4 font-black text-slate-950 transition hover:bg-cyan-300"
        >
          {showAnswer ? practiceText.hideAnswer : practiceText.revealAnswer}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full border border-white/10 bg-slate-900/80 px-5 py-4 font-black transition hover:border-red-300/40 hover:bg-red-400/10"
        >
          {practiceText.removeFromReview}
        </button>
      </div>
    </article>
  );
}

function AnswerText({ answer, language }: { answer: string; language: ExplanationLanguage }) {
  const formattedAnswer = isRussianText(answer) ? normalizeRussianText(answer) : localizeMeaning(answer, language);

  return (
    <div className="mt-2 flex min-w-0 items-center gap-3">
      <p className="min-w-0 break-words text-xl font-black leading-8" {...(!isRussianText(answer) ? explanationTextProps(language) : {})}>
        {formattedAnswer}
      </p>
      {isRussianText(answer) ? <PronounceButton text={answer} /> : null}
    </div>
  );
}

function formatSavedDate(timestamp: string, language: ExplanationLanguage) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat(language === "ar" ? "ar" : "en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
