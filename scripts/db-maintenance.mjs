import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import pg from "pg";

const { Client } = pg;

const USER_TABLES = [
  "User",
  "UserProfile",
  "UserLessonProgress",
  "UserStageProgress",
  "UserChallengeAttempt",
  "UserAchievement",
];

function loadDotEnv() {
  const envPath = resolve(process.cwd(), ".env");
  let contents;

  try {
    contents = readFileSync(envPath, "utf8");
  } catch {
    return;
  }

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");

    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

function getClientConfig() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const url = new URL(connectionString);
  const sslMode = url.searchParams.get("sslmode");
  url.searchParams.delete("sslmode");
  const ssl = sslMode === "disable" ? false : { rejectUnauthorized: false };

  return { connectionString: url.toString(), ssl };
}

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

async function disableUserRls() {
  loadDotEnv();

  const client = new Client(getClientConfig());

  try {
    await client.connect();
    await client.query("SET lock_timeout = '5s'");
    await client.query("SET statement_timeout = '15s'");

    for (const table of USER_TABLES) {
      await client.query(
        `ALTER TABLE public.${quoteIdentifier(table)} DISABLE ROW LEVEL SECURITY`,
      );
    }

    console.log("RLS disabled for user persistence tables.");
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function checkUserRls() {
  loadDotEnv();

  const client = new Client(getClientConfig());

  try {
    await client.connect();

    const currentUserResult = await client.query("SELECT current_user");
    const ownerResult = await client.query(
      `
        SELECT tablename, tableowner, rowsecurity
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename = ANY($1::text[])
        ORDER BY tablename
      `,
      [USER_TABLES],
    );

    console.log(`Connected database role: ${currentUserResult.rows[0].current_user}`);

    for (const row of ownerResult.rows) {
      console.log(
        `${row.tablename}: owner=${row.tableowner}, rls=${row.rowsecurity}`,
      );
    }
  } finally {
    await client.end().catch(() => undefined);
  }
}

const command = process.argv[2] ?? "disable-user-rls";

if (command === "disable-user-rls") {
  disableUserRls().catch((error) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Database maintenance failed: ${message}`);
    process.exitCode = 1;
  });
} else if (command === "check-user-rls") {
  checkUserRls().catch((error) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Database maintenance failed: ${message}`);
    process.exitCode = 1;
  });
} else {
  console.error("Unknown maintenance command.");
  process.exitCode = 1;
}
