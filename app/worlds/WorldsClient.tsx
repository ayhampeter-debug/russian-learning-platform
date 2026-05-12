"use client";

import { Navigation } from "@/components/Navigation";
import type { StageStatus, World } from "@/lib/learning-data";
import {
  getLessonDisplayState,
  getProgressStatusLabel,
  getUnlockedWorldLessonIds,
  getWorldProgressSummary,
  getWorldStageProgressState,
  isWorldUnlocked,
  type SavedProgress,
  useProgress,
} from "@/lib/progress-storage";
import Link from "next/link";

export function WorldsClient({ worlds }: { worlds: World[] }) {
  const progress = useProgress();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="mb-10">
          <p className="text-sm text-cyan-300">Choose your path</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Worlds & Stages</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Progress through your current Russian course step by step. Complete
            lessons, pass boss challenges, and unlock the next stage.
          </p>
        </div>

        <div className="space-y-8">
          {worlds.map((world) => {
            const summary = getWorldProgressSummary(world, progress);
            const worldUnlocked = isWorldUnlocked(world, progress);
            const unlockedLessonIds = getUnlockedWorldLessonIds(world, progress.completedLessonIds);
            const firstAvailableLesson = world.lessons.find((lesson) =>
              unlockedLessonIds.includes(lesson.id),
            );
            const nextLesson = world.lessons.find(
              (lesson) =>
                unlockedLessonIds.includes(lesson.id) &&
                !progress.completedLessonIds.includes(lesson.id),
            );
            const worldHref =
              worldUnlocked && (nextLesson || firstAvailableLesson)
                ? `/lesson/${(nextLesson ?? firstAvailableLesson)?.id}`
                : undefined;
            const ctaLabel = !worldUnlocked
              ? "Locked"
              : summary.completed
                ? "Review"
                : summary.completedLessonCount > 0
                  ? "Continue World"
                  : "Start World";

            return (
              <div
                key={world.id}
                className={`rounded-2xl border p-4 sm:rounded-3xl sm:p-6 ${
                  worldUnlocked
                    ? "border-white/10 bg-white/10"
                    : "border-white/5 bg-slate-900/60"
                }`}
              >
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm text-slate-400">World {world.number}</p>
                    <h2 className="text-2xl font-bold sm:text-3xl">{world.title}</h2>
                    <p className="mt-2 max-w-3xl text-slate-400">{world.description}</p>
                    {!worldUnlocked ? (
                      <p className="mt-3 text-sm font-semibold text-yellow-200">
                        Locked until all World 1 lessons are complete and the World 1 boss is defeated.
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-3 sm:items-end">
                    <div className="w-fit rounded-full bg-yellow-400 px-5 py-2 font-bold text-slate-950">
                      {summary.progressPercent}% Complete
                    </div>
                    <p className="text-sm text-slate-400">
                      {summary.completedLessonCount}/{summary.totalLessons} lessons complete
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
                        className="w-full cursor-not-allowed rounded-full bg-slate-800 px-5 py-2 text-sm font-bold text-slate-500 sm:w-auto"
                      >
                        {ctaLabel}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {world.stages.map((stage) => {
                    const stageState = getWorldStageProgressState(world, stage.id, progress);
                    const lessonId = getNextWorldStageLessonId(world, stage.id, progress);
                    const stageLessons = world.lessons.filter((lesson) => lesson.stageId === stage.id);
                    const completedLessonCount = stageLessons.filter((lesson) =>
                      progress.completedLessonIds.includes(lesson.id),
                    ).length;
                    const locked = !worldUnlocked || stageState.locked;

                    return (
                      <StageCard
                        key={stage.id}
                        worldId={world.id}
                        number={stage.number}
                        title={stage.title}
                        description={stage.description}
                        status={locked ? "Locked" : stageState.status}
                        statusLabel={getProgressStatusLabel(locked ? "Locked" : stageState.status)}
                        locked={locked}
                        xp={`${stage.xp} XP`}
                        boss={stage.boss}
                        lessonId={lessonId}
                        completedLessonCount={completedLessonCount}
                        lessonCount={stageLessons.length}
                        lessons={stageLessons.map((lesson) => ({
                          id: lesson.id,
                          title: lesson.title,
                          state: !worldUnlocked ? "Locked" : getLessonDisplayState(lesson, progress),
                        }))}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function getNextWorldStageLessonId(world: World, stageId: string, progress: SavedProgress) {
  const stageLessons = world.lessons.filter((lesson) => lesson.stageId === stageId);
  const unlockedLessonIds = new Set(getUnlockedWorldLessonIds(world, progress.completedLessonIds));

  return (
    stageLessons.find(
      (lesson) =>
        unlockedLessonIds.has(lesson.id) && !progress.completedLessonIds.includes(lesson.id),
    )?.id ?? stageLessons.find((lesson) => unlockedLessonIds.has(lesson.id))?.id
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
}) {
  const href = boss ? (worldId === "world-1" ? "/challenge" : undefined) : lessonId ? `/lesson/${lessonId}` : undefined;
  const isCompleted = status === "Completed";
  const isAvailable = statusLabel === "Available";
  const actionLabel = isCompleted
    ? boss
      ? "Replay Boss"
      : "Review"
    : boss
      ? "Start Boss"
      : completedLessonCount > 0
        ? "Continue"
        : "Start";
  const badgeLabel = boss
    ? isCompleted
      ? "Boss Completed"
      : isAvailable
        ? "Boss Unlocked"
        : "Boss Locked"
    : statusLabel;

  return (
    <div
      className={`min-w-0 rounded-2xl border p-4 transition sm:rounded-3xl sm:p-6 ${
        locked
          ? "border-white/5 bg-slate-900/45 opacity-60"
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
          {locked ? "🔒" : boss ? "★" : isCompleted ? "✓" : number}
        </div>

        <StatusBadge label={badgeLabel} locked={locked} completed={isCompleted} boss={boss} />
      </div>

      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-3 min-h-16 text-sm leading-6 text-slate-400">{description}</p>

      {!boss && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-semibold text-slate-300">
            {completedLessonCount} of {lessonCount} lessons complete
          </p>
          <div className="grid gap-2">
            {lessons.map((lesson) => (
              <LessonStateRow key={lesson.id} title={lesson.title} state={lesson.state} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-slate-400">{xp}</span>
        {locked || !href ? (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-full border border-white/5 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-500 sm:w-auto"
          >
            {boss && !locked ? "Coming Soon" : "🔒 Locked"}
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
}: {
  title: string;
  state: "Completed" | "Current" | "Available" | "Locked";
}) {
  const stateClass = {
    Completed: "border-green-400/25 bg-green-400/10 text-green-200",
    Current: "border-cyan-400/35 bg-cyan-400/10 text-cyan-100",
    Available: "border-white/10 bg-white/5 text-slate-300",
    Locked: "border-white/5 bg-slate-900/40 text-slate-500",
  }[state];
  const label = state === "Current" ? "Current/Continue" : state;

  return (
    <div className={`rounded-2xl border px-3 py-2 ${stateClass}`}>
      <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="min-w-0 truncate text-sm font-semibold">{title}</span>
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
