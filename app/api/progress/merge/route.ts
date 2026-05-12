import { mergeLocalProgressForCurrentUser } from "@/lib/progress-service";
import type { SavedProgress } from "@/lib/progress-types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SavedProgress>;
    const progress = await mergeLocalProgressForCurrentUser(body);

    if (!progress) {
      return Response.json({ signedIn: false, source: "local", progress: null });
    }

    return Response.json({ signedIn: true, source: "database", progress });
  } catch {
    console.warn("Progress merge skipped: local progress could not be merged.");

    return Response.json({ signedIn: true, source: "local", progress: null });
  }
}
