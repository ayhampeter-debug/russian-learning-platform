import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg, { type PoolConfig } from "pg";

const { Pool } = pg;

const PRISMA_CONNECT_TIMEOUT_MS = 7_000;

type PrismaGlobal = {
  prisma?: PrismaClient;
};

const globalForPrisma = globalThis as unknown as PrismaGlobal;

function getPoolConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const url = new URL(connectionString);
  const sslMode = url.searchParams.get("sslmode");

  url.searchParams.delete("sslmode");
  url.searchParams.delete("pgbouncer");

  return {
    connectionString: url.toString(),
    connectionTimeoutMillis: PRISMA_CONNECT_TIMEOUT_MS,
    max: 3,
    ssl: sslMode === "disable" ? false : { rejectUnauthorized: false },
  };
}

function createPrismaClient() {
  const pool = new Pool(getPoolConfig());
  const adapter = new PrismaPg(pool, {
    disposeExternalPool: true,
  });

  return new PrismaClient({ adapter });
}

export function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}
