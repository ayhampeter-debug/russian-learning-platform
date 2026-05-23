import { activeWorlds } from "@/lib/learning-data";
import { getLessonContent } from "@/lib/lesson-content";
import { connection } from "next/server";
import { LessonNotFoundClient } from "./LessonNotFoundClient";
import { LessonExperience } from "../page";

type LessonPageProps = {
  params: Promise<{
    lessonId: string;
  }>;
};

export function generateStaticParams() {
  return activeWorlds.flatMap((world) => world.lessons).map((lesson) => ({
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
  return <LessonNotFoundClient lessonId={lessonId} />;
}
