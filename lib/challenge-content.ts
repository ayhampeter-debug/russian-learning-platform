import "server-only";

import { getPrismaClient } from "@/lib/prisma";
import {
  challengeQuestions,
  challengeSettings,
  worldOne,
} from "@/lib/learning-data";

export type BossQuestionBase = {
  id: string;
  phase: string;
  type: "choice" | "text" | "sequence" | "scenario";
  prompt: string;
  display: string;
  explanation: string;
  points: number;
  damage: number;
  bossLine: string;
};

export type BossChoiceQuestion = BossQuestionBase & {
  type: "choice";
  options: string[];
  correctAnswer: string;
};

export type BossTextQuestion = BossQuestionBase & {
  type: "text";
  correctAnswer: string;
  acceptedAnswers: string[];
};

export type BossSequenceQuestion = BossQuestionBase & {
  type: "sequence";
  translation: string;
  words: string[];
  correctOrder: string[];
};

export type BossScenarioQuestion = BossQuestionBase & {
  type: "scenario";
  situation: string;
  options: string[];
  correctAnswer: string;
};

export type BossQuestion =
  | BossChoiceQuestion
  | BossTextQuestion
  | BossSequenceQuestion
  | BossScenarioQuestion;

export type BossChallengeSettings = {
  startingHearts: number;
  passScore: number;
};

export type BossChallengeContent = {
  id: string;
  title: string;
  description: string;
  source: "database" | "static";
  settings: BossChallengeSettings;
  questions: BossQuestion[];
};

type JsonRecord = Record<string, unknown>;
type DatabaseChallenge = {
  slug: string;
  title: string;
  description: string;
  passScore: number | null;
  content: unknown;
};

export async function getWorldOneBossChallenge(): Promise<BossChallengeContent> {
  try {
    const challenge = await getPrismaClient().challenge.findFirst({
      where: {
        status: "PUBLISHED",
        world: { number: 1 },
        OR: [{ slug: "world-1-boss" }, { type: "boss" }],
      },
      orderBy: { createdAt: "asc" },
    });

    if (!challenge) {
      return getStaticBossChallenge();
    }

    const mappedChallenge = mapBossChallengeFromDatabase(challenge);

    if (mappedChallenge.questions.length === 0) {
      return getStaticBossChallenge();
    }

    return mappedChallenge;
  } catch {
    console.error("Falling back to static World 1 boss challenge.");
    return getStaticBossChallenge();
  }
}

function getStaticBossChallenge(): BossChallengeContent {
  return {
    id: "world-1-boss",
    title: worldOne.bossTitle,
    description: worldOne.bossDescription,
    source: "static",
    settings: challengeSettings,
    questions: buildBossQuestions(challengeQuestions),
  };
}

function mapBossChallengeFromDatabase(challenge: DatabaseChallenge): BossChallengeContent {
  const content = asRecord(challenge.content);
  const settings = asRecord(content.settings);
  const questions = getQuestionRecords(content.questions);
  const passScore = getNumber(challenge.passScore, getNumber(settings.passScore, challengeSettings.passScore));
  const startingHearts = getNumber(settings.startingHearts, challengeSettings.startingHearts);

  return {
    id: challenge.slug,
    title: challenge.title,
    description: challenge.description,
    source: "database",
    settings: {
      startingHearts,
      passScore,
    },
    questions: buildBossQuestions(questions),
  };
}

function buildBossQuestions(questions: unknown[]): BossQuestion[] {
  const questionRecords = questions.map(asRecord);
  const mappedQuestions = questionRecords
    .map((question, index) => mapQuestionRecord(question, index, questionRecords.length))
    .filter((question): question is BossQuestion => Boolean(question))
    .map(repairImportedBossQuestion);

  if (mappedQuestions.length >= 6 && !mappedQuestions.some((question) => question.type === "sequence")) {
    return [
      mappedQuestions[0],
      mappedQuestions[1],
      getDefaultSequenceQuestion(),
      mappedQuestions[2],
      getDefaultScenarioQuestion(),
      mappedQuestions[3],
      mappedQuestions[4],
      mappedQuestions[5],
      ...mappedQuestions.slice(6),
    ];
  }

  return mappedQuestions;
}

function mapQuestionRecord(question: JsonRecord, index: number, questionCount: number): BossQuestion | null {
  const type = question.type;
  const base = {
    id: getString(question.id, `boss-question-${index + 1}`),
    phase: getString(question.phase, index < 2 ? "Phase 1" : index < 4 ? "Phase 2" : "Phase 3"),
    prompt: getString(question.prompt, ""),
    display: getString(question.display, getString(question.russian, "")),
    explanation: getString(question.explanation, ""),
    points: getNumber(question.points, 0),
    damage: getNumber(question.damage, getNumber(question.points, 0)),
    bossLine: getString(
      question.bossLine,
      index === questionCount - 1
        ? "The final shield comes up. One clean answer can end the fight."
        : "The sentinel tests your First Contact basics.",
    ),
  };

  if (type === "choice") {
    return {
      ...base,
      type: "choice",
      options: getStringArray(question.options),
      correctAnswer: getString(question.correctAnswer, ""),
    };
  }

  if (type === "text") {
    return {
      ...base,
      type: "text",
      correctAnswer: getString(question.correctAnswer, ""),
      acceptedAnswers: getStringArray(question.acceptedAnswers, [getString(question.correctAnswer, "")]),
    };
  }

  if (type === "sequence") {
    return {
      ...base,
      type: "sequence",
      translation: getString(question.translation, base.display),
      words: getStringArray(question.words),
      correctOrder: getStringArray(question.correctOrder),
    };
  }

  if (type === "scenario") {
    return {
      ...base,
      type: "scenario",
      situation: getString(question.situation, ""),
      options: getStringArray(question.options),
      correctAnswer: getString(question.correctAnswer, ""),
    };
  }

  return null;
}

function getDefaultSequenceQuestion(): BossQuestion {
  return {
    id: "assemble-name-intro",
    type: "sequence",
    phase: "Phase 2",
    prompt: "Break the armor by building the Russian sentence.",
    display: "My name is Alex.",
    translation: "My name is Alex.",
    words: ["Алекс", "зовут", "Меня"],
    correctOrder: ["Меня", "зовут", "Алекс"],
    explanation: "Меня зовут Алекс is the natural Russian sentence for My name is Alex.",
    points: 170,
    damage: 170,
    bossLine: "The sentinel scrambles the words. Put them back in order.",
  };
}

function getDefaultScenarioQuestion(): BossQuestion {
  return {
    id: "station-scenario",
    type: "scenario",
    phase: "Phase 3",
    prompt: "Choose the line that keeps the conversation alive.",
    display: "Moscow station encounter",
    situation:
      "A stranger asks if you understand the announcement. You do not. What do you say?",
    options: ["Я не понимаю", "Пока", "Да", "Спасибо"],
    correctAnswer: "Я не понимаю",
    explanation: "Я не понимаю means I do not understand, which fits this situation.",
    points: 190,
    damage: 190,
    bossLine: "The arena goes quiet. Pick the survival phrase.",
  };
}

function repairImportedBossQuestion(question: BossQuestion): BossQuestion {
  if (question.id === "gatekeeper-privet" && question.type === "choice") {
    return {
      ...question,
      prompt: "The Gatekeeper says: Привет. What does it mean?",
      display: "Привет",
      explanation: "Привет is the common informal way to say Hello.",
    };
  }

  if (question.id === "type-spasibo" && question.type === "text") {
    return {
      ...question,
      prompt: "Type the English meaning of Спасибо.",
      display: "Спасибо",
      explanation: "Спасибо means Thank you or Thanks.",
    };
  }

  if (question.id === "polite-greeting" && question.type === "choice") {
    return {
      ...question,
      options: ["Пока", "Здравствуйте", "Нет", "Кто"],
      correctAnswer: "Здравствуйте",
      explanation: "Здравствуйте is the polite/formal greeting.",
    };
  }

  if (question.id === "your-name-answer" && question.type === "choice") {
    return {
      ...question,
      prompt: "What is the correct answer to Как тебя зовут?",
      display: "Как тебя зовут?",
      options: ["Меня зовут Alex", "Я не понимаю", "До свидания", "Где?"],
      correctAnswer: "Меня зовут Alex",
      explanation: "Как тебя зовут? asks What is your name?",
    };
  }

  if (question.id === "type-da" && question.type === "text") {
    return {
      ...question,
      prompt: "Type the English word for Да.",
      display: "Да",
      explanation: "Да means Yes.",
    };
  }

  if (question.id === "survival-phrase-understand" && question.type === "choice") {
    return {
      ...question,
      options: ["Я не понимаю", "Пожалуйста", "Спасибо", "Привет"],
      correctAnswer: "Я не понимаю",
      explanation: "Я не понимаю means I do not understand.",
    };
  }

  return question;
}

function getQuestionRecords(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const record = asRecord(item);
    return Object.keys(record).length > 0 ? [record] : [];
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
