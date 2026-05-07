"use client";

import { Navigation } from "@/components/Navigation";
import { useState } from "react";

const questions = [
  {
    prompt: "What does Привет mean?",
    russian: "Привет",
    options: ["Goodbye", "Hello", "Thank you", "Please"],
    correctAnswer: "Hello",
    explanation: "Привет means Hello. It is informal and very common.",
  },
  {
    prompt: "Choose the correct Russian word for Thank you.",
    russian: "Thank you",
    options: ["Пока", "Спасибо", "Да", "Нет"],
    correctAnswer: "Спасибо",
    explanation: "Спасибо means Thank you.",
  },
  {
    prompt: "What does Да mean?",
    russian: "Да",
    options: ["No", "Yes", "Where", "Who"],
    correctAnswer: "Yes",
    explanation: "Да means Yes.",
  },
  {
    prompt: "Choose the correct translation of Пока.",
    russian: "Пока",
    options: ["Hi / Bye", "Please", "Sorry", "Good morning"],
    correctAnswer: "Hi / Bye",
    explanation: "Пока can mean Hi or Bye informally, depending on context.",
  },
];

export default function LessonPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [xp, setXp] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  function handleAnswer(answer: string) {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    if (answer === currentQuestion.correctAnswer) {
      setXp((previousXp) => previousXp + 10);
    } else {
      setHearts((previousHearts) => Math.max(previousHearts - 1, 0));
    }
  }

  function handleNext() {
    if (currentQuestionIndex === questions.length - 1) {
      setIsFinished(true);
      return;
    }

    setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
    setSelectedAnswer("");
    setIsAnswered(false);
  }

  if (isFinished) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navigation />
        <section className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-xl items-center px-6 pb-8">
          <div className="w-full rounded-3xl border border-white/10 bg-white/10 p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 text-4xl">
            🏆
          </div>

            <h1 className="mt-6 text-4xl font-bold">Lesson Complete!</h1>

            <p className="mt-4 text-slate-300">
            Great job. You finished your first Russian mini-lesson.
          </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-900/70 p-5">
              <p className="text-sm text-slate-400">XP earned</p>
              <p className="mt-1 text-3xl font-bold text-cyan-300">{xp}</p>
            </div>

            <div className="rounded-2xl bg-slate-900/70 p-5">
              <p className="text-sm text-slate-400">Hearts left</p>
              <p className="mt-1 text-3xl font-bold text-red-300">{hearts}</p>
            </div>
          </div>

            <a
              href="/dashboard"
              className="mt-8 inline-flex rounded-full bg-cyan-400 px-7 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
            Back to Dashboard
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-3xl px-6 pb-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <a href="/worlds" className="text-sm text-slate-400 hover:text-white">
            ← Back
          </a>

          <div className="flex items-center gap-4 text-sm">
            <span className="rounded-full bg-yellow-400 px-4 py-2 font-bold text-slate-950">
              ⚡ {xp} XP
            </span>

            <span className="rounded-full bg-red-400 px-4 py-2 font-bold text-slate-950">
              ❤️ {hearts}
            </span>
          </div>
        </div>

        <div className="mb-8 h-4 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-cyan-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-8">
          <p className="text-sm text-cyan-300">Lesson 1 · Saying Hello</p>

          <h1 className="mt-3 text-3xl font-bold">
            {currentQuestion.prompt}
          </h1>

          <div className="mt-8 rounded-3xl bg-slate-900/80 p-8 text-center">
            <p className="text-5xl font-bold">{currentQuestion.russian}</p>
          </div>

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
                  onClick={() => handleAnswer(option)}
                  className={`rounded-2xl border p-5 text-left font-semibold transition ${buttonStyle}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div
              className={`mt-6 rounded-2xl p-5 ${
                isCorrect ? "bg-green-400/20" : "bg-red-400/20"
              }`}
            >
              <p className="font-bold">
                {isCorrect ? "Correct!" : "Not quite."}
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
                ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                : "bg-slate-800 text-slate-500"
            }`}
          >
            {currentQuestionIndex === questions.length - 1
              ? "Finish Lesson"
              : "Next Question"}
          </button>
        </div>
      </section>
    </main>
  );
}
