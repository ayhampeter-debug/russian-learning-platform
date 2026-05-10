import { syncCurrentUser } from "@/lib/current-user";

export async function POST() {
  try {
    const result = await syncCurrentUser();

    if (!result.isSignedIn) {
      return Response.json({ synced: false });
    }

    return Response.json({
      synced: Boolean(result.user),
    });
  } catch {
    console.warn("User sync skipped: API sync failed.");

    return Response.json({ synced: false });
  }
}
