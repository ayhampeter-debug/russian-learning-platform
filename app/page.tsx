import { Navigation } from "@/components/Navigation";
import { worldOne, worlds } from "@/lib/learning-data";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import type { ReactNode } from "react";

type Tone = "cyan" | "yellow" | "red" | "green" | "violet";

const worldTwo = worlds.find((world) => world.number === 2);

const heroStats = [
  { label: "First course live", value: "Russian" },
  { label: "Available worlds", value: worldTwo ? "2" : "1" },
  { label: "Starter XP path", value: `${worldOne.xp}` },
];

const features: Array<{
  title: string;
  text: string;
  badge: string;
  tone: Tone;
}> = [
  {
    title: "Quest-based lessons",
    text: "Move through focused lessons that feel like a path, not a worksheet.",
    badge: "Q",
    tone: "cyan",
  },
  {
    title: "XP and progress tracking",
    text: "Earn XP, see what is complete, and always know what to do next.",
    badge: "XP",
    tone: "yellow",
  },
  {
    title: "Boss challenges",
    text: "Checkpoint challenges test whether you can use what you learned.",
    badge: "B",
    tone: "red",
  },
  {
    title: "Saved progress anywhere",
    text: "Practice as a guest or sign in to keep progress synced to your account.",
    badge: "OK",
    tone: "green",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Choose a world",
    text: "Start with a themed path that groups lessons into clear goals.",
  },
  {
    step: "2",
    title: "Complete short lessons",
    text: "Practice vocabulary, choices, matching, sentence order, and scenarios.",
  },
  {
    step: "3",
    title: "Level up and unlock challenges",
    text: "Build XP, save progress, and open boss gates as you advance.",
  },
];

const courseHighlights = [
  "Beginner-friendly Russian",
  "English or Arabic explanations",
  "World 1 and World 2 available",
  "Built to support more languages later",
];

const productHighlights = [
  "Built for daily practice",
  "Short lessons",
  "Progress saved with account",
  "Guest mode available",
];

export default async function Home() {
  const { userId } = await auth();
  const startHref = userId ? "/dashboard" : "/signup";

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <Navigation />

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:pb-20">
        <div className="min-w-0">
          <p className="inline-flex max-w-full rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200">
            Gamified language learning for daily momentum
          </p>

          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            YazkUp helps you level up languages through quests.
          </h1>

          <div className="mt-6 max-w-2xl space-y-3 text-base leading-8 text-slate-300 sm:text-lg">
            <p>Learn languages through quests, levels, XP, and daily progress.</p>
            <p>Learn Russian with English or Arabic explanations.</p>
            <p className="font-semibold text-cyan-200">
              Start with the first live course today.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={startHref}
              className="w-full rounded-full bg-cyan-400 px-7 py-3 text-center font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-300 sm:w-auto"
            >
              {userId ? "Continue Learning" : "Create Free Account"}
            </Link>
            <Link
              href="/worlds"
              className="w-full rounded-full border border-white/20 bg-white/10 px-7 py-3 text-center font-bold text-white transition hover:bg-white/15 sm:w-auto"
            >
              Explore Worlds
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

        <ProductPreview />
      </section>

      <section className="border-y border-cyan-400/10 bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <SectionHeading
            eyebrow="Why YazkUp"
            title="Language practice with a clear game loop"
            text="YazkUp turns small daily sessions into visible progress, world unlocks, and checkpoints that make practice easier to return to."
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
          eyebrow="How it works"
          title="Pick a path, practice, then unlock the next challenge"
          text="The first course is organized into short worlds and lessons, so a new learner can start quickly without guessing where to go."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {howItWorks.map((item) => (
            <StepCard key={item.step} {...item} />
          ))}
        </div>
      </section>

      <section className="bg-slate-900/60">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:py-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
              Current course
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Russian is live now. More languages can come later.
            </h2>
            <p className="mt-4 leading-7 text-slate-400">
              YazkUp is designed as a language learning platform that can grow
              beyond the first course. The current path gives beginners an
              English- or Arabic-guided route through practical basics in World 1 and
              World 2.
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
              Product highlights
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Honest tools for steady practice
            </h2>
            <p className="mt-4 leading-7 text-slate-400">
              No inflated promises or fake testimonials. YazkUp focuses on
              concise lessons, saved progress, and a friendly game structure
              that helps learners keep going.
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
              Ready to start?
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
              Begin with World 1 and build your first Russian phrases.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-300">
              Start the live Russian course, explore the worlds, or continue
              from your dashboard when you are signed in.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
            <Link
              href={startHref}
              className="w-full rounded-full bg-cyan-400 px-7 py-3 text-center font-bold text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
            >
              {userId ? "Continue Learning" : "Create Free Account"}
            </Link>
            <Link
              href="/worlds"
              className="w-full rounded-full border border-white/20 px-7 py-3 text-center font-bold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Explore Worlds
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProductPreview() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur sm:p-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-300">Live course</p>
          <h2 className="mt-1 text-2xl font-black">Russian: First Contact</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Beginner-friendly lessons guided in English or Arabic.
          </p>
        </div>
        <span className="w-fit rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950">
          {worldOne.xp} XP
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between gap-3 text-sm text-slate-400">
          <span>World progress preview</span>
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
            title={lesson.title}
            description={lesson.description}
            locked={lesson.locked}
          />
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-violet-400/25 bg-violet-400/10 p-4">
        <p className="text-sm font-semibold text-violet-200">Boss challenge</p>
        <p className="mt-1 text-lg font-bold">{worldOne.bossDescription}</p>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="max-w-3xl">
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
}: {
  number: string;
  title: string;
  description: string;
  locked?: boolean;
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
        <h3 className="font-bold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
      </div>
    </div>
  );
}
