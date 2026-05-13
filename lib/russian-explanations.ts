import {
  type ExplanationLanguage,
  getExplanationDirection,
  isArabicExplanation,
} from "@/lib/language-preference";

type UiKey =
  | "explanationLanguage"
  | "learnRussianWith"
  | "correct"
  | "tryAgain"
  | "continue"
  | "completeLesson"
  | "chooseCorrectAnswer"
  | "matchPairs"
  | "putSentenceInOrder"
  | "fillBlank"
  | "lessonComplete"
  | "xpEarned"
  | "hearts"
  | "heartsLeft"
  | "finishLesson"
  | "nextExercise"
  | "replayLesson"
  | "englishTarget"
  | "targetMeaning"
  | "chooseWordsBelow"
  | "checkSentence"
  | "checkMatches"
  | "matchedTo"
  | "notMatched"
  | "runStatus"
  | "lessonVocabulary"
  | "mistakes"
  | "currentType"
  | "accuracy";

const uiText: Record<UiKey, Record<ExplanationLanguage, string>> = {
  explanationLanguage: { en: "Explanation language", ar: "لغة الشرح" },
  learnRussianWith: { en: "Learn Russian with", ar: "تعلّم الروسية مع" },
  correct: { en: "Correct.", ar: "صحيح." },
  tryAgain: { en: "Not quite.", ar: "حاول مرة أخرى." },
  continue: { en: "Continue", ar: "متابعة" },
  completeLesson: { en: "Complete lesson", ar: "إنهاء الدرس" },
  chooseCorrectAnswer: { en: "Choose the correct answer", ar: "اختر الإجابة الصحيحة" },
  matchPairs: { en: "Match the pairs", ar: "طابق الأزواج" },
  putSentenceInOrder: { en: "Put the sentence in order", ar: "رتّب الجملة" },
  fillBlank: { en: "Fill in the blank", ar: "املأ الفراغ" },
  lessonComplete: { en: "Lesson Complete", ar: "اكتمل الدرس" },
  xpEarned: { en: "XP earned", ar: "نقاط XP المكتسبة" },
  hearts: { en: "Hearts", ar: "القلوب" },
  heartsLeft: { en: "Hearts left", ar: "القلوب المتبقية" },
  finishLesson: { en: "Finish Lesson", ar: "إنهاء الدرس" },
  nextExercise: { en: "Next Exercise", ar: "التمرين التالي" },
  replayLesson: { en: "Replay Lesson", ar: "إعادة الدرس" },
  englishTarget: { en: "English target", ar: "المعنى المطلوب" },
  targetMeaning: { en: "Target meaning", ar: "المعنى المطلوب" },
  chooseWordsBelow: { en: "Choose words below", ar: "اختر الكلمات أدناه" },
  checkSentence: { en: "Check Sentence", ar: "تحقق من الجملة" },
  checkMatches: { en: "Check Matches", ar: "تحقق من المطابقة" },
  matchedTo: { en: "Matched to", ar: "مطابق مع" },
  notMatched: { en: "...", ar: "..." },
  runStatus: { en: "Run status", ar: "حالة التمرين" },
  lessonVocabulary: { en: "Lesson vocabulary", ar: "مفردات الدرس" },
  mistakes: { en: "Mistakes", ar: "الأخطاء" },
  currentType: { en: "Current type", ar: "نوع التمرين" },
  accuracy: { en: "Accuracy", ar: "الدقة" },
};

const meaningArabic: Record<string, string> = {
  "A friend": "صديق",
  "A stranger or group": "شخص غريب أو مجموعة",
  "Alright": "حسنا",
  "And you?": "وأنت؟",
  "And you? (informal)": "وأنت؟ (غير رسمي)",
  "And you? (polite)": "وحضرتك؟ (رسمي)",
  "Bye": "إلى اللقاء",
  "Can you say it in English?": "هل يمكنك قول ذلك بالإنجليزية؟",
  "Coffee, please.": "قهوة من فضلك.",
  "Evening greeting": "تحية المساء",
  "Excuse me": "عذرا",
  "Excuse me / Sorry": "عذرا / آسف",
  "Excuse me, please.": "عذرا، من فضلك.",
  "Good afternoon": "مساء الخير",
  "Good evening": "مساء الخير",
  "Good morning": "صباح الخير",
  "Goodbye": "وداعا",
  "Goodbye.": "وداعا.",
  "Hello": "مرحبا",
  "Hi": "مرحبا",
  "Hi / Bye": "مرحبا / إلى اللقاء",
  "Hi / Hello": "مرحبا",
  "How?": "كيف؟",
  "I": "أنا",
  "I am from America": "أنا من أمريكا",
  "I do not know": "لا أعرف",
  "I do not know.": "لا أعرف.",
  "I do not understand": "لا أفهم",
  "I do not understand.": "لا أفهم.",
  "I want": "أريد",
  "It's OK": "لا بأس",
  "May I have / Is it possible": "هل يمكنني الحصول على / هل من الممكن",
  "My friend.": "صديقي.",
  "My name is Alex": "اسمي أليكس",
  "My name is Alex.": "اسمي أليكس.",
  "Nice to meet you": "تشرفت بمعرفتك",
  "No": "لا",
  "OK": "حسنا",
  "OK / Good": "حسنا / جيد",
  "One familiar person": "شخص مألوف واحد",
  "Please": "من فضلك",
  "Please / You're welcome": "من فضلك / عفوا",
  "Repeat, please": "كرر من فضلك",
  "Sorry / Excuse me": "آسف / عذرا",
  "Thank you": "شكرا",
  "The bill, please.": "الفاتورة من فضلك.",
  "This is family.": "هذه عائلة.",
  "What does this mean?": "ماذا يعني هذا؟",
  "What is your name?": "ما اسمك؟",
  "What is your name? (informal)": "ما اسمك؟ (غير رسمي)",
  "What is your name? (polite)": "ما اسم حضرتك؟",
  "What?": "ماذا؟",
  "Where is the cafe?": "أين المقهى؟",
  "Where is the store?": "أين المتجر؟",
  "Where is the metro?": "أين المترو؟",
  "Where?": "أين؟",
  "Who?": "من؟",
  "Yes": "نعم",
  apple: "تفاحة",
  big: "كبير",
  "bill / check": "الفاتورة",
  bread: "خبز",
  brother: "أخ",
  cafe: "مقهى",
  cheese: "جبن",
  child: "طفل",
  coffee: "قهوة",
  dad: "أب",
  eight: "ثمانية",
  family: "عائلة",
  far: "بعيد",
  "female friend": "صديقة",
  five: "خمسة",
  four: "أربعة",
  friend: "صديق",
  good: "جيد",
  here: "هنا",
  "home / house": "بيت / منزل",
  juice: "عصير",
  milk: "حليب",
  mom: "أم",
  near: "قريب",
  "near / close": "قريب",
  new: "جديد",
  nine: "تسعة",
  one: "واحد",
  "one, two, three, four, five": "واحد، اثنان، ثلاثة، أربعة، خمسة",
  person: "شخص",
  please: "من فضلك",
  rice: "أرز",
  school: "مدرسة",
  seven: "سبعة",
  "six, seven, eight, nine, ten": "ستة، سبعة، ثمانية، تسعة، عشرة",
  sister: "أخت",
  six: "ستة",
  small: "صغير",
  soup: "حساء",
  store: "متجر",
  "straight ahead": "إلى الأمام",
  student: "طالب",
  tasty: "لذيذ",
  tea: "شاي",
  ten: "عشرة",
  there: "هناك",
  "this is / it is": "هذا / إنها",
  three: "ثلاثة",
  "to the left": "إلى اليسار",
  "to the right": "إلى اليمين",
  two: "اثنان",
  water: "ماء",
  you: "أنت",
};

const noteArabic: Record<string, string> = {
  "female friend": "صديقة",
  "Informal": "غير رسمي",
  "Informal object form": "صيغة المفعول غير الرسمية",
  "Informal to one person": "غير رسمي لشخص واحد",
  "male friend": "صديق",
  "Polite": "رسمي",
  "Polite object form": "صيغة المفعول الرسمية",
  "Polite or plural": "رسمي أو للجمع",
};

const learningTextArabic: Record<string, string> = {
  "Build the Russian phrase.": "ابن العبارة الروسية.",
  "Build the Russian question.": "ابن السؤال الروسي.",
  "Build the Russian sentence.": "ابن الجملة الروسية.",
  "Choose the answer.": "اختر الإجابة.",
  "Choose the best English meaning.": "اختر المعنى الصحيح.",
  "Choose the best phrase for the situation.": "اختر أفضل عبارة للموقف.",
  "Choose the direction.": "اختر الاتجاه.",
  "Choose the food.": "اختر الطعام.",
  "Choose the meaning.": "اختر المعنى.",
  "Choose the place.": "اختر المكان.",
  "Choose the useful phrase.": "اختر العبارة المفيدة.",
  "Complete the daytime greeting.": "أكمل تحية النهار.",
  "Complete the location.": "أكمل المكان.",
  "Complete the morning greeting.": "أكمل تحية الصباح.",
  "Complete the polite question.": "أكمل السؤال الرسمي.",
  "Complete the polite request.": "أكمل الطلب المهذب.",
  "Complete the question.": "أكمل السؤال.",
  "Complete the sentence.": "أكمل الجملة.",
  "Fill the blank with Please.": "املأ الفراغ بكلمة من فضلك.",
  "Match each help phrase.": "طابق كل عبارة مساعدة.",
  "Match each introduction phrase.": "طابق كل عبارة تعريف.",
  "Match each phrase with its meaning.": "طابق كل عبارة مع معناها.",
  "Match each phrase with its natural use.": "طابق كل عبارة مع استخدامها الطبيعي.",
  "Match the direction words.": "طابق كلمات الاتجاه.",
  "Match the food words.": "طابق كلمات الطعام.",
  "Match the location words.": "طابق كلمات المكان.",
  "Match the name questions.": "طابق أسئلة الاسم.",
  "Match the numbers.": "طابق الأرقام.",
  "Match the place words.": "طابق كلمات الأماكن.",
  "Match the polite words.": "طابق الكلمات المهذبة.",
  "Match the short answers.": "طابق الإجابات القصيرة.",
  "Pick the best phrase for the situation.": "اختر أفضل عبارة للموقف.",
  "Pick the best word.": "اختر أفضل كلمة.",
  "Pick the natural greeting.": "اختر التحية الطبيعية.",
  "Pick the polite phrase.": "اختر العبارة المهذبة.",
  "Pick the polite question.": "اختر السؤال الرسمي.",
  "What does this question word mean?": "ماذا تعني أداة السؤال هذه؟",
  "What does this word mean?": "ماذا تعني هذه الكلمة؟",
  "What number is this?": "ما هذا الرقم؟",
};

export function tUi(key: UiKey, language: ExplanationLanguage) {
  return uiText[key][language];
}

export function localizeMeaning(value: string, language: ExplanationLanguage) {
  if (!isArabicExplanation(language)) {
    return value;
  }

  return meaningArabic[value] ?? value;
}

export function localizeNote(value: string | undefined, language: ExplanationLanguage) {
  if (!value || !isArabicExplanation(language)) {
    return value;
  }

  return noteArabic[value] ?? value;
}

export function localizeLearningText(value: string, language: ExplanationLanguage) {
  if (!isArabicExplanation(language)) {
    return value;
  }

  return learningTextArabic[value] ?? meaningArabic[value] ?? value;
}

export function localizeExplanation(value: string, language: ExplanationLanguage) {
  if (!isArabicExplanation(language)) {
    return value;
  }

  const direct = learningTextArabic[value] ?? meaningArabic[value];
  if (direct) {
    return direct;
  }

  for (const [english, arabic] of Object.entries(meaningArabic)) {
    const pattern = ` means ${english.replace(/\.$/, "")}`;
    if (value.includes(pattern)) {
      return value.replace(pattern, ` تعني ${arabic.replace(/\.$/, "")}`);
    }
  }

  return value;
}

export function explanationTextProps(language: ExplanationLanguage) {
  return {
    dir: getExplanationDirection(language),
    lang: isArabicExplanation(language) ? "ar" : "en",
  };
}
