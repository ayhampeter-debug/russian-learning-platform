"use client";

import { Navigation } from "@/components/Navigation";
import { useExplanationLanguage } from "@/components/LanguageSelector";
import {
  isRussianText,
  normalizeRussianText,
  PronounceButton,
} from "@/components/PronounceButton";
import { type ExplanationLanguage } from "@/lib/language-preference";
import {
  getUiText,
  localizeActionLabel,
  localizeLessonDescription,
  localizeLessonTitle,
  localizeWorldTitle,
  uiTextProps,
} from "@/lib/ui-translations";
import {
  explanationTextProps,
  localizeExplanation,
  localizeLearningText,
  localizeMeaning,
  localizeNote,
  tUi,
} from "@/lib/russian-explanations";
import {
  type Lesson,
  type LessonExercise,
  type MatchingExercise,
  type SentenceOrderExercise,
  type World,
  worldOne,
} from "@/lib/learning-data";
import {
  areWorldLessonsCompleted,
  completeLesson,
  getLessonProgressState,
  getNextAvailableLabel,
  getNextAvailablePath,
  getProgressSummary,
  getWorldForLesson,
  getWorldProgressSummary,
  type SavedProgress,
  useProgress,
} from "@/lib/progress-storage";
import { addMistake } from "@/lib/mistake-storage";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BodyPartsGame } from "./BodyPartsGame";
import { ColorsLessonGame } from "./ColorsLessonGame";
import { FruitsVegetablesGame } from "./FruitsVegetablesGame";

const startingHearts = 5;

type MissedQuestion = {
  id: string;
  order: number;
  prompt: string;
  type: LessonExercise["type"];
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
};

export function LessonSessionClient({ lesson }: { lesson: Lesson }) {
  const { language } = useExplanationLanguage();
  const text = getUiText(language);
  const progressState = useProgress();
  const lessonState = getLessonProgressState(lesson, progressState);
  const lessonWorld = getWorldForLesson(lesson);
  const lessonStage = lessonWorld?.stages.find((stage) => stage.id === lesson.stageId);
  const lessonTitle = localizeLessonTitle(lesson.title, language);
  const lessonDescription = localizeLessonDescription(lesson.description, language);
  const lessonExercises = lesson.exercises;
  const possibleXp = getLessonXp(lesson);
  const estimatedTime = getEstimatedTime(lessonExercises.length);
  const keyPhrases = lesson.vocabulary.slice(0, 3);

  const [hasStarted, setHasStarted] = useState(false);
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
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [mistakes, setMistakes] = useState<MissedQuestion[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [completionProgress, setCompletionProgress] = useState<SavedProgress | null>(null);
  const [showReview, setShowReview] = useState(false);

  const currentExercise = lessonExercises[currentExerciseIndex] ?? lessonExercises[0];
  const currentStep = Math.min(currentExerciseIndex + 1, lessonExercises.length);
  const progress = lessonExercises.length === 0 ? 0 : (currentStep / lessonExercises.length) * 100;
  const accuracy = lessonExercises.length === 0 ? 0 : Math.round((correctCount / lessonExercises.length) * 100);
  const displayProgress = completionProgress ?? progressState;
  const nextAction = useMemo(
    () => getLessonNextAction(lesson, displayProgress),
    [lesson, displayProgress],
  );
  const summary = getProgressSummary(displayProgress);

  function applyResult(isCorrect: boolean, userAnswer: string) {
    if (isAnswered) return;

    setIsAnswered(true);
    setLastAnswerWasCorrect(isCorrect);

    if (isCorrect) {
      setXp((previousXp) => previousXp + currentExercise.points);
      setCorrectCount((previousCount) => previousCount + 1);
      setStreak((previousStreak) => {
        const nextStreak = previousStreak + 1;
        setBestStreak((previousBest) => Math.max(previousBest, nextStreak));
        return nextStreak;
      });
      return;
    }

    setStreak(0);
    setHearts((previousHearts) => Math.max(previousHearts - 1, 0));
    const missedQuestion = {
      id: currentExercise.id,
      order: currentExerciseIndex + 1,
      prompt: currentExercise.prompt,
      type: currentExercise.type,
      userAnswer: userAnswer || text.lesson.noAnswer,
      correctAnswer: getCorrectAnswerText(currentExercise),
      explanation: currentExercise.explanation,
    };

    addMistake({
      lessonId: lesson.id,
      exerciseId: currentExercise.id,
      exerciseOrder: currentExerciseIndex + 1,
      questionText: currentExercise.prompt,
      userAnswer: userAnswer || text.lesson.noAnswer,
      correctAnswer: getCorrectAnswerText(currentExercise),
      explanation: currentExercise.explanation,
      language,
    });

    setMistakes((previousMistakes) => [
      ...previousMistakes,
      missedQuestion,
    ]);
  }

  function handleChoiceAnswer(answer: string, correctAnswer: string) {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    applyResult(answer === correctAnswer, answer);
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
    const userAnswer = builtSentence.join(" ");
    applyResult(userAnswer === exercise.correctOrder.join(" "), userAnswer);
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
    const answerSummary = exercise.pairs
      .map((pair) => `${normalizeRussianText(pair.russian)} -> ${matchingAnswers[pair.russian] ?? "?"}`)
      .join(", ");

    applyResult(allPairsCorrect, answerSummary);
  }

  function handleNext() {
    if (currentExerciseIndex === lessonExercises.length - 1) {
      const nextProgress = completeLesson(lesson.id, xp);
      setCompletionProgress(nextProgress);
      setIsFinished(true);
      return;
    }

    setCurrentExerciseIndex((previousIndex) => previousIndex + 1);
    resetExerciseState();
  }

  function handleRestart() {
    setHasStarted(true);
    setCurrentExerciseIndex(0);
    resetExerciseState();
    setXp(0);
    setHearts(startingHearts);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setMistakes([]);
    setIsFinished(false);
    setCompletionProgress(null);
    setShowReview(false);
  }

  function resetExerciseState() {
    setSelectedAnswer("");
    setSelectedWordIndexes([]);
    setMatchingAnswers({});
    setSelectedRussian("");
    setSelectedEnglish("");
    setIsAnswered(false);
    setLastAnswerWasCorrect(false);
  }

  if (lessonState.locked) {
    return <LockedLesson lesson={lesson} language={language} />;
  }

  if (lesson.id === "body-parts") {
    return <BodyPartsGame lesson={lesson} />;
  }

  if (lesson.id === "colors") {
    return <ColorsLessonGame lesson={lesson} />;
  }

  if (lesson.id === "fruits-vegetables") {
    return <FruitsVegetablesGame lesson={lesson} />;
  }

  if (!hasStarted && !isFinished) {
    return (
      <LessonIntro
        lesson={lesson}
        world={lessonWorld}
        stageTitle={lessonStage?.title}
        title={lessonTitle}
        description={lessonDescription}
        xp={possibleXp}
        estimatedTime={estimatedTime}
        vocabularyCount={lesson.vocabulary.length}
        exerciseCount={lessonExercises.length}
        keyPhrases={keyPhrases}
        language={language}
        onStart={() => setHasStarted(true)}
      />
    );
  }

  if (isFinished) {
    return (
      <LessonCompleteScreen
        lesson={lesson}
        title={lessonTitle}
        xp={xp}
        possibleXp={possibleXp}
        bestStreak={bestStreak}
        accuracy={accuracy}
        mistakes={mistakes}
        nextAction={nextAction}
        showBossSuggestion={areWorldLessonsCompleted(worldOne, displayProgress)}
        showWorldTwoSuggestion={Boolean(summary.worldTwoSummary?.unlocked && summary.nextRecommendedLesson)}
        language={language}
        onReview={() => setShowReview((current) => !current)}
        onRestart={handleRestart}
        showReview={showReview}
      />
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <LessonTopBar
          title={lessonTitle}
          lessonNumber={lesson.number}
          progress={progress}
          currentStep={currentStep}
          totalSteps={lessonExercises.length}
          xp={xp}
          possibleXp={possibleXp}
          hearts={hearts}
          mistakeCount={mistakes.length}
          language={language}
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section className="min-w-0">
            <LessonExerciseCard
              exercise={currentExercise}
              selectedAnswer={selectedAnswer}
              selectedWordIndexes={selectedWordIndexes}
              matchingAnswers={matchingAnswers}
              selectedRussian={selectedRussian}
              selectedEnglish={selectedEnglish}
              isAnswered={isAnswered}
              lastAnswerWasCorrect={lastAnswerWasCorrect}
              onChoiceAnswer={handleChoiceAnswer}
              onWordClick={handleWordClick}
              onWordRemove={handleWordRemove}
              onSentenceSubmit={handleSentenceSubmit}
              onRussianMatchSelect={handleRussianMatchSelect}
              onEnglishMatchSelect={handleEnglishMatchSelect}
              onMatchingSubmit={handleMatchingSubmit}
              onNext={handleNext}
              isLastExercise={currentExerciseIndex === lessonExercises.length - 1}
              language={language}
            />
          </section>

          <aside className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl shadow-cyan-950/20 sm:rounded-3xl sm:p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300" {...uiTextProps(language)}>
              {text.lesson.lessonGoals}
            </p>
            <div className="mt-4 grid gap-3">
              <SideStat label={tUi("currentType", language)} value={getShortExerciseLabel(currentExercise.type, language)} />
              <SideStat label={tUi("correct", language).replace(".", "")} value={correctCount.toString()} />
              <SideStat label={text.lesson.lessonStreak} value={streak.toString()} />
            </div>

            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-sm font-bold text-slate-300" {...uiTextProps(language)}>
                {text.lesson.whatPractice}
              </p>
              <div className="mt-3 space-y-3">
                {keyPhrases.map((item) => (
                  <div
                    key={`${item.russian}-${item.english}`}
                    className="rounded-2xl border border-white/10 bg-slate-900/70 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="break-words text-lg font-black">{normalizeRussianText(item.russian)}</p>
                      <PronounceButton text={item.russian} />
                    </div>
                    <p className="mt-1 text-sm text-slate-300" {...explanationTextProps(language)}>
                      {localizeMeaning(item.english, language)}
                    </p>
                    {item.note ? (
                      <p className="mt-1 text-xs text-slate-500" {...explanationTextProps(language)}>
                        {localizeNote(item.note, language)}
                      </p>
                    ) : null}
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

function LessonIntro({
  lesson,
  world,
  stageTitle,
  title,
  description,
  xp,
  estimatedTime,
  vocabularyCount,
  exerciseCount,
  keyPhrases,
  language,
  onStart,
}: {
  lesson: Lesson;
  world?: World;
  stageTitle?: string;
  title: string;
  description: string;
  xp: number;
  estimatedTime: string;
  vocabularyCount: number;
  exerciseCount: number;
  keyPhrases: Lesson["vocabulary"];
  language: ExplanationLanguage;
  onStart: () => void;
}) {
  const text = getUiText(language);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-6 px-4 pb-8 sm:px-6 lg:grid-cols-[1fr_24rem]">
        <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl shadow-cyan-950/30 sm:rounded-3xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300" {...uiTextProps(language)}>
            {world ? `${localizeWorldTitle(world.subtitle, language)} / ${localizeWorldTitle(stageTitle ?? "", language)}` : `${text.nav.lesson} ${lesson.number}`}
          </p>
          <h1 className="mt-4 break-words text-3xl font-black sm:text-5xl" {...uiTextProps(language)}>
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300" {...uiTextProps(language)}>
            {description}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <IntroStat label={tUi("xpEarned", language)} value={`${xp} XP`} />
            <IntroStat label={text.lesson.estimatedTime} value={estimatedTime} />
            <IntroStat label={text.lesson.exerciseCount} value={exerciseCount.toString()} />
          </div>

          <button
            type="button"
            onClick={onStart}
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-cyan-400 px-7 py-4 text-base font-black text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950 sm:w-auto"
          >
            {text.lesson.startLesson}
          </button>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 sm:rounded-3xl sm:p-6">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-300" {...uiTextProps(language)}>
            {text.lesson.whatPractice}
          </p>
          <div className="mt-5 grid gap-3">
            <PracticeLine label={text.lesson.vocabularyCount} value={vocabularyCount.toString()} />
            <PracticeLine label={text.lesson.question} value={exerciseCount.toString()} />
          </div>
          {keyPhrases.length > 0 ? (
            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-sm font-bold text-slate-300" {...uiTextProps(language)}>
                {text.lesson.keyPhrases}
              </p>
              <div className="mt-3 space-y-3">
                {keyPhrases.map((item) => (
                  <div key={`${item.russian}-${item.english}`} className="rounded-2xl bg-white/5 p-3">
                    <p className="font-black">{normalizeRussianText(item.russian)}</p>
                    <p className="mt-1 text-sm text-slate-400" {...explanationTextProps(language)}>
                      {localizeMeaning(item.english, language)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

function LessonTopBar({
  title,
  lessonNumber,
  progress,
  currentStep,
  totalSteps,
  xp,
  possibleXp,
  hearts,
  mistakeCount,
  language,
}: {
  title: string;
  lessonNumber: string;
  progress: number;
  currentStep: number;
  totalSteps: number;
  xp: number;
  possibleXp: number;
  hearts: number;
  mistakeCount: number;
  language: ExplanationLanguage;
}) {
  const text = getUiText(language);

  return (
    <header className="mb-5 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl shadow-cyan-950/20 sm:rounded-3xl sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <Link href="/worlds" className="text-sm font-semibold text-slate-400 transition hover:text-white" {...uiTextProps(language)}>
            {text.lesson.exitLesson}
          </Link>
          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
            <span className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-black text-slate-950">
              {text.nav.lesson} {lessonNumber}
            </span>
            <h1 className="min-w-0 truncate text-lg font-black sm:text-xl" {...uiTextProps(language)}>
              {title}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[25rem]">
          <StatusPill label={`${text.lesson.step} ${currentStep}/${totalSteps}`} value={`${Math.round(progress)}%`} tone="cyan" />
          <StatusPill label={text.lesson.mistakes} value={`${mistakeCount}/${startingHearts}`} tone="red" />
          <StatusPill label="XP" value={`${xp}/${possibleXp}`} tone="lime" />
        </div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="sr-only">
        {text.lesson.heartsRemaining}: {hearts}
      </p>
    </header>
  );
}

function LessonExerciseCard({
  exercise,
  selectedAnswer,
  selectedWordIndexes,
  matchingAnswers,
  selectedRussian,
  selectedEnglish,
  isAnswered,
  lastAnswerWasCorrect,
  onChoiceAnswer,
  onWordClick,
  onWordRemove,
  onSentenceSubmit,
  onRussianMatchSelect,
  onEnglishMatchSelect,
  onMatchingSubmit,
  onNext,
  isLastExercise,
  language,
}: {
  exercise: LessonExercise;
  selectedAnswer: string;
  selectedWordIndexes: number[];
  matchingAnswers: Record<string, string>;
  selectedRussian: string;
  selectedEnglish: string;
  isAnswered: boolean;
  lastAnswerWasCorrect: boolean;
  onChoiceAnswer: (answer: string, correctAnswer: string) => void;
  onWordClick: (wordIndex: number) => void;
  onWordRemove: (wordIndex: number) => void;
  onSentenceSubmit: (exercise: SentenceOrderExercise) => void;
  onRussianMatchSelect: (russian: string) => void;
  onEnglishMatchSelect: (english: string) => void;
  onMatchingSubmit: (exercise: MatchingExercise) => void;
  onNext: () => void;
  isLastExercise: boolean;
  language: ExplanationLanguage;
}) {
  const text = getUiText(language);

  return (
    <div className={`min-w-0 rounded-2xl border p-4 shadow-2xl sm:rounded-3xl sm:p-6 md:p-8 ${getExerciseFrame(exercise.type)}`}>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 sm:text-sm sm:tracking-[0.25em]">
            {getExerciseLabel(exercise.type, language)}
          </p>
          <h2 className="mt-3 break-words text-xl font-black sm:text-2xl md:text-3xl" {...explanationTextProps(language)}>
            {localizeLearningText(exercise.prompt, language)}
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-400" {...uiTextProps(language)}>
            {getExerciseInstruction(exercise.type, language)}
          </p>
        </div>
        <span className="w-fit rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950">
          +{exercise.points} XP
        </span>
      </div>

      <ExerciseView
        exercise={exercise}
        selectedAnswer={selectedAnswer}
        selectedWordIndexes={selectedWordIndexes}
        matchingAnswers={matchingAnswers}
        selectedRussian={selectedRussian}
        selectedEnglish={selectedEnglish}
        isAnswered={isAnswered}
        onChoiceAnswer={onChoiceAnswer}
        onWordClick={onWordClick}
        onWordRemove={onWordRemove}
        onSentenceSubmit={onSentenceSubmit}
        onRussianMatchSelect={onRussianMatchSelect}
        onEnglishMatchSelect={onEnglishMatchSelect}
        onMatchingSubmit={onMatchingSubmit}
        language={language}
      />

      {isAnswered ? (
        <FeedbackPanel
          correct={lastAnswerWasCorrect}
          explanation={exercise.explanation}
          correctAnswer={getCorrectAnswerText(exercise)}
          language={language}
        />
      ) : null}

      <button
        type="button"
        onClick={onNext}
        disabled={!isAnswered}
        aria-disabled={!isAnswered}
        className={`mt-7 w-full rounded-full px-6 py-4 font-black transition focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950 ${
          isAnswered
            ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
            : "bg-slate-800 text-slate-500"
        }`}
      >
        {isLastExercise ? tUi("finishLesson", language) : text.lesson.continue}
      </button>
    </div>
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
  language,
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
  language: ExplanationLanguage;
}) {
  const text = getUiText(language);

  if (exercise.type === "multipleChoice") {
    return (
      <>
        <RussianDisplay label={text.lesson.russian} text={exercise.display} />
        <ChoiceGrid
          options={exercise.options}
          selectedAnswer={selectedAnswer}
          correctAnswer={exercise.correctAnswer}
          isAnswered={isAnswered}
          onSelect={(answer) => onChoiceAnswer(answer, exercise.correctAnswer)}
          language={language}
        />
      </>
    );
  }

  if (exercise.type === "fillBlank") {
    return (
      <>
        <div className="mt-7 rounded-2xl border border-yellow-400/20 bg-slate-900/80 p-4 text-center sm:rounded-3xl sm:p-7">
          <p className="break-words text-lg font-black leading-9 md:text-3xl md:leading-10">
            {normalizeRussianText(exercise.beforeBlank)}{" "}
            <span className="inline-flex min-w-20 justify-center border-b-4 border-yellow-300 px-2 text-yellow-200 sm:min-w-28 sm:px-4">
              {selectedAnswer ? normalizeRussianText(selectedAnswer) : "?"}
            </span>{" "}
            {normalizeRussianText(exercise.afterBlank)}
          </p>
        </div>
        <ChoiceGrid
          options={exercise.options}
          selectedAnswer={selectedAnswer}
          correctAnswer={exercise.correctAnswer}
          isAnswered={isAnswered}
          onSelect={(answer) => onChoiceAnswer(answer, exercise.correctAnswer)}
          language={language}
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
      <div className="mt-7">
        <div className="rounded-2xl border border-violet-400/20 bg-slate-900/80 p-4 sm:rounded-3xl sm:p-6">
          <p className="text-sm text-slate-400" {...uiTextProps(language)}>{tUi("targetMeaning", language)}</p>
          <p className="mt-2 break-words text-xl font-black sm:text-2xl" {...explanationTextProps(language)}>
            {localizeMeaning(exercise.translation, language)}
          </p>
        </div>

        <div className="mt-5 min-h-24 rounded-2xl border border-dashed border-violet-300/40 bg-violet-400/10 p-3 sm:rounded-3xl sm:p-4">
          <div className="flex flex-wrap gap-3">
            {selectedWords.length === 0 ? (
              <span className="py-3 text-sm text-slate-500" {...uiTextProps(language)}>
                {tUi("chooseWordsBelow", language)}
              </span>
            ) : (
              selectedWords.map((selectedWord) => (
                <div key={selectedWord.index} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onWordRemove(selectedWord.index)}
                    disabled={isAnswered}
                    aria-disabled={isAnswered}
                    className="max-w-full break-words rounded-2xl bg-violet-300 px-3 py-2 font-black text-slate-950 transition hover:bg-violet-200 disabled:hover:bg-violet-300 sm:px-4 sm:py-3"
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
                  type="button"
                  onClick={() => onWordClick(wordIndex)}
                  disabled={wasSelected || isAnswered}
                  aria-disabled={wasSelected || isAnswered}
                  className={`max-w-full break-words rounded-2xl border px-3 py-3 font-bold transition sm:px-5 sm:py-4 ${
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
          type="button"
          onClick={() => onSentenceSubmit(exercise)}
          disabled={isAnswered || selectedWordIndexes.length !== exercise.words.length}
          aria-disabled={isAnswered || selectedWordIndexes.length !== exercise.words.length}
          className={`mt-6 w-full rounded-full px-6 py-4 font-bold transition ${
            !isAnswered && selectedWordIndexes.length === exercise.words.length
              ? "bg-violet-300 text-slate-950 hover:bg-violet-200"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          {tUi("checkSentence", language)}
        </button>
      </div>
    );
  }

  if (exercise.type === "matching") {
    return (
      <div className="mt-7">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            {exercise.pairs.map((pair) => (
              <div key={pair.russian} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onRussianMatchSelect(pair.russian)}
                  disabled={isAnswered}
                  aria-disabled={isAnswered}
                  className={`min-w-0 flex-1 rounded-2xl border p-3 text-left transition sm:p-4 ${
                    selectedRussian === pair.russian
                      ? "border-emerald-300 bg-emerald-300/20"
                      : "border-white/10 bg-slate-900/80 hover:border-emerald-300/50"
                  }`}
                >
                  <span className="block break-words text-lg font-black sm:text-xl">
                    {normalizeRussianText(pair.russian)}
                  </span>
                  <span className="mt-1 block text-sm text-slate-400" {...explanationTextProps(language)}>
                    {tUi("matchedTo", language)}{" "}
                    {matchingAnswers[pair.russian]
                      ? localizeMeaning(matchingAnswers[pair.russian], language)
                      : tUi("notMatched", language)}
                  </span>
                </button>
                <PronounceButton text={pair.russian} />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {exercise.englishOptions.map((english) => (
              <button
                type="button"
                key={english}
                onClick={() => onEnglishMatchSelect(english)}
                disabled={isAnswered}
                aria-disabled={isAnswered}
                className={`w-full rounded-2xl border p-3 text-left font-bold transition sm:p-4 ${
                  selectedEnglish === english
                    ? "border-cyan-300 bg-cyan-300/20"
                    : "border-white/10 bg-slate-900/80 hover:border-cyan-300/50"
                }`}
              >
                <span {...explanationTextProps(language)}>
                  {localizeMeaning(english, language)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onMatchingSubmit(exercise)}
          disabled={isAnswered || Object.keys(matchingAnswers).length !== exercise.pairs.length}
          aria-disabled={isAnswered || Object.keys(matchingAnswers).length !== exercise.pairs.length}
          className={`mt-6 w-full rounded-full px-6 py-4 font-bold transition ${
            !isAnswered && Object.keys(matchingAnswers).length === exercise.pairs.length
              ? "bg-emerald-300 text-slate-950 hover:bg-emerald-200"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          {tUi("checkMatches", language)}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mt-7 rounded-2xl border border-orange-300/20 bg-slate-900/80 p-4 sm:rounded-3xl sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200 sm:text-sm sm:tracking-[0.25em]" {...uiTextProps(language)}>
          {text.lesson.realLifeSituation}
        </p>
        <p className="mt-4 break-words text-lg font-bold leading-8 text-slate-100 sm:text-xl" {...explanationTextProps(language)}>
          {localizeLearningText(exercise.situation, language)}
        </p>
      </div>
      <ChoiceGrid
        options={exercise.options}
        selectedAnswer={selectedAnswer}
        correctAnswer={exercise.correctAnswer}
        isAnswered={isAnswered}
        onSelect={(answer) => onChoiceAnswer(answer, exercise.correctAnswer)}
        language={language}
      />
    </>
  );
}

function FeedbackPanel({
  correct,
  explanation,
  correctAnswer,
  language,
}: {
  correct: boolean;
  explanation: string;
  correctAnswer: string;
  language: ExplanationLanguage;
}) {
  const text = getUiText(language);

  return (
    <div
      className={`mt-6 rounded-2xl border p-5 ${
        correct
          ? "border-green-400/30 bg-green-400/15"
          : "border-red-400/30 bg-red-400/15"
      }`}
      role="status"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-black" {...uiTextProps(language)}>
          {correct ? text.lesson.correct : text.lesson.notQuite}
        </p>
        {!correct ? (
          <p className="text-sm font-bold text-slate-300" {...uiTextProps(language)}>
            {text.lesson.correctAnswer}: {formatAnswer(correctAnswer, language)}
          </p>
        ) : null}
      </div>
      {explanation ? (
        <div className="mt-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400" {...uiTextProps(language)}>
            {text.lesson.explanation}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-300" {...explanationTextProps(language)}>
            {localizeExplanation(explanation, language)}
          </p>
        </div>
      ) : null}
      {!correct ? (
        <p className="mt-3 text-sm font-bold text-red-100" {...uiTextProps(language)}>
          {text.lesson.mistakeSavedForReview}
        </p>
      ) : null}
    </div>
  );
}

function LessonCompleteScreen({
  lesson,
  title,
  xp,
  possibleXp,
  bestStreak,
  accuracy,
  mistakes,
  nextAction,
  showBossSuggestion,
  showWorldTwoSuggestion,
  language,
  onReview,
  onRestart,
  showReview,
}: {
  lesson: Lesson;
  title: string;
  xp: number;
  possibleXp: number;
  bestStreak: number;
  accuracy: number;
  mistakes: MissedQuestion[];
  nextAction: { href: string; label: string };
  showBossSuggestion: boolean;
  showWorldTwoSuggestion: boolean;
  language: ExplanationLanguage;
  onReview: () => void;
  onRestart: () => void;
  showReview: boolean;
}) {
  const text = getUiText(language);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl items-center px-4 pb-8 sm:px-6">
        <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-2xl shadow-cyan-950/30 sm:rounded-3xl">
          <div className="border-b border-white/10 bg-cyan-400 p-5 text-center text-slate-950 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] sm:text-sm sm:tracking-[0.35em]" {...uiTextProps(language)}>
              {text.lesson.lessonComplete}
            </p>
            <h1 className="mt-3 break-words text-3xl font-black md:text-6xl" {...uiTextProps(language)}>
              {title}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-semibold" {...uiTextProps(language)}>
              {text.lesson.celebrationMessage}
            </p>
          </div>

          <div className="p-5 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <ResultStat title={text.lesson.xpEarned} value={`${xp}/${possibleXp}`} tone="cyan" />
              <ResultStat title={text.lesson.lessonStreak} value={bestStreak.toString()} tone="lime" />
              <ResultStat title={text.lesson.accuracy} value={`${accuracy}%`} tone="yellow" />
            </div>

            {mistakes.length > 0 ? (
              <div className="mt-7 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4 sm:rounded-3xl sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black" {...uiTextProps(language)}>{text.lesson.reviewMistakes}</p>
                    <p className="mt-1 text-sm text-slate-300" {...uiTextProps(language)}>
                      {text.lesson.yourMistakes}: {mistakes.length}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onReview}
                    className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-black transition hover:border-white/30 hover:bg-white/15"
                  >
                    {showReview ? text.common.close : text.lesson.reviewMistakes}
                  </button>
                  <Link
                    href="/practice"
                    className="rounded-full bg-yellow-300 px-5 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-yellow-200"
                  >
                    {text.lesson.practice}
                  </Link>
                </div>
                {showReview ? <MistakeReview mistakes={mistakes} language={language} /> : null}
              </div>
            ) : (
              <div className="mt-7 rounded-2xl border border-green-400/25 bg-green-400/10 p-4 sm:rounded-3xl sm:p-5">
                <p className="font-black text-green-200" {...uiTextProps(language)}>
                  {text.lesson.greatJobNoMistakes}
                </p>
              </div>
            )}

            {(showBossSuggestion || showWorldTwoSuggestion) ? (
              <div className="mt-7 rounded-2xl border border-cyan-400/25 bg-cyan-400/10 p-4 sm:rounded-3xl sm:p-5">
                <p className="font-black text-cyan-300" {...uiTextProps(language)}>
                  {showBossSuggestion ? text.lesson.bossChallengeUnlocked : text.lesson.worldTwoUnlocked}
                </p>
              </div>
            ) : null}

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href={nextAction.href}
                className="inline-flex justify-center rounded-full bg-cyan-400 px-5 py-4 text-center font-black text-slate-950 transition hover:bg-cyan-300"
              >
                {localizeActionLabel(nextAction.label, language)}
              </Link>
              <Link
                href="/worlds"
                className="inline-flex justify-center rounded-full border border-white/10 bg-white/10 px-5 py-4 text-center font-black text-white transition hover:border-white/30 hover:bg-white/15"
              >
                {text.lesson.backToWorlds}
              </Link>
              <Link
                href={nextAction.href}
                className="inline-flex justify-center rounded-full border border-white/10 bg-slate-900/70 px-5 py-4 text-center font-black text-white transition hover:border-cyan-400/40"
              >
                {text.lesson.continueLearning}
              </Link>
              <button
                type="button"
                onClick={onRestart}
                className="rounded-full border border-white/10 bg-slate-900/70 px-5 py-4 font-black text-white transition hover:border-white/30"
              >
                {tUi("replayLesson", language)}
              </button>
            </div>
            <p className="sr-only">{lesson.id}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function MistakeReview({
  mistakes,
  language,
}: {
  mistakes: MissedQuestion[];
  language: ExplanationLanguage;
}) {
  const text = getUiText(language);

  return (
    <div className="mt-4 grid gap-3">
      {mistakes.map((mistake, index) => (
        <div key={`${mistake.id}-${index}`} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <p className="text-sm font-bold text-slate-400" {...uiTextProps(language)}>
            {getExerciseLabel(mistake.type, language)} {mistake.order ? `#${mistake.order}` : ""}
          </p>
          <p className="mt-2 font-semibold" {...explanationTextProps(language)}>
            {localizeLearningText(mistake.prompt, language)}
          </p>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <p className="rounded-2xl bg-red-400/10 p-3" {...uiTextProps(language)}>
              {text.lesson.yourAnswer}: {formatAnswer(mistake.userAnswer, language)}
            </p>
            <p className="rounded-2xl bg-green-400/10 p-3" {...uiTextProps(language)}>
              {text.lesson.correctAnswer}: {formatAnswer(mistake.correctAnswer, language)}
            </p>
          </div>
          {mistake.explanation ? (
            <p className="mt-3 text-sm leading-6 text-slate-300" {...explanationTextProps(language)}>
              {localizeExplanation(mistake.explanation, language)}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ChoiceGrid({
  options,
  selectedAnswer,
  correctAnswer,
  isAnswered,
  onSelect,
  language,
}: {
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
  isAnswered: boolean;
  onSelect: (answer: string) => void;
  language: ExplanationLanguage;
}) {
  const text = getUiText(language);

  return (
    <div className="mt-7 grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const isSelected = selectedAnswer === option;
        const isRightOption = option === correctAnswer;
        let buttonStyle = "border-white/10 bg-slate-900/80 hover:border-cyan-400/50";
        let stateLabel = "";

        if (isAnswered && isRightOption) {
          buttonStyle = "border-green-400 bg-green-400/20";
          stateLabel = text.lesson.correct;
        }

        if (isAnswered && isSelected && !isRightOption) {
          buttonStyle = "border-red-400 bg-red-400/20";
          stateLabel = text.lesson.notQuite;
        }

        return (
          <div key={option} className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect(option)}
              disabled={isAnswered}
              aria-disabled={isAnswered}
              aria-label={`${formatAnswer(option, language)}${stateLabel ? `, ${stateLabel}` : ""}`}
              className={`min-w-0 flex-1 break-words rounded-2xl border p-4 text-left font-bold transition focus:outline-none focus:ring-2 focus:ring-cyan-300 sm:p-5 ${buttonStyle}`}
            >
              <span {...(!isRussianText(option) ? explanationTextProps(language) : {})}>
                {formatAnswer(option, language)}
              </span>
              {stateLabel ? <span className="mt-2 block text-xs uppercase tracking-wider">{stateLabel}</span> : null}
            </button>
            {isRussianText(option) ? <PronounceButton text={option} /> : null}
          </div>
        );
      })}
    </div>
  );
}

function RussianDisplay({ label, text }: { label: string; text: string }) {
  return (
    <div className="mt-7 rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-4 text-center sm:rounded-3xl sm:p-8">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 sm:text-sm sm:tracking-[0.25em]">
        {label}
      </p>
      <div className="mt-4 flex min-w-0 flex-wrap items-center justify-center gap-3">
        <p className="break-words text-3xl font-black sm:text-5xl">{normalizeRussianText(text)}</p>
        {isRussianText(text) ? <PronounceButton text={text} /> : null}
      </div>
    </div>
  );
}

function LockedLesson({ lesson, language }: { lesson: Lesson; language: ExplanationLanguage }) {
  const text = getUiText(language);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-3xl items-center px-4 pb-8 sm:px-6">
        <div className="w-full rounded-2xl border border-white/10 bg-white/10 p-5 text-center shadow-2xl shadow-cyan-950/30 sm:rounded-3xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 sm:text-sm sm:tracking-[0.35em]" {...uiTextProps(language)}>
            {text.lesson.lessonLocked}
          </p>
          <h1 className="mt-4 text-3xl font-black md:text-5xl" {...uiTextProps(language)}>
            {localizeLessonTitle(lesson.title, language)} {text.lesson.unavailableYet}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-400" {...uiTextProps(language)}>
            {text.lesson.unlockStep}
          </p>
          <Link
            href="/worlds"
            className="mt-8 inline-flex w-full justify-center rounded-full bg-cyan-400 px-7 py-4 font-bold text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
          >
            {text.lesson.backToWorlds}
          </Link>
        </div>
      </section>
    </main>
  );
}

function IntroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function PracticeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="font-black text-white">{value}</span>
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
  tone: "cyan" | "red" | "lime";
}) {
  const toneClass = {
    cyan: "bg-cyan-400 text-slate-950",
    red: "bg-red-400 text-slate-950",
    lime: "bg-yellow-400 text-slate-950",
  }[tone];

  return (
    <div className={`rounded-2xl px-2 py-3 font-black sm:px-4 ${toneClass}`}>
      <p className="truncate text-xs uppercase tracking-wider opacity-75">{label}</p>
      <p className="mt-1 text-lg sm:text-2xl">{value}</p>
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
  tone: "cyan" | "lime" | "yellow";
}) {
  const toneClass = {
    cyan: "text-cyan-300",
    lime: "text-green-300",
    yellow: "text-yellow-300",
  }[tone];

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 text-center">
      <p className="text-sm text-slate-400">{title}</p>
      <p className={`mt-2 text-3xl font-black ${toneClass}`}>{value}</p>
    </div>
  );
}

function SideStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 break-words text-xl font-black">{value}</p>
    </div>
  );
}

function getLessonXp(lesson: Lesson) {
  return lesson.xpReward || lesson.exercises.reduce((total, exercise) => total + exercise.points, 0);
}

function getEstimatedTime(exerciseCount: number) {
  const low = Math.max(2, Math.ceil(exerciseCount * 0.6));
  const high = Math.max(low + 1, Math.ceil(exerciseCount * 0.9));
  return `${low}-${high} min`;
}

function getCorrectAnswerText(exercise: LessonExercise) {
  if (exercise.type === "sentenceOrder") {
    return exercise.correctOrder.join(" ");
  }

  if (exercise.type === "matching") {
    return exercise.pairs
      .map((pair) => `${normalizeRussianText(pair.russian)} -> ${pair.english}`)
      .join(", ");
  }

  return exercise.correctAnswer;
}

function formatAnswer(answer: string, language: ExplanationLanguage) {
  return isRussianText(answer) ? normalizeRussianText(answer) : localizeMeaning(answer, language);
}

function getLessonNextAction(lesson: Lesson, progress: SavedProgress) {
  const lessonWorld = getWorldForLesson(lesson);
  const lessonIndex = lessonWorld?.lessons.findIndex((candidate) => candidate.id === lesson.id) ?? -1;
  const nextInWorld =
    lessonWorld && lessonIndex >= 0
      ? lessonWorld.lessons.slice(lessonIndex + 1).find((candidate) => !progress.completedLessonIds.includes(candidate.id))
      : null;

  if (nextInWorld) {
    return { href: `/lesson/${nextInWorld.id}`, label: `Continue: ${nextInWorld.title}` };
  }

  if (lessonWorld) {
    const worldSummary = getWorldProgressSummary(lessonWorld, progress);

    if (lessonWorld.id === "world-1" && worldSummary.lessonsCompleted && worldSummary.bossState === "available") {
      return { href: "/challenge", label: "Start Boss Challenge" };
    }
  }

  return {
    href: getNextAvailablePath(progress),
    label: getNextAvailableLabel(progress),
  };
}

function getExerciseLabel(type: LessonExercise["type"], language: ExplanationLanguage) {
  const lessonText = getUiText(language).lesson;
  const labels = {
    multipleChoice: lessonText.multipleChoice,
    fillBlank: lessonText.fillBlank,
    sentenceOrder: lessonText.sentenceOrder,
    matching: lessonText.matching,
    scenarioChoice: lessonText.scenarioChoice,
  };

  return labels[type];
}

function getShortExerciseLabel(type: LessonExercise["type"], language: ExplanationLanguage) {
  const lessonText = getUiText(language).lesson;
  const labels = {
    multipleChoice: lessonText.choice,
    fillBlank: lessonText.blank,
    sentenceOrder: lessonText.order,
    matching: lessonText.match,
    scenarioChoice: lessonText.scenario,
  };

  return labels[type];
}

function getExerciseInstruction(type: LessonExercise["type"], language: ExplanationLanguage) {
  const text = getUiText(language).lesson;
  const instructions = {
    multipleChoice: text.chooseCorrectAnswer,
    fillBlank: text.fillBlankInstruction,
    sentenceOrder: text.putSentenceInOrder,
    matching: text.matchPairs,
    scenarioChoice: text.scenarioInstruction,
  };

  return instructions[type];
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
