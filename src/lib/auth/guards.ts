import { redirect } from "next/navigation";
import { getDatabaseSession, AuthenticatedSession } from "./session";
import { SystemRole, GymRole } from "@prisma/client";
import { TenantContext, createTenantContext } from "@/lib/tenant/context";

// ==============================================================================
// FIXIA GymOS — Server-Side Role-Based Authorization Guards
// ==============================================================================
// Enforces server-side permission checks.
// NEVER trusts client-supplied roles, claims, or identifiers.
// ==============================================================================

export class AuthorizationError extends Error {
  constructor(message = "Unauthorized: Insufficient role permissions.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Enforces that a request has an authenticated database session.
 * If unauthenticated, redirects to /login with redirect parameter.
 */
export async function requireAuth(returnUrl?: string): Promise<AuthenticatedSession> {
  const session = await getDatabaseSession();
  if (!session) {
    const query = returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : "";
    redirect(`/login${query}`);
  }
  return session;
}

/**
 * Enforces that the authenticated user possesses one of the allowed SystemRoles.
 */
export async function requireSystemRole(
  allowedRoles: SystemRole[]
): Promise<AuthenticatedSession> {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.user.role)) {
    throw new AuthorizationError(
      `Access denied. Role "${session.user.role}" does not have required privileges.`
    );
  }

  return session;
}

/**
 * Enforces that the user has an authorized role within a specific Gym tenant.
 * Returns the resolved TenantContext.
 */
export async function requireGymAccess(
  gymId: string,
  allowedRoles: GymRole[] = [GymRole.OWNER, GymRole.STAFF]
): Promise<{ session: AuthenticatedSession; context: TenantContext }> {
  const session = await requireAuth();

  // Super admins have system-wide bypass authority
  if (session.user.role === SystemRole.SUPER_ADMIN) {
    return {
      session,
      context: createTenantContext({
        gymId,
        userId: session.user.id,
        role: SystemRole.SUPER_ADMIN,
        userEmail: session.user.email ?? undefined,
      }),
    };
  }

  // Look up user's role mapping for this gym
  const matchingRole = session.user.gymRoles.find(
    (gr) => gr.gymId === gymId && allowedRoles.includes(gr.role)
  );

  if (!matchingRole) {
    throw new AuthorizationError(
      `Access denied. You do not have an active role in gym "${gymId}".`
    );
  }

  return {
    session,
    context: createTenantContext({
      gymId: matchingRole.gymId,
      userId: session.user.id,
      role: matchingRole.role,
      userEmail: session.user.email ?? undefined,
    }),
  };
}

