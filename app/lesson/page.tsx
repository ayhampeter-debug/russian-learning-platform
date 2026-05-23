import { redirect } from "next/navigation";
import type { Lesson } from "@/lib/learning-data";
import { LessonSessionClient } from "./[lessonId]/LessonSessionClient";

export default function LessonPage() {
  redirect("/lesson/body-parts");
}

export function LessonExperience({ lesson }: { lesson: Lesson }) {
  return <LessonSessionClient lesson={lesson} />;
}
