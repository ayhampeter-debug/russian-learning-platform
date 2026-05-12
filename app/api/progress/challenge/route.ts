import { completeChallengeForCurrentUser } from "@/lib/progress-service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      challengeId?: unknown;
      xpEarned?: unknown;
      heartsLeft?: unknown;
      score?: unknown;
      passed?: unknown;
      answers?: unknown;
    };

    if (typeof body.challengeId !== "string") {
      return Response.json({ error: "challengeId is required." }, { status: 400 });
    }

    const progress = await completeChallengeForCurrentUser({
      challengeId: body.challengeId,
      xpEarned: typeof body.xpEarned === "number" ? body.xpEarned : 0,
      heartsLeft: typeof body.heartsLeft === "number" ? body.heartsLeft : 0,
      score: typeof body.score === "number" ? body.score : 0,
      passed: Boolean(body.passed),
      answers: body.answers,
    });

    if (!progress) {
      return Response.json({ signedIn: false, source: "local", progress: null });
    }

    return Response.json({ signedIn: true, source: "database", progress });
  } catch {
    console.warn("Progress save skipped: challenge completion could not be saved.");

    return Response.json({ signedIn: true, source: "local", progress: null });
  }
}
