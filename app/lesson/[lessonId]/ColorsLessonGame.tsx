"use client";

import Link from "next/link";
import { type FormEvent, type ReactNode, type RefObject, useMemo, useRef, useState } from "react";
import { useExplanationLanguage } from "@/components/LanguageSelector";
import { Navigation } from "@/components/Navigation";
import { PronounceButton } from "@/components/PronounceButton";
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

type ColorStage = "learn" | "choose" | "listen" | "match" | "type" | "final" | "complete";
type AnswerState = { selectedId: string; isCorrect: boolean };
type FinalQuestion =
  | { id: string; type: "choose" | "listen" | "type"; colorId: string }
  | { id: string; type: "match"; colorId: "match-set" };

type ColorWord = {
  id: string;
  russian: string;
  english: string;
  arabic: string;
  hex: string;
  ring: string;
  textTone: "light" | "dark";
};

const colors: ColorWord[] = [
  { id: "red", russian: "красный", english: "red", arabic: "أحمر", hex: "#EF4444", ring: "#FECACA", textTone: "light" },
  { id: "blue", russian: "синий", english: "blue", arabic: "أزرق", hex: "#2563EB", ring: "#BFDBFE", textTone: "light" },
  { id: "green", russian: "зелёный", english: "green", arabic: "أخضر", hex: "#22C55E", ring: "#BBF7D0", textTone: "dark" },
  { id: "yellow", russian: "жёлтый", english: "yellow", arabic: "أصفر", hex: "#FACC15", ring: "#FEF08A", textTone: "dark" },
  { id: "black", russian: "чёрный", english: "black", arabic: "أسود", hex: "#111827", ring: "#CBD5E1", textTone: "light" },
  { id: "white", russian: "белый", english: "white", arabic: "أبيض", hex: "#FFFFFF", ring: "#CBD5E1", textTone: "dark" },
  { id: "orange", russian: "оранжевый", english: "orange", arabic: "برتقالي", hex: "#F97316", ring: "#FED7AA", textTone: "light" },
  { id: "purple", russian: "фиолетовый", english: "purple", arabic: "بنفسجي", hex: "#8B5CF6", ring: "#DDD6FE", textTone: "light" },
  { id: "pink", russian: "розовый", english: "pink", arabic: "وردي", hex: "#EC4899", ring: "#FBCFE8", textTone: "light" },
  { id: "brown", russian: "коричневый", english: "brown", arabic: "بني", hex: "#92400E", ring: "#E7D3BD", textTone: "light" },
  { id: "gray", russian: "серый", english: "gray", arabic: "رمادي", hex: "#6B7280", ring: "#CBD5E1", textTone: "light" },
  { id: "light-blue", russian: "голубой", english: "light blue", arabic: "أزرق فاتح", hex: "#38BDF8", ring: "#BAE6FD", textTone: "dark" },
];

const chooseQuestionIds = ["red", "blue", "green", "yellow", "purple", "light-blue"];
const listenQuestionIds = ["black", "white", "orange", "pink", "brown", "gray"];
const typeQuestionIds = ["green", "yellow", "blue", "light-blue", "red"];
const matchIds = ["red", "blue", "green", "yellow", "black", "white"];
const finalMatchIds = ["red", "green", "yellow", "purple"];
const stageOrder: ColorStage[] = ["learn", "choose", "listen", "match", "type", "final"];

const defaultFinalQuestions: FinalQuestion[] = [
  { id: "final-choose-red", type: "choose", colorId: "red" },
  { id: "final-listen-blue", type: "listen", colorId: "blue" },
  { id: "final-type-green", type: "type", colorId: "green" },
  { id: "final-choose-yellow", type: "choose", colorId: "yellow" },
  { id: "final-match-core", type: "match", colorId: "match-set" },
  { id: "final-listen-purple", type: "listen", colorId: "purple" },
  { id: "final-type-light-blue", type: "type", colorId: "light-blue" },
  { id: "final-choose-orange", type: "choose", colorId: "orange" },
  { id: "final-listen-black", type: "listen", colorId: "black" },
  { id: "final-type-yellow", type: "type", colorId: "yellow" },
];

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
  const [chooseIndex, setChooseIndex] = useState(0);
  const [chooseAnswer, setChooseAnswer] = useState<AnswerState | null>(null);
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
  const currentChooseColor = getColor(chooseQuestionIds[chooseIndex]);
  const currentListenColor = getColor(listenQuestionIds[listenIndex]);
  const currentTypeColor = getColor(typeQuestionIds[typeIndex]);
  const currentFinal = finalQuestions[finalIndex] ?? finalQuestions[0];
  const currentFinalColor = currentFinal.type === "match" ? getColor(finalMatchIds[0]) : getColor(currentFinal.colorId);
  const matchOptions = useMemo(() => getStableDerangedColors(matchIds.map(getColor), "colors-match"), []);
  const finalMatchOptions = useMemo(() => getStableDerangedColors(finalMatchIds.map(getColor), "colors-final-match"), []);
  const progress = getStageProgress(stage, chooseIndex, listenIndex, Object.keys(matchAnswers).length, typeIndex, finalIndex, finalQuestions.length);
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
    setChooseAnswer(null);
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

  function answerChoose(color: ColorWord) {
    if (chooseAnswer) return;
    const isCorrect = color.id === currentChooseColor.id;
    setChooseAnswer({ selectedId: color.id, isCorrect });
    if (!isCorrect) {
      recordMistake(`colors-choose-${currentChooseColor.id}`, `${copy.tapCorrectColor}: ${currentChooseColor.russian}`, meaning(color), currentChooseColor);
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

  function assignMatchAnswer(russianId: string, colorId: string, final = false) {
    const setAnswers = final ? setFinalMatchAnswers : setMatchAnswers;
    setAnswers((answers) => {
      const nextAnswers = Object.fromEntries(
        Object.entries(answers).filter(([existingRussianId, existingColorId]) => existingRussianId !== russianId && existingColorId !== colorId),
      );
      return { ...nextAnswers, [russianId]: colorId };
    });
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

  function answerFinal(isCorrect: boolean, userAnswer: string, correctColor = currentFinalColor) {
    if (finalAnswer) return;
    setFinalAnswer({ selectedId: userAnswer, isCorrect });
    if (isCorrect) {
      setFinalScore((score) => score + 1);
      return;
    }
    setMissedFinalIds((ids) => (ids.includes(currentFinal.id) ? ids : [...ids, currentFinal.id]));
    recordMistake(currentFinal.id, getFinalPrompt(currentFinal, copy), userAnswer, correctColor);
  }

  function submitFinalType(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (currentFinal.type !== "type") return;
    answerFinal(answersMatch(finalTypedAnswer, currentFinalColor.russian), finalTypedAnswer, currentFinalColor);
  }

  function submitFinalMatch() {
    if (currentFinal.type !== "match" || finalAnswer || Object.keys(finalMatchAnswers).length !== finalMatchIds.length) return;
    const targetColors = finalMatchIds.map(getColor);
    const wrongColor = targetColors.find((color) => finalMatchAnswers[color.id] !== color.id);
    answerFinal(!wrongColor, copy.matchTheColor, wrongColor ?? targetColors[0]);
  }

  function continueChoose() {
    if (chooseIndex >= chooseQuestionIds.length - 1) {
      changeStage("listen");
      return;
    }
    setChooseIndex((index) => index + 1);
    setChooseAnswer(null);
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
    window.setTimeout(() => inputRef.current?.focus(), 0);
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
    setChooseIndex(0);
    setListenIndex(0);
    setMatchAnswers({});
    setMatchSubmitted(false);
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
      <LessonShell>
        <section className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-5xl items-center px-4 pb-10 sm:px-6">
          <div className="w-full overflow-hidden rounded-[2rem] border border-white bg-white text-[var(--brand-navy)] shadow-[0_28px_90px_rgb(17_32_59_/_0.16)] dark:border-white/10 dark:bg-[#10223d] dark:text-[var(--app-text)]">
            <div className="bg-[linear-gradient(135deg,rgb(87_212_232_/_0.18),rgb(183_229_49_/_0.28),rgb(255_255_255_/_0.82))] p-6 text-center dark:bg-[linear-gradient(135deg,rgb(20_184_166_/_0.18),rgb(183_229_49_/_0.14),rgb(16_34_61_/_0.9))] sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--brand-teal)]" {...uiTextProps(language)}>
                {text.lesson.lessonComplete}
              </p>
              <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl" {...uiTextProps(language)}>
                {localizeLessonTitle(lesson.title, language)}
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm font-bold text-[var(--app-text-muted)] sm:text-base" {...uiTextProps(language)}>
                {copy.completeMessage}
              </p>
            </div>
            <div className="p-5 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-3">
                <ResultPill label={text.lesson.score} value={`${finalScore}/${finalQuestions.length}`} />
                <ResultPill label={text.lesson.accuracy} value={`${accuracy}%`} />
                <ResultPill label={text.lesson.xpEarned} value={`${xpEarned} XP`} />
              </div>
              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Link href="/worlds" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--card-border)] bg-white px-5 py-3 text-center font-black text-[var(--brand-navy)] shadow-sm transition hover:border-[var(--brand-teal)] hover:bg-[var(--app-primary-soft)] dark:bg-white/10 dark:text-[var(--app-text)]" {...uiTextProps(language)}>
                  {copy.backToBasics}
                </Link>
                <Link href="/writing" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-cyan)] px-5 py-3 text-center font-black text-[var(--brand-navy)] shadow-sm transition hover:bg-cyan-200" {...uiTextProps(language)}>
                  {copy.practiceWriting}
                </Link>
                <button type="button" onClick={restart} className="min-h-12 rounded-full bg-[var(--brand-lime)] px-5 py-3 font-black text-[var(--brand-navy)] shadow-sm transition hover:bg-lime-200" {...uiTextProps(language)}>
                  {copy.retry}
                </button>
                <Link href={nextAction.href} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-navy)] px-5 py-3 text-center font-black text-[#f8fbff] shadow-sm transition hover:bg-[var(--brand-teal)]" {...uiTextProps(language)}>
                  {localizeActionLabel(nextAction.label, language)}
                </Link>
              </div>
              {missedFinalIds.length > 0 ? (
                <button type="button" onClick={retryMissed} className="mx-auto mt-4 block text-sm font-black text-[var(--brand-teal)] underline underline-offset-4" {...uiTextProps(language)}>
                  {copy.retryMissed}
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </LessonShell>
    );
  }

  return (
    <LessonShell>
      <div className="sticky top-0 z-20 border-b border-cyan-950/10 bg-white/88 px-4 py-2 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-[#081323]/88">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-3 text-xs font-black text-[var(--brand-navy)] dark:text-[var(--app-text)]" {...uiTextProps(language)}>
            <span>{getStageLabel(stage, copy)}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand-teal),var(--brand-cyan),var(--brand-lime))] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <header className="py-5 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--brand-teal)]" {...uiTextProps(language)}>
                {copy.russianTopic}
              </p>
              <h1 className="mt-3 break-words text-3xl font-black leading-tight text-[var(--brand-navy)] sm:text-5xl dark:text-[var(--app-text)]" {...uiTextProps(language)}>
                {localizeLessonTitle(lesson.title, language)}
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[var(--app-text-muted)] sm:text-base" {...uiTextProps(language)}>
                {localizeLessonDescription(lesson.description, language)}
              </p>
            </div>
            <StageStepper stage={stage} copy={copy} onSelect={changeStage} />
          </div>
        </header>

        {stage === "learn" ? (
          <LearnStage language={language} copy={copy} meaning={meaning} onContinue={() => changeStage("choose")} />
        ) : null}

        {stage === "choose" ? (
          <PracticePanel title={copy.tapCorrectColor} detail={currentChooseColor.russian} language={language}>
            {chooseAnswer ? <Feedback correct={chooseAnswer.isCorrect} color={currentChooseColor} language={language} meaning={meaning} onContinue={continueChoose} /> : null}
            <ColorChoiceGrid target={currentChooseColor} answer={chooseAnswer} language={language} meaning={meaning} onChoose={answerChoose} />
          </PracticePanel>
        ) : null}

        {stage === "listen" ? (
          <PracticePanel title={copy.listenAndChooseColor} detail="" language={language}>
            <div className="mb-5 flex justify-center">
              <PronounceButton text={currentListenColor.russian} ariaLabel={copy.playPronunciation} title={copy.playPronunciation} className="h-20 w-20 border-[var(--brand-cyan)] bg-cyan-50 text-[var(--brand-navy)] shadow-lg shadow-cyan-950/10 hover:bg-cyan-100 dark:bg-cyan-300/15 dark:text-cyan-100" />
            </div>
            {listenAnswer ? <Feedback correct={listenAnswer.isCorrect} color={currentListenColor} language={language} meaning={meaning} onContinue={continueListen} /> : null}
            <ColorChoiceGrid target={currentListenColor} answer={listenAnswer} language={language} meaning={meaning} onChoose={answerListen} />
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
              assignMatchAnswer(selectedRussianId, colorId);
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
            onChoose={(color) => answerFinal(color.id === currentFinalColor.id, meaning(color), currentFinalColor)}
            onTypedAnswerChange={setFinalTypedAnswer}
            onTypeSubmit={submitFinalType}
            onMatchRussian={setFinalSelectedRussianId}
            onMatchColor={(colorId) => {
              if (!finalSelectedRussianId || finalAnswer) return;
              assignMatchAnswer(finalSelectedRussianId, colorId, true);
              setFinalSelectedRussianId("");
            }}
            onMatchSubmit={submitFinalMatch}
            onContinue={continueFinal}
          />
        ) : null}
      </section>
    </LessonShell>
  );
}

function LessonShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f7fcff_0%,#eef8fb_48%,#f7fbff_100%)] text-[var(--brand-navy)] dark:bg-[linear-gradient(180deg,#081323_0%,#10223d_50%,#081323_100%)] dark:text-[var(--app-text)]">
      <Navigation />
      {children}
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
      <div className="mb-5 rounded-[1.5rem] border border-white bg-white/90 p-4 shadow-[0_18px_48px_rgb(17_32_59_/_0.08)] dark:border-white/10 dark:bg-white/8 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-[var(--brand-navy)] dark:text-[var(--app-text)]" {...uiTextProps(language)}>
              {copy.learnColors}
            </h2>
            <p className="mt-1 text-sm font-semibold text-[var(--app-text-muted)]" {...uiTextProps(language)}>
              {copy.learnHint}
            </p>
          </div>
          <button type="button" onClick={onContinue} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-navy)] px-6 py-3 font-black text-[#f8fbff] shadow-sm transition hover:bg-[var(--brand-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:ring-offset-2 focus:ring-offset-white dark:bg-[var(--brand-lime)] dark:text-[var(--brand-navy)] dark:focus:ring-offset-[#10223d]" {...uiTextProps(language)}>
            {copy.startPractice}
          </button>
        </div>
      </div>
      <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {colors.map((color) => (
          <ColorLearnCard key={color.id} color={color} language={language} meaning={meaning(color)} />
        ))}
      </div>
    </section>
  );
}

function ColorLearnCard({ color, language, meaning }: { color: ColorWord; language: ExplanationLanguage; meaning: string }) {
  return (
    <article className="grid min-h-[18rem] overflow-hidden rounded-[1.5rem] border border-white bg-white shadow-[0_18px_48px_rgb(17_32_59_/_0.1)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_58px_rgb(17_32_59_/_0.14)] dark:border-white/10 dark:bg-[#10223d]">
      <ColorSwatchBlock color={color} size="hero" showLabel />
      <div className="flex min-w-0 items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="break-words text-3xl font-black leading-tight text-[var(--brand-navy)] dark:text-[var(--app-text)]" dir="ltr" lang="ru">
            {color.russian}
          </p>
          <p className="mt-1 text-base font-bold text-[var(--app-text-muted)]" {...uiTextProps(language)}>
            {meaning}
          </p>
        </div>
        <PronounceButton text={color.russian} className="h-11 w-11 border-[var(--brand-cyan)] bg-cyan-50 text-[var(--brand-navy)] hover:bg-cyan-100 dark:bg-cyan-300/15 dark:text-cyan-100" />
      </div>
    </article>
  );
}

function PracticePanel({ title, detail, language, children }: { title: string; detail: string; language: ExplanationLanguage; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white p-4 text-[var(--brand-navy)] shadow-[0_26px_70px_rgb(17_32_59_/_0.13)] dark:border-white/10 dark:bg-[#10223d] dark:text-[var(--app-text)] sm:p-6">
      <div className="mb-5 rounded-[1.35rem] bg-[linear-gradient(135deg,rgb(87_212_232_/_0.16),rgb(183_229_49_/_0.16),rgb(248_251_255_/_0.9))] p-5 text-center dark:bg-[linear-gradient(135deg,rgb(20_184_166_/_0.14),rgb(183_229_49_/_0.1),rgb(8_19_35_/_0.3))]">
        <h2 className="text-2xl font-black leading-tight sm:text-3xl" {...uiTextProps(language)}>
          {title}
        </h2>
        {detail ? (
          <p className="mt-3 text-5xl font-black leading-none tracking-normal text-[var(--brand-navy)] sm:text-6xl dark:text-[var(--app-text)]" dir="ltr" lang="ru">
            {detail}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ColorChoiceGrid({
  target,
  answer,
  language,
  meaning,
  onChoose,
}: {
  target: ColorWord;
  answer: AnswerState | null;
  language: ExplanationLanguage;
  meaning: (color: ColorWord) => string;
  onChoose: (color: ColorWord) => void;
}) {
  const options = useMemo(() => getColorOptions(target), [target]);
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {options.map((color, index) => {
        const selected = answer?.selectedId === color.id;
        const correct = color.id === target.id;
        const optionLabel = language === "ar" ? `الخيار ${index + 1}` : `Option ${index + 1}`;
        return (
          <button
            key={color.id}
            type="button"
            disabled={Boolean(answer)}
            onClick={() => onChoose(color)}
            aria-label={answer ? meaning(color) : optionLabel}
            className={`group min-w-0 rounded-[1.35rem] border p-2.5 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#10223d] ${
              answer && correct
                ? "border-emerald-400 bg-emerald-50"
                : selected && !correct
                  ? "border-red-400 bg-red-50"
                  : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[var(--brand-teal)] dark:border-white/10 dark:bg-white/5"
            }`}
          >
            <ColorSwatchBlock color={color} size="choice" showLabel={Boolean(answer)} />
            <span className="mt-2 block truncate px-1 text-sm font-black text-[var(--brand-navy)] dark:text-[var(--app-text)]" {...uiTextProps(language)}>
              {answer ? meaning(color) : optionLabel}
            </span>
            {answer ? (
              <span className={`mt-1 block px-1 text-xs font-black ${correct ? "text-emerald-700" : selected ? "text-red-700" : "text-slate-500"}`} {...uiTextProps(language)}>
                {correct ? getUiText(language).lesson.correct : selected ? getUiText(language).lesson.notQuite : ""}
              </span>
            ) : null}
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
  const firstWrong = ids.map(getColor).find((color) => answers[color.id] !== color.id) ?? getColor(ids[0]);

  return (
    <section className="rounded-[1.75rem] border border-white bg-white p-4 text-[var(--brand-navy)] shadow-[0_26px_70px_rgb(17_32_59_/_0.13)] dark:border-white/10 dark:bg-[#10223d] dark:text-[var(--app-text)] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-black sm:text-3xl" {...uiTextProps(language)}>{copy.matchTheColor}</h2>
          <p className="mt-1 text-sm font-semibold text-[var(--app-text-muted)]" {...uiTextProps(language)}>
            {selectedRussianId ? copy.chooseSwatch : copy.chooseRussianFirst}
          </p>
        </div>
        <span className="rounded-full bg-[var(--app-primary-soft)] px-3 py-1.5 text-xs font-black text-[var(--brand-teal)]" {...uiTextProps(language)}>
          {Object.keys(answers).length}/{ids.length}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="grid content-start gap-2">
          {ids.map(getColor).map((color) => {
            const assigned = answers[color.id] ? getColor(answers[color.id]) : null;
            const isWrong = submitted && assigned?.id !== color.id;
            const isRight = submitted && assigned?.id === color.id;
            return (
              <button
                key={color.id}
                type="button"
                disabled={submitted}
                onClick={() => onSelectRussian(selectedRussianId === color.id ? "" : color.id)}
                className={`min-w-0 rounded-[1.15rem] border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] ${
                  selectedRussianId === color.id
                    ? "border-[var(--brand-teal)] bg-cyan-50 shadow-sm dark:bg-cyan-300/15"
                    : isRight
                      ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-300/15"
                      : isWrong
                        ? "border-red-300 bg-red-50 dark:bg-red-300/15"
                        : "border-slate-200 bg-slate-50 hover:border-[var(--brand-teal)] dark:border-white/10 dark:bg-white/5"
                }`}
              >
                <span className="block truncate text-xl font-black" dir="ltr" lang="ru">{color.russian}</span>
                <span className="mt-1 block truncate text-xs font-bold text-[var(--app-text-muted)]" {...uiTextProps(language)}>
                  {assigned ? `${copy.pairedWith} ${meaning(assigned)}` : copy.notPaired}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid content-start gap-2">
          {optionColors.map((color) => {
            const usedBy = Object.entries(answers).find(([, colorId]) => colorId === color.id)?.[0];
            return (
              <button
                key={color.id}
                type="button"
                disabled={submitted || !selectedRussianId}
                onClick={() => onSelectColor(color.id)}
                className="flex min-w-0 items-center gap-3 rounded-[1.15rem] border border-slate-200 bg-white p-2.5 text-left shadow-sm transition hover:border-[var(--brand-teal)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5"
                aria-label={meaning(color)}
              >
                <ColorSwatchBlock color={color} size="small" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black text-[var(--brand-navy)] dark:text-[var(--app-text)]" {...uiTextProps(language)}>
                    {meaning(color)}
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-bold text-[var(--app-text-muted)]" {...uiTextProps(language)}>
                    {usedBy ? copy.selected : copy.available}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {submitted && showFeedback ? <Feedback correct={allCorrect} color={firstWrong} language={language} meaning={meaning} onContinue={onContinue} /> : null}
      {!submitted ? (
        <button type="button" disabled={!complete} onClick={onSubmit} className="mt-5 w-full rounded-full bg-[var(--brand-cyan)] px-5 py-4 font-black text-[var(--brand-navy)] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500" {...uiTextProps(language)}>
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
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="rounded-[1.75rem] border border-white bg-white p-4 text-[var(--brand-navy)] shadow-[0_26px_70px_rgb(17_32_59_/_0.13)] dark:border-white/10 dark:bg-[#10223d] dark:text-[var(--app-text)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl" {...uiTextProps(language)}>{copy.typeColorInRussian}</h2>
            <p className="mt-1 text-sm font-semibold text-[var(--app-text-muted)]" {...uiTextProps(language)}>{copy.typeHint}</p>
          </div>
          <PronounceButton text={color.russian} ariaLabel={copy.playPronunciation} title={copy.playPronunciation} className="h-12 w-12 border-[var(--brand-cyan)] bg-cyan-50 text-[var(--brand-navy)] hover:bg-cyan-100 dark:bg-cyan-300/15 dark:text-cyan-100" />
        </div>
        <div className="mt-5 grid gap-4 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:p-4">
          <ColorSwatchBlock color={color} size="type" showLabel />
          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--app-text-muted)]" {...uiTextProps(language)}>
              {copy.meaning}
            </p>
            <p className="mt-1 text-2xl font-black" {...uiTextProps(language)}>
              {meaning(color)}
            </p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="mt-5">
          <label htmlFor="colors-type-answer" className="block text-sm font-black text-[var(--app-text-muted)]" {...uiTextProps(language)}>
            {copy.typeColorInRussian}
          </label>
          <input
            ref={inputRef}
            id="colors-type-answer"
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
            disabled={Boolean(result)}
            lang="ru"
            dir="ltr"
            spellCheck={false}
            autoComplete="off"
            className="mt-3 w-full rounded-[1.15rem] border border-slate-200 bg-white px-4 py-4 text-3xl font-black tracking-normal text-[var(--brand-navy)] outline-none transition focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-cyan-200 disabled:opacity-75 dark:border-white/10 dark:bg-[#081323] dark:text-[var(--app-text)] sm:text-4xl"
          />
          {result ? <Feedback correct={result.isCorrect} color={color} language={language} meaning={meaning} onContinue={onContinue} /> : null}
          {!result ? (
            <button type="submit" className="mt-5 w-full rounded-full bg-[var(--brand-cyan)] px-5 py-4 font-black text-[var(--brand-navy)] transition hover:bg-cyan-200" {...uiTextProps(language)}>
              {copy.check}
            </button>
          ) : null}
        </form>
      </div>
      <RussianKeyboard onKey={(key) => onAnswerChange(`${answer}${key}`)} onBackspace={() => onAnswerChange(answer.slice(0, -1))} />
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
    <section className="rounded-[1.75rem] border border-white bg-white p-4 text-[var(--brand-navy)] shadow-[0_26px_70px_rgb(17_32_59_/_0.13)] dark:border-white/10 dark:bg-[#10223d] dark:text-[var(--app-text)] sm:p-6">
      <div className="mb-5 flex flex-col gap-3 rounded-[1.35rem] bg-[linear-gradient(135deg,rgb(183_229_49_/_0.22),rgb(87_212_232_/_0.14),rgb(248_251_255_/_0.92))] p-4 dark:bg-[linear-gradient(135deg,rgb(183_229_49_/_0.12),rgb(87_212_232_/_0.1),rgb(8_19_35_/_0.35))] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-[var(--brand-teal)]" {...uiTextProps(language)}>
            {copy.finalChallenge}
          </p>
          <h2 className="mt-1 text-2xl font-black" {...uiTextProps(language)}>
            {copy.question} {index + 1}/{total}
          </h2>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/70 sm:w-56 dark:bg-white/10">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand-teal),var(--brand-cyan),var(--brand-lime))]" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
      </div>

      {question.type === "choose" ? (
        <PracticePanel title={copy.tapCorrectColor} detail={targetColor.russian} language={language}>
          {answer ? <Feedback correct={answer.isCorrect} color={targetColor} language={language} meaning={meaning} onContinue={onContinue} /> : null}
          <ColorChoiceGrid target={targetColor} answer={answer} language={language} meaning={meaning} onChoose={onChoose} />
        </PracticePanel>
      ) : null}

      {question.type === "listen" ? (
        <PracticePanel title={copy.listenAndChooseColor} detail="" language={language}>
          <div className="mb-5 flex justify-center">
            <PronounceButton text={targetColor.russian} className="h-20 w-20 border-[var(--brand-cyan)] bg-cyan-50 text-[var(--brand-navy)] hover:bg-cyan-100 dark:bg-cyan-300/15 dark:text-cyan-100" />
          </div>
          {answer ? <Feedback correct={answer.isCorrect} color={targetColor} language={language} meaning={meaning} onContinue={onContinue} /> : null}
          <ColorChoiceGrid target={targetColor} answer={answer} language={language} meaning={meaning} onChoose={onChoose} />
        </PracticePanel>
      ) : null}

      {question.type === "type" ? (
        <form onSubmit={onTypeSubmit} className="mt-2">
          <h3 className="text-2xl font-black" {...uiTextProps(language)}>{copy.typeColorInRussian}</h3>
          <div className="mt-4 grid gap-4 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:p-4">
            <ColorSwatchBlock color={targetColor} size="type" showLabel />
            <div className="flex min-w-0 flex-col justify-center">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--app-text-muted)]" {...uiTextProps(language)}>{copy.meaning}</p>
              <p className="mt-1 text-2xl font-black" {...uiTextProps(language)}>{meaning(targetColor)}</p>
            </div>
          </div>
          <input
            value={typedAnswer}
            onChange={(event) => onTypedAnswerChange(event.target.value)}
            disabled={Boolean(answer)}
            lang="ru"
            dir="ltr"
            spellCheck={false}
            autoComplete="off"
            className="mt-4 w-full rounded-[1.15rem] border border-slate-200 bg-white px-4 py-4 text-3xl font-black tracking-normal text-[var(--brand-navy)] outline-none transition focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-cyan-200 disabled:opacity-75 dark:border-white/10 dark:bg-[#081323] dark:text-[var(--app-text)] sm:text-4xl"
          />
          {!answer ? (
            <button type="submit" className="mt-4 w-full rounded-full bg-[var(--brand-cyan)] px-5 py-4 font-black text-[var(--brand-navy)] transition hover:bg-cyan-200" {...uiTextProps(language)}>
              {copy.check}
            </button>
          ) : null}
        </form>
      ) : null}

      {question.type === "match" ? (
        <MatchPanel
          copy={copy}
          language={language}
          ids={finalMatchIds}
          optionColors={finalMatchOptions}
          answers={matchAnswers}
          selectedRussianId={selectedRussianId}
          submitted={Boolean(answer)}
          meaning={meaning}
          onSelectRussian={onMatchRussian}
          onSelectColor={onMatchColor}
          onSubmit={onMatchSubmit}
          onContinue={() => {}}
          showFeedback={false}
        />
      ) : null}

      {answer ? <Feedback correct={answer.isCorrect} color={targetColor} language={language} meaning={meaning} onContinue={onContinue} /> : null}
    </section>
  );
}

function RussianKeyboard({ onKey, onBackspace }: { onKey: (key: string) => void; onBackspace: () => void }) {
  return (
    <aside className="rounded-[1.5rem] border border-white bg-white p-4 shadow-[0_18px_48px_rgb(17_32_59_/_0.08)] dark:border-white/10 dark:bg-white/8">
      <p className="mb-3 text-sm font-black text-[var(--brand-navy)] dark:text-[var(--app-text)]">Русская клавиатура</p>
      <div className="grid gap-2">
        {russianKeyboardRows.map((row) => (
          <div key={row.join("")} className="flex justify-center gap-1.5">
            {row.map((key) => (
              <button key={key} type="button" onClick={() => onKey(key)} className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 text-lg font-black text-[var(--brand-navy)] transition hover:border-[var(--brand-teal)] hover:bg-cyan-50 dark:border-white/10 dark:bg-[#081323] dark:text-[var(--app-text)]" dir="ltr" lang="ru">
                {key}
              </button>
            ))}
          </div>
        ))}
        <div className="grid grid-cols-[1fr_1fr] gap-2">
          <button type="button" onClick={onBackspace} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-black text-[var(--brand-navy)] transition hover:border-red-300 dark:border-white/10 dark:bg-[#081323] dark:text-[var(--app-text)]">
            Back
          </button>
          <button type="button" onClick={() => onKey("ё")} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-lg font-black text-[var(--brand-navy)] transition hover:border-[var(--brand-teal)] dark:border-white/10 dark:bg-[#081323] dark:text-[var(--app-text)]" dir="ltr" lang="ru">
            ё
          </button>
        </div>
      </div>
    </aside>
  );
}

function Feedback({
  correct,
  color,
  language,
  meaning,
  onContinue,
}: {
  correct: boolean;
  color: ColorWord;
  language: ExplanationLanguage;
  meaning: (color: ColorWord) => string;
  onContinue: () => void;
}) {
  const text = getUiText(language);
  const copy = colorCopy(language);

  return (
    <div className={`mb-4 mt-4 rounded-[1.15rem] border p-4 ${correct ? "border-emerald-300 bg-emerald-50 text-emerald-950 dark:bg-emerald-300/15 dark:text-emerald-100" : "border-red-300 bg-red-50 text-red-950 dark:bg-red-300/15 dark:text-red-100"}`} role="status">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-black" {...uiTextProps(language)}>{correct ? text.lesson.correct : text.lesson.notQuite}</p>
          {!correct ? (
            <p className="mt-1 text-sm font-bold" {...uiTextProps(language)}>
              {copy.correctColor}: <span className="font-black" dir="ltr" lang="ru">{color.russian}</span> = {meaning(color)}
            </p>
          ) : (
            <p className="mt-1 text-sm font-bold">
              <span dir="ltr" lang="ru">{color.russian}</span> = <span {...uiTextProps(language)}>{meaning(color)}</span>
            </p>
          )}
        </div>
        <button type="button" onClick={onContinue} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-navy)] px-5 py-2.5 font-black text-[#f8fbff] transition hover:bg-[var(--brand-teal)] dark:bg-[var(--brand-lime)] dark:text-[var(--brand-navy)]" {...uiTextProps(language)}>
          {text.lesson.continue}
        </button>
      </div>
    </div>
  );
}

function ColorSwatchBlock({
  color,
  size = "choice",
  showLabel = false,
}: {
  color: ColorWord;
  size?: "small" | "choice" | "hero" | "type";
  showLabel?: boolean;
}) {
  const sizeClass = {
    small: "h-16 w-20",
    choice: "h-28 w-full",
    hero: "h-40 w-full",
    type: "h-36 w-full",
  }[size];
  const needsBorder = color.id === "white" || color.id === "yellow";

  return (
    <div
      className={`${sizeClass} relative min-w-0 overflow-hidden rounded-[1.15rem] ${needsBorder ? "border border-slate-300" : "border border-white/40"} shadow-inner`}
      style={{
        background: `linear-gradient(135deg, ${color.hex}, ${color.ring})`,
        boxShadow: `inset 0 0 0 2px ${color.ring}, 0 14px 32px rgb(17 32 59 / 0.1)`,
      }}
      aria-label={color.english}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgb(255_255_255_/_0.26),transparent_42%,rgb(17_32_59_/_0.12))]" />
      {showLabel ? (
        <div className="absolute inset-x-3 bottom-3 rounded-full bg-white/72 px-3 py-1.5 text-center text-sm font-black text-[var(--brand-navy)] backdrop-blur">
          <span dir="ltr" lang="ru">{color.russian}</span>
        </div>
      ) : null}
    </div>
  );
}

function StageStepper({
  stage,
  copy,
  onSelect,
}: {
  stage: ColorStage;
  copy: ReturnType<typeof colorCopy>;
  onSelect: (stage: ColorStage) => void;
}) {
  const currentIndex = stageOrder.indexOf(stage);
  return (
    <ol className="flex max-w-full gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-end" aria-label={copy.stages}>
      {stageOrder.map((step, index) => {
        const isCurrent = index === currentIndex;
        const isPast = index < currentIndex;
        return (
          <li key={step} className="shrink-0">
            <button
              type="button"
              disabled={!isPast && !isCurrent}
              onClick={() => onSelect(step)}
              aria-current={isCurrent ? "step" : undefined}
              className={`rounded-full border px-3 py-2 text-xs font-black transition ${
                isCurrent
                  ? "border-[var(--brand-lime)] bg-[var(--brand-navy)] text-[#f8fbff] shadow-sm dark:bg-[var(--brand-lime)] dark:text-[var(--brand-navy)]"
                  : isPast
                    ? "border-[var(--brand-cyan)] bg-cyan-50 text-[var(--brand-navy)] hover:border-[var(--brand-teal)] dark:bg-cyan-300/15 dark:text-cyan-100"
                    : "border-slate-200 bg-white/70 text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-500"
              }`}
            >
              {getStageLabel(step, copy)}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function ResultPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-slate-200 bg-slate-50 p-4 text-center dark:border-white/10 dark:bg-white/5">
      <p className="text-sm font-bold text-[var(--app-text-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-black text-[var(--brand-teal)]">{value}</p>
    </div>
  );
}

function getColor(id: string) {
  const color = colors.find((candidate) => candidate.id === id);
  if (!color) throw new Error(`Unknown color: ${id}`);
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

function getStageProgress(stage: ColorStage, chooseIndex: number, listenIndex: number, matchedCount: number, typeIndex: number, finalIndex: number, finalTotal: number) {
  const stageBase: Record<ColorStage, number> = {
    learn: 8,
    choose: 22 + (chooseIndex / chooseQuestionIds.length) * 16,
    listen: 40 + (listenIndex / listenQuestionIds.length) * 14,
    match: 56 + (matchedCount / matchIds.length) * 14,
    type: 72 + (typeIndex / typeQuestionIds.length) * 12,
    final: 86 + (finalIndex / Math.max(1, finalTotal)) * 14,
    complete: 100,
  };
  return Math.min(100, stageBase[stage]);
}

function getFinalPrompt(question: FinalQuestion, copy: ReturnType<typeof colorCopy>) {
  if (question.type === "choose") return copy.tapCorrectColor;
  if (question.type === "listen") return copy.listenAndChooseColor;
  if (question.type === "match") return copy.matchTheColor;
  return copy.typeColorInRussian;
}

function getStageLabel(stage: ColorStage, copy: ReturnType<typeof colorCopy>) {
  const labels: Record<ColorStage, string> = {
    learn: copy.learn,
    choose: copy.choose,
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
  const ar = language === "ar";
  return {
    russianTopic: ar ? "ألوان بالروسية" : "Russian colors",
    learn: ar ? "تعلّم" : "Learn",
    choose: ar ? "اختيار" : "Choose",
    listen: ar ? "استماع" : "Listen",
    match: ar ? "مطابقة" : "Match",
    type: ar ? "كتابة" : "Type",
    final: ar ? "التحدي" : "Final",
    complete: text.lesson.lessonComplete,
    stages: ar ? "مراحل الدرس" : "Lesson stages",
    learnColors: ar ? "تعلّم الألوان الأساسية" : "Learn the core colors",
    learnHint: ar ? "انظر إلى اللون، اقرأ الكلمة الروسية، ثم استمع للنطق." : "Study the swatch, read the Russian word, then listen to the pronunciation.",
    tapCorrectColor: ar ? "اضغط على اللون الصحيح" : "Tap the correct color",
    listenAndChooseColor: ar ? "استمع واختر اللون" : "Listen and choose the color",
    matchTheColor: ar ? "طابق الكلمة الروسية مع اللون" : "Match each Russian word to its color",
    typeColorInRussian: ar ? "اكتب اللون بالروسية" : "Type the color in Russian",
    typeHint: ar ? "اكتب الكلمة الروسية. يمكنك استخدام е بدل ё وسيتم قبولها." : "Type the Russian word. Using е instead of ё is accepted.",
    meaning: ar ? "المعنى" : "Meaning",
    correctColor: ar ? "الإجابة الصحيحة" : "Correct color",
    practiceWriting: ar ? "تدريب الكتابة" : "Practice writing",
    finalChallenge: ar ? "التحدي النهائي" : "Final challenge",
    question: ar ? "السؤال" : "Question",
    playPronunciation: text.lesson.playPronunciation,
    startPractice: text.lesson.startPractice,
    check: ar ? "تحقق" : "Check",
    chooseRussianFirst: ar ? "اختر كلمة روسية من اليسار أولاً." : "Choose a Russian word on the left first.",
    chooseSwatch: ar ? "اختر اللون المطابق من اليمين." : "Choose the matching color on the right.",
    pairedWith: ar ? "مطابق مع" : "Paired with",
    notPaired: ar ? "لم تتم المطابقة بعد" : "Not paired yet",
    selected: ar ? "تم اختياره" : "Selected",
    available: ar ? "متاح" : "Available",
    retryMissed: ar ? "أعد الأسئلة الخاطئة" : "Retry missed questions",
    backToBasics: ar ? "العودة إلى الأساسيات" : "Back to Basics",
    retry: ar ? "إعادة المحاولة" : "Retry",
    completeMessage: ar ? "أنهيت درس الألوان. راجع النتيجة أو تابع التدريب." : "You finished the Colors lesson. Review your score or keep practicing.",
  };
}
