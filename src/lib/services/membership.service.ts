/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import {
  TenantContext,
  assertPermission,
} from "@/lib/tenant/context";
import {
  Membership,
  MembershipPlan,
  MembershipStatus,
  MemberStatus,
} from "@prisma/client";
import {
  PlanCreateInput,
  PlanUpdateInput,
  MembershipAssignInput,
  MembershipRenewInput,
  MembershipExtendInput,
  MembershipPauseInput,
  MembershipResumeInput,
  MembershipCancelInput,
} from "@/lib/validations/membership";

// ==============================================================================
// FIXIA GymOS — Custom Domain Errors for Membership Module
// ==============================================================================

export class PlanNotFoundError extends Error {
  constructor(id: string) {
    super(`Membership plan "${id}" not found or does not belong to this gym.`);
    this.name = "PlanNotFoundError";
  }
}

export class DuplicatePlanError extends Error {
  constructor(name: string) {
    super(`A membership plan named "${name}" already exists for this gym.`);
    this.name = "DuplicatePlanError";
  }
}

export class MembershipNotFoundError extends Error {
  constructor(id: string) {
    super(`Membership "${id}" not found or does not belong to this gym.`);
    this.name = "MembershipNotFoundError";
  }
}

export class OverlappingMembershipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OverlappingMembershipError";
  }
}

export class InvalidMembershipStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidMembershipStateError";
  }
}

// ==============================================================================
// PLAN MANAGEMENT SERVICES
// ==============================================================================

/**
 * Creates a new membership plan for the tenant gym.
 */
export async function createPlan(
  ctx: TenantContext,
  input: PlanCreateInput
): Promise<MembershipPlan> {
  assertPermission(ctx, "PLAN_WRITE");

  // Check unique name constraint within tenant
  const existing = await db.membershipPlan.findUnique({
    where: {
      gymId_name: {
        gymId: ctx.gymId,
        name: input.name,
      },
    },
  });

  if (existing) {
    throw new DuplicatePlanError(input.name);
  }

  return await db.membershipPlan.create({
    data: {
      gymId: ctx.gymId,
      name: input.name,
      description: input.description || null,
      durationDays: input.durationDays,
      price: input.price,
      admissionFee: input.admissionFee ?? 0,
      maxSessions: input.maxSessions ? Number(input.maxSessions) : null,
      benefits: input.benefits || null,
      accessRestrictions: input.accessRestrictions || null,
      isActive: input.isActive ?? true,
    },
  });
}

/**
 * Updates an existing membership plan.
 * Crucial business invariant: changing plan pricing or duration does NOT mutate
 * previously purchased memberships. Existing memberships preserve their original snapshot.
 */
export async function updatePlan(
  ctx: TenantContext,
  input: PlanUpdateInput
): Promise<MembershipPlan> {
  assertPermission(ctx, "PLAN_WRITE");

  const existing = await db.membershipPlan.findUnique({
    where: { id: input.id },
  });

  if (!existing || existing.gymId !== ctx.gymId) {
    throw new PlanNotFoundError(input.id);
  }

  // If renaming, ensure name uniqueness within gym
  if (input.name && input.name !== existing.name) {
    const duplicate = await db.membershipPlan.findUnique({
      where: {
        gymId_name: {
          gymId: ctx.gymId,
          name: input.name,
        },
      },
    });

    if (duplicate && duplicate.id !== input.id) {
      throw new DuplicatePlanError(input.name);
    }
  }

  return await db.membershipPlan.update({
    where: { id: input.id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && {
        description: input.description || null,
      }),
      ...(input.durationDays !== undefined && {
        durationDays: input.durationDays,
      }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.admissionFee !== undefined && {
        admissionFee: input.admissionFee,
      }),
      ...(input.maxSessions !== undefined && {
        maxSessions: input.maxSessions ? Number(input.maxSessions) : null,
      }),
      ...(input.benefits !== undefined && {
        benefits: input.benefits || null,
      }),
      ...(input.accessRestrictions !== undefined && {
        accessRestrictions: input.accessRestrictions || null,
      }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });
}

/**
 * Archives a membership plan so it cannot be assigned to new members,
 * preserving historical records and references.
 */
export async function archivePlan(
  ctx: TenantContext,
  planId: string
): Promise<MembershipPlan> {
  assertPermission(ctx, "PLAN_WRITE");

  const plan = await db.membershipPlan.findUnique({
    where: { id: planId },
  });

  if (!plan || plan.gymId !== ctx.gymId) {
    throw new PlanNotFoundError(planId);
  }

  return await db.membershipPlan.update({
    where: { id: planId },
    data: {
      isArchived: true,
      archivedAt: new Date(),
      isActive: false,
    },
  });
}

/**
 * Retrieves all plans for the tenant gym.
 */
export async function getPlansList(
  ctx: TenantContext,
  options: { includeArchived?: boolean; activeOnly?: boolean } = {}
) {
  assertPermission(ctx, "PLAN_READ");

  const whereClause: any = {
    gymId: ctx.gymId,
  };

  if (!options.includeArchived) {
    whereClause.isArchived = false;
  }

  if (options.activeOnly) {
    whereClause.isActive = true;
  }

  return await db.membershipPlan.findMany({
    where: whereClause,
    orderBy: [{ isActive: "desc" }, { price: "asc" }],
    include: {
      _count: {
        select: {
          memberships: true,
        },
      },
    },
  });
}

/**
 * Retrieves a single plan by ID, verifying tenant isolation.
 */
export async function getPlanById(
  ctx: TenantContext,
  planId: string
): Promise<MembershipPlan> {
  assertPermission(ctx, "PLAN_READ");

  const plan = await db.membershipPlan.findUnique({
    where: { id: planId },
    include: {
      _count: {
        select: {
          memberships: true,
        },
      },
    },
  });

  if (!plan || plan.gymId !== ctx.gymId) {
    throw new PlanNotFoundError(planId);
  }

  return plan;
}

// ==============================================================================
// MEMBERSHIP LIFECYCLE SERVICES
// ==============================================================================

/**
 * Assigns a membership plan to a member.
 * Checks for overlapping active memberships, snapshots plan details and pricing,
 * calculates end date, and records an audit log.
 */
export async function assignMembership(
  ctx: TenantContext,
  input: MembershipAssignInput
): Promise<Membership> {
  assertPermission(ctx, "MEMBERSHIP_WRITE");

  // Validate member exists and belongs to tenant
  const member = await db.member.findUnique({
    where: { id: input.memberId },
    select: { id: true, gymId: true, firstName: true, lastName: true },
  });

  if (!member || member.gymId !== ctx.gymId) {
    throw new Error("Target member not found in this gym workspace.");
  }

  // Validate plan exists and belongs to tenant
  const plan = await db.membershipPlan.findUnique({
    where: { id: input.planId },
  });

  if (!plan || plan.gymId !== ctx.gymId) {
    throw new PlanNotFoundError(input.planId);
  }

  if (plan.isArchived) {
    throw new InvalidMembershipStateError(
      `Cannot assign plan "${plan.name}" because it has been archived.`
    );
  }

  const startDate = input.startDate ? new Date(input.startDate) : new Date();
  if (isNaN(startDate.getTime())) {
    throw new InvalidMembershipStateError("Invalid start date provided.");
  }

  // Check for active overlapping memberships
  const activeExisting = await db.membership.findFirst({
    where: {
      gymId: ctx.gymId,
      memberId: input.memberId,
      status: { in: [MembershipStatus.ACTIVE, MembershipStatus.PAUSED] },
      endDate: { gte: startDate },
    },
    include: { plan: { select: { name: true } } },
  });

  if (activeExisting) {
    throw new OverlappingMembershipError(
      `Member already has an active or paused membership ("${
        activeExisting.planNameSnapshot || activeExisting.plan.name
      }") valid until ${activeExisting.endDate.toLocaleDateString()}. Use renewal or cancel the existing membership first.`
    );
  }

  // Calculate precise end date based on plan duration in days
  const endDate = new Date(
    startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000
  );

  const pricePaid =
    input.customPrice !== undefined && input.customPrice !== null && input.customPrice !== ""
      ? Number(input.customPrice)
      : Number(plan.price);

  const admissionFeePaid =
    input.customAdmissionFee !== undefined &&
    input.customAdmissionFee !== null &&
    input.customAdmissionFee !== ""
      ? Number(input.customAdmissionFee)
      : Number(plan.admissionFee);

  // Execute in transaction: create membership, audit log, and update member status if needed
  return await db.$transaction(async (tx) => {
    const membership = await tx.membership.create({
      data: {
        gymId: ctx.gymId,
        memberId: input.memberId,
        planId: input.planId,
        startDate,
        endDate,
        sessionsRemaining: plan.maxSessions,
        pricePaid,
        admissionFeePaid,
        planNameSnapshot: plan.name,
        status: MembershipStatus.ACTIVE,
        assignedByStaffId: ctx.userId,
      },
    });

    await tx.membershipAuditLog.create({
      data: {
        gymId: ctx.gymId,
        membershipId: membership.id,
        action: "ASSIGNED",
        details: `Assigned plan "${plan.name}" (${plan.durationDays} days) at ${pricePaid} with admission fee ${admissionFeePaid}. Start: ${startDate.toISOString().slice(0, 10)}, End: ${endDate.toISOString().slice(0, 10)}.${input.notes ? ` Notes: ${input.notes}` : ""}`,
        performedBy: ctx.userId,
      },
    });

    // Ensure member is marked ACTIVE in directory
    await tx.member.update({
      where: { id: input.memberId },
      data: { status: MemberStatus.ACTIVE },
    });

    return membership;
  });
}

/**
 * Renews an existing membership.
 * If the current membership is still active, the new membership starts on the current end date.
 * If expired, it starts today or on the specified custom start date.
 */
export async function renewMembership(
  ctx: TenantContext,
  input: MembershipRenewInput
): Promise<Membership> {
  assertPermission(ctx, "MEMBERSHIP_WRITE");

  const currentMembership = await db.membership.findUnique({
    where: { id: input.membershipId },
    include: {
      plan: true,
      member: true,
    },
  });

  if (!currentMembership || currentMembership.gymId !== ctx.gymId) {
    throw new MembershipNotFoundError(input.membershipId);
  }

  // Determine renewal plan (use specified new plan or default to current plan)
  const targetPlanId = input.planId || currentMembership.planId;
  const targetPlan = await db.membershipPlan.findUnique({
    where: { id: targetPlanId },
  });

  if (!targetPlan || targetPlan.gymId !== ctx.gymId) {
    throw new PlanNotFoundError(targetPlanId);
  }

  if (targetPlan.isArchived) {
    throw new InvalidMembershipStateError(
      `Cannot renew with plan "${targetPlan.name}" because it is archived.`
    );
  }

  const now = new Date();
  let startDate: Date;

  if (input.startDate) {
    startDate = new Date(input.startDate);
  } else if (
    currentMembership.status === MembershipStatus.ACTIVE &&
    currentMembership.endDate > now
  ) {
    // Seamless chaining: start right when current membership ends
    startDate = new Date(currentMembership.endDate);
  } else {
    startDate = now;
  }

  if (isNaN(startDate.getTime())) {
    throw new InvalidMembershipStateError("Invalid renewal start date.");
  }

  const endDate = new Date(
    startDate.getTime() + targetPlan.durationDays * 24 * 60 * 60 * 1000
  );

  const pricePaid =
    input.customPrice !== undefined && input.customPrice !== null && input.customPrice !== ""
      ? Number(input.customPrice)
      : Number(targetPlan.price);

  return await db.$transaction(async (tx) => {
    // Create new chained membership
    const newMembership = await tx.membership.create({
      data: {
        gymId: ctx.gymId,
        memberId: currentMembership.memberId,
        planId: targetPlan.id,
        startDate,
        endDate,
        sessionsRemaining: targetPlan.maxSessions,
        pricePaid,
        admissionFeePaid: 0, // No admission fee on renewal
        planNameSnapshot: targetPlan.name,
        status: MembershipStatus.ACTIVE,
        assignedByStaffId: ctx.userId,
      },
    });

    // Audit log for the new membership
    await tx.membershipAuditLog.create({
      data: {
        gymId: ctx.gymId,
        membershipId: newMembership.id,
        action: "RENEWED",
        details: `Renewed following membership #${currentMembership.id}. Plan: "${targetPlan.name}" (${targetPlan.durationDays} days) at ${pricePaid}. Valid ${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}.${input.notes ? ` Notes: ${input.notes}` : ""}`,
        performedBy: ctx.userId,
      },
    });

    // Audit log link on previous membership
    await tx.membershipAuditLog.create({
      data: {
        gymId: ctx.gymId,
        membershipId: currentMembership.id,
        action: "CHAINED_RENEWAL",
        details: `Successor membership #${newMembership.id} created starting on ${startDate.toISOString().slice(0, 10)}.`,
        performedBy: ctx.userId,
      },
    });

    // Ensure member status is ACTIVE
    await tx.member.update({
      where: { id: currentMembership.memberId },
      data: { status: MemberStatus.ACTIVE },
    });

    return newMembership;
  });
}

/**
 * Extends a membership by a specified number of days with audit logging.
 */
export async function extendMembership(
  ctx: TenantContext,
  input: MembershipExtendInput
): Promise<Membership> {
  assertPermission(ctx, "MEMBERSHIP_WRITE");

  const membership = await db.membership.findUnique({
    where: { id: input.membershipId },
  });

  if (!membership || membership.gymId !== ctx.gymId) {
    throw new MembershipNotFoundError(input.membershipId);
  }

  if (membership.status === MembershipStatus.CANCELLED) {
    throw new InvalidMembershipStateError(
      "Cannot extend a cancelled membership."
    );
  }

  const newEndDate = new Date(
    membership.endDate.getTime() + input.extensionDays * 24 * 60 * 60 * 1000
  );

  const restoredStatus =
    membership.status === MembershipStatus.EXPIRED && newEndDate > new Date()
      ? MembershipStatus.ACTIVE
      : membership.status;

  return await db.$transaction(async (tx) => {
    const updated = await tx.membership.update({
      where: { id: input.membershipId },
      data: {
        endDate: newEndDate,
        status: restoredStatus,
        extendedDays: membership.extendedDays + input.extensionDays,
        extensionReason: input.reason,
      },
    });

    await tx.membershipAuditLog.create({
      data: {
        gymId: ctx.gymId,
        membershipId: membership.id,
        action: "EXTENDED",
        details: `Extended by ${input.extensionDays} days from ${membership.endDate.toISOString().slice(0, 10)} to ${newEndDate.toISOString().slice(0, 10)}. Reason: ${input.reason}`,
        performedBy: ctx.userId,
      },
    });

    if (restoredStatus === MembershipStatus.ACTIVE) {
      await tx.member.update({
        where: { id: membership.memberId },
        data: { status: MemberStatus.ACTIVE },
      });
    }

    return updated;
  });
}

/**
 * Pauses an active membership with a specified reason.
 */
export async function pauseMembership(
  ctx: TenantContext,
  input: MembershipPauseInput
): Promise<Membership> {
  assertPermission(ctx, "MEMBERSHIP_WRITE");

  const membership = await db.membership.findUnique({
    where: { id: input.membershipId },
  });

  if (!membership || membership.gymId !== ctx.gymId) {
    throw new MembershipNotFoundError(input.membershipId);
  }

  if (membership.status !== MembershipStatus.ACTIVE) {
    throw new InvalidMembershipStateError(
      `Cannot pause a membership with status "${membership.status}". Only ACTIVE memberships can be paused.`
    );
  }

  const now = new Date();

  return await db.$transaction(async (tx) => {
    const updated = await tx.membership.update({
      where: { id: input.membershipId },
      data: {
        status: MembershipStatus.PAUSED,
        pausedAt: now,
        pauseReason: input.reason,
      },
    });

    await tx.membershipAuditLog.create({
      data: {
        gymId: ctx.gymId,
        membershipId: membership.id,
        action: "PAUSED",
        details: `Paused on ${now.toISOString().slice(0, 10)}. Reason: ${input.reason}`,
        performedBy: ctx.userId,
      },
    });

    return updated;
  });
}

/**
 * Resumes a paused membership, extending the end date by the exact duration it was paused.
 */
export async function resumeMembership(
  ctx: TenantContext,
  input: MembershipResumeInput
): Promise<Membership> {
  assertPermission(ctx, "MEMBERSHIP_WRITE");

  const membership = await db.membership.findUnique({
    where: { id: input.membershipId },
  });

  if (!membership || membership.gymId !== ctx.gymId) {
    throw new MembershipNotFoundError(input.membershipId);
  }

  if (membership.status !== MembershipStatus.PAUSED || !membership.pausedAt) {
    throw new InvalidMembershipStateError(
      "Only PAUSED memberships can be resumed."
    );
  }

  const now = new Date();
  const pausedDurationMs = Math.max(0, now.getTime() - membership.pausedAt.getTime());
  const pausedDays = Math.ceil(pausedDurationMs / (24 * 60 * 60 * 1000));
  const newEndDate = new Date(membership.endDate.getTime() + pausedDurationMs);

  return await db.$transaction(async (tx) => {
    const updated = await tx.membership.update({
      where: { id: input.membershipId },
      data: {
        status: MembershipStatus.ACTIVE,
        pausedAt: null,
        endDate: newEndDate,
      },
    });

    await tx.membershipAuditLog.create({
      data: {
        gymId: ctx.gymId,
        membershipId: membership.id,
        action: "RESUMED",
        details: `Resumed after ${pausedDays} paused day(s). End date extended from ${membership.endDate.toISOString().slice(0, 10)} to ${newEndDate.toISOString().slice(0, 10)}.`,
        performedBy: ctx.userId,
      },
    });

    await tx.member.update({
      where: { id: membership.memberId },
      data: { status: MemberStatus.ACTIVE },
    });

    return updated;
  });
}

/**
 * Cancels a membership with audit reason recording.
 */
export async function cancelMembership(
  ctx: TenantContext,
  input: MembershipCancelInput
): Promise<Membership> {
  assertPermission(ctx, "MEMBERSHIP_WRITE");

  const membership = await db.membership.findUnique({
    where: { id: input.membershipId },
  });

  if (!membership || membership.gymId !== ctx.gymId) {
    throw new MembershipNotFoundError(input.membershipId);
  }

  if (membership.status === MembershipStatus.CANCELLED) {
    throw new InvalidMembershipStateError("Membership is already cancelled.");
  }

  const now = new Date();

  return await db.$transaction(async (tx) => {
    const updated = await tx.membership.update({
      where: { id: input.membershipId },
      data: {
        status: MembershipStatus.CANCELLED,
        cancelledAt: now,
        cancellationReason: input.cancellationReason,
      },
    });

    await tx.membershipAuditLog.create({
      data: {
        gymId: ctx.gymId,
        membershipId: membership.id,
        action: "CANCELLED",
        details: `Cancelled on ${now.toISOString().slice(0, 10)}. Reason: ${input.cancellationReason}`,
        performedBy: ctx.userId,
      },
    });

    // Check if member has other active memberships
    const remainingActive = await tx.membership.count({
      where: {
        gymId: ctx.gymId,
        memberId: membership.memberId,
        status: { in: [MembershipStatus.ACTIVE, MembershipStatus.PAUSED] },
        id: { not: membership.id },
      },
    });

    if (remainingActive === 0) {
      await tx.member.update({
        where: { id: membership.memberId },
        data: { status: MemberStatus.INACTIVE },
      });
    }

    return updated;
  });
}

/**
 * Synchronizes expired memberships for the gym based on current date.
 * If an ACTIVE membership has passed its endDate, transitions it to EXPIRED.
 */
export async function syncExpiredMemberships(
  ctx: TenantContext
): Promise<number> {
  assertPermission(ctx, "MEMBERSHIP_WRITE");

  const now = new Date();

  const expiredList = await db.membership.findMany({
    where: {
      gymId: ctx.gymId,
      status: MembershipStatus.ACTIVE,
      endDate: { lt: now },
    },
    select: { id: true, memberId: true },
  });

  if (expiredList.length === 0) {
    return 0;
  }

  const ids = expiredList.map((m) => m.id);

  await db.membership.updateMany({
    where: {
      id: { in: ids },
      gymId: ctx.gymId,
    },
    data: {
      status: MembershipStatus.EXPIRED,
    },
  });

  return expiredList.length;
}

/**
 * Retrieves memberships expiring within the specified number of days (default 14).
 */
export async function getExpiringMemberships(
  ctx: TenantContext,
  daysAhead = 14
) {
  assertPermission(ctx, "MEMBERSHIP_READ");

  const now = new Date();
  const targetDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  return await db.membership.findMany({
    where: {
      gymId: ctx.gymId,
      status: MembershipStatus.ACTIVE,
      endDate: {
        gte: now,
        lte: targetDate,
      },
    },
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          memberCode: true,
          phone: true,
          email: true,
        },
      },
      plan: {
        select: {
          id: true,
          name: true,
          durationDays: true,
          price: true,
        },
      },
    },
    orderBy: {
      endDate: "asc",
    },
  });
}

/**
 * Retrieves complete membership history for a specific member, including audit logs.
 */
export async function getMemberMembershipHistory(
  ctx: TenantContext,
  memberId: string
) {
  assertPermission(ctx, "MEMBERSHIP_READ");

  const member = await db.member.findUnique({
    where: { id: memberId },
    select: { gymId: true },
  });

  if (!member || member.gymId !== ctx.gymId) {
    throw new Error("Member not found in this gym workspace.");
  }

  return await db.membership.findMany({
    where: {
      gymId: ctx.gymId,
      memberId,
    },
    include: {
      plan: true,
      auditLogs: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: {
      startDate: "desc",
    },
  });
}
