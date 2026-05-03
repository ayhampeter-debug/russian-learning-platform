export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="text-xl font-bold">
          RusQuest
        </div>

        <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-white">
            How it works
          </a>
          <a href="#worlds" className="hover:text-white">
            Worlds
          </a>
        </div>

        <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
          Start Learning
        </button>
      </nav>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
            Gamified Russian for English speakers
          </div>

          <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Learn Russian through levels, mini-games, and daily progress.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            A modern game-like platform that helps beginners learn practical
            Russian step by step through short lessons, XP, streaks, challenges,
            and real-life situations.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button className="rounded-full bg-cyan-400 px-7 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
              Start World 1
            </button>

            <button className="rounded-full border border-white/20 px-7 py-3 font-semibold text-white transition hover:bg-white/10">
              View Demo
            </button>
          </div>

          <div className="mt-8 flex gap-6 text-sm text-slate-400">
            <span>⚡ XP rewards</span>
            <span>🔥 Daily streak</span>
            <span>🏆 Achievements</span>
          </div>
        </div>

        {/* Game Card */}
        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">World 1</p>
              <h2 className="text-2xl font-bold">First Contact</h2>
            </div>

            <div className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-950">
              240 XP
            </div>
          </div>

          <div className="mb-6 h-3 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-2/5 rounded-full bg-cyan-400" />
          </div>

          <div className="space-y-4">
            <LessonCard
              number="1"
              title="Say Hello"
              description="Привет, Здравствуйте, Пока"
              status="Completed"
            />
            <LessonCard
              number="2"
              title="Introduce Yourself"
              description="Меня зовут..., Я..."
              status="Unlocked"
            />
            <LessonCard
              number="3"
              title="Basic Questions"
              description="Что? Кто? Где?"
              status="Locked"
              locked
            />
          </div>

          <div className="mt-6 rounded-2xl bg-slate-900/80 p-4">
            <p className="text-sm text-slate-400">Next challenge</p>
            <p className="mt-1 font-semibold">Boss Level: First Conversation</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold">Built like a learning game</h2>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon="🎮"
            title="Mini-games"
            text="Practice Russian through matching, choices, ordering, and quick challenges."
          />
          <FeatureCard
            icon="🗺️"
            title="World progression"
            text="Move through worlds, stages, and short lessons with clear goals."
          />
          <FeatureCard
            icon="🔥"
            title="Daily motivation"
            text="Earn XP, keep your streak, unlock achievements, and return every day."
          />
        </div>
      </section>
    </main>
  );
}

function LessonCard({
  number,
  title,
  description,
  status,
  locked = false,
}: {
  number: string;
  title: string;
  description: string;
  status: string;
  locked?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border p-4 ${
        locked
          ? "border-white/5 bg-slate-900/50 opacity-50"
          : "border-white/10 bg-slate-900/80"
      }`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400 font-bold text-slate-950">
        {locked ? "🔒" : number}
      </div>

      <div className="flex-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>

      <span className="text-xs text-slate-400">{status}</span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-4 text-xl font-bold">{title}</h3>
      <p className="mt-3 leading-7 text-slate-300">{text}</p>
    </div>
  );
}