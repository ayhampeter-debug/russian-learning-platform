export default function WorldsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <section className="mx-auto max-w-7xl">
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
              <p className="text-sm text-slate-400">World 1</p>
              <h2 className="text-3xl font-bold">First Contact</h2>
              <p className="mt-2 text-slate-400">
                Greetings, introductions, basic phrases, question words, and numbers 1–10.
              </p>
            </div>

            <div className="rounded-full bg-yellow-400 px-5 py-2 font-bold text-slate-950">
              40% Complete
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <StageCard
              number="1"
              title="Hello!"
              description="Learn your first greetings: Привет, Здравствуйте, Пока."
              status="Completed"
              xp="80 XP"
            />

            <StageCard
              number="2"
              title="Who are you?"
              description="Introduce yourself and ask someone's name."
              status="Unlocked"
              xp="100 XP"
            />

            <StageCard
              number="3"
              title="Survival Phrases"
              description="Спасибо, пожалуйста, извините, не понимаю."
              status="Locked"
              xp="120 XP"
              locked
            />

            <StageCard
              number="4"
              title="Question Basics"
              description="Что? Кто? Где? Как? Learn essential question words."
              status="Locked"
              xp="120 XP"
              locked
            />

            <StageCard
              number="5"
              title="Numbers 1–10"
              description="Recognize and use the first Russian numbers."
              status="Locked"
              xp="150 XP"
              locked
            />

            <StageCard
              number="★"
              title="Boss Level"
              description="Complete your first basic Russian conversation."
              status="Locked"
              xp="200 XP"
              locked
              boss
            />
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
  locked = false,
  boss = false,
}: {
  number: string;
  title: string;
  description: string;
  status: string;
  xp: string;
  locked?: boolean;
  boss?: boolean;
}) {
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
        <button
          disabled={locked}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            locked
              ? "bg-slate-800 text-slate-500"
              : "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
          }`}
        >
          {locked ? "Locked" : "Start"}
        </button>
      </div>
    </div>
  );
}