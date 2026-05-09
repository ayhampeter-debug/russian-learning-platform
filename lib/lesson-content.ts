import "server-only";

import type { Prisma } from "@prisma/client";
import { getPrismaClient } from "@/lib/prisma";
import {
  worldOne,
  type Lesson,
  type LessonExercise,
  type LessonStatus,
  type MatchingPair,
  type VocabularyItem,
} from "@/lib/learning-data";

type ContentSource = "database" | "static";

export type LessonContentResult = {
  source: ContentSource;
  lesson: Lesson | null;
};

type JsonRecord = Record<string, unknown>;
type DatabaseLesson = Prisma.LessonGetPayload<{
  include: {
    stage: true;
    exercises: true;
  };
}>;

export async function getLessonContent(lessonId: string): Promise<LessonContentResult> {
  try {
    const lesson = await getPrismaClient().lesson.findFirst({
      where: {
        status: "PUBLISHED",
        OR: [{ slug: lessonId }, { id: lessonId }],
      },
      include: {
        stage: true,
        exercises: {
          where: { status: "PUBLISHED" },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!lesson || lesson.exercises.length === 0) {
      return getStaticLessonContent(lessonId);
    }

    return {
      source: "database",
      lesson: mapLessonFromDatabase(lesson),
    };
  } catch {
    console.error(`Falling back to static lesson content for ${lessonId}.`);
    return getStaticLessonContent(lessonId);
  }
}

export function getStaticLessonContent(lessonId: string): LessonContentResult {
  return {
    source: "static",
    lesson: worldOne.lessons.find((lesson) => lesson.id === lessonId) ?? null,
  };
}

function mapLessonFromDatabase(lesson: DatabaseLesson): Lesson {
  const metadata = asRecord(lesson.metadata);

  return {
    id: lesson.slug,
    number: lesson.number.toString(),
    title: lesson.title,
    description: lesson.description,
    stageId: lesson.stage.slug,
    status: getLearningStatus(metadata, "Locked"),
    xp: getNumber(metadata.xp, lesson.xpReward),
    xpReward: lesson.xpReward,
    vocabulary: getVocabulary(lesson.vocabulary),
    exercises: lesson.exercises.map(mapExerciseFromDatabase),
    locked: getBoolean(metadata.locked, false),
  };
}

function mapExerciseFromDatabase(exercise: DatabaseLesson["exercises"][number]): LessonExercise {
  const content = asRecord(exercise.content);
  const answerKey = asRecord(exercise.answerKey);
  const base = {
    id: exercise.slug,
    prompt: exercise.prompt,
    points: exercise.points,
    explanation: exercise.explanation ?? "",
  };

  if (exercise.type === "multipleChoice") {
    return {
      ...base,
      type: "multipleChoice",
      display: getString(content.display, exercise.prompt),
      options: getStringArray(content.options),
      correctAnswer: getString(content.correctAnswer, getString(answerKey.correctAnswer, "")),
    };
  }

  if (exercise.type === "fillBlank") {
    return {
      ...base,
      type: "fillBlank",
      beforeBlank: getString(content.beforeBlank, ""),
      afterBlank: getString(content.afterBlank, ""),
      options: getStringArray(content.options),
      correctAnswer: getString(content.correctAnswer, getString(answerKey.correctAnswer, "")),
    };
  }

  if (exercise.type === "sentenceOrder") {
    return {
      ...base,
      type: "sentenceOrder",
      translation: getString(content.translation, ""),
      words: getStringArray(content.words),
      correctOrder: getStringArray(content.correctOrder, getStringArray(answerKey.correctOrder)),
    };
  }

  if (exercise.type === "matching") {
    return {
      ...base,
      type: "matching",
      pairs: getMatchingPairs(content.pairs, getMatchingPairs(answerKey.pairs)),
      englishOptions: getStringArray(content.englishOptions),
    };
  }

  if (exercise.type === "scenarioChoice") {
    return {
      ...base,
      type: "scenarioChoice",
      situation: getString(content.situation, ""),
      options: getStringArray(content.options),
      correctAnswer: getString(content.correctAnswer, getString(answerKey.correctAnswer, "")),
    };
  }

  throw new Error(`Unsupported exercise type: ${exercise.type}`);
}

function getVocabulary(value: unknown): VocabularyItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const record = asRecord(item);
    const russian = record.russian;
    const english = record.english;

    if (typeof russian !== "string" || typeof english !== "string") {
      return [];
    }

    return [
      {
        russian,
        english,
        note: typeof record.note === "string" ? record.note : undefined,
      },
    ];
  });
}

function getMatchingPairs(value: unknown, fallback: MatchingPair[] = []): MatchingPair[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value.flatMap((item) => {
    const record = asRecord(item);
    const russian = record.russian;
    const english = record.english;

    if (typeof russian !== "string" || typeof english !== "string") {
      return [];
    }

    return [{ russian, english }];
  });
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function getString(value: unknown, fallback: string) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function getStringArray(value: unknown, fallback: string[] = []) {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : fallback;
}

function getNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function getLearningStatus(metadata: JsonRecord, fallback: LessonStatus): LessonStatus {
  const status = metadata.learningStatus;

  if (
    status === "Completed" ||
    status === "Unlocked" ||
    status === "Locked" ||
    status === "In progress"
  ) {
    return status;
  }

  return fallback;
}
