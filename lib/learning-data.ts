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
  stageId: string;
  status: LessonStatus;
  xp: number;
  xpReward: number;
  vocabulary: VocabularyItem[];
  exercises: LessonExercise[];
  locked?: boolean;
};

export type VocabularyItem = {
  russian: string;
  english: string;
  note?: string;
};

export type ExerciseBase = {
  id: string;
  type: "multipleChoice" | "fillBlank" | "sentenceOrder" | "matching" | "scenarioChoice";
  prompt: string;
  points: number;
  explanation: string;
};

export type MultipleChoiceExercise = ExerciseBase & {
  type: "multipleChoice";
  display: string;
  options: string[];
  correctAnswer: string;
};

export type FillBlankExercise = ExerciseBase & {
  type: "fillBlank";
  beforeBlank: string;
  afterBlank: string;
  options: string[];
  correctAnswer: string;
};

export type SentenceOrderExercise = ExerciseBase & {
  type: "sentenceOrder";
  translation: string;
  words: string[];
  correctOrder: string[];
};

export type MatchingPair = {
  russian: string;
  english: string;
};

export type MatchingExercise = ExerciseBase & {
  type: "matching";
  pairs: MatchingPair[];
  englishOptions: string[];
};

export type ScenarioChoiceExercise = ExerciseBase & {
  type: "scenarioChoice";
  situation: string;
  options: string[];
  correctAnswer: string;
};

export type LessonExercise =
  | MultipleChoiceExercise
  | FillBlankExercise
  | SentenceOrderExercise
  | MatchingExercise
  | ScenarioChoiceExercise;

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
  currentStreak: number;
  longestStreak: number;
  hearts: number;
  level: number;
  completedLessons: string[];
  completedStages: string[];
  completedChallenges: string[];
  unlockedStages: string[];
  achievementsEarned: string[];
  currentWorldProgressPercent: number;
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
  progressPercent: 10,
  profileProgressPercent: 10,
  dashboardProgressPercent: 10,
  xp: 750,
  bossTitle: "Boss Level",
  bossDescription: "Complete your first basic Russian conversation.",
  dailyChallengeTitle: "5 quick questions",
  dailyChallengeDescription:
    "Review greetings and basic Russian phrases to keep your streak alive.",
  stages: [
    {
      id: "hello",
      number: "1",
      title: "Opening Signals",
      description: "Lessons 1-2: casual greetings and formal vs informal greetings.",
      status: "Completed",
      xp: 135,
    },
    {
      id: "who-are-you",
      number: "2",
      title: "First Exchange",
      description: "Lessons 3-5: yes/no, introduce yourself, and ask someone's name.",
      status: "Unlocked",
      xp: 225,
    },
    {
      id: "survival-phrases",
      number: "3",
      title: "Survival Phrases",
      description: "Lessons 6-7: polite words and I do not understand.",
      status: "Locked",
      xp: 150,
      locked: true,
    },
    {
      id: "question-basics",
      number: "4",
      title: "Question Basics",
      description: "Lesson 8: what, who, where, and how.",
      status: "Locked",
      xp: 80,
      locked: true,
    },
    {
      id: "numbers-1-10",
      number: "5",
      title: "Numbers 1-10",
      description: "Lessons 9-10: count from one to ten.",
      status: "Locked",
      xp: 160,
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
  lessons: [],
};

const improvedWorldOneLessons: Lesson[] = [
  {
    id: "saying-hello",
    number: "1",
    title: "Say Hello",
    description: "Use simple greetings for friends, strangers, and mornings.",
    stageId: "hello",
    status: "Completed",
    xp: 65,
    xpReward: 65,
    vocabulary: [
      { russian: "Привет", english: "Hi / Hello", note: "Informal" },
      { russian: "Здравствуйте", english: "Hello", note: "Polite or plural" },
      { russian: "Доброе утро", english: "Good morning" },
      { russian: "Пока", english: "Bye", note: "Informal" },
      { russian: "До свидания", english: "Goodbye", note: "Polite" },
    ],
    exercises: [
      {
        id: "hello-privet-meaning",
        type: "multipleChoice",
        prompt: "Choose the best English meaning.",
        display: "Привет",
        options: ["Goodbye", "Hi", "Thank you", "Please"],
        correctAnswer: "Hi",
        explanation: "Привет means Hi or Hello. Use it with people you know.",
        points: 10,
      },
      {
        id: "hello-fill-morning",
        type: "fillBlank",
        prompt: "Complete the morning greeting.",
        beforeBlank: "Доброе",
        afterBlank: ".",
        options: ["утро", "пока", "да", "вас"],
        correctAnswer: "утро",
        explanation: "Доброе утро means Good morning.",
        points: 10,
      },
      {
        id: "hello-match",
        type: "matching",
        prompt: "Match each phrase with its meaning.",
        pairs: [
          { russian: "Привет", english: "Hi" },
          { russian: "Здравствуйте", english: "Hello" },
          { russian: "Пока", english: "Bye" },
          { russian: "До свидания", english: "Goodbye" },
        ],
        englishOptions: ["Goodbye", "Hello", "Bye", "Hi"],
        explanation: "These cover casual and polite ways to start or end a conversation.",
        points: 15,
      },
      {
        id: "hello-scenario-stranger",
        type: "scenarioChoice",
        prompt: "Pick the best phrase for the situation.",
        situation: "You enter a small shop and greet the worker politely.",
        options: ["Здравствуйте", "Пока", "Да", "Кто?"],
        correctAnswer: "Здравствуйте",
        explanation: "Здравствуйте is the safe polite greeting for strangers.",
        points: 15,
      },
      {
        id: "hello-order-goodbye",
        type: "sentenceOrder",
        prompt: "Build the Russian phrase.",
        translation: "Goodbye.",
        words: ["свидания", "До"],
        correctOrder: ["До", "свидания"],
        explanation: "До свидания is the standard polite goodbye.",
        points: 15,
      },
    ],
  },
  {
    id: "formal-informal-greetings",
    number: "2",
    title: "Friendly or Polite",
    description: "Choose greetings that fit friends, adults, strangers, and groups.",
    stageId: "hello",
    status: "Unlocked",
    xp: 70,
    xpReward: 70,
    vocabulary: [
      { russian: "Привет", english: "Hi", note: "Informal" },
      { russian: "Здравствуй", english: "Hello", note: "Informal to one person" },
      { russian: "Здравствуйте", english: "Hello", note: "Polite or plural" },
      { russian: "Добрый день", english: "Good afternoon" },
      { russian: "Добрый вечер", english: "Good evening" },
    ],
    exercises: [
      {
        id: "formal-zdravstvuyte",
        type: "multipleChoice",
        prompt: "Which phrase is best for greeting a teacher?",
        display: "Polite greeting",
        options: ["Привет", "Здравствуйте", "Пока", "Да"],
        correctAnswer: "Здравствуйте",
        explanation: "Здравствуйте is polite and works with adults, strangers, or groups.",
        points: 10,
      },
      {
        id: "formal-fill-day",
        type: "fillBlank",
        prompt: "Complete the daytime greeting.",
        beforeBlank: "Добрый",
        afterBlank: ".",
        options: ["день", "утро", "пока", "нет"],
        correctAnswer: "день",
        explanation: "Добрый день means Good afternoon or Good day.",
        points: 10,
      },
      {
        id: "formal-match-use",
        type: "matching",
        prompt: "Match each phrase with its natural use.",
        pairs: [
          { russian: "Привет", english: "A friend" },
          { russian: "Здравствуй", english: "One familiar person" },
          { russian: "Здравствуйте", english: "A stranger or group" },
          { russian: "Добрый вечер", english: "Evening greeting" },
        ],
        englishOptions: ["A stranger or group", "Evening greeting", "A friend", "One familiar person"],
        explanation: "Russian greetings change depending on formality and audience.",
        points: 15,
      },
      {
        id: "formal-scenario-friend",
        type: "scenarioChoice",
        prompt: "Pick the natural greeting.",
        situation: "You see your friend after class.",
        options: ["Привет", "Здравствуйте", "Добрый вечер", "До свидания"],
        correctAnswer: "Привет",
        explanation: "Привет is natural with a friend.",
        points: 15,
      },
      {
        id: "formal-order-good-evening",
        type: "sentenceOrder",
        prompt: "Build the Russian phrase.",
        translation: "Good evening.",
        words: ["вечер", "Добрый"],
        correctOrder: ["Добрый", "вечер"],
        explanation: "Добрый вечер is the normal evening greeting.",
        points: 20,
      },
    ],
  },
  {
    id: "yes-and-no",
    number: "3",
    title: "Yes, No, and OK",
    description: "Give short answers and react to simple questions.",
    stageId: "who-are-you",
    status: "Locked",
    xp: 70,
    xpReward: 70,
    locked: true,
    vocabulary: [
      { russian: "Да", english: "Yes" },
      { russian: "Нет", english: "No" },
      { russian: "Хорошо", english: "OK / Good" },
      { russian: "Ладно", english: "Alright" },
      { russian: "Не знаю", english: "I do not know" },
    ],
    exercises: [
      {
        id: "yes-da",
        type: "multipleChoice",
        prompt: "What does this word mean?",
        display: "Да",
        options: ["No", "Yes", "Where", "Please"],
        correctAnswer: "Yes",
        explanation: "Да means Yes.",
        points: 10,
      },
      {
        id: "no-fill",
        type: "fillBlank",
        prompt: "Fill the blank with the Russian word for No.",
        beforeBlank: "The opposite of Да is",
        afterBlank: ".",
        options: ["Нет", "Кто", "Спасибо", "Привет"],
        correctAnswer: "Нет",
        explanation: "Нет means No.",
        points: 10,
      },
      {
        id: "yes-no-match",
        type: "matching",
        prompt: "Match the short answers.",
        pairs: [
          { russian: "Да", english: "Yes" },
          { russian: "Нет", english: "No" },
          { russian: "Хорошо", english: "OK" },
          { russian: "Не знаю", english: "I do not know" },
        ],
        englishOptions: ["No", "I do not know", "Yes", "OK"],
        explanation: "These short answers are useful in everyday first conversations.",
        points: 15,
      },
      {
        id: "yes-no-scenario",
        type: "scenarioChoice",
        prompt: "Choose the answer.",
        situation: "Someone asks if you are ready. You want to say yes.",
        options: ["Да", "Нет", "Пока", "Что?"],
        correctAnswer: "Да",
        explanation: "Да is the direct Russian answer for Yes.",
        points: 15,
      },
      {
        id: "yes-order-dont-know",
        type: "sentenceOrder",
        prompt: "Build the Russian sentence.",
        translation: "I do not know.",
        words: ["знаю", "Не"],
        correctOrder: ["Не", "знаю"],
        explanation: "Не знаю is a short, common way to say I do not know.",
        points: 20,
      },
    ],
  },
  {
    id: "introduce-yourself",
    number: "4",
    title: "Introduce Yourself",
    description: "Say your name and respond when meeting someone.",
    stageId: "who-are-you",
    status: "Locked",
    xp: 80,
    xpReward: 80,
    locked: true,
    vocabulary: [
      { russian: "Я", english: "I" },
      { russian: "Меня зовут Alex", english: "My name is Alex" },
      { russian: "Я из Америки", english: "I am from America" },
      { russian: "Очень приятно", english: "Nice to meet you" },
      { russian: "А ты?", english: "And you?", note: "Informal" },
    ],
    exercises: [
      {
        id: "intro-menya-zovut",
        type: "multipleChoice",
        prompt: "Choose the best English meaning.",
        display: "Меня зовут Alex",
        options: ["My name is Alex", "Where is Alex?", "Goodbye Alex", "Thank you Alex"],
        correctAnswer: "My name is Alex",
        explanation: "Меня зовут Alex is the standard way to say My name is Alex.",
        points: 10,
      },
      {
        id: "intro-fill-from-america",
        type: "fillBlank",
        prompt: "Complete the phrase I am from America.",
        beforeBlank: "Я из",
        afterBlank: ".",
        options: ["Америки", "спасибо", "тебя", "нет"],
        correctAnswer: "Америки",
        explanation: "Я из Америки means I am from America.",
        points: 10,
      },
      {
        id: "intro-order-name",
        type: "sentenceOrder",
        prompt: "Build the Russian sentence.",
        translation: "My name is Alex.",
        words: ["Alex", "зовут", "Меня"],
        correctOrder: ["Меня", "зовут", "Alex"],
        explanation: "Меня зовут Alex is the natural introduction pattern.",
        points: 20,
      },
      {
        id: "intro-match",
        type: "matching",
        prompt: "Match each introduction phrase.",
        pairs: [
          { russian: "Я", english: "I" },
          { russian: "Меня зовут Alex", english: "My name is Alex" },
          { russian: "Очень приятно", english: "Nice to meet you" },
          { russian: "А ты?", english: "And you?" },
        ],
        englishOptions: ["Nice to meet you", "I", "And you?", "My name is Alex"],
        explanation: "These phrases make a short first introduction.",
        points: 20,
      },
      {
        id: "intro-scenario",
        type: "scenarioChoice",
        prompt: "Pick the best phrase for the situation.",
        situation: "A new classmate says hello. You want to tell them your name.",
        options: ["Меня зовут Alex", "Пока", "Где?", "Нет"],
        correctAnswer: "Меня зовут Alex",
        explanation: "Меня зовут Alex gives your name clearly.",
        points: 20,
      },
    ],
  },
  {
    id: "ask-someones-name",
    number: "5",
    title: "Ask Someone's Name",
    description: "Ask for a name in casual and polite first meetings.",
    stageId: "who-are-you",
    status: "Locked",
    xp: 75,
    xpReward: 75,
    locked: true,
    vocabulary: [
      { russian: "Как тебя зовут?", english: "What is your name?", note: "Informal: use with friends or children" },
      { russian: "Как вас зовут?", english: "What is your name?", note: "Formal or plural: use with adults, strangers, or groups" },
      { russian: "тебя", english: "you", note: "Informal object form of ты" },
      { russian: "вас", english: "you", note: "Formal or plural object form of вы" },
      { russian: "А вас?", english: "And you?", note: "Polite" },
    ],
    exercises: [
      {
        id: "ask-name-informal",
        type: "multipleChoice",
        prompt: "Choose the meaning.",
        display: "Как тебя зовут?",
        options: ["What is your name?", "Where are you?", "How are you?", "Who is there?"],
        correctAnswer: "What is your name?",
        explanation: "Как тебя зовут? asks What is your name? informally.",
        points: 10,
      },
      {
        id: "ask-name-formal-fill",
        type: "fillBlank",
        prompt: "Complete the polite question.",
        beforeBlank: "Как",
        afterBlank: "зовут?",
        options: ["вас", "тебя", "я", "нет"],
        correctAnswer: "вас",
        explanation: "Как вас зовут? is the polite version of What is your name?",
        points: 10,
      },
      {
        id: "ask-name-order",
        type: "sentenceOrder",
        prompt: "Build the Russian question.",
        translation: "What is your name? (informal)",
        words: ["зовут?", "тебя", "Как"],
        correctOrder: ["Как", "тебя", "зовут?"],
        explanation: "Как тебя зовут? is the common informal name question.",
        points: 20,
      },
      {
        id: "ask-name-match",
        type: "matching",
        prompt: "Match the name questions.",
        pairs: [
          { russian: "Как тебя зовут?", english: "What is your name? (informal)" },
          { russian: "Как вас зовут?", english: "What is your name? (polite)" },
          { russian: "А ты?", english: "And you? (informal)" },
          { russian: "А вас?", english: "And you? (polite)" },
        ],
        englishOptions: [
          "And you? (polite)",
          "What is your name? (informal)",
          "And you? (informal)",
          "What is your name? (polite)",
        ],
        explanation: "Use ты or тебя with friends. Use вы or вас with adults, strangers, or groups.",
        points: 15,
      },
      {
        id: "ask-name-scenario-adult",
        type: "scenarioChoice",
        prompt: "Pick the polite question.",
        situation: "You meet an adult neighbor and want to ask their name.",
        options: ["Как вас зовут?", "Как тебя зовут?", "Привет", "Не знаю"],
        correctAnswer: "Как вас зовут?",
        explanation: "Как вас зовут? is the polite choice for an adult or stranger.",
        points: 20,
      },
    ],
  },
  {
    id: "polite-words",
    number: "6",
    title: "Polite Words",
    description: "Use please, thank you, excuse me, and simple apologies.",
    stageId: "survival-phrases",
    status: "Locked",
    xp: 75,
    xpReward: 75,
    locked: true,
    vocabulary: [
      { russian: "Спасибо", english: "Thank you" },
      { russian: "Пожалуйста", english: "Please / You're welcome" },
      { russian: "Извините", english: "Excuse me / Sorry", note: "Polite" },
      { russian: "Простите", english: "Sorry / Excuse me", note: "Polite" },
      { russian: "Ничего", english: "It's OK" },
    ],
    exercises: [
      {
        id: "polite-spasibo",
        type: "multipleChoice",
        prompt: "What does this word mean?",
        display: "Спасибо",
        options: ["Thank you", "Hello", "No", "Where"],
        correctAnswer: "Thank you",
        explanation: "Спасибо means Thank you.",
        points: 10,
      },
      {
        id: "polite-fill-please",
        type: "fillBlank",
        prompt: "Fill the blank with Please.",
        beforeBlank: "Скажите,",
        afterBlank: ".",
        options: ["пожалуйста", "спасибо", "пока", "кто"],
        correctAnswer: "пожалуйста",
        explanation: "Пожалуйста makes a request polite.",
        points: 10,
      },
      {
        id: "polite-match",
        type: "matching",
        prompt: "Match the polite words.",
        pairs: [
          { russian: "Спасибо", english: "Thank you" },
          { russian: "Пожалуйста", english: "Please" },
          { russian: "Извините", english: "Excuse me" },
          { russian: "Ничего", english: "It's OK" },
        ],
        englishOptions: ["Excuse me", "Please", "It's OK", "Thank you"],
        explanation: "These words keep short Russian interactions polite.",
        points: 20,
      },
      {
        id: "polite-order-excuse-me",
        type: "sentenceOrder",
        prompt: "Build the polite phrase.",
        translation: "Excuse me, please.",
        words: ["пожалуйста", "Извините,"],
        correctOrder: ["Извините,", "пожалуйста"],
        explanation: "Извините, пожалуйста is useful when getting someone's attention.",
        points: 15,
      },
      {
        id: "polite-scenario-cafe",
        type: "scenarioChoice",
        prompt: "Pick the best phrase for the situation.",
        situation: "A barista gives you coffee. What do you say?",
        options: ["Спасибо", "Кто?", "Нет", "Пока"],
        correctAnswer: "Спасибо",
        explanation: "Спасибо is the right polite response after receiving something.",
        points: 20,
      },
    ],
  },
  {
    id: "i-dont-understand",
    number: "7",
    title: "When You Need Help",
    description: "Ask for help, say you do not understand, and ask someone to repeat.",
    stageId: "survival-phrases",
    status: "Locked",
    xp: 75,
    xpReward: 75,
    locked: true,
    vocabulary: [
      { russian: "Я не понимаю", english: "I do not understand" },
      { russian: "Помогите, пожалуйста", english: "Help me, please", note: "Polite" },
      { russian: "Повторите, пожалуйста", english: "Repeat, please", note: "Polite" },
      { russian: "Медленнее, пожалуйста", english: "More slowly, please" },
      { russian: "Что это значит?", english: "What does this mean?" },
    ],
    exercises: [
      {
        id: "understand-meaning",
        type: "multipleChoice",
        prompt: "Choose the meaning.",
        display: "Я не понимаю",
        options: ["I do not understand", "I am Alex", "Good morning", "Where is it?"],
        correctAnswer: "I do not understand",
        explanation: "Я не понимаю means I do not understand.",
        points: 10,
      },
      {
        id: "understand-fill-repeat",
        type: "fillBlank",
        prompt: "Complete the phrase Help me, please.",
        beforeBlank: "Помогите,",
        afterBlank: ".",
        options: ["пожалуйста", "спасибо", "привет", "нет"],
        correctAnswer: "пожалуйста",
        explanation: "Помогите, пожалуйста means Help me, please.",
        points: 10,
      },
      {
        id: "understand-order",
        type: "sentenceOrder",
        prompt: "Build the Russian sentence.",
        translation: "I do not understand.",
        words: ["понимаю", "не", "Я"],
        correctOrder: ["Я", "не", "понимаю"],
        explanation: "Я не понимаю is the core survival phrase here.",
        points: 20,
      },
      {
        id: "understand-match",
        type: "matching",
        prompt: "Match each help phrase.",
        pairs: [
          { russian: "Я не понимаю", english: "I do not understand" },
          { russian: "Помогите, пожалуйста", english: "Help me, please" },
          { russian: "Повторите, пожалуйста", english: "Repeat, please" },
          { russian: "Что это значит?", english: "What does this mean?" },
        ],
        englishOptions: [
          "What does this mean?",
          "Help me, please",
          "Repeat, please",
          "I do not understand",
        ],
        explanation: "These phrases help you ask for help or keep a conversation going.",
        points: 15,
      },
      {
        id: "understand-scenario",
        type: "scenarioChoice",
        prompt: "Choose the useful phrase.",
        situation: "You are lost and need someone to help you.",
        options: ["Помогите, пожалуйста", "Да", "Меня зовут Alex", "Доброе утро"],
        correctAnswer: "Помогите, пожалуйста",
        explanation: "Помогите, пожалуйста is a polite way to ask for help.",
        points: 20,
      },
    ],
  },
  {
    id: "basic-question-words",
    number: "8",
    title: "Ask Basic Questions",
    description: "Use what, who, where, and how in practical beginner questions.",
    stageId: "question-basics",
    status: "Locked",
    xp: 80,
    xpReward: 80,
    locked: true,
    vocabulary: [
      { russian: "Что это?", english: "What is this?" },
      { russian: "Кто это?", english: "Who is this?" },
      { russian: "Где?", english: "Where?" },
      { russian: "Как?", english: "How?" },
      { russian: "Где метро?", english: "Where is the metro?" },
    ],
    exercises: [
      {
        id: "question-chto",
        type: "multipleChoice",
        prompt: "What does this question word mean?",
        display: "Что это?",
        options: ["What is this?", "Who is this?", "Where is it?", "How is it?"],
        correctAnswer: "What is this?",
        explanation: "Что это? means What is this?",
        points: 10,
      },
      {
        id: "question-fill-where",
        type: "fillBlank",
        prompt: "Fill the blank with Where?",
        beforeBlank: "",
        afterBlank: "метро?",
        options: ["Где", "Кто", "Что", "Как"],
        correctAnswer: "Где",
        explanation: "Где метро? means Where is the metro?",
        points: 10,
      },
      {
        id: "question-match",
        type: "matching",
        prompt: "Match the question words.",
        pairs: [
          { russian: "Что это?", english: "What is this?" },
          { russian: "Кто это?", english: "Who is this?" },
          { russian: "Где?", english: "Where?" },
          { russian: "Как?", english: "How?" },
        ],
        englishOptions: ["Where?", "How?", "What is this?", "Who is this?"],
        explanation: "These short questions are useful when you need basic information.",
        points: 20,
      },
      {
        id: "question-order-metro",
        type: "sentenceOrder",
        prompt: "Build the Russian question.",
        translation: "Where is the metro?",
        words: ["метро?", "Где"],
        correctOrder: ["Где", "метро?"],
        explanation: "Где метро? is a short, useful location question.",
        points: 20,
      },
      {
        id: "question-scenario",
        type: "scenarioChoice",
        prompt: "Pick the best question word.",
        situation: "You point to an object and want to ask what it is.",
        options: ["Что это?", "Кто это?", "Где?", "Да"],
        correctAnswer: "Что это?",
        explanation: "Use Что это? when asking What is this?",
        points: 20,
      },
      {
        id: "question-scenario-where",
        type: "scenarioChoice",
        prompt: "Pick the best question word.",
        situation: "You want to ask where the cafe is.",
        options: ["Где?", "Кто это?", "Что это?", "Да"],
        correctAnswer: "Где?",
        explanation: "Use Где? when asking where something is.",
        points: 10,
      },
    ],
  },
  {
    id: "numbers-1-5",
    number: "9",
    title: "Numbers 1-5",
    description: "Count small amounts for tickets, tables, and items.",
    stageId: "numbers-1-10",
    status: "Locked",
    xp: 80,
    xpReward: 80,
    locked: true,
    vocabulary: [
      { russian: "один", english: "one" },
      { russian: "два", english: "two" },
      { russian: "три", english: "three" },
      { russian: "четыре", english: "four" },
      { russian: "пять", english: "five" },
    ],
    exercises: [
      {
        id: "numbers-one",
        type: "multipleChoice",
        prompt: "What number is this?",
        display: "один",
        options: ["one", "two", "four", "five"],
        correctAnswer: "one",
        explanation: "один means one.",
        points: 10,
      },
      {
        id: "numbers-fill-three",
        type: "fillBlank",
        prompt: "Fill the blank with three.",
        beforeBlank: "один, два,",
        afterBlank: ".",
        options: ["три", "два", "пять", "один"],
        correctAnswer: "три",
        explanation: "три means three.",
        points: 10,
      },
      {
        id: "numbers-match-1-5",
        type: "matching",
        prompt: "Match the numbers.",
        pairs: [
          { russian: "один", english: "one" },
          { russian: "два", english: "two" },
          { russian: "четыре", english: "four" },
          { russian: "пять", english: "five" },
        ],
        englishOptions: ["five", "one", "four", "two"],
        explanation: "These are the first numbers you need for small counts.",
        points: 15,
      },
      {
        id: "numbers-order-1-5",
        type: "sentenceOrder",
        prompt: "Put the numbers in order.",
        translation: "one, two, three, four, five",
        words: ["три", "пять", "один", "четыре", "два"],
        correctOrder: ["один", "два", "три", "четыре", "пять"],
        explanation: "The order is один, два, три, четыре, пять.",
        points: 20,
      },
      {
        id: "numbers-scenario-5",
        type: "scenarioChoice",
        prompt: "Choose the number.",
        situation: "You need five tickets. Which word means five?",
        options: ["пять", "два", "один", "четыре"],
        correctAnswer: "пять",
        explanation: "пять means five.",
        points: 20,
      },
    ],
  },
  {
    id: "numbers-6-10",
    number: "10",
    title: "Numbers 6-10",
    description: "Finish the first ten numbers for rooms, platforms, and times.",
    stageId: "numbers-1-10",
    status: "Locked",
    xp: 80,
    xpReward: 80,
    locked: true,
    vocabulary: [
      { russian: "шесть", english: "six" },
      { russian: "семь", english: "seven" },
      { russian: "восемь", english: "eight" },
      { russian: "девять", english: "nine" },
      { russian: "десять", english: "ten" },
    ],
    exercises: [
      {
        id: "numbers-six",
        type: "multipleChoice",
        prompt: "What number is this?",
        display: "шесть",
        options: ["six", "seven", "nine", "ten"],
        correctAnswer: "six",
        explanation: "шесть means six.",
        points: 10,
      },
      {
        id: "numbers-fill-ten",
        type: "fillBlank",
        prompt: "Fill the blank with ten.",
        beforeBlank: "The Russian word for 10 is",
        afterBlank: ".",
        options: ["десять", "семь", "шесть", "девять"],
        correctAnswer: "десять",
        explanation: "десять means ten.",
        points: 10,
      },
      {
        id: "numbers-match-6-10",
        type: "matching",
        prompt: "Match the numbers.",
        pairs: [
          { russian: "шесть", english: "six" },
          { russian: "семь", english: "seven" },
          { russian: "восемь", english: "eight" },
          { russian: "десять", english: "ten" },
        ],
        englishOptions: ["ten", "six", "eight", "seven"],
        explanation: "These finish your first count from one to ten.",
        points: 15,
      },
      {
        id: "numbers-order-6-10",
        type: "sentenceOrder",
        prompt: "Put the numbers in order.",
        translation: "six, seven, eight, nine, ten",
        words: ["десять", "семь", "шесть", "девять", "восемь"],
        correctOrder: ["шесть", "семь", "восемь", "девять", "десять"],
        explanation: "The order is шесть, семь, восемь, девять, десять.",
        points: 20,
      },
      {
        id: "numbers-scenario-8",
        type: "scenarioChoice",
        prompt: "Choose the number.",
        situation: "A train leaves from platform eight. Which word means eight?",
        options: ["восемь", "шесть", "десять", "семь"],
        correctAnswer: "восемь",
        explanation: "восемь means eight.",
        points: 20,
      },
    ],
  },
];

worldOne.description =
  "Practical greetings, introductions, survival phrases, question words, and numbers 1-10.";
worldOne.dailyChallengeDescription =
  "Review practical World 1 phrases to keep your streak alive.";
worldOne.lessons = improvedWorldOneLessons;

export const worldTwo: World = {
  id: "world-2",
  number: 2,
  title: "Everyday Basics",
  subtitle: "World 2: Everyday Basics",
  description:
    "Beginner words and phrases for people, family, food, drinks, places, and directions.",
  progressPercent: 0,
  profileProgressPercent: 0,
  dashboardProgressPercent: 0,
  xp: 720,
  bossTitle: "Everyday Checkpoint",
  bossDescription: "Show you can handle simple everyday Russian situations.",
  dailyChallengeTitle: "Everyday review",
  dailyChallengeDescription:
    "Review family, food, drinks, places, and directions.",
  stages: [
    {
      id: "people-family",
      number: "1",
      title: "People & Family",
      description: "Lessons 1-3: people, family members, and simple descriptions.",
      status: "Locked",
      xp: 225,
      locked: true,
    },
    {
      id: "food-drinks",
      number: "2",
      title: "Food & Drinks",
      description: "Lessons 4-6: order simple food and talk about drinks.",
      status: "Locked",
      xp: 240,
      locked: true,
    },
    {
      id: "places-directions",
      number: "3",
      title: "Places & Directions",
      description: "Lessons 7-9: common places and basic direction phrases.",
      status: "Locked",
      xp: 255,
      locked: true,
    },
    {
      id: "world-2-boss-level",
      number: "★",
      title: "Everyday Checkpoint",
      description: "Show you can handle simple everyday Russian situations.",
      status: "Locked",
      xp: 180,
      locked: true,
      boss: true,
    },
  ],
  lessons: [
    {
      id: "family-members",
      number: "1",
      title: "Family Members",
      description: "Name close family members in simple Russian.",
      stageId: "people-family",
      status: "Locked",
      xp: 75,
      xpReward: 75,
      locked: true,
      vocabulary: [
        { russian: "мама", english: "mom" },
        { russian: "папа", english: "dad" },
        { russian: "брат", english: "brother" },
        { russian: "сестра", english: "sister" },
        { russian: "семья", english: "family" },
      ],
      exercises: [
        {
          id: "family-mama-meaning",
          type: "multipleChoice",
          prompt: "Choose the English meaning.",
          display: "мама",
          options: ["mom", "brother", "friend", "child"],
          correctAnswer: "mom",
          explanation: "мама means mom.",
          points: 10,
        },
        {
          id: "family-fill-sestra",
          type: "fillBlank",
          prompt: "Complete the word for sister.",
          beforeBlank: "My sister is моя",
          afterBlank: ".",
          options: ["сестра", "папа", "брат", "семья"],
          correctAnswer: "сестра",
          explanation: "сестра means sister.",
          points: 15,
        },
        {
          id: "family-match",
          type: "matching",
          prompt: "Match the family words.",
          pairs: [
            { russian: "мама", english: "mom" },
            { russian: "папа", english: "dad" },
            { russian: "брат", english: "brother" },
            { russian: "семья", english: "family" },
          ],
          englishOptions: ["family", "dad", "mom", "brother"],
          explanation: "These are core A1 family words.",
          points: 20,
        },
        {
          id: "family-scenario",
          type: "scenarioChoice",
          prompt: "Pick the best word.",
          situation: "You want to say brother.",
          options: ["брат", "сестра", "мама", "папа"],
          correctAnswer: "брат",
          explanation: "брат means brother.",
          points: 15,
        },
      ],
    },
    {
      id: "people-around-you",
      number: "2",
      title: "People Around You",
      description: "Talk about friends, children, and people you meet.",
      stageId: "people-family",
      status: "Locked",
      xp: 75,
      xpReward: 75,
      locked: true,
      vocabulary: [
        { russian: "друг", english: "friend", note: "male friend" },
        { russian: "подруга", english: "friend", note: "female friend" },
        { russian: "человек", english: "person" },
        { russian: "ребёнок", english: "child" },
        { russian: "студент", english: "student" },
      ],
      exercises: [
        {
          id: "people-drug-meaning",
          type: "multipleChoice",
          prompt: "What does this word mean?",
          display: "друг",
          options: ["friend", "dad", "water", "school"],
          correctAnswer: "friend",
          explanation: "друг means a male friend or friend in general.",
          points: 10,
        },
        {
          id: "people-fill-person",
          type: "fillBlank",
          prompt: "Complete the phrase one person.",
          beforeBlank: "один",
          afterBlank: ".",
          options: ["человек", "подруга", "мама", "чай"],
          correctAnswer: "человек",
          explanation: "один человек means one person.",
          points: 15,
        },
        {
          id: "people-order-my-friend",
          type: "sentenceOrder",
          prompt: "Build the Russian phrase.",
          translation: "My friend.",
          words: ["друг", "мой"],
          correctOrder: ["мой", "друг"],
          explanation: "мой друг means my friend.",
          points: 20,
        },
        {
          id: "people-match",
          type: "matching",
          prompt: "Match the people words.",
          pairs: [
            { russian: "подруга", english: "female friend" },
            { russian: "человек", english: "person" },
            { russian: "ребёнок", english: "child" },
            { russian: "студент", english: "student" },
          ],
          englishOptions: ["student", "child", "female friend", "person"],
          explanation: "These words help you identify common people around you.",
          points: 20,
        },
      ],
    },
    {
      id: "simple-descriptions",
      number: "3",
      title: "Simple Descriptions",
      description: "Use basic words like big, small, good, and new.",
      stageId: "people-family",
      status: "Locked",
      xp: 75,
      xpReward: 75,
      locked: true,
      vocabulary: [
        { russian: "хороший", english: "good" },
        { russian: "новый", english: "new" },
        { russian: "большой", english: "big" },
        { russian: "маленький", english: "small" },
        { russian: "это", english: "this is / it is" },
      ],
      exercises: [
        {
          id: "descriptions-good",
          type: "multipleChoice",
          prompt: "Choose the meaning.",
          display: "хороший",
          options: ["good", "new", "small", "where"],
          correctAnswer: "good",
          explanation: "хороший means good.",
          points: 10,
        },
        {
          id: "descriptions-fill-new",
          type: "fillBlank",
          prompt: "Complete the phrase new student.",
          beforeBlank: "",
          afterBlank: "студент.",
          options: ["новый", "маленький", "большой", "это"],
          correctAnswer: "новый",
          explanation: "новый студент means new student.",
          points: 15,
        },
        {
          id: "descriptions-order-this-is-family",
          type: "sentenceOrder",
          prompt: "Build the Russian phrase.",
          translation: "This is family.",
          words: ["семья", "это"],
          correctOrder: ["это", "семья"],
          explanation: "это семья means this is family.",
          points: 20,
        },
        {
          id: "descriptions-scenario",
          type: "scenarioChoice",
          prompt: "Pick the best word.",
          situation: "You want to describe something as small.",
          options: ["маленький", "большой", "хороший", "новый"],
          correctAnswer: "маленький",
          explanation: "маленький means small.",
          points: 15,
        },
      ],
    },
    {
      id: "basic-foods",
      number: "4",
      title: "Basic Foods",
      description: "Recognize simple food words for everyday meals.",
      stageId: "food-drinks",
      status: "Locked",
      xp: 80,
      xpReward: 80,
      locked: true,
      vocabulary: [
        { russian: "хлеб", english: "bread" },
        { russian: "сыр", english: "cheese" },
        { russian: "суп", english: "soup" },
        { russian: "рис", english: "rice" },
        { russian: "яблоко", english: "apple" },
      ],
      exercises: [
        {
          id: "food-bread",
          type: "multipleChoice",
          prompt: "What does this word mean?",
          display: "хлеб",
          options: ["bread", "tea", "street", "friend"],
          correctAnswer: "bread",
          explanation: "хлеб means bread.",
          points: 10,
        },
        {
          id: "food-fill-soup",
          type: "fillBlank",
          prompt: "Complete the sentence.",
          beforeBlank: "I want",
          afterBlank: ".",
          options: ["суп", "улица", "мама", "метро"],
          correctAnswer: "суп",
          explanation: "суп means soup.",
          points: 15,
        },
        {
          id: "food-match",
          type: "matching",
          prompt: "Match the food words.",
          pairs: [
            { russian: "сыр", english: "cheese" },
            { russian: "рис", english: "rice" },
            { russian: "яблоко", english: "apple" },
            { russian: "хлеб", english: "bread" },
          ],
          englishOptions: ["apple", "bread", "cheese", "rice"],
          explanation: "These are common beginner food nouns.",
          points: 20,
        },
        {
          id: "food-scenario",
          type: "scenarioChoice",
          prompt: "Choose the food.",
          situation: "You want an apple.",
          options: ["яблоко", "сыр", "суп", "рис"],
          correctAnswer: "яблоко",
          explanation: "яблоко means apple.",
          points: 15,
        },
      ],
    },
    {
      id: "drinks",
      number: "5",
      title: "Drinks",
      description: "Ask for water, tea, coffee, and juice.",
      stageId: "food-drinks",
      status: "Locked",
      xp: 80,
      xpReward: 80,
      locked: true,
      vocabulary: [
        { russian: "вода", english: "water" },
        { russian: "чай", english: "tea" },
        { russian: "кофе", english: "coffee" },
        { russian: "сок", english: "juice" },
        { russian: "молоко", english: "milk" },
      ],
      exercises: [
        {
          id: "drinks-water",
          type: "multipleChoice",
          prompt: "Choose the meaning.",
          display: "вода",
          options: ["water", "milk", "bread", "home"],
          correctAnswer: "water",
          explanation: "вода means water.",
          points: 10,
        },
        {
          id: "drinks-fill-tea",
          type: "fillBlank",
          prompt: "Complete the phrase tea, please.",
          beforeBlank: "",
          afterBlank: ", пожалуйста.",
          options: ["чай", "сыр", "дом", "друг"],
          correctAnswer: "чай",
          explanation: "чай, пожалуйста means tea, please.",
          points: 15,
        },
        {
          id: "drinks-order-coffee-please",
          type: "sentenceOrder",
          prompt: "Build the Russian phrase.",
          translation: "Coffee, please.",
          words: ["пожалуйста", "кофе"],
          correctOrder: ["кофе", "пожалуйста"],
          explanation: "кофе, пожалуйста is a simple way to ask for coffee.",
          points: 20,
        },
        {
          id: "drinks-match",
          type: "matching",
          prompt: "Match the drink words.",
          pairs: [
            { russian: "чай", english: "tea" },
            { russian: "кофе", english: "coffee" },
            { russian: "сок", english: "juice" },
            { russian: "молоко", english: "milk" },
          ],
          englishOptions: ["milk", "juice", "coffee", "tea"],
          explanation: "These are useful drinks for cafes and homes.",
          points: 20,
        },
      ],
    },
    {
      id: "ordering-politely",
      number: "6",
      title: "Ordering Politely",
      description: "Use simple polite phrases for ordering food and drinks.",
      stageId: "food-drinks",
      status: "Locked",
      xp: 80,
      xpReward: 80,
      locked: true,
      vocabulary: [
        { russian: "Я хочу", english: "I want" },
        { russian: "Можно", english: "May I have / Is it possible" },
        { russian: "пожалуйста", english: "please" },
        { russian: "счёт", english: "bill / check" },
        { russian: "вкусно", english: "tasty" },
      ],
      exercises: [
        {
          id: "ordering-ya-hochu",
          type: "multipleChoice",
          prompt: "Choose the meaning.",
          display: "Я хочу",
          options: ["I want", "I know", "Where is", "This is"],
          correctAnswer: "I want",
          explanation: "Я хочу means I want.",
          points: 10,
        },
        {
          id: "ordering-fill-please",
          type: "fillBlank",
          prompt: "Complete the polite request.",
          beforeBlank: "Можно воду,",
          afterBlank: "?",
          options: ["пожалуйста", "вкусно", "счёт", "семья"],
          correctAnswer: "пожалуйста",
          explanation: "Можно воду, пожалуйста? means May I have water, please?",
          points: 15,
        },
        {
          id: "ordering-order-bill",
          type: "sentenceOrder",
          prompt: "Build the Russian phrase.",
          translation: "The bill, please.",
          words: ["пожалуйста", "счёт"],
          correctOrder: ["счёт", "пожалуйста"],
          explanation: "счёт, пожалуйста means the bill, please.",
          points: 20,
        },
        {
          id: "ordering-scenario",
          type: "scenarioChoice",
          prompt: "Pick the polite phrase.",
          situation: "You are in a cafe and want water.",
          options: ["Можно воду, пожалуйста?", "Где метро?", "Это семья.", "Я студент."],
          correctAnswer: "Можно воду, пожалуйста?",
          explanation: "Можно воду, пожалуйста? is a polite cafe request.",
          points: 20,
        },
      ],
    },
    {
      id: "common-places",
      number: "7",
      title: "Common Places",
      description: "Recognize useful city and home location words.",
      stageId: "places-directions",
      status: "Locked",
      xp: 85,
      xpReward: 85,
      locked: true,
      vocabulary: [
        { russian: "дом", english: "home / house" },
        { russian: "школа", english: "school" },
        { russian: "магазин", english: "store" },
        { russian: "кафе", english: "cafe" },
        { russian: "метро", english: "metro" },
      ],
      exercises: [
        {
          id: "places-home",
          type: "multipleChoice",
          prompt: "Choose the meaning.",
          display: "дом",
          options: ["home", "juice", "student", "left"],
          correctAnswer: "home",
          explanation: "дом means home or house.",
          points: 10,
        },
        {
          id: "places-fill-store",
          type: "fillBlank",
          prompt: "Complete the location.",
          beforeBlank: "Where is the",
          afterBlank: "?",
          options: ["магазин", "сок", "брат", "сыр"],
          correctAnswer: "магазин",
          explanation: "магазин means store.",
          points: 15,
        },
        {
          id: "places-match",
          type: "matching",
          prompt: "Match the place words.",
          pairs: [
            { russian: "школа", english: "school" },
            { russian: "магазин", english: "store" },
            { russian: "кафе", english: "cafe" },
            { russian: "метро", english: "metro" },
          ],
          englishOptions: ["metro", "cafe", "store", "school"],
          explanation: "These places appear often in basic directions.",
          points: 20,
        },
        {
          id: "places-scenario",
          type: "scenarioChoice",
          prompt: "Choose the place.",
          situation: "You want to ask for the metro.",
          options: ["метро", "дом", "школа", "кафе"],
          correctAnswer: "метро",
          explanation: "метро means metro.",
          points: 20,
        },
      ],
    },
    {
      id: "asking-where",
      number: "8",
      title: "Asking Where",
      description: "Ask where common places are.",
      stageId: "places-directions",
      status: "Locked",
      xp: 85,
      xpReward: 85,
      locked: true,
      vocabulary: [
        { russian: "Где?", english: "Where?" },
        { russian: "Где кафе?", english: "Where is the cafe?" },
        { russian: "Где магазин?", english: "Where is the store?" },
        { russian: "здесь", english: "here" },
        { russian: "там", english: "there" },
      ],
      exercises: [
        {
          id: "where-gde",
          type: "multipleChoice",
          prompt: "What does this word mean?",
          display: "Где?",
          options: ["Where?", "Who?", "What?", "How?"],
          correctAnswer: "Where?",
          explanation: "Где? means Where?",
          points: 10,
        },
        {
          id: "where-fill-cafe",
          type: "fillBlank",
          prompt: "Complete the question.",
          beforeBlank: "Где",
          afterBlank: "?",
          options: ["кафе", "вода", "хлеб", "мама"],
          correctAnswer: "кафе",
          explanation: "Где кафе? means Where is the cafe?",
          points: 15,
        },
        {
          id: "where-order-store",
          type: "sentenceOrder",
          prompt: "Build the Russian question.",
          translation: "Where is the store?",
          words: ["магазин?", "Где"],
          correctOrder: ["Где", "магазин?"],
          explanation: "Где магазин? asks where the store is.",
          points: 20,
        },
        {
          id: "where-match",
          type: "matching",
          prompt: "Match the location words.",
          pairs: [
            { russian: "Где?", english: "Where?" },
            { russian: "здесь", english: "here" },
            { russian: "там", english: "there" },
            { russian: "Где кафе?", english: "Where is the cafe?" },
          ],
          englishOptions: ["there", "Where is the cafe?", "here", "Where?"],
          explanation: "These are short, useful location phrases.",
          points: 20,
        },
      ],
    },
    {
      id: "directions-left-right",
      number: "9",
      title: "Left, Right, Straight",
      description: "Understand basic direction words.",
      stageId: "places-directions",
      status: "Locked",
      xp: 85,
      xpReward: 85,
      locked: true,
      vocabulary: [
        { russian: "налево", english: "to the left" },
        { russian: "направо", english: "to the right" },
        { russian: "прямо", english: "straight ahead" },
        { russian: "близко", english: "near / close" },
        { russian: "далеко", english: "far" },
      ],
      exercises: [
        {
          id: "directions-left",
          type: "multipleChoice",
          prompt: "Choose the meaning.",
          display: "налево",
          options: ["to the left", "to the right", "straight ahead", "far"],
          correctAnswer: "to the left",
          explanation: "налево means to the left.",
          points: 10,
        },
        {
          id: "directions-fill-straight",
          type: "fillBlank",
          prompt: "Complete the direction straight ahead.",
          beforeBlank: "Go",
          afterBlank: ".",
          options: ["прямо", "налево", "далеко", "вода"],
          correctAnswer: "прямо",
          explanation: "прямо means straight ahead.",
          points: 15,
        },
        {
          id: "directions-match",
          type: "matching",
          prompt: "Match the direction words.",
          pairs: [
            { russian: "налево", english: "to the left" },
            { russian: "направо", english: "to the right" },
            { russian: "близко", english: "near" },
            { russian: "далеко", english: "far" },
          ],
          englishOptions: ["far", "to the right", "near", "to the left"],
          explanation: "These words are enough for very simple directions.",
          points: 20,
        },
        {
          id: "directions-scenario",
          type: "scenarioChoice",
          prompt: "Choose the direction.",
          situation: "Someone points right and says which word?",
          options: ["направо", "налево", "прямо", "далеко"],
          correctAnswer: "направо",
          explanation: "направо means to the right.",
          points: 20,
        },
      ],
    },
  ],
};

export const worlds = [worldOne, worldTwo];

export const worldTwoChallengeQuestions: ChallengeQuestion[] = [
  {
    id: "everyday-family-choice",
    type: "choice",
    prompt: "Choose the English meaning of семья.",
    display: "семья",
    options: ["family", "store", "coffee", "left"],
    correctAnswer: "family",
    explanation: "семья means family.",
    points: 120,
  },
  {
    id: "everyday-type-water",
    type: "text",
    prompt: "Type the English meaning of вода.",
    display: "вода",
    correctAnswer: "Water",
    acceptedAnswers: ["water"],
    explanation: "вода means water.",
    points: 120,
  },
  {
    id: "everyday-cafe-request",
    type: "choice",
    prompt: "Choose the polite cafe request.",
    display: "Cafe order",
    options: ["Можно воду, пожалуйста?", "Где школа?", "Это брат.", "Налево."],
    correctAnswer: "Можно воду, пожалуйста?",
    explanation: "Можно воду, пожалуйста? means May I have water, please?",
    points: 160,
  },
  {
    id: "everyday-place-choice",
    type: "choice",
    prompt: "Which word means store?",
    display: "store",
    options: ["магазин", "молоко", "семья", "прямо"],
    correctAnswer: "магазин",
    explanation: "магазин means store.",
    points: 140,
  },
  {
    id: "everyday-type-right",
    type: "text",
    prompt: "Type the English meaning of направо.",
    display: "направо",
    correctAnswer: "To the right",
    acceptedAnswers: ["to the right", "right"],
    explanation: "направо means to the right.",
    points: 140,
  },
  {
    id: "everyday-where-cafe",
    type: "choice",
    prompt: "Choose the question Where is the cafe?",
    display: "Where is the cafe?",
    options: ["Где кафе?", "Где мама?", "Счёт, пожалуйста.", "Это школа."],
    correctAnswer: "Где кафе?",
    explanation: "Где кафе? means Where is the cafe?",
    points: 160,
  },
];

export const worldTwoChallengeSettings = {
  startingHearts: 3,
  passScore: 600,
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
  currentStreak: 7,
  longestStreak: 14,
  hearts: 5,
  level: 1,
  completedLessons: [
    "saying-hello",
    "greetings-review",
    "alphabet-basics",
    "polite-hello",
    "goodbye-phrases",
    "yes-no",
    "thank-you",
    "basic-listening",
    "name-intro",
    "pronoun-practice",
    "formal-greeting",
    "casual-greeting",
    "survival-words",
    "mini-dialogue-1",
    "numbers-intro",
    "where-who",
    "checkpoint-review",
    "daily-practice-1",
  ],
  completedStages: ["hello"],
  completedChallenges: [
    "daily-greetings",
    "daily-phrases",
    "streak-check-1",
    "streak-check-2",
    "listening-sprint",
    "first-contact-practice",
  ],
  unlockedStages: ["hello", "who-are-you"],
  achievementsEarned: ["first-contact", "streak-keeper"],
  currentWorldProgressPercent: 48,
  clearedSteps: 12,
  totalSteps: 25,
  profileWorldXp: 480,
  nextGoalTitle: "Complete Introduce Yourself",
  nextGoalDescription:
    "Earn 100 XP and move closer to the World 1 boss challenge.",
};

export const profileStats: ProfileStat[] = [
  { title: "Total XP", value: userProgress.totalXp.toLocaleString(), accent: "cyan" },
  { title: "Current Streak", value: `${userProgress.currentStreak} days`, accent: "red" },
  { title: "Longest Streak", value: `${userProgress.longestStreak} days`, accent: "yellow" },
  { title: "Completed Lessons", value: userProgress.completedLessons.length.toString(), accent: "green" },
  { title: "Completed Challenges", value: userProgress.completedChallenges.length.toString(), accent: "cyan" },
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
