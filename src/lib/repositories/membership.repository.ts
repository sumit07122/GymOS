import { db } from "@/lib/db";
import {
  TenantContext,
  assertTenantOwnership,
  assertPermission,
} from "@/lib/tenant/context";
import { Membership, MembershipStatus } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — Tenant-Scoped Membership Repository
// ==============================================================================
// Prevents cross-tenant relationship injection:
// Validates that both the Member and the MembershipPlan belong to ctx.gymId.
// ==============================================================================

export interface CreateMembershipData {
  memberId: string;
  planId: string;
  startDate: Date;
  endDate: Date;
  sessionsRemaining?: number;
}

export const membershipRepository = {
  /**
   * Creates a membership, strictly validating that both the target Member
   * and the target MembershipPlan belong to ctx.gymId.
   */
  async create(
    ctx: TenantContext,
    data: CreateMembershipData
  ): Promise<Membership> {
    assertPermission(ctx, "MEMBER_UPDATE");

    // 1. Verify Member tenant ownership
    const member = await db.member.findUnique({
      where: { id: data.memberId },
    });
    if (!member) {
      throw new Error(`Member with ID "${data.memberId}" does not exist.`);
    }
    assertTenantOwnership(ctx, member.gymId);

    // 2. Verify Plan tenant ownership (PREVENT CROSS-GYM PLAN INJECTION)
    const plan = await db.membershipPlan.findUnique({
      where: { id: data.planId },
    });
    if (!plan) {
      throw new Error(`Membership plan with ID "${data.planId}" does not exist.`);
    }
    assertTenantOwnership(ctx, plan.gymId);

    // 3. Create membership scoped to ctx.gymId
    return db.membership.create({
      data: {
        gymId: ctx.gymId,
        memberId: data.memberId,
        planId: data.planId,
        startDate: data.startDate,
        endDate: data.endDate,
        sessionsRemaining: data.sessionsRemaining,
        status: MembershipStatus.ACTIVE,
      },
    });
  },

  /**
   * Retrieves a membership by ID, enforcing tenant ownership.
   */
  async findById(ctx: TenantContext, id: string): Promise<Membership | null> {
    assertPermission(ctx, "MEMBER_READ");

    const membership = await db.membership.findUnique({
      where: { id },
      include: {
        member: true,
        plan: true,
      },
    });

    if (!membership) {
      return null;
    }

    assertTenantOwnership(ctx, membership.gymId);

    return membership;
  },

  /**
   * Updates membership status (e.g., Cancel, Freeze, Expire).
   */
  async updateStatus(
    ctx: TenantContext,
    id: string,
    status: MembershipStatus
  ): Promise<Membership> {
    assertPermission(ctx, "MEMBER_UPDATE");

    const existing = await db.membership.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error(`Membership with ID "${id}" does not exist.`);
    }

    assertTenantOwnership(ctx, existing.gymId);

    return db.membership.update({
      where: { id },
      data: { status },
    });
  },
};

