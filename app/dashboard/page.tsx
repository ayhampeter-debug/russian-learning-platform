"use client";

import { Navigation } from "@/components/Navigation";
import { useExplanationLanguage } from "@/components/LanguageSelector";
import { userProgress, worldOne, worlds } from "@/lib/learning-data";
import { getUiText, localizeActionLabel, translateStatus, uiTextProps } from "@/lib/ui-translations";
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
  const { language } = useExplanationLanguage();
  const text = getUiText(language);
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
            <p className="text-sm text-cyan-300" {...uiTextProps(language)}>{text.dashboard.welcomeBack}</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl" {...uiTextProps(language)}>{text.dashboard.journey}</h1>
            <p className="mt-3 text-slate-400">
              {isLoaded && !isSignedIn
                ? text.dashboard.guestSaved
                : text.dashboard.continueShort}
            </p>
            {noProgress ? (
              <p className="mt-3 max-w-2xl rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                {text.dashboard.newRun}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => {
                const confirmed = window.confirm(
                  text.dashboard.resetConfirm,
                );

                if (confirmed) {
                  resetProgress();
                  window.location.reload();
                }
              }}
              className="w-full rounded-full border border-red-400/30 px-4 py-2 text-sm font-semibold text-red-200 transition hover:border-red-300/60 hover:bg-red-400/10 sm:w-auto"
            >
              {text.dashboard.resetLocalProgress}
            </button>
            <Link
              href={summary.continueHref}
              className="w-full rounded-full bg-cyan-400 px-6 py-3 text-center font-semibold text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
            >
              {localizeActionLabel(summary.continueLabel, language)}
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <StatCard
            title={text.dashboard.xpEarned}
            value={progress.totalXp.toLocaleString()}
            icon="XP"
            label={text.dashboard.totalExperiencePoints}
            tone="xp"
          />
          <StatCard
            title={text.dashboard.lessonsDone}
            value={`${summary.totalCompletedLessons}/${worlds.flatMap((world) => world.lessons).length}`}
            icon="OK"
            label={text.dashboard.totalLessonsCompleted}
            tone="success"
          />
          <StatCard
            title={text.dashboard.hearts}
            value={progress.hearts.toString()}
            icon="HP"
            label={text.dashboard.mistakesAbsorb}
            tone="danger"
          />
          <StatCard
            title={text.dashboard.streak}
            value={progress.currentStreak > 0 ? `${progress.currentStreak} ${text.dashboard.days}` : text.dashboard.soon}
            icon="ST"
            label={
              progress.currentStreak > 0
                ? text.dashboard.daysPracticed
                : text.dashboard.dailyStreakComingSoon
            }
            tone="primary"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:rounded-3xl sm:p-6 lg:col-span-2">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-400" {...uiTextProps(language)}>{text.dashboard.currentCoursePath}</p>
                <h2 className="text-xl font-bold sm:text-2xl">{currentWorld.subtitle}</h2>
              </div>
              <span className="w-fit rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-950">
                {text.dashboard.level} {Math.max(userProgress.level, Math.floor(progress.totalXp / 500) + 1)}
              </span>
            </div>

            <div className="mb-3 flex flex-col gap-1 text-sm text-slate-400 sm:flex-row sm:justify-between">
              <span>
                {summary.clearedSteps} {text.dashboard.of} {summary.totalSteps} {text.dashboard.currentWorldSteps}
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
                        ? text.dashboard.currentContinue
                        : translateStatus(getProgressStatusLabel(lessonState.status), language)
                    }
                    lockedLabel={text.dashboard.locked}
                    locked={lessonState.locked}
                    current={displayState === "Current"}
                  />
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:rounded-3xl sm:p-6">
            <p className="text-sm text-slate-400" {...uiTextProps(language)}>{text.dashboard.nextRecommended}</p>
            <h2 className="mt-2 text-xl font-bold sm:text-2xl">
              {summary.nextRecommendedLesson?.title ??
                (summary.bossCompleted ? text.dashboard.worldOneCompleted : worldOne.bossTitle)}
            </h2>
            <p className="mt-3 text-slate-300">
              {summary.nextRecommendedLesson
                ? summary.nextGoalDescription
                : summary.bossCompleted
                  ? text.dashboard.bossDefeatedNext
                  : text.dashboard.bossReady}
            </p>

            <div className="mt-6 grid gap-3 text-sm">
              <ProgressLine
                label={text.dashboard.world1}
                value={
                  worldOneSummary.completed
                    ? text.dashboard.completed
                    : `${worldOneSummary.completedLessonCount}/${worldOneSummary.totalLessons} ${text.dashboard.lessons}`
                }
              />
              <ProgressLine
                label={text.dashboard.bossChallenge}
                value={
                  summary.bossCompleted
                    ? text.dashboard.bossDefeated
                    : summary.bossUnlocked
                      ? text.dashboard.available
                      : text.dashboard.locked
                }
              />
              <ProgressLine
                label={text.dashboard.world2}
                value={
                  worldTwoSummary?.unlocked
                    ? text.dashboard.unlocked
                    : text.dashboard.locked
                }
              />
            </div>

            {bossActionUnlocked ? (
              <Link
                href={summary.bossCompleted ? summary.continueHref : "/challenge"}
                className="mt-6 block w-full rounded-full bg-white px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                {summary.bossCompleted ? localizeActionLabel(summary.continueLabel, language) : text.dashboard.startBossChallenge}
              </Link>
            ) : summary.nextRecommendedLesson ? (
              <Link
                href={summary.continueHref}
                className="mt-6 block w-full rounded-full bg-cyan-400 px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                {text.dashboard.continueLearning}
              </Link>
            ) : (
              <button
                disabled
                aria-disabled="true"
                className="mt-6 block w-full rounded-full bg-slate-800 px-5 py-3 text-center font-semibold text-slate-500"
              >
                {text.dashboard.completeWorldOneLessons}
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
  tone,
}: {
  title: string;
  value: string;
  icon: string;
  label: string;
  tone: "primary" | "xp" | "success" | "danger";
}) {
  const toneClass = {
    primary: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    xp: "border-yellow-400/25 bg-yellow-400/10 text-yellow-300",
    success: "border-green-400/25 bg-green-400/10 text-green-300",
    danger: "border-red-400/25 bg-red-400/10 text-red-300",
  }[tone];

  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-4 sm:rounded-3xl sm:p-6">
      <div className="flex items-center gap-3">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-black tracking-wide ${toneClass}`}>
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
  lockedLabel,
  locked = false,
  current = false,
}: {
  title: string;
  status: string;
  lockedLabel: string;
  locked?: boolean;
  current?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-2xl border p-4 ${
        locked
          ? "border-white/5 bg-slate-900/40 text-slate-400"
          : current
            ? "border-cyan-400/40 bg-cyan-400/10"
            : "border-white/10 bg-slate-900/70"
      }`}
    >
      <p className="font-semibold">{locked ? `${lockedLabel}: ` : ""}{title}</p>
      <p className="mt-2 text-sm text-slate-400">{status}</p>
    </div>
  );
}
