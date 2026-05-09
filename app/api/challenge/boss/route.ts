import { getWorldOneBossChallenge } from "@/lib/challenge-content";
import { NextResponse } from "next/server";

export async function GET() {
  const challenge = await getWorldOneBossChallenge();

  return NextResponse.json(challenge);
}
