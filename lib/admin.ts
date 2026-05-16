import "server-only";

import { currentUser } from "@clerk/nextjs/server";

const ADMIN_EMAIL = "ayhampeter@gmail.com";

export type AdminAccessResult = {
  isAdmin: boolean;
  userId: string | null;
  email: string | null;
};

export async function getAdminAccess(): Promise<AdminAccessResult> {
  const user = await currentUser();

  if (!user) {
    return { isAdmin: false, userId: null, email: null };
  }

  const emails = user.emailAddresses.map((email) =>
    email.emailAddress.toLowerCase(),
  );
  const primaryEmail =
    user.primaryEmailAddress?.emailAddress.toLowerCase() ?? emails[0] ?? null;

  return {
    isAdmin: emails.includes(ADMIN_EMAIL),
    userId: user.id,
    email: primaryEmail,
  };
}
