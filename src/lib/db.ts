import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// ==============================================================================
// FIXIA GymOS — Prisma Database Client Singleton
// ==============================================================================
// Implements connection pooling compatible with Neon Serverless PostgreSQL and
// prevents connection exhaustion across Next.js dev server hot-reloads.
// ==============================================================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/fixia_gymos?schema=public";

  const isRemotePostgres =
    connectionString.includes("neon.tech") ||
    connectionString.includes("amazonaws.com") ||
    connectionString.includes("sslmode=require");

  // Configure pg connection pool
  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString,
      max: process.env.NODE_ENV === "production" ? 10 : 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ...(isRemotePostgres ? { ssl: { rejectUnauthorized: false } } : {}),
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export default db;

