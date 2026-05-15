import type { Metadata } from "next";
import { SettingsClient } from "@/app/settings/SettingsClient";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Manage YazkUp explanation language, theme, account links, and beta learning preferences.",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
