import "dotenv/config";
import { defineConfig } from "@prisma/config";

// ==============================================================================
// FIXIA GymOS — Prisma 7 Configuration
// ==============================================================================
// Configures connection URLs for Prisma CLI and migrations.
// In Neon PostgreSQL environments, directUrl/direct unpooled connection is preferred
// for migration and DDL operations to bypass connection pooler transaction locks.
// ==============================================================================

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DIRECT_URL ||
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/fixia_gymos?schema=public",
  },
});
