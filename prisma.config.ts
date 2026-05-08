import { defineConfig } from "prisma/config";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://prisma:prisma@127.0.0.1:9/russian_learning_platform?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma CLI needs a URL to load config. This fallback is intentionally
    // non-routable for normal local PostgreSQL setups; set DATABASE_URL before
    // running migrate, db push, or any command that should reach a database.
    url: databaseUrl,
  },
});
