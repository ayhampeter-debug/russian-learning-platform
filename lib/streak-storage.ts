"use client";

import { useSyncExternalStore } from "react";

const streakStorageKey = "yazkup-daily-streak-v1";
const streakChangeEventName = "yazkup-daily-streak-change";
const oneDayMs = 24 * 60 * 60 * 1000;

export type DailyStreakState = {
  currentStreak: number;
  bestStreak: number;
  lastPracticeDate: string | null;
  todayGoalCompleted: boolean;
};

export const fallbackStreak: DailyStreakState = {
  currentStreak: 0,
  bestStreak: 0,
  lastPracticeDate: null,
  todayGoalCompleted: false,
};

let cachedStorageValue: string | null = null;
let cachedStreak: DailyStreakState = fallbackStreak;
let hasCachedStreak = false;

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string | null) {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function getDayDifference(fromDateKey: string | null, toDateKey = getTodayKey()) {
  const fromDate = parseDateKey(fromDateKey);
  const toDate = parseDateKey(toDateKey);

  if (!fromDate || !toDate) {
    return null;
  }

  return Math.round((toDate.getTime() - fromDate.getTime()) / oneDayMs);
}

function clampNumber(value: unknown, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(Math.max(Math.round(value), min), max)
    : min;
}

function normalizeStreak(streak: Partial<DailyStreakState>, todayKey = getTodayKey()): DailyStreakState {
  const lastPracticeDate =
    typeof streak.lastPracticeDate === "string" && parseDateKey(streak.lastPracticeDate)
      ? streak.lastPracticeDate
      : null;
  const dayDifference = getDayDifference(lastPracticeDate, todayKey);
  const currentStreak = clampNumber(streak.currentStreak, 0, 10_000);
  const bestStreak = Math.max(clampNumber(streak.bestStreak, 0, 10_000), currentStreak);

  if (lastPracticeDate === todayKey) {
    return {
      currentStreak: Math.max(currentStreak, 1),
      bestStreak,
      lastPracticeDate,
      todayGoalCompleted: true,
    };
  }

  if (dayDifference !== null && dayDifference > 1) {
    return {
      currentStreak: 0,
      bestStreak,
      lastPracticeDate,
      todayGoalCompleted: false,
    };
  }

  return {
    currentStreak,
    bestStreak,
    lastPracticeDate,
    todayGoalCompleted: false,
  };
}

function parseStoredStreak(storedStreak: string | null): DailyStreakState {
  try {
    if (!storedStreak) {
      return fallbackStreak;
    }

    return normalizeStreak(JSON.parse(storedStreak) as Partial<DailyStreakState>);
  } catch {
    return fallbackStreak;
  }
}

function getStreakSnapshot(): DailyStreakState {
  if (!canUseLocalStorage()) {
    return fallbackStreak;
  }

  try {
    const storedStreak = window.localStorage.getItem(streakStorageKey);

    if (hasCachedStreak && storedStreak === cachedStorageValue) {
      return normalizeStreak(cachedStreak);
    }

    cachedStorageValue = storedStreak;
    cachedStreak = parseStoredStreak(storedStreak);
    hasCachedStreak = true;

    return cachedStreak;
  } catch {
    return fallbackStreak;
  }
}

function saveStreak(streak: DailyStreakState) {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    const normalizedStreak = normalizeStreak(streak);
    const serializedStreak = JSON.stringify(normalizedStreak);

    window.localStorage.setItem(streakStorageKey, serializedStreak);
    cachedStorageValue = serializedStreak;
    cachedStreak = normalizedStreak;
    hasCachedStreak = true;
    window.dispatchEvent(new Event(streakChangeEventName));
  } catch {
    // Streaks are motivational state; progress saving should continue if storage is unavailable.
  }
}

function subscribeToStreakChanges(onStoreChange: () => void) {
  if (!canUseLocalStorage()) {
    return () => {};
  }

  function handleStorageChange(event: StorageEvent) {
    if (event.key === streakStorageKey) {
      onStoreChange();
    }
  }

  window.addEventListener(streakChangeEventName, onStoreChange);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(streakChangeEventName, onStoreChange);
    window.removeEventListener("storage", handleStorageChange);
  };
}

export function loadDailyStreak() {
  return getStreakSnapshot();
}

export function recordLessonPractice() {
  const currentStreak = loadDailyStreak();
  const todayKey = getTodayKey();

  if (currentStreak.lastPracticeDate === todayKey) {
    return currentStreak;
  }

  const dayDifference = getDayDifference(currentStreak.lastPracticeDate, todayKey);
  const nextCurrentStreak = dayDifference === 1 ? currentStreak.currentStreak + 1 : 1;
  const nextStreak = normalizeStreak({
    currentStreak: nextCurrentStreak,
    bestStreak: Math.max(currentStreak.bestStreak, nextCurrentStreak),
    lastPracticeDate: todayKey,
    todayGoalCompleted: true,
  });

  saveStreak(nextStreak);

  return nextStreak;
}

export function resetDailyStreak() {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(streakStorageKey);
    cachedStorageValue = null;
    cachedStreak = fallbackStreak;
    hasCachedStreak = false;
    window.dispatchEvent(new Event(streakChangeEventName));
  } catch {
    // Keep reset non-blocking if localStorage is unavailable.
  }
}

export function useDailyStreak() {
  return useSyncExternalStore(subscribeToStreakChanges, getStreakSnapshot, () => fallbackStreak);
}
