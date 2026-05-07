export type StageStatus = "Completed" | "Unlocked" | "Locked";

export type LessonStatus = StageStatus | "In progress";

export type AchievementStatus = "Unlocked" | "In progress";

export type StatAccent = "cyan" | "yellow" | "red" | "green";

export type Stage = {
  id: string;
  number: string;
  title: string;
  description: string;
  status: StageStatus;
  xp: number;
  locked?: boolean;
  boss?: boolean;
};

export type Lesson = {
  id: string;
  number: string;
  title: string;
  description: string;
  status: LessonStatus;
  xp: number;
  locked?: boolean;
};

export type LessonQuestion = {
  id: string;
  prompt: string;
  russian: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type ChoiceQuestion = {
  id: string;
  type: "choice";
  prompt: string;
  display: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
};

export type TextQuestion = {
  id: string;
  type: "text";
  prompt: string;
  display: string;
  correctAnswer: string;
  acceptedAnswers: string[];
  explanation: string;
  points: number;
};

export type ChallengeQuestion = ChoiceQuestion | TextQuestion;

export type Achievement = {
  id: string;
  title: string;
  description: string;
  status: AchievementStatus;
};

export type ProfileStat = {
  title: string;
  value: string;
  accent: StatAccent;
};

export type RecentActivity = {
  title: string;
  detail: string;
  time: string;
};

export type UserProgress = {
  userName: string;
  initials: string;
  totalXp: number;
  dashboardXp: number;
  currentStreakDays: number;
  dashboardStreakDays: number;
  hearts: number;
  level: number;
  completedLessons: number;
  completedChallenges: number;
  longestStreakDays: number;
  unlockedAchievements: number;
  currentWorldProgressPercent: number;
  profileWorldProgressPercent: number;
  clearedSteps: number;
  totalSteps: number;
  profileWorldXp: number;
  nextGoalTitle: string;
  nextGoalDescription: string;
};

export type World = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  progressPercent: number;
  profileProgressPercent: number;
  dashboardProgressPercent: number;
  xp: number;
  bossTitle: string;
  bossDescription: string;
  dailyChallengeTitle: string;
  dailyChallengeDescription: string;
  stages: Stage[];
  lessons: Lesson[];
};

export const worldOne: World = {
  id: "world-1",
  number: 1,
  title: "First Contact",
  subtitle: "World 1: First Contact",
  description:
    "Greetings, introductions, basic phrases, question words, and numbers 1–10.",
  progressPercent: 40,
  profileProgressPercent: 48,
  dashboardProgressPercent: 40,
  xp: 240,
  bossTitle: "Boss Level",
  bossDescription: "Complete your first basic Russian conversation.",
  dailyChallengeTitle: "5 quick questions",
  dailyChallengeDescription:
    "Review greetings and basic Russian phrases to keep your streak alive.",
  stages: [
    {
      id: "hello",
      number: "1",
      title: "Hello!",
      description:
        "Learn your first greetings: Привет, Здравствуйте, Пока.",
      status: "Completed",
      xp: 80,
    },
    {
      id: "who-are-you",
      number: "2",
      title: "Who are you?",
      description: "Introduce yourself and ask someone's name.",
      status: "Unlocked",
      xp: 100,
    },
    {
      id: "survival-phrases",
      number: "3",
      title: "Survival Phrases",
      description:
        "Спасибо, пожалуйста, извините, не понимаю.",
      status: "Locked",
      xp: 120,
      locked: true,
    },
    {
      id: "question-basics",
      number: "4",
      title: "Question Basics",
      description:
        "Что? Кто? Где? Как? Learn essential question words.",
      status: "Locked",
      xp: 120,
      locked: true,
    },
    {
      id: "numbers-1-10",
      number: "5",
      title: "Numbers 1–10",
      description: "Recognize and use the first Russian numbers.",
      status: "Locked",
      xp: 150,
      locked: true,
    },
    {
      id: "boss-level",
      number: "★",
      title: "Boss Level",
      description: "Complete your first basic Russian conversation.",
      status: "Locked",
      xp: 200,
      locked: true,
      boss: true,
    },
  ],
  lessons: [
    {
      id: "say-hello",
      number: "1",
      title: "Say Hello",
      description: "Привет, Здравствуйте, Пока",
      status: "Completed",
      xp: 80,
    },
    {
      id: "introduce-yourself",
      number: "2",
      title: "Introduce Yourself",
      description: "Меня зовут..., Я...",
      status: "Unlocked",
      xp: 100,
    },
    {
      id: "basic-questions",
      number: "3",
      title: "Basic Questions",
      description: "Что? Кто? Где?",
      status: "Locked",
      xp: 120,
      locked: true,
    },
  ],
};

export const lessonQuestions: LessonQuestion[] = [
  {
    id: "privet-meaning",
    prompt: "What does Привет mean?",
    russian: "Привет",
    options: ["Goodbye", "Hello", "Thank you", "Please"],
    correctAnswer: "Hello",
    explanation: "Привет means Hello. It is informal and very common.",
  },
  {
    id: "thank-you-word",
    prompt: "Choose the correct Russian word for Thank you.",
    russian: "Thank you",
    options: ["Пока", "Спасибо", "Да", "Нет"],
    correctAnswer: "Спасибо",
    explanation: "Спасибо means Thank you.",
  },
  {
    id: "da-meaning",
    prompt: "What does Да mean?",
    russian: "Да",
    options: ["No", "Yes", "Where", "Who"],
    correctAnswer: "Yes",
    explanation: "Да means Yes.",
  },
  {
    id: "poka-translation",
    prompt: "Choose the correct translation of Пока.",
    russian: "Пока",
    options: ["Hi / Bye", "Please", "Sorry", "Good morning"],
    correctAnswer: "Hi / Bye",
    explanation:
      "Пока can mean Hi or Bye informally, depending on context.",
  },
];

export const challengeQuestions: ChallengeQuestion[] = [
  {
    id: "gatekeeper-privet",
    type: "choice",
    prompt: "The Gatekeeper says: Привет. What does it mean?",
    display: "Привет",
    options: ["Goodbye", "Hello", "Thank you", "Please"],
    correctAnswer: "Hello",
    explanation: "Привет is the common informal way to say Hello.",
    points: 120,
  },
  {
    id: "type-spasibo",
    type: "text",
    prompt: "Type the English meaning of Спасибо.",
    display: "Спасибо",
    correctAnswer: "Thank you",
    acceptedAnswers: ["thank you", "thanks"],
    explanation: "Спасибо means Thank you or Thanks.",
    points: 150,
  },
  {
    id: "polite-greeting",
    type: "choice",
    prompt: "Choose the phrase you would use for a polite greeting.",
    display: "First Contact protocol",
    options: ["Пока", "Здравствуйте", "Нет", "Кто"],
    correctAnswer: "Здравствуйте",
    explanation: "Здравствуйте is the polite/formal greeting.",
    points: 160,
  },
  {
    id: "your-name-answer",
    type: "choice",
    prompt: "What is the correct answer to Как тебя зовут?",
    display: "Как тебя зовут?",
    options: [
      "Меня зовут Alex",
      "Я не понимаю",
      "До свидания",
      "Где?",
    ],
    correctAnswer: "Меня зовут Alex",
    explanation: "Как тебя зовут? asks What is your name?",
    points: 180,
  },
  {
    id: "type-da",
    type: "text",
    prompt: "Type the English word for Да.",
    display: "Да",
    correctAnswer: "Yes",
    acceptedAnswers: ["yes"],
    explanation: "Да means Yes.",
    points: 120,
  },
  {
    id: "survival-phrase-understand",
    type: "choice",
    prompt:
      "Final clash: choose the correct survival phrase for I do not understand.",
    display: "Boss shield phrase",
    options: [
      "Я не понимаю",
      "Пожалуйста",
      "Спасибо",
      "Привет",
    ],
    correctAnswer: "Я не понимаю",
    explanation: "Я не понимаю means I do not understand.",
    points: 220,
  },
];

export const challengeSettings = {
  startingHearts: 3,
  passScore: 650,
};

export const achievements: Achievement[] = [
  {
    id: "first-contact",
    title: "First Contact",
    description: "Completed the first greeting lesson.",
    status: "Unlocked",
  },
  {
    id: "streak-keeper",
    title: "Streak Keeper",
    description: "Practiced Russian for 7 days in a row.",
    status: "Unlocked",
  },
  {
    id: "boss-challenger",
    title: "Boss Challenger",
    description: "Reached the World 1 boss challenge.",
    status: "In progress",
  },
];

export const userProgress: UserProgress = {
  userName: "Alex Learner",
  initials: "AL",
  totalXp: 1480,
  dashboardXp: 240,
  currentStreakDays: 7,
  dashboardStreakDays: 3,
  hearts: 5,
  level: 1,
  completedLessons: 18,
  completedChallenges: 6,
  longestStreakDays: 14,
  unlockedAchievements: 2,
  currentWorldProgressPercent: 40,
  profileWorldProgressPercent: 48,
  clearedSteps: 12,
  totalSteps: 25,
  profileWorldXp: 480,
  nextGoalTitle: "Complete Introduce Yourself",
  nextGoalDescription:
    "Earn 100 XP and move closer to the World 1 boss challenge.",
};

export const profileStats: ProfileStat[] = [
  { title: "Total XP", value: "1,480", accent: "cyan" },
  { title: "Current Streak", value: "7 days", accent: "red" },
  { title: "Longest Streak", value: "14 days", accent: "yellow" },
  { title: "Completed Lessons", value: "18", accent: "green" },
  { title: "Completed Challenges", value: "6", accent: "cyan" },
];

export const recentActivity: RecentActivity[] = [
  {
    title: "Finished Say Hello",
    detail: "Earned 80 XP in World 1.",
    time: "Today",
  },
  {
    title: "Daily Challenge",
    detail: "Answered 5 quick review questions.",
    time: "Yesterday",
  },
  {
    title: "Unlocked Introduce Yourself",
    detail: "Next lesson is ready to start.",
    time: "2 days ago",
  },
  {
    title: "Streak milestone",
    detail: "Reached a 7 day learning streak.",
    time: "This week",
  },
];
