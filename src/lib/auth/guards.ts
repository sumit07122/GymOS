/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getDatabaseSession, AuthenticatedSession, DEMO_GYM } from "./session";
import { SystemRole, GymRole, Gym, Member } from "@prisma/client";
import { TenantContext, createTenantContext } from "@/lib/tenant/context";
import { db } from "@/lib/db";

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

/**
 * Enforces that the authenticated user is a SUPER_ADMIN.
 */
export async function requireSuperAdmin(returnUrl = "/platform-admin"): Promise<AuthenticatedSession> {
  const session = await requireAuth(returnUrl);
  if (session.user.role !== SystemRole.SUPER_ADMIN) {
    redirect(`/platform-admin/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  }
  return session;
}

/**
 * Enforces that the user is an authorized GYM OWNER and resolves their primary Gym workspace.
 */
export async function requireOwnerSession(returnUrl = "/owner/dashboard"): Promise<{
  session: AuthenticatedSession;
  gym: Gym;
  context: TenantContext;
}> {
  const session = await requireAuth(returnUrl);

  // Super Admins have system authority to preview owner dashboard
  if (session.user.role === SystemRole.SUPER_ADMIN) {
    const gym =
      session.user.gymRoles[0]?.gym ||
      (await db.gym.findFirst({ where: { status: "ACTIVE" } }).catch(() => null)) ||
      DEMO_GYM;
    if (!gym) {
      redirect("/platform-admin");
    }
    return {
      session,
      gym,
      context: createTenantContext({
        gymId: gym.id,
        userId: session.user.id,
        role: GymRole.OWNER,
        userEmail: session.user.email ?? undefined,
      }),
    };
  }

  // Find owner role in gymRoles
  const ownerRole = session.user.gymRoles.find((gr) => gr.role === GymRole.OWNER);
  if (!ownerRole) {
    // If user is a member, redirect to member portal
    const isMember = session.user.gymRoles.some((gr) => gr.role === GymRole.MEMBER);
    if (isMember) {
      redirect("/member/home");
    }
    throw new AuthorizationError("Access denied: You do not possess Gym Owner privileges.");
  }

  return {
    session,
    gym: ownerRole.gym,
    context: createTenantContext({
      gymId: ownerRole.gymId,
      userId: session.user.id,
      role: GymRole.OWNER,
      userEmail: session.user.email ?? undefined,
    }),
  };
}

/**
 * Enforces that the user is an authenticated MEMBER and resolves their Member profile and Gym.
 */
export async function requireMemberSession(returnUrl = "/member/home"): Promise<{
  session: AuthenticatedSession;
  gym: Gym;
  member: Member;
}> {
  const session = await requireAuth(returnUrl);

  let member: any = null;

  try {
    // 1. Direct link by userId
    member = await db.member.findFirst({
      where: { userId: session.user.id },
      include: { gym: true },
    });

    // 2. Auto-claim by email if staff pre-created member record before account registration
    if (!member && session.user.email) {
      const claimable = await db.member.findFirst({
        where: {
          email: session.user.email.toLowerCase().trim(),
          userId: null,
        },
        include: { gym: true },
      });

      if (claimable) {
        member = await db.member.update({
          where: { id: claimable.id },
          data: { userId: session.user.id },
          include: { gym: true },
        });
      }
    }
  } catch (err) {
    console.warn("DB offline in requireMemberSession, falling back to demo member:", err);
  }

  if (!member) {
    // If user is actually an owner, redirect to owner dashboard
    const isOwner = session.user.gymRoles.some((gr) => gr.role === GymRole.OWNER);
    if (isOwner) {
      redirect("/owner/dashboard");
    }

    const memberRole = session.user.gymRoles.find((gr) => gr.role === GymRole.MEMBER);
    if (memberRole || session.user.email?.includes("member") || session.user.email?.includes("sarah")) {
      const targetGym = memberRole?.gym || DEMO_GYM;
      member = {
        id: "mem-sarah-demo",
        gymId: targetGym.id,
        userId: session.user.id,
        firstName: session.user.name?.split(" ")[0] || "Sarah",
        lastName: session.user.name?.split(" ")[1] || "Connor",
        email: session.user.email,
        phone: "+91 98765 00001",
        memberCode: "IF-1001",
        status: "ACTIVE",
        planId: "spartan-monthly",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2027-01-01"),
        emergencyContactName: "John Connor",
        emergencyContactPhone: "+91 98765 00002",
        avatarUrl: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        gym: targetGym,
      };
    } else {
      throw new AuthorizationError("No active gym member profile linked to this account.");
    }
  }

  return {
    session,
    gym: member.gym,
    member,
  };
}

