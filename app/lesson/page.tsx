"use client";

import { Navigation } from "@/components/Navigation";
import { useExplanationLanguage } from "@/components/LanguageSelector";
import {
  isRussianText,
  normalizeRussianText,
  PronounceButton,
} from "@/components/PronounceButton";
import {
  type ExplanationLanguage,
} from "@/lib/language-preference";
import {
  getUiText,
  localizeActionLabel,
  localizeLessonDescription,
  localizeLessonTitle,
  uiTextProps,
} from "@/lib/ui-translations";
import {
  explanationTextProps,
  localizeExplanation,
  localizeLearningText,
  localizeMeaning,
  localizeNote,
  tUi,
} from "@/lib/russian-explanations";
import {
  worldOne,
  type Lesson,
  type LessonExercise,
  type MatchingExercise,
  type SentenceOrderExercise,
} from "@/lib/learning-data";
import {
  completeLesson,
  getNextAvailableLabel,
  getNextAvailablePath,
  getLessonProgressState,
  type SavedProgress,
  useProgress,
} from "@/lib/progress-storage";
import Link from "next/link";
import { useState } from "react";

const startingHearts = 5;

export default function LessonPage() {
  return <LessonExperience lesson={worldOne.lessons[0]} />;
}

export function LessonExperience({ lesson }: { lesson: Lesson }) {
  const { language } = useExplanationLanguage();
  const text = getUiText(language);
  const progressState = useProgress();
  const lessonState = getLessonProgressState(lesson, progressState);
  const currentLesson = lesson;
  const currentLessonTitle = localizeLessonTitle(currentLesson.title, language);
  const currentLessonDescription = localizeLessonDescription(currentLesson.description, language);
  const lessonExercises: LessonExercise[] = currentLesson.exercises;
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [selectedWordIndexes, setSelectedWordIndexes] = useState<number[]>([]);
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({});
  const [selectedRussian, setSelectedRussian] = useState("");
  const [selectedEnglish, setSelectedEnglish] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [lastAnswerWasCorrect, setLastAnswerWasCorrect] = useState(false);
  const [xp, setXp] = useState(0);
  const [hearts, setHearts] = useState(startingHearts);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [completionProgress, setCompletionProgress] = useState<SavedProgress | null>(null);

  const currentExercise = lessonExercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / lessonExercises.length) * 100;

  function applyResult(isCorrect: boolean) {
    if (isAnswered) return;

    setIsAnswered(true);
    setLastAnswerWasCorrect(isCorrect);

    if (isCorrect) {
      setXp((previousXp) => previousXp + currentExercise.points);
      setCorrectCount((previousCount) => previousCount + 1);
      return;
    }

    setHearts((previousHearts) => Math.max(previousHearts - 1, 0));
  }

  function handleChoiceAnswer(answer: string, correctAnswer: string) {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    applyResult(answer === correctAnswer);
  }

  function handleWordClick(wordIndex: number) {
    if (isAnswered || selectedWordIndexes.includes(wordIndex)) return;

    setSelectedWordIndexes((previousIndexes) => [...previousIndexes, wordIndex]);
  }

  function handleWordRemove(wordIndex: number) {
    if (isAnswered) return;

    setSelectedWordIndexes((previousIndexes) =>
      previousIndexes.filter((selectedIndex) => selectedIndex !== wordIndex),
    );
  }

  function handleSentenceSubmit(exercise: SentenceOrderExercise) {
    if (isAnswered || selectedWordIndexes.length !== exercise.words.length) return;

    const builtSentence = selectedWordIndexes.map((wordIndex) => exercise.words[wordIndex]);
    applyResult(builtSentence.join(" ") === exercise.correctOrder.join(" "));
  }

  function handleRussianMatchSelect(russian: string) {
    if (isAnswered) return;

    setSelectedRussian((currentSelection) => (currentSelection === russian ? "" : russian));

    if (selectedEnglish) {
      setMatchingAnswers((previousAnswers) => ({
        ...previousAnswers,
        [russian]: selectedEnglish,
      }));
      setSelectedRussian("");
      setSelectedEnglish("");
    }
  }

  function handleEnglishMatchSelect(english: string) {
    if (isAnswered) return;

    setSelectedEnglish((currentSelection) => (currentSelection === english ? "" : english));

    if (selectedRussian) {
      setMatchingAnswers((previousAnswers) => ({
        ...previousAnswers,
        [selectedRussian]: english,
      }));
      setSelectedRussian("");
      setSelectedEnglish("");
    }
  }

  function handleMatchingSubmit(exercise: MatchingExercise) {
    if (isAnswered || Object.keys(matchingAnswers).length !== exercise.pairs.length) return;

    const allPairsCorrect = exercise.pairs.every(
      (pair) => matchingAnswers[pair.russian] === pair.english,
    );

    applyResult(allPairsCorrect);
  }

  function handleNext() {
    if (currentExerciseIndex === lessonExercises.length - 1) {
      const nextProgress = completeLesson(currentLesson.id, xp);
      setCompletionProgress(nextProgress);
      setIsFinished(true);
      return;
    }

    setCurrentExerciseIndex((previousIndex) => previousIndex + 1);
    setSelectedAnswer("");
    setSelectedWordIndexes([]);
    setMatchingAnswers({});
    setSelectedRussian("");
    setSelectedEnglish("");
    setIsAnswered(false);
    setLastAnswerWasCorrect(false);
  }

  function handleRestart() {
    setCurrentExerciseIndex(0);
    setSelectedAnswer("");
    setSelectedWordIndexes([]);
    setMatchingAnswers({});
    setSelectedRussian("");
    setSelectedEnglish("");
    setIsAnswered(false);
    setLastAnswerWasCorrect(false);
    setXp(0);
    setHearts(startingHearts);
    setCorrectCount(0);
    setIsFinished(false);
    setCompletionProgress(null);
  }

  if (lessonState.locked) {
    return <LockedLesson lesson={currentLesson} language={language} />;
  }

  if (isFinished) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navigation />
        <section className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-4xl items-center px-4 pb-8 sm:px-6">
          <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-2xl shadow-cyan-950/30 sm:rounded-3xl">
            <div className="bg-cyan-400 p-5 text-center text-slate-950 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.25em] sm:text-sm sm:tracking-[0.35em]">
                {tUi("lessonComplete", language)}
              </p>
              <h1 className="mt-3 break-words text-3xl font-black md:text-6xl" {...uiTextProps(language)}>
                {currentLessonTitle} {text.lesson.cleared}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl font-semibold" {...uiTextProps(language)}>
                {text.lesson.practiced} {currentLessonDescription.toLowerCase()}
              </p>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <ResultStat title={tUi("xpEarned", language)} value={xp.toString()} tone="cyan" />
                <ResultStat title={tUi("heartsLeft", language)} value={hearts.toString()} tone="red" />
                <ResultStat
                  title={tUi("accuracy", language)}
                  value={`${correctCount}/${lessonExercises.length}`}
                  tone="yellow"
                />
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={getNextAvailablePath(completionProgress ?? progressState)}
                  className="inline-flex flex-1 justify-center rounded-full bg-cyan-400 px-7 py-4 font-bold text-slate-950 transition hover:bg-cyan-300"
                >
                  {localizeActionLabel(getNextAvailableLabel(completionProgress ?? progressState), language)}
                </Link>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="inline-flex flex-1 justify-center rounded-full border border-white/10 bg-white/10 px-7 py-4 font-bold text-white transition hover:border-white/30 hover:bg-white/15"
                >
                  {tUi("replayLesson", language)}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Link href="/worlds" className="text-sm text-slate-400 hover:text-white" {...uiTextProps(language)}>
              {text.lesson.backToWorlds}
            </Link>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300 sm:text-sm sm:tracking-[0.3em]">
              {text.nav.lesson} {currentLesson.number}
            </p>
            <h1 className="mt-3 break-words text-3xl font-black sm:text-4xl md:text-6xl" {...uiTextProps(language)}>
              {currentLessonTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-slate-400" {...uiTextProps(language)}>
              {currentLessonDescription}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <StatusPill label="XP" value={xp.toString()} tone="cyan" />
            <StatusPill label={tUi("hearts", language)} value={hearts.toString()} tone="red" />
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-white/10 bg-white/10 p-4 sm:rounded-3xl sm:p-5">
          <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
            <span>
              {text.lesson.exercise} {currentExerciseIndex + 1} of {lessonExercises.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.38fr]">
          <div className={`min-w-0 rounded-2xl border p-4 shadow-2xl sm:rounded-3xl sm:p-6 md:p-8 ${getExerciseFrame(currentExercise.type)}`}>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-sm sm:tracking-[0.25em]">
                  {getExerciseLabel(currentExercise.type, language)}
                </p>
                <h2
                  className="mt-3 break-words text-xl font-bold sm:text-2xl md:text-3xl"
                  {...explanationTextProps(language)}
                >
                  {localizeLearningText(currentExercise.prompt, language)}
                </h2>
              </div>
              <span className="w-fit rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950">
                +{currentExercise.points} XP
              </span>
            </div>

            <ExerciseView
              exercise={currentExercise}
              selectedAnswer={selectedAnswer}
              selectedWordIndexes={selectedWordIndexes}
              matchingAnswers={matchingAnswers}
              selectedRussian={selectedRussian}
              selectedEnglish={selectedEnglish}
              isAnswered={isAnswered}
              onChoiceAnswer={handleChoiceAnswer}
              onWordClick={handleWordClick}
              onWordRemove={handleWordRemove}
              onSentenceSubmit={handleSentenceSubmit}
              onRussianMatchSelect={handleRussianMatchSelect}
              onEnglishMatchSelect={handleEnglishMatchSelect}
              onMatchingSubmit={handleMatchingSubmit}
              language={language}
            />

            {isAnswered && (
              <div
                className={`mt-6 rounded-2xl p-5 ${
                  lastAnswerWasCorrect ? "bg-green-400/20" : "bg-red-400/20"
                }`}
              >
                <p className="font-bold">
                  {lastAnswerWasCorrect ? tUi("correct", language) : tUi("tryAgain", language)}
                </p>
                <p className="mt-2 text-sm text-slate-300" {...explanationTextProps(language)}>
                  {localizeExplanation(currentExercise.explanation, language)}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={!isAnswered}
              aria-disabled={!isAnswered}
              className={`mt-8 w-full rounded-full px-6 py-4 font-bold transition ${
                isAnswered
                  ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                  : "bg-slate-800 text-slate-500"
              }`}
            >
              {currentExerciseIndex === lessonExercises.length - 1
                ? tUi("finishLesson", language)
                : tUi("nextExercise", language)}
            </button>
          </div>

          <aside className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-4 sm:rounded-3xl sm:p-6">
            <p className="text-sm text-slate-400">{tUi("runStatus", language)}</p>
            <div className="mt-5 space-y-3">
              <SideStat label={tUi("correct", language).replace(".", "")} value={correctCount.toString()} />
              <SideStat label={tUi("mistakes", language)} value={(startingHearts - hearts).toString()} />
              <SideStat label={tUi("currentType", language)} value={getShortExerciseLabel(currentExercise.type, language)} />
            </div>

            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="text-sm text-slate-400">{tUi("lessonVocabulary", language)}</p>
              <div className="mt-4 space-y-3">
                {currentLesson.vocabulary.map((item) => (
                  <div
                    key={`${item.russian}-${item.english}`}
                    className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-lg font-black">{normalizeRussianText(item.russian)}</p>
                      <PronounceButton text={item.russian} />
                    </div>
                    <p className="mt-1 text-sm text-slate-300" {...explanationTextProps(language)}>
                      {localizeMeaning(item.english, language)}
                    </p>
                    {item.note && (
                      <p className="mt-1 text-xs text-slate-500" {...explanationTextProps(language)}>
                        {localizeNote(item.note, language)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function LockedLesson({
  lesson,
  language,
}: {
  lesson: Lesson;
  language: ExplanationLanguage;
}) {
  const text = getUiText(language);
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-3xl items-center px-4 pb-8 sm:px-6">
        <div className="w-full rounded-2xl border border-white/10 bg-white/10 p-5 text-center shadow-2xl shadow-cyan-950/30 sm:rounded-3xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 sm:text-sm sm:tracking-[0.35em]">
            {text.lesson.lessonLocked}
          </p>
          <h1 className="mt-4 text-3xl font-black md:text-5xl">
            {localizeLessonTitle(lesson.title, language)} {text.lesson.unavailableYet}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            {text.lesson.unlockStep}
          </p>
          <Link
            href="/worlds"
            className="mt-8 inline-flex w-full justify-center rounded-full bg-cyan-400 px-7 py-4 font-bold text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
          >
            {text.lesson.backToWorlds}
          </Link>
        </div>
      </section>
    </main>
  );
}

function ExerciseView({
  exercise,
  selectedAnswer,
  selectedWordIndexes,
  matchingAnswers,
  selectedRussian,
  selectedEnglish,
  isAnswered,
  onChoiceAnswer,
  onWordClick,
  onWordRemove,
  onSentenceSubmit,
  onRussianMatchSelect,
  onEnglishMatchSelect,
  onMatchingSubmit,
  language,
}: {
  exercise: LessonExercise;
  selectedAnswer: string;
  selectedWordIndexes: number[];
  matchingAnswers: Record<string, string>;
  selectedRussian: string;
  selectedEnglish: string;
  isAnswered: boolean;
  onChoiceAnswer: (answer: string, correctAnswer: string) => void;
  onWordClick: (wordIndex: number) => void;
  onWordRemove: (wordIndex: number) => void;
  onSentenceSubmit: (exercise: SentenceOrderExercise) => void;
  onRussianMatchSelect: (russian: string) => void;
  onEnglishMatchSelect: (english: string) => void;
  onMatchingSubmit: (exercise: MatchingExercise) => void;
  language: ExplanationLanguage;
}) {
  if (exercise.type === "multipleChoice") {
    return (
      <>
        <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-4 text-center sm:rounded-3xl sm:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 sm:text-sm sm:tracking-[0.25em]" {...explanationTextProps(language)}>
            {getUiText(language).lesson.russian}
          </p>
          <div className="mt-4 flex min-w-0 flex-wrap items-center justify-center gap-3">
            <p className="break-words text-3xl font-black sm:text-5xl">{normalizeRussianText(exercise.display)}</p>
            <PronounceButton text={exercise.display} />
          </div>
        </div>
        <ChoiceGrid
          options={exercise.options}
          selectedAnswer={selectedAnswer}
          correctAnswer={exercise.correctAnswer}
          isAnswered={isAnswered}
          onSelect={(answer) => onChoiceAnswer(answer, exercise.correctAnswer)}
          language={language}
        />
      </>
    );
  }

  if (exercise.type === "fillBlank") {
    return (
      <>
        <div className="mt-8 rounded-2xl border border-yellow-400/20 bg-slate-900/80 p-4 text-center sm:rounded-3xl sm:p-7">
          <p className="break-words text-lg font-bold leading-9 md:text-3xl md:leading-10">
            {exercise.beforeBlank}{" "}
            <span className="inline-flex min-w-20 justify-center border-b-4 border-yellow-300 px-2 text-yellow-200 sm:min-w-28 sm:px-4">
              {selectedAnswer ? normalizeRussianText(selectedAnswer) : "?"}
            </span>
            {exercise.afterBlank}
          </p>
        </div>
        <ChoiceGrid
          options={exercise.options}
          selectedAnswer={selectedAnswer}
          correctAnswer={exercise.correctAnswer}
          isAnswered={isAnswered}
          onSelect={(answer) => onChoiceAnswer(answer, exercise.correctAnswer)}
          language={language}
        />
      </>
    );
  }

  if (exercise.type === "sentenceOrder") {
    const selectedWords = selectedWordIndexes.map((wordIndex) => ({
      index: wordIndex,
      word: exercise.words[wordIndex],
    }));

    return (
      <div className="mt-8">
        <div className="rounded-2xl border border-violet-400/20 bg-slate-900/80 p-4 sm:rounded-3xl sm:p-6">
          <p className="text-sm text-slate-400">{tUi("targetMeaning", language)}</p>
          <p
            className="mt-2 break-words text-xl font-black sm:text-2xl"
            {...explanationTextProps(language)}
          >
            {localizeMeaning(exercise.translation, language)}
          </p>
        </div>

        <div className="mt-5 min-h-24 rounded-2xl border border-dashed border-violet-300/40 bg-violet-400/10 p-3 sm:rounded-3xl sm:p-4">
          <div className="flex flex-wrap gap-3">
            {selectedWords.length === 0 ? (
              <span className="py-3 text-sm text-slate-500">
                {tUi("chooseWordsBelow", language)}
              </span>
            ) : (
              selectedWords.map((selectedWord) => (
                <div key={selectedWord.index} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onWordRemove(selectedWord.index)}
                    className="max-w-full break-words rounded-2xl bg-violet-300 px-3 py-2 font-black text-slate-950 transition hover:bg-violet-200 sm:px-4 sm:py-3"
                  >
                    {normalizeRussianText(selectedWord.word)}
                  </button>
                  <PronounceButton text={selectedWord.word} className="h-8 w-8" />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {exercise.words.map((word, wordIndex) => {
            const wasSelected = selectedWordIndexes.includes(wordIndex);

            return (
              <div key={`${word}-${wordIndex}`} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onWordClick(wordIndex)}
                  disabled={wasSelected || isAnswered}
                  aria-disabled={wasSelected || isAnswered}
                  className={`max-w-full break-words rounded-2xl border px-3 py-3 font-bold transition sm:px-5 sm:py-4 ${
                    wasSelected
                      ? "border-slate-800 bg-slate-800 text-slate-600"
                      : "border-white/10 bg-slate-900/80 hover:border-violet-300/60"
                  }`}
                >
                  {normalizeRussianText(word)}
                </button>
                <PronounceButton text={word} className="h-8 w-8" />
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onSentenceSubmit(exercise)}
          disabled={isAnswered || selectedWordIndexes.length !== exercise.words.length}
          aria-disabled={isAnswered || selectedWordIndexes.length !== exercise.words.length}
          className={`mt-6 w-full rounded-full px-6 py-4 font-bold transition ${
            !isAnswered && selectedWordIndexes.length === exercise.words.length
              ? "bg-violet-300 text-slate-950 hover:bg-violet-200"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          {tUi("checkSentence", language)}
        </button>
      </div>
    );
  }

  if (exercise.type === "matching") {
    return (
      <div className="mt-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            {exercise.pairs.map((pair) => (
              <div key={pair.russian} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onRussianMatchSelect(pair.russian)}
                  disabled={isAnswered}
                  aria-disabled={isAnswered}
                  className={`min-w-0 flex-1 rounded-2xl border p-3 text-left transition sm:p-4 ${
                    selectedRussian === pair.russian
                      ? "border-emerald-300 bg-emerald-300/20"
                      : "border-white/10 bg-slate-900/80 hover:border-emerald-300/50"
                  }`}
                >
                  <span className="block break-words text-lg font-black sm:text-xl">
                    {normalizeRussianText(pair.russian)}
                  </span>
                  <span className="mt-1 block text-sm text-slate-400">
                    {tUi("matchedTo", language)}{" "}
                    {matchingAnswers[pair.russian]
                      ? localizeMeaning(matchingAnswers[pair.russian], language)
                      : tUi("notMatched", language)}
                  </span>
                </button>
                <PronounceButton text={pair.russian} />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {exercise.englishOptions.map((english) => (
              <button
                type="button"
                key={english}
                onClick={() => onEnglishMatchSelect(english)}
                disabled={isAnswered}
                aria-disabled={isAnswered}
                className={`w-full rounded-2xl border p-3 text-left font-bold transition sm:p-4 ${
                  selectedEnglish === english
                    ? "border-cyan-300 bg-cyan-300/20"
                    : "border-white/10 bg-slate-900/80 hover:border-cyan-300/50"
                }`}
              >
                <span {...explanationTextProps(language)}>
                  {localizeMeaning(english, language)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onMatchingSubmit(exercise)}
          disabled={isAnswered || Object.keys(matchingAnswers).length !== exercise.pairs.length}
          aria-disabled={isAnswered || Object.keys(matchingAnswers).length !== exercise.pairs.length}
          className={`mt-6 w-full rounded-full px-6 py-4 font-bold transition ${
            !isAnswered && Object.keys(matchingAnswers).length === exercise.pairs.length
              ? "bg-emerald-300 text-slate-950 hover:bg-emerald-200"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          {tUi("checkMatches", language)}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 rounded-2xl border border-orange-300/20 bg-slate-900/80 p-4 sm:rounded-3xl sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200 sm:text-sm sm:tracking-[0.25em]">
          Real-life situation
        </p>
        <p
          className="mt-4 break-words text-lg font-bold leading-8 text-slate-100 sm:text-xl"
          {...explanationTextProps(language)}
        >
          {localizeLearningText(exercise.situation, language)}
        </p>
      </div>
      <ChoiceGrid
        options={exercise.options}
        selectedAnswer={selectedAnswer}
        correctAnswer={exercise.correctAnswer}
        isAnswered={isAnswered}
        onSelect={(answer) => onChoiceAnswer(answer, exercise.correctAnswer)}
        language={language}
      />
    </>
  );
}

function ChoiceGrid({
  options,
  selectedAnswer,
  correctAnswer,
  isAnswered,
  onSelect,
  language,
}: {
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
  isAnswered: boolean;
  onSelect: (answer: string) => void;
  language: ExplanationLanguage;
}) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {options.map((option) => {
        const isSelected = selectedAnswer === option;
        const isRightOption = option === correctAnswer;
        let buttonStyle = "border-white/10 bg-slate-900/80 hover:border-cyan-400/50";

        if (isAnswered && isRightOption) {
          buttonStyle = "border-green-400 bg-green-400/20";
        }

        if (isAnswered && isSelected && !isRightOption) {
          buttonStyle = "border-red-400 bg-red-400/20";
        }

        return (
          <div key={option} className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect(option)}
              disabled={isAnswered}
              aria-disabled={isAnswered}
              className={`min-w-0 flex-1 break-words rounded-2xl border p-4 text-left font-semibold transition sm:p-5 ${buttonStyle}`}
            >
              <span {...(!isRussianText(option) ? explanationTextProps(language) : {})}>
                {isRussianText(option) ? normalizeRussianText(option) : localizeMeaning(option, language)}
              </span>
            </button>
            {isRussianText(option) && <PronounceButton text={option} />}
          </div>
        );
      })}
    </div>
  );
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "red";
}) {
  const toneClass = {
    cyan: "bg-cyan-400 text-slate-950",
    red: "bg-red-400 text-slate-950",
  }[tone];

  return (
    <div className={`rounded-2xl px-3 py-3 font-black sm:px-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 text-xl sm:text-2xl">{value}</p>
    </div>
  );
}

function ResultStat({
  title,
  value,
  tone,
}: {
  title: string;
  value: string;
  tone: "cyan" | "red" | "yellow";
}) {
  const toneClass = {
    cyan: "text-cyan-300",
    red: "text-red-300",
    yellow: "text-yellow-300",
  }[tone];

  return (
    <div className="rounded-2xl bg-slate-900/80 p-5 text-center">
      <p className="text-sm text-slate-400">{title}</p>
      <p className={`mt-2 text-3xl font-black ${toneClass}`}>{value}</p>
    </div>
  );
}

function SideStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function getExerciseLabel(type: LessonExercise["type"], language: ExplanationLanguage) {
  const lessonText = getUiText(language).lesson;
  const labels = {
    multipleChoice: lessonText.multipleChoice,
    fillBlank: lessonText.fillBlank,
    sentenceOrder: lessonText.sentenceOrder,
    matching: lessonText.matching,
    scenarioChoice: lessonText.scenarioChoice,
  };

  return labels[type];
}

function getShortExerciseLabel(type: LessonExercise["type"], language: ExplanationLanguage) {
  const lessonText = getUiText(language).lesson;
  const labels = {
    multipleChoice: lessonText.choice,
    fillBlank: lessonText.blank,
    sentenceOrder: lessonText.order,
    matching: lessonText.match,
    scenarioChoice: lessonText.scenario,
  };

  return labels[type];
}

function getExerciseFrame(type: LessonExercise["type"]) {
  const frames = {
    multipleChoice: "border-cyan-400/20 bg-white/10 shadow-cyan-950/30",
    fillBlank: "border-yellow-400/20 bg-yellow-400/10 shadow-yellow-950/20",
    sentenceOrder: "border-violet-400/20 bg-violet-400/10 shadow-violet-950/20",
    matching: "border-emerald-400/20 bg-emerald-400/10 shadow-emerald-950/20",
    scenarioChoice: "border-orange-300/20 bg-orange-300/10 shadow-orange-950/20",
  };

  return frames[type];
}
