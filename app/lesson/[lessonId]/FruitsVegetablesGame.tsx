"use client";

import Link from "next/link";
import { type FormEvent, type ReactNode, type RefObject, useMemo, useRef, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useExplanationLanguage } from "@/components/LanguageSelector";
import { normalizeRussianText, PronounceButton } from "@/components/PronounceButton";
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

type ProduceCategory = "fruit" | "vegetable";
type LessonStage = "learn" | "sort" | "match" | "listen" | "type" | "final" | "complete";
type LearnGroupId = "fruits-1" | "fruits-2" | "vegetables-1" | "vegetables-2";
type AnswerState = { selectedId: string; isCorrect: boolean };
type FinalQuestion =
  | { id: string; type: "choose" | "listen" | "type" | "sort"; produceId: string }
  | { id: string; type: "match"; produceId: "match-set" };

type ProduceItem = {
  id: string;
  category: ProduceCategory;
  russian: string;
  english: string;
  arabic: string;
  colors: [string, string, string];
  visual: "round" | "crescent" | "cluster" | "berry" | "wedge" | "long" | "root" | "bulb" | "leafy" | "ear" | "crown";
};

const produceItems: ProduceItem[] = [
  { id: "apple", category: "fruit", russian: "яблоко", arabic: "تفاحة", english: "apple", colors: ["#ef4444", "#fecaca", "#166534"], visual: "round" },
  { id: "banana", category: "fruit", russian: "банан", arabic: "موز", english: "banana", colors: ["#facc15", "#fef08a", "#854d0e"], visual: "crescent" },
  { id: "orange", category: "fruit", russian: "апельсин", arabic: "برتقال", english: "orange", colors: ["#fb923c", "#fed7aa", "#166534"], visual: "round" },
  { id: "grapes", category: "fruit", russian: "виноград", arabic: "عنب", english: "grapes", colors: ["#8b5cf6", "#ddd6fe", "#166534"], visual: "cluster" },
  { id: "strawberry", category: "fruit", russian: "клубника", arabic: "فراولة", english: "strawberry", colors: ["#e11d48", "#fecdd3", "#15803d"], visual: "berry" },
  { id: "pear", category: "fruit", russian: "груша", arabic: "كمثرى / إجاص", english: "pear", colors: ["#84cc16", "#d9f99d", "#3f6212"], visual: "round" },
  { id: "lemon", category: "fruit", russian: "лимон", arabic: "ليمون", english: "lemon", colors: ["#fde047", "#fef9c3", "#4d7c0f"], visual: "wedge" },
  { id: "watermelon", category: "fruit", russian: "арбуз", arabic: "بطيخ", english: "watermelon", colors: ["#22c55e", "#fb7185", "#14532d"], visual: "wedge" },
  { id: "peach", category: "fruit", russian: "персик", arabic: "خوخ", english: "peach", colors: ["#fb7185", "#fed7aa", "#7c2d12"], visual: "round" },
  { id: "cherry", category: "fruit", russian: "вишня", arabic: "كرز", english: "cherry", colors: ["#dc2626", "#fecaca", "#166534"], visual: "cluster" },
  { id: "pineapple", category: "fruit", russian: "ананас", arabic: "أناناس", english: "pineapple", colors: ["#f59e0b", "#fde68a", "#15803d"], visual: "crown" },
  { id: "mango", category: "fruit", russian: "манго", arabic: "مانجو", english: "mango", colors: ["#f97316", "#fde68a", "#16a34a"], visual: "round" },
  { id: "tomato", category: "vegetable", russian: "помидор", arabic: "بندورة", english: "tomato", colors: ["#ef4444", "#fecaca", "#15803d"], visual: "round" },
  { id: "cucumber", category: "vegetable", russian: "огурец", arabic: "خيار", english: "cucumber", colors: ["#16a34a", "#bbf7d0", "#14532d"], visual: "long" },
  { id: "potato", category: "vegetable", russian: "картофель", arabic: "بطاطا", english: "potato", colors: ["#a16207", "#fde68a", "#713f12"], visual: "round" },
  { id: "carrot", category: "vegetable", russian: "морковь", arabic: "جزر", english: "carrot", colors: ["#f97316", "#fed7aa", "#15803d"], visual: "root" },
  { id: "onion", category: "vegetable", russian: "лук", arabic: "بصل", english: "onion", colors: ["#f8fafc", "#e9d5ff", "#64748b"], visual: "bulb" },
  { id: "cabbage", category: "vegetable", russian: "капуста", arabic: "ملفوف", english: "cabbage", colors: ["#65a30d", "#d9f99d", "#3f6212"], visual: "leafy" },
  { id: "garlic", category: "vegetable", russian: "чеснок", arabic: "ثوم", english: "garlic", colors: ["#f8fafc", "#e2e8f0", "#64748b"], visual: "bulb" },
  { id: "pepper", category: "vegetable", russian: "перец", arabic: "فليفلة / فلفل", english: "pepper", colors: ["#22c55e", "#bbf7d0", "#166534"], visual: "long" },
  { id: "eggplant", category: "vegetable", russian: "баклажан", arabic: "باذنجان", english: "eggplant", colors: ["#7c3aed", "#ddd6fe", "#166534"], visual: "long" },
  { id: "lettuce", category: "vegetable", russian: "салат", arabic: "خس / سلطة", english: "lettuce / salad", colors: ["#84cc16", "#dcfce7", "#166534"], visual: "leafy" },
  { id: "peas", category: "vegetable", russian: "горох", arabic: "بازلاء", english: "peas", colors: ["#16a34a", "#bbf7d0", "#14532d"], visual: "cluster" },
  { id: "corn", category: "vegetable", russian: "кукуруза", arabic: "ذرة", english: "corn", colors: ["#eab308", "#fef08a", "#15803d"], visual: "ear" },
];

const stageOrder: LessonStage[] = ["learn", "sort", "match", "listen", "type", "final"];
const learnGroups: Array<{ id: LearnGroupId; itemIds: string[] }> = [
  { id: "fruits-1", itemIds: ["apple", "banana", "orange", "grapes", "strawberry", "pear"] },
  { id: "fruits-2", itemIds: ["lemon", "watermelon", "peach", "cherry", "pineapple", "mango"] },
  { id: "vegetables-1", itemIds: ["tomato", "cucumber", "potato", "carrot", "onion", "cabbage"] },
  { id: "vegetables-2", itemIds: ["garlic", "pepper", "eggplant", "lettuce", "peas", "corn"] },
];
const sortIds = ["apple", "tomato", "banana", "cucumber", "watermelon", "potato", "pineapple", "carrot", "grapes", "cabbage", "lemon", "corn"];
const matchIds = ["apple", "banana", "orange", "tomato", "cucumber", "carrot", "eggplant", "corn"];
const listenIds = ["grapes", "strawberry", "pear", "onion", "garlic", "pepper"];
const typeIds = ["яблоко", "банан", "лимон", "морковь", "лук", "салат"].map((russian) => getProduceByRussian(russian).id);
const finalMatchIds = ["mango", "cherry", "cabbage", "peas"];
const defaultFinalQuestions: FinalQuestion[] = [
  { id: "final-choose-apple", type: "choose", produceId: "apple" },
  { id: "final-sort-cucumber", type: "sort", produceId: "cucumber" },
  { id: "final-listen-banana", type: "listen", produceId: "banana" },
  { id: "final-type-lemon", type: "type", produceId: "lemon" },
  { id: "final-match-set", type: "match", produceId: "match-set" },
  { id: "final-choose-eggplant", type: "choose", produceId: "eggplant" },
  { id: "final-sort-watermelon", type: "sort", produceId: "watermelon" },
  { id: "final-listen-garlic", type: "listen", produceId: "garlic" },
  { id: "final-type-carrot", type: "type", produceId: "carrot" },
  { id: "final-choose-pineapple", type: "choose", produceId: "pineapple" },
  { id: "final-listen-grapes", type: "listen", produceId: "grapes" },
  { id: "final-type-salad", type: "type", produceId: "lettuce" },
];

const russianKeyboardRows = [
  ["й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ"],
  ["ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э"],
  ["я", "ч", "с", "м", "и", "т", "ь", "б", "ю"],
];

export function FruitsVegetablesGame({ lesson }: { lesson: Lesson }) {
  const { language } = useExplanationLanguage();
  const text = getUiText(language);
  const copy = produceCopy(language);
  const progressState = useProgress();
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<LessonStage>("learn");
  const [learnGroupId, setLearnGroupId] = useState<LearnGroupId>("fruits-1");
  const [sortIndex, setSortIndex] = useState(0);
  const [sortAnswer, setSortAnswer] = useState<AnswerState | null>(null);
  const [sortCorrectCount, setSortCorrectCount] = useState(0);
  const [selectedRussianId, setSelectedRussianId] = useState("");
  const [matchAnswers, setMatchAnswers] = useState<Record<string, string>>({});
  const [matchSubmitted, setMatchSubmitted] = useState(false);
  const [listenIndex, setListenIndex] = useState(0);
  const [listenAnswer, setListenAnswer] = useState<AnswerState | null>(null);
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
  const currentSortItem = getProduce(sortIds[sortIndex]);
  const currentListenItem = getProduce(listenIds[listenIndex]);
  const currentTypeItem = getProduce(typeIds[typeIndex]);
  const currentFinal = finalQuestions[finalIndex] ?? finalQuestions[0];
  const currentFinalItem = currentFinal.type === "match" ? getProduce(finalMatchIds[0]) : getProduce(currentFinal.produceId);
  const matchOptions = useMemo(() => getStableDerangedItems(matchIds.map(getProduce), "produce-match"), []);
  const finalMatchOptions = useMemo(() => getStableDerangedItems(finalMatchIds.map(getProduce), "produce-final-match"), []);
  const progress = getStageProgress(stage, sortIndex, Object.keys(matchAnswers).length, listenIndex, typeIndex, finalIndex, finalQuestions.length);
  const nextAction = useMemo(
    () => ({ href: getNextAvailablePath(activeProgress), label: getNextAvailableLabel(activeProgress) }),
    [activeProgress],
  );
  const xpEarned = Math.round(lesson.xpReward * (finalScore / Math.max(1, finalQuestions.length)));

  function meaning(item: ProduceItem) {
    return language === "ar" ? item.arabic : item.english;
  }

  function categoryLabel(category: ProduceCategory) {
    return category === "fruit" ? copy.fruit : copy.vegetable;
  }

  function changeStage(nextStage: LessonStage) {
    setStage(nextStage);
    resetTransientState();
  }

  function resetTransientState() {
    setSortAnswer(null);
    setSelectedRussianId("");
    setMatchSubmitted(false);
    setListenAnswer(null);
    setTypedAnswer("");
    setTypeAnswer(null);
    setFinalAnswer(null);
    setFinalTypedAnswer("");
    setFinalSelectedRussianId("");
  }

  function recordMistake(exerciseId: string, questionText: string, userAnswer: string, correctItem: ProduceItem) {
    addMistake({
      lessonId: lesson.id,
      exerciseId,
      questionText,
      userAnswer: userAnswer || text.lesson.noAnswer,
      correctAnswer: correctItem.russian,
      explanation: `${correctItem.russian} = ${meaning(correctItem)}`,
      language,
    });
  }

  function answerSort(category: ProduceCategory) {
    if (sortAnswer) return;
    const isCorrect = category === currentSortItem.category;
    setSortAnswer({ selectedId: category, isCorrect });
    if (isCorrect) {
      setSortCorrectCount((count) => count + 1);
    } else {
      recordMistake(`produce-sort-${currentSortItem.id}`, copy.sortPrompt, categoryLabel(category), currentSortItem);
    }
  }

  function continueSort() {
    if (sortIndex >= sortIds.length - 1) {
      changeStage("match");
      return;
    }
    setSortIndex((index) => index + 1);
    setSortAnswer(null);
  }

  function assignMatchAnswer(russianId: string, meaningId: string, final = false) {
    const setAnswers = final ? setFinalMatchAnswers : setMatchAnswers;
    setAnswers((answers) => {
      const nextAnswers = Object.fromEntries(
        Object.entries(answers).filter(([existingRussianId, existingMeaningId]) => existingRussianId !== russianId && existingMeaningId !== meaningId),
      );
      return { ...nextAnswers, [russianId]: meaningId };
    });
  }

  function submitMatch() {
    if (Object.keys(matchAnswers).length !== matchIds.length || matchSubmitted) return;
    setMatchSubmitted(true);
    matchIds.map(getProduce).forEach((item) => {
      if (matchAnswers[item.id] !== item.id) {
        const selected = matchAnswers[item.id] ? getProduce(matchAnswers[item.id]) : null;
        recordMistake(`produce-match-${item.id}`, copy.matchPrompt, selected ? meaning(selected) : text.lesson.noAnswer, item);
      }
    });
  }

  function answerListen(item: ProduceItem) {
    if (listenAnswer) return;
    const isCorrect = item.id === currentListenItem.id;
    setListenAnswer({ selectedId: item.id, isCorrect });
    if (!isCorrect) {
      recordMistake(`produce-listen-${currentListenItem.id}`, copy.listenPrompt, meaning(item), currentListenItem);
    }
  }

  function continueListen() {
    if (listenIndex >= listenIds.length - 1) {
      changeStage("type");
      window.setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }
    setListenIndex((index) => index + 1);
    setListenAnswer(null);
  }

  function submitType(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (typeAnswer) return;
    const isCorrect = answersMatch(typedAnswer, currentTypeItem.russian);
    setTypeAnswer({ selectedId: typedAnswer, isCorrect });
    if (!isCorrect) {
      recordMistake(`produce-type-${currentTypeItem.id}`, copy.typePrompt, typedAnswer, currentTypeItem);
    }
  }

  function continueType() {
    if (typeIndex >= typeIds.length - 1) {
      changeStage("final");
      return;
    }
    setTypeIndex((index) => index + 1);
    setTypedAnswer("");
    setTypeAnswer(null);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function answerFinal(isCorrect: boolean, userAnswer: string, correctItem = currentFinalItem) {
    if (finalAnswer) return;
    setFinalAnswer({ selectedId: userAnswer, isCorrect });
    if (isCorrect) {
      setFinalScore((score) => score + 1);
      return;
    }
    setMissedFinalIds((ids) => (ids.includes(currentFinal.id) ? ids : [...ids, currentFinal.id]));
    recordMistake(currentFinal.id, getFinalPrompt(currentFinal, copy), formatFinalUserAnswer(userAnswer, language), correctItem);
  }

  function submitFinalType(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (currentFinal.type !== "type") return;
    answerFinal(answersMatch(finalTypedAnswer, currentFinalItem.russian), finalTypedAnswer, currentFinalItem);
  }

  function submitFinalMatch() {
    if (currentFinal.type !== "match" || finalAnswer || Object.keys(finalMatchAnswers).length !== finalMatchIds.length) return;
    const targetItems = finalMatchIds.map(getProduce);
    const wrongItem = targetItems.find((item) => finalMatchAnswers[item.id] !== item.id);
    answerFinal(!wrongItem, copy.matchPrompt, wrongItem ?? targetItems[0]);
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
    setLearnGroupId("fruits-1");
    setSortIndex(0);
    setSortCorrectCount(0);
    setMatchAnswers({});
    setMatchSubmitted(false);
    setListenIndex(0);
    setTypeIndex(0);
    setFinalQuestions(defaultFinalQuestions);
    setFinalIndex(0);
    setFinalScore(0);
    setMissedFinalIds([]);
    setCompletionProgress(null);
    resetTransientState();
  }

  function retryMissed() {
    const missed = defaultFinalQuestions.filter((question) => missedFinalIds.includes(question.id));
    setFinalQuestions(missed.length > 0 ? missed : defaultFinalQuestions);
    setFinalIndex(0);
    setFinalScore(0);
    setMissedFinalIds([]);
    setStage("final");
    resetTransientState();
  }

  function insertKey(key: string, final = false) {
    if (final) {
      setFinalTypedAnswer((answer) => `${answer}${key}`);
      return;
    }
    setTypedAnswer((answer) => `${answer}${key}`);
  }

  if (stage === "complete") {
    const accuracy = Math.round((finalScore / Math.max(1, finalQuestions.length)) * 100);

    return (
      <LessonShell>
        <section className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-5xl items-center px-4 pb-10 sm:px-6">
          <div className="w-full overflow-hidden rounded-[2rem] border border-white bg-white text-[var(--brand-navy)] shadow-[0_28px_90px_rgb(17_32_59_/_0.16)] dark:border-white/10 dark:bg-[#10223d] dark:text-[var(--app-text)]">
            <div className="bg-[linear-gradient(135deg,rgb(20_184_166_/_0.16),rgb(183_229_49_/_0.28),rgb(255_255_255_/_0.9),rgb(251_146_60_/_0.16))] p-6 text-center dark:bg-[linear-gradient(135deg,rgb(20_184_166_/_0.18),rgb(183_229_49_/_0.14),rgb(16_34_61_/_0.9))] sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--brand-teal)]" {...uiTextProps(language)}>
                {copy.result}
              </p>
              <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl" {...uiTextProps(language)}>
                {localizeLessonTitle(lesson.title, language)}
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm font-bold text-[var(--app-text-muted)] sm:text-base" {...uiTextProps(language)}>
                {copy.completeMessage}
              </p>
            </div>
            <div className="p-5 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-4">
                <ResultPill label={text.lesson.score} value={`${finalScore}/${finalQuestions.length}`} />
                <ResultPill label={copy.accuracy} value={`${accuracy}%`} />
                <ResultPill label={copy.correctWords} value={`${finalScore}`} />
                <ResultPill label="XP" value={`${xpEarned} XP`} />
              </div>
              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Link href="/writing" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-cyan)] px-5 py-3 text-center font-black text-[var(--brand-navy)] shadow-sm transition hover:bg-cyan-200" {...uiTextProps(language)}>
                  {copy.practiceWriting}
                </Link>
                <Link href="/worlds" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--card-border)] bg-white px-5 py-3 text-center font-black text-[var(--brand-navy)] shadow-sm transition hover:border-[var(--brand-teal)] hover:bg-[var(--app-primary-soft)] dark:bg-white/10 dark:text-[var(--app-text)]" {...uiTextProps(language)}>
                  {copy.backToBasics}
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
          <LearnStage
            groupId={learnGroupId}
            language={language}
            copy={copy}
            meaning={meaning}
            categoryLabel={categoryLabel}
            onSelectGroup={setLearnGroupId}
            onContinue={() => changeStage("sort")}
          />
        ) : null}

        {stage === "sort" ? (
          <PracticePanel
            title={copy.sortPrompt}
            detail={`${sortIndex + 1}/${sortIds.length}`}
            language={language}
            aside={<ResultPill label={text.lesson.correct} value={`${sortCorrectCount}/${sortIds.length}`} />}
          >
            <SortPanel
              item={currentSortItem}
              answer={sortAnswer}
              language={language}
              copy={copy}
              meaning={meaning}
              categoryLabel={categoryLabel}
              onAnswer={answerSort}
              onContinue={continueSort}
            />
          </PracticePanel>
        ) : null}

        {stage === "match" ? (
          <PracticePanel title={copy.matchPrompt} detail={copy.matchHint} language={language}>
            <MatchPanel
              copy={copy}
              language={language}
              ids={matchIds}
              optionItems={matchOptions}
              answers={matchAnswers}
              selectedRussianId={selectedRussianId}
              submitted={matchSubmitted}
              meaning={meaning}
              onSelectRussian={setSelectedRussianId}
              onSelectMeaning={(id) => {
                if (!selectedRussianId) return;
                assignMatchAnswer(selectedRussianId, id);
                setSelectedRussianId("");
              }}
              onSubmit={submitMatch}
              onContinue={() => changeStage("listen")}
            />
          </PracticePanel>
        ) : null}

        {stage === "listen" ? (
          <PracticePanel title={copy.listenPrompt} detail={`${listenIndex + 1}/${listenIds.length}`} language={language}>
            <div className="mb-5 flex justify-center">
              <PronounceButton text={currentListenItem.russian} ariaLabel={copy.playPronunciation} title={copy.playPronunciation} className="h-20 w-20 border-[var(--brand-cyan)] bg-cyan-50 text-[var(--brand-navy)] hover:bg-cyan-100 dark:bg-cyan-300/15 dark:text-cyan-100" />
            </div>
            {listenAnswer ? <Feedback correct={listenAnswer.isCorrect} item={currentListenItem} language={language} meaning={meaning} onContinue={continueListen} /> : null}
            <ProduceChoiceGrid target={currentListenItem} options={getChoiceOptions(currentListenItem)} answer={listenAnswer} language={language} meaning={meaning} onChoose={answerListen} />
          </PracticePanel>
        ) : null}

        {stage === "type" ? (
          <PracticePanel title={copy.typePrompt} detail={copy.typeHint} language={language}>
            <TypePanel
              inputRef={inputRef}
              item={currentTypeItem}
              answer={typedAnswer}
              result={typeAnswer}
              language={language}
              copy={copy}
              meaning={meaning}
              onAnswerChange={setTypedAnswer}
              onSubmit={submitType}
              onContinue={continueType}
              onKey={(key) => insertKey(key)}
              onBackspace={() => setTypedAnswer((answer) => answer.slice(0, -1))}
            />
          </PracticePanel>
        ) : null}

        {stage === "final" ? (
          <FinalPanel
            copy={copy}
            language={language}
            question={currentFinal}
            index={finalIndex}
            total={finalQuestions.length}
            targetItem={currentFinalItem}
            answer={finalAnswer}
            typedAnswer={finalTypedAnswer}
            matchAnswers={finalMatchAnswers}
            selectedRussianId={finalSelectedRussianId}
            finalMatchOptions={finalMatchOptions}
            meaning={meaning}
            categoryLabel={categoryLabel}
            onChoose={(item) => answerFinal(item.id === currentFinalItem.id, item.id, currentFinalItem)}
            onSort={(category) => answerFinal(category === currentFinalItem.category, categoryLabel(category), currentFinalItem)}
            onTypedAnswerChange={setFinalTypedAnswer}
            onTypeSubmit={submitFinalType}
            onMatchRussian={setFinalSelectedRussianId}
            onMatchMeaning={(id) => {
              if (!finalSelectedRussianId) return;
              assignMatchAnswer(finalSelectedRussianId, id, true);
              setFinalSelectedRussianId("");
            }}
            onMatchSubmit={submitFinalMatch}
            onContinue={continueFinal}
            onKey={(key) => insertKey(key, true)}
            onBackspace={() => setFinalTypedAnswer((answer) => answer.slice(0, -1))}
          />
        ) : null}
      </section>
    </LessonShell>
  );
}

function LessonShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f7fcff_0%,#eef8fb_46%,#f9fff4_100%)] text-[var(--brand-navy)] dark:bg-[linear-gradient(180deg,#081323_0%,#10223d_54%,#081323_100%)] dark:text-[var(--app-text)]">
      <Navigation />
      {children}
    </main>
  );
}

function LearnStage({
  groupId,
  language,
  copy,
  meaning,
  categoryLabel,
  onSelectGroup,
  onContinue,
}: {
  groupId: LearnGroupId;
  language: ExplanationLanguage;
  copy: ReturnType<typeof produceCopy>;
  meaning: (item: ProduceItem) => string;
  categoryLabel: (category: ProduceCategory) => string;
  onSelectGroup: (id: LearnGroupId) => void;
  onContinue: () => void;
}) {
  const activeGroup = learnGroups.find((group) => group.id === groupId) ?? learnGroups[0];
  const items = activeGroup.itemIds.map(getProduce);

  return (
    <section className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="rounded-[1.5rem] border border-white bg-white p-4 shadow-[0_18px_48px_rgb(17_32_59_/_0.08)] dark:border-white/10 dark:bg-white/8">
        <p className="text-sm font-black text-[var(--brand-teal)]" {...uiTextProps(language)}>{copy.learnHint}</p>
        <div className="mt-4 grid gap-2">
          {learnGroups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => onSelectGroup(group.id)}
              aria-pressed={group.id === groupId}
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${
                group.id === groupId
                  ? "border-[var(--brand-teal)] bg-[var(--app-primary-soft)] text-[var(--brand-navy)] dark:text-cyan-100"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[var(--brand-cyan)] dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              }`}
              {...uiTextProps(language)}
            >
              {getLearnGroupLabel(group.id, copy)}
            </button>
          ))}
        </div>
        <button type="button" onClick={onContinue} className="mt-5 w-full rounded-full bg-[var(--brand-navy)] px-5 py-4 font-black text-white transition hover:bg-[var(--brand-teal)] dark:bg-[var(--brand-lime)] dark:text-[var(--brand-navy)]" {...uiTextProps(language)}>
          {copy.startPractice}
        </button>
      </aside>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <ProduceCard key={item.id} item={item} language={language} meaning={meaning} categoryLabel={categoryLabel} />
        ))}
      </div>
    </section>
  );
}

function ProduceCard({
  item,
  language,
  meaning,
  categoryLabel,
}: {
  item: ProduceItem;
  language: ExplanationLanguage;
  meaning: (item: ProduceItem) => string;
  categoryLabel: (category: ProduceCategory) => string;
}) {
  return (
    <article className="min-w-0 rounded-[1.5rem] border border-white bg-white p-4 shadow-[0_18px_48px_rgb(17_32_59_/_0.08)] dark:border-white/10 dark:bg-[#10223d]">
      <ProduceVisual item={item} size="large" />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-3xl font-black leading-tight text-[var(--brand-navy)] dark:text-[var(--app-text)]" dir="ltr" lang="ru">
            {item.russian}
          </p>
          <p className="mt-1 text-lg font-black text-[var(--app-text-muted)]" {...uiTextProps(language)}>
            {meaning(item)}
          </p>
        </div>
        <PronounceButton text={item.russian} className="h-12 w-12 border-[var(--brand-cyan)] bg-cyan-50 text-[var(--brand-navy)] hover:bg-cyan-100 dark:bg-cyan-300/15 dark:text-cyan-100" />
      </div>
      <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-black ${item.category === "fruit" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}`} {...uiTextProps(language)}>
        {categoryLabel(item.category)}
      </span>
    </article>
  );
}

function PracticePanel({ title, detail, language, children, aside }: { title: string; detail: string; language: ExplanationLanguage; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white p-4 text-[var(--brand-navy)] shadow-[0_26px_70px_rgb(17_32_59_/_0.13)] dark:border-white/10 dark:bg-[#10223d] dark:text-[var(--app-text)] sm:p-6">
      <div className="mb-5 flex flex-col gap-3 rounded-[1.35rem] bg-[linear-gradient(135deg,rgb(87_212_232_/_0.16),rgb(183_229_49_/_0.18),rgb(255_255_255_/_0.9),rgb(251_146_60_/_0.12))] p-4 dark:bg-[linear-gradient(135deg,rgb(87_212_232_/_0.12),rgb(183_229_49_/_0.12),rgb(8_19_35_/_0.4))] sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="break-words text-2xl font-black" {...uiTextProps(language)}>{title}</h2>
          <p className="mt-1 text-sm font-bold text-[var(--app-text-muted)]" {...uiTextProps(language)}>{detail}</p>
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
      {children}
    </section>
  );
}

function SortPanel({
  item,
  answer,
  language,
  copy,
  meaning,
  categoryLabel,
  onAnswer,
  onContinue,
}: {
  item: ProduceItem;
  answer: AnswerState | null;
  language: ExplanationLanguage;
  copy: ReturnType<typeof produceCopy>;
  meaning: (item: ProduceItem) => string;
  categoryLabel: (category: ProduceCategory) => string;
  onAnswer: (category: ProduceCategory) => void;
  onContinue: () => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
        <ProduceVisual item={item} size="hero" />
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-4xl font-black" dir="ltr" lang="ru">{item.russian}</p>
            <p className="mt-1 text-lg font-black text-[var(--app-text-muted)]" {...uiTextProps(language)}>{meaning(item)}</p>
          </div>
          <PronounceButton text={item.russian} className="h-14 w-14 border-[var(--brand-cyan)] bg-cyan-50 text-[var(--brand-navy)]" />
        </div>
      </div>
      <div className="grid content-start gap-3">
        {(["fruit", "vegetable"] as ProduceCategory[]).map((category) => {
          const selected = answer?.selectedId === category;
          const correct = item.category === category;
          return (
            <button
              key={category}
              type="button"
              disabled={Boolean(answer)}
              onClick={() => onAnswer(category)}
              aria-label={`${copy.sortInto} ${categoryLabel(category)}`}
              className={`min-h-20 rounded-[1.25rem] border px-5 py-4 text-left font-black shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] ${
                answer && correct
                  ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                  : selected && !correct
                    ? "border-red-300 bg-red-50 text-red-950"
                    : category === "fruit"
                      ? "border-orange-200 bg-orange-50 text-orange-950 hover:border-orange-300"
                      : "border-green-200 bg-green-50 text-green-950 hover:border-green-300"
              }`}
              {...uiTextProps(language)}
            >
              <span className="block text-xl">{categoryLabel(category)}</span>
              <span className="mt-1 block text-xs font-bold opacity-75">{copy.basket}</span>
            </button>
          );
        })}
        {answer ? <Feedback correct={answer.isCorrect} item={item} language={language} meaning={meaning} onContinue={onContinue} /> : null}
      </div>
    </div>
  );
}

function MatchPanel({
  copy,
  language,
  ids,
  optionItems,
  answers,
  selectedRussianId,
  submitted,
  meaning,
  onSelectRussian,
  onSelectMeaning,
  onSubmit,
  onContinue,
}: {
  copy: ReturnType<typeof produceCopy>;
  language: ExplanationLanguage;
  ids: string[];
  optionItems: ProduceItem[];
  answers: Record<string, string>;
  selectedRussianId: string;
  submitted: boolean;
  meaning: (item: ProduceItem) => string;
  onSelectRussian: (id: string) => void;
  onSelectMeaning: (id: string) => void;
  onSubmit: () => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          {ids.map((id) => {
            const item = getProduce(id);
            const pairedItem = answers[id] ? getProduce(answers[id]) : null;
            const selected = selectedRussianId === id;
            const correct = submitted && answers[id] === id;
            const wrong = submitted && answers[id] !== id;
            return (
              <button
                key={id}
                type="button"
                disabled={submitted}
                onClick={() => onSelectRussian(selected ? "" : id)}
                className={`rounded-2xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] ${
                  correct
                    ? "border-emerald-300 bg-emerald-50"
                    : wrong
                      ? "border-red-300 bg-red-50"
                      : selected
                        ? "border-[var(--brand-teal)] bg-cyan-50"
                        : "border-slate-200 bg-slate-50 hover:border-[var(--brand-cyan)]"
                } dark:border-white/10 dark:bg-white/5`}
              >
                <span className="block text-2xl font-black" dir="ltr" lang="ru">{item.russian}</span>
                <span className="mt-1 block text-xs font-bold text-[var(--app-text-muted)]" {...uiTextProps(language)}>
                  {pairedItem ? `${copy.pairedWith}: ${meaning(pairedItem)}` : copy.chooseMatch}
                </span>
              </button>
            );
          })}
        </div>
        <div className="grid gap-2">
          {optionItems.map((item) => {
            const used = Object.values(answers).includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                disabled={submitted}
                onClick={() => onSelectMeaning(item.id)}
                className={`grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3 rounded-2xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] ${
                  used ? "border-[var(--brand-teal)] bg-[var(--app-primary-soft)]" : "border-slate-200 bg-white hover:border-[var(--brand-cyan)]"
                } dark:border-white/10 dark:bg-white/5`}
              >
                <ProduceVisual item={item} size="small" />
                <span className="min-w-0">
                  <span className="block break-words text-lg font-black" {...uiTextProps(language)}>{meaning(item)}</span>
                  <span className="mt-1 block text-xs font-bold text-[var(--app-text-muted)]" {...uiTextProps(language)}>
                    {used ? copy.selected : copy.available}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {submitted ? (
        <div className="mt-5 rounded-[1.15rem] border border-emerald-300 bg-emerald-50 p-4 text-emerald-950" role="status">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-black" {...uiTextProps(language)}>{copy.matchReviewed}</p>
            <button type="button" onClick={onContinue} className="rounded-full bg-[var(--brand-navy)] px-5 py-3 font-black text-white" {...uiTextProps(language)}>
              {copy.continue}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={Object.keys(answers).length !== ids.length}
          className="mt-5 w-full rounded-full bg-[var(--brand-cyan)] px-5 py-4 font-black text-[var(--brand-navy)] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          {...uiTextProps(language)}
        >
          {copy.check}
        </button>
      )}
    </div>
  );
}

function ProduceChoiceGrid({
  target,
  options,
  answer,
  language,
  meaning,
  onChoose,
}: {
  target: ProduceItem;
  options: ProduceItem[];
  answer: AnswerState | null;
  language: ExplanationLanguage;
  meaning: (item: ProduceItem) => string;
  onChoose: (item: ProduceItem) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {options.map((item) => {
        const isCorrect = item.id === target.id;
        const selected = answer?.selectedId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            disabled={Boolean(answer)}
            onClick={() => onChoose(item)}
            aria-label={meaning(item)}
            className={`rounded-[1.25rem] border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] ${
              answer && isCorrect
                ? "border-emerald-300 bg-emerald-50"
                : selected && !isCorrect
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200 bg-white hover:border-[var(--brand-cyan)] dark:border-white/10 dark:bg-white/5"
            }`}
          >
            <ProduceVisual item={item} size="choice" />
            <span className="mt-3 block break-words text-lg font-black text-[var(--brand-navy)] dark:text-[var(--app-text)]" {...uiTextProps(language)}>{meaning(item)}</span>
          </button>
        );
      })}
    </div>
  );
}

function TypePanel({
  inputRef,
  item,
  answer,
  result,
  language,
  copy,
  meaning,
  onAnswerChange,
  onSubmit,
  onContinue,
  onKey,
  onBackspace,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  item: ProduceItem;
  answer: string;
  result: AnswerState | null;
  language: ExplanationLanguage;
  copy: ReturnType<typeof produceCopy>;
  meaning: (item: ProduceItem) => string;
  onAnswerChange: (value: string) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
  onContinue: () => void;
  onKey: (key: string) => void;
  onBackspace: () => void;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:p-4">
            <ProduceVisual item={item} size="hero" />
            <div className="flex min-w-0 flex-col justify-center">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--app-text-muted)]" {...uiTextProps(language)}>{copy.meaning}</p>
              <p className="mt-1 break-words text-3xl font-black" {...uiTextProps(language)}>{meaning(item)}</p>
            </div>
          </div>
          <label htmlFor="produce-type-answer" className="mt-5 block text-sm font-black text-[var(--app-text-muted)]" {...uiTextProps(language)}>
            {copy.typeRussian}
          </label>
          <input
            ref={inputRef}
            id="produce-type-answer"
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
            disabled={Boolean(result)}
            lang="ru"
            dir="ltr"
            spellCheck={false}
            autoComplete="off"
            className="mt-3 w-full rounded-[1.15rem] border border-slate-200 bg-white px-4 py-4 text-3xl font-black tracking-normal text-[var(--brand-navy)] outline-none transition focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-cyan-200 disabled:opacity-75 dark:border-white/10 dark:bg-[#081323] dark:text-[var(--app-text)] sm:text-4xl"
          />
          {result ? <Feedback correct={result.isCorrect} item={item} language={language} meaning={meaning} onContinue={onContinue} /> : null}
          {!result ? (
            <button type="submit" className="mt-5 w-full rounded-full bg-[var(--brand-cyan)] px-5 py-4 font-black text-[var(--brand-navy)] transition hover:bg-cyan-200" {...uiTextProps(language)}>
              {copy.check}
            </button>
          ) : null}
        </form>
      </div>
      <RussianKeyboard onKey={onKey} onBackspace={onBackspace} />
    </section>
  );
}

function FinalPanel({
  copy,
  language,
  question,
  index,
  total,
  targetItem,
  answer,
  typedAnswer,
  matchAnswers,
  selectedRussianId,
  finalMatchOptions,
  meaning,
  categoryLabel,
  onChoose,
  onSort,
  onTypedAnswerChange,
  onTypeSubmit,
  onMatchRussian,
  onMatchMeaning,
  onMatchSubmit,
  onContinue,
  onKey,
  onBackspace,
}: {
  copy: ReturnType<typeof produceCopy>;
  language: ExplanationLanguage;
  question: FinalQuestion;
  index: number;
  total: number;
  targetItem: ProduceItem;
  answer: AnswerState | null;
  typedAnswer: string;
  matchAnswers: Record<string, string>;
  selectedRussianId: string;
  finalMatchOptions: ProduceItem[];
  meaning: (item: ProduceItem) => string;
  categoryLabel: (category: ProduceCategory) => string;
  onChoose: (item: ProduceItem) => void;
  onSort: (category: ProduceCategory) => void;
  onTypedAnswerChange: (value: string) => void;
  onTypeSubmit: (event?: FormEvent<HTMLFormElement>) => void;
  onMatchRussian: (id: string) => void;
  onMatchMeaning: (id: string) => void;
  onMatchSubmit: () => void;
  onContinue: () => void;
  onKey: (key: string) => void;
  onBackspace: () => void;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white bg-white p-4 text-[var(--brand-navy)] shadow-[0_26px_70px_rgb(17_32_59_/_0.13)] dark:border-white/10 dark:bg-[#10223d] dark:text-[var(--app-text)] sm:p-6">
      <div className="mb-5 flex flex-col gap-3 rounded-[1.35rem] bg-[linear-gradient(135deg,rgb(183_229_49_/_0.22),rgb(87_212_232_/_0.14),rgb(248_251_255_/_0.92))] p-4 dark:bg-[linear-gradient(135deg,rgb(183_229_49_/_0.12),rgb(87_212_232_/_0.1),rgb(8_19_35_/_0.35))] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-[var(--brand-teal)]" {...uiTextProps(language)}>{copy.finalChallenge}</p>
          <h2 className="mt-1 text-2xl font-black" {...uiTextProps(language)}>
            {copy.question} {index + 1}/{total}
          </h2>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/70 sm:w-56 dark:bg-white/10">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand-teal),var(--brand-cyan),var(--brand-lime))]" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
      </div>

      {question.type === "choose" ? (
        <PracticePanel title={copy.choosePrompt} detail={targetItem.russian} language={language}>
          {answer ? <Feedback correct={answer.isCorrect} item={targetItem} language={language} meaning={meaning} onContinue={onContinue} /> : null}
          <ProduceChoiceGrid target={targetItem} options={getChoiceOptions(targetItem)} answer={answer} language={language} meaning={meaning} onChoose={onChoose} />
        </PracticePanel>
      ) : null}

      {question.type === "sort" ? (
        <PracticePanel title={copy.sortPrompt} detail={targetItem.russian} language={language}>
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <ProduceVisual item={targetItem} size="hero" />
              <p className="mt-4 text-4xl font-black" dir="ltr" lang="ru">{targetItem.russian}</p>
              <p className="mt-1 text-lg font-black text-[var(--app-text-muted)]" {...uiTextProps(language)}>{meaning(targetItem)}</p>
            </div>
            <div className="grid content-start gap-3">
              {(["fruit", "vegetable"] as ProduceCategory[]).map((category) => (
                <button key={category} type="button" disabled={Boolean(answer)} onClick={() => onSort(category)} className="min-h-16 rounded-[1.15rem] border border-slate-200 bg-white px-5 py-4 text-left text-lg font-black transition hover:border-[var(--brand-cyan)] dark:border-white/10 dark:bg-white/5" {...uiTextProps(language)}>
                  {categoryLabel(category)}
                </button>
              ))}
            </div>
          </div>
          {answer ? <Feedback correct={answer.isCorrect} item={targetItem} language={language} meaning={meaning} onContinue={onContinue} /> : null}
        </PracticePanel>
      ) : null}

      {question.type === "listen" ? (
        <PracticePanel title={copy.listenPrompt} detail="" language={language}>
          <div className="mb-5 flex justify-center">
            <PronounceButton text={targetItem.russian} ariaLabel={copy.playPronunciation} title={copy.playPronunciation} className="h-20 w-20 border-[var(--brand-cyan)] bg-cyan-50 text-[var(--brand-navy)] hover:bg-cyan-100 dark:bg-cyan-300/15 dark:text-cyan-100" />
          </div>
          {answer ? <Feedback correct={answer.isCorrect} item={targetItem} language={language} meaning={meaning} onContinue={onContinue} /> : null}
          <ProduceChoiceGrid target={targetItem} options={getChoiceOptions(targetItem)} answer={answer} language={language} meaning={meaning} onChoose={onChoose} />
        </PracticePanel>
      ) : null}

      {question.type === "type" ? (
        <PracticePanel title={copy.typePrompt} detail={copy.typeHint} language={language}>
          <TypePanel
            inputRef={{ current: null }}
            item={targetItem}
            answer={typedAnswer}
            result={answer}
            language={language}
            copy={copy}
            meaning={meaning}
            onAnswerChange={onTypedAnswerChange}
            onSubmit={onTypeSubmit}
            onContinue={onContinue}
            onKey={onKey}
            onBackspace={onBackspace}
          />
        </PracticePanel>
      ) : null}

      {question.type === "match" ? (
        <PracticePanel title={copy.matchPrompt} detail={copy.matchHint} language={language}>
          <MatchPanel
            copy={copy}
            language={language}
            ids={finalMatchIds}
            optionItems={finalMatchOptions}
            answers={matchAnswers}
            selectedRussianId={selectedRussianId}
            submitted={Boolean(answer)}
            meaning={meaning}
            onSelectRussian={onMatchRussian}
            onSelectMeaning={onMatchMeaning}
            onSubmit={onMatchSubmit}
            onContinue={onContinue}
          />
        </PracticePanel>
      ) : null}
    </section>
  );
}

function ProduceVisual({ item, size }: { item: ProduceItem; size: "small" | "choice" | "large" | "hero" }) {
  const [primary, secondary, leaf] = item.colors;
  const sizeClass = {
    small: "h-16",
    choice: "h-28",
    large: "h-36",
    hero: "h-44",
  }[size];

  return (
    <div className={`${sizeClass} relative min-w-0 overflow-hidden rounded-[1.15rem] border border-slate-200 bg-[linear-gradient(135deg,rgb(248_251_255),rgb(236_254_255))] shadow-inner dark:border-white/10 dark:bg-white/5`} aria-label={`${item.english} produce illustration`}>
      <svg viewBox="0 0 220 150" className="h-full w-full" role="img" aria-label={item.english}>
        <defs>
          <radialGradient id={`${item.id}-produce`} cx="35%" cy="28%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="48%" stopColor={secondary} />
            <stop offset="100%" stopColor={primary} />
          </radialGradient>
        </defs>
        <rect width="220" height="150" rx="26" fill="transparent" />
        {item.visual === "crescent" ? (
          <>
            <path d="M62 95C92 42 145 28 171 47C125 50 98 76 91 118C77 115 67 107 62 95Z" fill={`url(#${item.id}-produce)`} stroke={primary} strokeWidth="4" />
            <path d="M163 48L178 39" stroke={leaf} strokeWidth="7" strokeLinecap="round" />
          </>
        ) : item.visual === "cluster" ? (
          <>
            {[75, 105, 135, 90, 120, 105].map((cx, index) => (
              <circle key={index} cx={cx} cy={index < 3 ? 62 : index === 3 ? 91 : index === 4 ? 96 : 120} r="21" fill={`url(#${item.id}-produce)`} stroke={primary} strokeWidth="3" />
            ))}
            <path d="M112 39C128 24 142 26 154 36C138 43 126 45 112 39Z" fill={leaf} opacity="0.9" />
            <path d="M109 43L104 27" stroke={leaf} strokeWidth="5" strokeLinecap="round" />
          </>
        ) : item.visual === "berry" ? (
          <>
            <path d="M110 37C147 37 164 65 151 101C140 132 80 132 69 101C56 65 73 37 110 37Z" fill={`url(#${item.id}-produce)`} stroke={primary} strokeWidth="4" />
            <path d="M77 43L143 43L126 25L111 42L95 25Z" fill={leaf} />
            {[94, 116, 134, 84, 108, 129].map((cx, index) => <circle key={index} cx={cx} cy={index < 3 ? 72 : 100} r="3" fill="#fff7ed" opacity="0.8" />)}
          </>
        ) : item.visual === "wedge" ? (
          <>
            <path d="M54 104C78 55 133 31 176 57C154 101 99 126 54 104Z" fill={`url(#${item.id}-produce)`} stroke={leaf} strokeWidth="5" />
            <path d="M72 96C97 66 133 50 164 62" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="5" />
            <circle cx="116" cy="83" r="4" fill="#11203b" opacity="0.35" />
            <circle cx="137" cy="74" r="4" fill="#11203b" opacity="0.35" />
          </>
        ) : item.visual === "long" ? (
          <>
            <path d="M70 108C87 59 125 35 158 41C164 77 133 115 88 124C77 123 70 117 70 108Z" fill={`url(#${item.id}-produce)`} stroke={primary} strokeWidth="4" />
            <path d="M153 43C164 31 178 31 190 40C176 48 164 51 153 43Z" fill={leaf} />
          </>
        ) : item.visual === "root" ? (
          <>
            <path d="M96 44C132 50 142 81 102 128C65 72 68 47 96 44Z" fill={`url(#${item.id}-produce)`} stroke={primary} strokeWidth="4" />
            <path d="M98 45C91 25 77 24 63 33M105 44C111 25 128 23 145 32M101 43C101 25 111 18 123 16" stroke={leaf} strokeWidth="7" strokeLinecap="round" />
          </>
        ) : item.visual === "bulb" ? (
          <>
            <path d="M110 37C142 51 151 88 128 119C112 139 78 126 75 96C72 65 85 45 110 37Z" fill={`url(#${item.id}-produce)`} stroke={primary} strokeWidth="4" />
            <path d="M110 38C106 25 109 16 119 10" stroke={leaf} strokeWidth="6" strokeLinecap="round" />
            <path d="M93 55C82 78 84 101 99 124M117 52C132 77 132 100 119 124" stroke="#64748b" strokeOpacity="0.28" strokeWidth="4" fill="none" />
          </>
        ) : item.visual === "leafy" ? (
          <>
            {[76, 108, 140, 92, 124].map((cx, index) => (
              <ellipse key={index} cx={cx} cy={index < 3 ? 76 : 102} rx="34" ry="25" fill={`url(#${item.id}-produce)`} stroke={primary} strokeWidth="3" transform={`rotate(${index % 2 === 0 ? -18 : 18} ${cx} ${index < 3 ? 76 : 102})`} />
            ))}
            <circle cx="110" cy="92" r="28" fill={secondary} opacity="0.75" />
          </>
        ) : item.visual === "ear" ? (
          <>
            <rect x="83" y="35" width="54" height="92" rx="27" fill={`url(#${item.id}-produce)`} stroke={primary} strokeWidth="4" />
            {[96, 111, 126].map((cx) => [54, 72, 90, 108].map((cy) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" fill="#fff7ad" opacity="0.75" />))}
            <path d="M82 82C58 92 54 112 65 132C78 119 85 104 82 82ZM138 82C162 92 166 112 155 132C142 119 135 104 138 82Z" fill={leaf} opacity="0.9" />
          </>
        ) : item.visual === "crown" ? (
          <>
            <path d="M83 60H137L151 117C129 134 91 134 69 117Z" fill={`url(#${item.id}-produce)`} stroke={primary} strokeWidth="4" />
            <path d="M110 61L84 30M110 61L110 23M110 61L137 30M96 61L70 45M124 61L151 45" stroke={leaf} strokeWidth="8" strokeLinecap="round" />
            <path d="M84 78H137M78 98H143M96 63L83 123M123 63L137 123" stroke="#fff7ad" strokeOpacity="0.45" strokeWidth="4" />
          </>
        ) : (
          <>
            <circle cx="110" cy="82" r="47" fill={`url(#${item.id}-produce)`} stroke={primary} strokeWidth="4" />
            <path d="M111 39C119 23 136 22 151 32C136 43 122 47 111 39Z" fill={leaf} opacity="0.9" />
            <path d="M108 40L103 25" stroke={leaf} strokeWidth="5" strokeLinecap="round" />
            <circle cx="92" cy="66" r="9" fill="#ffffff" opacity="0.35" />
          </>
        )}
      </svg>
    </div>
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
  item,
  language,
  meaning,
  onContinue,
}: {
  correct: boolean;
  item: ProduceItem;
  language: ExplanationLanguage;
  meaning: (item: ProduceItem) => string;
  onContinue: () => void;
}) {
  const text = getUiText(language);
  const copy = produceCopy(language);

  return (
    <div className={`mt-4 rounded-[1.15rem] border p-4 ${correct ? "border-emerald-300 bg-emerald-50 text-emerald-950 dark:bg-emerald-300/15 dark:text-emerald-100" : "border-red-300 bg-red-50 text-red-950 dark:bg-red-300/15 dark:text-red-100"}`} role="status">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-black" {...uiTextProps(language)}>{correct ? text.lesson.correct : text.lesson.notQuite}</p>
          <p className="mt-1 text-sm font-bold">
            <span dir="ltr" lang="ru">{item.russian}</span> = <span {...uiTextProps(language)}>{meaning(item)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PronounceButton text={item.russian} className="h-11 w-11" />
          <button type="button" onClick={onContinue} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-navy)] px-5 py-2.5 font-black text-[#f8fbff] transition hover:bg-[var(--brand-teal)] dark:bg-[var(--brand-lime)] dark:text-[var(--brand-navy)]" {...uiTextProps(language)}>
            {copy.continue}
          </button>
        </div>
      </div>
    </div>
  );
}

function StageStepper({ stage, copy, onSelect }: { stage: LessonStage; copy: ReturnType<typeof produceCopy>; onSelect: (stage: LessonStage) => void }) {
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
              {...uiTextProps(copy.language)}
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

function getProduce(id: string) {
  const item = produceItems.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Unknown produce item: ${id}`);
  return item;
}

function getProduceByRussian(russian: string) {
  const item = produceItems.find((candidate) => candidate.russian === russian);
  if (!item) throw new Error(`Unknown produce word: ${russian}`);
  return item;
}

function getChoiceOptions(target: ProduceItem) {
  const sameCategory = produceItems.filter((item) => item.category === target.category && item.id !== target.id).slice(0, 2);
  const otherCategory = produceItems.filter((item) => item.category !== target.category).slice(0, 2);
  return getStableShuffledItems([target, ...sameCategory, ...otherCategory].slice(0, 4), `produce-options-${target.id}`);
}

function getStableShuffledItems(items: ProduceItem[], seed: string) {
  return [...items].sort((left, right) => stableHash(`${seed}:${left.id}`) - stableHash(`${seed}:${right.id}`));
}

function getStableDerangedItems(items: ProduceItem[], seed: string) {
  if (items.length < 2) return items;
  const originalIds = items.map((item) => item.id);
  const shuffled = getStableShuffledItems(items, seed);
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
  return normalizeForComparison(answer) === normalizeForComparison(normalizeRussianText(target));
}

function normalizeForComparison(value: string) {
  return value.trim().replaceAll("ё", "е").replaceAll("Ё", "Е").toLocaleLowerCase("ru-RU");
}

function getStageProgress(stage: LessonStage, sortIndex: number, matchedCount: number, listenIndex: number, typeIndex: number, finalIndex: number, finalTotal: number) {
  const stageBase: Record<LessonStage, number> = {
    learn: 8,
    sort: 24 + (sortIndex / sortIds.length) * 18,
    match: 44 + (matchedCount / matchIds.length) * 16,
    listen: 62 + (listenIndex / listenIds.length) * 12,
    type: 76 + (typeIndex / typeIds.length) * 10,
    final: 88 + (finalIndex / Math.max(1, finalTotal)) * 12,
    complete: 100,
  };
  return Math.min(100, stageBase[stage]);
}

function getFinalPrompt(question: FinalQuestion, copy: ReturnType<typeof produceCopy>) {
  if (question.type === "choose") return copy.choosePrompt;
  if (question.type === "sort") return copy.sortPrompt;
  if (question.type === "listen") return copy.listenPrompt;
  if (question.type === "match") return copy.matchPrompt;
  return copy.typePrompt;
}

function formatFinalUserAnswer(value: string, language: ExplanationLanguage) {
  const item = produceItems.find((candidate) => candidate.id === value);

  if (item) {
    return language === "ar" ? item.arabic : item.english;
  }

  if (value === "fruit") {
    return language === "ar" ? "فاكهة" : "Fruit";
  }

  if (value === "vegetable") {
    return language === "ar" ? "خضار" : "Vegetable";
  }

  return value;
}

function getStageLabel(stage: LessonStage, copy: ReturnType<typeof produceCopy>) {
  const labels: Record<LessonStage, string> = {
    learn: copy.learn,
    sort: copy.sort,
    match: copy.match,
    listen: copy.listen,
    type: copy.type,
    final: copy.final,
    complete: copy.complete,
  };
  return labels[stage];
}

function getLearnGroupLabel(groupId: LearnGroupId, copy: ReturnType<typeof produceCopy>) {
  const labels: Record<LearnGroupId, string> = {
    "fruits-1": copy.fruitsOne,
    "fruits-2": copy.fruitsTwo,
    "vegetables-1": copy.vegetablesOne,
    "vegetables-2": copy.vegetablesTwo,
  };
  return labels[groupId];
}

function produceCopy(language: ExplanationLanguage) {
  const text = getUiText(language);
  const ar = language === "ar";
  return {
    language,
    russianTopic: ar ? "Фрукты и овощи" : "Фрукты и овощи",
    learn: ar ? "تعلّم" : "Learn",
    sort: ar ? "فرز" : "Sort",
    match: ar ? "مطابقة" : "Match",
    listen: ar ? "استماع" : "Listen",
    type: ar ? "كتابة" : "Type",
    final: ar ? "النهائي" : "Final",
    complete: text.lesson.lessonComplete,
    stages: ar ? "مراحل الدرس" : "Lesson stages",
    fruit: ar ? "فاكهة" : "Fruit",
    vegetable: ar ? "خضار" : "Vegetable",
    fruits: ar ? "فواكه" : "Fruits",
    vegetables: ar ? "خضار" : "Vegetables",
    fruitsOne: ar ? "فواكه 1" : "Fruits 1",
    fruitsTwo: ar ? "فواكه 2" : "Fruits 2",
    vegetablesOne: ar ? "خضار 1" : "Vegetables 1",
    vegetablesTwo: ar ? "خضار 2" : "Vegetables 2",
    learnHint: ar ? "ادرس المجموعة، استمع للنطق، ثم انتقل للتدريب." : "Study one group, listen to pronunciation, then move into practice.",
    startPractice: text.lesson.startPractice,
    sortPrompt: ar ? "صنّف الكلمة في السلة الصحيحة" : "Sort the word into the right basket",
    sortInto: ar ? "صنّف ضمن" : "Sort into",
    basket: ar ? "سلة" : "Basket",
    matchPrompt: ar ? "طابق الكلمة الروسية مع المعنى أو الصورة" : "Match each Russian word to the meaning or image",
    matchHint: ar ? "اختر كلمة روسية، ثم اختر البطاقة المطابقة. الخيارات مخلوطة." : "Choose a Russian word, then choose its matching card. Options are shuffled.",
    choosePrompt: ar ? "اختر البطاقة الصحيحة" : "Choose the correct card",
    listenPrompt: ar ? "استمع واختر البطاقة الصحيحة" : "Listen and choose the correct card",
    typePrompt: ar ? "اكتب الكلمة بالروسية" : "Type the Russian word",
    typeHint: ar ? "اكتب الكلمة الروسية. يمكن استخدام Enter للإرسال." : "Type the Russian word. Press Enter to submit.",
    typeRussian: ar ? "الكلمة الروسية" : "Russian word",
    meaning: ar ? "المعنى" : "Meaning",
    check: ar ? "تحقق" : "Check",
    continue: text.lesson.continue,
    playPronunciation: text.lesson.playPronunciation,
    pairedWith: ar ? "مطابق مع" : "Paired with",
    chooseMatch: ar ? "اختر بطاقة من الجهة الأخرى" : "Choose a card on the other side",
    selected: ar ? "تم الاختيار" : "Selected",
    available: ar ? "متاح" : "Available",
    matchReviewed: ar ? "تمت مراجعة المطابقة" : "Match reviewed",
    finalChallenge: ar ? "التحدي النهائي" : "Final challenge",
    question: ar ? "السؤال" : "Question",
    result: ar ? "النتيجة" : "Result",
    accuracy: ar ? "الدقة" : "Accuracy",
    correctWords: ar ? "الكلمات الصحيحة" : "Correct words",
    practiceWriting: ar ? "تدرّب على الكتابة" : "Practice writing",
    backToBasics: ar ? "العودة إلى الأساسيات" : "Back to Basics",
    retryMissed: ar ? "أعد الأسئلة الخاطئة" : "Retry missed",
    retry: ar ? "إعادة المحاولة" : "Retry",
    completeMessage: ar ? "أنهيت درس الخضار والفواكه. راجع النتيجة أو تابع تدريب الكتابة." : "You finished Fruits and Vegetables. Review your result or keep practicing.",
  };
}
