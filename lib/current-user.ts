import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { randomUUID } from "node:crypto";
import { getDbPool } from "@/lib/db-pool";

const USER_SYNC_TIMEOUT_MS = 7_000;

export type CurrentAppUser = {
  id: string;
  clerkId: string | null;
  email: string;
  name: string | null;
  imageUrl: string | null;
  profile: {
    id: string;
    displayName: string;
    initials: string | null;
    level: number;
    totalXp: number;
    currentStreak: number;
    longestStreak: number;
    hearts: number;
  } | null;
};

export type CurrentUserSyncResult = {
  user: CurrentAppUser | null;
  isSignedIn: boolean;
  error: string | null;
};

type SyncedUser = Awaited<ReturnType<typeof upsertUserForClerkIdentity>>;

type SyncedUserRow = {
  id: string;
  clerkId: string | null;
  email: string;
  name: string | null;
  imageUrl: string | null;
};

type SyncedUserProfileRow = {
  id: string;
  displayName: string;
  initials: string | null;
  level: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  hearts: number;
};

class UserSyncTimeoutError extends Error {
  constructor(label: string, timeoutMs: number) {
    super(`${label} timed out after ${timeoutMs}ms`);
    this.name = "UserSyncTimeoutError";
  }
}

async function withUserSyncTimeout<T>(
  promise: Promise<T>,
  label: string,
  timeoutMs = USER_SYNC_TIMEOUT_MS,
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new UserSyncTimeoutError(label, timeoutMs));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function warnUserSyncFailed(message: string) {
  console.warn(`User sync skipped: ${message}`);
}

function logUserSyncStep(message: string) {
  console.info(`User sync step: ${message}`);
}

function getPrimaryEmail(user: Awaited<ReturnType<typeof currentUser>>) {
  return user?.primaryEmailAddress?.emailAddress ?? null;
}

function getDisplayName({
  email,
  firstName,
  fullName,
  lastName,
  username,
}: {
  email: string;
  firstName: string | null;
  fullName: string | null;
  lastName: string | null;
  username: string | null;
}) {
  const composedName = [firstName, lastName].filter(Boolean).join(" ").trim();

  return (
    fullName?.trim() ||
    composedName ||
    username?.trim() ||
    email.split("@")[0] ||
    "Russian learner"
  );
}

function getInitials(displayName: string) {
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "RU";
}

function isDynamicServerUsageError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String(error.digest).includes("DYNAMIC_SERVER_USAGE")
  );
}

function toCurrentAppUser(user: SyncedUser): CurrentAppUser {
  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    name: user.name,
    imageUrl: user.imageUrl,
    profile: user.profile
      ? {
          id: user.profile.id,
          displayName: user.profile.displayName,
          initials: user.profile.initials,
          level: user.profile.level,
          totalXp: user.profile.totalXp,
          currentStreak: user.profile.currentStreak,
          longestStreak: user.profile.longestStreak,
          hearts: user.profile.hearts,
        }
      : null,
  };
}

async function upsertUserForClerkIdentity({
  clerkId,
  displayName,
  email,
  imageUrl,
  initials,
}: {
  clerkId: string;
  displayName: string;
  email: string;
  imageUrl: string | null;
  initials: string;
}) {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("SELECT 1");
    logUserSyncStep("db connection ok");

    logUserSyncStep("user insert/update started");
    const userResult = await client.query<SyncedUserRow>(
      `
        WITH updated_by_clerk AS (
          UPDATE "User"
          SET
            "email" = $2,
            "name" = $3,
            "imageUrl" = $4,
            "updatedAt" = CURRENT_TIMESTAMP
          WHERE "clerkId" = $1
          RETURNING "id", "clerkId", "email", "name", "imageUrl"
        ),
        linked_by_email AS (
          UPDATE "User"
          SET
            "clerkId" = $1,
            "name" = $3,
            "imageUrl" = $4,
            "updatedAt" = CURRENT_TIMESTAMP
          WHERE
            "email" = $2
            AND NOT EXISTS (SELECT 1 FROM updated_by_clerk)
          RETURNING "id", "clerkId", "email", "name", "imageUrl"
        ),
        inserted_user AS (
          INSERT INTO "User" (
            "id",
            "clerkId",
            "email",
            "name",
            "imageUrl",
            "createdAt",
            "updatedAt"
          )
          SELECT $5, $1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          WHERE
            NOT EXISTS (SELECT 1 FROM updated_by_clerk)
            AND NOT EXISTS (SELECT 1 FROM linked_by_email)
          ON CONFLICT ("clerkId") DO UPDATE
          SET
            "email" = EXCLUDED."email",
            "name" = EXCLUDED."name",
            "imageUrl" = EXCLUDED."imageUrl",
            "updatedAt" = CURRENT_TIMESTAMP
          RETURNING "id", "clerkId", "email", "name", "imageUrl"
        )
        SELECT "id", "clerkId", "email", "name", "imageUrl" FROM updated_by_clerk
        UNION ALL
        SELECT "id", "clerkId", "email", "name", "imageUrl" FROM linked_by_email
        UNION ALL
        SELECT "id", "clerkId", "email", "name", "imageUrl" FROM inserted_user
        LIMIT 1
      `,
      [clerkId, email, displayName, imageUrl, randomUUID()],
    );

    const user = userResult.rows[0];

    if (!user) {
      throw new Error("Database user sync returned no user.");
    }

    logUserSyncStep("user insert/update succeeded");
    logUserSyncStep("profile insert/update started");
    const profileResult = await client.query<SyncedUserProfileRow>(
      `
        INSERT INTO "UserProfile" (
          "id",
          "userId",
          "displayName",
          "initials",
          "createdAt",
          "updatedAt"
        )
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT ("userId") DO UPDATE
        SET
          "displayName" = EXCLUDED."displayName",
          "initials" = EXCLUDED."initials",
          "updatedAt" = CURRENT_TIMESTAMP
        RETURNING
          "id",
          "displayName",
          "initials",
          "level",
          "totalXp",
          "currentStreak",
          "longestStreak",
          "hearts"
      `,
      [randomUUID(), user.id, displayName, initials],
    );

    logUserSyncStep("profile insert/update succeeded");

    return { ...user, profile: profileResult.rows[0] ?? null };
  } finally {
    client.release();
  }
}

export async function syncCurrentUser(): Promise<CurrentUserSyncResult> {
  let clerkUserId: string | null;
  let clerkUser: Awaited<ReturnType<typeof currentUser>>;

  try {
    const authResult = await withUserSyncTimeout(auth(), "Clerk auth");
    clerkUserId = authResult.userId;
  } catch (error) {
    if (isDynamicServerUsageError(error)) {
      throw error;
    }

    warnUserSyncFailed(
      error instanceof UserSyncTimeoutError
        ? error.message
        : "Clerk auth could not be loaded.",
    );

    return {
      user: null,
      isSignedIn: false,
      error: "Your signed-in profile could not be loaded.",
    };
  }

  if (!clerkUserId) {
    return { user: null, isSignedIn: false, error: null };
  }

  try {
    clerkUser = await withUserSyncTimeout(currentUser(), "Clerk currentUser");
  } catch (error) {
    if (isDynamicServerUsageError(error)) {
      throw error;
    }

    warnUserSyncFailed(
      error instanceof UserSyncTimeoutError
        ? error.message
        : "Clerk user could not be loaded.",
    );

    return {
      user: null,
      isSignedIn: true,
      error: "Your signed-in profile could not be loaded.",
    };
  }

  if (!clerkUser) {
    warnUserSyncFailed("Clerk returned no signed-in user.");

    return {
      user: null,
      isSignedIn: true,
      error: "Your signed-in profile could not be loaded.",
    };
  }

  logUserSyncStep("auth user found");

  try {
    const primaryEmail = getPrimaryEmail(clerkUser);

    if (!primaryEmail) {
      warnUserSyncFailed("Signed-in user has no primary email.");

      return {
        user: null,
        isSignedIn: true,
        error: "Add an email address to your account to create an app profile.",
      };
    }

    const displayName = getDisplayName({
      email: primaryEmail,
      firstName: clerkUser.firstName,
      fullName: clerkUser.fullName,
      lastName: clerkUser.lastName,
      username: clerkUser.username,
    });
    const syncPromise = upsertUserForClerkIdentity({
      clerkId: clerkUser.id,
      displayName,
      email: primaryEmail,
      imageUrl: clerkUser.imageUrl || null,
      initials: getInitials(displayName),
    });
    const syncedUser = await withUserSyncTimeout(
      syncPromise,
      "Database user sync",
    );

    return {
      user: toCurrentAppUser(syncedUser),
      isSignedIn: true,
      error: null,
    };
  } catch (error) {
    if (isDynamicServerUsageError(error)) {
      throw error;
    }

    warnUserSyncFailed(
      error instanceof UserSyncTimeoutError
        ? error.message
        : "Database profile could not be loaded.",
    );

    return {
      user: null,
      isSignedIn: true,
      error: "Your signed-in profile could not be loaded from the database.",
    };
  }
}

export async function getCurrentAppUser() {
  const result = await syncCurrentUser();

  return result.user;
}
