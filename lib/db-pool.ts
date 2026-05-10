import "server-only";

import pg, { type Pool, type PoolConfig } from "pg";

const { Pool: PgPool } = pg;

const PG_CONNECT_TIMEOUT_MS = 3_000;
const PG_QUERY_TIMEOUT_MS = 3_000;

type PgPoolGlobal = {
  pgPool?: Pool;
};

const globalForPg = globalThis as unknown as PgPoolGlobal;

function getPoolConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const url = new URL(connectionString);
  const sslMode = url.searchParams.get("sslmode");

  url.searchParams.delete("sslmode");

  return {
    connectionString: url.toString(),
    connectionTimeoutMillis: PG_CONNECT_TIMEOUT_MS,
    idleTimeoutMillis: 10_000,
    max: 3,
    query_timeout: PG_QUERY_TIMEOUT_MS,
    statement_timeout: PG_QUERY_TIMEOUT_MS,
    ssl: sslMode === "disable" ? false : { rejectUnauthorized: false },
  };
}

export function getDbPool() {
  if (!globalForPg.pgPool) {
    globalForPg.pgPool = new PgPool(getPoolConfig());
  }

  return globalForPg.pgPool;
}
