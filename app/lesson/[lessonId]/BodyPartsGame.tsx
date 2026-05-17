"use client";

import { Navigation } from "@/components/Navigation";
import { useExplanationLanguage } from "@/components/LanguageSelector";
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
import Link from "next/link";
import { useMemo, useState } from "react";

type BodySection = "head" | "body" | "back";
type LessonPhase = "learn" | "tap" | "match" | "listen" | "final" | "complete";

type BodyPart = {
  id: string;
  section: BodySection;
  russian: string;
  english: string;
  arabic: string;
  marker: number;
  x: number;
  y: number;
  highlight: string;
  note?: Record<ExplanationLanguage, string>;
};

type AnswerState = {
  selectedId: string;
  isCorrect: boolean;
};

type FinalQuestion =
  | { id: string; type: "tap"; partId: string }
  | { id: string; type: "translation" | "listen"; partId: string; options: string[] }
  | { id: string; type: "russian"; partId: string; options: string[] };

const bodyParts: BodyPart[] = [
  { id: "head", section: "head", russian: "голова", english: "head", arabic: "الرأس", marker: 1, x: 50, y: 31, highlight: "left-[28%] top-[14%] h-[42%] w-[44%] rounded-[45%]" },
  { id: "hair", section: "head", russian: "волосы", english: "hair", arabic: "الشعر", marker: 2, x: 50, y: 16, highlight: "left-[30%] top-[9%] h-[20%] w-[42%] rounded-t-full" },
  { id: "eye", section: "head", russian: "глаз", english: "eye", arabic: "العين", marker: 3, x: 42, y: 37, highlight: "left-[34%] top-[33%] h-[10%] w-[15%] rounded-full" },
  { id: "nose", section: "head", russian: "нос", english: "nose", arabic: "الأنف", marker: 4, x: 50, y: 46, highlight: "left-[45%] top-[39%] h-[16%] w-[12%] rounded-full" },
  { id: "mouth", section: "head", russian: "рот", english: "mouth", arabic: "الفم", marker: 5, x: 50, y: 57, highlight: "left-[39%] top-[53%] h-[10%] w-[23%] rounded-full" },
  { id: "ear", section: "head", russian: "ухо", english: "ear", arabic: "الأذن", marker: 6, x: 74, y: 40, highlight: "left-[70%] top-[31%] h-[20%] w-[12%] rounded-full" },
  { id: "neck", section: "body", russian: "шея", english: "neck", arabic: "الرقبة", marker: 7, x: 50, y: 14, highlight: "left-[41%] top-[7%] h-[16%] w-[18%] rounded-lg" },
  { id: "shoulder", section: "body", russian: "плечо", english: "shoulder", arabic: "الكتف", marker: 8, x: 31, y: 29, highlight: "left-[24%] top-[22%] h-[17%] w-[24%] rounded-full" },
  {
    id: "arm",
    section: "body",
    russian: "рука",
    english: "arm/hand",
    arabic: "اليد / الذراع",
    marker: 9,
    x: 18,
    y: 51,
    highlight: "left-[8%] top-[31%] h-[42%] w-[18%] rounded-full -rotate-12",
    note: {
      en: "рука can mean arm or hand depending on context.",
      ar: "كلمة рука قد تعني اليد أو الذراع حسب السياق.",
    },
  },
  { id: "stomach", section: "body", russian: "живот", english: "stomach/belly", arabic: "البطن", marker: 10, x: 50, y: 51, highlight: "left-[37%] top-[39%] h-[25%] w-[27%] rounded-full" },
  {
    id: "back",
    section: "back",
    russian: "спина",
    english: "back",
    arabic: "الظهر",
    marker: 11,
    x: 50,
    y: 44,
    highlight: "left-[29%] top-[32%] h-[38%] w-[43%] rounded-[40%]",
    note: {
      en: "This part is shown in the back view because it is not visible from the front.",
      ar: "هذا الجزء يظهر في منظر الظهر لأنه لا يظهر من الأمام.",
    },
  },
  {
    id: "leg",
    section: "body",
    russian: "нога",
    english: "leg/foot",
    arabic: "الرجل / القدم",
    marker: 12,
    x: 43,
    y: 80,
    highlight: "left-[29%] top-[60%] h-[34%] w-[23%] rounded-full rotate-3",
    note: {
      en: "нога can mean leg or foot depending on context.",
      ar: "كلمة нога قد تعني الرجل أو القدم حسب السياق.",
    },
  },
];

const tapQuestions = ["nose", "eye", "mouth", "shoulder", "stomach", "leg"];
const listenQuestions = ["ear", "hair", "neck", "back"];
const matchParts = ["head", "hair", "eye", "nose", "mouth", "ear", "neck", "shoulder", "arm", "stomach", "back", "leg"];
const finalQuestions: FinalQuestion[] = [
  { id: "final-tap-ear", type: "tap", partId: "ear" },
  { id: "final-translation-ruka", type: "translation", partId: "arm", options: ["arm/hand", "neck", "back", "hair"] },
  { id: "final-russian-head", type: "russian", partId: "head", options: ["голова", "нога", "рот", "ухо"] },
  { id: "final-listen-mouth", type: "listen", partId: "mouth", options: ["mouth", "nose", "eye", "ear"] },
  { id: "final-tap-neck", type: "tap", partId: "neck" },
  { id: "final-translation-spina", type: "translation", partId: "back", options: ["eye", "back", "shoulder", "mouth"] },
  { id: "final-listen-leg", type: "listen", partId: "leg", options: ["leg/foot", "arm/hand", "stomach/belly", "shoulder"] },
];

const bodyPartVisuals: Record<string, Pick<BodyPart, "x" | "y" | "highlight">> = {
  head: { x: 25, y: 68, highlight: "left-[29%] top-[16%] h-[44%] w-[42%] rounded-[46%]" },
  hair: { x: 50, y: 15, highlight: "left-[30%] top-[8%] h-[20%] w-[41%] rounded-t-full" },
  eye: { x: 34, y: 39, highlight: "left-[34%] top-[34%] h-[10%] w-[16%] rounded-full" },
  nose: { x: 60, y: 44, highlight: "left-[45%] top-[40%] h-[15%] w-[11%] rounded-full" },
  mouth: { x: 50, y: 61, highlight: "left-[39%] top-[54%] h-[10%] w-[23%] rounded-full" },
  ear: { x: 77, y: 39, highlight: "left-[70%] top-[32%] h-[20%] w-[12%] rounded-full" },
  neck: { x: 50, y: 13, highlight: "left-[42%] top-[7%] h-[15%] w-[16%] rounded-xl" },
  shoulder: { x: 29, y: 28, highlight: "left-[22%] top-[22%] h-[17%] w-[27%] rounded-full" },
  arm: { x: 17, y: 53, highlight: "left-[7%] top-[32%] h-[42%] w-[18%] rounded-full -rotate-12" },
  stomach: { x: 50, y: 52, highlight: "left-[37%] top-[39%] h-[25%] w-[27%] rounded-full" },
  back: { x: 50, y: 44, highlight: "left-[28%] top-[30%] h-[41%] w-[44%] rounded-[38%]" },
  leg: { x: 42, y: 80, highlight: "left-[29%] top-[60%] h-[34%] w-[23%] rounded-full rotate-3" },
};

export function BodyPartsGame({ lesson }: { lesson: Lesson }) {
  const { language } = useExplanationLanguage();
  const text = getUiText(language);
  const progressState = useProgress();
  const [phase, setPhase] = useState<LessonPhase>("learn");
  const [selectedPartId, setSelectedPartId] = useState("head");
  const [visitedPartIds, setVisitedPartIds] = useState<string[]>(["head"]);
  const [tapIndex, setTapIndex] = useState(0);
  const [tapAnswer, setTapAnswer] = useState<AnswerState | null>(null);
  const [listenIndex, setListenIndex] = useState(0);
  const [listenAnswer, setListenAnswer] = useState<AnswerState | null>(null);
  const [selectedRussianId, setSelectedRussianId] = useState("");
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [matchFeedback, setMatchFeedback] = useState("");
  const [finalIndex, setFinalIndex] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [finalAnswer, setFinalAnswer] = useState<AnswerState | null>(null);
  const [completionProgress, setCompletionProgress] = useState<SavedProgress | null>(null);
  const [vocabularyOpen, setVocabularyOpen] = useState(false);

  const selectedPart = getPart(selectedPartId);
  const activeProgress = completionProgress ?? progressState;
  const lessonProgress = getPhaseProgress(phase, tapIndex, listenIndex, matchedIds.length, finalIndex);
  const nextAction = useMemo(
    () => ({
      href: getNextAvailablePath(activeProgress),
      label: getNextAvailableLabel(activeProgress),
    }),
    [activeProgress],
  );

  function translation(part: BodyPart) {
    return language === "ar" ? part.arabic : part.english;
  }

  function note(part: BodyPart) {
    return part.note?.[language];
  }

  function selectPart(part: BodyPart) {
    setSelectedPartId(part.id);
    setVisitedPartIds((current) => (current.includes(part.id) ? current : [...current, part.id]));
  }

  function changePhase(nextPhase: LessonPhase) {
    if (nextPhase === "complete") return;

    setPhase(nextPhase);
    setTapAnswer(null);
    setListenAnswer(null);
    setFinalAnswer(null);
    setMatchFeedback("");
  }

  function recordMistake(exerciseId: string, questionText: string, userAnswer: string, correctAnswer: string, explanation: string) {
    addMistake({
      lessonId: lesson.id,
      exerciseId,
      questionText,
      userAnswer,
      correctAnswer,
      explanation,
      language,
    });
  }

  function handleTapSelect(part: BodyPart) {
    if (tapAnswer) return;

    const targetPart = getPart(tapQuestions[tapIndex]);
    const isCorrect = part.id === targetPart.id;
    setTapAnswer({ selectedId: part.id, isCorrect });
    selectPart(targetPart);

    if (!isCorrect) {
      recordMistake(
        `body-parts-tap-${targetPart.id}`,
        `${tapPrompt(text, language)} ${translation(targetPart)}`,
        translation(part),
        translation(targetPart),
        `${targetPart.russian} = ${translation(targetPart)}`,
      );
    }
  }

  function advanceTap() {
    if (tapIndex >= tapQuestions.length - 1) {
      setPhase("match");
      setTapAnswer(null);
      return;
    }

    setTapIndex((current) => current + 1);
    setTapAnswer(null);
  }

  function handleMatchMeaning(part: BodyPart) {
    if (!selectedRussianId || matchedIds.includes(part.id)) return;

    const russianPart = getPart(selectedRussianId);

    if (russianPart.id === part.id) {
      setMatchedIds((current) => [...current, part.id]);
      setMatchFeedback(`${bodyCopy(language).greatJob}: ${part.russian} = ${translation(part)}`);
    } else {
      setMatchFeedback(`${bodyCopy(language).tryAgain}: ${russianPart.russian} = ${translation(russianPart)}`);
      recordMistake(
        `body-parts-match-${russianPart.id}`,
        text.lesson.matchTheWords,
        `${russianPart.russian} -> ${translation(part)}`,
        `${russianPart.russian} -> ${translation(russianPart)}`,
        `${russianPart.russian} = ${translation(russianPart)}`,
      );
    }

    setSelectedRussianId("");
  }

  function answerListen(part: BodyPart) {
    if (listenAnswer) return;

    const targetPart = getPart(listenQuestions[listenIndex]);
    const isCorrect = part.id === targetPart.id;
    setListenAnswer({ selectedId: part.id, isCorrect });
    selectPart(targetPart);

    if (!isCorrect) {
      recordMistake(
        `body-parts-listen-${targetPart.id}`,
        bodyCopy(language).chooseCorrectBodyPart,
        translation(part),
        translation(targetPart),
        `${targetPart.russian} = ${translation(targetPart)}`,
      );
    }
  }

  function advanceListen() {
    if (listenIndex >= listenQuestions.length - 1) {
      setPhase("final");
      setListenAnswer(null);
      return;
    }

    setListenIndex((current) => current + 1);
    setListenAnswer(null);
  }

  function handleFinalTap(part: BodyPart) {
    if (finalAnswer) return;

    const question = finalQuestions[finalIndex];
    if (question.type !== "tap") return;

    answerFinal(part.id === question.partId, part.id);
  }

  function answerFinal(isCorrect: boolean, userAnswer: string) {
    if (finalAnswer) return;

    const question = finalQuestions[finalIndex];
    const targetPart = getPart(question.partId);
    setFinalAnswer({ selectedId: userAnswer, isCorrect });
    selectPart(targetPart);

    if (isCorrect) {
      setFinalScore((score) => score + 1);
      return;
    }

    recordMistake(
      question.id,
      getFinalPrompt(question, targetPart, language),
      question.type === "tap" ? translation(getPart(userAnswer)) : userAnswer,
      getFinalCorrectAnswer(question, targetPart, language),
      `${targetPart.russian} = ${translation(targetPart)}`,
    );
  }

  function advanceFinal() {
    if (finalIndex >= finalQuestions.length - 1) {
      const nextProgress = completeLesson(lesson.id, lesson.xpReward);
      setCompletionProgress(nextProgress);
      setPhase("complete");
      return;
    }

    setFinalIndex((current) => current + 1);
    setFinalAnswer(null);
  }

  if (phase === "complete") {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navigation />
        <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl items-center px-4 pb-8 sm:px-6">
          <div className="w-full rounded-2xl border border-white/10 bg-white/10 p-5 text-center shadow-2xl shadow-cyan-950/30 sm:rounded-3xl sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300" {...uiTextProps(language)}>
              {bodyCopy(language).lessonComplete}
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-5xl" {...uiTextProps(language)}>
              {localizeLessonTitle(lesson.title, language)}
            </h1>
            <div className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
              <ResultPill label={text.lesson.xpEarned} value={`${lesson.xpReward} XP`} />
              <ResultPill label={text.lesson.score} value={`${finalScore}/${finalQuestions.length}`} />
              <ResultPill label={text.lesson.accuracy} value={`${Math.round((finalScore / finalQuestions.length) * 100)}%`} />
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Link href={nextAction.href} className="rounded-full bg-cyan-400 px-5 py-4 font-black text-slate-950 transition hover:bg-cyan-300">
                {localizeActionLabel(nextAction.label, language)}
              </Link>
              <Link href="/worlds" className="rounded-full border border-white/10 bg-white/10 px-5 py-4 font-black text-white transition hover:bg-white/15">
                {text.lesson.backToWorlds}
              </Link>
              <Link href="/practice" className="rounded-full border border-yellow-300/40 bg-yellow-300/10 px-5 py-4 font-black text-yellow-100 transition hover:bg-yellow-300/20">
                {text.lesson.practice}
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const copy = bodyCopy(language);
  const currentTapPart = getPart(tapQuestions[tapIndex]);
  const currentListenPart = getPart(listenQuestions[listenIndex]);
  const currentFinal = finalQuestions[finalIndex];
  const currentFinalPart = getPart(currentFinal.partId);

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <Navigation />
      <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/90 px-4 py-2 backdrop-blur sm:hidden">
        <div className="flex items-center justify-between gap-3 text-xs font-black" {...uiTextProps(language)}>
          <span>{getPhaseLabel(phase, language)}</span>
          <span>{Math.round(lessonProgress)}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${lessonProgress}%` }} />
        </div>
      </div>

      <section className="mx-auto max-w-[88rem] px-4 pb-8 sm:px-6">
        <header className="mb-5 rounded-2xl border border-white/10 bg-white/[0.08] p-4 shadow-xl shadow-cyan-950/20 sm:rounded-3xl sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300" {...uiTextProps(language)}>
            {copy.bodyParts}
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1 className="break-words text-3xl font-black sm:text-5xl" {...uiTextProps(language)}>
                {localizeLessonTitle(lesson.title, language)}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base" {...uiTextProps(language)}>
                {localizeLessonDescription(lesson.description, language)}
              </p>
            </div>
            <ModeTabs phase={phase} language={language} onSelect={changePhase} />
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_21.5rem] 2xl:grid-cols-[minmax(0,1fr)_23rem]">
          <section className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.08] p-4 shadow-xl shadow-cyan-950/20 sm:rounded-3xl sm:p-5">
            <PanelTitle title={getPhaseLabel(phase, language)} detail={getPhaseDetail(phase, language, currentTapPart, currentListenPart, currentFinal, currentFinalPart, translation, visitedPartIds.length, matchedIds.length, finalIndex)} language={language} />

            {phase === "final" ? (
              <FinalQuestionCard
                question={currentFinal}
                targetPart={currentFinalPart}
                index={finalIndex}
                total={finalQuestions.length}
                score={finalScore}
                language={language}
              />
            ) : null}

            {phase === "match" ? (
              <MatchMode
                language={language}
                selectedRussianId={selectedRussianId}
                matchedIds={matchedIds}
                onSelectRussian={setSelectedRussianId}
                onSelectMeaning={handleMatchMeaning}
                translate={translation}
              />
            ) : phase === "listen" ? (
              <ListenMode
                targetPart={currentListenPart}
                answer={listenAnswer}
                onAnswer={answerListen}
                translate={translation}
                language={language}
              />
            ) : phase === "final" && currentFinal.type !== "tap" ? null : (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-[1fr_1fr_0.86fr]">
                {(["head", "body", "back"] as const).map((section) => (
                  <BodyMap
                    key={section}
                    section={section}
                    title={getSectionTitle(section, language)}
                    activePartId={selectedPartId}
                    feedbackPartId={
                      phase === "tap" && tapAnswer
                        ? currentTapPart.id
                        : phase === "final" && finalAnswer && currentFinal.type === "tap"
                          ? currentFinalPart.id
                          : undefined
                    }
                    wrongPartId={
                      phase === "tap" && tapAnswer && !tapAnswer.isCorrect
                        ? tapAnswer.selectedId
                        : phase === "final" && finalAnswer && !finalAnswer.isCorrect && currentFinal.type === "tap"
                          ? finalAnswer.selectedId
                          : undefined
                    }
                    onSelect={phase === "tap" ? handleTapSelect : phase === "final" && currentFinal.type === "tap" ? handleFinalTap : selectPart}
                    language={language}
                    translate={translation}
                  />
                ))}
              </div>
            )}

            {phase === "final" && currentFinal.type !== "tap" ? (
              <ChoiceChallenge
                question={currentFinal}
                targetPart={currentFinalPart}
                finalAnswer={finalAnswer}
                onAnswer={answerFinal}
                language={language}
                translate={translation}
              />
            ) : null}

            <div className="mt-5">
              {phase === "tap" && tapAnswer ? (
                <Feedback correct={tapAnswer.isCorrect} part={currentTapPart} language={language} translate={translation} />
              ) : null}
              {phase === "match" && matchFeedback ? (
                <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-bold text-cyan-100" {...uiTextProps(language)}>
                  {matchFeedback}
                </p>
              ) : null}
              {phase === "listen" && listenAnswer ? (
                <Feedback correct={listenAnswer.isCorrect} part={currentListenPart} language={language} translate={translation} />
              ) : null}
              {phase === "final" && finalAnswer ? (
                <Feedback correct={finalAnswer.isCorrect} part={currentFinalPart} language={language} translate={translation} />
              ) : null}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {phase === "learn" ? (
                <button type="button" onClick={() => changePhase("tap")} className="min-h-12 rounded-full bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300">
                  {visitedPartIds.length >= 6 ? copy.continueToPractice : text.lesson.startQuiz}
                </button>
              ) : null}
              {phase === "tap" && tapAnswer ? (
                <button type="button" onClick={advanceTap} className="min-h-12 rounded-full bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300">
                  {tapIndex >= tapQuestions.length - 1 ? text.lesson.nextMode : text.lesson.continue}
                </button>
              ) : null}
              {phase === "match" && matchedIds.length === matchParts.length ? (
                <button type="button" onClick={() => changePhase("listen")} className="min-h-12 rounded-full bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300">
                  {text.lesson.nextMode}
                </button>
              ) : null}
              {phase === "listen" && listenAnswer ? (
                <button type="button" onClick={advanceListen} className="min-h-12 rounded-full bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300">
                  {listenIndex >= listenQuestions.length - 1 ? text.lesson.nextMode : text.lesson.continue}
                </button>
              ) : null}
              {phase === "final" && finalAnswer ? (
                <button type="button" onClick={advanceFinal} className="min-h-12 rounded-full bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300">
                  {finalIndex >= finalQuestions.length - 1 ? copy.finishChallenge : text.lesson.continue}
                </button>
              ) : null}
            </div>
          </section>

          <aside className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.08] p-4 shadow-xl shadow-cyan-950/20 sm:rounded-3xl sm:p-5 xl:sticky xl:top-4 xl:self-start">
            <SelectedPartCard part={selectedPart} language={language} translate={translation} note={note(selectedPart)} />
            <button
              type="button"
              onClick={() => setVocabularyOpen((isOpen) => !isOpen)}
              className="mt-4 flex min-h-12 w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-left font-black text-slate-100 lg:hidden"
              {...uiTextProps(language)}
            >
              <span>{copy.bodyParts}</span>
              <span aria-hidden="true" className="text-cyan-200">{vocabularyOpen ? "-" : "+"}</span>
            </button>
            <WordLegend selectedPartId={selectedPartId} language={language} translate={translation} onSelect={selectPart} isOpen={vocabularyOpen} />
          </aside>
        </div>
      </section>
    </main>
  );
}

function BodyMap({
  section,
  title,
  activePartId,
  feedbackPartId,
  wrongPartId,
  onSelect,
  language,
  translate,
}: {
  section: BodySection;
  title: string;
  activePartId: string;
  feedbackPartId?: string;
  wrongPartId?: string;
  onSelect: (part: BodyPart) => void;
  language: ExplanationLanguage;
  translate: (part: BodyPart) => string;
}) {
  const parts = bodyParts.filter((part) => part.section === section);
  const highlightedPart = parts.find((part) => part.id === (feedbackPartId ?? activePartId));
  const wrongPart = parts.find((part) => part.id === wrongPartId);

  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/70 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-black sm:text-lg" {...uiTextProps(language)}>{title}</h2>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[0.65rem] font-black uppercase tracking-wider text-cyan-100" {...uiTextProps(language)}>
          {section === "body" ? getUiText(language).lesson.frontView : title}
        </span>
      </div>
      <div className="relative mt-3 aspect-[4/5] min-h-[21rem] overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#F8FBFF] text-[#11203B] shadow-[inset_0_0_0_1px_rgba(17,32,59,0.05)] sm:min-h-[25rem] md:min-h-[22rem] xl:min-h-[25rem]">
        <BodySvg section={section} />
        {highlightedPart ? (
          <BodyRegionHighlight part={highlightedPart} tone={feedbackPartId ? "correct" : "active"} />
        ) : null}
        {wrongPart ? <BodyRegionHighlight part={wrongPart} tone="wrong" /> : null}
        {parts.map((part) => {
          const visual = getBodyPartVisual(part);
          const isActive = part.id === activePartId;
          const isCorrect = part.id === feedbackPartId;
          const isWrong = part.id === wrongPartId;
          const label = `${part.marker}. ${part.russian}, ${translate(part)}`;

          return (
            <button
              type="button"
              key={part.id}
              onClick={() => onSelect(part)}
              aria-label={label}
              className={`absolute z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-base font-black shadow-lg shadow-slate-900/20 transition after:absolute after:inset-[-9px] after:rounded-full after:border-2 after:border-current/20 after:content-[''] focus:outline-none focus:ring-4 focus:ring-[#11203B]/40 sm:h-14 sm:w-14 ${
                isCorrect
                  ? "border-emerald-800 bg-emerald-200 text-emerald-950 ring-4 ring-emerald-300/50"
                  : isWrong
                    ? "border-red-800 bg-red-200 text-red-950 ring-4 ring-red-300/50"
                    : isActive
                      ? "scale-110 border-[#11203B] bg-[#B7E531] text-[#11203B] ring-4 ring-[#57D4E8]/60"
                      : "border-[#0F766E] bg-white/95 text-[#11203B] hover:-translate-y-[54%] hover:bg-[#57D4E8]"
              }`}
              style={{ left: `${visual.x}%`, top: `${visual.y}%` }}
            >
              {isCorrect ? "✓" : isWrong ? "!" : part.marker}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BodyRegionHighlight({ part, tone }: { part: BodyPart; tone: "active" | "correct" | "wrong" }) {
  const visual = getBodyPartVisual(part);
  const toneClass = {
    active: "border-[#11203B]/80 bg-[#B7E531]/45 ring-[#57D4E8]/45",
    correct: "border-emerald-800 bg-emerald-300/55 ring-emerald-300/45",
    wrong: "border-red-800 bg-red-300/45 ring-red-300/45",
  }[tone];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 border-[3px] shadow-[0_0_26px_rgba(87,212,232,0.22)] ring-8 ${visual.highlight} ${toneClass}`}
    />
  );
}

function BodySvg({ section }: { section: BodySection }) {
  if (section === "head") {
    return (
      <svg aria-hidden="true" viewBox="0 0 240 300" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="body-head-bg" x1="34" x2="206" y1="18" y2="274" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E9FBFF" />
            <stop offset="1" stopColor="#F8FBFF" />
          </linearGradient>
          <linearGradient id="body-head-shirt" x1="82" x2="164" y1="218" y2="278" gradientUnits="userSpaceOnUse">
            <stop stopColor="#57D4E8" />
            <stop offset="1" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
        <rect width="240" height="300" fill="url(#body-head-bg)" />
        <circle cx="120" cy="77" r="67" fill="#57D4E8" opacity=".12" />
        <path d="M73 93c-7-42 15-72 47-72 34 0 58 31 49 72 15 8 16 38-1 48-6 45-27 73-48 73s-42-28-48-73c-17-10-16-40 1-48Z" fill="#F3C3A5" stroke="#11203B" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M72 91c4-43 28-67 63-64 28 2 44 25 38 66-20-12-40-18-62-18-14 0-27 5-39 16Z" fill="#11203B" />
        <path d="M82 90c22-19 58-24 87 2" fill="none" stroke="#14B8A6" strokeWidth="4.5" strokeLinecap="round" opacity=".9" />
        <path d="M76 110c-10 0-17 8-16 18 1 10 9 16 20 15" fill="#F3C3A5" stroke="#11203B" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M164 110c10 0 17 8 16 18-1 10-9 16-20 15" fill="#F3C3A5" stroke="#11203B" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M95 109c8-5 18-5 27 0M134 109c8-5 18-5 27 0" fill="none" stroke="#11203B" strokeWidth="3.6" strokeLinecap="round" />
        <circle cx="108" cy="121" r="4.5" fill="#11203B" />
        <circle cx="145" cy="121" r="4.5" fill="#11203B" />
        <path d="M124 126c-5 15-8 24 1 29 4 2 10 0 14-3" fill="none" stroke="#11203B" strokeWidth="3.8" strokeLinecap="round" />
        <path d="M104 166c13 9 31 9 44 0" fill="none" stroke="#E25B5B" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M96 221h52l14 56H82l14-56Z" fill="url(#body-head-shirt)" stroke="#11203B" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M101 237h38" stroke="#B7E531" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );
  }

  if (section === "back") {
    return (
      <svg aria-hidden="true" viewBox="0 0 240 300" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="body-back-shirt" x1="48" x2="198" y1="134" y2="245" gradientUnits="userSpaceOnUse">
            <stop stopColor="#57D4E8" />
            <stop offset="1" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
        <rect width="240" height="300" fill="#F8FBFF" />
        <circle cx="120" cy="166" r="86" fill="#57D4E8" opacity=".1" />
        <path d="M87 50c0-28 15-46 33-46s33 18 33 46c0 34-15 56-33 56S87 84 87 50Z" fill="#F3C3A5" stroke="#11203B" strokeWidth="4.5" />
        <path d="M80 43c8-30 29-45 54-39 17 5 27 18 28 41-23-12-54-14-82-2Z" fill="#11203B" />
        <path d="M97 104h46v31H97z" fill="#F3C3A5" stroke="#11203B" strokeWidth="4.5" />
        <path d="M70 132h100c16 0 28 12 28 28v83H42v-83c0-16 12-28 28-28Z" fill="url(#body-back-shirt)" stroke="#11203B" strokeWidth="4.5" />
        <path d="M47 160 18 238c-5 15 6 29 22 31l30-88" fill="#F3C3A5" stroke="#11203B" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M193 160 222 238c5 15-6 29-22 31l-30-88" fill="#F3C3A5" stroke="#11203B" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M82 242h76l18 48h-43l-13-36-13 36H64l18-48Z" fill="#14B8A6" stroke="#11203B" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M120 138v96" fill="none" stroke="#11203B" strokeWidth="4.5" strokeLinecap="round" opacity=".42" />
        <path d="M86 154c19 15 49 15 68 0M83 180c22 9 52 9 74 0" fill="none" stroke="#11203B" strokeWidth="3.8" strokeLinecap="round" opacity=".52" />
        <path d="M82 174h76" stroke="#B7E531" strokeWidth="6.5" strokeLinecap="round" opacity=".9" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 240 300" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="body-front-shirt" x1="45" x2="199" y1="60" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#57D4E8" />
          <stop offset="1" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
      <rect width="240" height="300" fill="#F8FBFF" />
      <circle cx="120" cy="144" r="87" fill="#57D4E8" opacity=".1" />
      <path d="M97 22h46v39H97z" fill="#F3C3A5" stroke="#11203B" strokeWidth="4.5" />
      <path d="M71 59h98c17 0 30 13 30 30v91H41V89c0-17 13-30 30-30Z" fill="url(#body-front-shirt)" stroke="#11203B" strokeWidth="4.5" />
      <path d="M43 92 17 172c-5 16 5 31 21 33l31-95" fill="#F3C3A5" stroke="#11203B" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M197 92 223 172c5 16-5 31-21 33l-31-95" fill="#F3C3A5" stroke="#11203B" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M82 180h76l20 98h-45l-13-65-13 65H62l20-98Z" fill="#14B8A6" stroke="#11203B" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M88 101c20 16 45 16 64 0" fill="none" stroke="#11203B" strokeWidth="3.8" strokeLinecap="round" opacity=".75" />
      <path d="M120 69v109" fill="none" stroke="#11203B" strokeWidth="3.8" strokeLinecap="round" opacity=".32" />
      <path d="M88 80h64" stroke="#B7E531" strokeWidth="7" strokeLinecap="round" />
      <circle cx="120" cy="132" r="18" fill="#F8FBFF" stroke="#11203B" strokeWidth="3.8" opacity=".92" />
      <path d="M105 253h-26M135 253h26" stroke="#11203B" strokeWidth="4.5" strokeLinecap="round" opacity=".42" />
    </svg>
  );
}

function SelectedPartCard({
  part,
  language,
  translate,
  note,
}: {
  part: BodyPart;
  language: ExplanationLanguage;
  translate: (part: BodyPart) => string;
  note?: string;
}) {
  const copy = bodyCopy(language);

  return (
    <div className="rounded-2xl border border-cyan-300/25 bg-slate-900/90 p-4 shadow-xl shadow-cyan-950/20">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300" {...uiTextProps(language)}>
        {copy.listenAndRepeat}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-2xl font-black leading-tight sm:text-3xl">{part.russian}</p>
          <p className="mt-1 text-base font-bold text-cyan-100 sm:text-lg" {...uiTextProps(language)}>
            {translate(part)}
          </p>
        </div>
        <PronounceButton text={part.russian} ariaLabel={copy.playPronunciation} title={copy.playPronunciation} className="h-14 w-14 border-cyan-200/60 bg-cyan-300/20 text-cyan-50" />
      </div>
      {note ? (
        <p className="mt-4 rounded-xl bg-cyan-300/10 p-3 text-sm leading-6 text-cyan-50" {...uiTextProps(language)}>
          {note}
        </p>
      ) : null}
    </div>
  );
}

function WordLegend({
  selectedPartId,
  language,
  translate,
  onSelect,
  isOpen,
}: {
  selectedPartId: string;
  language: ExplanationLanguage;
  translate: (part: BodyPart) => string;
  onSelect: (part: BodyPart) => void;
  isOpen: boolean;
}) {
  return (
    <div className={`mt-4 max-h-none gap-2 sm:grid-cols-2 lg:grid lg:max-h-[32rem] lg:grid-cols-1 lg:overflow-y-auto lg:pr-1 ${isOpen ? "grid" : "hidden"}`}>
      {bodyParts.map((part) => (
        <div
          key={part.id}
          className={`grid grid-cols-[1fr_auto] items-center gap-2 rounded-2xl border px-3 py-2 transition ${
            selectedPartId === part.id
              ? "border-cyan-300 bg-cyan-300/15 shadow-lg shadow-cyan-950/20"
              : "border-white/10 bg-slate-900/60 hover:border-cyan-300/30"
          }`}
        >
          <button type="button" onClick={() => onSelect(part)} className="min-w-0 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-cyan-300" {...uiTextProps(language)}>
            <span className="flex min-w-0 items-center gap-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                selectedPartId === part.id ? "bg-lime-300 text-slate-950" : "bg-cyan-300 text-slate-950"
              }`}>
                {part.marker}
              </span>
              <span className="min-w-0">
                <span className="block break-words font-black">{part.russian}</span>
                <span className="block break-words text-sm text-slate-300" {...uiTextProps(language)}>{translate(part)}</span>
              </span>
            </span>
          </button>
          <PronounceButton text={part.russian} className="h-10 w-10" />
        </div>
      ))}
    </div>
  );
}

function MatchMode({
  language,
  selectedRussianId,
  matchedIds,
  onSelectRussian,
  onSelectMeaning,
  translate,
}: {
  language: ExplanationLanguage;
  selectedRussianId: string;
  matchedIds: string[];
  onSelectRussian: (id: string) => void;
  onSelectMeaning: (part: BodyPart) => void;
  translate: (part: BodyPart) => string;
}) {
  const parts = matchParts.map(getPart);
  const text = getUiText(language);
  const selectedPart = selectedRussianId ? getPart(selectedRussianId) : null;

  return (
    <div className="mt-5">
      <div className="mb-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm font-bold text-cyan-50" {...uiTextProps(language)}>
        {text.lesson.selectedPair}: {selectedPart ? selectedPart.russian : text.lesson.matchTheWords}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
      <div className="grid gap-2">
        <p className="px-1 text-xs font-black uppercase tracking-[0.18em] text-slate-400" {...uiTextProps(language)}>{text.lesson.russian}</p>
        {parts.map((part) => (
          <div
            key={part.id}
            className={`grid min-h-12 grid-cols-[1fr_auto] items-center gap-2 rounded-2xl border p-3 transition ${
              matchedIds.includes(part.id)
                ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-100"
                : selectedRussianId === part.id
                  ? "border-cyan-300 bg-cyan-300/20"
                  : "border-white/10 bg-slate-900/80 hover:border-cyan-300/40"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectRussian(part.id)}
              disabled={matchedIds.includes(part.id)}
              className="min-w-0 rounded-xl text-left font-black focus:outline-none focus:ring-2 focus:ring-cyan-300"
            >
              {part.russian}
            </button>
            <PronounceButton text={part.russian} className="h-9 w-9" disabled={matchedIds.includes(part.id)} />
          </div>
        ))}
      </div>
      <div className="grid gap-2">
        <p className="px-1 text-xs font-black uppercase tracking-[0.18em] text-slate-400" {...uiTextProps(language)}>{text.lesson.chooseTranslation}</p>
        {parts.map((part) => (
          <button
            type="button"
            key={part.id}
            onClick={() => onSelectMeaning(part)}
            disabled={matchedIds.includes(part.id)}
            className={`min-h-12 rounded-2xl border p-3 text-left font-bold transition focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
              matchedIds.includes(part.id)
                ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-100"
                : "border-white/10 bg-slate-900/80 hover:border-lime-300/50"
            }`}
            {...uiTextProps(language)}
          >
            {translate(part)}
          </button>
        ))}
      </div>
      </div>
    </div>
  );
}

function ListenMode({
  targetPart,
  answer,
  onAnswer,
  translate,
  language,
}: {
  targetPart: BodyPart;
  answer: AnswerState | null;
  onAnswer: (part: BodyPart) => void;
  translate: (part: BodyPart) => string;
  language: ExplanationLanguage;
}) {
  const options = getListenOptions(targetPart);
  const copy = bodyCopy(language);

  return (
    <div className="mt-5">
      <div className="rounded-2xl border border-cyan-300/25 bg-slate-900/85 p-5 text-center shadow-xl shadow-cyan-950/20">
        <p className="text-sm font-bold text-slate-300" {...uiTextProps(language)}>{copy.chooseCorrectBodyPart}</p>
        <div className="mt-4 flex justify-center">
          <PronounceButton text={targetPart.russian} ariaLabel={copy.playPronunciation} title={copy.playPronunciation} className="h-16 w-16 border-cyan-200/60 bg-cyan-300/20 text-cyan-50 shadow-lg shadow-cyan-950/30" />
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {options.map((part) => {
          const isCorrect = part.id === targetPart.id;
          const selected = answer?.selectedId === part.id;

          return (
            <button
              type="button"
              key={part.id}
              disabled={Boolean(answer)}
              onClick={() => onAnswer(part)}
              className={`min-h-14 rounded-2xl border p-4 text-left font-black shadow-lg shadow-slate-950/10 transition focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
                answer && isCorrect
                  ? "border-emerald-300 bg-emerald-300/20 text-emerald-50"
                  : selected && !isCorrect
                    ? "border-red-300 bg-red-300/20 text-red-50"
                    : "border-white/10 bg-slate-900/80 hover:border-cyan-300/50 hover:bg-slate-900"
              }`}
              {...uiTextProps(language)}
            >
              {translate(part)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FinalQuestionCard({
  question,
  targetPart,
  index,
  total,
  score,
  language,
}: {
  question: FinalQuestion;
  targetPart: BodyPart;
  index: number;
  total: number;
  score: number;
  language: ExplanationLanguage;
}) {
  const text = getUiText(language);

  return (
    <div className="mb-5 rounded-2xl border border-cyan-300/25 bg-slate-900/85 p-4 shadow-xl shadow-cyan-950/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full border border-lime-300/30 bg-lime-300/10 px-3 py-1 text-xs font-black text-lime-100" {...uiTextProps(language)}>
          {text.lesson.question} {index + 1}/{total}
        </span>
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-slate-200" {...uiTextProps(language)}>
          {text.lesson.score}: {score}/{total}
        </span>
      </div>
      <p className="mt-4 text-lg font-black leading-7 text-white sm:text-xl" {...uiTextProps(language)}>
        {getFinalPrompt(question, targetPart, language)}
      </p>
      {question.type === "listen" ? (
        <div className="mt-4 flex justify-center">
          <PronounceButton text={targetPart.russian} ariaLabel={bodyCopy(language).playPronunciation} title={bodyCopy(language).playPronunciation} className="h-16 w-16 border-cyan-200/60 bg-cyan-300/20 text-cyan-50 shadow-lg shadow-cyan-950/30" />
        </div>
      ) : null}
    </div>
  );
}

function ChoiceChallenge({
  question,
  targetPart,
  finalAnswer,
  onAnswer,
  language,
  translate,
}: {
  question: Extract<FinalQuestion, { type: "translation" | "russian" | "listen" }>;
  targetPart: BodyPart;
  finalAnswer: AnswerState | null;
  onAnswer: (isCorrect: boolean, userAnswer: string) => void;
  language: ExplanationLanguage;
  translate: (part: BodyPart) => string;
}) {
  const correctAnswer = question.type === "russian" ? targetPart.russian : targetPart.english;
  const options =
    question.type === "russian" || language === "en"
      ? question.options
      : question.options.map((option) => translate(bodyParts.find((part) => part.english === option) ?? targetPart));
  const localizedCorrect = question.type === "russian" || language === "en" ? correctAnswer : translate(targetPart);

  return (
    <div className="mt-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isCorrect = option === localizedCorrect;
          const selected = finalAnswer?.selectedId === option;

          return (
            <button
              type="button"
              key={option}
              disabled={Boolean(finalAnswer)}
              onClick={() => onAnswer(isCorrect, option)}
              className={`min-h-14 rounded-2xl border p-4 text-left font-black shadow-lg shadow-slate-950/10 transition focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
                finalAnswer && isCorrect
                  ? "border-emerald-300 bg-emerald-300/20 text-emerald-50"
                  : selected && !isCorrect
                    ? "border-red-300 bg-red-300/20 text-red-50"
                    : "border-white/10 bg-slate-900/80 hover:border-cyan-300/50 hover:bg-slate-900"
              }`}
              {...(question.type === "russian" ? {} : uiTextProps(language))}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ModeTabs({
  phase,
  language,
  onSelect,
}: {
  phase: LessonPhase;
  language: ExplanationLanguage;
  onSelect: (phase: LessonPhase) => void;
}) {
  const modes: { id: LessonPhase; label: string }[] = [
    { id: "learn", label: bodyCopy(language).learnTheParts },
    { id: "tap", label: bodyCopy(language).tapCorrectPart },
    { id: "match", label: bodyCopy(language).matchTheWords },
    { id: "listen", label: bodyCopy(language).listenAndChoose },
    { id: "final", label: bodyCopy(language).finalChallenge },
  ];

  return (
    <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
      {modes.map((mode) => (
        <button
          type="button"
          key={mode.id}
          onClick={() => onSelect(mode.id)}
          aria-current={phase === mode.id ? "step" : undefined}
          className={`shrink-0 rounded-full px-3 py-2 text-center text-xs font-black ${
            phase === mode.id ? "bg-lime-300 text-slate-950" : "bg-slate-900/80 text-slate-300 transition hover:bg-white/10 hover:text-white"
          }`}
          {...uiTextProps(language)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}

function PanelTitle({ title, detail, language }: { title: string; detail: string; language: ExplanationLanguage }) {
  return (
    <div className="mb-4">
      <h2 className="break-words text-2xl font-black" {...uiTextProps(language)}>{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base" {...uiTextProps(language)}>{detail}</p>
    </div>
  );
}

function Feedback({
  correct,
  part,
  language,
  translate,
}: {
  correct: boolean;
  part: BodyPart;
  language: ExplanationLanguage;
  translate: (part: BodyPart) => string;
}) {
  const copy = bodyCopy(language);

  return (
    <div className={`rounded-2xl border p-4 ${correct ? "border-emerald-300/40 bg-emerald-300/15" : "border-red-300/40 bg-red-300/15"}`} role="status">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-black" {...uiTextProps(language)}>{correct ? copy.greatJob : copy.tryAgain}</p>
          <p className="mt-1 text-sm text-slate-200">
            {part.russian} = <span {...uiTextProps(language)}>{translate(part)}</span>
          </p>
        </div>
        <PronounceButton text={part.russian} className="h-11 w-11" />
      </div>
    </div>
  );
}

function ResultPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-cyan-200">{value}</p>
    </div>
  );
}

function getPart(id: string) {
  const part = bodyParts.find((candidate) => candidate.id === id);

  if (!part) {
    throw new Error(`Unknown body part: ${id}`);
  }

  return part;
}

function getBodyPartVisual(part: BodyPart) {
  return bodyPartVisuals[part.id] ?? part;
}

function getListenOptions(targetPart: BodyPart) {
  const optionIds: Record<string, string[]> = {
    ear: ["ear", "eye", "mouth", "nose"],
    hair: ["hair", "head", "neck", "back"],
    neck: ["neck", "shoulder", "stomach", "arm"],
    back: ["back", "stomach", "shoulder", "head"],
  };

  return (optionIds[targetPart.id] ?? [targetPart.id, "head", "arm", "leg"]).map(getPart);
}

function getSectionTitle(section: BodySection, language: ExplanationLanguage) {
  const copy = bodyCopy(language);

  if (section === "head") return copy.headFace;
  if (section === "back") return copy.backView;
  return copy.body;
}

function getPhaseLabel(phase: LessonPhase, language: ExplanationLanguage) {
  const copy = bodyCopy(language);

  const labels: Record<LessonPhase, string> = {
    learn: copy.learnTheParts,
    tap: copy.tapCorrectPart,
    match: copy.matchTheWords,
    listen: copy.listenAndChoose,
    final: copy.finalChallenge,
    complete: copy.lessonComplete,
  };

  return labels[phase];
}

function getPhaseDetail(
  phase: LessonPhase,
  language: ExplanationLanguage,
  currentTapPart: BodyPart,
  currentListenPart: BodyPart,
  currentFinal: FinalQuestion,
  currentFinalPart: BodyPart,
  translate: (part: BodyPart) => string,
  visitedCount: number,
  matchedCount: number,
  finalIndex: number,
) {
  const copy = bodyCopy(language);

  if (phase === "learn") {
    return `${getUiText(language).lesson.learnModeHint} ${visitedCount}/${bodyParts.length}`;
  }

  if (phase === "tap") {
    return `${tapPrompt(getUiText(language), language)} ${translate(currentTapPart)}`;
  }

  if (phase === "match") {
    return `${getUiText(language).lesson.matchedPairs}: ${matchedCount}/${matchParts.length}`;
  }

  if (phase === "listen") {
    return `${copy.chooseCorrectBodyPart}: ${currentListenPart.russian}`;
  }

  return `${getUiText(language).lesson.question} ${finalIndex + 1}/${finalQuestions.length}: ${getFinalPrompt(currentFinal, currentFinalPart, language)}`;
}

function tapPrompt(text: ReturnType<typeof getUiText>, language: ExplanationLanguage) {
  return language === "ar" ? text.lesson.tapPromptPrefix : `${text.lesson.tapCorrectPart}:`;
}

function getFinalPrompt(question: FinalQuestion, part: BodyPart, language: ExplanationLanguage) {
  const copy = bodyCopy(language);
  const localizedMeaning = language === "ar" ? part.arabic : part.english;

  if (question.type === "tap") {
    return `${tapPrompt(getUiText(language), language)} ${localizedMeaning}`;
  }

  if (question.type === "translation") {
    return `${getUiText(language).lesson.chooseTranslation}: ${part.russian}`;
  }

  if (question.type === "listen") {
    return copy.chooseCorrectBodyPart;
  }

  return `${getUiText(language).lesson.chooseRussianWord}: ${localizedMeaning}`;
}

function getFinalCorrectAnswer(question: FinalQuestion, part: BodyPart, language: ExplanationLanguage) {
  if (question.type === "russian") return part.russian;
  return language === "ar" ? part.arabic : part.english;
}

function getPhaseProgress(phase: LessonPhase, tapIndex: number, listenIndex: number, matchedCount: number, finalIndex: number) {
  const phaseBase: Record<LessonPhase, number> = {
    learn: 8,
    tap: 20 + (tapIndex / tapQuestions.length) * 18,
    match: 42 + (matchedCount / matchParts.length) * 18,
    listen: 64 + (listenIndex / listenQuestions.length) * 14,
    final: 82 + (finalIndex / finalQuestions.length) * 18,
    complete: 100,
  };

  return Math.min(100, phaseBase[phase]);
}

function bodyCopy(language: ExplanationLanguage) {
  const lessonText = getUiText(language).lesson;

  return {
    bodyParts: lessonText.bodyParts,
    headFace: lessonText.headFace,
    body: lessonText.body,
    backView: lessonText.backView,
    learnTheParts: lessonText.learnTheParts,
    tapCorrectPart: lessonText.tapCorrectPart,
    matchTheWords: lessonText.matchTheWords,
    listenAndChoose: lessonText.listenAndChoose,
    finalChallenge: lessonText.finalChallenge,
    chooseCorrectBodyPart: lessonText.chooseCorrectBodyPart,
    listenAndRepeat: lessonText.listenAndRepeat,
    greatJob: lessonText.greatJob,
    tryAgain: lessonText.tryAgain,
    continueToPractice: lessonText.continueToPractice,
    finishChallenge: lessonText.finishChallenge,
    lessonComplete: lessonText.lessonCompleteBodyParts,
    playPronunciation: lessonText.playPronunciation,
  };
}
