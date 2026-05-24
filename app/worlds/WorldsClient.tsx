"use client";

import { Navigation } from "@/components/Navigation";
import { useExplanationLanguage } from "@/components/LanguageSelector";
import type { Lesson, StageStatus, World } from "@/lib/learning-data";
import {
  getUiText,
  localizeLessonTitle,
  localizeWorldDescription,
  localizeWorldTitle,
  translateStatus,
  uiTextProps,
} from "@/lib/ui-translations";
import type { UiText } from "@/lib/ui-translations";
import type { ExplanationLanguage } from "@/lib/language-preference";
import {
  getLessonDisplayState,
  getLessonProgressState,
  getProgressStatusLabel,
  getWorldProgressSummary,
  getWorldStageProgressState,
  isWorldUnlocked,
  type SavedProgress,
  useProgress,
} from "@/lib/progress-storage";
import Image from "next/image";
import Link from "next/link";

export function WorldsClient({ worlds }: { worlds: World[] }) {
  const { language } = useExplanationLanguage();
  const text = getUiText(language);
  const progress = useProgress();
  const explanationLanguage =
    language === "ar"
      ? text.common.explanationLanguageValueArabic
      : text.common.explanationLanguageValueEnglish;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="mb-10">
          <p className="text-sm text-cyan-300" {...uiTextProps(language)}>{text.worlds.choosePath}</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl" {...uiTextProps(language)}>{text.worlds.worldsStages}</h1>
          <p className="mt-3 max-w-2xl text-slate-400" {...uiTextProps(language)}>
            {text.worlds.intro}
          </p>
          <p className="mt-3 inline-flex max-w-full flex-wrap rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 sm:rounded-full" {...uiTextProps(language)}>
            {text.worlds.currentCourseRussian} · {text.worlds.explanationLanguage}: {explanationLanguage}
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {worlds.map((world) => {
            const summary = getWorldProgressSummary(world, progress);
            const worldUnlocked = isWorldUnlocked(world, progress);
            const availableLessons = world.lessons.filter(
              (lesson) => !getLessonProgressState(lesson, progress).locked,
            );
            const firstAvailableLesson = availableLessons[0];
            const nextLesson = availableLessons.find(
              (lesson) => !progress.completedLessonIds.includes(lesson.id),
            );
            const worldAvailable = worldUnlocked || Boolean(nextLesson || firstAvailableLesson);
            const worldHref =
              worldAvailable && (nextLesson || firstAvailableLesson)
                ? `/lesson/${(nextLesson ?? firstAvailableLesson)?.id}`
                : undefined;
            const ctaLabel = !worldAvailable
              ? text.worlds.locked
              : summary.completed
                ? text.worlds.review
                : summary.completedLessonCount > 0
                  ? text.worlds.continueWorld
                  : text.worlds.startWorld;

            return (
              <div
                key={world.id}
                className={`rounded-2xl border p-4 sm:rounded-3xl sm:p-6 ${
                  worldAvailable
                    ? "border-white/10 bg-white/10"
                    : "border-white/5 bg-slate-900/60"
                }`}
              >
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm text-slate-400" {...uiTextProps(language)}>{text.common.activeModule}</p>
                    <h2 className="text-2xl font-bold sm:text-3xl" {...uiTextProps(language)}>
                      {localizeWorldTitle(world.title, language)}
                    </h2>
                    <p className="mt-2 max-w-3xl text-slate-400" {...uiTextProps(language)}>
                      {localizeWorldDescription(world.description, language)}
                    </p>
                    {!worldAvailable ? (
                      <p className="mt-3 text-sm font-semibold text-yellow-200">
                        {text.worlds.lockedUntilBoss}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-3 sm:items-end">
                    <div className="w-fit rounded-full bg-yellow-400 px-5 py-2 font-bold text-slate-950">
                      {summary.progressPercent}% {text.worlds.complete}
                    </div>
                    <p className="text-sm text-slate-400">
                      {summary.completedLessonCount}/{summary.totalLessons} {text.worlds.lessonsComplete}
                    </p>
                    {worldHref ? (
                      <Link
                        href={worldHref}
                        className="w-full rounded-full bg-cyan-400 px-5 py-2 text-center text-sm font-bold text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
                      >
                        {ctaLabel}
                      </Link>
                    ) : (
                      <button
                        disabled
                        aria-disabled="true"
                        className="w-full cursor-not-allowed rounded-full bg-slate-800 px-5 py-2 text-sm font-bold text-slate-500 sm:w-auto"
                      >
                        {ctaLabel}
                      </button>
                    )}
                  </div>
                </div>

                {world.id === "basics" ? (
                  <BasicsLessonsSection world={world} progress={progress} text={text} language={language} />
                ) : (
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {world.stages.map((stage) => {
                      const stageLessons = world.lessons.filter((lesson) => lesson.stageId === stage.id);
                      const stageState = getWorldStageProgressState(world, stage.id, progress);
                      const lessonId = getNextWorldStageLessonId(world, stage.id, progress);
                      const hasAvailableLesson = stageLessons.some(
                        (lesson) => !getLessonProgressState(lesson, progress).locked,
                      );
                      const completedLessonCount = stageLessons.filter((lesson) =>
                        progress.completedLessonIds.includes(lesson.id),
                      ).length;
                      const locked = (!worldUnlocked && !hasAvailableLesson) || stageState.locked;

                      return (
                        <StageCard
                          key={stage.id}
                          worldId={world.id}
                          number={stage.number}
                          title={localizeWorldTitle(stage.title, language)}
                          description={localizeWorldDescription(stage.description, language)}
                          status={locked ? "Locked" : stageState.status}
                          statusLabel={translateStatus(getProgressStatusLabel(locked ? "Locked" : stageState.status), language)}
                          locked={locked}
                          xp={`${stage.xp} XP`}
                          boss={stage.boss}
                          lessonId={lessonId}
                          completedLessonCount={completedLessonCount}
                          lessonCount={stageLessons.length}
                          lessons={stageLessons.map((lesson) => ({
                            id: lesson.id,
                            title: localizeLessonTitle(lesson.title, language),
                            state: getLessonDisplayState(lesson, progress),
                          }))}
                          text={text}
                          language={language}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function BasicsLessonsSection({
  world,
  progress,
  text,
  language,
}: {
  world: World;
  progress: SavedProgress;
  text: UiText;
  language: ExplanationLanguage;
}) {
  const completedLessonCount = world.lessons.filter((lesson) =>
    progress.completedLessonIds.includes(lesson.id),
  ).length;

  return (
    <section className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-4 text-slate-950 shadow-[0_24px_70px_rgb(8_19_35_/_0.12)] sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div {...uiTextProps(language)}>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
            {text.common.activeModule}
          </p>
          <h3 className="mt-2 text-2xl font-black sm:text-3xl">Basics</h3>
          <p className="mt-2 text-sm font-semibold text-slate-500">دروسان بصريان للبدء بسرعة.</p>
        </div>
        <span className="w-fit rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-800">
          {completedLessonCount}/{world.lessons.length} {text.worlds.lessonsComplete}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {world.lessons.map((lesson) => (
          <BasicsLessonCard
            key={lesson.id}
            lesson={lesson}
            state={getLessonDisplayState(lesson, progress)}
            locked={getLessonProgressState(lesson, progress).locked}
            language={language}
          />
        ))}
      </div>
    </section>
  );
}

function BasicsLessonCard({
  lesson,
  state,
  locked,
  language,
}: {
  lesson: Lesson;
  state: "Completed" | "Current" | "Available" | "Locked";
  locked: boolean;
  language: ExplanationLanguage;
}) {
  const content = getBasicsLessonContent(lesson);
  const completed = state === "Completed";
  const status = completed ? "مكتمل" : state === "Current" ? "تابع" : "ابدأ";
  const ctaLabel = completed ? "راجع الدرس" : state === "Current" ? "تابع الدرس" : "ابدأ الدرس";

  return (
    <article
      className={`group flex min-w-0 flex-col overflow-hidden rounded-[1.35rem] border bg-white shadow-[0_18px_48px_rgb(15_23_42_/_0.09)] transition ${
        locked
          ? "border-slate-200 opacity-70"
          : "border-slate-200/90 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_24px_60px_rgb(15_23_42_/_0.14)]"
      }`}
    >
      <div className="relative h-44 overflow-hidden bg-[linear-gradient(135deg,rgb(236_254_255),rgb(240_253_244))]">
        {lesson.id === "body-parts" ? (
          <>
            <div className="absolute inset-x-10 bottom-0 top-8 rounded-t-full bg-white/70" />
            <Image
              src="/lessons/body-parts/front-body.png"
              alt=""
              width={174}
              height={537}
              aria-hidden="true"
              className="relative mx-auto h-full w-auto object-contain object-bottom drop-shadow-[0_16px_24px_rgb(15_23_42_/_0.16)]"
            />
          </>
        ) : (
          <div className="grid h-full grid-cols-4 gap-3 p-5">
            {["bg-red-400", "bg-blue-500", "bg-emerald-400", "bg-yellow-300", "bg-violet-500", "bg-pink-400", "bg-orange-400", "bg-slate-700"].map((swatch) => (
              <span
                key={swatch}
                className={`rounded-2xl border border-white/70 shadow-[0_12px_24px_rgb(15_23_42_/_0.13)] ${swatch}`}
                aria-hidden="true"
              />
            ))}
          </div>
        )}
        <span className="absolute end-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-700 shadow-sm">
          {status}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5" {...uiTextProps(language)}>
        <h4 className="text-xl font-black text-slate-950">{content.title}</h4>
        <p className="mt-2 min-h-12 text-sm font-semibold leading-6 text-slate-500">
          {content.description}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-black text-slate-600">
          <span className="rounded-2xl bg-slate-100 px-2 py-2">{lesson.exercises.length} خطوات</span>
          <span className="rounded-2xl bg-cyan-50 px-2 py-2 text-cyan-800">{lesson.xpReward} XP</span>
          <span className="rounded-2xl bg-lime-50 px-2 py-2 text-lime-800">{status}</span>
        </div>

        {locked ? (
          <button
            disabled
            aria-disabled="true"
            className="mt-5 w-full cursor-not-allowed rounded-full bg-slate-200 px-5 py-3 text-center text-sm font-black text-slate-500"
          >
            مقفل
          </button>
        ) : (
          <Link
            href={`/lesson/${lesson.id}`}
            className="mt-5 w-full rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-cyan-700"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </article>
  );
}

function getBasicsLessonContent(lesson: Lesson) {
  if (lesson.id === "colors") {
    return {
      title: "Colors / الألوان",
      description: "تعرّف على أسماء الألوان بالروسية من خلال التمارين البصرية.",
    };
  }

  return {
    title: "Body Parts / أجزاء الجسم",
    description: "تعلم أسماء أجزاء الجسم بالروسية بطريقة تفاعلية.",
  };
}

function getNextWorldStageLessonId(world: World, stageId: string, progress: SavedProgress) {
  const stageLessons = world.lessons.filter((lesson) => lesson.stageId === stageId);

  return (
    stageLessons.find(
      (lesson) =>
        !getLessonProgressState(lesson, progress).locked &&
        !progress.completedLessonIds.includes(lesson.id),
    )?.id ?? stageLessons.find((lesson) => !getLessonProgressState(lesson, progress).locked)?.id
  );
}

function StageCard({
  worldId,
  number,
  title,
  description,
  status,
  statusLabel,
  locked,
  xp,
  boss = false,
  lessonId,
  completedLessonCount,
  lessonCount,
  lessons,
  text,
  language,
}: {
  worldId: string;
  number: string;
  title: string;
  description: string;
  status: StageStatus;
  statusLabel: string;
  locked: boolean;
  xp: string;
  boss?: boolean;
  lessonId?: string;
  completedLessonCount: number;
  lessonCount: number;
  lessons: { id: string; title: string; state: "Completed" | "Current" | "Available" | "Locked" }[];
  text: UiText;
  language: ExplanationLanguage;
}) {
  const href = boss ? (worldId === "world-1" ? "/challenge" : undefined) : lessonId ? `/lesson/${lessonId}` : undefined;
  const isCompleted = status === "Completed";
  const isAvailable = status === "Unlocked";
  const actionLabel = isCompleted
    ? boss
      ? text.worlds.replayBoss
      : text.worlds.review
    : boss
      ? text.worlds.startBoss
      : completedLessonCount > 0
        ? text.common.continue
        : text.common.start;
  const badgeLabel = boss
    ? isCompleted
      ? text.worlds.bossCompleted
      : isAvailable
        ? text.worlds.bossUnlocked
        : text.worlds.bossLocked
    : statusLabel;

  return (
    <div
      className={`min-w-0 rounded-2xl border p-4 transition sm:rounded-3xl sm:p-6 ${
        locked
          ? "border-white/5 bg-slate-900/45 text-slate-400"
          : isCompleted
            ? "border-green-400/30 bg-green-400/10"
            : boss
              ? "border-yellow-400/30 bg-slate-900/80 hover:border-yellow-300/60"
              : "border-cyan-400/25 bg-slate-900/80 hover:border-cyan-300/60"
      }`}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl font-bold ${
            locked
              ? "bg-slate-800 text-slate-500"
              : isCompleted
                ? "bg-green-400 text-slate-950"
                : boss
                  ? "bg-yellow-400 text-slate-950"
                  : "bg-cyan-400 text-slate-950"
          }`}
        >
          {locked ? "L" : boss ? "B" : isCompleted ? "OK" : number}
        </div>

        <StatusBadge label={badgeLabel} locked={locked} completed={isCompleted} boss={boss} />
      </div>

      <h3 className="text-xl font-bold" {...uiTextProps(language)}>{title}</h3>
      <p className="mt-3 min-h-16 text-sm leading-6 text-slate-400" {...uiTextProps(language)}>
        {description}
      </p>

      {!boss && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-semibold text-slate-300">
            {completedLessonCount} {text.worlds.of} {lessonCount} {text.worlds.lessonsComplete}
          </p>
          <div className="grid gap-2">
            {lessons.map((lesson) => (
              <LessonStateRow key={lesson.id} title={lesson.title} state={lesson.state} language={language} text={text} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-slate-400">{xp}</span>
        {locked || !href ? (
          <button
            disabled
            aria-disabled="true"
            className="w-full cursor-not-allowed rounded-full border border-white/5 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-500 sm:w-auto"
          >
            {boss && !locked ? text.worlds.comingSoon : text.worlds.locked}
          </button>
        ) : (
          <Link
            href={href}
            className={`w-full rounded-full px-4 py-2 text-center text-sm font-semibold text-slate-950 sm:w-auto ${
              isCompleted
                ? "bg-white hover:bg-slate-200"
                : boss
                  ? "bg-yellow-400 hover:bg-yellow-300"
                  : "bg-cyan-400 hover:bg-cyan-300"
            }`}
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

function LessonStateRow({
  title,
  state,
  language,
  text,
}: {
  title: string;
  state: "Completed" | "Current" | "Available" | "Locked";
  language: ExplanationLanguage;
  text: UiText;
}) {
  const stateClass = {
    Completed: "border-green-400/25 bg-green-400/10 text-green-200",
    Current: "border-cyan-400/35 bg-cyan-400/10 text-cyan-100",
    Available: "border-white/10 bg-white/5 text-slate-300",
    Locked: "border-white/5 bg-slate-900/40 text-slate-500",
  }[state];
  const label = state === "Current" ? text.worlds.currentContinue : translateStatus(state, language);

  return (
    <div className={`rounded-2xl border px-3 py-2 ${stateClass}`}>
      <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="min-w-0 break-words text-sm font-semibold sm:truncate" {...uiTextProps(language)}>{title}</span>
        <span className="shrink-0 text-xs font-bold">{label}</span>
      </div>
    </div>
  );
}

function StatusBadge({
  label,
  locked,
  completed,
  boss,
}: {
  label: string;
  locked: boolean;
  completed: boolean;
  boss: boolean;
}) {
  const badgeClass = locked
    ? "bg-slate-800 text-slate-400"
    : completed
      ? "bg-green-400 text-slate-950"
      : boss
        ? "bg-yellow-400 text-slate-950"
        : "bg-cyan-400 text-slate-950";

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClass}`}>{label}</span>;
}
