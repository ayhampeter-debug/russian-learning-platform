import { BrandLogo } from "@/components/BrandLogo";

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-3xl items-center px-4 sm:px-6">
        <div className="w-full rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl shadow-cyan-950/30 sm:rounded-3xl sm:p-8">
          <BrandLogo />
          <div className="mt-8 space-y-4" role="status" aria-live="polite">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
              Loading YazkUp
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Preparing your next quest...
            </h1>
            <p className="max-w-xl leading-7 text-slate-400">
              If live progress is slow, YazkUp keeps the local practice path available.
            </p>
            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-400" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
