/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import { getDatabaseSession } from "@/lib/auth/session";
import {
  TenantContext,
  createTenantContext,
  TenantAccessViolationError,
} from "./context";
import { SystemRole } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — Server-Side Tenant Context Resolution
// ==============================================================================
// Invariant: The client browser NEVER supplies or dictates the tenant ID.
// TenantContext is derived strictly on the server from authenticated sessions
// and verified user-gym relational membership records.
// ==============================================================================

export class TenantSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantSecurityError";
  }
}

export class TenantNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Gym workspace "${identifier}" not found or inactive.`);
    this.name = "TenantNotFoundError";
  }
}

/**
 * Resolves the authenticated, trusted TenantContext on the server.
 *
 * @param gymSlugOrId Optional gym slug or ID (from validated server route URL).
 * If supplied, strictly verifies that the user possesses an active role in that gym.
 */
export async function resolveTenantContext(
  gymSlugOrId?: string
): Promise<TenantContext> {
  const session = await getDatabaseSession();

  if (!session) {
    throw new TenantSecurityError(
      "Unauthenticated request: Active database session required to resolve tenant context."
    );
  }

  const { user } = session;

  // 1. Super Admin Context
  if (user.role === SystemRole.SUPER_ADMIN) {
    let targetGymId = "system-platform";
    if (gymSlugOrId) {
      try {
        const targetGym = await db.gym.findFirst({
          where: {
            OR: [{ id: gymSlugOrId }, { slug: gymSlugOrId }],
          },
        });
        if (targetGym) {
          targetGymId = targetGym.id;
        }
      } catch (err) {
        console.warn("DB offline in resolveTenantContext super admin check:", err);
      }
    }
    return createTenantContext({
      gymId: targetGymId,
      userId: user.id,
      role: SystemRole.SUPER_ADMIN,
      userEmail: user.email ?? undefined,
    });
  }

  // 2. Tenant Scoping by URL Gym Identifier (Slug or ID)
  if (gymSlugOrId) {
    let targetGym: any = null;
    try {
      targetGym = await db.gym.findFirst({
        where: {
          OR: [{ id: gymSlugOrId }, { slug: gymSlugOrId }],
        },
      });
    } catch (err) {
      console.warn("DB offline in resolveTenantContext gym lookup:", err);
    }

    if (!targetGym) {
      // Offline fallback: match against user's existing gymRoles
      const matchingGymRole = user.gymRoles.find(
        (gr) => gr.gym?.slug === gymSlugOrId || gr.gymId === gymSlugOrId || gr.gym?.id === gymSlugOrId
      );
      if (matchingGymRole) {
        targetGym = matchingGymRole.gym;
      }
    }

    if (!targetGym) {
      throw new TenantNotFoundError(gymSlugOrId);
    }

    // Verify user membership in target gym
    const matchingRole = user.gymRoles.find(
      (gr) => gr.gymId === targetGym.id || gr.gym?.slug === targetGym.slug
    );

    if (!matchingRole) {
      throw new TenantAccessViolationError(targetGym.id, "UNAUTHORIZED_GYM");
    }

    return createTenantContext({
      gymId: targetGym.id,
      userId: user.id,
      role: matchingRole.role,
      userEmail: user.email ?? undefined,
    });
  }

  // 3. Default to User's Primary Registered Gym
  const primaryRole =
    user.gymRoles.find((gr) => gr.isPrimary) || user.gymRoles[0];

  if (!primaryRole) {
    throw new TenantSecurityError(
      `User "${user.id}" has no active gym membership or role association.`
    );
  }

  return createTenantContext({
    gymId: primaryRole.gymId,
    userId: user.id,
    role: primaryRole.role,
    userEmail: user.email ?? undefined,
  });
}

