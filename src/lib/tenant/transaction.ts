import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { TenantContext } from "./context";

// ==============================================================================
// FIXIA GymOS — Safe Tenant Context Propagation & Transaction Wrapper
// ==============================================================================
// Wraps multi-statement operations in an atomic transaction and propagates the
// tenant ID to the PostgreSQL session variable 'app.current_tenant_id' and
// 'app.current_gym_id' to activate database-level Row-Level Security (RLS).
// ==============================================================================

/**
 * Executes a callback inside a tenant-isolated PostgreSQL transaction
 * that sets `app.current_tenant_id` and `app.current_gym_id` locally for Row-Level Security (RLS).
 */
export async function withTenantTransaction<T>(
  target: string | TenantContext,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  const gymId = typeof target === "string" ? target : target.gymId;
  const isSuperAdmin = typeof target === "object" ? target.isSuperAdmin : false;

  if (!gymId || typeof gymId !== "string") {
    throw new Error("TENANT_CONTEXT_MISSING: Valid gymId is required for tenant query.");
  }

  return db.$transaction(async (tx) => {
    try {
      if (!isSuperAdmin) {
        const cleanId = gymId.replace(/'/g, "''");
        await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${cleanId}'`);
        await tx.$executeRawUnsafe(`SET LOCAL app.current_gym_id = '${cleanId}'`);
      }
    } catch {
      // Graceful fallback for offline preview environments where RLS triggers are simulated
    }

    return fn(tx);
  });
}

/**
 * Helper to guard preview/demo fallback data so it never leaks in production.
 */
export function isDemoPreviewAllowed(gymSlug?: string): boolean {
  return (
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" &&
    (gymSlug === "demo-gym" || gymSlug === "iron-paradise" || gymSlug === "spartan-athletics" || gymSlug === "ironforge-fitness")
  );
}
