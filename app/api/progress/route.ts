import { getDatabaseProgressForCurrentUser } from "@/lib/progress-service";

export async function GET() {
  try {
    const progress = await getDatabaseProgressForCurrentUser();

    if (!progress) {
      return Response.json({ signedIn: false, source: "local", progress: null });
    }

    return Response.json({ signedIn: true, source: "database", progress });
  } catch {
    console.warn("Progress load skipped: database progress could not be loaded.");

    return Response.json({ signedIn: true, source: "local", progress: null });
  }
}
