import "server-only";

import { logContentFallback, withContentFallbackTimeout } from "@/lib/content-fallback-log";
import { getPrismaClient } from "@/lib/prisma";
import {
  activeWorlds,
  basicsWorld,
  worldOne,
  worlds,
  type Lesson,
  type Stage,
  type StageStatus,
  type World,
} from "@/lib/learning-data";

type ContentSource = "database" | "static";

export type WorldContentResult = {
  source: ContentSource;
  world: World;
};

export type WorldsContentResult = {
  source: ContentSource;
  worlds: World[];
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
  const { source, worlds: contentWorlds } = await getWorldsContent();
  const world = contentWorlds.find((contentWorld) => contentWorld.id === basicsWorld.id) ?? basicsWorld;

  return { source, world };
}

export async function getWorldsContent(): Promise<WorldsContentResult> {
  try {
    const databaseWorlds = await withContentFallbackTimeout(
      getPrismaClient().world.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { number: "asc" },
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
      }),
      "World content load",
    );

    if (databaseWorlds.length === 0) {
      logContentFallback("Falling back to static worlds content.", {
        reason: "worlds-not-found",
      });
      return getStaticWorldsContent();
    }

    if (databaseWorlds.some((world) => world.stages.length === 0 || world.lessons.length === 0)) {
      logContentFallback("Falling back to static worlds content.", {
        reason: "published-content-missing",
      });
      return getStaticWorldsContent();
    }

    return {
      source: "database",
      worlds: buildActiveWorldsFromContent(
        mergeDatabaseAndStaticWorlds(databaseWorlds.map(mapWorldFromDatabase)),
      ),
    };
  } catch (error) {
    logContentFallback("Falling back to static worlds content.", { error });
    return getStaticWorldsContent();
  }
}

function buildActiveWorldsFromContent(contentWorlds: World[]) {
  const bodyPartsLesson =
    contentWorlds.flatMap((world) => world.lessons).find((lesson) => lesson.id === "body-parts") ??
    basicsWorld.lessons[0];
  const colorsLesson =
    contentWorlds.flatMap((world) => world.lessons).find((lesson) => lesson.id === "colors") ??
    basicsWorld.lessons.find((lesson) => lesson.id === "colors");
  const basicsLessons = [
    {
      ...bodyPartsLesson,
      number: "1",
      stageId: "basics",
      status: "Unlocked" as const,
      locked: false,
    },
    ...(colorsLesson
      ? [
          {
            ...colorsLesson,
            number: "2",
            stageId: "basics",
            status: "Unlocked" as const,
            locked: false,
          },
        ]
      : []),
  ];
  const basicsXp = basicsLessons.reduce((total, lesson) => total + lesson.xpReward, 0);

  return [
    {
      ...basicsWorld,
      xp: basicsXp,
      stages: basicsWorld.stages.map((stage) => ({
        ...stage,
        xp: basicsXp,
      })),
      lessons: basicsLessons,
    },
  ];
}

function getStaticWorldsContent(): WorldsContentResult {
  return {
    source: "static",
    worlds: activeWorlds,
  };
}

function mapWorldFromDatabase(world: DatabaseWorld): World {
  const staticWorld = worlds.find((contentWorld) => contentWorld.id === world.slug) ?? worldOne;
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
    progressPercent: getNumber(metadata.progressPercent, staticWorld.progressPercent),
    profileProgressPercent: getNumber(
      metadata.profileProgressPercent,
      staticWorld.profileProgressPercent,
    ),
    dashboardProgressPercent: getNumber(
      metadata.dashboardProgressPercent,
      staticWorld.dashboardProgressPercent,
    ),
    xp: world.xpReward,
    bossTitle: bossChallenge?.title ?? getString(metadata.bossTitle, staticWorld.bossTitle),
    bossDescription:
      bossChallenge?.description ?? getString(metadata.bossDescription, staticWorld.bossDescription),
    dailyChallengeTitle:
      dailyChallenge?.title ?? getString(metadata.dailyChallengeTitle, staticWorld.dailyChallengeTitle),
    dailyChallengeDescription:
      dailyChallenge?.description ??
      getString(metadata.dailyChallengeDescription, staticWorld.dailyChallengeDescription),
    stages,
    lessons,
  };
}

function mergeDatabaseAndStaticWorlds(databaseWorlds: World[]) {
  const databaseWorldIds = new Set(databaseWorlds.map((world) => world.id));
  const missingStaticWorlds = worlds.filter((world) => !databaseWorldIds.has(world.id));
  const mergedWorlds = databaseWorlds.map((databaseWorld) => {
    const staticWorld = worlds.find((world) => world.id === databaseWorld.id);

    if (!staticWorld) {
      return databaseWorld;
    }

    const databaseStageIds = new Set(databaseWorld.stages.map((stage) => stage.id));
    const databaseLessonIds = new Set(databaseWorld.lessons.map((lesson) => lesson.id));
    const missingStaticStages = staticWorld.stages.filter((stage) => !databaseStageIds.has(stage.id));
    const missingStaticLessons = staticWorld.lessons.filter((lesson) => !databaseLessonIds.has(lesson.id));

    return {
      ...databaseWorld,
      stages: [...databaseWorld.stages, ...missingStaticStages].sort(
        (left, right) => getSortableNumber(left.number) - getSortableNumber(right.number),
      ),
      lessons: [...databaseWorld.lessons, ...missingStaticLessons].sort(
        (left, right) => getSortableNumber(left.number) - getSortableNumber(right.number),
      ),
    };
  });

  return [...mergedWorlds, ...missingStaticWorlds].sort((left, right) => left.number - right.number);
}

function getSortableNumber(value: string) {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
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
