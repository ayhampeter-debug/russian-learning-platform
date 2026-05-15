import { worldOne, type Lesson } from "@/lib/learning-data";
import { LessonSessionClient } from "./[lessonId]/LessonSessionClient";

export default function LessonPage() {
  return <LessonExperience lesson={worldOne.lessons[0]} />;
}

export function LessonExperience({ lesson }: { lesson: Lesson }) {
  return <LessonSessionClient lesson={lesson} />;
}
