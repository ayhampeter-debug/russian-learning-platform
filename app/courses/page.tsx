import type { Metadata } from "next";
import { CoursesClient } from "@/app/courses/CoursesClient";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Explore YazkUp courses. Start with Russian using English or Arabic explanations, with more languages coming soon.",
};

export default function CoursesPage() {
  return <CoursesClient />;
}
