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
  red: "أحمر",
  blue: "أزرق",
  green: "أخضر",
  yellow: "أصفر",
  black: "أسود",
  white: "أبيض",
  orange: "برتقالي",
  purple: "بنفسجي",
  pink: "وردي",
  brown: "بني",
  gray: "رمادي",
  "light blue": "أزرق فاتح",
  "A friend": "صديق",
  "A stranger or group": "شخص غريب أو مجموعة",
  "Alright": "حسنا",
  "And you?": "وأنت؟",
  "And you? (informal)": "وأنت؟ (غير رسمي)",
  "And you? (polite)": "وحضرتك؟ (رسمي)",
  "Bye": "إلى اللقاء",
  "Can you say it in English?": "هل يمكنك قول ذلك بالإنجليزية؟",
  "Coffee, please.": "قهوة من فضلك.",
  "Go straight.": "اذهب مباشرة.",
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
  "Help me, please": "ساعدني من فضلك",
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
  "I am looking for": "أبحث عن",
  "I am looking for a cafe.": "أبحث عن مقهى.",
  "I am looking for a pharmacy.": "أبحث عن صيدلية.",
  "I have": "لدي",
  "I have an apple.": "لدي تفاحة.",
  "I have bread.": "لدي خبز.",
  "I want": "أريد",
  "I want bread.": "أريد خبزاً.",
  "I want tea.": "أريد شايًا.",
  "It's OK": "لا بأس",
  "May I have / Is it possible": "هل يمكنني الحصول على / هل من الممكن",
  "May I have water?": "هل يمكنني الحصول على ماء؟",
  "May I have water, please?": "هل يمكنني الحصول على ماء من فضلك؟",
  "My friend.": "صديقي.",
  "my brother": "أخي",
  "my family": "عائلتي",
  "my female friend": "صديقتي",
  "my friend": "صديقي",
  "my sister": "أختي",
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
  "Thank you, I want tea.": "شكراً، أريد شايًا.",
  "The bill, please.": "الفاتورة من فضلك.",
  "This is family.": "هذه عائلة.",
  "This is my brother.": "هذا أخي.",
  "This is my dad.": "هذا أبي.",
  "This is my family.": "هذه عائلتي.",
  "This is my mom.": "هذه أمي.",
  "This is my sister.": "هذه أختي.",
  "What does this mean?": "ماذا يعني هذا؟",
  "What is this?": "ما هذا؟",
  "What is your name?": "ما اسمك؟",
  "What is your name? (informal)": "ما اسمك؟ (غير رسمي)",
  "What is your name? (polite)": "ما اسم حضرتك؟",
  "What?": "ماذا؟",
  "Where is the cafe?": "أين المقهى؟",
  "Where is the store?": "أين المتجر؟",
  "Where is the metro?": "أين المترو؟",
  "Where is the pharmacy?": "أين الصيدلية؟",
  "Where?": "أين؟",
  "Who?": "من؟",
  "Who is this?": "من هذا؟",
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
  "male friend or friend in general": "صديق ذكر أو صديق بشكل عام",
  "моя is used with мама": "تُستخدم моя مع мама",
  "мой is used with папа": "يُستخدم мой مع папа",
  "мой is used with друг": "يُستخدم мой مع друг",
  "моя is used with подруга": "تُستخدم моя مع подруга",
  "use with masculine words": "تُستخدم مع الكلمات المذكرة",
  "use with feminine words": "تُستخدم مع الكلمات المؤنثة",
  "Я хочу means I want": "Я хочу تعني أريد",
  "У меня есть means I have": "У меня есть تعني لدي",
  "Я ищу means I am looking for": "Я ищу تعني أبحث عن",
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
  pharmacy: "صيدلية",
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
  "this is": "هذا / هذه",
  three: "ثلاثة",
  "to the left": "إلى اليسار",
  "to the right": "إلى اليمين",
  university: "جامعة",
  two: "اثنان",
  water: "ماء",
  you: "أنت",
  head: "الرأس",
  hair: "الشعر",
  eye: "العين",
  nose: "الأنف",
  mouth: "الفم",
  ear: "الأذن",
  neck: "الرقبة",
  shoulder: "الكتف",
  "arm/hand": "اليد / الذراع",
  "stomach/belly": "البطن",
  back: "الظهر",
  "leg/foot": "الرجل / القدم",
  "рука can mean both arm and hand depending on context.": "كلمة рука قد تعني اليد أو الذراع حسب السياق.",
  "рука can mean arm or hand depending on context.": "كلمة рука قد تعني اليد أو الذراع حسب السياق.",
  "нога can mean both leg and foot depending on context.": "كلمة нога قد تعني الرجل أو القدم حسب السياق.",
  "нога can mean leg or foot depending on context.": "كلمة нога قد تعني الرجل أو القدم حسب السياق.",
  "These are core Russian body part words.": "هذه كلمات أساسية لأجزاء الجسم بالروسية.",
};

const noteArabic: Record<string, string> = {
  "female friend": "صديقة",
  "Informal": "غير رسمي",
  "Formal or plural object form of вы": "صيغة المفعول الرسمية أو صيغة الجمع من вы",
  "Formal or plural: use with adults, strangers, or groups":
    "رسمي أو للجمع: يُستخدم مع البالغين أو الغرباء أو المجموعات",
  "Informal object form": "صيغة المفعول غير الرسمية",
  "Informal object form of ты": "صيغة المفعول غير الرسمية من ты",
  "Informal: use with friends or children": "غير رسمي: يُستخدم مع الأصدقاء أو الأطفال",
  "Informal to one person": "غير رسمي لشخص واحد",
  "male friend": "صديق",
  "Polite": "رسمي",
  "Polite object form": "صيغة المفعول الرسمية",
  "Polite or plural": "رسمي أو للجمع",
  "рука can mean both arm and hand depending on context.": "كلمة рука قد تعني اليد أو الذراع حسب السياق.",
  "рука can mean arm or hand depending on context.": "كلمة рука قد تعني اليد أو الذراع حسب السياق.",
  "нога can mean both leg and foot depending on context.": "كلمة нога قد تعني الرجل أو القدم حسب السياق.",
  "нога can mean leg or foot depending on context.": "كلمة нога قد تعني الرجل أو القدم حسب السياق.",
};

const learningTextArabic: Record<string, string> = {
  "Phase 1": "المرحلة 1",
  "Phase 2": "المرحلة 2",
  "Phase 3": "المرحلة 3",
  "Build the Russian phrase.": "ابن العبارة الروسية.",
  "Build the Russian question.": "ابن السؤال الروسي.",
  "Build the Russian sentence.": "ابن الجملة الروسية.",
  "Break the armor by building the Russian sentence.": "اكسر الدرع ببناء الجملة الروسية.",
  "Choose the answer.": "اختر الإجابة.",
  "Choose the line that keeps the conversation alive.": "اختر العبارة التي تبقي المحادثة مستمرة.",
  "Choose the best English meaning.": "اختر المعنى الصحيح.",
  "Choose the best phrase for the situation.": "اختر أفضل عبارة للموقف.",
  "Choose the direction.": "اختر الاتجاه.",
  "Choose the food.": "اختر الطعام.",
  "Choose the meaning.": "اختر المعنى.",
  "Choose the place.": "اختر المكان.",
  "Choose the useful phrase.": "اختر العبارة المفيدة.",
  "Complete the direction Go straight.": "أكمل اتجاه: اذهب مباشرة.",
  "Complete the daytime greeting.": "أكمل تحية النهار.",
  "Complete the English meaning.": "أكمل المعنى بالإنجليزية.",
  "Complete the phrase Help me, please.": "أكمل عبارة ساعدني من فضلك.",
  "Complete the phrase This is my sister.": "أكمل عبارة: هذه أختي.",
  "Complete the phrase my brother.": "أكمل عبارة: أخي.",
  "Complete the phrase one person.": "أكمل عبارة: شخص واحد.",
  "Complete the location.": "أكمل المكان.",
  "Complete the morning greeting.": "أكمل تحية الصباح.",
  "Complete the polite question.": "أكمل السؤال الرسمي.",
  "Complete the polite request.": "أكمل الطلب المهذب.",
  "Complete the question.": "أكمل السؤال.",
  "Complete the Russian question.": "أكمل السؤال الروسي.",
  "Complete the Russian sentence.": "أكمل الجملة الروسية.",
  "Complete the sentence.": "أكمل الجملة.",
  "Complete the word for sister.": "أكمل كلمة أخت.",
  "Fill the blank with Please.": "املأ الفراغ بكلمة من فضلك.",
  "Match each help phrase.": "طابق كل عبارة مساعدة.",
  "Match each introduction phrase.": "طابق كل عبارة تعريف.",
  "Match each cafe phrase.": "طابق كل عبارة في المقهى.",
  "Match each phrase with its meaning.": "طابق كل عبارة مع معناها.",
  "Match each phrase with its natural use.": "طابق كل عبارة مع استخدامها الطبيعي.",
  "Match each short phrase.": "طابق كل عبارة قصيرة.",
  "Match the direction words.": "طابق كلمات الاتجاه.",
  "Match the food words.": "طابق كلمات الطعام.",
  "Match the location words.": "طابق كلمات المكان.",
  "Match the name questions.": "طابق أسئلة الاسم.",
  "Match the numbers.": "طابق الأرقام.",
  "Match the place words.": "طابق كلمات الأماكن.",
  "Match the polite words.": "طابق الكلمات المهذبة.",
  "Match the short answers.": "طابق الإجابات القصيرة.",
  "Pick the best phrase for the situation.": "اختر أفضل عبارة للموقف.",
  "Pick the best question word.": "اختر أداة السؤال الأنسب.",
  "Pick the best phrase.": "اختر أفضل عبارة.",
  "Pick the best word.": "اختر أفضل كلمة.",
  "Pick the natural greeting.": "اختر التحية الطبيعية.",
  "Pick the polite phrase.": "اختر العبارة المهذبة.",
  "Pick the polite question.": "اختر السؤال الرسمي.",
  "What does this question word mean?": "ماذا تعني أداة السؤال هذه؟",
  "What does this word mean?": "ماذا تعني هذه الكلمة؟",
  "What number is this?": "ما هذا الرقم؟",
  "Moscow station encounter": "موقف في محطة موسكو",
  "A stranger asks if you understand the announcement. You do not. What do you say?":
    "يسألك شخص غريب هل تفهم الإعلان. أنت لا تفهم. ماذا تقول؟",
  "A barista gives you coffee. What do you say?": "يعطيك عامل المقهى قهوة. ماذا تقول؟",
  "A new classmate says hello. You want to tell them your name.":
    "يقول لك زميل جديد مرحبا. تريد أن تخبره باسمك.",
  "A train leaves from platform eight. Which word means eight?":
    "يغادر قطار من الرصيف رقم ثمانية. أي كلمة تعني ثمانية؟",
  "Someone offers you a drink and you want tea.": "يعرض عليك شخص مشروباً وأنت تريد شايًا.",
  "Someone points right and says which word?": "يشير شخص إلى اليمين. أي كلمة يقول؟",
  "The arena goes quiet. Pick the survival phrase.": "تهدأ الساحة. اختر عبارة النجاة.",
  "The final shield comes up. One clean answer can end the fight.":
    "ظهر الدرع الأخير. إجابة صحيحة واحدة يمكن أن تنهي القتال.",
  "The sentinel scrambles the words. Put them back in order.":
    "بعثر الحارس الكلمات. أعد ترتيبها.",
  "The sentinel tests your First Contact basics.": "يختبر الحارس أساسيات التواصل الأول لديك.",
  "The Gatekeeper says: Привет. What does it mean?": "يقول حارس البوابة: Привет. ماذا تعني؟",
  "Type the English meaning of Спасибо.": "اكتب معنى Спасибо بالإنجليزية.",
  "What is the correct answer to Как тебя зовут?":
    "ما الإجابة الصحيحة على Как тебя зовут؟",
  "Type the English word for Да.": "اكتب الكلمة الإنجليزية المقابلة لـ Да.",
  "Someone asks if you are ready. You want to say yes.":
    "يسألك شخص هل أنت جاهز. تريد أن تقول نعم.",
  "Someone speaks too fast and you miss everything.":
    "يتحدث شخص بسرعة كبيرة ولا تفهم شيئا.",
  "The opposite of Да is": "عكس Да هو",
  "The Russian word for 10 is": "الكلمة الروسية للعدد 10 هي",
  "Use ты or тебя with friends. Use вы or вас with adults, strangers, or groups.":
    "استخدم ты أو тебя مع الأصدقاء. واستخدم вы أو вас مع البالغين أو الغرباء أو المجموعات.",
  "You enter a small shop and greet the worker politely.":
    "تدخل متجرا صغيرا وتحيّي العامل بأدب.",
  "You meet an adult neighbor and want to ask their name.":
    "تقابل جارا بالغا وتريد أن تسأل عن اسمه.",
  "You need five tickets. Which word means five?":
    "تحتاج إلى خمس تذاكر. أي كلمة تعني خمسة؟",
  "You point to an object and want to ask what it is.":
    "تشير إلى شيء وتريد أن تسأل ما هو.",
  "You see your friend after class.": "ترى صديقك بعد الدرس.",
  "You want to ask where the cafe is.": "تريد أن تسأل أين المقهى.",
  "You point to your mom. What phrase fits?": "تشير إلى أمك. أي عبارة تناسب الموقف؟",
  "You introduce your brother.": "تعرّف بأخيك.",
  "You want to say my female friend.": "تريد أن تقول: صديقتي.",
  "You want an apple.": "تريد تفاحة.",
  "You are in a cafe and want water.": "أنت في مقهى وتريد ماء.",
  "You need medicine. Which place word fits?": "تحتاج إلى دواء. أي كلمة مكان تناسب الموقف؟",
  "You want to say the cafe is here.": "تريد أن تقول إن المقهى هنا.",
  "You want to ask for the metro.": "تريد أن تسأل عن المترو.",
  "You are lost and need someone to help you.": "أنت تائه وتحتاج إلى مساعدة من شخص.",
  "Good day.": "نهارك سعيد.",
  "Привет means Hi or Hello. Use it with people you know.":
    "Привет تعني مرحبا. تُستخدم مع الأشخاص الذين تعرفهم.",
  "Доброе утро means Good morning.": "Доброе утро تعني صباح الخير.",
  "These cover casual and polite ways to start or end a conversation.":
    "هذه عبارات غير رسمية ورسمية لبدء المحادثة أو إنهائها.",
  "Здравствуйте is the safe polite greeting for strangers.":
    "Здравствуйте تحية مهذبة وآمنة مع الغرباء.",
  "До свидания is the standard polite goodbye.": "До свидания هي عبارة الوداع المهذبة المعتادة.",
  "Здравствуйте is polite and works with adults, strangers, or groups.":
    "Здравствуйте رسمية وتناسب البالغين والغرباء والمجموعات.",
  "Добрый день means Good afternoon or Good day.": "Добрый день تعني تحية النهار.",
  "Russian greetings change depending on formality and audience.":
    "تتغير التحيات الروسية حسب درجة الرسمية ومن تخاطب.",
  "Привет is natural with a friend.": "Привет طبيعية مع صديق.",
  "Добрый вечер is the normal evening greeting.": "Добрый вечер هي تحية المساء المعتادة.",
  "Да means Yes.": "Да تعني نعم.",
  "Нет means No.": "Нет تعني لا.",
  "These short answers are useful in everyday first conversations.":
    "هذه الإجابات القصيرة مفيدة في أول محادثات يومية.",
  "Да is the direct Russian answer for Yes.": "Да هي الإجابة الروسية المباشرة بمعنى نعم.",
  "Не знаю is a short, common way to say I do not know.":
    "Не знаю عبارة قصيرة وشائعة بمعنى لا أعرف.",
  "Меня зовут Alex is the standard way to say My name is Alex.":
    "Меня зовут Alex هي الطريقة المعتادة لقول اسمي أليكس.",
  "Я из Америки means I am from America.": "Я из Америки تعني أنا من أمريكا.",
  "Меня зовут Alex is the natural introduction pattern.":
    "Меня зовут Alex هي صيغة طبيعية للتعريف بالاسم.",
  "These phrases make a short first introduction.":
    "هذه العبارات تكوّن تعارفا قصيرا.",
  "Меня зовут Alex gives your name clearly.": "Меня зовут Alex تعرّف باسمك بوضوح.",
  "Как тебя зовут? asks What is your name? informally.":
    "Как тебя зовут؟ تسأل: ما اسمك؟ بصيغة غير رسمية.",
  "Как вас зовут? is the polite version of What is your name?":
    "Как вас зовут؟ هي الصيغة الرسمية لسؤال ما اسمك؟",
  "Как тебя зовут? is the common informal name question.":
    "Как тебя зовут؟ سؤال شائع غير رسمي عن الاسم.",
  "Как вас зовут? is the polite choice for an adult or stranger.":
    "Как вас зовут؟ هي الاختيار المهذب مع شخص بالغ أو غريب.",
  "Спасибо means Thank you.": "Спасибо تعني شكرا.",
  "Пожалуйста makes a request polite.": "Пожалуйста تجعل الطلب مهذبا.",
  "These words keep short Russian interactions polite.":
    "هذه الكلمات تجعل التفاعلات الروسية القصيرة مهذبة.",
  "Извините, пожалуйста is useful when getting someone's attention.":
    "Извините, пожалуйста مفيدة لجذب انتباه شخص بأدب.",
  "Спасибо is the right polite response after receiving something.":
    "Спасибо هي الرد المهذب المناسب بعد استلام شيء.",
  "Я не понимаю means I do not understand.": "Я не понимаю تعني لا أفهم.",
  "Помогите, пожалуйста means Help me, please.": "Помогите, пожалуйста تعني ساعدني من فضلك.",
  "Я не понимаю is the core survival phrase here.":
    "Я не понимаю هي عبارة النجاة الأساسية هنا.",
  "These phrases help you ask for help or keep a conversation going.":
    "هذه العبارات تساعدك على طلب المساعدة أو إبقاء المحادثة مستمرة.",
  "Помогите, пожалуйста is a polite way to ask for help.":
    "Помогите, пожалуйста طريقة مهذبة لطلب المساعدة.",
  "Что это? means What is this?": "Что это؟ تعني ما هذا؟",
  "Где метро? means Where is the metro?": "Где метро؟ تعني أين المترو؟",
  "Где аптека? means Where is the pharmacy?": "Где аптека؟ تعني أين الصيدلية؟",
  "Где магазин? means Where is the store?": "Где магазин؟ تعني أين المتجر؟",
  "These short questions are useful when you need basic information.":
    "هذه الأسئلة القصيرة مفيدة عندما تحتاج إلى معلومات أساسية.",
  "Где метро? is a short, useful location question.":
    "Где метро؟ سؤال قصير ومفيد عن المكان.",
  "Use Что это? when asking What is this?": "استخدم Что это؟ عندما تسأل: ما هذا؟",
  "Use Где? when asking where something is.": "استخدم Где؟ عندما تسأل أين يوجد شيء.",
  "Это моя мама is the natural way to say This is my mom.":
    "Это моя мама هي الطريقة الطبيعية لقول: هذه أمي.",
  "моя сестра means my sister. Use моя with сестра.":
    "моя сестра تعني أختي. استخدم моя مع сестра.",
  "Это мой папа means This is my dad. Use мой with папа.":
    "Это мой папа تعني هذا أبي. استخدم мой مع папа.",
  "мой друг means my friend. Use мой with друг.":
    "мой друг تعني صديقي. استخدم мой مع друг.",
  "моя подруга means my female friend. Use моя with подруга.":
    "моя подруга تعني صديقتي. استخدم моя مع подруга.",
  "мой брат means my brother. Use мой with брат.":
    "мой брат تعني أخي. استخدم мой مع брат.",
  "Это моя семья means This is my family.": "Это моя семья تعني هذه عائلتي.",
  "мой is used with брат. моя is used with сестра and семья.":
    "يُستخدم мой مع брат. وتُستخدم моя مع сестра وсемья.",
  "Use брат for brother. A full sentence is Это мой брат.":
    "استخدم брат بمعنى أخ. والجملة الكاملة هي: Это мой брат.",
  "Я хочу суп means I want soup.": "Я хочу суп تعني أريد حساءً.",
  "Я хочу means I want. Я хочу хлеб means I want bread.":
    "Я хочу تعني أريد. و Я хочу хлеб تعني أريد خبزاً.",
  "Спасибо, я хочу чай means Thank you, I want tea.":
    "Спасибо, я хочу чай تعني شكراً، أريد شايًا.",
  "У меня есть хлеб means I have bread.": "У меня есть хлеб تعني لدي خبز.",
  "Я хочу means I want. У меня есть means I have.":
    "Я хочу تعني أريد. و У меня есть تعني لدي.",
  "Можно воду, пожалуйста? is a polite cafe request.":
    "Можно воду, пожалуйста؟ طلب مهذب في المقهى.",
  "аптека means pharmacy.": "аптека تعني صيدلية.",
  "Идите прямо means Go straight.": "Идите прямо تعني اذهب مباشرة.",
  "Я ищу кафе means I am looking for a cafe.": "Я ищу кафе تعني أبحث عن مقهى.",
  "These words are enough for very simple directions.":
    "هذه الكلمات كافية لاتجاهات بسيطة جداً.",
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
