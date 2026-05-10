import "server-only";

import { getCurrentAppUser } from "@/lib/current-user";
import { getPrismaClient } from "@/lib/prisma";
import type { SavedProgress } from "@/lib/progress-types";
import type { ChallengeAttemptStatus, Prisma, ProgressStatus } from "@prisma/client";

const defaultProgress: SavedProgress = {
  completedLessonIds: [],
  completedChallengeIds: [],
  totalXp: 0,
  hearts: 5,
  currentStreak: 0,
};

type CompletionInput = {
  lessonId: string;
  xpEarned: number;
  bestScore?: number | null;
};

type ChallengeCompletionInput = {
  challengeId: string;
  xpEarned: number;
  heartsLeft: number;
  score: number;
  passed: boolean;
  answers?: unknown;
};

function clampNumber(value: unknown, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(Math.max(Math.round(value), min), max)
    : min;
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
    totalXp: clampNumber(progress.totalXp, 0, 1_000_000),
    hearts: clampNumber(progress.hearts, 0, 5),
    currentStreak: clampNumber(progress.currentStreak, 0, 10_000),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function toJsonInput(value: unknown): Prisma.InputJsonValue | undefined {
  if (!isRecord(value) && !Array.isArray(value)) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function getBestScore(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(Math.round(value), 100))
    : null;
}

async function getSignedInUserId() {
  const user = await getCurrentAppUser();

  return user?.id ?? null;
}

async function unlockAchievement(userId: string, slug: string) {
  const prisma = getPrismaClient();
  const achievement = await prisma.achievement.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!achievement) {
    return;
  }

  await prisma.userAchievement.upsert({
    where: {
      userId_achievementId: {
        userId,
        achievementId: achievement.id,
      },
    },
    update: {
      status: "UNLOCKED",
      unlockedAt: new Date(),
    },
    create: {
      userId,
      achievementId: achievement.id,
      status: "UNLOCKED",
      unlockedAt: new Date(),
    },
  });
}

async function refreshStageProgress(userId: string, stageId: string) {
  const prisma = getPrismaClient();
  const [stageLessons, completedLessons] = await Promise.all([
    prisma.lesson.findMany({
      where: { stageId, status: "PUBLISHED" },
      select: { id: true, xpReward: true },
    }),
    prisma.userLessonProgress.findMany({
      where: { userId, status: "COMPLETED", lesson: { stageId } },
      select: { lessonId: true, xpEarned: true },
    }),
  ]);
  const completedLessonIds = new Set(completedLessons.map((lesson) => lesson.lessonId));
  const status: ProgressStatus =
    stageLessons.length > 0 && stageLessons.every((lesson) => completedLessonIds.has(lesson.id))
      ? "COMPLETED"
      : "IN_PROGRESS";
  const xpEarned = completedLessons.reduce((total, lesson) => total + lesson.xpEarned, 0);

  await prisma.userStageProgress.upsert({
    where: {
      userId_stageId: {
        userId,
        stageId,
      },
    },
    update: {
      status,
      xpEarned,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
    create: {
      userId,
      stageId,
      status,
      xpEarned,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });
}

export async function getDatabaseProgressForCurrentUser() {
  const userId = await getSignedInUserId();

  if (!userId) {
    return null;
  }

  const user = await getPrismaClient().user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      lessonProgress: {
        where: { status: "COMPLETED" },
        include: { lesson: { select: { slug: true } } },
      },
      challengeAttempts: {
        where: { status: "PASSED" },
        include: { challenge: { select: { slug: true } } },
      },
    },
  });

  if (!user) {
    return null;
  }

  return normalizeProgress({
    completedLessonIds: user.lessonProgress.map((progress) => progress.lesson.slug),
    completedChallengeIds: user.challengeAttempts.map((attempt) => attempt.challenge.slug),
    totalXp: user.profile?.totalXp ?? defaultProgress.totalXp,
    hearts: user.profile?.hearts ?? defaultProgress.hearts,
    currentStreak: user.profile?.currentStreak ?? defaultProgress.currentStreak,
  });
}

export async function completeLessonForCurrentUser(input: CompletionInput) {
  const userId = await getSignedInUserId();

  if (!userId) {
    return null;
  }

  const prisma = getPrismaClient();
  const lesson = await prisma.lesson.findFirst({
    where: {
      status: "PUBLISHED",
      OR: [{ slug: input.lessonId }, { id: input.lessonId }],
    },
    include: {
      exercises: {
        where: { status: "PUBLISHED" },
        select: { points: true },
      },
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found.");
  }

  const exerciseXp = lesson.exercises.reduce((total, exercise) => total + exercise.points, 0);
  const maxXp = Math.max(lesson.xpReward, exerciseXp, 0);
  const xpEarned = clampNumber(input.xpEarned, 0, maxXp);
  const existingProgress = await prisma.userLessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId: lesson.id,
      },
    },
    select: { status: true, xpEarned: true, bestScore: true },
  });
  const wasAlreadyCompleted = existingProgress?.status === "COMPLETED";
  const bestScore = getBestScore(input.bestScore);

  await prisma.userLessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId: lesson.id,
      },
    },
    update: {
      status: "COMPLETED",
      xpEarned: Math.max(existingProgress?.xpEarned ?? 0, xpEarned),
      bestScore:
        bestScore === null
          ? existingProgress?.bestScore
          : Math.max(existingProgress?.bestScore ?? 0, bestScore),
      attempts: { increment: 1 },
      completedAt: new Date(),
    },
    create: {
      userId,
      lessonId: lesson.id,
      status: "COMPLETED",
      xpEarned,
      bestScore,
      attempts: 1,
      lastStartedAt: new Date(),
      completedAt: new Date(),
    },
  });

  if (!wasAlreadyCompleted && xpEarned > 0) {
    await prisma.userProfile.update({
      where: { userId },
      data: {
        totalXp: { increment: xpEarned },
      },
    });
    await prisma.userProfile.updateMany({
      where: { userId, currentStreak: 0 },
      data: { currentStreak: 1, longestStreak: 1 },
    });
  }

  await refreshStageProgress(userId, lesson.stageId);
  await unlockAchievement(userId, "first-contact");

  return getDatabaseProgressForCurrentUser();
}

export async function completeChallengeForCurrentUser(input: ChallengeCompletionInput) {
  const userId = await getSignedInUserId();

  if (!userId) {
    return null;
  }

  const prisma = getPrismaClient();
  const challenge = await prisma.challenge.findFirst({
    where: {
      status: "PUBLISHED",
      OR: [{ slug: input.challengeId }, { id: input.challengeId }],
    },
    select: { id: true, slug: true, xpReward: true, passScore: true },
  });

  if (!challenge) {
    throw new Error("Challenge not found.");
  }

  const score = clampNumber(input.score, 0, 1_000_000);
  const heartsLeft = clampNumber(input.heartsLeft, 0, 5);
  const passed = Boolean(input.passed) && score >= (challenge.passScore ?? 0) && heartsLeft > 0;
  const status: ChallengeAttemptStatus = passed ? "PASSED" : "FAILED";
  const xpEarned = passed ? clampNumber(input.xpEarned, 0, Math.max(challenge.xpReward, 0)) : 0;
  const priorPassedAttempt = await prisma.userChallengeAttempt.findFirst({
    where: {
      userId,
      challengeId: challenge.id,
      status: "PASSED",
    },
    select: { id: true },
  });

  await prisma.userChallengeAttempt.create({
    data: {
      userId,
      challengeId: challenge.id,
      status,
      score,
      xpEarned,
      heartsLeft,
      answers: toJsonInput(input.answers),
      completedAt: new Date(),
    },
  });

  await prisma.userProfile.update({
    where: { userId },
    data: {
      hearts: heartsLeft,
      totalXp:
        passed && !priorPassedAttempt && xpEarned > 0
          ? { increment: xpEarned }
          : undefined,
    },
  });

  if (passed) {
    await unlockAchievement(userId, "first-contact");
  }

  return getDatabaseProgressForCurrentUser();
}

export async function mergeLocalProgressForCurrentUser(progress: Partial<SavedProgress>) {
  const userId = await getSignedInUserId();

  if (!userId) {
    return null;
  }

  const prisma = getPrismaClient();
  const localProgress = normalizeProgress(progress);
  const [lessons, challenges, profile] = await Promise.all([
    prisma.lesson.findMany({
      where: {
        slug: { in: localProgress.completedLessonIds },
        status: "PUBLISHED",
      },
      select: { id: true, slug: true, xpReward: true, stageId: true },
    }),
    prisma.challenge.findMany({
      where: {
        slug: { in: localProgress.completedChallengeIds },
        status: "PUBLISHED",
      },
      select: { id: true, slug: true, xpReward: true },
    }),
    prisma.userProfile.findUnique({ where: { userId } }),
  ]);

  for (const lesson of lessons) {
    await prisma.userLessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId: lesson.id,
        },
      },
      update: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
      create: {
        userId,
        lessonId: lesson.id,
        status: "COMPLETED",
        xpEarned: lesson.xpReward,
        attempts: 1,
        completedAt: new Date(),
      },
    });
  }

  for (const challenge of challenges) {
    const alreadyPassed = await prisma.userChallengeAttempt.findFirst({
      where: {
        userId,
        challengeId: challenge.id,
        status: "PASSED",
      },
      select: { id: true },
    });

    if (!alreadyPassed) {
      await prisma.userChallengeAttempt.create({
        data: {
          userId,
          challengeId: challenge.id,
          status: "PASSED",
          score: 0,
          xpEarned: challenge.xpReward,
          heartsLeft: localProgress.hearts,
          completedAt: new Date(),
        },
      });
    }
  }

  for (const stageId of unique(lessons.map((lesson) => lesson.stageId))) {
    await refreshStageProgress(userId, stageId);
  }

  await prisma.userProfile.update({
    where: { userId },
    data: {
      totalXp: Math.max(profile?.totalXp ?? 0, localProgress.totalXp),
      hearts: localProgress.hearts,
      currentStreak: Math.max(profile?.currentStreak ?? 0, localProgress.currentStreak),
      longestStreak: Math.max(profile?.longestStreak ?? 0, localProgress.currentStreak),
    },
  });

  if (lessons.length > 0 || challenges.length > 0) {
    await unlockAchievement(userId, "first-contact");
  }

  return getDatabaseProgressForCurrentUser();
}
