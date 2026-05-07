"use client";

import { useState } from "react";

type ChoiceQuestion = {
  type: "choice";
  prompt: string;
  display: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
};

type TextQuestion = {
  type: "text";
  prompt: string;
  display: string;
  correctAnswer: string;
  acceptedAnswers: string[];
  explanation: string;
  points: number;
};

type ChallengeQuestion = ChoiceQuestion | TextQuestion;

const questions: ChallengeQuestion[] = [
  {
    type: "choice",
    prompt: "The Gatekeeper says: Привет. What does it mean?",
    display: "Привет",
    options: ["Goodbye", "Hello", "Thank you", "Please"],
    correctAnswer: "Hello",
    explanation: "Привет is the common informal way to say Hello.",
    points: 120,
  },
  {
    type: "text",
    prompt: "Type the English meaning of Спасибо.",
    display: "Спасибо",
    correctAnswer: "Thank you",
    acceptedAnswers: ["thank you", "thanks"],
    explanation: "Спасибо means Thank you or Thanks.",
    points: 150,
  },
  {
    type: "choice",
    prompt: "Choose the phrase you would use for a polite greeting.",
    display: "First Contact protocol",
    options: ["Пока", "Здравствуйте", "Нет", "Кто"],
    correctAnswer: "Здравствуйте",
    explanation: "Здравствуйте is the polite/formal greeting.",
    points: 160,
  },
  {
    type: "choice",
    prompt: "What is the correct answer to Как тебя зовут?",
    display: "Как тебя зовут?",
    options: ["Меня зовут Alex", "Я не понимаю", "До свидания", "Где?"],
    correctAnswer: "Меня зовут Alex",
    explanation: "Как тебя зовут? asks What is your name?",
    points: 180,
  },
  {
    type: "text",
    prompt: "Type the English word for Да.",
    display: "Да",
    correctAnswer: "Yes",
    acceptedAnswers: ["yes"],
    explanation: "Да means Yes.",
    points: 120,
  },
  {
    type: "choice",
    prompt: "Final clash: choose the correct survival phrase for I do not understand.",
    display: "Boss shield phrase",
    options: ["Я не понимаю", "Пожалуйста", "Спасибо", "Привет"],
    correctAnswer: "Я не понимаю",
    explanation: "Я не понимаю means I do not understand.",
    points: 220,
  },
];

const startingHearts = 3;
const passScore = 650;

export default function ChallengePage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [hearts, setHearts] = useState(startingHearts);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [lastAnswerWasCorrect, setLastAnswerWasCorrect] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const finalPassed = score >= passScore && hearts > 0;
  const resultTitle = finalPassed ? "Boss Defeated" : "Boss Survived";
  const resultMessage = finalPassed
    ? "You cleared World 1: First Contact and proved you can survive the first conversation."
    : "You need a cleaner run before World 2 unlocks. Review the basics and try again.";

  function gradeTextAnswer(question: TextQuestion, answer: string) {
    const normalizedAnswer = answer.trim().toLowerCase();

    return question.acceptedAnswers.some(
      (acceptedAnswer) => acceptedAnswer.toLowerCase() === normalizedAnswer,
    );
  }

  function applyResult(isCorrect: boolean, points: number) {
    setIsAnswered(true);
    setLastAnswerWasCorrect(isCorrect);

    if (isCorrect) {
      setScore((previousScore) => previousScore + points);
      setXp((previousXp) => previousXp + Math.round(points / 10));
      setCorrectCount((previousCount) => previousCount + 1);
      return;
    }

    setHearts((previousHearts) => Math.max(previousHearts - 1, 0));
  }

  function handleChoiceAnswer(answer: string) {
    if (isAnswered || currentQuestion.type !== "choice") return;

    setSelectedAnswer(answer);
    applyResult(answer === currentQuestion.correctAnswer, currentQuestion.points);
  }

  function handleTextSubmit() {
    if (isAnswered || currentQuestion.type !== "text" || !typedAnswer.trim()) {
      return;
    }

    applyResult(gradeTextAnswer(currentQuestion, typedAnswer), currentQuestion.points);
  }

  function handleNext() {
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const noHeartsLeft = hearts === 0;

    if (isLastQuestion || noHeartsLeft) {
      setIsFinished(true);
      return;
    }

    setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
    setSelectedAnswer("");
    setTypedAnswer("");
    setIsAnswered(false);
    setLastAnswerWasCorrect(false);
  }

  function handleRetry() {
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setTypedAnswer("");
    setIsAnswered(false);
    setScore(0);
    setXp(0);
    setHearts(startingHearts);
    setCorrectCount(0);
    setIsFinished(false);
    setLastAnswerWasCorrect(false);
  }

  if (isFinished) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center">
          <div className="w-full overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-cyan-950/40">
            <div
              className={`p-8 text-center ${
                finalPassed
                  ? "bg-cyan-400 text-slate-950"
                  : "bg-red-400 text-slate-950"
              }`}
            >
              <p className="text-sm font-bold uppercase tracking-[0.35em]">
                World 1 Boss Level
              </p>
              <h1 className="mt-3 text-4xl font-black md:text-6xl">
                {resultTitle}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl font-semibold">
                {resultMessage}
              </p>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid gap-4 md:grid-cols-4">
                <ResultStat title="Score" value={score.toString()} />
                <ResultStat title="XP Earned" value={xp.toString()} />
                <ResultStat title="Hearts" value={hearts.toString()} />
                <ResultStat
                  title="Accuracy"
                  value={`${correctCount}/${questions.length}`}
                />
              </div>

              <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-400">Pass threshold</span>
                  <span className="font-bold text-yellow-300">
                    {passScore} score + 1 heart
                  </span>
                </div>
                <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      finalPassed ? "bg-cyan-400" : "bg-red-400"
                    }`}
                    style={{ width: `${Math.min((score / passScore) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/dashboard"
                  className="inline-flex flex-1 justify-center rounded-full bg-cyan-400 px-7 py-4 font-bold text-slate-950 transition hover:bg-cyan-300"
                >
                  Back to Dashboard
                </a>
                <button
                  onClick={handleRetry}
                  className="inline-flex flex-1 justify-center rounded-full border border-white/10 bg-white/10 px-7 py-4 font-bold text-white transition hover:border-white/30 hover:bg-white/15"
                >
                  Retry Boss
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 px-6 py-8 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <a href="/worlds" className="text-sm text-slate-400 hover:text-white">
              Back to Worlds
            </a>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Boss Level
            </p>
            <h1 className="mt-3 text-4xl font-black md:text-6xl">
              World 1: First Contact
            </h1>
            <p className="mt-4 max-w-2xl text-slate-400">
              Defeat the dialogue boss with greetings, survival phrases, and
              quick translation checks.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <StatusPill label="XP" value={xp.toString()} tone="cyan" />
            <StatusPill label="Hearts" value={hearts.toString()} tone="red" />
            <StatusPill label="Score" value={score.toString()} tone="yellow" />
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-white/10 bg-white/10 p-5">
          <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
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

        <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
          <div className="rounded-3xl border border-cyan-400/20 bg-white/10 p-6 shadow-2xl shadow-cyan-950/30 md:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-sm text-cyan-300">
                  Mixed question · {currentQuestion.type === "choice" ? "Multiple choice" : "Typed answer"}
                </p>
                <h2 className="mt-3 text-2xl font-bold md:text-3xl">
                  {currentQuestion.prompt}
                </h2>
              </div>
              <span className="w-fit rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950">
                +{currentQuestion.points}
              </span>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                Boss prompt
              </p>
              <p className="mt-4 text-4xl font-black md:text-6xl">
                {currentQuestion.display}
              </p>
            </div>

            {currentQuestion.type === "choice" ? (
              <div className="mt-8 grid gap-4">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedAnswer === option;
                  const isRightOption = option === currentQuestion.correctAnswer;
                  let buttonStyle =
                    "border-white/10 bg-slate-900/80 hover:border-cyan-400/50";

                  if (isAnswered && isRightOption) {
                    buttonStyle = "border-green-400 bg-green-400/20";
                  }

                  if (isAnswered && isSelected && !isRightOption) {
                    buttonStyle = "border-red-400 bg-red-400/20";
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => handleChoiceAnswer(option)}
                      className={`rounded-2xl border p-5 text-left font-semibold transition ${buttonStyle}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8">
                <label htmlFor="boss-answer" className="text-sm text-slate-400">
                  Your answer
                </label>
                <input
                  id="boss-answer"
                  value={typedAnswer}
                  onChange={(event) => setTypedAnswer(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleTextSubmit();
                    }
                  }}
                  disabled={isAnswered}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-4 font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                  placeholder="Type the English answer"
                />
                <button
                  onClick={handleTextSubmit}
                  disabled={isAnswered || !typedAnswer.trim()}
                  className={`mt-4 w-full rounded-full px-6 py-4 font-bold transition ${
                    !isAnswered && typedAnswer.trim()
                      ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  Lock Answer
                </button>
              </div>
            )}

            {isAnswered && (
              <div
                className={`mt-6 rounded-2xl p-5 ${
                  lastAnswerWasCorrect ? "bg-green-400/20" : "bg-red-400/20"
                }`}
              >
                <p className="font-bold">
                  {lastAnswerWasCorrect ? "Direct hit." : "Shield blocked it."}
                </p>
                <p className="mt-2 text-sm text-slate-300">
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
              {currentQuestionIndex === questions.length - 1 || hearts === 0
                ? "Reveal Result"
                : "Next Attack"}
            </button>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/10 p-6">
            <p className="text-sm text-slate-400">Enemy</p>
            <h2 className="mt-2 text-2xl font-black">First Contact Sentinel</h2>
            <div className="mt-6 rounded-3xl bg-slate-900/80 p-6 text-center">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-yellow-400 bg-slate-950 text-5xl font-black text-yellow-300">
                Б
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-400">
                Pass with {passScore} score and at least one heart to clear the
                world boss.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <BossRule text="Correct answers add score and XP." />
              <BossRule text="Wrong answers remove one heart." />
              <BossRule text="Running out of hearts ends the fight." />
            </div>
          </aside>
        </div>
      </section>
    </main>
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
    <div className="rounded-2xl bg-slate-900/80 p-5 text-center">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function BossRule({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
      {text}
    </div>
  );
}
