import { existsSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import process from "node:process";
import pg from "pg";

const { Client } = pg;

const CONNECT_TIMEOUT_MS = 7_000;
const QUERY_TIMEOUT_MS = 7_000;
const USER_SYNC_TABLES = ["User", "UserProfile"];

function loadDotEnv() {
  const envPath = resolve(process.cwd(), ".env");

  if (!existsSync(envPath)) {
    console.log(".env: missing");
    return;
  }

  console.log(".env: present");

  const contents = readFileSync(envPath, "utf8");

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

function getDatabaseUrl() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return new URL(connectionString);
}

function maskHost(hostname) {
  return hostname.replace(/^[^.]+/, "***");
}

function getUserPrefix(username) {
  const decoded = decodeURIComponent(username);

  return decoded.split(".")[0].split("-")[0] || "(none)";
}

function printUrlSummary(url) {
  console.log("DATABASE_URL summary:");
  console.log(`host: ${maskHost(url.hostname)}`);
  console.log(`port: ${url.port || "(default)"}`);
  console.log(`user prefix: ${getUserPrefix(url.username)}`);
  console.log(`pgbouncer: ${url.searchParams.get("pgbouncer") ?? "(absent)"}`);
}

function getClientConfig(url) {
  const sslMode = url.searchParams.get("sslmode");
  const clientUrl = new URL(url.toString());

  clientUrl.searchParams.delete("sslmode");

  return {
    connectionString: clientUrl.toString(),
    connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
    query_timeout: QUERY_TIMEOUT_MS,
    ssl: sslMode === "disable" ? false : { rejectUnauthorized: false },
  };
}

async function time(label, operation) {
  const start = performance.now();
  const result = await operation();
  const elapsedMs = Math.round(performance.now() - start);

  console.log(`${label}: ${elapsedMs}ms`);

  return result;
}

function getSafeDbError(error) {
  if (!(error instanceof Error)) {
    return { code: "unknown", message: "Unknown database error" };
  }

  return {
    code: "code" in error && error.code ? String(error.code) : "unknown",
    message: error.message,
  };
}

async function printPermissionSummary(client) {
  const roleResult = await time("SELECT current_user", () =>
    client.query("SELECT current_user"),
  );
  const role = roleResult.rows[0]?.current_user ?? "(unknown)";

  console.log(`Connected database role: ${role}`);

  const tablePrivileges = await time("check User/UserProfile privileges", () =>
    client.query(
      `
        SELECT
          table_name,
          has_table_privilege(current_user, format('%I.%I', table_schema, table_name), 'INSERT') AS can_insert,
          has_table_privilege(current_user, format('%I.%I', table_schema, table_name), 'SELECT') AS can_select,
          has_table_privilege(current_user, format('%I.%I', table_schema, table_name), 'UPDATE') AS can_update,
          has_table_privilege(current_user, format('%I.%I', table_schema, table_name), 'DELETE') AS can_delete
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = ANY($1::text[])
        ORDER BY table_name
      `,
      [USER_SYNC_TABLES],
    ),
  );

  for (const row of tablePrivileges.rows) {
    console.log(
      `${row.table_name} privileges: insert=${row.can_insert}, select=${row.can_select}, update=${row.can_update}, delete=${row.can_delete}`,
    );
  }

  const sequencePrivileges = await time("check related sequence privileges", () =>
    client.query(
      `
        SELECT
          sequence_namespace.nspname AS sequence_schema,
          sequence_class.relname AS sequence_name,
          has_sequence_privilege(current_user, sequence_class.oid, 'USAGE') AS can_usage,
          has_sequence_privilege(current_user, sequence_class.oid, 'SELECT') AS can_select
        FROM pg_class sequence_class
        JOIN pg_namespace sequence_namespace
          ON sequence_namespace.oid = sequence_class.relnamespace
        JOIN pg_depend sequence_dependency
          ON sequence_dependency.objid = sequence_class.oid
        JOIN pg_class table_class
          ON table_class.oid = sequence_dependency.refobjid
        JOIN pg_namespace table_namespace
          ON table_namespace.oid = table_class.relnamespace
        WHERE sequence_class.relkind = 'S'
          AND table_namespace.nspname = 'public'
          AND table_class.relname = ANY($1::text[])
          AND sequence_dependency.deptype IN ('a', 'i')
        ORDER BY sequence_class.relname
      `,
      [USER_SYNC_TABLES],
    ),
  );

  if (sequencePrivileges.rows.length === 0) {
    console.log("Related sequences: none");
    return;
  }

  for (const row of sequencePrivileges.rows) {
    console.log(
      `${row.sequence_name} privileges: usage=${row.can_usage}, select=${row.can_select}`,
    );
  }
}

async function verifyUserInsert(client) {
  const testUserId = randomUUID();
  const testProfileId = randomUUID();
  const testEmail = `db-ping-${randomUUID()}@example.invalid`;
  const testClerkId = `db-ping-${randomUUID()}`;
  let insertedUser = false;

  try {
    await time('test INSERT INTO "User"', () =>
      client.query(
        `
          INSERT INTO "User" (
            "id",
            "clerkId",
            "email",
            "name",
            "imageUrl",
            "createdAt",
            "updatedAt"
          )
          VALUES ($1, $2, $3, $4, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `,
        [testUserId, testClerkId, testEmail, "DB ping test user"],
      ),
    );
    insertedUser = true;

    await time('test INSERT INTO "UserProfile"', () =>
      client.query(
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
        `,
        [testProfileId, testUserId, "DB ping test profile", "DB"],
      ),
    );

    console.log("Safe User/UserProfile insert test: ok");
  } catch (error) {
    const safeError = getSafeDbError(error);

    console.error(
      `Safe User/UserProfile insert test failed: code=${safeError.code} message=${safeError.message}`,
    );

    throw error;
  } finally {
    if (insertedUser) {
      try {
        const cleanupResult = await time("cleanup fake insert rows", () =>
          client.query('DELETE FROM "User" WHERE "id" = $1', [testUserId]),
        );

        console.log(`Cleanup fake insert rows: ${cleanupResult.rowCount}`);
      } catch (error) {
        const safeError = getSafeDbError(error);

        console.error(
          `Cleanup fake insert rows failed: code=${safeError.code} message=${safeError.message}`,
        );
        throw error;
      }
    }
  }
}

async function main() {
  loadDotEnv();

  const url = getDatabaseUrl();
  printUrlSummary(url);

  const client = new Client(getClientConfig(url));

  try {
    await time("connect", () => client.connect());
    await time("SELECT 1", () => client.query("SELECT 1"));

    const countResult = await time('SELECT COUNT(*) FROM "User"', () =>
      client.query('SELECT COUNT(*)::int AS count FROM "User"'),
    );

    console.log(`User rows: ${countResult.rows[0]?.count ?? "(unknown)"}`);
    await printPermissionSummary(client);
  } finally {
    await client.end().catch(() => undefined);
  }

  const insertClient = new Client(getClientConfig(url));

  try {
    await time("connect for safe insert test", () => insertClient.connect());
    await time("SELECT 1 before safe insert test", () =>
      insertClient.query("SELECT 1"),
    );
    await verifyUserInsert(insertClient);
  } finally {
    await insertClient.end().catch(() => undefined);
  }
}

main().catch((error) => {
  const safeError = getSafeDbError(error);

  console.error(
    `Database ping failed: code=${safeError.code} message=${safeError.message}`,
  );
  process.exitCode = 1;
});
