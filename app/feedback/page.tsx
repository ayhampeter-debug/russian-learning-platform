import type { Metadata } from "next";
import { FeedbackClient } from "@/app/feedback/FeedbackClient";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Send YazkUp beta feedback, bug reports, and content issues.",
};

export default function FeedbackPage() {
  return <FeedbackClient />;
}
