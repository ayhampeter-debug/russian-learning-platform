"use client";

import { Navigation } from "@/components/Navigation";
import { useExplanationLanguage } from "@/components/LanguageSelector";
import { worldOne, worlds } from "@/lib/learning-data";
import {
  getUiText,
  localizeLessonDescription,
  localizeLessonTitle,
  localizeWorldDescription,
  uiTextProps,
  type UiText,
} from "@/lib/ui-translations";
import type { ExplanationLanguage } from "@/lib/language-preference";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import type { ReactNode } from "react";

type Tone = "cyan" | "yellow" | "red" | "green" | "violet";

const worldTwo = worlds.find((world) => world.number === 2);

export default function Home() {
  const { language } = useExplanationLanguage();
  const text = getUiText(language);
  const { isSignedIn } = useUser();
  const userId = isSignedIn ? "signed-in" : null;
  const startHref = userId ? "/dashboard" : "/signup";
  const explanationLanguage =
    language === "ar"
      ? text.common.explanationLanguageValueArabic
      : text.common.explanationLanguageValueEnglish;
  const heroStats = [
    { label: text.home.firstCourseLive, value: text.lesson.russian },
    { label: text.home.availableWorlds, value: worldTwo ? "2" : "1" },
    { label: text.home.starterXpPath, value: `${worldOne.xp}` },
  ];
  const features: Array<{
    title: string;
    text: string;
    badge: string;
    tone: Tone;
  }> = [
    {
      title: text.home.questLessons,
      text: text.home.questLessonsText,
      badge: "Q",
      tone: "cyan",
    },
    {
      title: text.home.xpTracking,
      text: text.home.xpTrackingText,
      badge: "XP",
      tone: "yellow",
    },
    {
      title: text.home.bossChallenges,
      text: text.home.bossChallengesText,
      badge: "B",
      tone: "red",
    },
    {
      title: text.home.savedProgress,
      text: text.home.savedProgressText,
      badge: "OK",
      tone: "green",
    },
  ];
  const howItWorks = [
    {
      step: "1",
      title: text.home.chooseWorld,
      text: text.home.chooseWorldText,
    },
    {
      step: "2",
      title: text.home.completeShortLessons,
      text: text.home.completeShortLessonsText,
    },
    {
      step: "3",
      title: text.home.levelUp,
      text: text.home.levelUpText,
    },
    {
      step: "4",
      title: text.home.defeatBossChallenges,
      text: text.home.defeatBossChallengesText,
    },
  ];
  const courseHighlights = [
    text.home.beginnerFriendly,
    text.home.guidedMode,
    text.home.worldsAvailable,
    text.home.moreLanguagesLater,
  ];
  const productHighlights = [
    text.home.dailyPractice,
    text.home.shortLessons,
    text.home.progressSavedAccount,
    text.home.guestModeAvailable,
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <Navigation />

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:pb-20">
        <div className="min-w-0">
          <p className="inline-flex max-w-full rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200" {...uiTextProps(language)}>
            {text.home.eyebrow}
          </p>

          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl" {...uiTextProps(language)}>
            {text.home.title}
          </h1>

          <div className="mt-6 max-w-2xl space-y-3 text-base leading-8 text-slate-300 sm:text-lg" {...uiTextProps(language)}>
            <p>{text.home.tagline}</p>
            <p>{text.home.guided}</p>
            <p className="font-semibold text-cyan-200">
              {text.home.startToday}
            </p>
            <p className="text-sm font-semibold text-slate-400">
              {text.home.currentCourse}: {text.lesson.russian} · {text.home.explanationLanguage}: {explanationLanguage}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={startHref}
              className="w-full rounded-full bg-cyan-400 px-7 py-3 text-center font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-300 sm:w-auto"
            >
              {userId ? text.home.continueLearning : text.home.createFreeAccount}
            </Link>
            <Link
              href="/courses"
              className="w-full rounded-full border border-white/20 bg-white/10 px-7 py-3 text-center font-bold text-white transition hover:bg-white/15 sm:w-auto"
            >
              {text.home.exploreCourses}
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-white/10 bg-white/10 px-4 py-3"
              >
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <ProductPreview text={text} language={language} />
      </section>

      <section className="border-y border-cyan-400/10 bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <SectionHeading
            eyebrow={text.home.whyYazkUp}
            title={text.home.gameLoopTitle}
            text={text.home.gameLoopText}
            language={language}
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <SectionHeading
          eyebrow={text.home.howItWorks}
          title={text.home.howTitle}
          text={text.home.howText}
          language={language}
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((item) => (
            <StepCard key={item.step} {...item} />
          ))}
        </div>
      </section>

      <section className="bg-slate-900/60">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:py-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
              {text.home.currentCourse}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {text.home.russianLive}
            </h2>
            <p className="mt-4 leading-7 text-slate-400">
              {text.home.courseText}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {courseHighlights.map((highlight) => (
              <HighlightCard key={highlight} text={highlight} tone="cyan" />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
              {text.home.productHighlights}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {text.home.honestTools}
            </h2>
            <p className="mt-4 leading-7 text-slate-400">
              {text.home.honestToolsText}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {productHighlights.map((highlight, index) => (
              <HighlightCard
                key={highlight}
                text={highlight}
                tone={index % 2 === 0 ? "green" : "yellow"}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:pb-20">
        <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-5 sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-200">
              {text.home.ready}
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
              {text.home.beginWorldOne}
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-300">
              {text.home.startLiveCourse}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
            <Link
              href={startHref}
              className="w-full rounded-full bg-cyan-400 px-7 py-3 text-center font-bold text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
            >
              {userId ? text.home.continueLearning : text.home.createFreeAccount}
            </Link>
            <Link
              href="/courses"
              className="w-full rounded-full border border-white/20 px-7 py-3 text-center font-bold text-white transition hover:bg-white/10 sm:w-auto"
            >
              {text.home.exploreCourses}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProductPreview({
  text,
  language,
}: {
  text: UiText;
  language: ExplanationLanguage;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur sm:p-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-300" {...uiTextProps(language)}>{text.home.liveCourse}</p>
          <h2 className="mt-1 text-2xl font-black" {...uiTextProps(language)}>{text.home.russianFirstContact}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400" {...uiTextProps(language)}>
            {text.home.beginnerGuided}
          </p>
        </div>
        <span className="w-fit rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950">
          {worldOne.xp} XP
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between gap-3 text-sm text-slate-400">
          <span {...uiTextProps(language)}>{text.home.worldProgressPreview}</span>
          <span>{worldOne.progressPercent}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-cyan-400"
            style={{ width: `${worldOne.progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {worldOne.lessons.slice(0, 3).map((lesson) => (
          <LessonPreview
            key={lesson.id}
            number={lesson.number}
            title={localizeLessonTitle(lesson.title, language)}
            description={localizeLessonDescription(lesson.description, language)}
            locked={lesson.locked}
            language={language}
          />
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-violet-400/25 bg-violet-400/10 p-4">
        <p className="text-sm font-semibold text-violet-200" {...uiTextProps(language)}>{text.home.bossChallenge}</p>
        <p className="mt-1 text-lg font-bold" {...uiTextProps(language)}>
          {localizeWorldDescription(worldOne.bossDescription, language)}
        </p>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
  language,
}: {
  eyebrow: string;
  title: string;
  text: string;
  language: ExplanationLanguage;
}) {
  return (
    <div className="max-w-3xl" {...uiTextProps(language)}>
      <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 leading-7 text-slate-400">{text}</p>
    </div>
  );
}

function FeatureCard({
  title,
  text,
  badge,
  tone,
}: {
  title: string;
  text: string;
  badge: string;
  tone: Tone;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-5">
      <Badge tone={tone}>{badge}</Badge>
      <h3 className="mt-5 text-lg font-bold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  text,
}: {
  step: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-5">
      <Badge tone="cyan">{step}</Badge>
      <h3 className="mt-5 text-xl font-bold">{title}</h3>
      <p className="mt-3 leading-7 text-slate-300">{text}</p>
    </div>
  );
}

function HighlightCard({ text, tone }: { text: string; tone: Tone }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/10 p-4">
      <Badge tone={tone}>OK</Badge>
      <p className="font-semibold text-white">{text}</p>
    </div>
  );
}

function Badge({ children, tone }: { children: ReactNode; tone: Tone }) {
  const toneClass = {
    cyan: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
    yellow: "border-yellow-400/30 bg-yellow-400/10 text-yellow-200",
    red: "border-red-400/30 bg-red-400/10 text-red-200",
    green: "border-green-400/30 bg-green-400/10 text-green-200",
    violet: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  }[tone];

  return (
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border text-sm font-black ${toneClass}`}
    >
      {children}
    </span>
  );
}

function LessonPreview({
  number,
  title,
  description,
  locked = false,
  language,
}: {
  number: string;
  title: string;
  description: string;
  locked?: boolean;
  language: ExplanationLanguage;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 ${
        locked
          ? "border-white/5 bg-slate-900/50 text-slate-400"
          : "border-white/10 bg-slate-900/80"
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-400 font-black text-slate-950">
        {locked ? "L" : number}
      </span>
      <div className="min-w-0">
        <h3 className="font-bold" {...uiTextProps(language)}>{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400" {...uiTextProps(language)}>
          {description}
        </p>
      </div>
    </div>
  );
}
