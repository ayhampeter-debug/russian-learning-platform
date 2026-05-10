import "server-only";

import { logContentFallback } from "@/lib/content-fallback-log";
import { getPrismaClient } from "@/lib/prisma";
import { worldOne, type Lesson, type Stage, type StageStatus, type World } from "@/lib/learning-data";

type ContentSource = "database" | "static";

export type WorldContentResult = {
  source: ContentSource;
  world: World;
};

type JsonRecord = Record<string, unknown>;
type DatabaseStage = {
  id: string;
  slug: string;
  number: number;
  title: string;
  description: string;
  xpReward: number;
  isBossStage: boolean;
  metadata: unknown;
};
type DatabaseLesson = {
  slug: string;
  number: number;
  title: string;
  description: string;
  stageId: string;
  xpReward: number;
  vocabulary: unknown;
  metadata: unknown;
};
type DatabaseChallenge = {
  slug: string;
  title: string;
  description: string;
  type: string;
  xpReward: number;
};
type DatabaseWorld = {
  slug: string;
  number: number;
  title: string;
  subtitle: string | null;
  description: string;
  xpReward: number;
  metadata: unknown;
  stages: DatabaseStage[];
  lessons: DatabaseLesson[];
  challenges: DatabaseChallenge[];
};

export async function getWorldOneContent(): Promise<WorldContentResult> {
  try {
    const world = await getPrismaClient().world.findUnique({
      where: { number: 1 },
      include: {
        stages: {
          where: { status: "PUBLISHED" },
          orderBy: { number: "asc" },
        },
        lessons: {
          where: { status: "PUBLISHED" },
          orderBy: { number: "asc" },
        },
        challenges: {
          where: { status: "PUBLISHED" },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!world) {
      logContentFallback("Falling back to static World 1 content.", {
        reason: "world-not-found",
      });
      return getStaticWorldOneContent();
    }

    if (world.stages.length === 0 || world.lessons.length === 0) {
      logContentFallback("Falling back to static World 1 content.", {
        reason: `published-content-missing stages=${world.stages.length} lessons=${world.lessons.length}`,
      });
      return getStaticWorldOneContent();
    }

    return {
      source: "database",
      world: mapWorldOneFromDatabase(world),
    };
  } catch (error) {
    logContentFallback("Falling back to static World 1 content.", { error });
    return getStaticWorldOneContent();
  }
}

function getStaticWorldOneContent(): WorldContentResult {
  return {
    source: "static",
    world: worldOne,
  };
}

function mapWorldOneFromDatabase(world: DatabaseWorld): World {
  const metadata = asRecord(world.metadata);
  const bossChallenge =
    world.challenges.find((challenge) => challenge.type === "boss") ??
    world.challenges.find((challenge) => challenge.slug.includes("boss"));
  const dailyChallenge = world.challenges.find((challenge) => challenge.type === "daily");
  const lessons = world.lessons.map((lesson): Lesson => {
    const lessonMetadata = asRecord(lesson.metadata);
    const stage = world.stages.find((stageData) => stageData.id === lesson.stageId);

    return {
      id: lesson.slug,
      number: lesson.number.toString(),
      title: lesson.title,
      description: lesson.description,
      stageId: stage?.slug ?? lesson.stageId,
      status: getLearningStatus(lessonMetadata, "Locked"),
      xp: getNumber(lessonMetadata.xp, lesson.xpReward),
      xpReward: lesson.xpReward,
      vocabulary: Array.isArray(lesson.vocabulary)
        ? (lesson.vocabulary as Lesson["vocabulary"])
        : [],
      exercises: [],
      locked: getBoolean(lessonMetadata.locked, false),
    };
  });
  const stages = world.stages.map((stage): Stage => {
    const stageMetadata = asRecord(stage.metadata);
    const challenge = stage.isBossStage ? bossChallenge : undefined;

    return {
      id: stage.slug,
      number: getString(stageMetadata.displayNumber, stage.number.toString()),
      title: challenge?.title ?? stage.title,
      description: challenge?.description ?? stage.description,
      status: getStageStatus(stageMetadata, stage.isBossStage ? "Locked" : "Unlocked"),
      xp: challenge?.xpReward ?? stage.xpReward,
      locked: getBoolean(stageMetadata.locked, false),
      boss: stage.isBossStage,
    };
  });

  return {
    id: world.slug,
    number: world.number,
    title: world.title,
    subtitle: world.subtitle ?? `World ${world.number}: ${world.title}`,
    description: world.description,
    progressPercent: getNumber(metadata.progressPercent, worldOne.progressPercent),
    profileProgressPercent: getNumber(
      metadata.profileProgressPercent,
      worldOne.profileProgressPercent,
    ),
    dashboardProgressPercent: getNumber(
      metadata.dashboardProgressPercent,
      worldOne.dashboardProgressPercent,
    ),
    xp: world.xpReward,
    bossTitle: bossChallenge?.title ?? getString(metadata.bossTitle, worldOne.bossTitle),
    bossDescription:
      bossChallenge?.description ?? getString(metadata.bossDescription, worldOne.bossDescription),
    dailyChallengeTitle:
      dailyChallenge?.title ?? getString(metadata.dailyChallengeTitle, worldOne.dailyChallengeTitle),
    dailyChallengeDescription:
      dailyChallenge?.description ??
      getString(metadata.dailyChallengeDescription, worldOne.dailyChallengeDescription),
    stages,
    lessons,
  };
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function getString(value: unknown, fallback: string) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function getNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function getStageStatus(metadata: JsonRecord, fallback: StageStatus): StageStatus {
  const status = metadata.learningStatus;

  if (status === "Completed" || status === "Unlocked" || status === "Locked") {
    return status;
  }

  return fallback;
}

function getLearningStatus(metadata: JsonRecord, fallback: Lesson["status"]): Lesson["status"] {
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
