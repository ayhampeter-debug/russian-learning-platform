"use client";

import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSelector, useExplanationLanguage } from "@/components/LanguageSelector";
import { getExplanationDirection, type ExplanationLanguage } from "@/lib/language-preference";
import { uiTextProps } from "@/lib/ui-translations";

type LandingText = {
  heroTitle: string;
  heroSubtitle: string;
  createAccount: string;
  exploreSite: string;
  login: string;
  learningJourney: string;
  wordOfDay: string;
  newWords: string;
  writingPractice: string;
  mistakeReview: string;
  progress: string;
  featureTitle: string;
  features: Array<{
    title: string;
    line: string;
    visual: "visual" | "typing" | "review" | "progress";
  }>;
};

const landingText: Record<ExplanationLanguage, LandingText> = {
  ar: {
    heroTitle: "YazkUp صديقك الذي سيساعدك في تعلم اللغات",
    heroSubtitle: "تعلّم، تدرّب، وتقدّم خطوة بخطوة.",
    createAccount: "إنشاء حساب",
    exploreSite: "استكشف الموقع",
    login: "تسجيل الدخول",
    learningJourney: "رحلتك التعليمية",
    wordOfDay: "كلمة اليوم",
    newWords: "كلمات جديدة",
    writingPractice: "تدريب الكتابة",
    mistakeReview: "مراجعة الأخطاء",
    progress: "التقدّم",
    featureTitle: "تعلّم، اكتب، وراجع في مكان واحد",
    features: [
      {
        title: "تعلّم بصريًا",
        line: "صور وبطاقات تفاعلية",
        visual: "visual",
      },
      {
        title: "تدريب الكتابة",
        line: "اكتب الكلمات الروسية بثقة",
        visual: "typing",
      },
      {
        title: "مراجعة الأخطاء",
        line: "ارجع للكلمات الصعبة",
        visual: "review",
      },
      {
        title: "تقدّم يومي",
        line: "تابع تقدّمك كل يوم",
        visual: "progress",
      },
    ],
  },
  en: {
    heroTitle: "YazkUp is your friend for learning languages",
    heroSubtitle: "Learn, practice, and progress step by step.",
    createAccount: "Create account",
    exploreSite: "Explore site",
    login: "Log in",
    learningJourney: "Your learning journey",
    wordOfDay: "Word of the day",
    newWords: "New words",
    writingPractice: "Writing practice",
    mistakeReview: "Mistake review",
    progress: "Progress",
    featureTitle: "Learn, type, and review in one place",
    features: [
      {
        title: "Learn visually",
        line: "Images and interactive cards",
        visual: "visual",
      },
      {
        title: "Writing practice",
        line: "Type Russian words with confidence",
        visual: "typing",
      },
      {
        title: "Mistake review",
        line: "Return to difficult words",
        visual: "review",
      },
      {
        title: "Daily progress",
        line: "Track your progress every day",
        visual: "progress",
      },
    ],
  },
};

const arabicLandingFont =
  "[font-family:var(--font-ibm-plex-arabic),var(--font-geist-sans),Inter,ui-sans-serif,sans-serif]";

export default function Home() {
  const { language } = useExplanationLanguage();
  const text = landingText[language];
  const direction = getExplanationDirection(language);
  const isArabic = language === "ar";

  return (
    <main
      className="landing-page min-h-screen overflow-x-hidden bg-white text-[var(--app-text)] [font-family:var(--font-geist-sans),Inter,ui-sans-serif,system-ui,sans-serif] dark:bg-[var(--app-bg)]"
      dir={direction}
    >
      <LandingAtmosphere />
      <LandingHeader text={text} language={language} />

      <section className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-8 px-4 pb-12 pt-2 sm:px-6 sm:pb-16 lg:grid-cols-[0.94fr_1.06fr] lg:gap-12 lg:pb-20 lg:pt-6">
        <div
          className="landing-reveal mx-auto max-w-2xl text-center lg:mx-0 lg:text-start"
          {...uiTextProps(language)}
        >
          <h1
            aria-label={text.heroTitle}
            className={`mx-auto max-w-[16ch] text-balance text-[1.95rem] font-extrabold leading-[1.13] text-[var(--brand-navy)] sm:text-[2.6rem] lg:mx-0 lg:text-[3.05rem] dark:text-[var(--app-text)] ${
              isArabic ? `${arabicLandingFont} font-bold sm:max-w-[16ch] lg:max-w-[17ch] lg:leading-[1.18]` : ""
            }`}
          >
            <HeroHeadline language={language} />
          </h1>

          <p
            className={`mx-auto mt-5 max-w-md text-base font-semibold leading-7 text-[var(--app-text-muted)] sm:text-lg lg:mx-0 ${
              isArabic ? arabicLandingFont : ""
            }`}
          >
            {text.heroSubtitle}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/signup"
              className={`landing-primary-cta inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-navy)] px-7 py-3 text-sm font-black shadow-[0_18px_42px_rgb(17_32_59_/_0.2)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[var(--app-bg)] ${
                isArabic ? `${arabicLandingFont} font-bold` : ""
              }`}
            >
              {text.createAccount}
            </Link>
            <Link
              href="/worlds"
              className={`inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--app-border)] bg-white/88 px-7 py-3 text-sm font-black text-[var(--brand-navy)] shadow-[0_14px_32px_rgb(17_32_59_/_0.07)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--brand-teal)] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:ring-offset-2 focus:ring-offset-white dark:bg-white/5 dark:text-[var(--app-text)] dark:hover:bg-white/10 dark:focus:ring-offset-[var(--app-bg)] ${
                isArabic ? `${arabicLandingFont} font-bold` : ""
              }`}
            >
              {text.exploreSite}
            </Link>
          </div>
        </div>

        <HeroMockup text={text} language={language} />
      </section>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:pb-24">
        <div className="mb-6 flex items-end justify-between gap-6" {...uiTextProps(language)}>
          <h2
            className={`max-w-2xl text-2xl font-black leading-tight text-[var(--brand-navy)] sm:text-3xl lg:text-[2.35rem] dark:text-[var(--app-text)] ${
              isArabic ? `${arabicLandingFont} font-bold` : ""
            }`}
          >
            {text.featureTitle}
          </h2>
          <div className="hidden h-px flex-1 bg-gradient-to-r from-transparent via-[var(--app-border)] to-transparent md:block" />
        </div>

        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {text.features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} language={language} />
          ))}
        </div>
      </section>
    </main>
  );
}

function LandingAtmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div className="landing-wave landing-wave-one" />
      <div className="landing-wave landing-wave-two" />
      <div className="landing-blob landing-blob-teal" />
      <div className="landing-blob landing-blob-cyan" />
      <div className="landing-blob landing-blob-lime" />
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgb(255_255_255_/_0.98),rgb(255_255_255_/_0.72),rgb(255_255_255_/_0))] dark:bg-[linear-gradient(180deg,rgb(8_19_35_/_0.96),rgb(8_19_35_/_0.42),rgb(8_19_35_/_0))]" />
    </div>
  );
}

function HeroHeadline({ language }: { language: ExplanationLanguage }) {
  if (language === "ar") {
    return (
      <>
        <span className="block">YazkUp صديقك</span>
        <span className="block">الذي سيساعدك</span>
        <span className="block">في تعلم اللغات</span>
      </>
    );
  }

  return (
    <>
      <span className="block">YazkUp is your friend</span>
      <span className="block">for learning languages</span>
    </>
  );
}

function LandingHeader({
  text,
  language,
}: {
  text: LandingText;
  language: ExplanationLanguage;
}) {
  const isArabic = language === "ar";

  return (
    <header className="relative z-20 mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-5">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 rounded-[1.55rem] border border-white bg-white/88 px-3 py-3 shadow-[0_18px_55px_rgb(17_32_59_/_0.1)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0c1a30]/86 sm:flex-nowrap sm:px-5">
        <BrandLogo className="shrink-0" />

        <div className="ms-auto flex min-w-0 flex-1 items-center justify-end gap-2 sm:flex-none sm:gap-3">
          <LanguageSelector className="shrink-0 [&>label]:!hidden" />
          <Link
            href="/login"
            className={`inline-flex shrink-0 rounded-full px-3 py-2.5 text-xs font-black text-[var(--app-text-soft)] transition hover:bg-[var(--app-primary-soft)] hover:text-[var(--brand-navy)] dark:hover:text-[var(--app-text)] sm:px-4 sm:text-sm ${
              isArabic ? `${arabicLandingFont} font-bold` : ""
            }`}
          >
            {text.login}
          </Link>
          <Link
            href="/signup"
            className={`landing-primary-cta inline-flex shrink-0 rounded-full bg-[var(--brand-navy)] px-3 py-2.5 text-xs font-black shadow-[0_10px_24px_rgb(17_32_59_/_0.15)] transition hover:bg-[var(--brand-teal)] sm:px-4 sm:text-sm ${
              isArabic ? `${arabicLandingFont} font-bold` : ""
            }`}
          >
            {text.createAccount}
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroMockup({
  text,
  language,
}: {
  text: LandingText;
  language: ExplanationLanguage;
}) {
  const isArabic = language === "ar";
  const visualTitle = isArabic ? "تعلّم بصري" : "Visual learning";
  const writingTitle = text.writingPractice;
  const reviewTitle = isArabic ? "راجع كلماتك" : "Review your words";
  const vocabulary = ["привет", "дом", "язык", "писать"];

  return (
    <div className="landing-reveal landing-reveal-delay relative mx-auto w-full max-w-[39rem]" {...uiTextProps(language)}>
      <div className="relative overflow-hidden rounded-[2.15rem] border border-white bg-white/78 p-3 shadow-[0_30px_86px_rgb(17_32_59_/_0.15)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0c1a30]/82 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_16%,rgb(87_212_232_/_0.24),transparent_27%),radial-gradient(circle_at_86%_18%,rgb(183_229_49_/_0.2),transparent_23%),linear-gradient(145deg,rgb(248_251_255_/_0.98),rgb(255_255_255_/_0.84))] dark:bg-[radial-gradient(circle_at_16%_16%,rgb(87_212_232_/_0.16),transparent_27%),radial-gradient(circle_at_86%_18%,rgb(183_229_49_/_0.12),transparent_23%),linear-gradient(145deg,rgb(8_19_35_/_0.96),rgb(12_26_48_/_0.88))]" />

        <div className="relative grid min-h-[31rem] gap-3 rounded-[1.75rem] border border-white/80 bg-white/78 p-3 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.86),0_22px_60px_rgb(17_32_59_/_0.1)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#10223d]/76 sm:min-h-[33rem] sm:gap-4 sm:p-4 lg:grid-cols-[1.18fr_0.82fr]">
          <section className="relative isolate min-h-[19rem] overflow-hidden rounded-[1.45rem] border border-[var(--app-border-muted)] bg-[linear-gradient(145deg,rgb(255_255_255_/_0.92),rgb(241_250_253_/_0.9))] p-4 shadow-[0_16px_40px_rgb(17_32_59_/_0.07)] dark:bg-[linear-gradient(145deg,rgb(17_34_60_/_0.86),rgb(12_26_48_/_0.78))] sm:min-h-[24rem] sm:p-5 lg:row-span-2">
            <div className="absolute inset-x-8 bottom-4 top-20 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(87_212_232_/_0.18),transparent_68%)]" />
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--app-text-faint)]">
                  YazkUp
                </p>
                <h3 className={`mt-1 text-xl leading-tight text-[var(--brand-navy)] dark:text-[var(--app-text)] sm:text-2xl ${isArabic ? `${arabicLandingFont} font-bold` : "font-black"}`}>
                  {visualTitle}
                </h3>
              </div>
              <span className="shrink-0 rounded-full bg-[var(--app-secondary-soft)] px-3 py-1.5 text-xs font-black text-[var(--app-primary-strong)]">
                4 {isArabic ? "كلمات" : "words"}
              </span>
            </div>

            <div className="relative z-10 mt-3 grid min-h-[15rem] grid-cols-[0.9fr_1.1fr] items-center gap-2 sm:mt-4 sm:min-h-[18rem]">
              <div className="relative mx-auto flex h-full max-h-[18rem] w-full items-end justify-center sm:max-h-[21rem]">
                <div className="absolute bottom-0 h-[76%] w-[82%] rounded-t-full bg-[linear-gradient(180deg,rgb(87_212_232_/_0.18),rgb(183_229_49_/_0.1))]" />
                <Image
                  src="/lessons/body-parts/front-body.png"
                  alt=""
                  width={217}
                  height={768}
                  aria-hidden="true"
                  className="relative z-10 h-[15rem] w-auto object-contain drop-shadow-[0_18px_28px_rgb(17_32_59_/_0.16)] sm:h-[18.5rem]"
                />
              </div>

              <div className="grid content-center gap-2" dir="ltr">
                {vocabulary.map((word, index) => (
                  <span
                    key={word}
                    className={`inline-flex w-fit items-center gap-2 rounded-full border border-white bg-white/88 px-3 py-2 text-sm font-black text-[var(--brand-navy)] shadow-[0_12px_28px_rgb(17_32_59_/_0.07)] dark:border-white/10 dark:bg-white/10 dark:text-[var(--app-text)] ${
                      index % 2 === 0 ? "justify-self-start" : "justify-self-end"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-[var(--brand-teal)]" />
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[1.45rem] border border-[var(--app-border-muted)] bg-white/86 p-4 shadow-[0_16px_40px_rgb(17_32_59_/_0.07)] dark:bg-white/5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className={`text-base text-[var(--brand-navy)] dark:text-[var(--app-text)] ${isArabic ? `${arabicLandingFont} font-bold` : "font-black"}`}>
                  {writingTitle}
                </h3>
                <p className="mt-1 text-2xl font-black text-[var(--brand-navy)] dark:text-[var(--app-text)]" dir="ltr">
                  писать
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[var(--brand-lime)] px-3 py-1.5 text-xs font-black text-[var(--brand-navy)]">
                +40 XP
              </span>
            </div>

            <div className="mt-4 rounded-[1.05rem] bg-[var(--app-surface-muted)] p-2.5 dark:bg-[#081323]/48" dir="ltr">
              <div className="flex gap-1.5">
                {["п", "и", "с", "а", "т", "ь"].map((letter) => (
                  <span
                    key={letter}
                    className="grid h-9 min-w-0 flex-1 place-items-center rounded-xl bg-white text-sm font-black text-[var(--brand-navy)] shadow-sm dark:bg-white/10 dark:text-[var(--app-text)]"
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[1.45rem] border border-[var(--app-border-muted)] bg-white/86 p-4 shadow-[0_16px_40px_rgb(17_32_59_/_0.07)] dark:bg-white/5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className={`text-base text-[var(--brand-navy)] dark:text-[var(--app-text)] ${isArabic ? `${arabicLandingFont} font-bold` : "font-black"}`}>
                  {text.progress}
                </h3>
                <p className={`mt-1 text-sm font-bold text-[var(--app-text-muted)] ${isArabic ? arabicLandingFont : ""}`}>
                  {reviewTitle}
                </p>
              </div>
              <ProgressRing />
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--app-surface-muted)]">
              <div className="landing-progress-fill h-full rounded-full bg-gradient-to-r from-[var(--brand-teal)] via-[var(--brand-cyan)] to-[var(--brand-lime)]" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2" dir="ltr">
              {vocabulary.map((word) => (
                <span
                  key={word}
                  className="rounded-full bg-[var(--app-secondary-soft)] px-3 py-1.5 text-xs font-black text-[var(--app-primary-strong)]"
                >
                  {word}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
function ProgressRing() {
  return (
    <div className="relative h-16 w-16 shrink-0">
      <div className="absolute inset-0 rounded-full bg-[conic-gradient(var(--brand-teal)_0_68%,rgb(17_32_59_/_0.08)_68%_100%)]" />
      <div className="absolute inset-2 grid place-items-center rounded-full bg-white text-sm font-black text-[var(--brand-navy)] dark:bg-[#081323] dark:text-[var(--app-text)]">
        68%
      </div>
    </div>
  );
}

function FeatureCard({
  feature,
  index,
  language,
}: {
  feature: LandingText["features"][number];
  index: number;
  language: ExplanationLanguage;
}) {
  const isArabic = language === "ar";

  return (
    <article
      className={`landing-feature-card group min-w-0 rounded-[1.35rem] border border-white bg-white/86 p-4 shadow-[0_18px_48px_rgb(17_32_59_/_0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_24px_56px_rgb(17_32_59_/_0.12)] dark:border-white/10 dark:bg-white/5 ${
        isArabic ? arabicLandingFont : ""
      }`}
      {...uiTextProps(language)}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <FeatureVisual type={feature.visual} />
      <h3 className={`mt-4 text-lg text-[var(--brand-navy)] dark:text-[var(--app-text)] ${isArabic ? "font-bold" : "font-black"}`}>
        {feature.title}
      </h3>
      <p className="mt-1 text-sm font-semibold leading-6 text-[var(--app-text-muted)]">
        {feature.line}
      </p>
    </article>
  );
}

function FeatureVisual({ type }: { type: LandingText["features"][number]["visual"] }) {
  if (type === "typing") {
    return (
      <div className="h-32 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,rgb(20_184_166_/_0.15),rgb(87_212_232_/_0.22))] p-3">
        <div className="rounded-xl bg-white/88 p-3 shadow-sm dark:bg-[#10223d]/85">
          <p className="text-xl font-black text-[var(--brand-navy)] dark:text-[var(--app-text)]">
            писать
          </p>
          <div className="mt-3 grid grid-cols-5 gap-1.5">
            {["п", "и", "с", "а", "т"].map((key) => (
              <span key={key} className="grid h-7 place-items-center rounded-lg bg-[var(--app-surface-muted)] text-xs font-black">
                {key}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "review") {
    return (
      <div className="h-32 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,rgb(183_229_49_/_0.2),rgb(20_184_166_/_0.14))] p-3">
        <div className="grid gap-2">
          {["дом", "язык", "стол"].map((word, wordIndex) => (
            <div key={word} className="flex items-center justify-between gap-3 rounded-xl bg-white/88 px-3 py-2 shadow-sm dark:bg-[#10223d]/85">
              <span className="truncate text-sm font-black">{word}</span>
              <span className={`h-2.5 w-12 shrink-0 rounded-full ${wordIndex === 1 ? "bg-[var(--brand-teal)]" : "bg-[var(--brand-lime)]"}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "progress") {
    return (
      <div className="grid h-32 place-items-center rounded-2xl bg-[linear-gradient(135deg,rgb(17_32_59_/_0.08),rgb(87_212_232_/_0.2))]">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(var(--brand-lime)_0_74%,rgb(255_255_255_/_0.85)_74%_100%)] shadow-lg" />
          <div className="absolute inset-2 grid place-items-center rounded-full bg-white text-base font-black text-[var(--brand-navy)] dark:bg-[#10223d] dark:text-[var(--app-text)]">
            74%
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-32 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,rgb(87_212_232_/_0.18),rgb(183_229_49_/_0.2))] p-3">
      <div className="grid h-full grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white/88 p-3 shadow-sm dark:bg-[#10223d]/85">
          <div className="h-10 w-10 rounded-full bg-[var(--brand-cyan)]" />
          <div className="mt-3 h-2 rounded-full bg-[var(--brand-teal)]" />
          <div className="mt-2 h-2 w-2/3 rounded-full bg-[var(--app-border)]" />
        </div>
        <div className="rounded-2xl bg-[var(--brand-navy)] p-3 text-white shadow-sm">
          <div className="h-2 w-10 rounded-full bg-[var(--brand-lime)]" />
          <div className="mt-3 text-sm font-black">язык</div>
          <div className="mt-5 h-7 rounded-full bg-white/15" />
        </div>
      </div>
    </div>
  );
}

