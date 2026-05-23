"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useExplanationLanguage } from "@/components/LanguageSelector";
import { normalizeRussianText, PronounceButton } from "@/components/PronounceButton";
import type { ExplanationLanguage } from "@/lib/language-preference";
import { worlds, type VocabularyItem } from "@/lib/learning-data";
import { addMistake } from "@/lib/mistake-storage";
import { explanationTextProps, localizeMeaning } from "@/lib/russian-explanations";
import { getUiText, uiTextProps } from "@/lib/ui-translations";

type PracticeMode = "copy" | "meaning" | "listen" | "speed";
type AnswerStatus = "idle" | "correct" | "wrong";

type WritingWord = {
  id: string;
  lessonId: string;
  lessonTitle: string;
  russian: string;
  english: string;
  note?: string;
};

type Attempt = {
  word: WritingWord;
  answer: string;
  correct: boolean;
};

const sessionSize = 10;
const russianKeyboardRows = [
  ["й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ"],
  ["ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э"],
  ["я", "ч", "с", "м", "и", "т", "ь", "б", "ю"],
];

export function WritingPracticeClient() {
  const { language } = useExplanationLanguage();
  const text = getUiText(language);
  const writingText = text.writing;
  const inputRef = useRef<HTMLInputElement>(null);
  const words = useMemo(() => buildWritingWords(), []);
  const [mode, setMode] = useState<PracticeMode>("copy");
  const [sessionWords, setSessionWords] = useState<WritingWord[]>(() => buildSession(words, "copy"));
  const [activeIndex, setActiveIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<AnswerStatus>("idle");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [startedAt, setStartedAt] = useState(() => getTimestamp());
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [keyboardOpen, setKeyboardOpen] = useState(true);

  const activeWord = sessionWords[activeIndex] ?? sessionWords[0];
  const isFinished = Boolean(finishedAt);
  const completedCount = attempts.length;
  const correctCount = attempts.filter((attempt) => attempt.correct).length;
  const accuracy = completedCount === 0 ? 0 : Math.round((correctCount / completedCount) * 100);
  const difficultAttempts = attempts.filter((attempt) => !attempt.correct);
  const difficultWords = difficultAttempts.map((attempt) => attempt.word);
  const speedScore = mode === "speed" ? Math.max(0, correctCount * 100 - difficultAttempts.length * 25 - elapsedSeconds) : correctCount * 50;

  useEffect(() => {
    if (isFinished) return;

    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((getTimestamp() - startedAt) / 1000)));
    }, 500);

    return () => window.clearInterval(interval);
  }, [isFinished, startedAt]);

  function submitAnswer(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!activeWord || status !== "idle") return;

    const isCorrect = answersMatch(answer, activeWord.russian);
    setStatus(isCorrect ? "correct" : "wrong");

    const attempt = {
      word: activeWord,
      answer: answer.trim(),
      correct: isCorrect,
    };

    setAttempts((currentAttempts) => [...currentAttempts, attempt]);

    if (!isCorrect) {
      addMistake({
        lessonId: activeWord.lessonId,
        exerciseId: `writing-${activeWord.id}`,
        questionText: getPromptText(mode, activeWord, language),
        userAnswer: answer.trim() || writingText.noAnswer,
        correctAnswer: normalizeRussianText(activeWord.russian),
        explanation: `${normalizeRussianText(activeWord.russian)} = ${localizeMeaning(activeWord.english, language)}`,
        language,
      });
    }
  }

  function goNext() {
    if (activeIndex >= sessionWords.length - 1) {
      const now = getTimestamp();
      setFinishedAt(now);
      setElapsedSeconds(Math.max(0, Math.floor((now - startedAt) / 1000)));
      return;
    }

    setActiveIndex((index) => index + 1);
    setAnswer("");
    setStatus("idle");
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function skipWord() {
    if (!activeWord || status !== "idle") return;

    const target = normalizeRussianText(activeWord.russian);
    setAttempts((currentAttempts) => [
      ...currentAttempts,
      { word: activeWord, answer: writingText.skipped, correct: false },
    ]);
    addMistake({
      lessonId: activeWord.lessonId,
      exerciseId: `writing-${activeWord.id}`,
      questionText: getPromptText(mode, activeWord, language),
      userAnswer: writingText.skipped,
      correctAnswer: target,
      explanation: `${target} = ${localizeMeaning(activeWord.english, language)}`,
      language,
    });
    setStatus("wrong");
  }

  function restart(nextWords = buildSession(words, mode)) {
    setSessionWords(nextWords);
    setActiveIndex(0);
    setAnswer("");
    setStatus("idle");
    setAttempts([]);
    setStartedAt(getTimestamp());
    setFinishedAt(null);
    setElapsedSeconds(0);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function changeMode(nextMode: PracticeMode) {
    setMode(nextMode);
    restart(buildSession(words, nextMode));
  }

  function retryMissedWords() {
    const missed = uniqueWords(difficultWords);
    restart(missed.length > 0 ? missed : buildSession(words, mode));
  }

  function insertKey(key: string) {
    const input = inputRef.current;

    if (!input) {
      setAnswer((current) => `${current}${key}`);
      return;
    }

    const start = input.selectionStart ?? answer.length;
    const end = input.selectionEnd ?? answer.length;
    const nextAnswer = `${answer.slice(0, start)}${key}${answer.slice(end)}`;
    setAnswer(nextAnswer);
    window.requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + key.length, start + key.length);
    });
  }

  function backspace() {
    const input = inputRef.current;

    if (!input) {
      setAnswer((current) => current.slice(0, -1));
      return;
    }

    const start = input.selectionStart ?? answer.length;
    const end = input.selectionEnd ?? answer.length;

    if (start === 0 && end === 0) return;

    const nextStart = start === end ? start - 1 : start;
    const nextAnswer = `${answer.slice(0, nextStart)}${answer.slice(end)}`;
    setAnswer(nextAnswer);
    window.requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(nextStart, nextStart);
    });
  }

  if (words.length === 0) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navigation />
        <section className="mx-auto max-w-4xl px-4 pb-8 sm:px-6">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-center sm:rounded-3xl">
            <h1 className="text-3xl font-black" {...uiTextProps(language)}>{writingText.title}</h1>
            <p className="mt-3 text-slate-300" {...uiTextProps(language)}>{writingText.noWords}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <header className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-300" {...uiTextProps(language)}>
              {writingText.title}
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-5xl" {...uiTextProps(language)}>
              {writingText.subtitle}
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300" {...uiTextProps(language)}>
              {writingText.intro}
            </p>
          </div>
          <Link
            href="/practice"
            className="inline-flex w-full justify-center rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-black transition hover:border-yellow-300/40 hover:bg-yellow-300/10 sm:w-auto"
          >
            {text.dashboard.reviewMistakes}
          </Link>
        </header>

        <div className="mb-5 grid gap-3 sm:grid-cols-4">
          {(["copy", "meaning", "listen", "speed"] as PracticeMode[]).map((candidateMode) => (
            <button
              key={candidateMode}
              type="button"
              onClick={() => changeMode(candidateMode)}
              aria-pressed={mode === candidateMode}
              className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                mode === candidateMode
                  ? "border-cyan-300 bg-cyan-300 text-slate-950"
                  : "border-white/10 bg-white/10 text-slate-200 hover:border-cyan-300/50"
              }`}
              {...uiTextProps(language)}
            >
              {getModeLabel(candidateMode, writingText)}
            </button>
          ))}
        </div>

        {isFinished ? (
          <ResultScreen
            language={language}
            correctCount={correctCount}
            totalCount={sessionWords.length}
            accuracy={accuracy}
            elapsedSeconds={elapsedSeconds}
            difficultAttempts={difficultAttempts}
            score={speedScore}
            mode={mode}
            onRetryMissed={retryMissedWords}
            onRestart={() => restart()}
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <section className="min-w-0 rounded-2xl border border-cyan-300/20 bg-white/10 p-4 shadow-2xl shadow-cyan-950/30 sm:rounded-3xl sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-cyan-200" {...uiTextProps(language)}>
                    {writingText.wordsCompleted}: {completedCount}/{sessionWords.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-400" {...uiTextProps(language)}>
                    {activeWord.lessonTitle}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center sm:min-w-56">
                  <SmallStat label={writingText.accuracy} value={`${accuracy}%`} />
                  <SmallStat label={writingText.time} value={formatTime(elapsedSeconds)} />
                </div>
              </div>

              <PromptCard mode={mode} word={activeWord} language={language} />

              <form onSubmit={submitAnswer} className="mt-5">
                <label htmlFor="russian-answer" className="block text-sm font-black text-slate-300" {...uiTextProps(language)}>
                  {writingText.typeRussianWord}
                </label>
                <input
                  ref={inputRef}
                  id="russian-answer"
                  value={answer}
                  onChange={(event) => {
                    setAnswer(event.target.value);
                    if (status !== "idle") setStatus("idle");
                  }}
                  disabled={status !== "idle"}
                  autoComplete="off"
                  spellCheck={false}
                  lang="ru"
                  dir="ltr"
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-3xl font-black text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30 disabled:opacity-75 sm:px-5 sm:py-5 sm:text-4xl"
                  placeholder="..."
                />

                <LetterFeedback target={activeWord.russian} answer={answer} />

                {status !== "idle" ? (
                  <div
                    className={`mt-4 rounded-2xl border p-4 ${
                      status === "correct"
                        ? "border-emerald-300/40 bg-emerald-300/15"
                        : "border-red-300/40 bg-red-300/15"
                    }`}
                    role="status"
                  >
                    <p className="font-black" {...uiTextProps(language)}>
                      {status === "correct" ? writingText.correct : writingText.tryAgain}
                    </p>
                    {status === "wrong" ? (
                      <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                        <p className="rounded-xl bg-red-400/10 p-3" {...uiTextProps(language)}>
                          {writingText.yourAnswer}: <span dir="ltr" lang="ru">{answer.trim() || writingText.noAnswer}</span>
                        </p>
                        <p className="rounded-xl bg-green-400/10 p-3" {...uiTextProps(language)}>
                          {writingText.correctAnswer}: <span dir="ltr" lang="ru">{normalizeRussianText(activeWord.russian)}</span>
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {status === "idle" ? (
                    <button
                      type="submit"
                      className="rounded-full bg-cyan-400 px-5 py-4 font-black text-slate-950 transition hover:bg-cyan-300"
                      {...uiTextProps(language)}
                    >
                      {writingText.check}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={goNext}
                      className="rounded-full bg-cyan-400 px-5 py-4 font-black text-slate-950 transition hover:bg-cyan-300"
                      {...uiTextProps(language)}
                    >
                      {writingText.nextWord}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={skipWord}
                    disabled={status !== "idle"}
                    className="rounded-full border border-white/10 bg-slate-900/80 px-5 py-4 font-black text-white transition hover:border-yellow-300/40 disabled:opacity-50"
                    {...uiTextProps(language)}
                  >
                    {writingText.skip}
                  </button>
                  <button
                    type="button"
                    onClick={() => restart()}
                    className="rounded-full border border-white/10 bg-slate-900/80 px-5 py-4 font-black text-white transition hover:border-cyan-300/40"
                    {...uiTextProps(language)}
                  >
                    {writingText.restart}
                  </button>
                </div>
              </form>
            </section>

            <aside className="min-w-0">
              <RussianKeyboard
                open={keyboardOpen}
                language={language}
                onToggle={() => setKeyboardOpen((current) => !current)}
                onKey={insertKey}
                onBackspace={backspace}
                onSpace={() => insertKey(" ")}
              />
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

function PromptCard({
  mode,
  word,
  language,
}: {
  mode: PracticeMode;
  word: WritingWord;
  language: ExplanationLanguage;
}) {
  const writingText = getUiText(language).writing;
  const promptLabel = mode === "listen" ? writingText.listenAndType : mode === "meaning" ? writingText.typeRussianWord : writingText.copyPrompt;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 text-center sm:rounded-3xl sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400" {...uiTextProps(language)}>
        {promptLabel}
      </p>
      {mode === "copy" || mode === "speed" ? (
        <div className="mt-4 flex min-w-0 flex-wrap items-center justify-center gap-3">
          <p className="break-words text-4xl font-black leading-tight text-cyan-100 sm:text-6xl" dir="ltr" lang="ru">
            {normalizeRussianText(word.russian)}
          </p>
          <PronounceButton text={word.russian} className="h-12 w-12" />
        </div>
      ) : null}
      {mode === "meaning" ? (
        <div className="mt-4">
          <p className="text-3xl font-black leading-tight text-cyan-100 sm:text-5xl" {...explanationTextProps(language)}>
            {localizeMeaning(word.english, language)}
          </p>
          {word.note ? (
            <p className="mt-3 text-sm text-slate-400" {...explanationTextProps(language)}>
              {word.note}
            </p>
          ) : null}
        </div>
      ) : null}
      {mode === "listen" ? (
        <div className="mt-6 flex flex-col items-center gap-4">
          <PronounceButton text={word.russian} className="h-16 w-16 border-cyan-200 bg-cyan-300/20 text-cyan-50" />
          <p className="text-sm font-bold text-slate-400" {...uiTextProps(language)}>
            {writingText.listenPrompt}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function LetterFeedback({ target, answer }: { target: string; answer: string }) {
  const normalizedTarget = normalizeRussianText(target);
  const normalizedAnswer = answer.trim();
  const maxLength = Math.max(normalizedTarget.length, normalizedAnswer.length);
  const cells = Array.from({ length: maxLength }, (_, index) => {
    const targetChar = normalizedTarget[index] ?? "";
    const answerChar = normalizedAnswer[index] ?? "";
    const state = !answerChar ? "remaining" : charsMatch(answerChar, targetChar) ? "correct" : "wrong";

    return { targetChar, answerChar, state };
  });

  return (
    <div className="mt-4 flex min-h-12 flex-wrap gap-1.5 rounded-2xl border border-white/10 bg-slate-900/70 p-3" aria-live="polite">
      {cells.map((cell, index) => (
        <span
          key={`${cell.targetChar}-${index}`}
          className={`inline-flex h-9 min-w-8 items-center justify-center rounded-lg px-2 text-lg font-black ${
            cell.state === "correct"
              ? "bg-emerald-300 text-slate-950"
              : cell.state === "wrong"
                ? "bg-red-400 text-white"
                : "bg-slate-800 text-slate-500"
          }`}
          dir="ltr"
          lang="ru"
        >
          {cell.answerChar || cell.targetChar || " "}
        </span>
      ))}
    </div>
  );
}

function RussianKeyboard({
  open,
  language,
  onToggle,
  onKey,
  onBackspace,
  onSpace,
}: {
  open: boolean;
  language: ExplanationLanguage;
  onToggle: () => void;
  onKey: (key: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
}) {
  const writingText = getUiText(language).writing;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:rounded-3xl">
      <div className="flex items-center justify-between gap-3">
        <p className="font-black text-cyan-100" {...uiTextProps(language)}>{writingText.russianKeyboard}</p>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-2 text-xs font-black transition hover:border-cyan-300/40"
          {...uiTextProps(language)}
        >
          {open ? writingText.hideKeyboard : writingText.showKeyboard}
        </button>
      </div>
      {open ? (
        <div className="mt-4 grid gap-2">
          {russianKeyboardRows.map((row) => (
            <div key={row.join("")} className="flex justify-center gap-1.5">
              {row.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onKey(key)}
                  className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900/90 text-lg font-black text-white transition hover:border-cyan-300/50 hover:bg-cyan-300/10"
                  dir="ltr"
                  lang="ru"
                >
                  {key}
                </button>
              ))}
            </div>
          ))}
          <div className="grid grid-cols-[1fr_2fr_1fr] gap-2">
            <button type="button" onClick={onBackspace} className="rounded-xl border border-white/10 bg-slate-900/90 px-3 py-3 text-sm font-black transition hover:border-red-300/50">
              Back
            </button>
            <button type="button" onClick={onSpace} className="rounded-xl border border-white/10 bg-slate-900/90 px-3 py-3 text-sm font-black transition hover:border-cyan-300/50">
              Space
            </button>
            <button type="button" onClick={() => onKey("ё")} className="rounded-xl border border-white/10 bg-slate-900/90 px-3 py-3 text-lg font-black transition hover:border-cyan-300/50" dir="ltr" lang="ru">
              ё
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ResultScreen({
  language,
  correctCount,
  totalCount,
  accuracy,
  elapsedSeconds,
  difficultAttempts,
  score,
  mode,
  onRetryMissed,
  onRestart,
}: {
  language: ExplanationLanguage;
  correctCount: number;
  totalCount: number;
  accuracy: number;
  elapsedSeconds: number;
  difficultAttempts: Attempt[];
  score: number;
  mode: PracticeMode;
  onRetryMissed: () => void;
  onRestart: () => void;
}) {
  const writingText = getUiText(language).writing;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl shadow-cyan-950/30 sm:rounded-3xl sm:p-8">
      <div className="text-center">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-300" {...uiTextProps(language)}>
          {writingText.sessionComplete}
        </p>
        <h2 className="mt-3 text-3xl font-black sm:text-5xl" {...uiTextProps(language)}>
          {mode === "speed" ? `${writingText.score}: ${score}` : writingText.writingPractice}
        </h2>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-4">
        <ResultStat title={writingText.correct} value={`${correctCount}/${totalCount}`} />
        <ResultStat title={writingText.accuracy} value={`${accuracy}%`} />
        <ResultStat title={writingText.time} value={formatTime(elapsedSeconds)} />
        <ResultStat title={writingText.wordsCompleted} value={totalCount.toString()} />
      </div>

      <div className="mt-7 rounded-2xl border border-yellow-300/25 bg-yellow-300/10 p-4 sm:rounded-3xl">
        <p className="font-black text-yellow-100" {...uiTextProps(language)}>
          {writingText.difficultWords}
        </p>
        {difficultAttempts.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {difficultAttempts.map((attempt) => (
              <div key={`${attempt.word.id}-${attempt.answer}`} className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                <p className="text-2xl font-black text-cyan-100" dir="ltr" lang="ru">{normalizeRussianText(attempt.word.russian)}</p>
                <p className="mt-1 text-sm text-slate-300" {...explanationTextProps(language)}>
                  {localizeMeaning(attempt.word.english, language)}
                </p>
                <p className="mt-2 text-xs text-red-100" {...uiTextProps(language)}>
                  {writingText.yourAnswer}: <span dir="ltr" lang="ru">{attempt.answer}</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-300" {...uiTextProps(language)}>{writingText.noDifficultWords}</p>
        )}
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <button type="button" onClick={onRetryMissed} className="rounded-full bg-yellow-300 px-5 py-4 font-black text-slate-950 transition hover:bg-yellow-200" {...uiTextProps(language)}>
          {writingText.practiceMissedWords}
        </button>
        <button type="button" onClick={onRestart} className="rounded-full bg-cyan-400 px-5 py-4 font-black text-slate-950 transition hover:bg-cyan-300" {...uiTextProps(language)}>
          {writingText.restart}
        </button>
        <Link href="/dashboard" className="rounded-full border border-white/10 bg-slate-900/80 px-5 py-4 text-center font-black transition hover:border-cyan-300/40" {...uiTextProps(language)}>
          {writingText.backToDashboard}
        </Link>
      </div>
    </section>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 font-black text-cyan-100">{value}</p>
    </div>
  );
}

function ResultStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 text-center">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-black text-cyan-100">{value}</p>
    </div>
  );
}

function buildWritingWords(): WritingWord[] {
  const seen = new Set<string>();

  return worlds.flatMap((world) =>
    world.lessons.flatMap((lesson) =>
      lesson.vocabulary.flatMap((item: VocabularyItem, index) => {
        const russian = normalizeRussianText(item.russian).trim();
        const english = item.english.trim();

        if (!russian || !english || seen.has(normalizeForComparison(russian))) {
          return [];
        }

        seen.add(normalizeForComparison(russian));

        return [
          {
            id: `${lesson.id}-${index}`,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            russian,
            english,
            note: item.note,
          },
        ];
      }),
    ),
  );
}

function buildSession(words: WritingWord[], mode: PracticeMode) {
  const count = mode === "speed" ? sessionSize : Math.min(12, words.length);
  return stableShuffle(words, `${mode}-${new Date().toDateString()}`).slice(0, count);
}

function stableShuffle<T extends { id: string }>(items: T[], seed: string) {
  return [...items].sort((left, right) => stableHash(`${seed}:${left.id}`) - stableHash(`${seed}:${right.id}`));
}

function stableHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function answersMatch(answer: string, target: string) {
  return normalizeForComparison(answer) === normalizeForComparison(normalizeRussianText(target));
}

function charsMatch(answerChar: string, targetChar: string) {
  return normalizeForComparison(answerChar) === normalizeForComparison(targetChar);
}

function normalizeForComparison(value: string) {
  return value.trim().replaceAll("ё", "е").replaceAll("Ё", "Е").toLocaleLowerCase("ru-RU");
}

function getPromptText(mode: PracticeMode, word: WritingWord, language: ExplanationLanguage) {
  if (mode === "meaning") {
    return localizeMeaning(word.english, language);
  }

  if (mode === "listen") {
    return getUiText(language).writing.listenAndType;
  }

  return normalizeRussianText(word.russian);
}

function getModeLabel(mode: PracticeMode, writingText: ReturnType<typeof getUiText>["writing"]) {
  if (mode === "copy") return writingText.copyMode;
  if (mode === "meaning") return writingText.meaningMode;
  if (mode === "listen") return writingText.listenMode;
  return writingText.speedMode;
}

function uniqueWords(words: WritingWord[]) {
  const seen = new Set<string>();

  return words.filter((word) => {
    if (seen.has(word.id)) return false;
    seen.add(word.id);
    return true;
  });
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getTimestamp() {
  return new Date().getTime();
}
