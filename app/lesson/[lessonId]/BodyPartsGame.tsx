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

type BodySection = "head" | "body";
type LessonPhase = "learn" | "tap" | "match" | "final" | "complete";

type BodyPart = {
  id: string;
  section: BodySection;
  russian: string;
  english: string;
  arabic: string;
  note?: {
    en: string;
    ar: string;
  };
  x: number;
  y: number;
};

type TapAnswer = {
  selectedId: string;
  isCorrect: boolean;
};

type FinalQuestion =
  | { id: string; type: "tap"; partId: string }
  | { id: string; type: "translation"; partId: string; options: string[] }
  | { id: string; type: "russian"; partId: string; options: string[] };

const bodyParts: BodyPart[] = [
  { id: "head", section: "head", russian: "голова", english: "head", arabic: "الرأس", x: 50, y: 20 },
  { id: "hair", section: "head", russian: "волосы", english: "hair", arabic: "الشعر", x: 50, y: 9 },
  { id: "eye", section: "head", russian: "глаз", english: "eye", arabic: "العين", x: 43, y: 27 },
  { id: "nose", section: "head", russian: "нос", english: "nose", arabic: "الأنف", x: 50, y: 35 },
  { id: "mouth", section: "head", russian: "рот", english: "mouth", arabic: "الفم", x: 50, y: 46 },
  { id: "ear", section: "head", russian: "ухо", english: "ear", arabic: "الأذن", x: 69, y: 30 },
  { id: "neck", section: "body", russian: "шея", english: "neck", arabic: "الرقبة", x: 50, y: 17 },
  { id: "shoulder", section: "body", russian: "плечо", english: "shoulder", arabic: "الكتف", x: 31, y: 28 },
  {
    id: "arm",
    section: "body",
    russian: "рука",
    english: "arm/hand",
    arabic: "اليد / الذراع",
    note: {
      en: "рука can mean both arm and hand depending on context.",
      ar: "كلمة рука قد تعني اليد أو الذراع بحسب السياق.",
    },
    x: 18,
    y: 51,
  },
  { id: "stomach", section: "body", russian: "живот", english: "stomach/belly", arabic: "البطن", x: 50, y: 50 },
  { id: "back", section: "body", russian: "спина", english: "back", arabic: "الظهر", x: 69, y: 41 },
  {
    id: "leg",
    section: "body",
    russian: "нога",
    english: "leg/foot",
    arabic: "الرجل / القدم",
    note: {
      en: "нога can mean both leg and foot depending on context.",
      ar: "كلمة нога قد تعني الرجل أو القدم بحسب السياق.",
    },
    x: 43,
    y: 80,
  },
];

const tapQuestions = ["nose", "eye", "mouth", "shoulder", "stomach", "leg"];
const matchParts = ["head", "hair", "eye", "nose", "mouth", "ear", "neck", "shoulder", "arm", "stomach", "back", "leg"];
const finalQuestions: FinalQuestion[] = [
  { id: "final-tap-ear", type: "tap", partId: "ear" },
  { id: "final-translation-ruka", type: "translation", partId: "arm", options: ["arm/hand", "neck", "back", "hair"] },
  { id: "final-russian-head", type: "russian", partId: "head", options: ["голова", "нога", "рот", "ухо"] },
  { id: "final-tap-neck", type: "tap", partId: "neck" },
  { id: "final-translation-spina", type: "translation", partId: "back", options: ["eye", "back", "shoulder", "mouth"] },
];

export function BodyPartsGame({ lesson }: { lesson: Lesson }) {
  const { language } = useExplanationLanguage();
  const text = getUiText(language);
  const progressState = useProgress();
  const [phase, setPhase] = useState<LessonPhase>("learn");
  const [selectedPartId, setSelectedPartId] = useState("head");
  const [tapIndex, setTapIndex] = useState(0);
  const [tapAnswer, setTapAnswer] = useState<TapAnswer | null>(null);
  const [selectedRussianId, setSelectedRussianId] = useState("");
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [matchFeedback, setMatchFeedback] = useState("");
  const [finalIndex, setFinalIndex] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [finalAnswer, setFinalAnswer] = useState<TapAnswer | null>(null);
  const [completionProgress, setCompletionProgress] = useState<SavedProgress | null>(null);

  const selectedPart = getPart(selectedPartId);
  const activeProgress = completionProgress ?? progressState;
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
    return part.note ? part.note[language] : undefined;
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

  function handleLearnSelect(part: BodyPart) {
    setSelectedPartId(part.id);
  }

  function handleTapSelect(part: BodyPart) {
    if (tapAnswer) return;

    const targetPart = getPart(tapQuestions[tapIndex]);
    const isCorrect = part.id === targetPart.id;
    setTapAnswer({ selectedId: part.id, isCorrect });
    setSelectedPartId(targetPart.id);

    if (!isCorrect) {
      recordMistake(
        `body-parts-tap-${targetPart.id}`,
        `${text.lesson.tapPromptPrefix}: ${translation(targetPart)}`,
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

    const selectedRussianPart = getPart(selectedRussianId);

    if (selectedRussianPart.id === part.id) {
      setMatchedIds((current) => [...current, part.id]);
      setMatchFeedback(`${text.lesson.youFoundIt}: ${part.russian} = ${translation(part)}`);
    } else {
      setMatchFeedback(`${text.lesson.tryAnotherPart}: ${selectedRussianPart.russian} = ${translation(selectedRussianPart)}`);
      recordMistake(
        `body-parts-match-${selectedRussianPart.id}`,
        text.lesson.matchTheWords,
        `${selectedRussianPart.russian} -> ${translation(part)}`,
        `${selectedRussianPart.russian} -> ${translation(selectedRussianPart)}`,
        `${selectedRussianPart.russian} = ${translation(selectedRussianPart)}`,
      );
    }

    setSelectedRussianId("");
  }

  function handleFinalTap(part: BodyPart) {
    if (finalAnswer) return;

    const question = finalQuestions[finalIndex];
    if (question.type !== "tap") return;

    answerFinal(part.id === question.partId, translation(part));
  }

  function answerFinal(isCorrect: boolean, userAnswer: string) {
    const question = finalQuestions[finalIndex];
    const targetPart = getPart(question.partId);
    setFinalAnswer({ selectedId: question.partId, isCorrect });
    setSelectedPartId(targetPart.id);

    if (isCorrect) {
      setFinalScore((score) => score + 1);
    } else {
      recordMistake(
        question.id,
        getFinalPrompt(question, targetPart, language),
        userAnswer,
        getFinalCorrectAnswer(question, targetPart, language),
        `${targetPart.russian} = ${translation(targetPart)}`,
      );
    }
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
            <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300" {...uiTextProps(language)}>
              {text.lesson.lessonComplete}
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

  const currentTapPart = getPart(tapQuestions[tapIndex]);
  const currentFinal = finalQuestions[finalIndex];
  const currentFinalPart = getPart(currentFinal.partId);

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <header className="mb-5 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl shadow-cyan-950/20 sm:rounded-3xl sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300" {...uiTextProps(language)}>
            Части тела
          </p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black sm:text-5xl" {...uiTextProps(language)}>
                {localizeLessonTitle(lesson.title, language)}
              </h1>
              <p className="mt-3 max-w-2xl text-slate-300" {...uiTextProps(language)}>
                {localizeLessonDescription(lesson.description, language)}
              </p>
            </div>
            <ModeTabs phase={phase} language={language} />
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl shadow-cyan-950/20 sm:rounded-3xl sm:p-5">
            {phase === "learn" ? (
              <PanelTitle title={text.lesson.learnTheParts} detail={text.lesson.learnModeHint} language={language} />
            ) : null}
            {phase === "tap" ? (
              <PanelTitle
                title={text.lesson.tapCorrectPart}
                detail={`${text.lesson.tapPromptPrefix}: ${translation(currentTapPart)}`}
                language={language}
              />
            ) : null}
            {phase === "match" ? (
              <PanelTitle
                title={text.lesson.matchTheWords}
                detail={`${text.lesson.matchedPairs}: ${matchedIds.length}/${matchParts.length}`}
                language={language}
              />
            ) : null}
            {phase === "final" ? (
              <PanelTitle
                title={text.lesson.finalChallenge}
                detail={`${text.lesson.question} ${finalIndex + 1}/${finalQuestions.length}: ${getFinalPrompt(currentFinal, currentFinalPart, language)}`}
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
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                <BodyMap
                  section="head"
                  title={text.lesson.headFace}
                  activePartId={selectedPartId}
                  disabledIds={[]}
                  feedbackPartId={phase === "tap" && tapAnswer ? currentTapPart.id : undefined}
                  wrongPartId={phase === "tap" && tapAnswer && !tapAnswer.isCorrect ? tapAnswer.selectedId : undefined}
                  onSelect={phase === "tap" ? handleTapSelect : phase === "final" ? handleFinalTap : handleLearnSelect}
                  language={language}
                  translate={translation}
                />
                <BodyMap
                  section="body"
                  title={text.lesson.body}
                  activePartId={selectedPartId}
                  disabledIds={[]}
                  feedbackPartId={phase === "tap" && tapAnswer ? currentTapPart.id : undefined}
                  wrongPartId={phase === "tap" && tapAnswer && !tapAnswer.isCorrect ? tapAnswer.selectedId : undefined}
                  onSelect={phase === "tap" ? handleTapSelect : phase === "final" ? handleFinalTap : handleLearnSelect}
                  language={language}
                  translate={translation}
                />
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
                <Feedback correct={tapAnswer.isCorrect} language={language} detail={`${currentTapPart.russian} = ${translation(currentTapPart)}`} />
              ) : null}
              {phase === "match" && matchFeedback ? (
                <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-bold text-cyan-100" {...uiTextProps(language)}>
                  {matchFeedback}
                </p>
              ) : null}
              {phase === "final" && finalAnswer ? (
                <Feedback correct={finalAnswer.isCorrect} language={language} detail={`${currentFinalPart.russian} = ${translation(currentFinalPart)}`} />
              ) : null}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {phase === "learn" ? (
                <button type="button" onClick={() => setPhase("tap")} className="rounded-full bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300">
                  {text.lesson.startQuiz}
                </button>
              ) : null}
              {phase === "tap" && tapAnswer ? (
                <button type="button" onClick={advanceTap} className="rounded-full bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300">
                  {tapIndex >= tapQuestions.length - 1 ? text.lesson.nextMode : text.lesson.continue}
                </button>
              ) : null}
              {phase === "match" && matchedIds.length === matchParts.length ? (
                <button type="button" onClick={() => setPhase("final")} className="rounded-full bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300">
                  {text.lesson.nextMode}
                </button>
              ) : null}
              {phase === "final" && finalAnswer ? (
                <button type="button" onClick={advanceFinal} className="rounded-full bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300">
                  {finalIndex >= finalQuestions.length - 1 ? text.lesson.finishChallenge : text.lesson.continue}
                </button>
              ) : null}
            </div>
          </section>

          <aside className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl shadow-cyan-950/20 sm:rounded-3xl sm:p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300" {...uiTextProps(language)}>
              {text.lesson.listenAndRepeat}
            </p>
            <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-3xl font-black">{selectedPart.russian}</p>
                  <p className="mt-1 text-lg font-bold text-cyan-100" {...uiTextProps(language)}>
                    {translation(selectedPart)}
                  </p>
                </div>
                <PronounceButton
                  text={selectedPart.russian}
                  ariaLabel={text.lesson.playPronunciation}
                  title={text.lesson.playPronunciation}
                  className="h-11 w-11"
                />
              </div>
              {note(selectedPart) ? (
                <p className="mt-4 rounded-xl bg-cyan-300/10 p-3 text-sm leading-6 text-cyan-50" {...uiTextProps(language)}>
                  {note(selectedPart)}
                </p>
              ) : null}
            </div>

            <div className="mt-4 grid gap-2">
              {bodyParts.map((part) => (
                <button
                  type="button"
                  key={part.id}
                  onClick={() => handleLearnSelect(part)}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
                    selectedPartId === part.id
                      ? "border-cyan-300 bg-cyan-300/15"
                      : "border-white/10 bg-slate-900/60 hover:border-cyan-300/40"
                  }`}
                >
                  <span className="font-black">{part.russian}</span>
                  <span className="text-sm text-slate-300" {...uiTextProps(language)}>{translation(part)}</span>
                </button>
              ))}
            </div>
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
  disabledIds,
  onSelect,
  language,
  translate,
}: {
  section: BodySection;
  title: string;
  activePartId: string;
  feedbackPartId?: string;
  wrongPartId?: string;
  disabledIds: string[];
  onSelect: (part: BodyPart) => void;
  language: ExplanationLanguage;
  translate: (part: BodyPart) => string;
}) {
  const parts = bodyParts.filter((part) => part.section === section);

  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <h2 className="text-lg font-black" {...uiTextProps(language)}>{title}</h2>
      <div className="relative mt-4 aspect-[4/5] overflow-hidden rounded-2xl border border-cyan-300/15 bg-[#F8FBFF] text-[#11203B]">
        <BodySvg section={section} />
        {parts.map((part) => {
          const isActive = part.id === activePartId;
          const isCorrect = part.id === feedbackPartId;
          const isWrong = part.id === wrongPartId;
          const label = `${part.russian}, ${translate(part)}`;

          return (
            <button
              type="button"
              key={part.id}
              onClick={() => onSelect(part)}
              disabled={disabledIds.includes(part.id)}
              aria-label={label}
              className={`absolute z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-xs font-black shadow-lg transition focus:outline-none focus:ring-2 focus:ring-[#11203B] ${
                isCorrect
                  ? "border-emerald-600 bg-emerald-300 text-emerald-950"
                  : isWrong
                    ? "border-red-600 bg-red-200 text-red-950"
                    : isActive
                      ? "border-[#11203B] bg-[#57D4E8] text-[#11203B]"
                      : "border-[#14B8A6] bg-white text-[#11203B] hover:bg-[#B7E531]"
              }`}
              style={{ left: `${part.x}%`, top: `${part.y}%` }}
            >
              {part.russian.slice(0, 1)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BodySvg({ section }: { section: BodySection }) {
  if (section === "head") {
    return (
      <svg aria-hidden="true" viewBox="0 0 240 300" className="absolute inset-0 h-full w-full">
        <rect width="240" height="300" fill="#F8FBFF" />
        <path d="M78 88c-9-34 14-62 43-62s52 28 42 62c18 7 19 41 0 50-7 42-28 70-42 70s-36-28-43-70c-19-9-18-43 0-50Z" fill="#F5C7A9" stroke="#11203B" strokeWidth="5" />
        <path d="M75 88c5-43 32-66 69-55 20 7 31 26 24 56-25-16-62-22-93-1Z" fill="#11203B" />
        <circle cx="104" cy="105" r="5" fill="#11203B" />
        <circle cx="139" cy="105" r="5" fill="#11203B" />
        <path d="M121 112c-3 14-8 23-1 28 5 3 13 0 16-3" fill="none" stroke="#11203B" strokeWidth="4" strokeLinecap="round" />
        <path d="M104 158c12 9 25 9 38 0" fill="none" stroke="#E25B5B" strokeWidth="5" strokeLinecap="round" />
        <path d="M96 229h51l11 47H85l11-47Z" fill="#14B8A6" stroke="#11203B" strokeWidth="5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 240 300" className="absolute inset-0 h-full w-full">
      <rect width="240" height="300" fill="#F8FBFF" />
      <path d="M97 25h46v34H97z" fill="#F5C7A9" stroke="#11203B" strokeWidth="5" />
      <path d="M74 57h92c16 0 29 13 29 29v92H45V86c0-16 13-29 29-29Z" fill="#57D4E8" stroke="#11203B" strokeWidth="5" />
      <path d="M45 88 18 171c-5 15 5 31 21 33l31-95" fill="#F5C7A9" stroke="#11203B" strokeWidth="5" strokeLinejoin="round" />
      <path d="M195 88 222 171c5 15-5 31-21 33l-31-95" fill="#F5C7A9" stroke="#11203B" strokeWidth="5" strokeLinejoin="round" />
      <path d="M83 178h74l20 99h-44l-13-66-13 66H63l20-99Z" fill="#14B8A6" stroke="#11203B" strokeWidth="5" strokeLinejoin="round" />
      <path d="M87 99c20 18 48 18 68 0" fill="none" stroke="#11203B" strokeWidth="4" strokeLinecap="round" />
      <path d="M120 67v108" fill="none" stroke="#11203B" strokeWidth="4" strokeLinecap="round" opacity=".35" />
    </svg>
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
  const text = getUiText(language);
  const parts = matchParts.map(getPart);

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <div className="grid gap-2">
        {parts.map((part) => (
          <button
            type="button"
            key={part.id}
            onClick={() => onSelectRussian(part.id)}
            disabled={matchedIds.includes(part.id)}
            className={`rounded-2xl border p-3 text-left font-black transition focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
              matchedIds.includes(part.id)
                ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-100"
                : selectedRussianId === part.id
                  ? "border-cyan-300 bg-cyan-300/20"
                  : "border-white/10 bg-slate-900/80 hover:border-cyan-300/40"
            }`}
          >
            {part.russian}
          </button>
        ))}
      </div>
      <div className="grid gap-2">
        {parts.map((part) => (
          <button
            type="button"
            key={part.id}
            onClick={() => onSelectMeaning(part)}
            disabled={matchedIds.includes(part.id)}
            className={`rounded-2xl border p-3 text-left font-bold transition focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
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
      <p className="lg:col-span-2 text-sm text-slate-400" {...uiTextProps(language)}>
        {text.lesson.selectedPair}: {selectedRussianId ? getPart(selectedRussianId).russian : "..."}
      </p>
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
  question: Extract<FinalQuestion, { type: "translation" | "russian" }>;
  targetPart: BodyPart;
  finalAnswer: TapAnswer | null;
  onAnswer: (isCorrect: boolean, userAnswer: string) => void;
  language: ExplanationLanguage;
  translate: (part: BodyPart) => string;
}) {
  const correctAnswer = question.type === "translation" ? targetPart.english : targetPart.russian;
  const options = question.type === "translation" && language === "ar"
    ? question.options.map((option) => translate(bodyParts.find((part) => part.english === option) ?? targetPart))
    : question.options;
  const localizedCorrect = question.type === "translation" && language === "ar" ? translate(targetPart) : correctAnswer;

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const isCorrect = option === localizedCorrect;
        const selected = finalAnswer && (option === localizedCorrect || !finalAnswer.isCorrect);

        return (
          <button
            type="button"
            key={option}
            disabled={Boolean(finalAnswer)}
            onClick={() => onAnswer(isCorrect, option)}
            className={`rounded-2xl border p-4 text-left font-black transition focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
              finalAnswer && isCorrect
                ? "border-emerald-300 bg-emerald-300/20"
                : selected && !isCorrect
                  ? "border-red-300 bg-red-300/20"
                  : "border-white/10 bg-slate-900/80 hover:border-cyan-300/40"
            }`}
            {...(question.type === "translation" ? uiTextProps(language) : {})}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function ModeTabs({ phase, language }: { phase: LessonPhase; language: ExplanationLanguage }) {
  const text = getUiText(language);
  const modes: { id: LessonPhase; label: string }[] = [
    { id: "learn", label: text.lesson.learnTheParts },
    { id: "tap", label: text.lesson.tapCorrectPart },
    { id: "match", label: text.lesson.matchTheWords },
    { id: "final", label: text.lesson.finalChallenge },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {modes.map((mode) => (
        <span
          key={mode.id}
          className={`rounded-full px-3 py-2 text-center text-xs font-black ${
            phase === mode.id ? "bg-lime-300 text-slate-950" : "bg-slate-900/80 text-slate-300"
          }`}
          {...uiTextProps(language)}
        >
          {mode.label}
        </span>
      ))}
    </div>
  );
}

function PanelTitle({ title, detail, language }: { title: string; detail: string; language: ExplanationLanguage }) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-black" {...uiTextProps(language)}>{title}</h2>
      <p className="mt-2 text-slate-300" {...uiTextProps(language)}>{detail}</p>
    </div>
  );
}

function Feedback({ correct, detail, language }: { correct: boolean; detail: string; language: ExplanationLanguage }) {
  const text = getUiText(language);

  return (
    <div className={`rounded-2xl border p-4 ${correct ? "border-emerald-300/40 bg-emerald-300/15" : "border-red-300/40 bg-red-300/15"}`} role="status">
      <p className="font-black" {...uiTextProps(language)}>
        {correct ? text.lesson.youFoundIt : text.lesson.tryAnotherPart}
      </p>
      <p className="mt-1 text-sm text-slate-200">{detail}</p>
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

function getFinalPrompt(question: FinalQuestion, part: BodyPart, language: ExplanationLanguage) {
  const text = getUiText(language);
  const localizedMeaning = language === "ar" ? part.arabic : part.english;

  if (question.type === "tap") {
    return `${text.lesson.tapPromptPrefix}: ${localizedMeaning}`;
  }

  if (question.type === "translation") {
    return `${text.lesson.chooseTranslation}: ${part.russian}`;
  }

  return `${text.lesson.chooseRussianWord}: ${localizedMeaning}`;
}

function getFinalCorrectAnswer(question: FinalQuestion, part: BodyPart, language: ExplanationLanguage) {
  if (question.type === "translation") {
    return language === "ar" ? part.arabic : part.english;
  }

  if (question.type === "russian") {
    return part.russian;
  }

  return language === "ar" ? part.arabic : part.english;
}
