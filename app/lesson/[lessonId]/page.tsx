import { Navigation } from "@/components/Navigation";
import { worldOne, worlds } from "@/lib/learning-data";
import { getLessonContent } from "@/lib/lesson-content";
import Link from "next/link";
import { connection } from "next/server";
import { LessonExperience } from "../page";

type LessonPageProps = {
  params: Promise<{
    lessonId: string;
  }>;
};

export function generateStaticParams() {
  return worlds.flatMap((world) => world.lessons).map((lesson) => ({
    lessonId: lesson.id,
  }));
}

export default async function DynamicLessonPage({ params }: LessonPageProps) {
  await connection();
  const { lessonId } = await params;
  const { lesson } = await getLessonContent(lessonId);

  if (!lesson) {
    return <LessonNotFound lessonId={lessonId} />;
  }

  return <LessonExperience lesson={lesson} />;
}

function LessonNotFound({ lessonId }: { lessonId: string }) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-3xl items-center px-4 pb-8 sm:px-6">
        <div className="w-full rounded-2xl border border-white/10 bg-white/10 p-5 text-center shadow-2xl shadow-cyan-950/30 sm:rounded-3xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300 sm:text-sm sm:tracking-[0.35em]">
            Lesson not found
          </p>
          <h1 className="mt-4 text-3xl font-black md:text-5xl">
            We could not find that lesson.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            No lesson matches &quot;{lessonId}&quot;. Choose an available stage
            from the worlds map and keep going.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/worlds"
              className="inline-flex flex-1 justify-center rounded-full bg-cyan-400 px-7 py-4 font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              Back to Worlds
            </Link>
            <Link
              href={`/lesson/${worldOne.lessons[0].id}`}
              className="inline-flex flex-1 justify-center rounded-full border border-white/10 bg-white/10 px-7 py-4 font-bold text-white transition hover:border-white/30 hover:bg-white/15"
            >
              Start First Lesson
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
