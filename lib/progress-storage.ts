"use client";

import { useUser } from "@clerk/nextjs";
import type { ProgressApiResponse, SavedProgress } from "@/lib/progress-types";
import { useEffect, useSyncExternalStore } from "react";
import { userProgress, worldOne, type Lesson, type StageStatus } from "@/lib/learning-data";

export type { SavedProgress } from "@/lib/progress-types";

const progressStorageKey = "russian-learning-platform-progress";
const progressChangeEventName = "russian-learning-platform-progress-change";
const progressRequestTimeoutMs = 4_000;

export type LessonProgressState = {
  status: StageStatus | "In progress";
  locked: boolean;
  completed: boolean;
};

export type UnlockDisplayStatus = "Completed" | "Available" | "Locked";

export const fallbackProgress: SavedProgress = {
  completedLessonIds: worldOne.lessons
    .filter(
      (lesson) =>
        lesson.status === "Completed" ||
        worldOne.stages.some(
          (stage) => stage.id === lesson.stageId && stage.status === "Completed",
        ),
    )
    .map((lesson) => lesson.id),
  completedChallengeIds: userProgress.completedChallenges,
  totalXp: userProgress.totalXp,
  hearts: userProgress.hearts,
  currentStreak: userProgress.currentStreak,
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
  const nextProgress = normalizeProgress({
    ...currentProgress,
    completedLessonIds: [...currentProgress.completedLessonIds, lessonId],
    totalXp: currentProgress.totalXp + xpEarned,
    hearts: Math.max(currentProgress.hearts, 1),
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

export function getUnlockedLessonIds(completedLessonIds: string[]) {
  const completedLessons = new Set(completedLessonIds);
  const unlockedLessonIds = new Set<string>();

  worldOne.lessons.forEach((lesson, index) => {
    if (index === 0 || completedLessons.has(lesson.id)) {
      unlockedLessonIds.add(lesson.id);
      return;
    }

    const previousLesson = worldOne.lessons[index - 1];

    if (previousLesson && completedLessons.has(previousLesson.id)) {
      unlockedLessonIds.add(lesson.id);
    }
  });

  return Array.from(unlockedLessonIds);
}

export function getLessonProgressState(
  lesson: Lesson,
  progress: SavedProgress,
): LessonProgressState {
  const completed = progress.completedLessonIds.includes(lesson.id);
  const unlocked = getUnlockedLessonIds(progress.completedLessonIds).includes(lesson.id);

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
  const stageLessons = worldOne.lessons.filter((lesson) => lesson.stageId === stageId);
  const completedLessons = new Set(progress.completedLessonIds);
  const unlockedLessons = new Set(getUnlockedLessonIds(progress.completedLessonIds));

  if (stageId === "boss-level") {
    if (progress.completedChallengeIds.includes("world-1-boss")) {
      return { status: "Completed" as StageStatus, locked: false };
    }

    const bossUnlocked = worldOne.lessons.every((lesson) => completedLessons.has(lesson.id));
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
  const completedLessons = new Set(progress.completedLessonIds);

  return worldOne.lessons.every((lesson) => completedLessons.has(lesson.id));
}

export function isBossChallengeCompleted(progress: SavedProgress) {
  return progress.completedChallengeIds.includes("world-1-boss");
}

export function getNextAvailablePath(progress: SavedProgress) {
  const nextLesson = worldOne.lessons.find(
    (lesson) => !progress.completedLessonIds.includes(lesson.id),
  );

  if (nextLesson) {
    return `/lesson/${nextLesson.id}`;
  }

  return "/challenge";
}

export function getNextAvailableLabel(progress: SavedProgress) {
  const nextLesson = worldOne.lessons.find(
    (lesson) => !progress.completedLessonIds.includes(lesson.id),
  );

  if (nextLesson) {
    return `Continue: ${nextLesson.title}`;
  }

  return isBossChallengeCompleted(progress) ? "Replay Boss Challenge" : "Start Boss Challenge";
}

export function getNextStageLessonId(stageId: string, progress: SavedProgress) {
  const stageLessons = worldOne.lessons.filter((lesson) => lesson.stageId === stageId);
  const unlockedLessonIds = new Set(getUnlockedLessonIds(progress.completedLessonIds));

  return (
    stageLessons.find(
      (lesson) =>
        unlockedLessonIds.has(lesson.id) && !progress.completedLessonIds.includes(lesson.id),
    )?.id ?? stageLessons.find((lesson) => unlockedLessonIds.has(lesson.id))?.id
  );
}

export function getProgressSummary(progress: SavedProgress) {
  const completedWorldLessons = worldOne.lessons.filter((lesson) =>
    progress.completedLessonIds.includes(lesson.id),
  );
  const completedStageIds = worldOne.stages
    .filter(
      (stage) =>
        !stage.boss &&
        worldOne.lessons
          .filter((lesson) => lesson.stageId === stage.id)
          .every((lesson) => progress.completedLessonIds.includes(lesson.id)),
    )
    .map((stage) => stage.id);
  const bossUnlocked = isBossChallengeUnlocked(progress);
  const bossCompleted = isBossChallengeCompleted(progress);
  const totalSteps = worldOne.lessons.length + 1;
  const clearedSteps = completedWorldLessons.length + (bossCompleted ? 1 : 0);
  const currentWorldProgressPercent = Math.round((clearedSteps / totalSteps) * 100);
  const profileWorldXp = completedWorldLessons.reduce(
    (total, lesson) => total + lesson.xpReward,
    bossCompleted ? 200 : 0,
  );
  const nextLesson = worldOne.lessons.find(
    (lesson) => !progress.completedLessonIds.includes(lesson.id),
  );

  return {
    completedLessons: completedWorldLessons,
    completedStageIds,
    completedChallenges: progress.completedChallengeIds,
    unlockedLessonIds: getUnlockedLessonIds(progress.completedLessonIds),
    bossUnlocked,
    bossCompleted,
    continueHref: getNextAvailablePath(progress),
    continueLabel: getNextAvailableLabel(progress),
    totalSteps,
    clearedSteps,
    currentWorldProgressPercent,
    profileWorldXp,
    nextGoalTitle: nextLesson ? `Complete ${nextLesson.title}` : "Clear the Boss Level",
    nextGoalDescription: nextLesson
      ? `Earn ${nextLesson.xpReward} XP and move closer to the World 1 boss challenge.`
      : "Finish the final challenge to complete World 1.",
  };
}
