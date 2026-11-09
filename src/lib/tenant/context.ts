import { GymRole, SystemRole } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — Multi-Tenant Context & Authorization Contracts
// ==============================================================================
// In accordance with Defense-in-Depth architectural guidelines:
// 1. The client NEVER supplies gymId in mutation payloads or trust headers.
// 2. TenantContext is derived exclusively on the server from authenticated sessions.
// 3. Every repository/service operation strictly requires TenantContext.
// ==============================================================================

export interface TenantContext {
  readonly gymId: string;
  readonly userId: string;
  readonly role: GymRole | SystemRole;
  readonly userEmail?: string;
}

export class TenantAccessViolationError extends Error {
  public readonly attemptedGymId: string;
  public readonly authorizedGymId: string;

  constructor(attemptedGymId: string, authorizedGymId: string) {
    super(
      `SECURITY ALERT: Cross-tenant access violation. Session authorized for gym "${authorizedGymId}" attempted access to resource in gym "${attemptedGymId}".`
    );
    this.name = "TenantAccessViolationError";
    this.attemptedGymId = attemptedGymId;
    this.authorizedGymId = authorizedGymId;
  }
}

/**
 * Asserts that a target entity belongs to the tenant authorized in the TenantContext.
 * Throws TenantAccessViolationError if a cross-tenant breach is detected.
 */
export function assertTenantOwnership(
  ctx: TenantContext,
  entityGymId: string | null | undefined
): void {
  if (!entityGymId || ctx.gymId !== entityGymId) {
    throw new TenantAccessViolationError(entityGymId || "UNKNOWN", ctx.gymId);
  }
}

/**
 * Wraps a Prisma query where-clause with mandatory tenant filtering.
 */
export function withTenantFilter<T extends object>(
  ctx: TenantContext,
  filter?: T
): T & { gymId: string } {
  return {
    ...(filter as T),
    gymId: ctx.gymId,
  };
}

