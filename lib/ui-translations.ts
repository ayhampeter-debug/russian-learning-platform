import {
  getExplanationDirection,
  type ExplanationLanguage,
} from "@/lib/language-preference";

export const uiText = {
  en: {
    common: {
      loading: "Loading",
      save: "Save",
      cancel: "Cancel",
      back: "Back",
      continue: "Continue",
      start: "Start",
      complete: "Complete",
      comingSoon: "Coming soon",
      guestMode: "Guest mode",
      signedIn: "Signed in",
      signedOut: "Signed out",
      learnMore: "Learn more",
      open: "Open",
      close: "Close",
      review: "Review",
      locked: "Locked",
      unlocked: "Unlocked",
      completed: "Completed",
      available: "Available",
      current: "Current",
      english: "English",
      arabic: "Arabic",
    },
    nav: {
      home: "Home",
      dashboard: "Dashboard",
      worlds: "Worlds",
      lesson: "Lesson",
      challenge: "Challenge",
      profile: "Profile",
      signIn: "Sign in",
      signUp: "Sign up",
      currentCourse: "Current course",
      explanationLanguage: "Explanation language",
      openMenu: "Open navigation menu",
      closeMenu: "Close navigation menu",
      learnRussianWith: "Learn Russian with",
    },
    home: {
      eyebrow: "Gamified language learning for daily momentum",
      title: "YazkUp helps you level up languages through quests.",
      tagline: "Learn languages through quests, levels, XP, and daily progress.",
      guided: "Learn Russian with English or Arabic explanations.",
      startToday: "Start with Russian today.",
      startLearning: "Start Learning",
      createFreeAccount: "Create Free Account",
      continueLearning: "Continue Learning",
      exploreWorlds: "Explore Worlds",
      firstCourseLive: "First course live",
      availableWorlds: "Available worlds",
      starterXpPath: "Starter XP path",
      whyYazkUp: "Why YazkUp",
      gameLoopTitle: "Language practice with a clear game loop",
      gameLoopText:
        "YazkUp turns small daily sessions into visible progress, world unlocks, and checkpoints that make practice easier to return to.",
      questLessons: "Quest-based lessons",
      questLessonsText: "Move through focused lessons that feel like a path, not a worksheet.",
      xpTracking: "XP and progress tracking",
      xpTrackingText: "Earn XP, see what is complete, and always know what to do next.",
      bossChallenges: "Boss challenges",
      bossChallengesText: "Checkpoint challenges test whether you can use what you learned.",
      savedProgress: "Saved progress",
      savedProgressText: "Practice as a guest or sign in to keep progress synced to your account.",
      howItWorks: "How it works",
      howTitle: "Pick a path, practice, then unlock the next challenge",
      howText:
        "The first course is organized into short worlds and lessons, so a new learner can start quickly without guessing where to go.",
      chooseWorld: "Choose a world",
      chooseWorldText: "Start with a themed path that groups lessons into clear goals.",
      completeShortLessons: "Complete short lessons",
      completeShortLessonsText:
        "Practice vocabulary, choices, matching, sentence order, and scenarios.",
      levelUp: "Level up and unlock challenges",
      levelUpText: "Build XP, save progress, and open boss gates as you advance.",
      currentCourse: "Current course",
      russianLive: "Russian is live now. More languages can come later.",
      courseText:
        "YazkUp is designed as a language learning platform that can grow beyond the first course. The current path gives beginners an English- or Arabic-guided route through practical basics in World 1 and World 2.",
      beginnerFriendly: "Beginner-friendly Russian",
      guidedMode: "English-guided / Arabic-guided",
      worldsAvailable: "World 1 and World 2 available",
      moreLanguagesLater: "Built to support more languages later",
      productHighlights: "Product highlights",
      honestTools: "Honest tools for steady practice",
      honestToolsText:
        "No inflated promises or fake testimonials. YazkUp focuses on concise lessons, saved progress, and a friendly game structure that helps learners keep going.",
      dailyPractice: "Built for daily practice",
      shortLessons: "Short lessons",
      progressSavedAccount: "Progress saved with account",
      guestModeAvailable: "Guest mode available",
      ready: "Ready to start?",
      beginWorldOne: "Begin with World 1 and build your first Russian phrases.",
      startLiveCourse:
        "Start the live Russian course, explore the worlds, or continue from your dashboard when you are signed in.",
      liveCourse: "Live course",
      russianFirstContact: "Russian: First Contact",
      beginnerGuided: "Beginner-friendly lessons guided in English or Arabic.",
      worldProgressPreview: "World progress preview",
      bossChallenge: "Boss challenge",
    },
    dashboard: {
      welcomeBack: "Welcome back",
      journey: "Your language journey",
      guestSaved: "Guest progress is saved on this device. Sign in when you want it synced.",
      continueShort: "Continue learning through short lessons, XP rewards, and boss challenges.",
      newRun: "New run detected. Start the first lesson to bank XP and unlock the boss gate.",
      resetLocalProgress: "Reset Local Progress",
      resetConfirm:
        "Reset local YazkUp progress on this device? Synced account progress may reload after refresh.",
      continueLearning: "Continue Learning",
      totalXp: "Total XP",
      xpEarned: "XP Earned",
      totalExperiencePoints: "Total experience points",
      hearts: "Hearts",
      mistakesAbsorb: "Mistakes you can absorb",
      progress: "Progress",
      lessonsDone: "Lessons Done",
      completedLessons: "Completed lessons",
      totalLessonsCompleted: "Total lessons completed",
      streak: "Streak",
      soon: "Soon",
      days: "days",
      daysPracticed: "Days practiced in a row",
      dailyStreakComingSoon: "Daily streak coming soon",
      currentCoursePath: "Current course path",
      level: "Level",
      currentWorldSteps: "current-world steps cleared",
      currentWorld: "Current world",
      nextRecommended: "Next recommended action",
      worldOneCompleted: "World 1 completed",
      bossReady: "All World 1 lessons are complete. The boss challenge is ready.",
      bossDefeatedNext:
        "The World 1 boss is defeated. Continue into World 2 or review completed worlds.",
      world1: "World 1",
      world2: "World 2",
      bossChallenge: "Boss challenge",
      bossDefeated: "Boss defeated",
      start: "Start",
      continue: "Continue",
      review: "Review",
      locked: "Locked",
      unlocked: "Unlocked",
      completed: "Completed",
      available: "Available",
      currentContinue: "Current/Continue",
      startBossChallenge: "Start Boss Challenge",
      completeWorldOneLessons: "Complete World 1 lessons to unlock",
      lessons: "lessons",
      of: "of",
    },
    worlds: {
      choosePath: "Choose your path",
      worlds: "Worlds",
      worldsStages: "Worlds & Stages",
      intro:
        "Progress through the live course path step by step. Complete lessons, pass boss challenges, and unlock the next stage or world.",
      worldProgress: "World progress",
      completed: "Completed",
      current: "Current",
      available: "Available",
      locked: "Locked",
      continueWorld: "Continue World",
      startWorld: "Start World",
      review: "Review",
      completeAllLessons: "Complete all lessons",
      defeatBossToUnlock: "Defeat the boss to unlock",
      lockedUntilBoss: "Locked until all World 1 lessons are complete and the World 1 boss is defeated.",
      lessonsCompleted: "Lessons completed",
      lessonsComplete: "lessons complete",
      bossDefeated: "Boss defeated",
      comingSoon: "Coming soon",
      complete: "Complete",
      world: "World",
      bossCompleted: "Boss completed",
      bossUnlocked: "Boss unlocked",
      bossLocked: "Boss locked",
      replayBoss: "Replay Boss",
      startBoss: "Start Boss",
      currentContinue: "Current/Continue",
      of: "of",
    },
    challenge: {
      bossChallenge: "Boss Challenge",
      locked: "Locked",
      available: "Available",
      completed: "Completed",
      startBossChallenge: "Start Boss Challenge",
      bossDefeated: "Boss defeated",
      bossCompleted: "Boss Completed",
      bossAvailable: "Boss Available",
      bossLocked: "Boss Locked",
      completeWorldOneToUnlock: "Complete all World 1 lessons to unlock",
      completeWorldOneLessons: "Complete all World 1 lessons to unlock the Boss Challenge.",
      finishWorldOneFirst: "Finish every World 1 lesson first.",
      tryAgain: "Try again",
      continue: "Continue",
      score: "Score",
      hearts: "Hearts",
      correct: "Correct",
      wrong: "Wrong",
      challengeComplete: "Challenge complete",
      finalStageResult: "Final Stage Result",
      bossSurvived: "Boss Survived",
      passed: "Passed",
      failed: "Failed",
      state: "State",
      bossCoreIntegrity: "Boss core integrity",
      passRequires: "Pass requires",
      scoreAndHeart: "score and at least one heart.",
      landedAttacks: "You landed",
      attacks: "attacks.",
      retryBoss: "Retry Boss",
      viewUnlockedWorlds: "View Unlocked Worlds",
      backToDashboard: "Back to Dashboard",
      backToWorlds: "Back to Worlds",
      finalStage: "Final Stage",
      firstContactSentinel: "First Contact Sentinel",
      mixedBossFlow:
        "Survive a mixed boss flow: translation strikes, typed counters, sentence assembly, and scenario decisions.",
      bossHealth: "Boss Health",
      attack: "Attack",
      bossAction: "Boss action",
      criticalHit: "Critical hit.",
      counterattack: "Counterattack landed.",
      heart: "heart",
      encounter: "Encounter",
      gateSentinel: "Gate Sentinel",
      gateText:
        "Drop the health bar by answering correctly. Passing the score threshold with a heart left clears the world boss.",
      correctHits: "Correct hits",
      passScore: "Pass score",
      counterPhrase: "Counter phrase",
      typeEnglishAnswer: "Type the English answer",
      lockCounter: "Lock Counter",
      arenaScenario: "Arena scenario",
      worldTwoUnlocked:
        "World 2 is unlocked. You can continue into Everyday Basics or replay the boss for practice.",
      defeatToUnlock:
        "All World 1 lessons are complete. Defeat the boss to unlock World 2: Everyday Basics.",
      replayBossChallenge: "Replay Boss Challenge",
      goToWorld2: "Go to World 2",
      resultWin:
        "You cleared the First Contact boss fight and proved you can handle a real opening exchange.",
      resultLose:
        "The sentinel held the gate. Tighten the basics, protect your hearts, and try the fight again.",
      translationStrike: "Translation strike",
      typedCounter: "Typed counter",
      sentenceForge: "Sentence forge",
      survivalChoice: "Survival choice",
    },
    profile: {
      profile: "Profile",
      playerProfile: "Player profile",
      profileText:
        "Track your language journey through XP, streaks, achievements, and current course progress.",
      achievements: "Achievements",
      stats: "Stats",
      totalXp: "Total XP",
      lessonsCompleted: "Lessons completed",
      completedLessons: "Completed Lessons",
      bossDefeated: "Boss defeated",
      languagePreference: "Language preference",
      dailyStreakComingSoon: "Daily streak coming soon",
      account: "Account",
      progress: "Progress",
      firstLessonCompleted: "First Lesson Completed",
      firstLessonDescription: "Clear any World 1 lesson.",
      world1Completed: "World 1 Completed",
      world1Description: "Complete every lesson in World 1.",
      bossDefeatedAchievement: "Boss Defeated",
      bossDescription: "Pass the First Contact boss challenge.",
      world2Unlocked: "World 2 Unlocked",
      world2Description: "Unlock Everyday Basics by clearing World 1 and defeating the boss.",
      xpStarter: "XP Starter",
      xpStarterDescription: "Earn your first 100 XP.",
      currentStreak: "Current Streak",
      longestStreak: "Longest Streak",
      completedStages: "Completed Stages",
      bossChallenge: "Boss Challenge",
      world2: "World 2",
      available: "Available",
      locked: "Locked",
      completed: "Completed",
      unlocked: "Unlocked",
      inProgress: "In progress",
      days: "days",
      backToDashboard: "Back to Dashboard",
      localProgressAvailable: "Local progress is still available on this device.",
      guestProfile:
        "You are browsing as a guest. Your quest log stays on this device until you sign in.",
      world1Progress: "World 1 progress",
      world1ProgressText:
        "Greetings, introductions, survival phrases, basic questions, and the first conversation challenge.",
      complete: "Complete",
      stepsCleared: "steps cleared",
      xpEarned: "XP earned",
      learningIdentity: "Learning identity",
      firstLiveCourse: "First live course: Russian with English explanations.",
      firstLiveCourseArabic: "First live course: Russian with Arabic explanations.",
      nextGoal: "Next goal",
      trophyShelf: "Trophy shelf",
      unlockedCount: "unlocked",
      syncedDetail: "Synced from your profile achievements.",
      unlockedFromProgress: "Unlocked from current progress.",
      keepLearning: "Keep learning to unlock this badge.",
      questLog: "Quest log",
      recentActivity: "Recent Activity",
      finishedSayHello: "Finished Say Hello",
      finishedSayHelloDetail: "Earned 80 XP in World 1.",
      today: "Today",
      dailyChallenge: "Daily Challenge",
      dailyChallengeDetail: "Answered 5 quick review questions.",
      yesterday: "Yesterday",
      unlockedIntroduceYourself: "Unlocked Introduce Yourself",
      unlockedIntroduceYourselfDetail: "Next lesson is ready to start.",
      twoDaysAgo: "2 days ago",
      streakMilestone: "Streak milestone",
      streakMilestoneDetail: "Reached a 7 day learning streak.",
      thisWeek: "This week",
    },
    lesson: {
      backToWorlds: "Back to Worlds",
      lessonLocked: "Lesson Locked",
      unavailableYet: "is not available yet.",
      unlockStep: "Complete the previous required lesson or boss challenge to unlock this step.",
      lessonNotFound: "Lesson not found",
      couldNotFindLesson: "We could not find that lesson.",
      noLessonMatches: "No lesson matches",
      chooseAvailableStage: "Choose an available stage from the worlds map and keep going.",
      startFirstLesson: "Start First Lesson",
      exercise: "Exercise",
      realLifeSituation: "Real-life situation",
      russian: "Russian",
      cleared: "Cleared",
      practiced: "You practiced",
      multipleChoice: "Multiple choice",
      fillBlank: "Fill the blank",
      sentenceOrder: "Sentence order",
      matching: "Matching",
      scenarioChoice: "Scenario choice",
      choice: "Choice",
      blank: "Blank",
      order: "Order",
      match: "Match",
      scenario: "Scenario",
    },
  },
  ar: {
    common: {
      loading: "جار التحميل",
      save: "حفظ",
      cancel: "إلغاء",
      back: "رجوع",
      continue: "متابعة",
      start: "ابدأ",
      complete: "مكتمل",
      comingSoon: "قريبا",
      guestMode: "وضع الضيف",
      signedIn: "تم تسجيل الدخول",
      signedOut: "غير مسجل الدخول",
      learnMore: "اعرف المزيد",
      open: "فتح",
      close: "إغلاق",
      review: "مراجعة",
      locked: "مغلق",
      unlocked: "مفتوح",
      completed: "مكتمل",
      available: "متاح",
      current: "الحالي",
      english: "الإنجليزية",
      arabic: "العربية",
    },
    nav: {
      home: "الرئيسية",
      dashboard: "لوحة التعلم",
      worlds: "العوالم",
      lesson: "الدرس",
      challenge: "التحدي",
      profile: "الملف الشخصي",
      signIn: "تسجيل الدخول",
      signUp: "إنشاء حساب",
      currentCourse: "المساق الحالي",
      explanationLanguage: "لغة الشرح",
      openMenu: "فتح قائمة التنقل",
      closeMenu: "إغلاق قائمة التنقل",
      learnRussianWith: "تعلم الروسية مع",
    },
    home: {
      eyebrow: "تعلم اللغات بأسلوب اللعب مع تقدم يومي",
      title: "YazkUp يساعدك على رفع مستواك في اللغات عبر المهام.",
      tagline: "تعلم اللغات عبر المهام والمستويات ونقاط XP والتقدم اليومي.",
      guided: "تعلم الروسية بشرح إنجليزي أو عربي.",
      startToday: "ابدأ بالروسية اليوم.",
      startLearning: "ابدأ التعلم",
      createFreeAccount: "أنشئ حسابا مجانيا",
      continueLearning: "تابع التعلم",
      exploreWorlds: "استكشف العوالم",
      firstCourseLive: "أول مساق متاح",
      availableWorlds: "العوالم المتاحة",
      starterXpPath: "مسار XP للمبتدئين",
      whyYazkUp: "لماذا YazkUp",
      gameLoopTitle: "تدريب لغوي بحلقة لعب واضحة",
      gameLoopText:
        "يحول YazkUp الجلسات اليومية الصغيرة إلى تقدم مرئي وفتح عوالم ونقاط تحقق تساعدك على العودة للتدريب.",
      questLessons: "دروس قائمة على المهام",
      questLessonsText: "تقدم في دروس مركزة تبدو كمسار واضح، لا كورقة تمارين.",
      xpTracking: "تتبع XP والتقدم",
      xpTrackingText: "اكسب XP واعرف ما اكتمل وما يجب فعله بعد ذلك.",
      bossChallenges: "تحديات الزعيم",
      bossChallengesText: "تختبر تحديات نقاط التحقق قدرتك على استخدام ما تعلمته.",
      savedProgress: "تقدم محفوظ",
      savedProgressText: "تدرب كضيف أو سجل الدخول لمزامنة تقدمك مع حسابك.",
      howItWorks: "كيف يعمل",
      howTitle: "اختر مسارا، تدرب، ثم افتح التحدي التالي",
      howText:
        "ينظم المساق الأول في عوالم ودروس قصيرة، لذلك يمكن للمتعلم الجديد البدء بسرعة دون تخمين وجهته.",
      chooseWorld: "اختر عالما",
      chooseWorldText: "ابدأ بمسار موضوعي يجمع الدروس ضمن أهداف واضحة.",
      completeShortLessons: "أكمل دروسا قصيرة",
      completeShortLessonsText:
        "تدرب على المفردات والاختيارات والمطابقة وترتيب الجمل والمواقف.",
      levelUp: "ارفع مستواك وافتح التحديات",
      levelUpText: "اجمع XP واحفظ التقدم وافتح بوابات الزعيم مع تقدمك.",
      currentCourse: "المساق الحالي",
      russianLive: "الروسية متاحة الآن. يمكن إضافة لغات أخرى لاحقا.",
      courseText:
        "صمم YazkUp كمنصة تعلم لغات يمكن أن تتوسع بعد المساق الأول. يمنح المسار الحالي المبتدئين طريقا موجها بالإنجليزية أو العربية عبر أساسيات عملية في العالم 1 والعالم 2.",
      beginnerFriendly: "روسية مناسبة للمبتدئين",
      guidedMode: "إرشاد بالإنجليزية / بالعربية",
      worldsAvailable: "العالم 1 والعالم 2 متاحان",
      moreLanguagesLater: "مصمم لدعم لغات أخرى لاحقا",
      productHighlights: "أبرز المزايا",
      honestTools: "أدوات عملية للتدريب المنتظم",
      honestToolsText:
        "لا وعود مبالغا فيها ولا شهادات مزيفة. يركز YazkUp على دروس موجزة وتقدم محفوظ وبنية لعب ودودة تساعد المتعلمين على الاستمرار.",
      dailyPractice: "مصمم للتدريب اليومي",
      shortLessons: "دروس قصيرة",
      progressSavedAccount: "التقدم محفوظ مع الحساب",
      guestModeAvailable: "وضع الضيف متاح",
      ready: "جاهز للبدء؟",
      beginWorldOne: "ابدأ بالعالم 1 وابن أول عباراتك الروسية.",
      startLiveCourse:
        "ابدأ مساق الروسية المتاح، استكشف العوالم، أو تابع من لوحة التعلم عند تسجيل الدخول.",
      liveCourse: "مساق متاح",
      russianFirstContact: "الروسية: التواصل الأول",
      beginnerGuided: "دروس مناسبة للمبتدئين بإرشاد إنجليزي أو عربي.",
      worldProgressPreview: "معاينة تقدم العالم",
      bossChallenge: "تحدي الزعيم",
    },
    dashboard: {
      welcomeBack: "مرحبا بعودتك",
      journey: "رحلتك اللغوية",
      guestSaved: "تقدم الضيف محفوظ على هذا الجهاز. سجل الدخول عندما تريد مزامنته.",
      continueShort: "تابع التعلم عبر دروس قصيرة ومكافآت XP وتحديات الزعيم.",
      newRun: "تم رصد بداية جديدة. ابدأ الدرس الأول لجمع XP وفتح بوابة الزعيم.",
      resetLocalProgress: "إعادة ضبط التقدم المحلي",
      resetConfirm:
        "هل تريد إعادة ضبط تقدم YazkUp المحلي على هذا الجهاز؟ قد يعود التقدم المتزامن بعد تحديث الصفحة.",
      continueLearning: "تابع التعلم",
      totalXp: "إجمالي XP",
      xpEarned: "XP المكتسبة",
      totalExperiencePoints: "إجمالي نقاط الخبرة",
      hearts: "القلوب",
      mistakesAbsorb: "الأخطاء التي يمكنك تحملها",
      progress: "التقدم",
      lessonsDone: "الدروس المكتملة",
      completedLessons: "الدروس المكتملة",
      totalLessonsCompleted: "إجمالي الدروس المكتملة",
      streak: "السلسلة",
      soon: "قريبا",
      days: "أيام",
      daysPracticed: "أيام تدريب متتالية",
      dailyStreakComingSoon: "السلسلة اليومية قادمة قريبا",
      currentCoursePath: "مسار المساق الحالي",
      level: "المستوى",
      currentWorldSteps: "خطوات من العالم الحالي مكتملة",
      currentWorld: "العالم الحالي",
      nextRecommended: "الإجراء المقترح التالي",
      worldOneCompleted: "اكتمل العالم 1",
      bossReady: "اكتملت كل دروس العالم 1. تحدي الزعيم جاهز.",
      bossDefeatedNext: "تمت هزيمة زعيم العالم 1. تابع إلى العالم 2 أو راجع العوالم المكتملة.",
      world1: "العالم 1",
      world2: "العالم 2",
      bossChallenge: "تحدي الزعيم",
      bossDefeated: "تمت هزيمة الزعيم",
      start: "ابدأ",
      continue: "متابعة",
      review: "مراجعة",
      locked: "مغلق",
      unlocked: "مفتوح",
      completed: "مكتمل",
      available: "متاح",
      currentContinue: "الحالي / متابعة",
      startBossChallenge: "ابدأ تحدي الزعيم",
      completeWorldOneLessons: "أكمل دروس العالم 1 لفتحه",
      lessons: "دروس",
      of: "من",
    },
    worlds: {
      choosePath: "اختر مسارك",
      worlds: "العوالم",
      worldsStages: "العوالم والمراحل",
      intro:
        "تقدم في مسار المساق المتاح خطوة بخطوة. أكمل الدروس، واجتز تحديات الزعيم، وافتح المرحلة أو العالم التالي.",
      worldProgress: "تقدم العالم",
      completed: "مكتمل",
      current: "الحالي",
      available: "متاح",
      locked: "مغلق",
      continueWorld: "تابع العالم",
      startWorld: "ابدأ العالم",
      review: "مراجعة",
      completeAllLessons: "أكمل كل الدروس",
      defeatBossToUnlock: "اهزم الزعيم للفتح",
      lockedUntilBoss: "مغلق حتى تكتمل كل دروس العالم 1 وتتم هزيمة زعيم العالم 1.",
      lessonsCompleted: "الدروس المكتملة",
      lessonsComplete: "دروس مكتملة",
      bossDefeated: "تمت هزيمة الزعيم",
      comingSoon: "قريبا",
      complete: "مكتمل",
      world: "العالم",
      bossCompleted: "الزعيم مكتمل",
      bossUnlocked: "الزعيم مفتوح",
      bossLocked: "الزعيم مغلق",
      replayBoss: "أعد الزعيم",
      startBoss: "ابدأ الزعيم",
      currentContinue: "الحالي / متابعة",
      of: "من",
    },
    challenge: {
      bossChallenge: "تحدي الزعيم",
      locked: "مغلق",
      available: "متاح",
      completed: "مكتمل",
      startBossChallenge: "ابدأ تحدي الزعيم",
      bossDefeated: "تمت هزيمة الزعيم",
      bossCompleted: "الزعيم مكتمل",
      bossAvailable: "الزعيم متاح",
      bossLocked: "الزعيم مغلق",
      completeWorldOneToUnlock: "أكمل كل دروس العالم 1 للفتح",
      completeWorldOneLessons: "أكمل كل دروس العالم 1 لفتح تحدي الزعيم.",
      finishWorldOneFirst: "أكمل كل درس في العالم 1 أولا.",
      tryAgain: "حاول مرة أخرى",
      continue: "متابعة",
      score: "النتيجة",
      hearts: "القلوب",
      correct: "صحيح",
      wrong: "خطأ",
      challengeComplete: "اكتمل التحدي",
      finalStageResult: "نتيجة المرحلة النهائية",
      bossSurvived: "نجا الزعيم",
      passed: "نجحت",
      failed: "لم تنجح",
      state: "الحالة",
      bossCoreIntegrity: "سلامة نواة الزعيم",
      passRequires: "يتطلب النجاح",
      scoreAndHeart: "نقاطا وقلبا واحدا على الأقل.",
      landedAttacks: "نجحت في",
      attacks: "هجمات.",
      retryBoss: "أعد محاولة الزعيم",
      viewUnlockedWorlds: "اعرض العوالم المفتوحة",
      backToDashboard: "العودة إلى لوحة التعلم",
      backToWorlds: "العودة إلى العوالم",
      finalStage: "المرحلة النهائية",
      firstContactSentinel: "حارس التواصل الأول",
      mixedBossFlow:
        "اصمد في مسار زعيم متنوع: ضربات ترجمة، ردود مكتوبة، تركيب جمل، وقرارات مواقف.",
      bossHealth: "صحة الزعيم",
      attack: "هجوم",
      bossAction: "حركة الزعيم",
      criticalHit: "ضربة حاسمة.",
      counterattack: "وصلت ضربة مضادة.",
      heart: "قلب",
      encounter: "المواجهة",
      gateSentinel: "حارس البوابة",
      gateText:
        "اخفض شريط الصحة بالإجابات الصحيحة. تجاوز حد النتيجة مع بقاء قلب واحد ينهي زعيم العالم.",
      correctHits: "الضربات الصحيحة",
      passScore: "نتيجة النجاح",
      counterPhrase: "عبارة الرد",
      typeEnglishAnswer: "اكتب الإجابة بالإنجليزية",
      lockCounter: "ثبت الرد",
      arenaScenario: "موقف الساحة",
      worldTwoUnlocked:
        "تم فتح العالم 2. يمكنك المتابعة إلى أساسيات يومية أو إعادة الزعيم للتدريب.",
      defeatToUnlock:
        "اكتملت كل دروس العالم 1. اهزم الزعيم لفتح العالم 2: أساسيات يومية.",
      replayBossChallenge: "أعد تحدي الزعيم",
      goToWorld2: "اذهب إلى العالم 2",
      resultWin: "أنهيت قتال زعيم التواصل الأول وأثبت أنك تستطيع التعامل مع تبادل افتتاحي حقيقي.",
      resultLose: "حافظ الحارس على البوابة. قو الأساسيات، واحم قلوبك، وحاول القتال مرة أخرى.",
      translationStrike: "ضربة ترجمة",
      typedCounter: "رد مكتوب",
      sentenceForge: "تركيب جملة",
      survivalChoice: "اختيار نجاة",
    },
    profile: {
      profile: "الملف الشخصي",
      playerProfile: "ملف اللاعب",
      profileText: "تابع رحلتك اللغوية عبر XP والسلاسل والإنجازات وتقدم المساق الحالي.",
      achievements: "الإنجازات",
      stats: "الإحصاءات",
      totalXp: "إجمالي XP",
      lessonsCompleted: "الدروس المكتملة",
      completedLessons: "الدروس المكتملة",
      bossDefeated: "تمت هزيمة الزعيم",
      languagePreference: "تفضيل اللغة",
      dailyStreakComingSoon: "السلسلة اليومية قادمة قريبا",
      account: "الحساب",
      progress: "التقدم",
      firstLessonCompleted: "اكتمل أول درس",
      firstLessonDescription: "أكمل أي درس في العالم 1.",
      world1Completed: "اكتمل العالم 1",
      world1Description: "أكمل كل درس في العالم 1.",
      bossDefeatedAchievement: "تمت هزيمة الزعيم",
      bossDescription: "اجتز تحدي زعيم التواصل الأول.",
      world2Unlocked: "تم فتح العالم 2",
      world2Description: "افتح أساسيات يومية بإكمال العالم 1 وهزيمة الزعيم.",
      xpStarter: "بداية XP",
      xpStarterDescription: "اكسب أول 100 XP.",
      currentStreak: "السلسلة الحالية",
      longestStreak: "أطول سلسلة",
      completedStages: "المراحل المكتملة",
      bossChallenge: "تحدي الزعيم",
      world2: "العالم 2",
      available: "متاح",
      locked: "مغلق",
      completed: "مكتمل",
      unlocked: "مفتوح",
      inProgress: "قيد التقدم",
      days: "أيام",
      backToDashboard: "العودة إلى لوحة التعلم",
      localProgressAvailable: "لا يزال التقدم المحلي متاحا على هذا الجهاز.",
      guestProfile: "أنت تتصفح كضيف. يبقى سجل المهام على هذا الجهاز حتى تسجل الدخول.",
      world1Progress: "تقدم العالم 1",
      world1ProgressText:
        "التحيات، التعارف، عبارات النجاة، الأسئلة الأساسية، وأول تحدي محادثة.",
      complete: "مكتمل",
      stepsCleared: "خطوات مكتملة",
      xpEarned: "XP مكتسبة",
      learningIdentity: "هوية التعلم",
      firstLiveCourse: "أول مساق متاح: الروسية بشرح إنجليزي.",
      firstLiveCourseArabic: "أول مساق متاح: الروسية بشرح عربي.",
      nextGoal: "الهدف التالي",
      trophyShelf: "رف الجوائز",
      unlockedCount: "مفتوحة",
      syncedDetail: "متزامن من إنجازات ملفك الشخصي.",
      unlockedFromProgress: "مفتوح من التقدم الحالي.",
      keepLearning: "واصل التعلم لفتح هذه الشارة.",
      questLog: "سجل المهام",
      recentActivity: "النشاط الأخير",
      finishedSayHello: "أنهيت درس التحية",
      finishedSayHelloDetail: "كسبت 80 XP في العالم 1.",
      today: "اليوم",
      dailyChallenge: "التحدي اليومي",
      dailyChallengeDetail: "أجبت عن 5 أسئلة مراجعة سريعة.",
      yesterday: "أمس",
      unlockedIntroduceYourself: "تم فتح درس التعريف بالنفس",
      unlockedIntroduceYourselfDetail: "الدرس التالي جاهز للبدء.",
      twoDaysAgo: "منذ يومين",
      streakMilestone: "إنجاز في السلسلة",
      streakMilestoneDetail: "وصلت إلى سلسلة تعلم لمدة 7 أيام.",
      thisWeek: "هذا الأسبوع",
    },
    lesson: {
      backToWorlds: "العودة إلى العوالم",
      lessonLocked: "الدرس مغلق",
      unavailableYet: "غير متاح بعد.",
      unlockStep: "أكمل الدرس السابق المطلوب أو تحدي الزعيم لفتح هذه الخطوة.",
      lessonNotFound: "الدرس غير موجود",
      couldNotFindLesson: "لم نتمكن من العثور على هذا الدرس.",
      noLessonMatches: "لا يوجد درس يطابق",
      chooseAvailableStage: "اختر مرحلة متاحة من خريطة العوالم وتابع.",
      startFirstLesson: "ابدأ أول درس",
      exercise: "تمرين",
      realLifeSituation: "موقف من الحياة",
      russian: "الروسية",
      cleared: "مكتمل",
      practiced: "تدربت على",
      multipleChoice: "اختيار من متعدد",
      fillBlank: "املأ الفراغ",
      sentenceOrder: "ترتيب الجملة",
      matching: "مطابقة",
      scenarioChoice: "اختيار موقف",
      choice: "اختيار",
      blank: "فراغ",
      order: "ترتيب",
      match: "مطابقة",
      scenario: "موقف",
    },
  },
} as const;

type WidenText<T> = {
  [Key in keyof T]: T[Key] extends string ? string : WidenText<T[Key]>;
};

export type UiText = WidenText<typeof uiText.en>;
export type UiSection = keyof UiText;

export function getUiText(language: ExplanationLanguage): UiText {
  return uiText[language];
}

export function uiTextProps(language: ExplanationLanguage) {
  return {
    dir: getExplanationDirection(language),
    lang: language,
  };
}

const arabicContentTitles: Record<string, string> = {
  "First Contact": "التواصل الأول",
  "World 1: First Contact": "العالم 1: التواصل الأول",
  "Everyday Basics": "أساسيات يومية",
  "World 2: Everyday Basics": "العالم 2: أساسيات يومية",
  "Opening Signals": "إشارات البداية",
  "First Exchange": "أول تبادل",
  "Survival Phrases": "عبارات النجاة",
  "Question Basics": "أساسيات الأسئلة",
  "Numbers 1-10": "الأرقام 1–10",
  "Boss Level": "مرحلة الزعيم",
  "People & Family": "الأشخاص والعائلة",
  "Food & Drinks": "الطعام والمشروبات",
  "Places & Directions": "الأماكن والاتجاهات",
  "Everyday Checkpoint": "نقطة تحقق يومية",
  "Say Hello": "قل مرحباً",
  "Friendly or Polite": "ودّي أم رسمي؟",
  "Yes, No, and OK": "نعم، لا، وحسناً",
  "Introduce Yourself": "عرّف عن نفسك",
  "Ask Someone's Name": "اسأل عن اسم شخص",
  "Polite Words": "كلمات مهذبة",
  "When You Need Help": "عندما تحتاج إلى مساعدة",
  "Ask Basic Questions": "اسأل أسئلة بسيطة",
  "Numbers 1-5": "الأرقام 1–5",
  "Numbers 6-10": "الأرقام 6–10",
  "Family Members": "أفراد العائلة",
  "People Around You": "الأشخاص من حولك",
  "Simple Descriptions": "أوصاف بسيطة",
  "Basic Foods": "أطعمة أساسية",
  "Drinks": "المشروبات",
  "Ordering Politely": "الطلب بأدب",
  "Common Places": "أماكن شائعة",
  "Asking Where": "السؤال عن المكان",
  "Left, Right, Straight": "يسار، يمين، إلى الأمام",
  "Complete Introduce Yourself": "أكمل عرّف عن نفسك",
  "Defeat the World 1 Boss": "اهزم زعيم العالم 1",
  "Review your worlds": "راجع عوالمك",
};

const arabicContentDescriptions: Record<string, string> = {
  "Practical greetings, introductions, survival phrases, question words, and numbers 1-10.":
    "تحيات عملية، وتعارف، وعبارات نجاة، وكلمات أسئلة، والأرقام 1–10.",
  "Complete your first basic Russian conversation.":
    "أكمل أول محادثة روسية بسيطة.",
  "Review practical World 1 phrases to keep your streak alive.":
    "راجع عبارات عملية من العالم 1 للحفاظ على سلسلتك.",
  "Beginner words and phrases for people, family, food, drinks, places, and directions.":
    "كلمات وعبارات للمبتدئين عن الأشخاص والعائلة والطعام والمشروبات والأماكن والاتجاهات.",
  "Show you can handle simple everyday Russian situations.":
    "أظهر أنك تستطيع التعامل مع مواقف روسية يومية بسيطة.",
  "Lessons 1-2: casual greetings and formal vs informal greetings.":
    "الدرسان 1–2: التحيات العادية والتحيات الرسمية وغير الرسمية.",
  "Lessons 3-5: yes/no, introduce yourself, and ask someone's name.":
    "الدروس 3–5: نعم/لا، عرّف عن نفسك، واسأل عن اسم شخص.",
  "Lessons 6-7: polite words and I do not understand.":
    "الدرسان 6–7: كلمات مهذبة وعبارة لا أفهم.",
  "Lesson 8: what, who, where, and how.":
    "الدرس 8: ماذا، من، أين، وكيف.",
  "Lessons 9-10: count from one to ten.":
    "الدرسان 9–10: العد من واحد إلى عشرة.",
  "Lessons 1-3: people, family members, and simple descriptions.":
    "الدروس 1–3: الأشخاص وأفراد العائلة والأوصاف البسيطة.",
  "Lessons 4-6: order simple food and talk about drinks.":
    "الدروس 4–6: اطلب طعاماً بسيطاً وتحدث عن المشروبات.",
  "Lessons 7-9: common places and basic direction phrases.":
    "الدروس 7–9: أماكن شائعة وعبارات اتجاهات أساسية.",
  "Use simple greetings for friends, strangers, and mornings.":
    "استخدم تحيات بسيطة مع الأصدقاء والغرباء وفي الصباح.",
  "Choose greetings that fit friends, adults, strangers, and groups.":
    "اختر التحيات المناسبة للأصدقاء والبالغين والغرباء والمجموعات.",
  "Give short answers and react to simple questions.":
    "أعطِ إجابات قصيرة وتفاعل مع أسئلة بسيطة.",
  "Say your name and respond when meeting someone.":
    "قل اسمك وردّ عند مقابلة شخص.",
  "Ask for a name in casual and polite first meetings.":
    "اسأل عن الاسم في لقاءات أولى عادية ومهذبة.",
  "Use please, thank you, excuse me, and simple apologies.":
    "استخدم من فضلك، وشكراً، والمعذرة، واعتذارات بسيطة.",
  "Say you do not understand and ask someone to repeat or slow down.":
    "قل إنك لا تفهم واطلب من شخص أن يعيد الكلام أو يبطئ.",
  "Use what, who, where, and how in practical beginner questions.":
    "استخدم ماذا، ومن، وأين، وكيف في أسئلة عملية للمبتدئين.",
  "Count small amounts for tickets, tables, and items.":
    "عدّ كميات صغيرة للتذاكر والطاولات والأشياء.",
  "Finish the first ten numbers for rooms, platforms, and times.":
    "أكمل أول عشرة أرقام للغرف والأرصفة والأوقات.",
  "Name close family members in simple Russian.":
    "سمِّ أفراد العائلة المقربين بالروسية البسيطة.",
  "Talk about friends, children, and people you meet.":
    "تحدث عن الأصدقاء والأطفال والأشخاص الذين تقابلهم.",
  "Use basic words like big, small, good, and new.":
    "استخدم كلمات أساسية مثل كبير، صغير، جيد، وجديد.",
  "Recognize simple food words for everyday meals.":
    "تعرّف إلى كلمات طعام بسيطة للوجبات اليومية.",
  "Ask for water, tea, coffee, and juice.":
    "اطلب الماء والشاي والقهوة والعصير.",
  "Use simple polite phrases for ordering food and drinks.":
    "استخدم عبارات مهذبة بسيطة لطلب الطعام والمشروبات.",
  "Recognize useful city and home location words.":
    "تعرّف إلى كلمات مفيدة لأماكن المدينة والمنزل.",
  "Ask where common places are.":
    "اسأل أين توجد الأماكن الشائعة.",
  "Understand basic direction words.":
    "افهم كلمات الاتجاهات الأساسية.",
  "Complete the final challenge to finish World 1 and unlock World 2.":
    "أكمل التحدي النهائي لإنهاء العالم 1 وفتح العالم 2.",
  "All available lessons are complete. Review unlocked worlds or replay the boss.":
    "اكتملت كل الدروس المتاحة. راجع العوالم المفتوحة أو أعد تحدي الزعيم.",
};

function localizeContent(
  value: string,
  language: ExplanationLanguage,
  translations: Record<string, string>,
) {
  return language === "ar" ? translations[value] ?? value : value;
}

export function localizeWorldTitle(title: string, language: ExplanationLanguage) {
  return localizeContent(title, language, arabicContentTitles);
}

export function localizeWorldSubtitle(subtitle: string, language: ExplanationLanguage) {
  return localizeContent(subtitle, language, arabicContentTitles);
}

export function localizeWorldDescription(description: string, language: ExplanationLanguage) {
  return localizeContent(description, language, arabicContentDescriptions);
}

export function localizeLessonTitle(title: string, language: ExplanationLanguage) {
  return localizeContent(title, language, arabicContentTitles);
}

export function localizeLessonDescription(description: string, language: ExplanationLanguage) {
  return localizeContent(description, language, arabicContentDescriptions);
}

export function localizeProgressTitle(title: string, language: ExplanationLanguage) {
  if (language === "en") {
    return title;
  }

  if (title.startsWith("Complete ")) {
    return `أكمل ${localizeLessonTitle(title.slice("Complete ".length), language)}`;
  }

  return localizeContent(title, language, arabicContentTitles);
}

export function localizeProgressDescription(description: string, language: ExplanationLanguage) {
  if (language === "en") {
    return description;
  }

  const earnedXpMatch = description.match(/^Earn (\d+) XP and keep moving through (.+)\.$/);

  if (earnedXpMatch) {
    return `اكسب ${earnedXpMatch[1]} نقطة XP وتابع التقدم في ${localizeWorldSubtitle(
      earnedXpMatch[2],
      language,
    )}.`;
  }

  return localizeContent(description, language, arabicContentDescriptions);
}

export function translateStatus(
  status: "Completed" | "Current" | "Available" | "Locked" | "Unlocked" | "In progress",
  language: ExplanationLanguage,
) {
  const common = uiText[language].common;

  if (status === "In progress") {
    return language === "ar" ? "قيد التقدم" : status;
  }

  return {
    Completed: common.completed,
    Current: common.current,
    Available: common.available,
    Locked: common.locked,
    Unlocked: common.unlocked,
  }[status];
}

export function localizeActionLabel(label: string, language: ExplanationLanguage) {
  if (language === "en") {
    return label;
  }

  if (label.startsWith("Continue:")) {
    return `متابعة: ${localizeLessonTitle(label.slice("Continue:".length).trim(), language)}`;
  }

  if (label === "Start Boss Challenge") {
    return uiText.ar.dashboard.startBossChallenge;
  }

  if (label === "View Worlds") {
    return uiText.ar.challenge.viewUnlockedWorlds;
  }

  return label;
}
