import { Navigation } from "@/components/Navigation";
import {
  achievements,
  profileStats,
  recentActivity,
  userProgress,
  worldOne,
  type Achievement,
  type ProfileStat,
  type RecentActivity,
} from "@/lib/learning-data";
import Link from "next/link";

type StatCardProps = ProfileStat;

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Player profile
            </p>
            <h1 className="mt-3 text-4xl font-black md:text-6xl">
              {userProgress.userName}
            </h1>
            <p className="mt-4 max-w-2xl text-slate-400">
              Track your Russian journey through XP, streaks, achievements, and
              World 1 progress.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex w-fit justify-center rounded-full bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {profileStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-3xl border border-cyan-400/20 bg-white/10 p-6 shadow-2xl shadow-cyan-950/30 md:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-sm text-slate-400">World 1 progress</p>
                <h2 className="mt-2 text-3xl font-black">{worldOne.title}</h2>
                <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                  Greetings, introductions, survival phrases, basic questions,
                  and the first conversation challenge.
                </p>
              </div>

              <span className="w-fit rounded-full bg-yellow-400 px-5 py-2 text-sm font-black text-slate-950">
                {userProgress.currentWorldProgressPercent}% Complete
              </span>
            </div>

            <div className="mt-8">
              <div className="mb-3 flex justify-between text-sm text-slate-400">
                <span>
                  {userProgress.clearedSteps} of {userProgress.totalSteps} steps cleared
                </span>
                <span>{userProgress.profileWorldXp} XP earned</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{ width: `${userProgress.currentWorldProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <WorldStep title="Say Hello" status="Completed" tone="done" />
              <WorldStep
                title="Introduce Yourself"
                status="In progress"
                tone="active"
              />
              <WorldStep title="Boss Level" status="Locked" tone="locked" />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 md:p-8">
            <p className="text-sm text-slate-400">Learning identity</p>
            <div className="mt-5 flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-cyan-400/30 bg-cyan-400 text-3xl font-black text-slate-950">
                {userProgress.initials}
              </div>
              <div>
                <h2 className="text-2xl font-black">{userProgress.userName}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Beginner path: English speaker learning practical Russian.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Next goal</p>
              <p className="mt-2 text-xl font-bold">
                {userProgress.nextGoalTitle}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {userProgress.nextGoalDescription}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/10 p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Trophy shelf</p>
                <h2 className="mt-2 text-2xl font-black">Achievements</h2>
              </div>
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-300">
                {userProgress.achievementsEarned.length} unlocked
              </span>
            </div>

            <div className="grid gap-4">
              {achievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/10 p-6 md:p-8">
            <div className="mb-6">
              <p className="text-sm text-slate-400">Quest log</p>
              <h2 className="mt-2 text-2xl font-black">Recent Activity</h2>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <ActivityItem key={`${activity.title}-${activity.time}`} activity={activity} />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function StatCard({ title, value, accent }: StatCardProps) {
  const accentClass = {
    cyan: "text-cyan-300",
    yellow: "text-yellow-300",
    red: "text-red-300",
    green: "text-green-300",
  }[accent];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className={`mt-3 text-3xl font-black ${accentClass}`}>{value}</p>
    </div>
  );
}

function WorldStep({
  title,
  status,
  tone,
}: {
  title: string;
  status: string;
  tone: "done" | "active" | "locked";
}) {
  const toneClass = {
    done: "border-green-400/30 bg-green-400/10 text-green-200",
    active: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
    locked: "border-white/5 bg-slate-900/50 text-slate-500",
  }[tone];

  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <p className="font-bold">{title}</p>
      <p className="mt-2 text-sm opacity-80">{status}</p>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const isUnlocked = achievement.status === "Unlocked";

  return (
    <div
      className={`rounded-2xl border p-5 ${
        isUnlocked
          ? "border-yellow-400/30 bg-yellow-400/10"
          : "border-white/10 bg-slate-900/70"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold">{achievement.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {achievement.description}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
            isUnlocked
              ? "bg-yellow-400 text-slate-950"
              : "bg-white/10 text-slate-300"
          }`}
        >
          {achievement.status}
        </span>
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div>
          <p className="font-bold">{activity.title}</p>
          <p className="mt-2 text-sm text-slate-400">{activity.detail}</p>
        </div>
        <span className="text-sm text-cyan-300">{activity.time}</span>
      </div>
    </div>
  );
}
