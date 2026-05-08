"use client";

import { Navigation } from "@/components/Navigation";
import Link from "next/link";
import { type FormEvent, useState } from "react";

export default function LoginPage() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Authentication coming soon.");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />

      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:pb-20">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
            Player access
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Log in to your RusQuest account
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-slate-300">
            Account saving will be added soon. For now, your Russian learning
            progress stays on this browser.
          </p>

          <div className="mt-8 rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-5">
            <p className="text-sm font-semibold text-cyan-200">
              MVP status
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Lessons, XP, streaks, hearts, and unlocks continue to use the
              current local progress system.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur sm:rounded-3xl sm:p-6 md:p-8">
          <div className="mb-6">
            <p className="text-sm text-slate-400">Welcome back</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Continue your Russian journey
            </h2>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-slate-300">
                Email
              </span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-300">
                Password
              </span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Your password"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300"
            >
              Log In
            </button>
          </form>

          {message ? (
            <p className="mt-5 rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-sm font-semibold text-yellow-100">
              {message}
            </p>
          ) : null}

          <div className="mt-6 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
            New to RusQuest?{" "}
            <Link
              href="/signup"
              className="font-bold text-cyan-300 transition hover:text-cyan-200"
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
