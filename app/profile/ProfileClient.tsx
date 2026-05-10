"use client";

import { Navigation } from "@/components/Navigation";
import { useUser } from "@clerk/nextjs";
import {
  achievements,
  recentActivity,
  userProgress,
  worldOne,
  type Achievement,
  type RecentActivity,
  type StatAccent,
} from "@/lib/learning-data";
import {
  getProgressSummary,
  getProgressStatusLabel,
  getStageProgressState,
  useProgress,
} from "@/lib/progress-storage";
import Link from "next/link";

type ProfileUser = {
  email: string;
  name: string | null;
  imageUrl: string | null;
  profile: {
    displayName: string;
    initials: string | null;
  } | null;
} | null;

type ProfileClientProps = {
  syncError: string | null;
  user: ProfileUser;
};

type StatCardProps = {
  title: string;
  value: string;
  accent: StatAccent;
};

function getInitials(displayName: string) {
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || userProgress.initials;
}

export function ProfileClient({ syncError, user }: ProfileClientProps) {
  const { user: clerkUser } = useUser();
  const progress = useProgress();
  const summary = getProgressSummary(progress);
  const clerkEmail = clerkUser?.primaryEmailAddress?.emailAddress ?? null;
  const clerkName =
    clerkUser?.fullName ||
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
    clerkUser?.username ||
    clerkEmail?.split("@")[0] ||
    null;
  const profileUser =
    user ??
    (clerkUser
      ? {
          email: clerkEmail ?? "",
          name: clerkName,
          imageUrl: clerkUser.imageUrl || null,
          profile: clerkName
            ? {
                displayName: clerkName,
                initials: getInitials(clerkName),
              }
            : null,
        }
      : null);
  const displayName =
    profileUser?.profile?.displayName ?? profileUser?.name ?? userProgress.userName;
  const initials = profileUser?.profile?.initials ?? userProgress.initials;
  const dynamicStats: StatCardProps[] = [
    { title: "Total XP", value: progress.totalXp.toLocaleString(), accent: "cyan" },
    { title: "Current Streak", value: `${progress.currentStreak} days`, accent: "red" },
    { title: "Longest Streak", value: `${userProgress.longestStreak} days`, accent: "yellow" },
    { title: "Completed Lessons", value: summary.completedLessons.length.toString(), accent: "green" },
    { title: "Completed Stages", value: summary.completedStageIds.length.toString(), accent: "cyan" },
    {
      title: "Boss Challenge",
      value: summary.bossCompleted ? "Completed" : summary.bossUnlocked ? "Available" : "Locked",
      accent: summary.bossCompleted ? "green" : summary.bossUnlocked ? "cyan" : "red",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Player profile
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl md:text-6xl">
              {displayName}
            </h1>
            <p className="mt-4 max-w-2xl text-slate-400">
              Track your Russian journey through XP, streaks, achievements, and
              World 1 progress.
            </p>
            {syncError ? (
              <p className="mt-3 max-w-2xl text-sm text-yellow-200">
                {syncError} Local progress is still available on this device.
              </p>
            ) : null}
          </div>

          <Link
            href="/dashboard"
            className="inline-flex w-full justify-center rounded-full bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 sm:w-fit"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {dynamicStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-2xl border border-cyan-400/20 bg-white/10 p-4 shadow-2xl shadow-cyan-950/30 sm:rounded-3xl sm:p-6 md:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-sm text-slate-400">World 1 progress</p>
                <h2 className="mt-2 text-2xl font-black sm:text-3xl">{worldOne.title}</h2>
                <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                  Greetings, introductions, survival phrases, basic questions,
                  and the first conversation challenge.
                </p>
              </div>

              <span className="w-fit rounded-full bg-yellow-400 px-5 py-2 text-sm font-black text-slate-950">
                {summary.currentWorldProgressPercent}% Complete
              </span>
            </div>

            <div className="mt-8">
              <div className="mb-3 flex flex-col gap-1 text-sm text-slate-400 sm:flex-row sm:justify-between">
                <span>
                  {summary.clearedSteps} of {summary.totalSteps} steps cleared
                </span>
                <span>{summary.profileWorldXp} XP earned</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{ width: `${summary.currentWorldProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {worldOne.stages.map((stage) => {
                const stageState = getStageProgressState(stage.id, progress);
                const statusLabel = getProgressStatusLabel(stageState.status);
                const tone =
                  stageState.status === "Completed"
                    ? "done"
                    : statusLabel === "Available"
                      ? "active"
                      : "locked";

                return (
                  <WorldStep
                    key={stage.id}
                    title={stage.title}
                    status={statusLabel}
                    tone={tone}
                  />
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:rounded-3xl sm:p-6 md:p-8">
            <p className="text-sm text-slate-400">Learning identity</p>
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-cyan-400/30 bg-cyan-400 text-3xl font-black text-slate-950">
                {profileUser?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileUser.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-black">{displayName}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Beginner path: English speaker learning practical Russian.
                </p>
                {profileUser?.email ? (
                  <p className="mt-1 break-words text-sm text-slate-500">
                    {profileUser.email}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Next goal</p>
              <p className="mt-2 text-xl font-bold">
                {summary.nextGoalTitle}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {summary.nextGoalDescription}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:rounded-3xl sm:p-6 md:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-400">Trophy shelf</p>
                <h2 className="mt-2 text-2xl font-black">Achievements</h2>
              </div>
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-300">
                {userProgress.achievementsEarned.length} unlocked
              </span>
            </div>

            <div className="grid gap-4">
              {achievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:rounded-3xl sm:p-6 md:p-8">
            <div className="mb-6">
              <p className="text-sm text-slate-400">Quest log</p>
              <h2 className="mt-2 text-2xl font-black">Recent Activity</h2>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <ActivityItem key={`${activity.title}-${activity.time}`} activity={activity} />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function StatCard({ title, value, accent }: StatCardProps) {
  const accentClass = {
    cyan: "text-cyan-300",
    yellow: "text-yellow-300",
    red: "text-red-300",
    green: "text-green-300",
  }[accent];

  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-4 sm:rounded-3xl sm:p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className={`mt-3 break-words text-2xl font-black sm:text-3xl ${accentClass}`}>{value}</p>
    </div>
  );
}

function WorldStep({
  title,
  status,
  tone,
}: {
  title: string;
  status: string;
  tone: "done" | "active" | "locked";
}) {
  const toneClass = {
    done: "border-green-400/30 bg-green-400/10 text-green-200",
    active: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
    locked: "border-white/5 bg-slate-900/50 text-slate-500",
  }[tone];

  return (
    <div className={`min-w-0 rounded-2xl border p-4 sm:p-5 ${toneClass}`}>
      <p className="break-words font-bold">{title}</p>
      <p className="mt-2 text-sm opacity-80">{status}</p>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const isUnlocked = achievement.status === "Unlocked";

  return (
    <div
      className={`min-w-0 rounded-2xl border p-4 sm:p-5 ${
        isUnlocked
          ? "border-yellow-400/30 bg-yellow-400/10"
          : "border-white/10 bg-slate-900/70"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h3 className="font-bold">{achievement.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {achievement.description}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
            isUnlocked
              ? "bg-yellow-400 text-slate-950"
              : "bg-white/10 text-slate-300"
          }`}
        >
          {achievement.status}
        </span>
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div>
          <p className="font-bold">{activity.title}</p>
          <p className="mt-2 text-sm text-slate-400">{activity.detail}</p>
        </div>
        <span className="text-sm text-cyan-300">{activity.time}</span>
      </div>
    </div>
  );
}
