import { ProfileClient } from "@/app/profile/ProfileClient";
import { getUserAchievementRows } from "@/lib/achievement-service";
import { syncCurrentUser } from "@/lib/current-user";

export default async function ProfilePage() {
  const { error, user } = await syncCurrentUser();
  const achievements = await getUserAchievementRows(user?.id ?? null);

  return <ProfileClient achievements={achievements} syncError={error} user={user} />;
}
