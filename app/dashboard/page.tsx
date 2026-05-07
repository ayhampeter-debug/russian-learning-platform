import { Navigation } from "@/components/Navigation";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-cyan-300">Welcome back</p>
            <h1 className="mt-2 text-4xl font-bold">Your Russian Journey</h1>
            <p className="mt-3 text-slate-400">
              Continue your progress through short lessons, XP rewards, and daily challenges.
            </p>
          </div>

          <Link
            href="/lesson"
            className="rounded-full bg-cyan-400 px-6 py-3 text-center font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Continue Learning
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <StatCard title="Total XP" value="240" icon="⚡" />
          <StatCard title="Current Streak" value="3 days" icon="🔥" />
          <StatCard title="Hearts" value="5" icon="❤️" />
          <StatCard title="Achievements" value="2" icon="🏆" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Current world</p>
                <h2 className="text-2xl font-bold">World 1: First Contact</h2>
              </div>
              <span className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-950">
                Level 1
              </span>
            </div>

            <div className="mb-3 flex justify-between text-sm text-slate-400">
              <span>Progress</span>
              <span>40%</span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-2/5 rounded-full bg-cyan-400" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <LessonMiniCard title="Say Hello" status="Completed" />
              <LessonMiniCard title="Introduce Yourself" status="Unlocked" />
              <LessonMiniCard title="Basic Questions" status="Locked" locked />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
            <p className="text-sm text-slate-400">Daily Challenge</p>
            <h2 className="mt-2 text-2xl font-bold">5 quick questions</h2>
            <p className="mt-3 text-slate-300">
              Review greetings and basic Russian phrases to keep your streak alive.
            </p>

            <Link
              href="/challenge"
              className="mt-6 block w-full rounded-full bg-white px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Start Challenge
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
      <div className="text-3xl">{icon}</div>
      <p className="mt-4 text-sm text-slate-400">{title}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

function LessonMiniCard({
  title,
  status,
  locked = false,
}: {
  title: string;
  status: string;
  locked?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        locked
          ? "border-white/5 bg-slate-900/40 opacity-50"
          : "border-white/10 bg-slate-900/70"
      }`}
    >
      <p className="font-semibold">{locked ? "🔒 " : ""}{title}</p>
      <p className="mt-2 text-sm text-slate-400">{status}</p>
    </div>
  );
}
