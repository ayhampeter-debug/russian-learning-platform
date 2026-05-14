"use client";

import { Navigation } from "@/components/Navigation";
import { LanguageSelector, useExplanationLanguage } from "@/components/LanguageSelector";
import type { ProfileAchievementRow } from "@/lib/achievement-service";
import { getUiText, translateStatus, uiTextProps } from "@/lib/ui-translations";
import { useUser } from "@clerk/nextjs";
import {
  recentActivity,
  userProgress,
  worldOne,
  type RecentActivity,
  type StatAccent,
} from "@/lib/learning-data";
import {
  getProgressSummary,
  getProgressStatusLabel,
  getStageProgressState,
  getWorldProgressSummary,
  useProgress,
} from "@/lib/progress-storage";
import Link from "next/link";
import type { ExplanationLanguage } from "@/lib/language-preference";

type ProfileUser = {
  email: string;
  name: string | null;
  imageUrl: string | null;
  profile: {
    displayName: string;
    initials: string | null;
    longestStreak?: number;
  } | null;
} | null;

type ProfileClientProps = {
  achievements: ProfileAchievementRow[];
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

type DisplayAchievement = {
  id: string;
  title: string;
  description: string;
  status: "Unlocked" | "In progress";
  detail: string;
};

const achievementDefinitions = [
  {
    id: "first-lesson-completed",
    title: "First Lesson Completed",
    description: "Clear any World 1 lesson.",
    dbSlugs: ["first-lesson-completed", "first-lesson", "first-contact"],
  },
  {
    id: "first-contact-completed",
    title: "World 1 Completed",
    description: "Complete every lesson in World 1.",
    dbSlugs: ["first-contact-completed", "world-1-completed", "world-1-lessons"],
  },
  {
    id: "boss-defeated",
    title: "Boss Defeated",
    description: "Pass the First Contact boss challenge.",
    dbSlugs: ["boss-defeated", "world-1-boss", "boss-challenger"],
  },
  {
    id: "world-2-unlocked",
    title: "World 2 Unlocked",
    description: "Unlock Everyday Basics by clearing World 1 and defeating the boss.",
    dbSlugs: ["world-2-unlocked", "everyday-basics-unlocked"],
  },
  {
    id: "xp-starter",
    title: "XP Starter",
    description: "Earn your first 100 XP.",
    dbSlugs: ["xp-starter"],
  },
];

function getDisplayAchievements(
  rows: ProfileAchievementRow[],
  progress: ReturnType<typeof useProgress>,
): DisplayAchievement[] {
  const unlockedRows = new Set(
    rows.filter((row) => row.status === "UNLOCKED").map((row) => row.slug),
  );
  const rowBySlug = new Map(rows.map((row) => [row.slug, row]));
  const allLessonsCompleted = worldOne.lessons.every((lesson) =>
    progress.completedLessonIds.includes(lesson.id),
  );
  const bossCompleted = progress.completedChallengeIds.includes("world-1-boss");
  const worldTwoUnlocked = allLessonsCompleted && bossCompleted;

  return achievementDefinitions.map((definition) => {
    const dbRow = definition.dbSlugs.map((slug) => rowBySlug.get(slug)).find(Boolean);
    const dbUnlocked = definition.dbSlugs.some((slug) => unlockedRows.has(slug));
    const inferredUnlocked =
      definition.id === "first-lesson-completed"
        ? progress.completedLessonIds.length > 0
        : definition.id === "first-contact-completed"
          ? allLessonsCompleted
          : definition.id === "boss-defeated"
            ? bossCompleted
            : definition.id === "world-2-unlocked"
              ? worldTwoUnlocked
              : progress.totalXp >= 100;
    const isUnlocked = dbUnlocked || inferredUnlocked;

    return {
      id: definition.id,
      title: dbRow?.title ?? definition.title,
      description: dbRow?.description ?? definition.description,
      status: isUnlocked ? "Unlocked" : "In progress",
      detail: dbRow
        ? "Synced from your profile achievements."
        : isUnlocked
          ? "Unlocked from current progress."
          : "Keep learning to unlock this badge.",
    };
  });
}

export function ProfileClient({ achievements, syncError, user }: ProfileClientProps) {
  const { language } = useExplanationLanguage();
  const text = getUiText(language);
  const { isLoaded, user: clerkUser } = useUser();
  const progress = useProgress();
  const summary = getProgressSummary(progress);
  const worldOneSummary = summary.worldOneSummary ?? getWorldProgressSummary(worldOne, progress);
  const worldTwoSummary = summary.worldTwoSummary;
  const worldOneXp = worldOneSummary.completedLessons.reduce(
    (total, lesson) => total + lesson.xpReward,
    worldOneSummary.bossCompleted ? 200 : 0,
  );
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
    { title: text.profile.totalXp, value: progress.totalXp.toLocaleString(), accent: "cyan" },
    { title: text.profile.currentStreak, value: `${progress.currentStreak} ${text.profile.days}`, accent: "red" },
    {
      title: text.profile.longestStreak,
      value: `${profileUser?.profile?.longestStreak ?? userProgress.longestStreak} ${text.profile.days}`,
      accent: "yellow",
    },
    { title: text.profile.completedLessons, value: summary.totalCompletedLessons.toString(), accent: "green" },
    { title: text.profile.completedStages, value: summary.completedStageIds.length.toString(), accent: "cyan" },
    {
      title: text.profile.bossChallenge,
      value: summary.bossCompleted ? text.profile.completed : summary.bossUnlocked ? text.profile.available : text.profile.locked,
      accent: summary.bossCompleted ? "green" : summary.bossUnlocked ? "cyan" : "red",
    },
    {
      title: text.profile.world2,
      value: worldTwoSummary?.unlocked ? text.profile.unlocked : text.profile.locked,
      accent: worldTwoSummary?.unlocked ? "green" : "red",
    },
  ];
  const displayAchievements = getDisplayAchievements(achievements, progress);
  const unlockedAchievementCount = displayAchievements.filter(
    (achievement) => achievement.status === "Unlocked",
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              {text.profile.playerProfile}
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl md:text-6xl">
              {displayName}
            </h1>
            <p className="mt-4 max-w-2xl text-slate-400">
              {text.profile.profileText}
            </p>
            {syncError ? (
              <p className="mt-3 max-w-2xl text-sm text-yellow-200">
                {syncError} {text.profile.localProgressAvailable}
              </p>
            ) : null}
            {isLoaded && isGuestProfile(clerkUser, profileUser) ? (
              <p className="mt-3 max-w-2xl rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                {text.profile.guestProfile}
              </p>
            ) : null}
          </div>

          <Link
            href="/dashboard"
            className="inline-flex w-full justify-center rounded-full bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 sm:w-fit"
          >
            {text.profile.backToDashboard}
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
                <p className="text-sm text-slate-400" {...uiTextProps(language)}>{text.profile.world1Progress}</p>
                <h2 className="mt-2 text-2xl font-black sm:text-3xl">{worldOne.title}</h2>
                <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                  {text.profile.world1ProgressText}
                </p>
              </div>

              <span className="w-fit rounded-full bg-yellow-400 px-5 py-2 text-sm font-black text-slate-950">
                {worldOneSummary.progressPercent}% {text.profile.complete}
              </span>
            </div>

            <div className="mt-8">
              <div className="mb-3 flex flex-col gap-1 text-sm text-slate-400 sm:flex-row sm:justify-between">
                <span>
                  {worldOneSummary.clearedSteps} of {worldOneSummary.totalSteps} {text.profile.stepsCleared}
                </span>
                <span>{worldOneXp} {text.profile.xpEarned}</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{ width: `${worldOneSummary.progressPercent}%` }}
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
                    status={translateStatus(statusLabel, language)}
                    tone={tone}
                  />
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:rounded-3xl sm:p-6 md:p-8">
            <p className="text-sm text-slate-400" {...uiTextProps(language)}>{text.profile.learningIdentity}</p>
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
                  {language === "ar" ? text.profile.firstLiveCourseArabic : text.profile.firstLiveCourse}
                </p>
                {profileUser?.email ? (
                  <p className="mt-1 break-words text-sm text-slate-500">
                    {profileUser.email}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-5">
              <LanguageSelector variant="panel" />
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400" {...uiTextProps(language)}>{text.profile.nextGoal}</p>
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
                <p className="text-sm text-slate-400" {...uiTextProps(language)}>{text.profile.trophyShelf}</p>
                <h2 className="mt-2 text-2xl font-black" {...uiTextProps(language)}>{text.profile.achievements}</h2>
              </div>
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-300">
                {unlockedAchievementCount} {text.profile.unlockedCount}
              </span>
            </div>

            <div className="grid gap-4">
              {displayAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  language={language}
                />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:rounded-3xl sm:p-6 md:p-8">
            <div className="mb-6">
              <p className="text-sm text-slate-400" {...uiTextProps(language)}>{text.profile.questLog}</p>
              <h2 className="mt-2 text-2xl font-black" {...uiTextProps(language)}>{text.profile.recentActivity}</h2>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <ActivityItem
                  key={`${activity.title}-${activity.time}`}
                  activity={localizeRecentActivity(activity, language)}
                  language={language}
                />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function isGuestProfile(
  clerkUser: ReturnType<typeof useUser>["user"],
  profileUser: ProfileUser,
) {
  return !clerkUser && !profileUser;
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

function AchievementCard({
  achievement,
  language,
}: {
  achievement: DisplayAchievement;
  language: ExplanationLanguage;
}) {
  const text = getUiText(language);
  const isUnlocked = achievement.status === "Unlocked";
  const localizedAchievement = localizeAchievement(achievement, language);

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
          <h3 className="font-bold" {...uiTextProps(language)}>{localizedAchievement.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {localizedAchievement.description}
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            {localizedAchievement.detail}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
            isUnlocked
              ? "bg-yellow-400 text-slate-950"
              : "bg-white/10 text-slate-300"
          }`}
        >
          {isUnlocked ? text.profile.unlocked : text.profile.inProgress}
        </span>
      </div>
    </div>
  );
}

function localizeAchievement(achievement: DisplayAchievement, language: ExplanationLanguage) {
  if (language === "en") {
    return achievement;
  }

  const text = getUiText(language).profile;
  const byId: Record<string, { title: string; description: string }> = {
    "first-lesson-completed": {
      title: text.firstLessonCompleted,
      description: text.firstLessonDescription,
    },
    "first-contact-completed": {
      title: text.world1Completed,
      description: text.world1Description,
    },
    "boss-defeated": {
      title: text.bossDefeatedAchievement,
      description: text.bossDescription,
    },
    "world-2-unlocked": {
      title: text.world2Unlocked,
      description: text.world2Description,
    },
    "xp-starter": {
      title: text.xpStarter,
      description: text.xpStarterDescription,
    },
  };

  const localized = byId[achievement.id];

  return {
    ...achievement,
    title: localized?.title ?? achievement.title,
    description: localized?.description ?? achievement.description,
    detail:
      achievement.detail === "Synced from your profile achievements."
        ? text.syncedDetail
        : achievement.detail === "Unlocked from current progress."
          ? text.unlockedFromProgress
          : text.keepLearning,
  };
}

function localizeRecentActivity(activity: RecentActivity, language: ExplanationLanguage) {
  if (language === "en") {
    return activity;
  }

  const text = getUiText(language).profile;
  const byTitle: Record<string, Pick<RecentActivity, "title" | "detail" | "time">> = {
    "Finished Say Hello": {
      title: text.finishedSayHello,
      detail: text.finishedSayHelloDetail,
      time: text.today,
    },
    "Daily Challenge": {
      title: text.dailyChallenge,
      detail: text.dailyChallengeDetail,
      time: text.yesterday,
    },
    "Unlocked Introduce Yourself": {
      title: text.unlockedIntroduceYourself,
      detail: text.unlockedIntroduceYourselfDetail,
      time: text.twoDaysAgo,
    },
    "Streak milestone": {
      title: text.streakMilestone,
      detail: text.streakMilestoneDetail,
      time: text.thisWeek,
    },
  };

  return byTitle[activity.title] ?? activity;
}

function ActivityItem({ activity, language }: { activity: RecentActivity; language: ExplanationLanguage }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div {...uiTextProps(language)}>
          <p className="font-bold">{activity.title}</p>
          <p className="mt-2 text-sm text-slate-400">{activity.detail}</p>
        </div>
        <span className="text-sm text-cyan-300" {...uiTextProps(language)}>{activity.time}</span>
      </div>
    </div>
  );
}
