"use client";

import { SignUp } from "@clerk/nextjs";
import { Navigation } from "@/components/Navigation";
import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />

      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pb-20">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur sm:rounded-3xl sm:p-6 md:p-8 lg:order-2">
          <div className="flex justify-center">
            <SignUp
              path="/signup"
              routing="path"
              signInUrl="/login"
              fallbackRedirectUrl="/dashboard"
              appearance={{
                variables: {
                  colorPrimary: "var(--app-primary)",
                  colorBackground: "var(--app-surface)",
                  colorText: "var(--app-text)",
                  colorTextSecondary: "var(--app-text-muted)",
                  colorInputBackground: "var(--app-surface-muted)",
                  colorInputText: "var(--app-text)",
                },
                elements: {
                  rootBox: "w-full",
                  cardBox: "mx-auto w-full max-w-md border border-white/10 shadow-2xl",
                  footerActionLink: "font-bold",
                },
              }}
            />
          </div>

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
            Start your journey
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Create your YazkUp profile
          </h2>
          <p className="mt-5 max-w-2xl leading-7 text-slate-300">
            Save your quest progress, XP, streaks, hearts, and unlocks while
            you work through the current Russian course.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["XP", "Streaks", "Unlocks"].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-white/10 bg-white/10 p-4"
              >
                <p className="text-lg font-black text-cyan-200">{item}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Tracked as you level up your language skills.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
