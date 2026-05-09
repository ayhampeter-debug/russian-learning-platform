import { getWorldOneContent } from "@/lib/world-content";
import { connection } from "next/server";
import { WorldsClient } from "./WorldsClient";

export default async function WorldsPage() {
  await connection();
  const { world } = await getWorldOneContent();

  return <WorldsClient world={world} />;
}
