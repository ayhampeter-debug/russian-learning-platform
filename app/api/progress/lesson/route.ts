import { completeLessonForCurrentUser } from "@/lib/progress-service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      lessonId?: unknown;
      xpEarned?: unknown;
      bestScore?: unknown;
    };

    if (typeof body.lessonId !== "string") {
      return Response.json({ error: "lessonId is required." }, { status: 400 });
    }

    const progress = await completeLessonForCurrentUser({
      lessonId: body.lessonId,
      xpEarned: typeof body.xpEarned === "number" ? body.xpEarned : 0,
      bestScore: typeof body.bestScore === "number" ? body.bestScore : null,
    });

    if (!progress) {
      return Response.json({ signedIn: false, source: "local", progress: null });
    }

    return Response.json({ signedIn: true, source: "database", progress });
  } catch {
    console.warn("Progress save skipped: lesson completion could not be saved.");

    return Response.json({ signedIn: true, source: "local", progress: null });
  }
}
