import { Navigation } from "@/components/Navigation";
import { worldOne } from "@/lib/learning-data";
import Link from "next/link";

type FeatureTone = "cyan" | "yellow" | "red" | "green" | "violet";

const heroStats = [
  { label: "World 1 XP", value: `${worldOne.xp}` },
  { label: "Short lessons", value: `${worldOne.lessons.length}` },
  { label: "Game stages", value: `${worldOne.stages.length}` },
];

const howItWorks = [
  {
    step: "01",
    title: "Start the current course",
    text: "Begin with Russian, guided in English with practical phrases introduced in short, focused chunks.",
  },
  {
    step: "02",
    title: "Clear mini-games",
    text: "Practice with matching, multiple choice, sentence ordering, fill-in-the-blank, and real situation prompts.",
  },
  {
    step: "03",
    title: "Unlock the next stage",
    text: "Earn XP, keep your streak alive, and open new stages as your daily progress builds.",
  },
];

const gameFeatures: Array<{
  title: string;
  text: string;
  badge: string;
  tone: FeatureTone;
}> = [
  {
    title: "XP",
    text: "Earn points for lessons and challenges so every practice session feels measurable.",
    badge: "XP",
    tone: "cyan",
  },
  {
    title: "Streak",
    text: "Build a daily habit with quick sessions designed to be easy to return to.",
    badge: "7D",
    tone: "red",
  },
  {
    title: "Hearts",
    text: "Practice under light pressure and learn from mistakes without losing momentum.",
    badge: "HP",
    tone: "green",
  },
  {
    title: "Achievements",
    text: "Unlock badges as you finish lessons, complete challenges, and reach milestones.",
    badge: "AW",
    tone: "yellow",
  },
  {
    title: "Boss levels",
    text: "Prove you can use what you learned in bigger checkpoint challenges.",
    badge: "BOSS",
    tone: "violet",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <Navigation />

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:gap-14 lg:pb-24">
        <div>
          <p className="inline-flex max-w-full rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200">
            YazkUp is a gamified language learning platform
          </p>

          <h1 className="mt-6 max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Level up your language skills through quests, XP, worlds, and daily
            progress.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Current course: Russian. Start with bite-size lessons, pronunciation
            practice, boss challenges, and game-style progress through World 1:
            First Contact. Future courses can expand the same quest system to
            more languages.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="w-full rounded-full bg-cyan-400 px-7 py-3 text-center font-bold text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
            >
              Create Account
            </Link>
            <Link
              href="/dashboard"
              className="w-full rounded-full border border-cyan-300/40 bg-cyan-400/10 px-7 py-3 text-center font-bold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-400/20 sm:w-auto"
            >
              Start Learning
            </Link>
            <Link
              href="/worlds"
              className="w-full rounded-full border border-white/20 px-7 py-3 text-center font-bold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Explore Worlds
            </Link>
            <Link
              href="/login"
              className="w-full rounded-full border border-white/20 px-7 py-3 text-center font-bold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Login
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

        <WorldPreview />
      </section>

      <section className="border-y border-white/10 bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <SectionHeading
            eyebrow="How it works"
            title="A lesson path that feels like a game"
            text="Move from guided practice to confident recall through fast, repeatable language quests."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {howItWorks.map((item) => (
              <StepCard key={item.step} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <SectionHeading
          eyebrow="Current course: Russian"
          title="What you will learn in First Contact"
          text="World 1 focuses on the survival phrases a new Russian learner needs first."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {worldOne.stages.map((stage) => (
            <StagePreview
              key={stage.id}
              number={stage.number}
              title={stage.title}
              description={stage.description}
              xp={stage.xp}
              boss={stage.boss}
            />
          ))}
        </div>
      </section>

      <section className="bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <SectionHeading
            eyebrow="Game features"
            title="Progress systems that keep practice moving"
            text="XP, streaks, hearts, achievements, and boss levels make the learning loop visible."
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {gameFeatures.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-5 sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-200">
              Ready for your first language quest?
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
              Start World 1 and learn your first useful phrases today.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-300">
              Begin with Saying Hello, then unlock greetings, introductions,
              survival phrases, question words, numbers, and the first boss
              challenge.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
            <Link
              href="/signup"
              className="w-full rounded-full bg-cyan-400 px-7 py-3 text-center font-bold text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
            >
              Create Account
            </Link>
            <Link
              href="/lesson/saying-hello"
              className="w-full rounded-full border border-white/20 px-7 py-3 text-center font-bold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Try a Lesson
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function WorldPreview() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur sm:p-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-300">World 1</p>
          <h2 className="mt-1 text-2xl font-black">{worldOne.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Current course: Russian basics for real first conversations.
          </p>
        </div>
        <span className="w-fit rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950">
          {worldOne.xp} XP
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm text-slate-400">
          <span>Starter path</span>
          <span>{worldOne.progressPercent}% preview</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-cyan-400"
            style={{ width: `${worldOne.progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {worldOne.lessons.slice(0, 4).map((lesson) => (
          <LessonCard
            key={lesson.id}
            number={lesson.number}
            title={lesson.title}
            description={lesson.description}
            locked={lesson.locked}
          />
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-yellow-400/20 bg-yellow-400/10 p-4">
        <p className="text-sm font-semibold text-yellow-200">Boss checkpoint</p>
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
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-400 font-black text-slate-950">
        {step}
      </span>
      <h3 className="mt-5 text-xl font-bold">{title}</h3>
      <p className="mt-3 leading-7 text-slate-300">{text}</p>
    </div>
  );
}

function StagePreview({
  number,
  title,
  description,
  xp,
  boss = false,
}: {
  number: string;
  title: string;
  description: string;
  xp: number;
  boss?: boolean;
}) {
  const label = boss ? "Boss" : `Stage ${number}`;

  return (
    <div
      className={`rounded-lg border p-5 ${
        boss
          ? "border-yellow-400/30 bg-yellow-400/10"
          : "border-white/10 bg-white/10"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            boss
              ? "bg-yellow-400 text-slate-950"
              : "bg-cyan-400 text-slate-950"
          }`}
        >
          {label}
        </span>
        <span className="text-sm font-semibold text-slate-400">{xp} XP</span>
      </div>
      <h3 className="mt-4 text-xl font-bold">{title}</h3>
      <p className="mt-3 min-h-16 text-sm leading-6 text-slate-400">
        {description}
      </p>
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
  tone: FeatureTone;
}) {
  const toneClass = {
    cyan: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
    yellow: "border-yellow-400/30 bg-yellow-400/10 text-yellow-200",
    red: "border-red-400/30 bg-red-400/10 text-red-200",
    green: "border-green-400/30 bg-green-400/10 text-green-200",
    violet: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  }[tone];

  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-5">
      <span
        className={`inline-flex h-12 min-w-12 items-center justify-center rounded-lg border px-3 text-sm font-black ${toneClass}`}
      >
        {badge}
      </span>
      <h3 className="mt-5 text-lg font-bold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}

function LessonCard({
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
          ? "border-white/5 bg-slate-900/50 opacity-60"
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
