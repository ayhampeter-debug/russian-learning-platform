"use client";

import { Navigation } from "@/components/Navigation";
import type { StageStatus, World } from "@/lib/learning-data";
import {
  getProgressStatusLabel,
  type SavedProgress,
  useProgress,
} from "@/lib/progress-storage";
import Link from "next/link";

export function WorldsClient({ world }: { world: World }) {
  const progress = useProgress();
  const summary = getWorldProgressSummary(world, progress);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="mb-10">
          <p className="text-sm text-cyan-300">Choose your path</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Worlds & Stages</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Progress through Russian step by step. Complete lessons, pass boss
            challenges, and unlock the next stage.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:rounded-3xl sm:p-6">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm text-slate-400">World {world.number}</p>
              <h2 className="text-2xl font-bold sm:text-3xl">{world.title}</h2>
              <p className="mt-2 text-slate-400">{world.description}</p>
            </div>

            <div className="w-fit rounded-full bg-yellow-400 px-5 py-2 font-bold text-slate-950">
              {summary.currentWorldProgressPercent}% Complete
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

              return (
                <StageCard
                  key={stage.id}
                  number={stage.number}
                  title={stage.title}
                  description={stage.description}
                  status={stageState.status}
                  statusLabel={getProgressStatusLabel(stageState.status)}
                  locked={stageState.locked}
                  xp={`${stage.xp} XP`}
                  boss={stage.boss}
                  lessonId={lessonId}
                  completedLessonCount={completedLessonCount}
                  lessonCount={stageLessons.length}
                />
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

function getUnlockedWorldLessonIds(world: World, completedLessonIds: string[]) {
  const completedLessons = new Set(completedLessonIds);
  const unlockedLessonIds = new Set<string>();

  world.lessons.forEach((lesson, index) => {
    if (index === 0 || completedLessons.has(lesson.id)) {
      unlockedLessonIds.add(lesson.id);
      return;
    }

    const previousLesson = world.lessons[index - 1];

    if (previousLesson && completedLessons.has(previousLesson.id)) {
      unlockedLessonIds.add(lesson.id);
    }
  });

  return Array.from(unlockedLessonIds);
}

function getWorldStageProgressState(world: World, stageId: string, progress: SavedProgress) {
  const stage = world.stages.find((stageData) => stageData.id === stageId);
  const stageLessons = world.lessons.filter((lesson) => lesson.stageId === stageId);
  const completedLessons = new Set(progress.completedLessonIds);
  const unlockedLessons = new Set(getUnlockedWorldLessonIds(world, progress.completedLessonIds));

  if (stage?.boss) {
    if (progress.completedChallengeIds.includes("world-1-boss")) {
      return { status: "Completed" as StageStatus, locked: false };
    }

    const bossUnlocked = world.lessons.every((lesson) => completedLessons.has(lesson.id));
    return {
      status: bossUnlocked ? ("Unlocked" as StageStatus) : ("Locked" as StageStatus),
      locked: !bossUnlocked,
    };
  }

  if (stageLessons.length > 0 && stageLessons.every((lesson) => completedLessons.has(lesson.id))) {
    return { status: "Completed" as StageStatus, locked: false };
  }

  if (stageLessons.some((lesson) => unlockedLessons.has(lesson.id))) {
    return { status: "Unlocked" as StageStatus, locked: false };
  }

  return { status: "Locked" as StageStatus, locked: true };
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

function getWorldProgressSummary(world: World, progress: SavedProgress) {
  const completedWorldLessons = world.lessons.filter((lesson) =>
    progress.completedLessonIds.includes(lesson.id),
  );
  const bossCompleted = progress.completedChallengeIds.includes("world-1-boss");
  const totalSteps = world.lessons.length + 1;
  const clearedSteps = completedWorldLessons.length + (bossCompleted ? 1 : 0);

  return {
    currentWorldProgressPercent: Math.round((clearedSteps / totalSteps) * 100),
  };
}

function StageCard({
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
}: {
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
}) {
  const href = boss ? "/challenge" : lessonId ? `/lesson/${lessonId}` : undefined;
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
        <p className="mt-4 text-sm font-semibold text-slate-300">
          {completedLessonCount} of {lessonCount} lessons complete
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-slate-400">{xp}</span>
        {locked || !href ? (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-full border border-white/5 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-500 sm:w-auto"
          >
            🔒 Locked
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
