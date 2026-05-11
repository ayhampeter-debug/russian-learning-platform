import { getWorldsContent } from "@/lib/world-content";
import { connection } from "next/server";
import { WorldsClient } from "./WorldsClient";

export default async function WorldsPage() {
  await connection();
  const { worlds } = await getWorldsContent();

  return <WorldsClient worlds={worlds} />;
}
