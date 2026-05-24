"use client";

import { Navigation } from "@/components/Navigation";
import { PronounceButton } from "@/components/PronounceButton";
import { useExplanationLanguage } from "@/components/LanguageSelector";
import type { ExplanationLanguage } from "@/lib/language-preference";
import type { Lesson } from "@/lib/learning-data";
import { addMistake } from "@/lib/mistake-storage";
import {
  completeLesson,
  getNextAvailableLabel,
  getNextAvailablePath,
  type SavedProgress,
  useProgress,
} from "@/lib/progress-storage";
import {
  getUiText,
  localizeActionLabel,
  localizeLessonDescription,
  localizeLessonTitle,
  uiTextProps,
} from "@/lib/ui-translations";
import Link from "next/link";
import { type FormEvent, type ReactNode, type RefObject, useMemo, useRef, useState } from "react";

type ColorStage = "learn" | "tap" | "listen" | "match" | "type" | "final" | "complete";
type AnswerState = { selectedId: string; isCorrect: boolean };
type FinalQuestion =
  | { id: string; type: "tap" | "listen" | "type"; colorId: string }
  | { id: string; type: "match"; colorId: "match-set" };

type ColorWord = {
  id: string;
  russian: string;
  english: string;
  arabic: string;
  hex: string;
  ring: string;
};

const colors: ColorWord[] = [
  { id: "red", russian: "красный", english: "red", arabic: "أحمر", hex: "#e53935", ring: "#fecaca" },
  { id: "blue", russian: "синий", english: "blue", arabic: "أزرق", hex: "#2563eb", ring: "#bfdbfe" },
  { id: "green", russian: "зелёный", english: "green", arabic: "أخضر", hex: "#16a34a", ring: "#bbf7d0" },
  { id: "yellow", russian: "жёлтый", english: "yellow", arabic: "أصفر", hex: "#facc15", ring: "#fef08a" },
  { id: "black", russian: "чёрный", english: "black", arabic: "أسود", hex: "#111827", ring: "#cbd5e1" },
  { id: "white", russian: "белый", english: "white", arabic: "أبيض", hex: "#f8fafc", ring: "#cbd5e1" },
  { id: "orange", russian: "оранжевый", english: "orange", arabic: "برتقالي", hex: "#f97316", ring: "#fed7aa" },
  { id: "purple", russian: "фиолетовый", english: "purple", arabic: "بنفسجي", hex: "#7c3aed", ring: "#ddd6fe" },
  { id: "pink", russian: "розовый", english: "pink", arabic: "وردي", hex: "#ec4899", ring: "#fbcfe8" },
  { id: "brown", russian: "коричневый", english: "brown", arabic: "بني", hex: "#8b5a2b", ring: "#e7d3bd" },
  { id: "gray", russian: "серый", english: "gray", arabic: "رمادي", hex: "#64748b", ring: "#cbd5e1" },
  { id: "light-blue", russian: "голубой", english: "light blue", arabic: "أزرق فاتح", hex: "#38bdf8", ring: "#bae6fd" },
];

const tapQuestionIds = ["red", "blue", "green", "yellow", "purple", "light-blue"];
const listenQuestionIds = ["black", "white", "orange", "pink", "brown", "gray"];
const typeQuestionIds = ["зелёный", "жёлтый", "синий", "голубой", "красный"].map((russian) => getColorByRussian(russian).id);
const matchIds = ["red", "blue", "green", "yellow", "black", "white"];
const defaultFinalQuestions: FinalQuestion[] = [
  { id: "final-tap-red", type: "tap", colorId: "red" },
  { id: "final-listen-blue", type: "listen", colorId: "blue" },
  { id: "final-type-green", type: "type", colorId: "green" },
  { id: "final-tap-yellow", type: "tap", colorId: "yellow" },
  { id: "final-match-core", type: "match", colorId: "match-set" },
  { id: "final-listen-purple", type: "listen", colorId: "purple" },
  { id: "final-type-light-blue", type: "type", colorId: "light-blue" },
  { id: "final-tap-orange", type: "tap", colorId: "orange" },
  { id: "final-listen-black", type: "listen", colorId: "black" },
  { id: "final-type-yellow", type: "type", colorId: "yellow" },
];

const stageOrder: ColorStage[] = ["learn", "tap", "listen", "match", "type", "final"];
const russianKeyboardRows = [
  ["й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ"],
  ["ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э"],
  ["я", "ч", "с", "м", "и", "т", "ь", "б", "ю"],
];

export function ColorsLessonGame({ lesson }: { lesson: Lesson }) {
  const { language } = useExplanationLanguage();
  const text = getUiText(language);
  const copy = colorCopy(language);
  const progressState = useProgress();
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<ColorStage>("learn");
  const [tapIndex, setTapIndex] = useState(0);
  const [tapAnswer, setTapAnswer] = useState<AnswerState | null>(null);
  const [listenIndex, setListenIndex] = useState(0);
  const [listenAnswer, setListenAnswer] = useState<AnswerState | null>(null);
  const [selectedRussianId, setSelectedRussianId] = useState("");
  const [matchAnswers, setMatchAnswers] = useState<Record<string, string>>({});
  const [matchSubmitted, setMatchSubmitted] = useState(false);
  const [typeIndex, setTypeIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [typeAnswer, setTypeAnswer] = useState<AnswerState | null>(null);
  const [finalQuestions, setFinalQuestions] = useState(defaultFinalQuestions);
  const [finalIndex, setFinalIndex] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [finalAnswer, setFinalAnswer] = useState<AnswerState | null>(null);
  const [finalTypedAnswer, setFinalTypedAnswer] = useState("");
  const [finalMatchAnswers, setFinalMatchAnswers] = useState<Record<string, string>>({});
  const [finalSelectedRussianId, setFinalSelectedRussianId] = useState("");
  const [missedFinalIds, setMissedFinalIds] = useState<string[]>([]);
  const [completionProgress, setCompletionProgress] = useState<SavedProgress | null>(null);

  const activeProgress = completionProgress ?? progressState;
  const currentTapColor = getColor(tapQuestionIds[tapIndex]);
  const currentListenColor = getColor(listenQuestionIds[listenIndex]);
  const currentTypeColor = getColor(typeQuestionIds[typeIndex]);
  const currentFinal = finalQuestions[finalIndex] ?? finalQuestions[0];
  const currentFinalColor = currentFinal.type === "match" ? getColor("red") : getColor(currentFinal.colorId);
  const matchOptions = useMemo(() => getStableDerangedColors(matchIds.map(getColor), "colors-match"), []);
  const finalMatchOptions = useMemo(() => getStableDerangedColors(matchIds.slice(0, 4).map(getColor), "colors-final-match"), []);
  const progress = getStageProgress(stage, tapIndex, listenIndex, Object.keys(matchAnswers).length, typeIndex, finalIndex, finalQuestions.length);
  const nextAction = useMemo(
    () => ({ href: getNextAvailablePath(activeProgress), label: getNextAvailableLabel(activeProgress) }),
    [activeProgress],
  );
  const xpEarned = Math.round(lesson.xpReward * (finalScore / Math.max(1, finalQuestions.length)));

  function meaning(color: ColorWord) {
    return language === "ar" ? color.arabic : color.english;
  }

  function changeStage(nextStage: ColorStage) {
    setStage(nextStage);
    resetAnswerState();
  }

  function resetAnswerState() {
    setTapAnswer(null);
    setListenAnswer(null);
    setSelectedRussianId("");
    setMatchSubmitted(false);
    setTypedAnswer("");
    setTypeAnswer(null);
    setFinalAnswer(null);
    setFinalTypedAnswer("");
    setFinalSelectedRussianId("");
  }

  function recordMistake(exerciseId: string, questionText: string, userAnswer: string, correctColor: ColorWord) {
    addMistake({
      lessonId: lesson.id,
      exerciseId,
      questionText,
      userAnswer: userAnswer || text.lesson.noAnswer,
      correctAnswer: correctColor.russian,
      explanation: `${correctColor.russian} = ${meaning(correctColor)}`,
      language,
    });
  }

  function answerTap(color: ColorWord) {
    if (tapAnswer) return;
    const isCorrect = color.id === currentTapColor.id;
    setTapAnswer({ selectedId: color.id, isCorrect });
    if (!isCorrect) {
      recordMistake(`colors-tap-${currentTapColor.id}`, `${copy.tapCorrectColor}: ${currentTapColor.russian}`, meaning(color), currentTapColor);
    }
  }

  function answerListen(color: ColorWord) {
    if (listenAnswer) return;
    const isCorrect = color.id === currentListenColor.id;
    setListenAnswer({ selectedId: color.id, isCorrect });
    if (!isCorrect) {
      recordMistake(`colors-listen-${currentListenColor.id}`, copy.listenAndChooseColor, meaning(color), currentListenColor);
    }
  }

  function submitMatch() {
    if (Object.keys(matchAnswers).length !== matchIds.length || matchSubmitted) return;
    setMatchSubmitted(true);
    matchIds.map(getColor).forEach((color) => {
      if (matchAnswers[color.id] !== color.id) {
        const selected = matchAnswers[color.id] ? getColor(matchAnswers[color.id]) : null;
        recordMistake(`colors-match-${color.id}`, copy.matchTheColor, selected ? meaning(selected) : text.lesson.noAnswer, color);
      }
    });
  }

  function submitType(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (typeAnswer) return;
    const isCorrect = answersMatch(typedAnswer, currentTypeColor.russian);
    setTypeAnswer({ selectedId: typedAnswer, isCorrect });
    if (!isCorrect) {
      recordMistake(`colors-type-${currentTypeColor.id}`, copy.typeColorInRussian, typedAnswer, currentTypeColor);
    }
  }

  function answerFinal(isCorrect: boolean, userAnswer: string) {
    if (finalAnswer) return;
    setFinalAnswer({ selectedId: userAnswer, isCorrect });
    if (isCorrect) {
      setFinalScore((score) => score + 1);
    } else {
      setMissedFinalIds((ids) => (ids.includes(currentFinal.id) ? ids : [...ids, currentFinal.id]));
      recordMistake(currentFinal.id, getFinalPrompt(currentFinal, copy), userAnswer, currentFinalColor);
    }
  }

  function submitFinalType(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (currentFinal.type !== "type") return;
    answerFinal(answersMatch(finalTypedAnswer, currentFinalColor.russian), finalTypedAnswer);
  }

  function submitFinalMatch() {
    if (currentFinal.type !== "match" || finalAnswer || Object.keys(finalMatchAnswers).length !== 4) return;
    const targetColors = matchIds.slice(0, 4).map(getColor);
    const allCorrect = targetColors.every((color) => finalMatchAnswers[color.id] === color.id);
    answerFinal(allCorrect, copy.matchTheColor);
  }

  function continueTap() {
    if (tapIndex >= tapQuestionIds.length - 1) {
      changeStage("listen");
      return;
    }
    setTapIndex((index) => index + 1);
    setTapAnswer(null);
  }

  function continueListen() {
    if (listenIndex >= listenQuestionIds.length - 1) {
      changeStage("match");
      return;
    }
    setListenIndex((index) => index + 1);
    setListenAnswer(null);
  }

  function continueType() {
    if (typeIndex >= typeQuestionIds.length - 1) {
      changeStage("final");
      return;
    }
    setTypeIndex((index) => index + 1);
    setTypedAnswer("");
    setTypeAnswer(null);
  }

  function continueFinal() {
    if (finalIndex >= finalQuestions.length - 1) {
      const nextProgress = completeLesson(lesson.id, xpEarned);
      setCompletionProgress(nextProgress);
      setStage("complete");
      return;
    }
    setFinalIndex((index) => index + 1);
    setFinalAnswer(null);
    setFinalTypedAnswer("");
    setFinalMatchAnswers({});
    setFinalSelectedRussianId("");
  }

  function restart() {
    setStage("learn");
    setTapIndex(0);
    setListenIndex(0);
    setMatchAnswers({});
    setTypeIndex(0);
    setFinalQuestions(defaultFinalQuestions);
    setFinalIndex(0);
    setFinalScore(0);
    setMissedFinalIds([]);
    setCompletionProgress(null);
    resetAnswerState();
  }

  function retryMissed() {
    const missed = defaultFinalQuestions.filter((question) => missedFinalIds.includes(question.id));
    setFinalQuestions(missed.length > 0 ? missed : defaultFinalQuestions);
    setFinalIndex(0);
    setFinalScore(0);
    setMissedFinalIds([]);
    setStage("final");
    resetAnswerState();
  }

  if (stage === "complete") {
    const accuracy = Math.round((finalScore / Math.max(1, finalQuestions.length)) * 100);

    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navigation />
        <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl items-center px-4 pb-8 sm:px-6">
          <div className="w-full rounded-3xl border border-white/10 bg-white p-5 text-center text-slate-950 shadow-2xl shadow-cyan-950/20 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700" {...uiTextProps(language)}>{text.lesson.lessonComplete}</p>
            <h1 className="mt-3 text-3xl font-black sm:text-5xl" {...uiTextProps(language)}>{localizeLessonTitle(lesson.title, language)}</h1>
            <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-3">
              <ResultPill label={text.lesson.score} value={`${finalScore}/${finalQuestions.length}`} />
              <ResultPill label={text.lesson.accuracy} value={`${accuracy}%`} />
              <ResultPill label={text.lesson.xpEarned} value={`${xpEarned} XP`} />
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <button type="button" onClick={retryMissed} className="rounded-full bg-lime-300 px-5 py-4 font-black text-slate-950 transition hover:bg-lime-200" {...uiTextProps(language)}>
                {copy.retryMissed}
              </button>
              <Link href="/writing" className="rounded-full bg-cyan-300 px-5 py-4 font-black text-slate-950 transition hover:bg-cyan-200" {...uiTextProps(language)}>
                {copy.practiceColorsInWriting}
              </Link>
              <Link href="/worlds" className="rounded-full border border-slate-200 bg-white px-5 py-4 font-black text-slate-950 transition hover:bg-slate-50" {...uiTextProps(language)}>
                {copy.backToBasics}
              </Link>
              <Link href={nextAction.href} className="rounded-full bg-slate-950 px-5 py-4 font-black text-white transition hover:bg-slate-800" {...uiTextProps(language)}>
                {localizeActionLabel(nextAction.label, language)}
              </Link>
            </div>
            <button type="button" onClick={restart} className="mt-4 text-sm font-black text-cyan-700 underline" {...uiTextProps(language)}>
              {copy.restartLesson}
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <Navigation />
      <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/95 px-4 py-2 backdrop-blur">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-3 text-xs font-black" {...uiTextProps(language)}>
            <span>{getStageLabel(stage, copy)}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <header className="py-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300" {...uiTextProps(language)}>{copy.russianTopic}</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1 className="break-words text-3xl font-black sm:text-5xl" {...uiTextProps(language)}>{localizeLessonTitle(lesson.title, language)}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base" {...uiTextProps(language)}>
                {localizeLessonDescription(lesson.description, language)}
              </p>
            </div>
            <StageStepper stage={stage} copy={copy} />
          </div>
        </header>

        {stage === "learn" ? (
          <LearnStage language={language} copy={copy} meaning={meaning} onContinue={() => changeStage("tap")} />
        ) : null}

        {stage === "tap" ? (
          <PracticePanel title={copy.tapCorrectColor} detail={currentTapColor.russian} language={language}>
            <ColorChoiceGrid target={currentTapColor} answer={tapAnswer} onChoose={answerTap} />
            {tapAnswer ? <Feedback correct={tapAnswer.isCorrect} color={currentTapColor} language={language} meaning={meaning} onContinue={continueTap} /> : null}
          </PracticePanel>
        ) : null}

        {stage === "listen" ? (
          <PracticePanel title={copy.listenAndChooseColor} detail="" language={language}>
            <div className="mb-5 flex justify-center">
              <PronounceButton text={currentListenColor.russian} ariaLabel={copy.playPronunciation} title={copy.playPronunciation} className="h-20 w-20 border-cyan-300 bg-cyan-50 text-cyan-800 hover:bg-cyan-100" />
            </div>
            <ColorChoiceGrid target={currentListenColor} answer={listenAnswer} onChoose={answerListen} />
            {listenAnswer ? <Feedback correct={listenAnswer.isCorrect} color={currentListenColor} language={language} meaning={meaning} onContinue={continueListen} /> : null}
          </PracticePanel>
        ) : null}

        {stage === "match" ? (
          <MatchPanel
            copy={copy}
            language={language}
            ids={matchIds}
            optionColors={matchOptions}
            answers={matchAnswers}
            selectedRussianId={selectedRussianId}
            submitted={matchSubmitted}
            meaning={meaning}
            onSelectRussian={setSelectedRussianId}
            onSelectColor={(colorId) => {
              if (!selectedRussianId || matchSubmitted) return;
              setMatchAnswers((answers) => ({ ...answers, [selectedRussianId]: colorId }));
              setSelectedRussianId("");
            }}
            onSubmit={submitMatch}
            onContinue={() => changeStage("type")}
          />
        ) : null}

        {stage === "type" ? (
          <TypePanel
            copy={copy}
            language={language}
            color={currentTypeColor}
            answer={typedAnswer}
            result={typeAnswer}
            meaning={meaning}
            inputRef={inputRef}
            onAnswerChange={setTypedAnswer}
            onSubmit={submitType}
            onContinue={continueType}
          />
        ) : null}

        {stage === "final" ? (
          <FinalPanel
            copy={copy}
            language={language}
            question={currentFinal}
            index={finalIndex}
            total={finalQuestions.length}
            targetColor={currentFinalColor}
            answer={finalAnswer}
            typedAnswer={finalTypedAnswer}
            matchAnswers={finalMatchAnswers}
            selectedRussianId={finalSelectedRussianId}
            finalMatchOptions={finalMatchOptions}
            meaning={meaning}
            onChoose={(color) => answerFinal(color.id === currentFinalColor.id, meaning(color))}
            onTypedAnswerChange={setFinalTypedAnswer}
            onTypeSubmit={submitFinalType}
            onMatchRussian={setFinalSelectedRussianId}
            onMatchColor={(colorId) => {
              if (!finalSelectedRussianId || finalAnswer) return;
              setFinalMatchAnswers((answers) => ({ ...answers, [finalSelectedRussianId]: colorId }));
              setFinalSelectedRussianId("");
            }}
            onMatchSubmit={submitFinalMatch}
            onContinue={continueFinal}
          />
        ) : null}
      </section>
    </main>
  );
}

function LearnStage({
  language,
  copy,
  meaning,
  onContinue,
}: {
  language: ExplanationLanguage;
  copy: ReturnType<typeof colorCopy>;
  meaning: (color: ColorWord) => string;
  onContinue: () => void;
}) {
  return (
    <section>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {colors.map((color) => (
          <article key={color.id} className="rounded-3xl border border-slate-200 bg-white p-4 text-slate-950 shadow-xl shadow-cyan-950/10">
            <div className="flex items-center gap-4">
              <ColorSwatch color={color} size="large" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="break-words text-2xl font-black" dir="ltr" lang="ru">{color.russian}</p>
                  <PronounceButton text={color.russian} className="border-cyan-500/40 bg-cyan-50 text-cyan-800 hover:bg-cyan-100" />
                </div>
                <p className="mt-1 text-sm font-bold text-slate-600" {...uiTextProps(language)}>{meaning(color)}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
      <button type="button" onClick={onContinue} className="mt-6 w-full rounded-full bg-cyan-300 px-6 py-4 font-black text-slate-950 transition hover:bg-cyan-200 sm:w-auto" {...uiTextProps(language)}>
        {copy.startPractice}
      </button>
    </section>
  );
}

function PracticePanel({ title, detail, language, children }: { title: string; detail: string; language: ExplanationLanguage; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-cyan-100 bg-white p-4 text-slate-950 shadow-2xl shadow-cyan-950/20 sm:p-6">
      <div className="mb-5 text-center">
        <h2 className="text-2xl font-black sm:text-3xl" {...uiTextProps(language)}>{title}</h2>
        {detail ? <p className="mt-3 text-5xl font-black text-slate-950" dir="ltr" lang="ru">{detail}</p> : null}
      </div>
      {children}
    </section>
  );
}

function ColorChoiceGrid({ target, answer, onChoose }: { target: ColorWord; answer: AnswerState | null; onChoose: (color: ColorWord) => void }) {
  const options = useMemo(() => getColorOptions(target), [target]);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {options.map((color) => {
        const selected = answer?.selectedId === color.id;
        const correct = color.id === target.id;
        return (
          <button
            key={color.id}
            type="button"
            disabled={Boolean(answer)}
            onClick={() => onChoose(color)}
            className={`rounded-3xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
              answer && correct
                ? "border-emerald-400 bg-emerald-50"
                : selected && !correct
                  ? "border-red-400 bg-red-50"
                  : "border-slate-200 bg-slate-50 hover:border-cyan-300"
            }`}
          >
            <ColorSwatch color={color} />
          </button>
        );
      })}
    </div>
  );
}

function MatchPanel({
  copy,
  language,
  ids,
  optionColors,
  answers,
  selectedRussianId,
  submitted,
  meaning,
  onSelectRussian,
  onSelectColor,
  onSubmit,
  onContinue,
  showFeedback = true,
}: {
  copy: ReturnType<typeof colorCopy>;
  language: ExplanationLanguage;
  ids: string[];
  optionColors: ColorWord[];
  answers: Record<string, string>;
  selectedRussianId: string;
  submitted: boolean;
  meaning: (color: ColorWord) => string;
  onSelectRussian: (id: string) => void;
  onSelectColor: (id: string) => void;
  onSubmit: () => void;
  onContinue: () => void;
  showFeedback?: boolean;
}) {
  const complete = Object.keys(answers).length === ids.length;
  const allCorrect = ids.map(getColor).every((color) => answers[color.id] === color.id);
  return (
    <section className="rounded-3xl border border-cyan-100 bg-white p-4 text-slate-950 shadow-2xl shadow-cyan-950/20 sm:p-6">
      <h2 className="text-2xl font-black" {...uiTextProps(language)}>{copy.matchTheColor}</h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          {ids.map(getColor).map((color) => (
            <button key={color.id} type="button" disabled={submitted} onClick={() => onSelectRussian(selectedRussianId === color.id ? "" : color.id)} className={`rounded-2xl border px-4 py-3 text-left text-xl font-black ${selectedRussianId === color.id ? "border-cyan-400 bg-cyan-50" : "border-slate-200 bg-slate-50"}`} dir="ltr" lang="ru">
              {color.russian}
            </button>
          ))}
        </div>
        <div className="grid gap-2">
          {optionColors.map((color) => {
            const used = Object.values(answers).includes(color.id);
            return (
              <button key={color.id} type="button" disabled={submitted || !selectedRussianId} onClick={() => onSelectColor(color.id)} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left font-black disabled:opacity-70">
                <ColorSwatch color={color} size="small" />
                <span {...uiTextProps(language)}>{used ? copy.matched : meaning(color)}</span>
              </button>
            );
          })}
        </div>
      </div>
      {submitted && showFeedback ? <Feedback correct={allCorrect} color={ids.map(getColor).find((color) => answers[color.id] !== color.id) ?? getColor(ids[0])} language={language} meaning={meaning} onContinue={onContinue} /> : null}
      {!submitted ? (
        <button type="button" disabled={!complete} onClick={onSubmit} className="mt-5 w-full rounded-full bg-cyan-300 px-5 py-4 font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500" {...uiTextProps(language)}>
          {copy.check}
        </button>
      ) : null}
    </section>
  );
}

function TypePanel({
  copy,
  language,
  color,
  answer,
  result,
  meaning,
  inputRef,
  onAnswerChange,
  onSubmit,
  onContinue,
}: {
  copy: ReturnType<typeof colorCopy>;
  language: ExplanationLanguage;
  color: ColorWord;
  answer: string;
  result: AnswerState | null;
  meaning: (color: ColorWord) => string;
  inputRef: RefObject<HTMLInputElement | null>;
  onAnswerChange: (value: string) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
  onContinue: () => void;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="rounded-3xl border border-cyan-100 bg-white p-4 text-slate-950 shadow-2xl shadow-cyan-950/20 sm:p-6">
        <h2 className="text-2xl font-black" {...uiTextProps(language)}>{copy.typeColorInRussian}</h2>
        <div className="mt-5 flex items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <ColorSwatch color={color} size="large" />
          <p className="text-xl font-black" {...uiTextProps(language)}>{meaning(color)}</p>
        </div>
        <form onSubmit={onSubmit} className="mt-5">
          <input ref={inputRef} value={answer} onChange={(event) => onAnswerChange(event.target.value)} disabled={Boolean(result)} lang="ru" dir="ltr" spellCheck={false} autoComplete="off" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-3xl font-black text-slate-950 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200" />
          {result ? <Feedback correct={result.isCorrect} color={color} language={language} meaning={meaning} onContinue={onContinue} /> : null}
          {!result ? <button type="submit" className="mt-5 w-full rounded-full bg-cyan-300 px-5 py-4 font-black text-slate-950 hover:bg-cyan-200" {...uiTextProps(language)}>{copy.check}</button> : null}
        </form>
      </div>
      <RussianKeyboard onKey={(key) => onAnswerChange(`${answer}${key}`)} onBackspace={() => onAnswerChange(answer.slice(0, -1))} onSpace={() => onAnswerChange(`${answer} `)} />
    </section>
  );
}

function FinalPanel({
  copy,
  language,
  question,
  index,
  total,
  targetColor,
  answer,
  typedAnswer,
  matchAnswers,
  selectedRussianId,
  finalMatchOptions,
  meaning,
  onChoose,
  onTypedAnswerChange,
  onTypeSubmit,
  onMatchRussian,
  onMatchColor,
  onMatchSubmit,
  onContinue,
}: {
  copy: ReturnType<typeof colorCopy>;
  language: ExplanationLanguage;
  question: FinalQuestion;
  index: number;
  total: number;
  targetColor: ColorWord;
  answer: AnswerState | null;
  typedAnswer: string;
  matchAnswers: Record<string, string>;
  selectedRussianId: string;
  finalMatchOptions: ColorWord[];
  meaning: (color: ColorWord) => string;
  onChoose: (color: ColorWord) => void;
  onTypedAnswerChange: (value: string) => void;
  onTypeSubmit: (event?: FormEvent<HTMLFormElement>) => void;
  onMatchRussian: (id: string) => void;
  onMatchColor: (id: string) => void;
  onMatchSubmit: () => void;
  onContinue: () => void;
}) {
  return (
    <section className="rounded-3xl border border-lime-100 bg-white p-4 text-slate-950 shadow-2xl shadow-lime-950/20 sm:p-6">
      <p className="text-sm font-black text-cyan-700" {...uiTextProps(language)}>{copy.finalChallenge} {index + 1}/{total}</p>
      {question.type === "tap" ? (
        <PracticePanel title={copy.tapCorrectColor} detail={targetColor.russian} language={language}>
          <ColorChoiceGrid target={targetColor} answer={answer} onChoose={onChoose} />
        </PracticePanel>
      ) : null}
      {question.type === "listen" ? (
        <PracticePanel title={copy.listenAndChooseColor} detail="" language={language}>
          <div className="mb-5 flex justify-center"><PronounceButton text={targetColor.russian} className="h-20 w-20 border-cyan-300 bg-cyan-50 text-cyan-800" /></div>
          <ColorChoiceGrid target={targetColor} answer={answer} onChoose={onChoose} />
        </PracticePanel>
      ) : null}
      {question.type === "type" ? (
        <form onSubmit={onTypeSubmit} className="mt-5">
          <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <ColorSwatch color={targetColor} size="large" />
            <p className="text-xl font-black" {...uiTextProps(language)}>{meaning(targetColor)}</p>
          </div>
          <input value={typedAnswer} onChange={(event) => onTypedAnswerChange(event.target.value)} disabled={Boolean(answer)} lang="ru" dir="ltr" className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-3xl font-black text-slate-950 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200" />
          {!answer ? <button type="submit" className="mt-4 w-full rounded-full bg-cyan-300 px-5 py-4 font-black text-slate-950">{copy.check}</button> : null}
        </form>
      ) : null}
      {question.type === "match" ? (
        <MatchPanel copy={copy} language={language} ids={matchIds.slice(0, 4)} optionColors={finalMatchOptions} answers={matchAnswers} selectedRussianId={selectedRussianId} submitted={Boolean(answer)} meaning={meaning} onSelectRussian={onMatchRussian} onSelectColor={onMatchColor} onSubmit={onMatchSubmit} onContinue={() => {}} showFeedback={false} />
      ) : null}
      {answer ? <Feedback correct={answer.isCorrect} color={targetColor} language={language} meaning={meaning} onContinue={onContinue} /> : null}
    </section>
  );
}

function RussianKeyboard({ onKey, onBackspace, onSpace }: { onKey: (key: string) => void; onBackspace: () => void; onSpace: () => void }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
      <div className="grid gap-2">
        {russianKeyboardRows.map((row) => (
          <div key={row.join("")} className="flex justify-center gap-1.5">
            {row.map((key) => (
              <button key={key} type="button" onClick={() => onKey(key)} className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900/90 text-lg font-black text-white transition hover:border-cyan-300/50" dir="ltr" lang="ru">{key}</button>
            ))}
          </div>
        ))}
        <div className="grid grid-cols-[1fr_2fr_1fr] gap-2">
          <button type="button" onClick={onBackspace} className="rounded-xl border border-white/10 bg-slate-900/90 px-3 py-3 text-sm font-black">Back</button>
          <button type="button" onClick={onSpace} className="rounded-xl border border-white/10 bg-slate-900/90 px-3 py-3 text-sm font-black">Space</button>
          <button type="button" onClick={() => onKey("ё")} className="rounded-xl border border-white/10 bg-slate-900/90 px-3 py-3 text-lg font-black" dir="ltr" lang="ru">ё</button>
        </div>
      </div>
    </div>
  );
}

function Feedback({ correct, color, language, meaning, onContinue }: { correct: boolean; color: ColorWord; language: ExplanationLanguage; meaning: (color: ColorWord) => string; onContinue: () => void }) {
  const text = getUiText(language);
  const copy = colorCopy(language);
  return (
    <div className={`mt-5 rounded-2xl border p-4 ${correct ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"}`} role="status">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-black" {...uiTextProps(language)}>{correct ? text.lesson.correct : text.lesson.tryAgain}</p>
          <p className="mt-1 text-sm font-bold text-slate-700">
            <span dir="ltr" lang="ru">{color.russian}</span> = <span {...uiTextProps(language)}>{meaning(color)}</span>
          </p>
          {!correct ? <p className="mt-1 text-sm text-red-700" {...uiTextProps(language)}>{copy.correctColor}: <span dir="ltr" lang="ru">{color.russian}</span></p> : null}
        </div>
        <button type="button" onClick={onContinue} className="rounded-full bg-cyan-300 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-200" {...uiTextProps(language)}>{text.lesson.continue}</button>
      </div>
    </div>
  );
}

function ColorSwatch({ color, size = "normal" }: { color: ColorWord; size?: "small" | "normal" | "large" }) {
  const sizeClass = size === "small" ? "h-12" : size === "large" ? "h-20" : "h-24";
  return (
    <div className={`${sizeClass} w-full min-w-16 rounded-2xl border border-slate-200 shadow-inner`} style={{ backgroundColor: color.hex, boxShadow: `inset 0 0 0 3px ${color.ring}` }} aria-label={color.english} />
  );
}

function StageStepper({ stage, copy }: { stage: ColorStage; copy: ReturnType<typeof colorCopy> }) {
  const currentIndex = stageOrder.indexOf(stage);
  return (
    <ol className="flex max-w-full gap-2 overflow-x-auto pb-1">
      {stageOrder.map((step, index) => (
        <li key={step} className={`shrink-0 rounded-full px-3 py-2 text-xs font-black ${index === currentIndex ? "bg-lime-300 text-slate-950" : index < currentIndex ? "bg-cyan-300/20 text-cyan-100" : "bg-slate-900/80 text-slate-400"}`}>
          {getStageLabel(step, copy)}
        </li>
      ))}
    </ol>
  );
}

function ResultPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-cyan-800">{value}</p>
    </div>
  );
}

function getColor(id: string) {
  const color = colors.find((candidate) => candidate.id === id);
  if (!color) throw new Error(`Unknown color: ${id}`);
  return color;
}

function getColorByRussian(russian: string) {
  const color = colors.find((candidate) => candidate.russian === russian);
  if (!color) throw new Error(`Unknown Russian color: ${russian}`);
  return color;
}

function getColorOptions(target: ColorWord) {
  const distractors = colors.filter((color) => color.id !== target.id).slice(0, 7);
  return getStableShuffledColors([target, ...distractors].slice(0, 4), `colors-options-${target.id}`);
}

function getStableShuffledColors(items: ColorWord[], seed: string) {
  return [...items].sort((left, right) => stableHash(`${seed}:${left.id}`) - stableHash(`${seed}:${right.id}`));
}

function getStableDerangedColors(items: ColorWord[], seed: string) {
  if (items.length < 2) return items;
  const originalIds = items.map((item) => item.id);
  const shuffled = getStableShuffledColors(items, seed);
  for (let attempt = 0; attempt < shuffled.length; attempt += 1) {
    if (shuffled.every((item, index) => item.id !== originalIds[index])) return shuffled;
    shuffled.push(shuffled.shift() ?? shuffled[0]);
  }
  return [...items.slice(1), items[0]];
}

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function answersMatch(answer: string, target: string) {
  return normalizeForComparison(answer) === normalizeForComparison(target);
}

function normalizeForComparison(value: string) {
  return value.trim().replaceAll("ё", "е").replaceAll("Ё", "Е").toLocaleLowerCase("ru-RU");
}

function getStageProgress(stage: ColorStage, tapIndex: number, listenIndex: number, matchedCount: number, typeIndex: number, finalIndex: number, finalTotal: number) {
  const stageBase: Record<ColorStage, number> = {
    learn: 8,
    tap: 24 + (tapIndex / tapQuestionIds.length) * 16,
    listen: 42 + (listenIndex / listenQuestionIds.length) * 14,
    match: 58 + (matchedCount / matchIds.length) * 12,
    type: 72 + (typeIndex / typeQuestionIds.length) * 12,
    final: 86 + (finalIndex / Math.max(1, finalTotal)) * 14,
    complete: 100,
  };
  return Math.min(100, stageBase[stage]);
}

function getFinalPrompt(question: FinalQuestion, copy: ReturnType<typeof colorCopy>) {
  if (question.type === "tap") return copy.tapCorrectColor;
  if (question.type === "listen") return copy.listenAndChooseColor;
  if (question.type === "match") return copy.matchTheColor;
  return copy.typeColorInRussian;
}

function getStageLabel(stage: ColorStage, copy: ReturnType<typeof colorCopy>) {
  const labels: Record<ColorStage, string> = {
    learn: copy.learn,
    tap: copy.tap,
    listen: copy.listen,
    match: copy.match,
    type: copy.type,
    final: copy.final,
    complete: copy.complete,
  };
  return labels[stage];
}

function colorCopy(language: ExplanationLanguage) {
  const text = getUiText(language);
  const lessonText = text.lesson;
  const ar = language === "ar";
  return {
    russianTopic: "Цвета",
    learn: ar ? "تعلّم" : "Learn",
    tap: ar ? "اختيار" : "Tap",
    listen: ar ? "استماع" : "Listen",
    match: ar ? "مطابقة" : "Match",
    type: ar ? "كتابة" : "Type",
    final: ar ? "التحدي" : "Final",
    complete: text.lesson.lessonComplete,
    tapCorrectColor: lessonText.tapCorrectColor,
    listenAndChooseColor: lessonText.listenAndChooseColor,
    matchTheColor: lessonText.matchTheColor,
    typeColorInRussian: lessonText.typeColorInRussian,
    correctColor: lessonText.correctColor,
    practiceColorsInWriting: lessonText.practiceColorsInWriting,
    finalChallenge: lessonText.finalChallenge,
    playPronunciation: lessonText.playPronunciation,
    startPractice: lessonText.startPractice,
    check: ar ? "تحقق" : "Check",
    matched: ar ? "تم الاختيار" : "Selected",
    retryMissed: ar ? "أعد الأسئلة الخاطئة" : "Retry missed",
    backToBasics: text.common.backToBasics,
    restartLesson: ar ? "إعادة الدرس" : "Restart lesson",
  };
}
