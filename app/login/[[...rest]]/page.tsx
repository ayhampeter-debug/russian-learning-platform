"use client";

import { SignIn } from "@clerk/nextjs";
import { Navigation } from "@/components/Navigation";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />

      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:pb-20">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
            Player access
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Log in to your YazkUp account
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-slate-300">
            Keep your language progress synced as you complete quests, earn XP,
            and unlock new stages.
          </p>

          <div className="mt-8 rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-5">
            <p className="text-sm font-semibold text-cyan-200">
              MVP status
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Signed-in progress syncs to your profile, with local progress
              still available as a fallback on this device.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur sm:rounded-3xl sm:p-6 md:p-8">
          <div className="flex justify-center">
            <SignIn
              path="/login"
              routing="path"
              signUpUrl="/signup"
              fallbackRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  cardBox: "mx-auto w-full max-w-md",
                },
              }}
            />
          </div>

          <div className="mt-6 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
            New to YazkUp?{" "}
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
