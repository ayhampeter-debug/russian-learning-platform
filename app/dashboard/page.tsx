"use client";

import { Navigation } from "@/components/Navigation";
import { userProgress, worldOne } from "@/lib/learning-data";
import {
  getLessonProgressState,
  getProgressSummary,
  getProgressStatusLabel,
  resetProgress,
  useProgress,
} from "@/lib/progress-storage";
import Link from "next/link";

export default function DashboardPage() {
  const progress = useProgress();
  const summary = getProgressSummary(progress);
  const bossActionUnlocked = summary.bossUnlocked || summary.bossCompleted;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-cyan-300">Welcome back</p>
            <h1 className="mt-2 text-4xl font-bold">Your Russian Journey</h1>
            <p className="mt-3 text-slate-400">
              Continue your progress through short lessons, XP rewards, and daily challenges.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => {
                resetProgress();
                window.location.reload();
              }}
              className="rounded-full border border-red-400/30 px-4 py-2 text-sm font-semibold text-red-200 transition hover:border-red-300/60 hover:bg-red-400/10"
            >
              Reset Progress
            </button>
            <Link
              href={summary.continueHref}
              className="rounded-full bg-cyan-400 px-6 py-3 text-center font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              {summary.continueLabel}
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <StatCard
            title="XP Earned"
            value={progress.totalXp.toLocaleString()}
            icon="⚡"
            label="Total experience points"
          />
          <StatCard
            title="Current Streak"
            value={`${progress.currentStreak} days`}
            icon="🔥"
            label="Days practiced in a row"
          />
          <StatCard
            title="Hearts"
            value={progress.hearts.toString()}
            icon="❤️"
            label="Mistakes you can absorb"
          />
          <StatCard
            title="Achievements"
            value={userProgress.achievementsEarned.length.toString()}
            icon="🏆"
            label="Badges unlocked"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Current world</p>
                <h2 className="text-2xl font-bold">{worldOne.subtitle}</h2>
              </div>
              <span className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-950">
                Level {Math.max(userProgress.level, Math.floor(progress.totalXp / 500))}
              </span>
            </div>

            <div className="mb-3 flex justify-between text-sm text-slate-400">
              <span>Progress</span>
              <span>{summary.currentWorldProgressPercent}%</span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-cyan-400"
                style={{ width: `${summary.currentWorldProgressPercent}%` }}
              />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {worldOne.lessons.map((lesson) => {
                const lessonState = getLessonProgressState(lesson, progress);

                return (
                  <LessonMiniCard
                    key={lesson.id}
                    title={lesson.title}
                    status={getProgressStatusLabel(lessonState.status)}
                    locked={lessonState.locked}
                  />
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
            <p className="text-sm text-slate-400">Daily Challenge</p>
            <h2 className="mt-2 text-2xl font-bold">{worldOne.dailyChallengeTitle}</h2>
            <p className="mt-3 text-slate-300">
              {worldOne.dailyChallengeDescription}
            </p>

            {bossActionUnlocked ? (
              <Link
                href="/challenge"
                className="mt-6 block w-full rounded-full bg-white px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                {summary.bossCompleted ? "Replay Boss Challenge" : "Start Boss Challenge"}
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
    <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-2xl">
          {icon}
        </span>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-slate-400">{label}</p>
        </div>
      </div>
      <p className="mt-5 text-3xl font-bold">{value}</p>
    </div>
  );
}

function LessonMiniCard({
  title,
  status,
  locked = false,
}: {
  title: string;
  status: string;
  locked?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        locked
          ? "border-white/5 bg-slate-900/40 opacity-50"
          : "border-white/10 bg-slate-900/70"
      }`}
    >
      <p className="font-semibold">{locked ? "🔒 Locked: " : ""}{title}</p>
      <p className="mt-2 text-sm text-slate-400">{status}</p>
    </div>
  );
}
