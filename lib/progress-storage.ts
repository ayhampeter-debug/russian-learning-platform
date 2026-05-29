"use client";

import { useUser } from "@clerk/nextjs";
import type { ProgressApiResponse, SavedProgress } from "@/lib/progress-types";
import { useEffect, useSyncExternalStore } from "react";
import {
  activeWorlds,
  basicsWorld,
  userProgress,
  worldOne,
  worlds,
  type Lesson,
  type StageStatus,
  type World,
} from "@/lib/learning-data";
import { recordLessonPractice, resetDailyStreak } from "@/lib/streak-storage";

export type { SavedProgress } from "@/lib/progress-types";

const progressStorageKey = "russian-learning-platform-progress";
const progressChangeEventName = "russian-learning-platform-progress-change";
const progressRequestTimeoutMs = 4_000;
const temporarilyAvailableLessonIds = new Set(["body-parts", "colors", "fruits-vegetables"]);

export type LessonProgressState = {
  status: StageStatus | "In progress";
  locked: boolean;
  completed: boolean;
};

export type UnlockDisplayStatus = "Completed" | "Available" | "Locked";
export type LessonDisplayState = "Completed" | "Current" | "Available" | "Locked";

export const fallbackProgress: SavedProgress = {
  completedLessonIds: [],
  completedChallengeIds: [],
  totalXp: 0,
  hearts: userProgress.hearts,
  currentStreak: 0,
};

let cachedStorageValue: string | null = null;
let cachedProgress: SavedProgress = fallbackProgress;
let hasCachedProgress = false;
let authMode: "unknown" | "guest" | "signed-in" = "unknown";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function normalizeProgress(progress: Partial<SavedProgress>): SavedProgress {
  return {
    completedLessonIds: unique(
      Array.isArray(progress.completedLessonIds) ? progress.completedLessonIds : [],
    ),
    completedChallengeIds: unique(
      Array.isArray(progress.completedChallengeIds) ? progress.completedChallengeIds : [],
    ),
    totalXp:
      typeof progress.totalXp === "number" && Number.isFinite(progress.totalXp)
        ? progress.totalXp
        : fallbackProgress.totalXp,
    hearts:
      typeof progress.hearts === "number" && Number.isFinite(progress.hearts)
        ? progress.hearts
        : fallbackProgress.hearts,
    currentStreak:
      typeof progress.currentStreak === "number" && Number.isFinite(progress.currentStreak)
        ? progress.currentStreak
        : fallbackProgress.currentStreak,
  };
}

function parseStoredProgress(storedProgress: string | null): SavedProgress {
  try {
    if (!storedProgress) {
      return fallbackProgress;
    }

    return normalizeProgress(JSON.parse(storedProgress) as Partial<SavedProgress>);
  } catch {
    return fallbackProgress;
  }
}

function getProgressSnapshot(): SavedProgress {
  if (!canUseLocalStorage()) {
    return fallbackProgress;
  }

  try {
    const storedProgress = window.localStorage.getItem(progressStorageKey);

    if (hasCachedProgress && storedProgress === cachedStorageValue) {
      return cachedProgress;
    }

    cachedStorageValue = storedProgress;
    cachedProgress = parseStoredProgress(storedProgress);
    hasCachedProgress = true;

    return cachedProgress;
  } catch {
    return fallbackProgress;
  }
}

function hasStoredProgress() {
  if (!canUseLocalStorage()) {
    return false;
  }

  try {
    return window.localStorage.getItem(progressStorageKey) !== null;
  } catch {
    return false;
  }
}

function getMergeStorageKey(userId: string) {
  return `${progressStorageKey}-merged-${userId}`;
}

function hasMergedLocalProgress(userId: string) {
  if (!canUseLocalStorage()) {
    return true;
  }

  try {
    return window.localStorage.getItem(getMergeStorageKey(userId)) === "true";
  } catch {
    return true;
  }
}

function markLocalProgressMerged(userId: string) {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(getMergeStorageKey(userId), "true");
  } catch {
    // Merging is best-effort; inability to remember the flag should not block play.
  }
}

async function fetchJsonWithTimeout<T>(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = progressRequestTimeoutMs,
) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function applyDatabaseProgress(progress: SavedProgress | null | undefined) {
  if (!progress) {
    return;
  }

  saveProgress(progress);
}

async function postProgressUpdate(path: string, body: unknown) {
  if (authMode !== "signed-in") {
    return;
  }

  try {
    const result = await fetchJsonWithTimeout<ProgressApiResponse>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    applyDatabaseProgress(result?.progress);
  } catch {
    console.warn("Progress sync skipped: using local progress fallback.");
  }
}

export function loadProgress(): SavedProgress {
  return getProgressSnapshot();
}

export function saveProgress(progress: SavedProgress) {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    const normalizedProgress = normalizeProgress(progress);
    const serializedProgress = JSON.stringify(normalizedProgress);

    window.localStorage.setItem(progressStorageKey, serializedProgress);
    cachedStorageValue = serializedProgress;
    cachedProgress = normalizedProgress;
    hasCachedProgress = true;
    window.dispatchEvent(new Event(progressChangeEventName));
  } catch {
    // Storage can fail in private browsing or under quota pressure; keep the app usable.
  }
}

export function resetProgress() {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(progressStorageKey);
    cachedStorageValue = null;
    cachedProgress = fallbackProgress;
    hasCachedProgress = false;
    resetDailyStreak();
    window.dispatchEvent(new Event(progressChangeEventName));
  } catch {
    // Keep reset non-blocking if localStorage is unavailable.
  }
}

function subscribeToProgressChanges(onStoreChange: () => void) {
  if (!canUseLocalStorage()) {
    return () => {};
  }

  function handleStorageChange(event: StorageEvent) {
    if (event.key === progressStorageKey) {
      onStoreChange();
    }
  }

  window.addEventListener(progressChangeEventName, onStoreChange);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(progressChangeEventName, onStoreChange);
    window.removeEventListener("storage", handleStorageChange);
  };
}

export function useProgress() {
  const { isLoaded, isSignedIn, user } = useUser();

  useSyncDatabaseProgress(isLoaded, Boolean(isSignedIn), user?.id ?? null);

  return useSyncExternalStore(subscribeToProgressChanges, getProgressSnapshot, () => fallbackProgress);
}

export function completeLesson(lessonId: string, xpEarned: number) {
  const currentProgress = loadProgress();
  const streak = recordLessonPractice();
  const nextProgress = normalizeProgress({
    ...currentProgress,
    completedLessonIds: [...currentProgress.completedLessonIds, lessonId],
    totalXp: currentProgress.totalXp + xpEarned,
    hearts: Math.max(currentProgress.hearts, 1),
    currentStreak: streak.currentStreak,
  });

  saveProgress(nextProgress);
  void postProgressUpdate("/api/progress/lesson", {
    lessonId,
    xpEarned,
  });

  return nextProgress;
}

export function completeChallenge(
  challengeId: string,
  xpEarned: number,
  heartsLeft: number,
  score = 0,
  passed = true,
) {
  const currentProgress = loadProgress();
  const nextProgress = normalizeProgress({
    ...currentProgress,
    completedChallengeIds: passed
      ? [...currentProgress.completedChallengeIds, challengeId]
      : currentProgress.completedChallengeIds,
    totalXp: passed ? currentProgress.totalXp + xpEarned : currentProgress.totalXp,
    hearts: Math.max(heartsLeft, 0),
  });

  saveProgress(nextProgress);
  void postProgressUpdate("/api/progress/challenge", {
    challengeId,
    xpEarned,
    heartsLeft,
    score,
    passed,
  });

  return nextProgress;
}

function shouldMergeLocalProgress(localProgress: SavedProgress) {
  return (
    localProgress.completedLessonIds.length > 0 ||
    localProgress.completedChallengeIds.length > 0 ||
    localProgress.totalXp > 0 ||
    localProgress.currentStreak > 0 ||
    localProgress.hearts !== fallbackProgress.hearts
  );
}

function useSyncDatabaseProgress(isLoaded: boolean, isSignedIn: boolean, userId: string | null) {
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !userId) {
      authMode = "guest";
      return;
    }

    authMode = "signed-in";
    const signedInUserId = userId;
    let isMounted = true;
    const localProgress = loadProgress();
    const shouldAttemptMerge =
      hasStoredProgress() &&
      shouldMergeLocalProgress(localProgress) &&
      !hasMergedLocalProgress(signedInUserId);

    async function syncProgress() {
      try {
        if (shouldAttemptMerge) {
          const mergeResult = await fetchJsonWithTimeout<ProgressApiResponse>("/api/progress/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(localProgress),
          });

          if (!isMounted) {
            return;
          }

          if (mergeResult?.progress) {
            markLocalProgressMerged(signedInUserId);
            applyDatabaseProgress(mergeResult.progress);
          }

          return;
        }

        const result = await fetchJsonWithTimeout<ProgressApiResponse>("/api/progress", {
          method: "GET",
        });

        if (!isMounted) {
          return;
        }

        applyDatabaseProgress(result?.progress);
      } catch {
        console.warn("Progress load skipped: using local progress fallback.");
      }
    }

    void syncProgress();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, isSignedIn, userId]);
}

export function getProgressStatusLabel(status: StageStatus | "In progress"): UnlockDisplayStatus {
  if (status === "Completed" || status === "Locked") {
    return status;
  }

  return "Available";
}

export function isLessonTemporarilyAvailable(lessonId: string) {
  return temporarilyAvailableLessonIds.has(lessonId);
}

export function getUnlockedLessonIds(completedLessonIds: string[]) {
  return getUnlockedWorldLessonIds(basicsWorld, completedLessonIds);
}

export function getUnlockedWorldLessonIds(world: World, completedLessonIds: string[]) {
  const completedLessons = new Set(completedLessonIds);
  const unlockedLessonIds = new Set<string>();

  world.lessons.forEach((lesson, index) => {
    if (index === 0 || completedLessons.has(lesson.id) || isLessonTemporarilyAvailable(lesson.id)) {
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

export function getWorldForLesson(lesson: Lesson) {
  return (
    activeWorlds.find((world) => world.lessons.some((worldLesson) => worldLesson.id === lesson.id)) ??
    worlds.find((world) => world.lessons.some((worldLesson) => worldLesson.id === lesson.id))
  );
}

export function getWorldBossChallengeId(world: World) {
  return `${world.id}-boss`;
}

export function areWorldLessonsCompleted(world: World, progress: SavedProgress) {
  return (
    world.lessons.length > 0 &&
    world.lessons.every((lesson) => progress.completedLessonIds.includes(lesson.id))
  );
}

export function isWorldBossCompleted(world: World, progress: SavedProgress) {
  return progress.completedChallengeIds.includes(getWorldBossChallengeId(world));
}

export function getWorldBossState(world: World, progress: SavedProgress) {
  if (isWorldBossCompleted(world, progress)) {
    return "completed" as const;
  }

  return areWorldLessonsCompleted(world, progress) ? ("available" as const) : ("locked" as const);
}

export function isWorldUnlocked(world: World, progress: SavedProgress) {
  if (activeWorlds.some((activeWorld) => activeWorld.id === world.id) || world.number === 1) {
    return true;
  }

  const previousWorld = worlds.find((candidate) => candidate.number === world.number - 1);

  if (!previousWorld) {
    return false;
  }

  const previousBossId = `${previousWorld.id}-boss`;
  const previousLessonsCompleted = previousWorld.lessons.every((lesson) =>
    progress.completedLessonIds.includes(lesson.id),
  );

  return progress.completedChallengeIds.includes(previousBossId) && previousLessonsCompleted;
}

export function getLessonProgressState(
  lesson: Lesson,
  progress: SavedProgress,
): LessonProgressState {
  const lessonWorld = getWorldForLesson(lesson);
  const completed = progress.completedLessonIds.includes(lesson.id);
  const temporarilyAvailable = isLessonTemporarilyAvailable(lesson.id);
  const unlocked =
    temporarilyAvailable ||
    (Boolean(lessonWorld && isWorldUnlocked(lessonWorld, progress)) &&
      getUnlockedWorldLessonIds(lessonWorld ?? worldOne, progress.completedLessonIds).includes(lesson.id));

  if (completed) {
    return {
      status: "Completed",
      locked: false,
      completed: true,
    };
  }

  return {
    status: unlocked ? "Unlocked" : "Locked",
    locked: !unlocked,
    completed: false,
  };
}

export function getStageProgressState(stageId: string, progress: SavedProgress) {
  return getWorldStageProgressState(worldOne, stageId, progress);
}

export function getWorldStageProgressState(world: World, stageId: string, progress: SavedProgress) {
  const stage = world.stages.find((stageData) => stageData.id === stageId);
  const stageLessons = world.lessons.filter((lesson) => lesson.stageId === stageId);
  const completedLessons = new Set(progress.completedLessonIds);
  const unlockedLessons = new Set(getUnlockedWorldLessonIds(world, progress.completedLessonIds));

  if (stage?.boss) {
    if (isWorldBossCompleted(world, progress)) {
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

export function isBossChallengeUnlocked(progress: SavedProgress) {
  return getWorldBossState(worldOne, progress) !== "locked";
}

export function isBossChallengeCompleted(progress: SavedProgress) {
  return isWorldBossCompleted(worldOne, progress);
}

export function getNextRecommendedLesson(progress: SavedProgress, availableWorlds: World[] = activeWorlds) {
  return (
    availableWorlds
      .filter((world) => isWorldUnlocked(world, progress))
      .flatMap((world) => world.lessons)
      .find((lesson) => !progress.completedLessonIds.includes(lesson.id)) ?? null
  );
}

export function getNextAvailablePath(progress: SavedProgress, availableWorlds: World[] = activeWorlds) {
  const nextLesson = getNextRecommendedLesson(progress, availableWorlds);
  if (nextLesson) {
    return `/lesson/${nextLesson.id}`;
  }

  if (availableWorlds === activeWorlds) {
    return "/writing";
  }

  const worldOneBossState = getWorldBossState(worldOne, progress);

  if (worldOneBossState === "available") {
    return "/challenge";
  }

  return "/worlds?complete=1";
}

export function getNextAvailableLabel(progress: SavedProgress, availableWorlds: World[] = activeWorlds) {
  const nextLesson = getNextRecommendedLesson(progress, availableWorlds);
  if (nextLesson) {
    return `Continue: ${nextLesson.title}`;
  }

  if (availableWorlds === activeWorlds) {
    return "Practice writing";
  }

  const worldOneBossState = getWorldBossState(worldOne, progress);

  return worldOneBossState === "available" ? "Start Boss Challenge" : "View Worlds";
}

export function getLessonDisplayState(lesson: Lesson, progress: SavedProgress): LessonDisplayState {
  const lessonState = getLessonProgressState(lesson, progress);
  const nextLesson = getNextRecommendedLesson(progress);

  if (lessonState.completed) {
    return "Completed";
  }

  if (lessonState.locked) {
    return "Locked";
  }

  return nextLesson?.id === lesson.id ? "Current" : "Available";
}

export function getNextStageLessonId(stageId: string, progress: SavedProgress) {
  const stageLessons = basicsWorld.lessons.filter((lesson) => lesson.stageId === stageId);
  const unlockedLessonIds = new Set(getUnlockedLessonIds(progress.completedLessonIds));

  return (
    stageLessons.find(
      (lesson) =>
        unlockedLessonIds.has(lesson.id) && !progress.completedLessonIds.includes(lesson.id),
    )?.id ?? stageLessons.find((lesson) => unlockedLessonIds.has(lesson.id))?.id
  );
}

export function getProgressSummary(progress: SavedProgress) {
  const worldSummaries = activeWorlds.map((world) => getWorldProgressSummary(world, progress));
  const fallbackWorldSummary = getWorldProgressSummary(basicsWorld, progress);
  const currentWorldSummary =
    worldSummaries.find((summary) => summary.unlocked && !summary.completed) ??
    worldSummaries.find((summary) => summary.unlocked) ??
    fallbackWorldSummary;
  const completedWorldLessons = currentWorldSummary.world.lessons.filter((lesson) =>
    progress.completedLessonIds.includes(lesson.id),
  );
  const completedStageIds = currentWorldSummary.world.stages
    .filter(
      (stage) =>
        !stage.boss &&
        currentWorldSummary.world.lessons
          .filter((lesson) => lesson.stageId === stage.id)
          .every((lesson) => progress.completedLessonIds.includes(lesson.id)),
    )
    .map((stage) => stage.id);
  const bossState = "locked" as const;
  const bossUnlocked = false;
  const bossCompleted = false;
  const totalSteps = currentWorldSummary.totalSteps;
  const clearedSteps = currentWorldSummary.clearedSteps;
  const currentWorldProgressPercent = currentWorldSummary.progressPercent;
  const profileWorldXp = completedWorldLessons.reduce(
    (total, lesson) => total + lesson.xpReward,
    currentWorldSummary.bossCompleted ? 200 : 0,
  );
  const nextLesson = getNextRecommendedLesson(progress, activeWorlds);
  const worldOneSummary = worldSummaries.find((summary) => summary.world.id === "world-1");
  const worldTwoSummary = worldSummaries.find((summary) => summary.world.id === "world-2");
  const totalCompletedLessons = activeWorlds
    .flatMap((world) => world.lessons)
    .filter((lesson) => progress.completedLessonIds.includes(lesson.id)).length;
  const allAvailableContentComplete =
    !nextLesson && worldSummaries.every((summary) => summary.completed || !summary.unlocked);
  const nextGoalTitle = nextLesson
    ? `Complete ${nextLesson.title}`
    : "Basics completed";
  const nextGoalDescription = nextLesson
    ? `Earn ${nextLesson.xpReward} XP and keep moving through ${
        getWorldForLesson(nextLesson)?.subtitle ?? "your current world"
      }.`
    : "Basics completed. Practice writing or review mistakes.";

  return {
    completedLessons: completedWorldLessons,
    completedStageIds,
    completedChallenges: progress.completedChallengeIds,
    unlockedLessonIds: activeWorlds.flatMap((world) =>
      isWorldUnlocked(world, progress) ? getUnlockedWorldLessonIds(world, progress.completedLessonIds) : [],
    ),
    bossUnlocked,
    bossCompleted,
    bossState,
    worldSummaries,
    currentWorld: currentWorldSummary.world,
    worldOneSummary,
    worldTwoSummary,
    totalCompletedLessons,
    allAvailableContentComplete,
    continueHref: getNextAvailablePath(progress, activeWorlds),
    continueLabel: getNextAvailableLabel(progress, activeWorlds),
    nextRecommendedLesson: nextLesson,
    totalSteps,
    clearedSteps,
    currentWorldProgressPercent,
    profileWorldXp,
    nextGoalTitle,
    nextGoalDescription,
  };
}

export function getWorldProgressSummary(world: World, progress: SavedProgress) {
  const completedLessons = world.lessons.filter((lesson) =>
    progress.completedLessonIds.includes(lesson.id),
  );
  const bossCompleted = isWorldBossCompleted(world, progress);
  const hasBossStage = world.stages.some((stage) => stage.boss);
  const totalSteps = world.lessons.length + (hasBossStage ? 1 : 0);
  const clearedSteps = completedLessons.length + (bossCompleted ? 1 : 0);
  const progressPercent = totalSteps === 0 ? 0 : Math.round((clearedSteps / totalSteps) * 100);
  const unlocked = isWorldUnlocked(world, progress);

  return {
    world,
    unlocked,
    completed: unlocked && totalSteps > 0 && clearedSteps >= totalSteps,
    completedLessons,
    completedLessonCount: completedLessons.length,
    totalLessons: world.lessons.length,
    lessonsCompleted: areWorldLessonsCompleted(world, progress),
    bossState: getWorldBossState(world, progress),
    bossCompleted,
    totalSteps,
    clearedSteps,
    progressPercent,
  };
}
