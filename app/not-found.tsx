"use client";

import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { useExplanationLanguage } from "@/components/LanguageSelector";
import { getUiText, uiTextProps } from "@/lib/ui-translations";

export default function NotFound() {
  const { language } = useExplanationLanguage();
  const text = getUiText(language).notFound;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-3xl items-center px-4 pb-10 sm:px-6">
        <div
          className="w-full rounded-2xl border border-white/10 bg-white/10 p-6 text-center shadow-2xl shadow-cyan-950/30 sm:rounded-3xl sm:p-8"
          {...uiTextProps(language)}
        >
          <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
            {text.eyebrow}
          </p>
          <h1 className="mt-4 text-3xl font-black sm:text-5xl">
            {text.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">
            {text.message}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="w-full rounded-full bg-cyan-400 px-7 py-4 text-center font-black text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
            >
              {text.home}
            </Link>
            <Link
              href="/courses"
              className="w-full rounded-full border border-white/10 bg-white/10 px-7 py-4 text-center font-black text-white transition hover:border-white/30 hover:bg-white/15 sm:w-auto"
            >
              {text.courses}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
