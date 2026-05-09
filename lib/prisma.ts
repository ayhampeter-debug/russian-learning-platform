import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

type PrismaGlobal = {
  prisma?: PrismaClient;
};

const globalForPrisma = globalThis as unknown as PrismaGlobal;

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const url = new URL(connectionString);

  if (url.searchParams.get("sslmode") !== "disable") {
    url.searchParams.set("sslmode", "no-verify");
  }

  return url.toString();
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: getConnectionString(),
  });

  return new PrismaClient({ adapter });
}

export function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}
