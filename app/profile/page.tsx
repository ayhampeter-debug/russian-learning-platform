import { ProfileClient } from "@/app/profile/ProfileClient";
import { syncCurrentUser } from "@/lib/current-user";

export default async function ProfilePage() {
  const { error, user } = await syncCurrentUser();

  return <ProfileClient syncError={error} user={user} />;
}
