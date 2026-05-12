"use client";

import { Navigation } from "@/components/Navigation";
import { userProgress, worldOne, worlds } from "@/lib/learning-data";
import {
  getLessonDisplayState,
  getLessonProgressState,
  getProgressSummary,
  getProgressStatusLabel,
  getWorldProgressSummary,
  resetProgress,
  useProgress,
} from "@/lib/progress-storage";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useUser();
  const progress = useProgress();
  const summary = getProgressSummary(progress);
  const bossActionUnlocked = summary.bossUnlocked || summary.bossCompleted;
  const currentWorld = summary.currentWorld;
  const worldOneSummary = summary.worldOneSummary ?? getWorldProgressSummary(worldOne, progress);
  const worldTwo = worlds.find((world) => world.number === 2);
  const worldTwoSummary =
    summary.worldTwoSummary ?? (worldTwo ? getWorldProgressSummary(worldTwo, progress) : null);
  const noProgress =
    summary.completedLessons.length === 0 &&
    summary.completedChallenges.length === 0 &&
    progress.totalXp === 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-cyan-300">Welcome back</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Your language journey</h1>
            <p className="mt-3 text-slate-400">
              {isLoaded && !isSignedIn
                ? "Guest progress is saved on this device. Sign in when you want it synced."
                : "Continue learning through short lessons, XP rewards, and boss challenges."}
            </p>
            {noProgress ? (
              <p className="mt-3 max-w-2xl rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                New run detected. Start the first lesson to bank XP and unlock the boss gate.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => {
                resetProgress();
                window.location.reload();
              }}
              className="w-full rounded-full border border-red-400/30 px-4 py-2 text-sm font-semibold text-red-200 transition hover:border-red-300/60 hover:bg-red-400/10 sm:w-auto"
            >
              Reset Progress
            </button>
            <Link
              href={summary.continueHref}
              className="w-full rounded-full bg-cyan-400 px-6 py-3 text-center font-semibold text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
            >
              {summary.continueLabel}
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <StatCard
            title="XP Earned"
            value={progress.totalXp.toLocaleString()}
            icon="XP"
            label="Total experience points"
          />
          <StatCard
            title="Lessons Done"
            value={`${summary.totalCompletedLessons}/${worlds.flatMap((world) => world.lessons).length}`}
            icon="OK"
            label="Total lessons completed"
          />
          <StatCard
            title="Hearts"
            value={progress.hearts.toString()}
            icon="HP"
            label="Mistakes you can absorb"
          />
          <StatCard
            title="Streak"
            value={progress.currentStreak > 0 ? `${progress.currentStreak} days` : "Soon"}
            icon="ST"
            label={
              progress.currentStreak > 0
                ? "Days practiced in a row"
                : "Daily streak coming soon"
            }
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:rounded-3xl sm:p-6 lg:col-span-2">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-400">Current course: Russian</p>
                <h2 className="text-xl font-bold sm:text-2xl">{currentWorld.subtitle}</h2>
              </div>
              <span className="w-fit rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-950">
                Level {Math.max(userProgress.level, Math.floor(progress.totalXp / 500) + 1)}
              </span>
            </div>

            <div className="mb-3 flex flex-col gap-1 text-sm text-slate-400 sm:flex-row sm:justify-between">
              <span>
                {summary.clearedSteps} of {summary.totalSteps} current-world steps cleared
              </span>
              <span>{summary.currentWorldProgressPercent}%</span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-cyan-400"
                style={{ width: `${summary.currentWorldProgressPercent}%` }}
              />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {currentWorld.lessons.map((lesson) => {
                const lessonState = getLessonProgressState(lesson, progress);
                const displayState = getLessonDisplayState(lesson, progress);

                return (
                  <LessonMiniCard
                    key={lesson.id}
                    title={lesson.title}
                    status={
                      displayState === "Current"
                        ? "Current/Continue"
                        : getProgressStatusLabel(lessonState.status)
                    }
                    locked={lessonState.locked}
                    current={displayState === "Current"}
                  />
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:rounded-3xl sm:p-6">
            <p className="text-sm text-slate-400">Next recommended</p>
            <h2 className="mt-2 text-xl font-bold sm:text-2xl">
              {summary.nextRecommendedLesson?.title ??
                (summary.bossCompleted ? "World 1 completed" : worldOne.bossTitle)}
            </h2>
            <p className="mt-3 text-slate-300">
              {summary.nextRecommendedLesson
                ? summary.nextGoalDescription
                : summary.bossCompleted
                  ? "The World 1 boss is defeated. Continue into World 2 or review completed worlds."
                  : "All World 1 lessons are complete. The boss challenge is ready."}
            </p>

            <div className="mt-6 grid gap-3 text-sm">
              <ProgressLine
                label="World 1"
                value={
                  worldOneSummary.completed
                    ? "Completed"
                    : `${worldOneSummary.completedLessonCount}/${worldOneSummary.totalLessons} lessons`
                }
              />
              <ProgressLine
                label="Boss Challenge"
                value={
                  summary.bossCompleted
                    ? "Boss defeated"
                    : summary.bossUnlocked
                      ? "Available"
                      : "Locked"
                }
              />
              <ProgressLine
                label="World 2"
                value={
                  worldTwoSummary?.unlocked
                    ? "Unlocked"
                    : "Locked"
                }
              />
            </div>

            {bossActionUnlocked ? (
              <Link
                href={summary.bossCompleted ? summary.continueHref : "/challenge"}
                className="mt-6 block w-full rounded-full bg-white px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                {summary.bossCompleted ? summary.continueLabel : "Start Boss Challenge"}
              </Link>
            ) : summary.nextRecommendedLesson ? (
              <Link
                href={summary.continueHref}
                className="mt-6 block w-full rounded-full bg-cyan-400 px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Continue Learning
              </Link>
            ) : (
              <button
                disabled
                className="mt-6 block w-full rounded-full bg-slate-800 px-5 py-3 text-center font-semibold text-slate-500"
              >
                Boss Locked
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function ProgressLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  label,
}: {
  title: string;
  value: string;
  icon: string;
  label: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-4 sm:rounded-3xl sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black tracking-wide text-cyan-300">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-slate-400">{label}</p>
        </div>
      </div>
      <p className="mt-5 break-words text-2xl font-bold sm:text-3xl">{value}</p>
    </div>
  );
}

function LessonMiniCard({
  title,
  status,
  locked = false,
  current = false,
}: {
  title: string;
  status: string;
  locked?: boolean;
  current?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-2xl border p-4 ${
        locked
          ? "border-white/5 bg-slate-900/40 opacity-60"
          : current
            ? "border-cyan-400/40 bg-cyan-400/10"
            : "border-white/10 bg-slate-900/70"
      }`}
    >
      <p className="font-semibold">{locked ? "Locked: " : ""}{title}</p>
      <p className="mt-2 text-sm text-slate-400">{status}</p>
    </div>
  );
}
