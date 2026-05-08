"use client";

import { Navigation } from "@/components/Navigation";
import Link from "next/link";
import { type FormEvent, useState } from "react";

export default function SignupPage() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Authentication coming soon.");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />

      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pb-20">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur sm:rounded-3xl sm:p-6 md:p-8 lg:order-2">
          <div className="mb-6">
            <p className="text-sm text-slate-400">New player</p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Create your RusQuest account
            </h1>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-slate-300">
                Name
              </span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Your name"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

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
                autoComplete="new-password"
                placeholder="Choose a password"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300"
            >
              Create Account
            </button>
          </form>

          {message ? (
            <p className="mt-5 rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-sm font-semibold text-yellow-100">
              {message}
            </p>
          ) : null}

          <div className="mt-6 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-cyan-300 transition hover:text-cyan-200"
            >
              Log in
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
            Save system preview
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Build your profile before cloud accounts arrive
          </h2>
          <p className="mt-5 max-w-2xl leading-7 text-slate-300">
            Progress is currently saved locally in the browser. Creating an
            account is a visual preview for the MVP and does not change lesson
            unlocks or challenge progress yet.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["XP", "Streaks", "Unlocks"].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-white/10 bg-white/10 p-4"
              >
                <p className="text-lg font-black text-cyan-200">{item}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Still tracked locally during the MVP.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
