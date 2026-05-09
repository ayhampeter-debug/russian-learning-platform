import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";
import {
  achievements,
  challengeQuestions,
  challengeSettings,
  lessonQuestions,
  worldOne,
  type ChallengeQuestion,
  type LessonExercise,
} from "../lib/learning-data.ts";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type InputJsonValue = Exclude<JsonValue, null>;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const pool = new pg.Pool({
  connectionString: getSeedConnectionString(connectionString),
});
const adapter = new PrismaPg(pool, { disposeExternalPool: true });
const prisma = new PrismaClient({ adapter });

const contentStatus = "PUBLISHED" as const;

async function main() {
  const world = await prisma.world.upsert({
    where: { slug: worldOne.id },
    update: {
      number: worldOne.number,
      title: worldOne.title,
      subtitle: worldOne.subtitle,
      description: worldOne.description,
      xpReward: worldOne.xp,
      status: contentStatus,
      metadata: toJson({
        bossTitle: worldOne.bossTitle,
        bossDescription: worldOne.bossDescription,
        dailyChallengeTitle: worldOne.dailyChallengeTitle,
        dailyChallengeDescription: worldOne.dailyChallengeDescription,
        progressPercent: worldOne.progressPercent,
        profileProgressPercent: worldOne.profileProgressPercent,
        dashboardProgressPercent: worldOne.dashboardProgressPercent,
      }),
    },
    create: {
      slug: worldOne.id,
      number: worldOne.number,
      title: worldOne.title,
      subtitle: worldOne.subtitle,
      description: worldOne.description,
      xpReward: worldOne.xp,
      status: contentStatus,
      metadata: toJson({
        bossTitle: worldOne.bossTitle,
        bossDescription: worldOne.bossDescription,
        dailyChallengeTitle: worldOne.dailyChallengeTitle,
        dailyChallengeDescription: worldOne.dailyChallengeDescription,
        progressPercent: worldOne.progressPercent,
        profileProgressPercent: worldOne.profileProgressPercent,
        dashboardProgressPercent: worldOne.dashboardProgressPercent,
      }),
    },
  });

  const stagesBySlug = new Map<string, { id: string }>();

  for (const [index, stageData] of worldOne.stages.entries()) {
    const stageNumber = Number.parseInt(stageData.number, 10);
    const stage = await prisma.stage.upsert({
      where: {
        worldId_slug: {
          worldId: world.id,
          slug: stageData.id,
        },
      },
      update: {
        number: Number.isNaN(stageNumber) ? index + 1 : stageNumber,
        title: stageData.title,
        description: stageData.description,
        xpReward: stageData.xp,
        status: contentStatus,
        isBossStage: stageData.boss ?? false,
        metadata: toJson({
          displayNumber: stageData.number,
          learningStatus: stageData.status,
          locked: stageData.locked ?? false,
        }),
      },
      create: {
        worldId: world.id,
        slug: stageData.id,
        number: Number.isNaN(stageNumber) ? index + 1 : stageNumber,
        title: stageData.title,
        description: stageData.description,
        xpReward: stageData.xp,
        status: contentStatus,
        isBossStage: stageData.boss ?? false,
        metadata: toJson({
          displayNumber: stageData.number,
          learningStatus: stageData.status,
          locked: stageData.locked ?? false,
        }),
      },
      select: { id: true },
    });

    stagesBySlug.set(stageData.id, stage);
  }

  for (const lessonData of worldOne.lessons) {
    const stage = stagesBySlug.get(lessonData.stageId);

    if (!stage) {
      throw new Error(`Missing stage for lesson ${lessonData.id}: ${lessonData.stageId}`);
    }

    const lesson = await prisma.lesson.upsert({
      where: {
        worldId_slug: {
          worldId: world.id,
          slug: lessonData.id,
        },
      },
      update: {
        stageId: stage.id,
        number: Number.parseInt(lessonData.number, 10),
        title: lessonData.title,
        description: lessonData.description,
        xpReward: lessonData.xpReward,
        status: contentStatus,
        vocabulary: toJson(lessonData.vocabulary),
        metadata: toJson({
          learningStatus: lessonData.status,
          xp: lessonData.xp,
          locked: lessonData.locked ?? false,
        }),
      },
      create: {
        worldId: world.id,
        stageId: stage.id,
        slug: lessonData.id,
        number: Number.parseInt(lessonData.number, 10),
        title: lessonData.title,
        description: lessonData.description,
        xpReward: lessonData.xpReward,
        status: contentStatus,
        vocabulary: toJson(lessonData.vocabulary),
        metadata: toJson({
          learningStatus: lessonData.status,
          xp: lessonData.xp,
          locked: lessonData.locked ?? false,
        }),
      },
      select: { id: true },
    });

    for (const [exerciseIndex, exercise] of lessonData.exercises.entries()) {
      await prisma.exercise.upsert({
        where: {
          lessonId_slug: {
            lessonId: lesson.id,
            slug: exercise.id,
          },
        },
        update: {
          type: exercise.type,
          prompt: exercise.prompt,
          content: toJson(getExerciseContent(exercise)),
          answerKey: toJson(getExerciseAnswerKey(exercise)),
          explanation: exercise.explanation,
          points: exercise.points,
          order: exerciseIndex + 1,
          status: contentStatus,
        },
        create: {
          lessonId: lesson.id,
          slug: exercise.id,
          type: exercise.type,
          prompt: exercise.prompt,
          content: toJson(getExerciseContent(exercise)),
          answerKey: toJson(getExerciseAnswerKey(exercise)),
          explanation: exercise.explanation,
          points: exercise.points,
          order: exerciseIndex + 1,
          status: contentStatus,
        },
      });
    }
  }

  const bossStage = stagesBySlug.get("boss-level");

  await prisma.challenge.upsert({
    where: {
      worldId_slug: {
        worldId: world.id,
        slug: "world-1-boss",
      },
    },
    update: {
      stageId: bossStage?.id,
      title: worldOne.bossTitle,
      description: worldOne.bossDescription,
      type: "boss",
      xpReward: Math.round(totalChallengePoints(challengeQuestions) / 10),
      passScore: challengeSettings.passScore,
      content: toJson({
        questions: challengeQuestions,
        settings: challengeSettings,
      }),
      status: contentStatus,
      metadata: toJson({
        source: "challengeQuestions",
        startingHearts: challengeSettings.startingHearts,
      }),
    },
    create: {
      worldId: world.id,
      stageId: bossStage?.id,
      slug: "world-1-boss",
      title: worldOne.bossTitle,
      description: worldOne.bossDescription,
      type: "boss",
      xpReward: Math.round(totalChallengePoints(challengeQuestions) / 10),
      passScore: challengeSettings.passScore,
      content: toJson({
        questions: challengeQuestions,
        settings: challengeSettings,
      }),
      status: contentStatus,
      metadata: toJson({
        source: "challengeQuestions",
        startingHearts: challengeSettings.startingHearts,
      }),
    },
  });

  await prisma.challenge.upsert({
    where: {
      worldId_slug: {
        worldId: world.id,
        slug: "world-1-daily-review",
      },
    },
    update: {
      title: worldOne.dailyChallengeTitle,
      description: worldOne.dailyChallengeDescription,
      type: "daily",
      xpReward: lessonQuestions.length * 10,
      content: toJson({
        questions: lessonQuestions,
      }),
      status: contentStatus,
      metadata: toJson({
        source: "lessonQuestions",
      }),
    },
    create: {
      worldId: world.id,
      slug: "world-1-daily-review",
      title: worldOne.dailyChallengeTitle,
      description: worldOne.dailyChallengeDescription,
      type: "daily",
      xpReward: lessonQuestions.length * 10,
      content: toJson({
        questions: lessonQuestions,
      }),
      status: contentStatus,
      metadata: toJson({
        source: "lessonQuestions",
      }),
    },
  });

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { slug: achievement.id },
      update: {
        title: achievement.title,
        description: achievement.description,
        status: contentStatus,
        criteria: toJson({
          learningStatus: achievement.status,
        }),
      },
      create: {
        slug: achievement.id,
        title: achievement.title,
        description: achievement.description,
        status: contentStatus,
        criteria: toJson({
          learningStatus: achievement.status,
        }),
      },
    });
  }

  console.log(
    `Seeded ${worldOne.title}: ${worldOne.stages.length} stages, ${worldOne.lessons.length} lessons, ${worldOne.lessons.reduce(
      (sum, lesson) => sum + lesson.exercises.length,
      0,
    )} exercises, 2 challenges, ${achievements.length} achievements.`,
  );
}

function getExerciseContent(exercise: LessonExercise) {
  if (exercise.type === "multipleChoice") {
    return {
      display: exercise.display,
      options: exercise.options,
      correctAnswer: exercise.correctAnswer,
    };
  }

  if (exercise.type === "fillBlank") {
    return {
      beforeBlank: exercise.beforeBlank,
      afterBlank: exercise.afterBlank,
      options: exercise.options,
      correctAnswer: exercise.correctAnswer,
    };
  }

  if (exercise.type === "sentenceOrder") {
    return {
      translation: exercise.translation,
      words: exercise.words,
      correctOrder: exercise.correctOrder,
    };
  }

  if (exercise.type === "matching") {
    return {
      pairs: exercise.pairs,
      englishOptions: exercise.englishOptions,
    };
  }

  return {
    situation: exercise.situation,
    options: exercise.options,
    correctAnswer: exercise.correctAnswer,
  };
}

function getExerciseAnswerKey(exercise: LessonExercise) {
  if (exercise.type === "matching") {
    return {
      pairs: exercise.pairs,
    };
  }

  if (exercise.type === "sentenceOrder") {
    return {
      correctOrder: exercise.correctOrder,
    };
  }

  return {
    correctAnswer: exercise.correctAnswer,
  };
}

function totalChallengePoints(questions: ChallengeQuestion[]) {
  return questions.reduce((sum, question) => sum + question.points, 0);
}

function toJson(value: unknown) {
  return value as InputJsonValue;
}

function getSeedConnectionString(value: string) {
  const url = new URL(value);

  if (url.searchParams.get("sslmode") !== "disable") {
    url.searchParams.set("sslmode", "no-verify");
  }

  return url.toString();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
