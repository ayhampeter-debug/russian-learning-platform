import { mergeLocalProgressForCurrentUser } from "@/lib/progress-service";
import type { SavedProgress } from "@/lib/progress-types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SavedProgress>;
    const progress = await mergeLocalProgressForCurrentUser(body);

    if (!progress) {
      return Response.json({ signedIn: false, source: "local", progress: null }, { status: 401 });
    }

    return Response.json({ signedIn: true, source: "database", progress });
  } catch {
    console.warn("Progress merge skipped: local progress could not be merged.");

    return Response.json({ error: "Local progress could not be merged." }, { status: 503 });
  }
}
