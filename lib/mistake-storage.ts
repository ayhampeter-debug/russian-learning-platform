"use client";

import { useSyncExternalStore } from "react";
import type { ExplanationLanguage } from "@/lib/language-preference";

const mistakeStorageKey = "yazkup-mistake-review";
const mistakeChangeEventName = "yazkup-mistake-review-change";

export type MistakeRecord = {
  id: string;
  lessonId: string;
  exerciseId?: string;
  exerciseOrder?: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
  timestamp: string;
  language?: ExplanationLanguage;
};

export type NewMistakeRecord = Omit<MistakeRecord, "id" | "timestamp"> & {
  id?: string;
  timestamp?: string;
};

let cachedStorageValue: string | null = null;
let cachedMistakes: MistakeRecord[] = [];
let hasCachedMistakes = false;
const fallbackMistakes: MistakeRecord[] = [];

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeMistake(value: unknown): MistakeRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<MistakeRecord>;
  const lessonId = normalizeString(candidate.lessonId);
  const questionText = normalizeString(candidate.questionText);
  const correctAnswer = normalizeString(candidate.correctAnswer);

  if (!lessonId || !questionText || !correctAnswer) {
    return null;
  }

  const timestamp = normalizeString(candidate.timestamp) || new Date().toISOString();
  const id =
    normalizeString(candidate.id) ||
    createMistakeId({
      lessonId,
      exerciseId: normalizeString(candidate.exerciseId),
      exerciseOrder: candidate.exerciseOrder,
      timestamp,
    });

  return {
    id,
    lessonId,
    exerciseId: normalizeString(candidate.exerciseId) || undefined,
    exerciseOrder:
      typeof candidate.exerciseOrder === "number" && Number.isFinite(candidate.exerciseOrder)
        ? candidate.exerciseOrder
        : undefined,
    questionText,
    userAnswer: normalizeString(candidate.userAnswer),
    correctAnswer,
    explanation: normalizeString(candidate.explanation) || undefined,
    timestamp,
    language: candidate.language === "ar" ? "ar" : candidate.language === "en" ? "en" : undefined,
  };
}

function parseStoredMistakes(storedMistakes: string | null): MistakeRecord[] {
  try {
    if (!storedMistakes) {
      return [];
    }

    const parsed = JSON.parse(storedMistakes);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeMistake).filter((mistake): mistake is MistakeRecord => Boolean(mistake));
  } catch {
    return [];
  }
}

function createMistakeId({
  lessonId,
  exerciseId,
  exerciseOrder,
  timestamp,
}: {
  lessonId: string;
  exerciseId?: string;
  exerciseOrder?: number;
  timestamp: string;
}) {
  return [lessonId, exerciseId || `order-${exerciseOrder ?? "unknown"}`, timestamp].join(":");
}

function getMistakesSnapshot() {
  if (!canUseLocalStorage()) {
    return fallbackMistakes;
  }

  try {
    const storedMistakes = window.localStorage.getItem(mistakeStorageKey);

    if (hasCachedMistakes && storedMistakes === cachedStorageValue) {
      return cachedMistakes;
    }

    cachedStorageValue = storedMistakes;
    cachedMistakes = parseStoredMistakes(storedMistakes);
    hasCachedMistakes = true;

    return cachedMistakes;
  } catch {
    return fallbackMistakes;
  }
}

function saveMistakes(mistakes: MistakeRecord[]) {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    const serializedMistakes = JSON.stringify(mistakes);

    window.localStorage.setItem(mistakeStorageKey, serializedMistakes);
    cachedStorageValue = serializedMistakes;
    cachedMistakes = mistakes;
    hasCachedMistakes = true;
    window.dispatchEvent(new Event(mistakeChangeEventName));
  } catch {
    // Keep lessons usable if storage is unavailable or full.
  }
}

function subscribeToMistakeChanges(onStoreChange: () => void) {
  if (!canUseLocalStorage()) {
    return () => {};
  }

  function handleStorageChange(event: StorageEvent) {
    if (event.key === mistakeStorageKey) {
      onStoreChange();
    }
  }

  window.addEventListener(mistakeChangeEventName, onStoreChange);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(mistakeChangeEventName, onStoreChange);
    window.removeEventListener("storage", handleStorageChange);
  };
}

export function getMistakes() {
  return getMistakesSnapshot();
}

export function addMistake(mistake: NewMistakeRecord) {
  const timestamp = mistake.timestamp || new Date().toISOString();
  const nextMistake = normalizeMistake({
    ...mistake,
    id:
      mistake.id ||
      createMistakeId({
        lessonId: mistake.lessonId,
        exerciseId: mistake.exerciseId,
        exerciseOrder: mistake.exerciseOrder,
        timestamp,
      }),
    timestamp,
  });

  if (!nextMistake) {
    return null;
  }

  const currentMistakes = getMistakesSnapshot();
  const duplicateIndex = currentMistakes.findIndex(
    (storedMistake) =>
      storedMistake.lessonId === nextMistake.lessonId &&
      (storedMistake.exerciseId || "") === (nextMistake.exerciseId || "") &&
      storedMistake.questionText === nextMistake.questionText,
  );
  const nextMistakes =
    duplicateIndex >= 0
      ? currentMistakes.map((storedMistake, index) =>
          index === duplicateIndex ? { ...nextMistake, id: storedMistake.id } : storedMistake,
        )
      : [nextMistake, ...currentMistakes];

  saveMistakes(nextMistakes);

  return nextMistake;
}

export function removeMistake(id: string) {
  saveMistakes(getMistakesSnapshot().filter((mistake) => mistake.id !== id));
}

export function clearMistakes() {
  saveMistakes([]);
}

export function getMistakeCount() {
  return getMistakesSnapshot().length;
}

export function getMistakesByLesson(lessonId: string) {
  return getMistakesSnapshot().filter((mistake) => mistake.lessonId === lessonId);
}

export function useMistakes() {
  return useSyncExternalStore(subscribeToMistakeChanges, getMistakesSnapshot, () => fallbackMistakes);
}

export function useMistakeCount() {
  return useMistakes().length;
}
