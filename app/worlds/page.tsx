import { Navigation } from "@/components/Navigation";
import { userProgress, worldOne, type StageStatus } from "@/lib/learning-data";
import Link from "next/link";

export default function WorldsPage() {
  function getStageStatus(stageId: string): StageStatus {
    if (userProgress.completedStages.includes(stageId)) {
      return "Completed";
    }

    if (userProgress.unlockedStages.includes(stageId)) {
      return "Unlocked";
    }

    return "Locked";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="mb-10">
          <p className="text-sm text-cyan-300">Choose your path</p>
          <h1 className="mt-2 text-4xl font-bold">Worlds & Stages</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Progress through Russian step by step. Complete lessons, pass boss
            challenges, and unlock the next stage.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm text-slate-400">World {worldOne.number}</p>
              <h2 className="text-3xl font-bold">{worldOne.title}</h2>
              <p className="mt-2 text-slate-400">
                {worldOne.description}
              </p>
            </div>

            <div className="rounded-full bg-yellow-400 px-5 py-2 font-bold text-slate-950">
              {userProgress.currentWorldProgressPercent}% Complete
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {worldOne.stages.map((stage) => (
              <StageCard
                key={stage.id}
                number={stage.number}
                title={stage.title}
                description={stage.description}
                status={getStageStatus(stage.id)}
                xp={`${stage.xp} XP`}
                boss={stage.boss}
                lessonId={
                  worldOne.lessons.find((lesson) => lesson.stageId === stage.id)?.id
                }
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function StageCard({
  number,
  title,
  description,
  status,
  xp,
  boss = false,
  lessonId,
}: {
  number: string;
  title: string;
  description: string;
  status: StageStatus;
  xp: string;
  boss?: boolean;
  lessonId?: string;
}) {
  const locked = status === "Locked";
  const href = boss ? "/challenge" : lessonId ? `/lesson/${lessonId}` : "/lesson";

  return (
    <div
      className={`rounded-3xl border p-6 transition ${
        locked
          ? "border-white/5 bg-slate-900/50 opacity-50"
          : "border-cyan-400/20 bg-slate-900/80 hover:border-cyan-400/50"
      }`}
    >
      <div className="mb-5 flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl font-bold ${
            boss
              ? "bg-yellow-400 text-slate-950"
              : "bg-cyan-400 text-slate-950"
          }`}
        >
          {locked && !boss ? "🔒" : number}
        </div>

        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
          {status}
        </span>
      </div>

      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-3 min-h-16 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-sm text-slate-400">{xp}</span>
        {locked ? (
          <button
            disabled
            className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-500"
          >
            Locked
          </button>
        ) : (
          <Link
            href={href}
            className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
          >
            Start
          </Link>
        )}
      </div>
    </div>
  );
}
