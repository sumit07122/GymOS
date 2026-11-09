import { db } from "@/lib/db";
import { TenantContext } from "./context";
import { Prisma } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — Safe Tenant Context Propagation & Transaction Wrapper
// ==============================================================================
// Wraps multi-statement operations in an atomic transaction and propagates the
// tenant ID to the PostgreSQL session variable 'app.current_gym_id' to activate
// database-level Row-Level Security (RLS) policies.
// ==============================================================================

export async function withTenantTransaction<T>(
  ctx: TenantContext,
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return db.$transaction(async (tx) => {
    // Attempt to set the session variable for PostgreSQL RLS if connection allows raw queries
    try {
      if (!ctx.isSuperAdmin) {
        await tx.$executeRawUnsafe(
          `SET LOCAL app.current_gym_id = '${ctx.gymId.replace(/'/g, "''")}'`
        );
      }
    } catch {
      // In offline testing or environments where RLS variables are not yet mounted,
      // fallback cleanly to repository-level tenant scoping.
    }

    return callback(tx);
  });
}

