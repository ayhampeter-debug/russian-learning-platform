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
import { useMemo, useState } from "react";

type BodySection = "face" | "body" | "back";
type LessonStage = "face" | "body" | "back" | "tap" | "listen" | "match" | "final" | "complete";
type ChoiceQuestion = { id: string; type: "meaning" | "russian" | "listen"; partId: string; options: string[] };
type FinalQuestion = { id: string; type: "tap"; partId: string } | ChoiceQuestion;

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

const SHOW_HOTSPOT_DEBUG = false;

type AnswerState = {
  selectedId: string;
  isCorrect: boolean;
};

const bodyParts: BodyPart[] = [
  { id: "head", section: "face", russian: "голова", english: "head", arabic: "الرأس", marker: 1, x: 50, y: 31, highlight: "left-[28%] top-[14%] h-[42%] w-[44%] rounded-[45%]" },
  { id: "hair", section: "face", russian: "волосы", english: "hair", arabic: "الشعر", marker: 2, x: 50, y: 13, highlight: "left-[30%] top-[9%] h-[20%] w-[42%] rounded-t-full" },
  { id: "eye", section: "face", russian: "глаз", english: "eye", arabic: "العين", marker: 3, x: 35, y: 47, highlight: "left-[34%] top-[33%] h-[10%] w-[15%] rounded-full" },
  { id: "nose", section: "face", russian: "нос", english: "nose", arabic: "الأنف", marker: 4, x: 50, y: 57, highlight: "left-[45%] top-[39%] h-[16%] w-[12%] rounded-full" },
  { id: "mouth", section: "face", russian: "рот", english: "mouth", arabic: "الفم", marker: 5, x: 50, y: 67, highlight: "left-[39%] top-[53%] h-[10%] w-[23%] rounded-full" },
  { id: "ear", section: "face", russian: "ухо", english: "ear", arabic: "الأذن", marker: 6, x: 86, y: 52, highlight: "left-[70%] top-[31%] h-[20%] w-[12%] rounded-full" },
  { id: "neck", section: "body", russian: "шея", english: "neck", arabic: "الرقبة", marker: 7, x: 50, y: 29, highlight: "left-[41%] top-[7%] h-[16%] w-[18%] rounded-lg" },
  { id: "shoulder", section: "body", russian: "плечо", english: "shoulder", arabic: "الكتف", marker: 8, x: 25, y: 36, highlight: "left-[24%] top-[22%] h-[17%] w-[24%] rounded-full" },
  {
    id: "arm",
    section: "body",
    russian: "рука",
    english: "arm/hand",
    arabic: "الذراع / اليد",
    marker: 9,
    x: 18,
    y: 57,
    highlight: "left-[8%] top-[31%] h-[42%] w-[18%] rounded-full -rotate-12",
    note: {
      en: "рука can mean arm or hand depending on context.",
      ar: "كلمة рука قد تعني الذراع أو اليد حسب السياق.",
    },
  },
  { id: "stomach", section: "body", russian: "живот", english: "stomach/belly", arabic: "البطن", marker: 10, x: 50, y: 47, highlight: "left-[37%] top-[39%] h-[25%] w-[27%] rounded-full" },
  {
    id: "leg",
    section: "body",
    russian: "нога",
    english: "leg/foot",
    arabic: "الساق / القدم",
    marker: 11,
    x: 63,
    y: 90,
    highlight: "left-[29%] top-[60%] h-[34%] w-[23%] rounded-full rotate-3",
    note: {
      en: "нога can mean leg or foot depending on context.",
      ar: "كلمة нога قد تعني الساق أو القدم حسب السياق.",
    },
  },
  {
    id: "back",
    section: "back",
    russian: "спина",
    english: "back",
    arabic: "الظهر",
    marker: 12,
    x: 50,
    y: 38,
    highlight: "left-[29%] top-[32%] h-[38%] w-[43%] rounded-[40%]",
    note: {
      en: "спина means back.",
      ar: "كلمة спина تعني الظهر.",
    },
  },
];

const learningSections: Record<"face" | "body" | "back", string[]> = {
  face: ["head", "hair", "eye", "nose", "mouth", "ear"],
  body: ["neck", "shoulder", "arm", "stomach", "leg"],
  back: ["back"],
};

const tapQuestions = ["nose", "eye", "mouth", "shoulder", "stomach", "leg", "back"];
const listenQuestions = ["ear", "hair", "neck", "arm", "back"];
const matchParts = ["head", "hair", "eye", "nose", "mouth", "ear", "neck", "shoulder", "arm", "stomach", "leg", "back"];
const finalQuestions: FinalQuestion[] = [
  { id: "final-tap-ear", type: "tap", partId: "ear" },
  { id: "final-meaning-ruka", type: "meaning", partId: "arm", options: ["arm/hand", "neck", "back", "hair"] },
  { id: "final-meaning-head", type: "meaning", partId: "head", options: ["head", "leg/foot", "mouth", "ear"] },
  { id: "final-listen-mouth", type: "listen", partId: "mouth", options: ["mouth", "nose", "eye", "ear"] },
  { id: "final-tap-neck", type: "tap", partId: "neck" },
  { id: "final-meaning-spina", type: "meaning", partId: "back", options: ["eye", "back", "shoulder", "mouth"] },
  { id: "final-listen-leg", type: "listen", partId: "leg", options: ["leg/foot", "arm/hand", "stomach/belly", "shoulder"] },
];

const stageOrder: LessonStage[] = ["face", "body", "back", "tap", "listen", "match", "final"];

const bodySectionImages: Record<BodySection, { src: string; alt: string; width: number; height: number }> = {
  face: { src: "/lessons/body-parts/head-face.png", alt: "Head and face character illustration", width: 757, height: 972 },
  body: { src: "/lessons/body-parts/front-body.png", alt: "Front body character illustration", width: 436, height: 1342 },
  back: { src: "/lessons/body-parts/back-body.png", alt: "Back body character illustration", width: 449, height: 1304 },
};

const bodyPartVisuals: Record<string, Pick<BodyPart, "x" | "y" | "highlight">> = {
  head: { x: 50, y: 31, highlight: "" },
  hair: { x: 50, y: 13, highlight: "" },
  eye: { x: 35, y: 47, highlight: "" },
  nose: { x: 50, y: 57, highlight: "" },
  mouth: { x: 50, y: 67, highlight: "" },
  ear: { x: 86, y: 52, highlight: "" },
  neck: { x: 50, y: 29, highlight: "" },
  shoulder: { x: 25, y: 36, highlight: "" },
  arm: { x: 18, y: 57, highlight: "" },
  stomach: { x: 50, y: 47, highlight: "" },
  leg: { x: 63, y: 90, highlight: "" },
  back: { x: 50, y: 38, highlight: "" },
};

export function BodyPartsGame({ lesson }: { lesson: Lesson }) {
  const { language } = useExplanationLanguage();
  const text = getUiText(language);
  const copy = bodyCopy(language);
  const progressState = useProgress();
  const [stage, setStage] = useState<LessonStage>("face");
  const [selectedPartId, setSelectedPartId] = useState("head");
  const [visitedPartIds, setVisitedPartIds] = useState<string[]>(["head"]);
  const [tapIndex, setTapIndex] = useState(0);
  const [tapAnswer, setTapAnswer] = useState<AnswerState | null>(null);
  const [listenIndex, setListenIndex] = useState(0);
  const [listenAnswer, setListenAnswer] = useState<AnswerState | null>(null);
  const [selectedRussianId, setSelectedRussianId] = useState("");
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [matchFeedback, setMatchFeedback] = useState<AnswerState | null>(null);
  const [finalIndex, setFinalIndex] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [finalAnswer, setFinalAnswer] = useState<AnswerState | null>(null);
  const [completionProgress, setCompletionProgress] = useState<SavedProgress | null>(null);

  const activeProgress = completionProgress ?? progressState;
  const selectedPart = getPart(selectedPartId);
  const currentTapPart = getPart(tapQuestions[tapIndex]);
  const currentListenPart = getPart(listenQuestions[listenIndex]);
  const currentFinal = finalQuestions[finalIndex];
  const currentFinalPart = getPart(currentFinal.partId);
  const lessonProgress = getStageProgress(stage, tapIndex, listenIndex, matchedIds.length, finalIndex);
  const matchOptionParts = useMemo(() => getStableDerangedParts(matchParts.map(getPart), "body-parts-match-meanings"), []);
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

  function changeStage(nextStage: LessonStage) {
    if (nextStage === "complete") return;

    const firstPart = getFirstPartForStage(nextStage);
    if (firstPart) selectPart(firstPart);
    setStage(nextStage);
    setTapAnswer(null);
    setListenAnswer(null);
    setFinalAnswer(null);
    setMatchFeedback(null);
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

    const isCorrect = part.id === currentTapPart.id;
    setTapAnswer({ selectedId: part.id, isCorrect });
    selectPart(currentTapPart);

    if (!isCorrect) {
      recordMistake(
        `body-parts-tap-${currentTapPart.id}`,
        `${copy.tapCorrectPart}: ${currentTapPart.russian}`,
        translation(part),
        translation(currentTapPart),
        `${currentTapPart.russian} = ${translation(currentTapPart)}`,
      );
    }
  }

  function advanceTap() {
    if (tapIndex >= tapQuestions.length - 1) {
      changeStage("listen");
      return;
    }

    const nextPart = getPart(tapQuestions[tapIndex + 1]);
    setTapIndex((current) => current + 1);
    setTapAnswer(null);
    selectPart(nextPart);
  }

  function answerListen(part: BodyPart) {
    if (listenAnswer) return;

    const isCorrect = part.id === currentListenPart.id;
    setListenAnswer({ selectedId: part.id, isCorrect });
    selectPart(currentListenPart);

    if (!isCorrect) {
      recordMistake(
        `body-parts-listen-${currentListenPart.id}`,
        `${copy.listenAndChoose}: ${currentListenPart.russian}`,
        translation(part),
        translation(currentListenPart),
        `${currentListenPart.russian} = ${translation(currentListenPart)}`,
      );
    }
  }

  function advanceListen() {
    if (listenIndex >= listenQuestions.length - 1) {
      changeStage("match");
      return;
    }

    const nextPart = getPart(listenQuestions[listenIndex + 1]);
    setListenIndex((current) => current + 1);
    setListenAnswer(null);
    selectPart(nextPart);
  }

  function handleMatchMeaning(part: BodyPart) {
    if (!selectedRussianId || matchedIds.includes(part.id)) return;

    const russianPart = getPart(selectedRussianId);
    const isCorrect = russianPart.id === part.id;
    setMatchFeedback({ selectedId: russianPart.id, isCorrect });

    if (isCorrect) {
      setMatchedIds((current) => (current.includes(part.id) ? current : [...current, part.id]));
    } else {
      recordMistake(
        `body-parts-match-${russianPart.id}`,
        copy.matchTheWords,
        `${russianPart.russian} -> ${translation(part)}`,
        `${russianPart.russian} -> ${translation(russianPart)}`,
        `${russianPart.russian} = ${translation(russianPart)}`,
      );
    }

    setSelectedRussianId("");
  }

  function handleFinalTap(part: BodyPart) {
    if (finalAnswer || currentFinal.type !== "tap") return;
    answerFinal(part.id === currentFinal.partId, part.id);
  }

  function answerFinal(isCorrect: boolean, userAnswer: string) {
    if (finalAnswer) return;

    setFinalAnswer({ selectedId: userAnswer, isCorrect });
    selectPart(currentFinalPart);

    if (isCorrect) {
      setFinalScore((score) => score + 1);
      return;
    }

    recordMistake(
      currentFinal.id,
      getFinalPrompt(currentFinal, currentFinalPart, language),
      currentFinal.type === "tap" ? translation(getPart(userAnswer)) : userAnswer,
      getFinalCorrectAnswer(currentFinal, currentFinalPart, translation),
      `${currentFinalPart.russian} = ${translation(currentFinalPart)}`,
    );
  }

  function advanceFinal() {
    if (finalIndex >= finalQuestions.length - 1) {
      const nextProgress = completeLesson(lesson.id, lesson.xpReward);
      setCompletionProgress(nextProgress);
      setStage("complete");
      return;
    }

    const nextQuestion = finalQuestions[finalIndex + 1];
    setFinalIndex((current) => current + 1);
    setFinalAnswer(null);
    selectPart(getPart(nextQuestion.partId));
  }

  if (stage === "complete") {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navigation />
        <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl items-center px-4 pb-8 sm:px-6">
          <div className="w-full rounded-2xl border border-white/10 bg-white/10 p-5 text-center shadow-2xl shadow-cyan-950/30 sm:rounded-3xl sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300" {...uiTextProps(language)}>
              {copy.lessonComplete}
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-5xl" {...uiTextProps(language)}>
              {localizeLessonTitle(lesson.title, language)}
            </h1>
            <p className="mt-3 text-lg font-bold text-lime-100" {...uiTextProps(language)}>
              {copy.greatJob}
            </p>
            <div className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
              <ResultPill label={text.lesson.xpEarned} value={`${lesson.xpReward} XP`} />
              <ResultPill label={text.lesson.score} value={`${finalScore}/${finalQuestions.length}`} />
              <ResultPill label={text.lesson.accuracy} value={`${Math.round((finalScore / finalQuestions.length) * 100)}%`} />
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link href={nextAction.href} className="rounded-full bg-cyan-400 px-5 py-4 font-black text-slate-950 transition hover:bg-cyan-300">
                {localizeActionLabel(nextAction.label, language)}
              </Link>
              <Link href="/worlds" className="rounded-full border border-white/10 bg-white/10 px-5 py-4 font-black text-white transition hover:bg-white/15">
                {text.lesson.backToWorlds}
              </Link>
              <Link href="/practice" className="rounded-full border border-yellow-200 bg-yellow-300 px-5 py-4 font-black text-slate-950 transition hover:bg-yellow-200">
                {text.lesson.practice}
              </Link>
              <Link href="/writing" className="rounded-full border border-cyan-200 bg-cyan-300 px-5 py-4 font-black text-slate-950 transition hover:bg-cyan-200">
                {text.writing.title}
              </Link>
            </div>
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
            <span>{getStageLabel(stage, language)}</span>
            <span>{Math.round(lessonProgress)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${lessonProgress}%` }} />
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <header className="py-5">
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
            <StageStepper stage={stage} language={language} />
          </div>
        </header>

        {stage === "face" || stage === "body" || stage === "back" ? (
          <LearningStage
            section={stage}
            selectedPart={selectedPart}
            visitedCount={learningSections[stage].filter((id) => visitedPartIds.includes(id)).length}
            total={learningSections[stage].length}
            language={language}
            translate={translation}
            note={note(selectedPart)}
            onSelect={selectPart}
            onContinue={() => changeStage(stage === "face" ? "body" : stage === "body" ? "back" : "tap")}
          />
        ) : null}

        {stage === "tap" ? (
          <TapPractice
            part={currentTapPart}
            answer={tapAnswer}
            language={language}
            translate={translation}
            onSelect={handleTapSelect}
            onContinue={advanceTap}
          />
        ) : null}

        {stage === "listen" ? (
          <ListenPractice
            part={currentListenPart}
            answer={listenAnswer}
            language={language}
            translate={translation}
            onAnswer={answerListen}
            onContinue={advanceListen}
          />
        ) : null}

        {stage === "match" ? (
          <MatchPractice
            selectedRussianId={selectedRussianId}
            matchedIds={matchedIds}
            feedback={matchFeedback}
            optionParts={matchOptionParts}
            language={language}
            translate={translation}
            onSelectRussian={setSelectedRussianId}
            onSelectMeaning={handleMatchMeaning}
            onContinue={() => changeStage("final")}
          />
        ) : null}

        {stage === "final" ? (
          <FinalPractice
            question={currentFinal}
            targetPart={currentFinalPart}
            index={finalIndex}
            total={finalQuestions.length}
            score={finalScore}
            answer={finalAnswer}
            language={language}
            translate={translation}
            onTap={handleFinalTap}
            onAnswer={answerFinal}
            onContinue={advanceFinal}
          />
        ) : null}
      </section>
    </main>
  );
}

function LearningStage({
  section,
  selectedPart,
  visitedCount,
  total,
  language,
  translate,
  note,
  onSelect,
  onContinue,
}: {
  section: BodySection;
  selectedPart: BodyPart;
  visitedCount: number;
  total: number;
  language: ExplanationLanguage;
  translate: (part: BodyPart) => string;
  note?: string;
  onSelect: (part: BodyPart) => void;
  onContinue: () => void;
}) {
  const copy = bodyCopy(language);
  const continueLabel = section === "face" ? copy.continueToBody : section === "body" ? copy.continueToBack : copy.startPractice;

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.08] p-4 shadow-xl shadow-cyan-950/20 sm:rounded-3xl sm:p-5">
        <PanelTitle title={getSectionTitle(section, language)} detail={`${copy.tapBodyPart} ${visitedCount}/${total}`} language={language} />
        <BodyMap section={section} activePartId={selectedPart.id} onSelect={onSelect} language={language} translate={translate} />
        <div className="mt-4 lg:hidden">
          <SelectedPartCard part={selectedPart} language={language} translate={translate} note={note} />
        </div>
      </div>
      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div className="hidden lg:block">
          <SelectedPartCard part={selectedPart} language={language} translate={translate} note={note} />
        </div>
        <button type="button" onClick={onContinue} className="mt-4 min-h-12 w-full rounded-full bg-cyan-400 px-6 py-3 font-black text-slate-950 shadow-lg shadow-cyan-950/20 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950" {...uiTextProps(language)}>
          {continueLabel}
        </button>
      </aside>
    </section>
  );
}

function TapPractice({
  part,
  answer,
  language,
  translate,
  onSelect,
  onContinue,
}: {
  part: BodyPart;
  answer: AnswerState | null;
  language: ExplanationLanguage;
  translate: (part: BodyPart) => string;
  onSelect: (part: BodyPart) => void;
  onContinue: () => void;
}) {
  const copy = bodyCopy(language);

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.08] p-4 shadow-xl shadow-cyan-950/20 sm:rounded-3xl sm:p-5">
        <RussianPrompt title={copy.tapCorrectPart} part={part} helper={copy.findRussianWordHelper} language={language} />
        {answer ? <Feedback correct={answer.isCorrect} part={part} language={language} translate={translate} onContinue={onContinue} /> : null}
        <div className="mt-4">
          <BodyMap
            section={part.section}
            activePartId={part.id}
            feedbackPartId={answer ? part.id : undefined}
            wrongPartId={answer && !answer.isCorrect ? answer.selectedId : undefined}
            onSelect={onSelect}
            language={language}
            translate={translate}
          />
        </div>
      </div>
      <aside className="hidden min-w-0 lg:block lg:sticky lg:top-24 lg:self-start">
        <SelectedPartCard part={part} language={language} translate={translate} note={part.note?.[language]} />
      </aside>
    </section>
  );
}

function ListenPractice({
  part,
  answer,
  language,
  translate,
  onAnswer,
  onContinue,
}: {
  part: BodyPart;
  answer: AnswerState | null;
  language: ExplanationLanguage;
  translate: (part: BodyPart) => string;
  onAnswer: (part: BodyPart) => void;
  onContinue: () => void;
}) {
  const copy = bodyCopy(language);
  const options = getListenOptions(part);

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.08] p-4 shadow-xl shadow-cyan-950/20 sm:rounded-3xl sm:p-5">
      <RussianPrompt title={copy.listenAndChoose} part={part} helper={copy.listenRussianWordHelper} language={language} centered />
      {answer ? <div className="mt-4"><Feedback correct={answer.isCorrect} part={part} language={language} translate={translate} onContinue={onContinue} /></div> : null}
      <ChoiceGrid options={options} answer={answer} targetPart={part} language={language} translate={translate} onAnswer={onAnswer} />
    </section>
  );
}

function MatchPractice({
  selectedRussianId,
  matchedIds,
  feedback,
  optionParts,
  language,
  translate,
  onSelectRussian,
  onSelectMeaning,
  onContinue,
}: {
  selectedRussianId: string;
  matchedIds: string[];
  feedback: AnswerState | null;
  optionParts: BodyPart[];
  language: ExplanationLanguage;
  translate: (part: BodyPart) => string;
  onSelectRussian: (id: string) => void;
  onSelectMeaning: (part: BodyPart) => void;
  onContinue: () => void;
}) {
  const text = getUiText(language);
  const copy = bodyCopy(language);
  const parts = matchParts.map(getPart);
  const feedbackPart = feedback ? getPart(feedback.selectedId) : null;

  return (
    <section className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/[0.08] p-4 shadow-xl shadow-cyan-950/20 sm:rounded-3xl sm:p-5">
      <QuestionHeader title={copy.matchTheWords} detail={`${text.lesson.matchedPairs}: ${matchedIds.length}/${parts.length}`} language={language} />
      {feedback && feedbackPart ? (
        <div className="mb-4">
          <Feedback correct={feedback.isCorrect} part={feedbackPart} language={language} translate={translate} />
        </div>
      ) : null}
      <div className="mb-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm font-bold text-cyan-50" {...uiTextProps(language)}>
        {text.lesson.selectedPair}:{" "}
        {selectedRussianId ? (
          <span dir="ltr" lang="ru" className="text-base font-black text-white">
            {getPart(selectedRussianId).russian}
          </span>
        ) : (
          copy.matchTheWords
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <p className="px-1 text-xs font-black uppercase tracking-[0.18em] text-slate-400" {...uiTextProps(language)}>{text.lesson.russian}</p>
          {parts.map((part) => (
            <div key={part.id} className={`grid min-h-12 grid-cols-[1fr_auto] items-center gap-2 rounded-2xl border p-3 transition ${
              matchedIds.includes(part.id)
                ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-50"
                : selectedRussianId === part.id
                  ? "border-cyan-200 bg-cyan-100 text-slate-950"
                  : "border-white/10 bg-slate-900/80 text-white hover:border-cyan-300/40"
            }`}>
              <button type="button" onClick={() => onSelectRussian(part.id)} disabled={matchedIds.includes(part.id)} className="min-w-0 rounded-xl text-left text-xl font-black focus:outline-none focus:ring-2 focus:ring-cyan-300" dir="ltr" lang="ru">
                {part.russian}
              </button>
              <PronounceButton text={part.russian} className="h-9 w-9" disabled={matchedIds.includes(part.id)} />
            </div>
          ))}
        </div>
        <div className="grid gap-2">
          <p className="px-1 text-xs font-black uppercase tracking-[0.18em] text-slate-400" {...uiTextProps(language)}>{text.lesson.chooseTranslation}</p>
          {optionParts.map((part) => (
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
      {matchedIds.length === parts.length ? (
        <button type="button" onClick={onContinue} className="mt-5 min-h-12 w-full rounded-full bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300" {...uiTextProps(language)}>
          {copy.continue}
        </button>
      ) : null}
    </section>
  );
}

function FinalPractice({
  question,
  targetPart,
  index,
  total,
  score,
  answer,
  language,
  translate,
  onTap,
  onAnswer,
  onContinue,
}: {
  question: FinalQuestion;
  targetPart: BodyPart;
  index: number;
  total: number;
  score: number;
  answer: AnswerState | null;
  language: ExplanationLanguage;
  translate: (part: BodyPart) => string;
  onTap: (part: BodyPart) => void;
  onAnswer: (isCorrect: boolean, userAnswer: string) => void;
  onContinue: () => void;
}) {
  const copy = bodyCopy(language);
  const text = getUiText(language);

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.08] p-4 shadow-xl shadow-cyan-950/20 sm:rounded-3xl sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full border border-lime-300/30 bg-lime-300/10 px-3 py-1 text-xs font-black text-lime-100" {...uiTextProps(language)}>
            {copy.question} {index + 1}/{total}
          </span>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-slate-200" {...uiTextProps(language)}>
            {text.lesson.score}: {score}/{total}
          </span>
        </div>
        <RussianPrompt
          title={getFinalPromptTitle(question, language)}
          part={targetPart}
          helper={getFinalPromptHelper(question, language)}
          language={language}
        />
        {answer ? <Feedback correct={answer.isCorrect} part={targetPart} language={language} translate={translate} onContinue={onContinue} /> : null}
        {question.type === "tap" ? (
          <div className="mt-4">
            <BodyMap
              section={targetPart.section}
              activePartId={targetPart.id}
              feedbackPartId={answer ? targetPart.id : undefined}
              wrongPartId={answer && !answer.isCorrect ? answer.selectedId : undefined}
              onSelect={onTap}
              language={language}
              translate={translate}
            />
          </div>
        ) : (
          <ChoiceChallenge question={question} targetPart={targetPart} answer={answer} language={language} translate={translate} onAnswer={onAnswer} />
        )}
      </div>
      {answer ? (
        <aside className="hidden min-w-0 lg:block lg:sticky lg:top-24 lg:self-start">
          <SelectedPartCard part={targetPart} language={language} translate={translate} note={targetPart.note?.[language]} />
        </aside>
      ) : null}
    </section>
  );
}

function BodyMap({
  section,
  activePartId,
  feedbackPartId,
  wrongPartId,
  onSelect,
  language,
  translate,
}: {
  section: BodySection;
  activePartId: string;
  feedbackPartId?: string;
  wrongPartId?: string;
  onSelect: (part: BodyPart) => void;
  language: ExplanationLanguage;
  translate: (part: BodyPart) => string;
}) {
  const parts = bodyParts.filter((part) => part.section === section);
  const image = bodySectionImages[section];
  const highlightedPart = parts.find((part) => part.id === (feedbackPartId ?? activePartId));
  const wrongPart = parts.find((part) => part.id === wrongPartId);
  const imageRatio = image.width / image.height;

  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-white sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-black sm:text-lg" {...uiTextProps(language)}>{getSectionTitle(section, language)}</h2>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[0.65rem] font-black uppercase tracking-wider text-cyan-100" {...uiTextProps(language)}>
          {section === "body" ? getUiText(language).lesson.frontView : getSectionTitle(section, language)}
        </span>
      </div>
      <div className="mt-3 flex min-h-[20rem] items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/20 bg-white p-2 shadow-[inset_0_0_0_1px_rgba(17,32,59,0.05)] sm:min-h-[22rem] sm:p-3">
        <div
          className="relative mx-auto w-full text-[#11203B]"
          style={{
            aspectRatio: `${image.width} / ${image.height}`,
            maxWidth: `min(100%, ${(imageRatio * 31).toFixed(2)}rem, ${(imageRatio * 62).toFixed(2)}vh)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt}
            className="absolute inset-0 h-full w-full select-none object-contain"
            draggable={false}
          />
          <div className="absolute inset-0">
            {highlightedPart ? <BodyRegionHighlight part={highlightedPart} tone={feedbackPartId ? "correct" : "active"} /> : null}
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
                  className="group absolute z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-[13px] font-black transition focus:outline-none focus:ring-2 focus:ring-[#11203B]/35"
                  style={{ left: `${visual.x}%`, top: `${visual.y}%` }}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-[13px] font-black leading-none shadow-sm shadow-slate-900/15 transition ${
                      isCorrect
                        ? "border-emerald-800 bg-emerald-200 text-emerald-950 ring-1 ring-emerald-300/70"
                        : isWrong
                          ? "border-red-800 bg-red-200 text-red-950 ring-1 ring-red-300/70"
                          : isActive
                            ? "border-[#11203B] bg-[#B7E531] text-[#11203B] ring-2 ring-[#57D4E8]/45"
                            : "border-[#0F766E] bg-white/95 text-[#11203B] group-hover:bg-[#57D4E8]"
                    }`}
                  >
                    {isCorrect ? "OK" : isWrong ? "!" : part.marker}
                  </span>
                  {SHOW_HOTSPOT_DEBUG ? (
                    <>
                      <span className="pointer-events-none absolute left-1/2 top-0 h-11 w-px -translate-x-1/2 bg-fuchsia-500/80" />
                      <span className="pointer-events-none absolute left-0 top-1/2 h-px w-11 -translate-y-1/2 bg-fuchsia-500/80" />
                      <span className="pointer-events-none absolute left-8 top-7 rounded bg-slate-950/85 px-1 py-0.5 text-[10px] font-bold text-white">
                        {visual.x},{visual.y}
                      </span>
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
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
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 text-[var(--app-text)] shadow-xl shadow-cyan-950/30 ring-1 ring-white/10">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--app-primary-strong)]" {...uiTextProps(language)}>
        {copy.listenAndRepeat}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-3xl font-black leading-tight text-[var(--app-text)] drop-shadow-sm sm:text-4xl" dir="ltr" lang="ru">{part.russian}</p>
          <p className="mt-1 text-base font-bold text-[var(--app-text-soft)] sm:text-lg" {...uiTextProps(language)}>
            {translate(part)}
          </p>
        </div>
        <PronounceButton text={part.russian} ariaLabel={copy.playPronunciation} title={copy.playPronunciation} className="h-14 w-14 border-[var(--primary)] bg-[var(--app-primary-soft)] text-[var(--app-text)] shadow-lg shadow-cyan-950/20 hover:bg-cyan-300/20" />
      </div>
      {note ? (
        <p className="mt-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-secondary-soft)] p-3 text-sm leading-6 text-[var(--app-text-soft)]" {...uiTextProps(language)}>
          {note}
        </p>
      ) : null}
    </div>
  );
}

function ChoiceGrid({
  options,
  answer,
  targetPart,
  language,
  translate,
  onAnswer,
}: {
  options: BodyPart[];
  answer: AnswerState | null;
  targetPart: BodyPart;
  language: ExplanationLanguage;
  translate: (part: BodyPart) => string;
  onAnswer: (part: BodyPart) => void;
}) {
  return (
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
  );
}

function ChoiceChallenge({
  question,
  targetPart,
  answer,
  language,
  translate,
  onAnswer,
}: {
  question: ChoiceQuestion;
  targetPart: BodyPart;
  answer: AnswerState | null;
  language: ExplanationLanguage;
  translate: (part: BodyPart) => string;
  onAnswer: (isCorrect: boolean, userAnswer: string) => void;
}) {
  const correctAnswer = question.type === "russian" ? targetPart.russian : translate(targetPart);
  const options = useMemo(
    () =>
      getStableShuffledValues(
        question.type === "russian" ? question.options : question.options.map((option) => translate(getPartByEnglish(option))),
        `body-parts-final-${question.id}-${language}`,
      ),
    [language, question.id, question.options, question.type, translate],
  );

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const isCorrect = option === correctAnswer;
        const selected = answer?.selectedId === option;

        return (
          <button
            type="button"
            key={option}
            disabled={Boolean(answer)}
            onClick={() => onAnswer(isCorrect, option)}
            className={`min-h-14 rounded-2xl border p-4 text-left font-black shadow-lg shadow-slate-950/10 transition focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
              answer && isCorrect
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
  );
}

function StageStepper({ stage, language }: { stage: LessonStage; language: ExplanationLanguage }) {
  const currentIndex = stageOrder.indexOf(stage);

  return (
    <ol className="flex max-w-full gap-2 overflow-x-auto pb-1">
      {stageOrder.map((step, index) => (
        <li key={step} className={`shrink-0 rounded-full px-3 py-2 text-xs font-black ${
          index === currentIndex
            ? "bg-lime-300 text-slate-950"
            : index < currentIndex
              ? "bg-cyan-300/20 text-cyan-100"
              : "bg-slate-900/80 text-slate-400"
        }`} aria-current={index === currentIndex ? "step" : undefined} {...uiTextProps(language)}>
          {getStageLabel(step, language)}
        </li>
      ))}
    </ol>
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

function QuestionHeader({ title, detail, language }: { title: string; detail: string; language: ExplanationLanguage }) {
  return (
    <div className="mb-4">
      <h2 className="break-words text-2xl font-black" {...uiTextProps(language)}>{title}</h2>
      <p className="mt-2 text-lg font-bold leading-7 text-cyan-100" {...uiTextProps(language)}>{detail}</p>
    </div>
  );
}

function RussianPrompt({
  title,
  part,
  helper,
  language,
  centered = false,
}: {
  title: string;
  part: BodyPart;
  helper: string;
  language: ExplanationLanguage;
  centered?: boolean;
}) {
  const copy = bodyCopy(language);

  return (
    <div className={`mb-4 rounded-2xl border border-cyan-300/25 bg-cyan-50 p-4 text-slate-950 shadow-lg shadow-slate-950/10 ${centered ? "text-center" : ""}`}>
      <h2 className={`break-words text-2xl font-black ${centered ? "justify-center" : ""}`} {...uiTextProps(language)}>
        {title}:{" "}
        <span dir="ltr" lang="ru" className="inline-block text-3xl text-slate-950 sm:text-4xl">
          {part.russian}
        </span>
      </h2>
      <div className={`mt-3 flex items-center gap-3 ${centered ? "justify-center" : ""}`}>
        <PronounceButton
          text={part.russian}
          ariaLabel={copy.playPronunciation}
          title={copy.playPronunciation}
          className="h-12 w-12 border-slate-300 bg-white text-slate-950 hover:border-cyan-500 hover:bg-cyan-100"
        />
        <p className="text-sm font-bold leading-6 text-slate-700" {...uiTextProps(language)}>
          {helper}
        </p>
      </div>
    </div>
  );
}

function Feedback({
  correct,
  part,
  language,
  translate,
  onContinue,
}: {
  correct: boolean;
  part: BodyPart;
  language: ExplanationLanguage;
  translate: (part: BodyPart) => string;
  onContinue?: () => void;
}) {
  const copy = bodyCopy(language);

  return (
    <div className={`rounded-2xl border p-4 ${correct ? "border-emerald-300/40 bg-emerald-300/15" : "border-red-300/40 bg-red-300/15"}`} role="status">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-black" {...uiTextProps(language)}>{correct ? copy.correct : copy.tryAgain}</p>
          <p className="mt-1 text-sm text-slate-200">
            {part.russian} = <span {...uiTextProps(language)}>{translate(part)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PronounceButton text={part.russian} className="h-11 w-11" />
          {onContinue ? (
            <button type="button" onClick={onContinue} className="min-h-11 rounded-full bg-cyan-400 px-5 font-black text-slate-950 transition hover:bg-cyan-300" {...uiTextProps(language)}>
              {copy.continue}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function BodyRegionHighlight({ part, tone }: { part: BodyPart; tone: "active" | "correct" | "wrong" }) {
  const visual = getBodyPartVisual(part);
  const toneClass = {
    active: "border-[#11203B]/75 bg-transparent ring-[#57D4E8]/35",
    correct: "border-emerald-800/80 bg-transparent ring-emerald-300/35",
    wrong: "border-red-800/80 bg-transparent ring-red-300/35",
  }[tone];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ring-2 ${toneClass}`}
      style={{ left: `${visual.x}%`, top: `${visual.y}%` }}
    />
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

function getPartByEnglish(english: string) {
  const part = bodyParts.find((candidate) => candidate.english === english);

  if (!part) {
    throw new Error(`Unknown body part meaning: ${english}`);
  }

  return part;
}

function getBodyPartVisual(part: BodyPart) {
  return bodyPartVisuals[part.id] ?? part;
}

function getFirstPartForStage(stage: LessonStage) {
  if (stage === "face" || stage === "body" || stage === "back") return getPart(learningSections[stage][0]);
  if (stage === "tap") return getPart(tapQuestions[0]);
  if (stage === "listen") return getPart(listenQuestions[0]);
  if (stage === "match") return getPart(matchParts[0]);
  if (stage === "final") return getPart(finalQuestions[0].partId);
  return null;
}

function getListenOptions(targetPart: BodyPart) {
  const optionIds: Record<string, string[]> = {
    ear: ["ear", "eye", "mouth", "nose"],
    hair: ["hair", "head", "neck", "back"],
    neck: ["neck", "shoulder", "stomach", "arm"],
    arm: ["arm", "leg", "shoulder", "neck"],
    mouth: ["mouth", "nose", "eye", "ear"],
    leg: ["leg", "arm", "stomach", "shoulder"],
    back: ["back", "stomach", "shoulder", "head"],
  };

  return getStableShuffledParts(
    (optionIds[targetPart.id] ?? [targetPart.id, "head", "arm", "leg"]).map(getPart),
    `body-parts-listen-${targetPart.id}`,
  );
}

function getStableShuffledValues<T>(values: T[], seed: string) {
  return [...values].sort((left, right) => stableHash(`${seed}:${String(left)}`) - stableHash(`${seed}:${String(right)}`));
}

function getStableShuffledParts(parts: BodyPart[], seed: string) {
  return [...parts].sort((left, right) => stableHash(`${seed}:${left.id}`) - stableHash(`${seed}:${right.id}`));
}

function getStableDerangedParts(parts: BodyPart[], seed: string) {
  if (parts.length < 2) return parts;

  const originalIds = parts.map((part) => part.id);
  const shuffledParts = getStableShuffledParts(parts, seed);

  for (let attempts = 0; attempts < shuffledParts.length; attempts += 1) {
    if (shuffledParts.every((part, index) => part.id !== originalIds[index])) {
      return shuffledParts;
    }

    shuffledParts.push(shuffledParts.shift() ?? shuffledParts[0]);
  }

  return [...parts.slice(1), parts[0]];
}

function stableHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getSectionTitle(section: BodySection, language: ExplanationLanguage) {
  const copy = bodyCopy(language);

  if (section === "face") return copy.headFace;
  if (section === "back") return copy.back;
  return copy.body;
}

function getStageLabel(stage: LessonStage, language: ExplanationLanguage) {
  const copy = bodyCopy(language);

  const labels: Record<LessonStage, string> = {
    face: copy.face,
    body: copy.body,
    back: copy.back,
    tap: copy.practice,
    listen: copy.listen,
    match: copy.match,
    final: copy.final,
    complete: copy.lessonComplete,
  };

  return labels[stage];
}

function getStageProgress(stage: LessonStage, tapIndex: number, listenIndex: number, matchedCount: number, finalIndex: number) {
  const stageBase: Record<LessonStage, number> = {
    face: 8,
    body: 18,
    back: 28,
    tap: 38 + (tapIndex / tapQuestions.length) * 16,
    listen: 56 + (listenIndex / listenQuestions.length) * 12,
    match: 70 + (matchedCount / matchParts.length) * 12,
    final: 84 + (finalIndex / finalQuestions.length) * 16,
    complete: 100,
  };

  return Math.min(100, stageBase[stage]);
}

function getFinalPrompt(question: FinalQuestion, part: BodyPart, language: ExplanationLanguage) {
  const copy = bodyCopy(language);

  if (question.type === "tap") {
    return `${copy.tapCorrectPart}: ${part.russian}`;
  }

  if (question.type === "meaning") {
    return `${copy.chooseCorrectBodyPart}: ${part.russian}`;
  }

  if (question.type === "listen") {
    return `${copy.listenAndChoose}: ${part.russian}`;
  }

  return `${copy.chooseCorrectBodyPart}: ${part.russian}`;
}

function getFinalPromptTitle(question: FinalQuestion, language: ExplanationLanguage) {
  const copy = bodyCopy(language);

  if (question.type === "tap") return copy.tapCorrectPart;
  if (question.type === "listen") return copy.listenAndChoose;
  return copy.chooseCorrectBodyPart;
}

function getFinalPromptHelper(question: FinalQuestion, language: ExplanationLanguage) {
  const copy = bodyCopy(language);

  if (question.type === "listen") return copy.listenRussianWordHelper;
  return copy.findRussianWordHelper;
}

function getFinalCorrectAnswer(question: FinalQuestion, part: BodyPart, translate: (part: BodyPart) => string) {
  if (question.type === "russian") return part.russian;
  return translate(part);
}

function bodyCopy(language: ExplanationLanguage) {
  const lessonText = getUiText(language).lesson;
  const fallback = language === "ar" ? arabicBodyCopy : englishBodyCopy;

  return {
    bodyParts: lessonText.bodyParts ?? fallback.bodyParts,
    face: lessonText.face ?? fallback.face,
    headFace: lessonText.headFace ?? fallback.headFace,
    body: lessonText.body ?? fallback.body,
    back: lessonText.backBodyPart ?? fallback.back,
    tapBodyPart: lessonText.tapBodyPart ?? fallback.tapBodyPart,
    tapCorrectPart: lessonText.tapCorrectPart ?? fallback.tapCorrectPart,
    practice: lessonText.practiceStage ?? fallback.practice,
    listen: lessonText.listenStage ?? fallback.listen,
    match: lessonText.matchStage ?? fallback.match,
    final: lessonText.finalStage ?? fallback.final,
    listenAndChoose: lessonText.listenAndChoose ?? fallback.listenAndChoose,
    matchTheWords: lessonText.matchTheWords ?? fallback.matchTheWords,
    finalChallenge: lessonText.finalChallenge ?? fallback.finalChallenge,
    chooseCorrectBodyPart: lessonText.chooseCorrectBodyPart ?? fallback.chooseCorrectBodyPart,
    listenAndRepeat: lessonText.listenAndRepeat ?? fallback.listenAndRepeat,
    correct: lessonText.correct ?? fallback.correct,
    tryAgain: lessonText.tryAgain ?? fallback.tryAgain,
    continue: lessonText.continue ?? fallback.continue,
    continueToBody: lessonText.continueToBody ?? fallback.continueToBody,
    continueToBack: lessonText.continueToBack ?? fallback.continueToBack,
    startPractice: lessonText.startPractice ?? fallback.startPractice,
    lessonComplete: lessonText.lessonCompleteBodyParts ?? fallback.lessonComplete,
    playPronunciation: lessonText.playPronunciation ?? fallback.playPronunciation,
    question: lessonText.question ?? fallback.question,
    greatJob: lessonText.greatJob ?? fallback.greatJob,
    findRussianWordHelper: fallback.findRussianWordHelper,
    listenRussianWordHelper: fallback.listenRussianWordHelper,
  };
}

const englishBodyCopy = {
  bodyParts: "Body Parts",
  face: "Face",
  headFace: "Head & Face",
  body: "Body",
  back: "Back",
  tapBodyPart: "Tap a body part",
  tapCorrectPart: "Tap the correct part",
  practice: "Practice",
  listen: "Listen",
  match: "Match",
  final: "Final",
  listenAndChoose: "Listen and choose",
  matchTheWords: "Match the words",
  finalChallenge: "Final challenge",
  chooseCorrectBodyPart: "Choose the correct body part",
  listenAndRepeat: "Listen and repeat",
  correct: "Correct",
  tryAgain: "Try again",
  continue: "Continue",
  continueToBody: "Continue to body",
  continueToBack: "Continue to back",
  startPractice: "Start practice",
  lessonComplete: "Lesson complete",
  playPronunciation: "Play pronunciation",
  question: "Question",
  greatJob: "Great job",
  findRussianWordHelper: "Find the body part that matches this Russian word.",
  listenRussianWordHelper: "Listen to the Russian word, then choose the matching body part.",
};

const arabicBodyCopy = {
  bodyParts: "أجزاء الجسم",
  face: "الوجه",
  headFace: "الرأس والوجه",
  body: "الجسم",
  back: "الظهر",
  tapBodyPart: "اضغط على جزء من الجسم",
  tapCorrectPart: "اضغط على الجزء الصحيح",
  practice: "التدريب",
  listen: "الاستماع",
  match: "المطابقة",
  final: "النهائي",
  listenAndChoose: "استمع واختر",
  matchTheWords: "طابق الكلمات",
  finalChallenge: "التحدي النهائي",
  chooseCorrectBodyPart: "اختر جزء الجسم الصحيح",
  listenAndRepeat: "استمع وكرر",
  correct: "صحيح",
  tryAgain: "حاول مرة أخرى",
  continue: "تابع",
  continueToBody: "تابع إلى الجسم",
  continueToBack: "تابع إلى الظهر",
  startPractice: "ابدأ التدريب",
  lessonComplete: "اكتمل الدرس",
  playPronunciation: "تشغيل النطق",
  question: "سؤال",
  greatJob: "أحسنت",
  findRussianWordHelper: "اختر الجزء الذي يطابق هذه الكلمة الروسية.",
  listenRussianWordHelper: "استمع إلى الكلمة الروسية، ثم اختر جزء الجسم المطابق.",
};
