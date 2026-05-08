"use client";

import { Navigation } from "@/components/Navigation";
import {
  isRussianText,
  normalizeRussianText,
  PronounceButton,
} from "@/components/PronounceButton";
import {
  worldOne,
  type LessonExercise,
  type MatchingExercise,
  type SentenceOrderExercise,
} from "@/lib/learning-data";
import Link from "next/link";
import { useState } from "react";

const currentLesson = worldOne.lessons[0];
const lessonExercises: LessonExercise[] = currentLesson.exercises;
const startingHearts = 5;

export default function LessonPage() {
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
  }

  if (isFinished) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navigation />
        <section className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-4xl items-center px-6 pb-8">
          <div className="w-full overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-cyan-950/30">
            <div className="bg-cyan-400 p-8 text-center text-slate-950">
              <p className="text-sm font-black uppercase tracking-[0.35em]">Lesson Complete</p>
              <h1 className="mt-3 text-4xl font-black md:text-6xl">{currentLesson.title} Cleared</h1>
              <p className="mx-auto mt-4 max-w-2xl font-semibold">
                You practiced {currentLesson.description.toLowerCase()}
              </p>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <ResultStat title="XP earned" value={xp.toString()} tone="cyan" />
                <ResultStat title="Hearts left" value={hearts.toString()} tone="red" />
                <ResultStat
                  title="Accuracy"
                  value={`${correctCount}/${lessonExercises.length}`}
                  tone="yellow"
                />
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex flex-1 justify-center rounded-full bg-cyan-400 px-7 py-4 font-bold text-slate-950 transition hover:bg-cyan-300"
                >
                  Back to Dashboard
                </Link>
                <button
                  onClick={handleRestart}
                  className="inline-flex flex-1 justify-center rounded-full border border-white/10 bg-white/10 px-7 py-4 font-bold text-white transition hover:border-white/30 hover:bg-white/15"
                >
                  Replay Lesson
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
      <section className="mx-auto max-w-5xl px-6 pb-8">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Link href="/worlds" className="text-sm text-slate-400 hover:text-white">
              Back to Worlds
            </Link>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Lesson {currentLesson.number}
            </p>
            <h1 className="mt-3 text-4xl font-black md:text-6xl">{currentLesson.title}</h1>
            <p className="mt-3 max-w-2xl text-slate-400">{currentLesson.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <StatusPill label="XP" value={xp.toString()} tone="cyan" />
            <StatusPill label="Hearts" value={hearts.toString()} tone="red" />
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-white/10 bg-white/10 p-5">
          <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
            <span>
              Exercise {currentExerciseIndex + 1} of {lessonExercises.length}
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
          <div className={`rounded-3xl border p-6 shadow-2xl md:p-8 ${getExerciseFrame(currentExercise.type)}`}>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                  {getExerciseLabel(currentExercise.type)}
                </p>
                <h2 className="mt-3 text-2xl font-bold md:text-3xl">{currentExercise.prompt}</h2>
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
            />

            {isAnswered && (
              <div
                className={`mt-6 rounded-2xl p-5 ${
                  lastAnswerWasCorrect ? "bg-green-400/20" : "bg-red-400/20"
                }`}
              >
                <p className="font-bold">
                  {lastAnswerWasCorrect ? "Correct." : "Not quite."}
                </p>
                <p className="mt-2 text-sm text-slate-300">{currentExercise.explanation}</p>
              </div>
            )}

            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`mt-8 w-full rounded-full px-6 py-4 font-bold transition ${
                isAnswered
                  ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                  : "bg-slate-800 text-slate-500"
              }`}
            >
              {currentExerciseIndex === lessonExercises.length - 1
                ? "Finish Lesson"
                : "Next Exercise"}
            </button>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/10 p-6">
            <p className="text-sm text-slate-400">Run status</p>
            <div className="mt-5 space-y-3">
              <SideStat label="Correct" value={correctCount.toString()} />
              <SideStat label="Mistakes" value={(startingHearts - hearts).toString()} />
              <SideStat label="Current type" value={getShortExerciseLabel(currentExercise.type)} />
            </div>

            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="text-sm text-slate-400">Lesson vocabulary</p>
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
                    <p className="mt-1 text-sm text-slate-300">{item.english}</p>
                    {item.note && <p className="mt-1 text-xs text-slate-500">{item.note}</p>}
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
}) {
  if (exercise.type === "multipleChoice") {
    return (
      <>
        <div className="mt-8 rounded-3xl border border-cyan-400/20 bg-slate-900/80 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Russian</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <p className="text-5xl font-black">{normalizeRussianText(exercise.display)}</p>
            <PronounceButton text={exercise.display} />
          </div>
        </div>
        <ChoiceGrid
          options={exercise.options}
          selectedAnswer={selectedAnswer}
          correctAnswer={exercise.correctAnswer}
          isAnswered={isAnswered}
          onSelect={(answer) => onChoiceAnswer(answer, exercise.correctAnswer)}
        />
      </>
    );
  }

  if (exercise.type === "fillBlank") {
    return (
      <>
        <div className="mt-8 rounded-3xl border border-yellow-400/20 bg-slate-900/80 p-7 text-center">
          <p className="text-xl font-bold leading-10 md:text-3xl">
            {exercise.beforeBlank}{" "}
            <span className="inline-flex min-w-28 justify-center border-b-4 border-yellow-300 px-4 text-yellow-200">
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
        <div className="rounded-3xl border border-violet-400/20 bg-slate-900/80 p-6">
          <p className="text-sm text-slate-400">English target</p>
          <p className="mt-2 text-2xl font-black">{exercise.translation}</p>
        </div>

        <div className="mt-5 min-h-24 rounded-3xl border border-dashed border-violet-300/40 bg-violet-400/10 p-4">
          <div className="flex flex-wrap gap-3">
            {selectedWords.length === 0 ? (
              <span className="py-3 text-sm text-slate-500">Choose words below</span>
            ) : (
              selectedWords.map((selectedWord) => (
                <div key={selectedWord.index} className="flex items-center gap-2">
                  <button
                    onClick={() => onWordRemove(selectedWord.index)}
                    className="rounded-2xl bg-violet-300 px-4 py-3 font-black text-slate-950 transition hover:bg-violet-200"
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
                  onClick={() => onWordClick(wordIndex)}
                  disabled={wasSelected || isAnswered}
                  className={`rounded-2xl border px-5 py-4 font-bold transition ${
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
          onClick={() => onSentenceSubmit(exercise)}
          disabled={isAnswered || selectedWordIndexes.length !== exercise.words.length}
          className={`mt-6 w-full rounded-full px-6 py-4 font-bold transition ${
            !isAnswered && selectedWordIndexes.length === exercise.words.length
              ? "bg-violet-300 text-slate-950 hover:bg-violet-200"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          Check Sentence
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
                  onClick={() => onRussianMatchSelect(pair.russian)}
                  disabled={isAnswered}
                  className={`min-w-0 flex-1 rounded-2xl border p-4 text-left transition ${
                    selectedRussian === pair.russian
                      ? "border-emerald-300 bg-emerald-300/20"
                      : "border-white/10 bg-slate-900/80 hover:border-emerald-300/50"
                  }`}
                >
                  <span className="block text-xl font-black">
                    {normalizeRussianText(pair.russian)}
                  </span>
                  <span className="mt-1 block text-sm text-slate-400">
                    Matched to {matchingAnswers[pair.russian] || "..."}
                  </span>
                </button>
                <PronounceButton text={pair.russian} />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {exercise.englishOptions.map((english) => (
              <button
                key={english}
                onClick={() => onEnglishMatchSelect(english)}
                disabled={isAnswered}
                className={`w-full rounded-2xl border p-4 text-left font-bold transition ${
                  selectedEnglish === english
                    ? "border-cyan-300 bg-cyan-300/20"
                    : "border-white/10 bg-slate-900/80 hover:border-cyan-300/50"
                }`}
              >
                {english}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onMatchingSubmit(exercise)}
          disabled={isAnswered || Object.keys(matchingAnswers).length !== exercise.pairs.length}
          className={`mt-6 w-full rounded-full px-6 py-4 font-bold transition ${
            !isAnswered && Object.keys(matchingAnswers).length === exercise.pairs.length
              ? "bg-emerald-300 text-slate-950 hover:bg-emerald-200"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          Check Matches
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 rounded-3xl border border-orange-300/20 bg-slate-900/80 p-7">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-200">
          Real-life situation
        </p>
        <p className="mt-4 text-xl font-bold leading-8 text-slate-100">{exercise.situation}</p>
      </div>
      <ChoiceGrid
        options={exercise.options}
        selectedAnswer={selectedAnswer}
        correctAnswer={exercise.correctAnswer}
        isAnswered={isAnswered}
        onSelect={(answer) => onChoiceAnswer(answer, exercise.correctAnswer)}
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
}: {
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
  isAnswered: boolean;
  onSelect: (answer: string) => void;
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
          <div key={option} className="flex items-center gap-2">
            <button
              onClick={() => onSelect(option)}
              disabled={isAnswered}
              className={`min-w-0 flex-1 rounded-2xl border p-5 text-left font-semibold transition ${buttonStyle}`}
            >
              {normalizeRussianText(option)}
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
    <div className={`rounded-2xl px-4 py-3 font-black ${toneClass}`}>
      <p className="text-xs uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 text-2xl">{value}</p>
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

function getExerciseLabel(type: LessonExercise["type"]) {
  const labels = {
    multipleChoice: "Multiple choice",
    fillBlank: "Fill the blank",
    sentenceOrder: "Sentence order",
    matching: "Matching",
    scenarioChoice: "Scenario choice",
  };

  return labels[type];
}

function getShortExerciseLabel(type: LessonExercise["type"]) {
  const labels = {
    multipleChoice: "Choice",
    fillBlank: "Blank",
    sentenceOrder: "Order",
    matching: "Match",
    scenarioChoice: "Scenario",
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
