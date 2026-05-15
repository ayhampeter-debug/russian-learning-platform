"use client";

import { Navigation } from "@/components/Navigation";
import { useExplanationLanguage } from "@/components/LanguageSelector";
import { worldOne, worlds } from "@/lib/learning-data";
import { getUiText, uiTextProps, type UiText } from "@/lib/ui-translations";
import type { ExplanationLanguage } from "@/lib/language-preference";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import type { ReactNode } from "react";

type Tone = "teal" | "cyan" | "lime" | "navy";

const worldTwo = worlds.find((world) => world.number === 2);

export default function Home() {
  const { language } = useExplanationLanguage();
  const text = getUiText(language);
  const { isSignedIn } = useUser();
  const startHref = isSignedIn ? "/dashboard" : "/signup";

  const features: Array<{
    title: string;
    text: string;
    badge: string;
    tone: Tone;
  }> = [
    {
      title: text.home.shortLessons,
      text: text.home.questLessonsText,
      badge: "01",
      tone: "teal",
    },
    {
      title: text.home.xpTracking,
      text: text.home.xpTrackingText,
      badge: "XP",
      tone: "lime",
    },
    {
      title: text.home.bossChallenges,
      text: text.home.bossChallengesText,
      badge: "03",
      tone: "cyan",
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
  ];

  const courseHighlights = [
    text.home.beginnerFriendly,
    text.home.guidedMode,
    text.home.worldsAvailable,
    text.home.firstCourseLive,
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--app-text)] [font-family:var(--font-geist-sans),Inter,ui-sans-serif,system-ui,sans-serif]">
      <Navigation />

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-4 sm:px-6 lg:min-h-[calc(100vh-7.5rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24 lg:pt-6">
        <div className="min-w-0">
          <p
            className="inline-flex max-w-full rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-4 py-2 text-sm font-semibold text-[var(--app-primary-strong)] shadow-sm"
            {...uiTextProps(language)}
          >
            {text.home.eyebrow}
          </p>

          <h1
            className="mt-7 max-w-4xl text-5xl font-black leading-[1.04] tracking-tight text-[var(--app-text)] sm:text-6xl lg:text-7xl"
            {...uiTextProps(language)}
          >
            {text.home.title}
          </h1>

          <p
            className="mt-6 max-w-2xl text-lg leading-8 text-[var(--app-text-muted)] sm:text-xl sm:leading-9"
            {...uiTextProps(language)}
          >
            {text.home.tagline}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href={startHref}
              className="w-full rounded-full bg-[var(--primary)] px-7 py-3.5 text-center text-base font-bold text-[var(--primary-foreground)] shadow-lg shadow-cyan-950/20 transition hover:bg-cyan-300 sm:w-auto"
            >
              {text.home.startLearning}
            </Link>
            <Link
              href="/courses"
              className="w-full rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-7 py-3.5 text-center text-base font-bold text-[var(--app-text)] transition hover:border-cyan-400/50 hover:bg-[var(--app-surface-strong)] sm:w-auto"
            >
              {text.home.exploreCourses}
            </Link>
          </div>
        </div>

        <ProductPreview text={text} language={language} />
      </section>

      <section className="border-y border-[var(--app-border-muted)] bg-[var(--app-surface-muted)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <SectionHeading
            eyebrow={text.home.whyYazkUp}
            title={text.home.gameLoopTitle}
            text={text.home.gameLoopText}
            language={language}
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} language={language} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <SectionHeading
          eyebrow={text.home.howItWorks}
          title={text.home.howTitle}
          text={text.home.howText}
          language={language}
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {howItWorks.map((item) => (
            <StepCard key={item.step} {...item} language={language} />
          ))}
        </div>
      </section>

      <section className="bg-[var(--app-surface-muted)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-24">
          <div {...uiTextProps(language)}>
            <p className="text-sm font-semibold text-[var(--app-primary-strong)]">
              {text.home.currentCourse}
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-[var(--app-text)] sm:text-5xl">
              {text.home.russianLive}
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--app-text-muted)]">
              {text.home.courseText}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {courseHighlights.map((highlight) => (
              <HighlightCard
                key={highlight}
                text={highlight}
                tone="teal"
                language={language}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="rounded-[1.75rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-2xl shadow-cyan-950/10 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div {...uiTextProps(language)}>
            <p className="text-sm font-semibold text-[var(--app-primary-strong)]">
              {text.home.ready}
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-[var(--app-text)] sm:text-5xl">
              {text.home.beginWorldOne}
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--app-text-muted)]">
              {text.home.startLiveCourse}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
            <Link
              href={startHref}
              className="w-full rounded-full bg-[var(--primary)] px-7 py-3.5 text-center font-bold text-[var(--primary-foreground)] transition hover:bg-cyan-300 sm:w-auto"
            >
              {text.home.startLearning}
            </Link>
            <Link
              href="/courses"
              className="w-full rounded-full border border-[var(--app-border)] px-7 py-3.5 text-center font-bold text-[var(--app-text)] transition hover:bg-[var(--app-surface-strong)] sm:w-auto"
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
    <div className="relative mx-auto w-full max-w-lg rounded-[2rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-2xl shadow-cyan-950/15 sm:p-6">
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--app-secondary-soft)] blur-2xl"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--app-border-muted)] pb-5">
          <div {...uiTextProps(language)}>
            <p className="text-sm font-semibold text-[var(--app-primary-strong)]">
              {text.home.liveCourse}
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--app-text)]">
              {text.home.russianFirstContact}
            </h2>
          </div>
          <span className="rounded-full bg-[var(--app-xp-soft)] px-3 py-1.5 text-sm font-black text-[var(--app-xp)]">
            {worldOne.xp} XP
          </span>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex justify-between gap-3 text-sm font-semibold text-[var(--app-text-muted)]">
            <span {...uiTextProps(language)}>{text.home.worldProgressPreview}</span>
            <span>{worldOne.progressPercent}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[var(--app-surface-muted)]">
            <div
              className="h-full rounded-full bg-[var(--primary)]"
              style={{ width: `${worldOne.progressPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <PreviewPill
            label={text.home.currentCourse}
            value={text.lesson.russian}
            language={language}
          />
          <PreviewPill
            label={text.home.availableWorlds}
            value={worldTwo ? text.home.worldOneTwo : text.home.worldOneOnly}
            language={language}
          />
        </div>

        <div
          className="mt-5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4"
          {...uiTextProps(language)}
        >
          <p className="text-sm font-semibold text-[var(--app-text-muted)]">
            {text.home.nextQuest}
          </p>
          <p className="mt-1 text-lg font-black text-[var(--app-text)]">
            {text.home.completeShortLessons}
          </p>
        </div>
      </div>
    </div>
  );
}

function PreviewPill({
  label,
  value,
  language,
}: {
  label: string;
  value: string;
  language: ExplanationLanguage;
}) {
  return (
    <div
      className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4"
      {...uiTextProps(language)}
    >
      <p className="text-xs font-semibold text-[var(--app-text-faint)]">{label}</p>
      <p className="mt-1 text-base font-black text-[var(--app-text)]">{value}</p>
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
      <p className="text-sm font-semibold text-[var(--app-primary-strong)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-[var(--app-text)] sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--app-text-muted)]">
        {text}
      </p>
    </div>
  );
}

function FeatureCard({
  title,
  text,
  badge,
  tone,
  language,
}: {
  title: string;
  text: string;
  badge: string;
  tone: Tone;
  language: ExplanationLanguage;
}) {
  return (
    <div
      className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm"
      {...uiTextProps(language)}
    >
      <Badge tone={tone}>{badge}</Badge>
      <h3 className="mt-6 text-xl font-black tracking-tight text-[var(--app-text)]">
        {title}
      </h3>
      <p className="mt-3 text-base leading-7 text-[var(--app-text-muted)]">
        {text}
      </p>
    </div>
  );
}

function StepCard({
  step,
  title,
  text,
  language,
}: {
  step: string;
  title: string;
  text: string;
  language: ExplanationLanguage;
}) {
  return (
    <div
      className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6"
      {...uiTextProps(language)}
    >
      <Badge tone="navy">{step}</Badge>
      <h3 className="mt-6 text-xl font-black tracking-tight text-[var(--app-text)]">
        {title}
      </h3>
      <p className="mt-3 leading-7 text-[var(--app-text-muted)]">{text}</p>
    </div>
  );
}

function HighlightCard({
  text,
  tone,
  language,
}: {
  text: string;
  tone: Tone;
  language: ExplanationLanguage;
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5"
      {...uiTextProps(language)}
    >
      <Badge tone={tone}>✓</Badge>
      <p className="text-base font-bold leading-6 text-[var(--app-text)]">{text}</p>
    </div>
  );
}

function Badge({ children, tone }: { children: ReactNode; tone: Tone }) {
  const toneClass = {
    teal: "border-[rgb(20_184_166_/_0.3)] bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]",
    cyan: "border-[rgb(87_212_232_/_0.3)] bg-[var(--app-secondary-soft)] text-[var(--app-primary-strong)]",
    lime: "border-[rgb(183_229_49_/_0.4)] bg-[var(--app-xp-soft)] text-[var(--app-xp)]",
    navy: "border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-text)]",
  }[tone];

  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-sm font-black ${toneClass}`}
    >
      {children}
    </span>
  );
}
