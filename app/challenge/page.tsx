"use client";

import { Navigation } from "@/components/Navigation";
import {
  isRussianText,
  normalizeRussianText,
  PronounceButton,
} from "@/components/PronounceButton";
import {
  challengeQuestions,
  challengeSettings,
  type ChoiceQuestion,
  type TextQuestion,
  worldOne,
} from "@/lib/learning-data";
import Link from "next/link";
import { useState } from "react";

type BossQuestionBase = {
  id: string;
  phase: string;
  type: "choice" | "text" | "sequence" | "scenario";
  prompt: string;
  display: string;
  explanation: string;
  points: number;
  damage: number;
  bossLine: string;
};

type BossChoiceQuestion = BossQuestionBase & {
  type: "choice";
  options: string[];
  correctAnswer: string;
};

type BossTextQuestion = BossQuestionBase & {
  type: "text";
  correctAnswer: string;
  acceptedAnswers: string[];
};

type BossSequenceQuestion = BossQuestionBase & {
  type: "sequence";
  translation: string;
  words: string[];
  correctOrder: string[];
};

type BossScenarioQuestion = BossQuestionBase & {
  type: "scenario";
  situation: string;
  options: string[];
  correctAnswer: string;
};

type BossQuestion =
  | BossChoiceQuestion
  | BossTextQuestion
  | BossSequenceQuestion
  | BossScenarioQuestion;

const importedBossQuestions = challengeQuestions.map((question, index) =>
  toBossQuestion(question, index),
).map(repairImportedBossQuestion);

const bossQuestions: BossQuestion[] = [
  importedBossQuestions[0],
  importedBossQuestions[1],
  {
    id: "assemble-name-intro",
    type: "sequence",
    phase: "Phase 2",
    prompt: "Break the armor by building the Russian sentence.",
    display: "My name is Alex.",
    translation: "My name is Alex.",
    words: ["Алекс", "зовут", "Меня"],
    correctOrder: ["Меня", "зовут", "Алекс"],
    explanation: "Меня зовут Алекс is the natural Russian sentence for My name is Alex.",
    points: 170,
    damage: 170,
    bossLine: "The sentinel scrambles the words. Put them back in order.",
  },
  importedBossQuestions[2],
  {
    id: "station-scenario",
    type: "scenario",
    phase: "Phase 3",
    prompt: "Choose the line that keeps the conversation alive.",
    display: "Moscow station encounter",
    situation:
      "A stranger asks if you understand the announcement. You do not. What do you say?",
    options: ["Я не понимаю", "Пока", "Да", "Спасибо"],
    correctAnswer: "Я не понимаю",
    explanation: "Я не понимаю means I do not understand, which fits this situation.",
    points: 190,
    damage: 190,
    bossLine: "The arena goes quiet. Pick the survival phrase.",
  },
  importedBossQuestions[3],
  importedBossQuestions[4],
  importedBossQuestions[5],
];

const maxBossHealth = challengeSettings.passScore;

export default function ChallengePage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [selectedWordIndexes, setSelectedWordIndexes] = useState<number[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [hearts, setHearts] = useState(challengeSettings.startingHearts);
  const [correctCount, setCorrectCount] = useState(0);
  const [bossDamage, setBossDamage] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [lastAnswerWasCorrect, setLastAnswerWasCorrect] = useState(false);

  const currentQuestion = bossQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / bossQuestions.length) * 100;
  const bossHealth = Math.max(maxBossHealth - bossDamage, 0);
  const bossHealthPercent = (bossHealth / maxBossHealth) * 100;
  const accuracy = Math.round((correctCount / bossQuestions.length) * 100);
  const finalPassed = score >= challengeSettings.passScore && hearts > 0;
  const resultTitle = finalPassed ? "Boss Defeated" : "Boss Survived";
  const resultMessage = finalPassed
    ? "You cleared the First Contact boss fight and proved you can handle a real opening exchange."
    : "The sentinel held the gate. Tighten the basics, protect your hearts, and try the fight again.";

  function applyResult(isCorrect: boolean, question: BossQuestion) {
    if (isAnswered) return;

    setIsAnswered(true);
    setLastAnswerWasCorrect(isCorrect);

    if (isCorrect) {
      setScore((previousScore) => previousScore + question.points);
      setXp((previousXp) => previousXp + Math.round(question.points / 10));
      setCorrectCount((previousCount) => previousCount + 1);
      setBossDamage((previousDamage) =>
        Math.min(previousDamage + question.damage, maxBossHealth),
      );
      return;
    }

    setHearts((previousHearts) => Math.max(previousHearts - 1, 0));
  }

  function handleChoiceAnswer(answer: string) {
    if (
      isAnswered ||
      (currentQuestion.type !== "choice" && currentQuestion.type !== "scenario")
    ) {
      return;
    }

    setSelectedAnswer(answer);
    applyResult(answer === currentQuestion.correctAnswer, currentQuestion);
  }

  function handleTextSubmit() {
    if (isAnswered || currentQuestion.type !== "text" || !typedAnswer.trim()) {
      return;
    }

    applyResult(gradeTextAnswer(currentQuestion, typedAnswer), currentQuestion);
  }

  function handleWordClick(wordIndex: number) {
    if (
      isAnswered ||
      currentQuestion.type !== "sequence" ||
      selectedWordIndexes.includes(wordIndex)
    ) {
      return;
    }

    setSelectedWordIndexes((previousIndexes) => [...previousIndexes, wordIndex]);
  }

  function handleWordRemove(wordIndex: number) {
    if (isAnswered || currentQuestion.type !== "sequence") return;

    setSelectedWordIndexes((previousIndexes) =>
      previousIndexes.filter((selectedIndex) => selectedIndex !== wordIndex),
    );
  }

  function handleSequenceSubmit() {
    if (
      isAnswered ||
      currentQuestion.type !== "sequence" ||
      selectedWordIndexes.length !== currentQuestion.words.length
    ) {
      return;
    }

    const builtSentence = selectedWordIndexes.map(
      (wordIndex) => currentQuestion.words[wordIndex],
    );

    applyResult(
      builtSentence.join(" ") === currentQuestion.correctOrder.join(" "),
      currentQuestion,
    );
  }

  function handleNext() {
    const isLastQuestion = currentQuestionIndex === bossQuestions.length - 1;

    if (isLastQuestion || hearts === 0) {
      setIsFinished(true);
      return;
    }

    setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
    resetQuestionState();
  }

  function handleRetry() {
    setCurrentQuestionIndex(0);
    resetQuestionState();
    setScore(0);
    setXp(0);
    setHearts(challengeSettings.startingHearts);
    setCorrectCount(0);
    setBossDamage(0);
    setIsFinished(false);
  }

  function resetQuestionState() {
    setSelectedAnswer("");
    setTypedAnswer("");
    setSelectedWordIndexes([]);
    setIsAnswered(false);
    setLastAnswerWasCorrect(false);
  }

  if (isFinished) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navigation />
        <section className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-5xl items-center justify-center px-6 pb-8">
          <div className="w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl shadow-cyan-950/40">
            <div
              className={`border-b border-white/10 p-8 text-center ${
                finalPassed
                  ? "bg-cyan-400 text-slate-950"
                  : "bg-red-400 text-slate-950"
              }`}
            >
              <p className="text-sm font-black uppercase tracking-[0.35em]">
                Final Stage Result
              </p>
              <h1 className="mt-3 text-4xl font-black md:text-6xl">
                {resultTitle}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl font-semibold">
                {resultMessage}
              </p>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <ResultStat title="State" value={finalPassed ? "Passed" : "Failed"} />
                <ResultStat title="Score" value={score.toString()} />
                <ResultStat title="XP Earned" value={xp.toString()} />
                <ResultStat title="Hearts Left" value={hearts.toString()} />
                <ResultStat title="Accuracy" value={`${accuracy}%`} />
              </div>

              <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Boss core integrity
                  </span>
                  <span className="font-black text-yellow-300">
                    {bossHealth}/{maxBossHealth} HP
                  </span>
                </div>
                <div className="mt-4 h-5 overflow-hidden rounded-full bg-slate-900">
                  <div
                    className={`h-full rounded-full transition-all ${
                      finalPassed ? "bg-cyan-400" : "bg-red-400"
                    }`}
                    style={{ width: `${bossHealthPercent}%` }}
                  />
                </div>
                <p className="mt-4 text-sm text-slate-400">
                  Pass requires {challengeSettings.passScore} score and at least
                  one heart. You landed {correctCount} of {bossQuestions.length} attacks.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleRetry}
                  className="inline-flex flex-1 justify-center rounded-full bg-yellow-400 px-7 py-4 font-bold text-slate-950 transition hover:bg-yellow-300"
                >
                  Retry Boss
                </button>
                <Link
                  href="/dashboard"
                  className="inline-flex flex-1 justify-center rounded-full border border-white/10 bg-white/10 px-7 py-4 font-bold text-white transition hover:border-white/30 hover:bg-white/15"
                >
                  Back to Dashboard
                </Link>
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
      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <Link href="/worlds" className="text-sm text-slate-400 hover:text-white">
              Back to Worlds
            </Link>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-red-300">
              {worldOne.bossTitle} - Final Stage
            </p>
            <h1 className="mt-3 text-4xl font-black md:text-6xl">
              First Contact Sentinel
            </h1>
            <p className="mt-4 max-w-2xl text-slate-400">
              Survive a mixed boss flow: translation strikes, typed counters,
              sentence assembly, and scenario decisions.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <StatusPill label="XP" value={xp.toString()} tone="cyan" />
            <StatusPill label="Hearts" value={hearts.toString()} tone="red" />
            <StatusPill label="Score" value={score.toString()} tone="yellow" />
          </div>
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_0.65fr]">
          <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-5">
            <div className="mb-3 flex items-center justify-between gap-4 text-sm">
              <span className="font-bold text-red-200">Boss Health</span>
              <span className="text-slate-300">
                {bossHealth}/{maxBossHealth} HP
              </span>
            </div>
            <div className="h-5 overflow-hidden rounded-full bg-slate-900">
              <div
                className="h-full rounded-full bg-red-400 transition-all"
                style={{ width: `${bossHealthPercent}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
            <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
              <span>
                Attack {currentQuestionIndex + 1} of {bossQuestions.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-5 overflow-hidden rounded-full bg-slate-900">
              <div
                className="h-full rounded-full bg-cyan-400 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.48fr]">
          <div
            className={`rounded-3xl border p-6 shadow-2xl md:p-8 ${getBossFrame(
              currentQuestion.type,
            )}`}
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                  {currentQuestion.phase} - {getQuestionLabel(currentQuestion.type)}
                </p>
                <h2 className="mt-3 text-2xl font-bold md:text-3xl">
                  {currentQuestion.prompt}
                </h2>
              </div>
              <span className="w-fit rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950">
                +{currentQuestion.points}
              </span>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/80 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-200">
                Boss action
              </p>
              <p className="mt-3 text-lg font-bold text-slate-200">
                {currentQuestion.bossLine}
              </p>
              <div className="mt-6 flex items-center justify-center gap-3 text-center">
                <p className="text-4xl font-black md:text-6xl">
                  {normalizeRussianText(currentQuestion.display)}
                </p>
                {isRussianText(currentQuestion.display) && (
                  <PronounceButton text={currentQuestion.display} />
                )}
              </div>
            </div>

            <BossQuestionView
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              typedAnswer={typedAnswer}
              selectedWordIndexes={selectedWordIndexes}
              isAnswered={isAnswered}
              onChoiceAnswer={handleChoiceAnswer}
              onTextChange={setTypedAnswer}
              onTextSubmit={handleTextSubmit}
              onWordClick={handleWordClick}
              onWordRemove={handleWordRemove}
              onSequenceSubmit={handleSequenceSubmit}
            />

            {isAnswered && (
              <div
                className={`mt-6 rounded-2xl border p-5 ${
                  lastAnswerWasCorrect
                    ? "border-green-400/30 bg-green-400/15"
                    : "border-red-400/30 bg-red-400/15"
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-black">
                    {lastAnswerWasCorrect ? "Critical hit." : "Counterattack landed."}
                  </p>
                  <p className="text-sm font-bold text-slate-300">
                    {lastAnswerWasCorrect
                      ? `-${currentQuestion.damage} boss HP`
                      : "-1 heart"}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`mt-8 w-full rounded-full px-6 py-4 font-bold transition ${
                isAnswered
                  ? "bg-yellow-400 text-slate-950 hover:bg-yellow-300"
                  : "bg-slate-800 text-slate-500"
              }`}
            >
              {currentQuestionIndex === bossQuestions.length - 1 || hearts === 0
                ? "Reveal Result"
                : "Next Attack"}
            </button>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/10 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              Encounter
            </p>
            <div className="mt-5 rounded-3xl border border-red-300/20 bg-slate-950/80 p-6 text-center">
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4 border-red-300 bg-red-400/10 text-6xl font-black text-red-200 shadow-2xl shadow-red-950/50">
                Б
              </div>
              <h2 className="mt-5 text-2xl font-black">Gate Sentinel</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Drop the health bar by answering correctly. Passing the score
                threshold with a heart left clears the world boss.
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              <SideStat label="Correct hits" value={correctCount.toString()} />
              <SideStat
                label="Mistakes"
                value={(challengeSettings.startingHearts - hearts).toString()}
              />
              <SideStat label="Accuracy" value={`${accuracy}%`} />
              <SideStat
                label="Pass score"
                value={challengeSettings.passScore.toString()}
              />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function toBossQuestion(question: ChoiceQuestion | TextQuestion, index: number): BossQuestion {
  const phase = index < 2 ? "Phase 1" : index < 4 ? "Phase 2" : "Phase 3";
  const bossLine =
    index === challengeQuestions.length - 1
      ? "The final shield comes up. One clean answer can end the fight."
      : "The sentinel tests your First Contact basics.";

  if (question.type === "choice") {
    return {
      ...question,
      phase,
      damage: question.points,
      bossLine,
    };
  }

  return {
    ...question,
    phase,
    damage: question.points,
    bossLine,
  };
}

function repairImportedBossQuestion(question: BossQuestion): BossQuestion {
  if (question.id === "gatekeeper-privet" && question.type === "choice") {
    return {
      ...question,
      prompt: "The Gatekeeper says: Привет. What does it mean?",
      display: "Привет",
      explanation: "Привет is the common informal way to say Hello.",
    };
  }

  if (question.id === "type-spasibo" && question.type === "text") {
    return {
      ...question,
      prompt: "Type the English meaning of Спасибо.",
      display: "Спасибо",
      explanation: "Спасибо means Thank you or Thanks.",
    };
  }

  if (question.id === "polite-greeting" && question.type === "choice") {
    return {
      ...question,
      options: ["Пока", "Здравствуйте", "Нет", "Кто"],
      correctAnswer: "Здравствуйте",
      explanation: "Здравствуйте is the polite/formal greeting.",
    };
  }

  if (question.id === "your-name-answer" && question.type === "choice") {
    return {
      ...question,
      prompt: "What is the correct answer to Как тебя зовут?",
      display: "Как тебя зовут?",
      options: ["Меня зовут Alex", "Я не понимаю", "До свидания", "Где?"],
      correctAnswer: "Меня зовут Alex",
      explanation: "Как тебя зовут? asks What is your name?",
    };
  }

  if (question.id === "type-da" && question.type === "text") {
    return {
      ...question,
      prompt: "Type the English word for Да.",
      display: "Да",
      explanation: "Да means Yes.",
    };
  }

  if (question.id === "survival-phrase-understand" && question.type === "choice") {
    return {
      ...question,
      options: ["Я не понимаю", "Пожалуйста", "Спасибо", "Привет"],
      correctAnswer: "Я не понимаю",
      explanation: "Я не понимаю means I do not understand.",
    };
  }

  return question;
}

function gradeTextAnswer(question: BossTextQuestion, answer: string) {
  const normalizedAnswer = answer.trim().toLowerCase();

  return question.acceptedAnswers.some(
    (acceptedAnswer) => acceptedAnswer.toLowerCase() === normalizedAnswer,
  );
}

function BossQuestionView({
  question,
  selectedAnswer,
  typedAnswer,
  selectedWordIndexes,
  isAnswered,
  onChoiceAnswer,
  onTextChange,
  onTextSubmit,
  onWordClick,
  onWordRemove,
  onSequenceSubmit,
}: {
  question: BossQuestion;
  selectedAnswer: string;
  typedAnswer: string;
  selectedWordIndexes: number[];
  isAnswered: boolean;
  onChoiceAnswer: (answer: string) => void;
  onTextChange: (answer: string) => void;
  onTextSubmit: () => void;
  onWordClick: (wordIndex: number) => void;
  onWordRemove: (wordIndex: number) => void;
  onSequenceSubmit: () => void;
}) {
  if (question.type === "text") {
    return (
      <div className="mt-8">
        <label htmlFor="boss-answer" className="text-sm text-slate-400">
          Counter phrase
        </label>
        <input
          id="boss-answer"
          value={typedAnswer}
          onChange={(event) => onTextChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onTextSubmit();
            }
          }}
          disabled={isAnswered}
          className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-4 font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
          placeholder="Type the English answer"
        />
        <button
          onClick={onTextSubmit}
          disabled={isAnswered || !typedAnswer.trim()}
          className={`mt-4 w-full rounded-full px-6 py-4 font-bold transition ${
            !isAnswered && typedAnswer.trim()
              ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          Lock Counter
        </button>
      </div>
    );
  }

  if (question.type === "sequence") {
    const selectedWords = selectedWordIndexes.map((wordIndex) => ({
      index: wordIndex,
      word: question.words[wordIndex],
    }));

    return (
      <div className="mt-8">
        <div className="rounded-3xl border border-violet-300/20 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-400">Target</p>
          <p className="mt-2 text-2xl font-black">{question.translation}</p>
        </div>
        <div className="mt-5 min-h-24 rounded-3xl border border-dashed border-violet-300/40 bg-violet-400/10 p-4">
          <div className="flex flex-wrap gap-3">
            {selectedWords.length === 0 ? (
              <span className="py-3 text-sm text-slate-500">
                Assemble the counter below
              </span>
            ) : (
              selectedWords.map((selectedWord) => (
                <div key={selectedWord.index} className="flex items-center gap-2">
                  <button
                    onClick={() => onWordRemove(selectedWord.index)}
                    disabled={isAnswered}
                    className="rounded-2xl bg-violet-300 px-4 py-3 font-black text-slate-950 transition hover:bg-violet-200 disabled:hover:bg-violet-300"
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
          {question.words.map((word, wordIndex) => {
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
          onClick={onSequenceSubmit}
          disabled={isAnswered || selectedWordIndexes.length !== question.words.length}
          className={`mt-6 w-full rounded-full px-6 py-4 font-bold transition ${
            !isAnswered && selectedWordIndexes.length === question.words.length
              ? "bg-violet-300 text-slate-950 hover:bg-violet-200"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          Strike With Sentence
        </button>
      </div>
    );
  }

  return (
    <>
      {question.type === "scenario" && (
        <div className="mt-8 rounded-3xl border border-orange-300/20 bg-slate-900/80 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-200">
            Arena scenario
          </p>
          <p className="mt-4 text-xl font-bold leading-8 text-slate-100">
            {question.situation}
          </p>
        </div>
      )}
      <ChoiceGrid
        options={question.options}
        selectedAnswer={selectedAnswer}
        correctAnswer={question.correctAnswer}
        isAnswered={isAnswered}
        onSelect={onChoiceAnswer}
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
  tone: "cyan" | "red" | "yellow";
}) {
  const toneClass = {
    cyan: "bg-cyan-400 text-slate-950",
    red: "bg-red-400 text-slate-950",
    yellow: "bg-yellow-400 text-slate-950",
  }[tone];

  return (
    <div className={`rounded-2xl px-4 py-3 font-black ${toneClass}`}>
      <p className="text-xs uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 text-2xl">{value}</p>
    </div>
  );
}

function ResultStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 text-center">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
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

function getQuestionLabel(type: BossQuestion["type"]) {
  const labels = {
    choice: "Translation strike",
    text: "Typed counter",
    sequence: "Sentence forge",
    scenario: "Survival choice",
  };

  return labels[type];
}

function getBossFrame(type: BossQuestion["type"]) {
  const frames = {
    choice: "border-cyan-400/20 bg-white/10 shadow-cyan-950/30",
    text: "border-yellow-400/20 bg-yellow-400/10 shadow-yellow-950/20",
    sequence: "border-violet-400/20 bg-violet-400/10 shadow-violet-950/20",
    scenario: "border-orange-300/20 bg-orange-300/10 shadow-orange-950/20",
  };

  return frames[type];
}
