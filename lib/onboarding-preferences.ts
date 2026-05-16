"use client";

import { useSyncExternalStore } from "react";

export type CourseKey = "russian";

export const onboardingCompleteStorageKey = "yazkup:onboarding-complete";
export const currentCourseStorageKey = "yazkup:current-course";
export const defaultCourse: CourseKey = "russian";

const onboardingCompleteChangeEvent = "yazkup:onboarding-complete-change";
const currentCourseChangeEvent = "yazkup:current-course-change";

export function normalizeCourse(value: unknown): CourseKey {
  return value === "russian" ? "russian" : defaultCourse;
}

export function isOnboardingComplete() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.localStorage.getItem(onboardingCompleteStorageKey) === "true";
}

export function completeOnboarding(course: CourseKey = defaultCourse) {
  window.localStorage.setItem(currentCourseStorageKey, normalizeCourse(course));
  window.localStorage.setItem(onboardingCompleteStorageKey, "true");
  window.dispatchEvent(new Event(onboardingCompleteChangeEvent));
  window.dispatchEvent(new Event(currentCourseChangeEvent));
}

export function setCurrentCourse(course: CourseKey) {
  window.localStorage.setItem(currentCourseStorageKey, normalizeCourse(course));
  window.dispatchEvent(new Event(currentCourseChangeEvent));
}

export function useCurrentCourse() {
  const course = useSyncExternalStore(
    subscribeToCoursePreference,
    getCoursePreferenceSnapshot,
    getCoursePreferenceServerSnapshot,
  );

  return { course, setCurrentCourse };
}

export function useOnboardingComplete() {
  return useSyncExternalStore(
    subscribeToOnboardingPreference,
    getOnboardingPreferenceSnapshot,
    getOnboardingPreferenceServerSnapshot,
  );
}

function getOnboardingPreferenceSnapshot() {
  return isOnboardingComplete();
}

function getOnboardingPreferenceServerSnapshot() {
  return true;
}

function subscribeToOnboardingPreference(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === onboardingCompleteStorageKey) {
      onStoreChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(onboardingCompleteChangeEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(onboardingCompleteChangeEvent, onStoreChange);
  };
}

function getCoursePreferenceSnapshot() {
  if (typeof window === "undefined") {
    return defaultCourse;
  }

  return normalizeCourse(window.localStorage.getItem(currentCourseStorageKey));
}

function getCoursePreferenceServerSnapshot() {
  return defaultCourse;
}

function subscribeToCoursePreference(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === currentCourseStorageKey) {
      onStoreChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(currentCourseChangeEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(currentCourseChangeEvent, onStoreChange);
  };
}
