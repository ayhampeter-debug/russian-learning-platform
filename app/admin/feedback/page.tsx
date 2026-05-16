import type { Metadata } from "next";
import Link from "next/link";
import { FeedbackAdminClient } from "@/app/admin/feedback/FeedbackAdminClient";
import { Navigation } from "@/components/Navigation";
import { getAdminAccess } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin Feedback",
  description: "Review YazkUp feedback submissions.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  const access = await getAdminAccess();

  if (!access.isAdmin) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navigation />
        <section className="mx-auto max-w-3xl px-4 pb-10 sm:px-6">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-cyan-950/20 sm:rounded-3xl sm:p-8">
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
              Admin area
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              Access denied
            </h1>
            <p className="mt-4 leading-7 text-slate-300">
              This page is only available to the YazkUp owner account. No
              feedback data was loaded.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="rounded-full bg-cyan-400 px-5 py-3 text-center font-black text-slate-950 transition hover:bg-cyan-300"
              >
                Back to YazkUp
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/10 px-5 py-3 text-center font-black text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return <FeedbackAdminClient adminEmail={access.email} />;
}
