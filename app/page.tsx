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
  basics: string;
  bodyParts: string;
  writingPractice: string;
  progress: string;
  xp: string;
  visualLabel: string;
  typingLabel: string;
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
    heroSubtitle: "ابدأ بالروسية، وتدرّب على الكتابة خطوة بخطوة.",
    createAccount: "إنشاء حساب",
    exploreSite: "استكشف الموقع",
    login: "تسجيل الدخول",
    basics: "الأساسيات",
    bodyParts: "أجزاء الجسم",
    writingPractice: "تدريب الكتابة",
    progress: "التقدّم",
    xp: "نقاط XP",
    visualLabel: "تعلّم بصري",
    typingLabel: "تدريب سريع",
    featureTitle: "تعلّم، اكتب، وراجع في مكان واحد",
    features: [
      {
        title: "تعلّم بصريًا",
        line: "صور وبطاقات واضحة للكلمات.",
        visual: "visual",
      },
      {
        title: "تدريب الكتابة",
        line: "اكتب الكلمات الروسية خطوة بخطوة.",
        visual: "typing",
      },
      {
        title: "مراجعة الأخطاء",
        line: "ارجع للكلمات التي تحتاج تدريبًا.",
        visual: "review",
      },
      {
        title: "تقدّم يومي",
        line: "تابع نقاطك وتقدّمك بسهولة.",
        visual: "progress",
      },
    ],
  },
  en: {
    heroTitle: "YazkUp is your friend for learning languages",
    heroSubtitle: "Start with Russian and practice typing step by step.",
    createAccount: "Create account",
    exploreSite: "Explore site",
    login: "Log in",
    basics: "Basics",
    bodyParts: "Body parts",
    writingPractice: "Writing practice",
    progress: "Progress",
    xp: "XP",
    visualLabel: "Visual learning",
    typingLabel: "Quick practice",
    featureTitle: "Learn, type, and review in one place",
    features: [
      {
        title: "Learn visually",
        line: "Clear images and word cards.",
        visual: "visual",
      },
      {
        title: "Writing practice",
        line: "Type Russian words step by step.",
        visual: "typing",
      },
      {
        title: "Mistake review",
        line: "Return to words that need practice.",
        visual: "review",
      },
      {
        title: "Daily progress",
        line: "Track XP and progress with ease.",
        visual: "progress",
      },
    ],
  },
};

const russianChips = ["голова", "рука", "нос", "писать"];

export default function Home() {
  const { language } = useExplanationLanguage();
  const text = landingText[language];
  const direction = getExplanationDirection(language);
  const isArabic = language === "ar";

  return (
    <main
      className="landing-page min-h-screen overflow-x-hidden bg-[var(--brand-light)] text-[var(--app-text)] [font-family:var(--font-geist-sans),Inter,ui-sans-serif,system-ui,sans-serif] dark:bg-[var(--app-bg)]"
      dir={direction}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="landing-wave landing-wave-one" />
        <div className="landing-wave landing-wave-two" />
        <div className="landing-blob landing-blob-teal" />
        <div className="landing-blob landing-blob-cyan" />
        <div className="landing-blob landing-blob-lime" />
        <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgb(255_255_255_/_0.98),rgb(255_255_255_/_0.58),rgb(255_255_255_/_0))] dark:bg-[linear-gradient(180deg,rgb(8_19_35_/_0.96),rgb(8_19_35_/_0.34),rgb(8_19_35_/_0))]" />
      </div>

      <LandingHeader text={text} language={language} />

      <section className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 pb-12 pt-4 sm:px-6 sm:pb-16 lg:min-h-[calc(100vh-6.75rem)] lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:pb-20 lg:pt-8">
        <div
          className="landing-reveal mx-auto max-w-2xl text-center lg:mx-0 lg:text-start"
          {...uiTextProps(language)}
        >
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/80 bg-white/78 px-3 py-2 text-xs font-black text-[var(--app-primary-strong)] shadow-[0_12px_34px_rgb(17_32_59_/_0.07)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--brand-lime)] shadow-[0_0_0_5px_rgb(183_229_49_/_0.18)]" />
            <span className="truncate">
              {text.basics} · {text.bodyParts} · {text.writingPractice}
            </span>
          </div>

          <h1
            aria-label={text.heroTitle}
            className={`mx-auto mt-6 max-w-[15ch] text-balance text-[2.45rem] font-black leading-[1.1] text-[var(--brand-navy)] sm:text-[3.35rem] lg:mx-0 lg:text-[4.25rem] dark:text-[var(--app-text)] ${
              isArabic
                ? "[font-family:var(--font-alexandria),var(--font-geist-sans),sans-serif] sm:max-w-[13ch] lg:max-w-[14ch] lg:leading-[1.16]"
                : "tracking-normal"
            }`}
          >
            <HeroHeadline language={language} />
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base font-semibold leading-7 text-[var(--app-text-muted)] sm:text-lg lg:mx-0">
            {text.heroSubtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/signup"
              className={`inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-navy)] px-7 py-3 text-sm font-black text-white shadow-[0_18px_40px_rgb(17_32_59_/_0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:ring-offset-2 focus:ring-offset-white dark:bg-[var(--brand-cyan)] dark:text-[#06111d] dark:focus:ring-offset-[var(--app-bg)] ${
                isArabic ? "[font-family:var(--font-alexandria),var(--font-geist-sans),sans-serif]" : ""
              }`}
            >
              {text.createAccount}
            </Link>
            <Link
              href="/worlds"
              className={`inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--app-border)] bg-white/86 px-7 py-3 text-sm font-black text-[var(--brand-navy)] shadow-[0_14px_34px_rgb(17_32_59_/_0.07)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--brand-teal)] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:ring-offset-2 focus:ring-offset-white dark:bg-white/5 dark:text-[var(--app-text)] dark:hover:bg-white/10 dark:focus:ring-offset-[var(--app-bg)] ${
                isArabic ? "[font-family:var(--font-alexandria),var(--font-geist-sans),sans-serif]" : ""
              }`}
            >
              {text.exploreSite}
            </Link>
          </div>
        </div>

        <HeroMockup text={text} language={language} />
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:pb-24">
        <div className="mb-6 flex items-end justify-between gap-6" {...uiTextProps(language)}>
          <h2
            className={`max-w-2xl text-2xl font-black leading-tight text-[var(--brand-navy)] sm:text-3xl lg:text-[2.45rem] dark:text-[var(--app-text)] ${
              isArabic ? "[font-family:var(--font-alexandria),var(--font-geist-sans),sans-serif]" : ""
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
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 rounded-[1.45rem] border border-white/78 bg-white/86 px-3 py-3 shadow-[0_18px_55px_rgb(17_32_59_/_0.1)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1a30]/82 sm:flex-nowrap sm:px-5">
        <BrandLogo />

        <div className="ms-auto flex min-w-0 flex-1 items-center justify-end gap-2 sm:flex-none sm:gap-3">
          <LanguageSelector className="shrink-0" />
          <Link
            href="/login"
            className={`inline-flex shrink-0 rounded-full border border-transparent px-3 py-2.5 text-xs font-black text-[var(--app-text-soft)] transition hover:bg-[var(--app-primary-soft)] hover:text-[var(--brand-navy)] dark:hover:text-[var(--app-text)] sm:px-4 sm:text-sm ${
              isArabic ? "[font-family:var(--font-alexandria),var(--font-geist-sans),sans-serif]" : ""
            }`}
          >
            {text.login}
          </Link>
          <Link
            href="/signup"
            className={`inline-flex shrink-0 rounded-full bg-[var(--brand-navy)] px-3 py-2.5 text-xs font-black text-white shadow-[0_10px_24px_rgb(17_32_59_/_0.15)] transition hover:bg-[var(--brand-teal)] dark:bg-[var(--brand-cyan)] dark:text-[#06111d] sm:px-4 sm:text-sm ${
              isArabic ? "[font-family:var(--font-alexandria),var(--font-geist-sans),sans-serif]" : ""
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
  return (
    <div className="landing-reveal landing-reveal-delay relative mx-auto w-full max-w-[39rem]" {...uiTextProps(language)}>
      <div className="landing-chip-float absolute -left-3 top-8 z-10 hidden rounded-2xl border border-white/85 bg-white/88 px-4 py-3 text-sm font-black text-[var(--brand-navy)] shadow-[0_18px_44px_rgb(17_32_59_/_0.11)] backdrop-blur-xl sm:block dark:border-white/10 dark:bg-[#0c1a30]/88 dark:text-[var(--app-text)]">
        голова
      </div>
      <div className="landing-chip-float landing-chip-float-delay absolute -right-1 bottom-20 z-10 hidden rounded-full bg-[var(--brand-lime)] px-4 py-2 text-sm font-black text-[var(--brand-navy)] shadow-[0_18px_44px_rgb(108_143_0_/_0.18)] sm:block">
        +40 {text.xp}
      </div>

      <div className="relative rounded-[2.1rem] border border-white/82 bg-white/78 p-3 shadow-[0_28px_80px_rgb(17_32_59_/_0.14)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0c1a30]/82 sm:p-5">
        <div className="absolute inset-0 rounded-[2.1rem] bg-[radial-gradient(circle_at_12%_10%,rgb(87_212_232_/_0.24),transparent_28%),radial-gradient(circle_at_86%_2%,rgb(183_229_49_/_0.2),transparent_24%),radial-gradient(circle_at_90%_88%,rgb(20_184_166_/_0.17),transparent_30%)]" />
        <div className="relative overflow-hidden rounded-[1.65rem] border border-[var(--app-border)] bg-[linear-gradient(145deg,rgb(248_251_255_/_0.96),rgb(255_255_255_/_0.86))] p-4 dark:bg-[linear-gradient(145deg,rgb(8_19_35_/_0.96),rgb(12_26_48_/_0.86))] sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase text-[var(--app-text-faint)]">
                YazkUp
              </p>
              <h2 className="mt-1 text-xl font-black text-[var(--brand-navy)] dark:text-[var(--app-text)]">
                {text.basics}
              </h2>
            </div>
            <ProgressRing />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[0.92fr_1.08fr]">
            <div className="landing-float rounded-[1.35rem] border border-[var(--app-border)] bg-white/92 p-4 shadow-[0_18px_42px_rgb(17_32_59_/_0.09)] dark:bg-white/5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-sm font-black text-[var(--app-text)]">
                  {text.bodyParts}
                </span>
                <span className="rounded-full bg-[var(--app-primary-soft)] px-2 py-1 text-xs font-black text-[var(--app-primary-strong)]">
                  RU
                </span>
              </div>
              <div className="grid grid-cols-[0.72fr_1fr] items-center gap-2">
                <div className="relative grid h-32 place-items-center overflow-hidden rounded-3xl bg-[linear-gradient(180deg,rgb(225_244_249_/_0.86),rgb(255_255_255_/_0.72))] dark:bg-[linear-gradient(180deg,rgb(16_34_61_/_0.88),rgb(8_19_35_/_0.72))]">
                  <Image
                    src="/lessons/body-parts/head-face.png"
                    alt=""
                    width={116}
                    height={116}
                    className="h-24 w-auto object-contain drop-shadow-[0_16px_22px_rgb(17_32_59_/_0.14)]"
                  />
                </div>
                <div className="relative grid h-32 place-items-center overflow-hidden rounded-3xl bg-[linear-gradient(180deg,rgb(241_248_252_/_0.94),rgb(255_255_255_/_0.76))] dark:bg-[linear-gradient(180deg,rgb(16_34_61_/_0.88),rgb(8_19_35_/_0.72))]">
                  <Image
                    src="/lessons/body-parts/front-body.png"
                    alt=""
                    width={118}
                    height={132}
                    className="h-full w-auto object-contain drop-shadow-[0_18px_26px_rgb(17_32_59_/_0.16)]"
                  />
                  <span className="absolute right-1 top-4 rounded-full bg-white px-2 py-1 text-xs font-black text-[var(--brand-navy)] shadow-md dark:bg-[#10223d] dark:text-[var(--app-text)]">
                    нос
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="landing-float-slow rounded-[1.35rem] border border-[var(--app-border)] bg-white/92 p-4 shadow-[0_18px_42px_rgb(17_32_59_/_0.09)] dark:bg-white/5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-black text-[var(--app-text)]">
                    {text.typingLabel}
                  </span>
                  <span className="text-xs font-black text-[var(--app-text-faint)]">
                    02:15
                  </span>
                </div>
                <div className="mt-4 rounded-2xl bg-[var(--app-surface-muted)] p-3">
                  <p className="text-2xl font-black text-[var(--brand-navy)] dark:text-[var(--app-text)]">
                    рука
                  </p>
                  <div className="mt-3 flex gap-1.5">
                    {["р", "у", "к", "а"].map((letter) => (
                      <span
                        key={letter}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-black text-[var(--brand-navy)] shadow-sm dark:bg-[#10223d] dark:text-[var(--app-text)]"
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.35rem] border border-[var(--app-border)] bg-white/92 p-4 shadow-[0_18px_42px_rgb(17_32_59_/_0.09)] dark:bg-white/5">
                <div className="flex items-center justify-between text-sm font-black">
                  <span>{text.progress}</span>
                  <span className="text-[var(--app-primary-strong)]">68%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--app-surface-muted)]">
                  <div className="landing-progress-fill h-full rounded-full bg-gradient-to-r from-[var(--brand-teal)] via-[var(--brand-cyan)] to-[var(--brand-lime)]" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {russianChips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-1.5 text-xs font-black text-[var(--app-text-soft)]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
  return (
    <article
      className="landing-feature-card group min-w-0 rounded-[1.35rem] border border-white/78 bg-white/82 p-4 shadow-[0_18px_48px_rgb(17_32_59_/_0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_24px_56px_rgb(17_32_59_/_0.12)] dark:border-white/10 dark:bg-white/5"
      {...uiTextProps(language)}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <FeatureVisual type={feature.visual} />
      <h3 className="mt-4 text-lg font-black text-[var(--brand-navy)] dark:text-[var(--app-text)]">
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
          {["голова", "рука", "нос"].map((word, wordIndex) => (
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
          <div className="mt-3 text-sm font-black">нос</div>
          <div className="mt-5 h-7 rounded-full bg-white/15" />
        </div>
      </div>
    </div>
  );
}
