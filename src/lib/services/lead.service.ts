/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import {
  TenantContext,
  assertTenantOwnership,
  assertPermission,
  TenantAccessViolationError,
} from "@/lib/tenant/context";
import {
  Lead,
  LeadActivity,
  LeadStage,
  LeadSource,
  LeadActivityType,
  MemberStatus,
} from "@prisma/client";
import {
  LeadCreateInput,
  LeadUpdateInput,
  LeadStageChangeInput,
  LeadActivityLogInput,
  LeadFollowUpInput,
  LeadConvertInput,
  LeadFilterParams,
} from "@/lib/validations/lead";
import { generateUniqueMemberCode } from "@/lib/services/member.service";

// ==============================================================================
// FIXIA GymOS — Leads & Enquiry Domain Errors
// ==============================================================================

export class LeadNotFoundError extends Error {
  constructor(id: string) {
    super(`Lead "${id}" not found or does not belong to this gym workspace.`);
    this.name = "LeadNotFoundError";
  }
}

export class LeadAlreadyConvertedError extends Error {
  constructor(leadId: string, memberId: string) {
    super(`Lead "${leadId}" has already been converted to member "${memberId}".`);
    this.name = "LeadAlreadyConvertedError";
  }
}

export class DuplicateLeadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateLeadError";
  }
}

export type LeadWithDetails = Lead & {
  assignedStaff?: { id: string; name: string | null; email: string | null } | null;
  interestedPlan?: { id: string; name: string; price: any; durationDays?: number } | null;
  activities: LeadActivity[];
};

// ==============================================================================
// 1. LEAD CREATION
// ==============================================================================

export async function createLead(
  ctx: TenantContext,
  input: LeadCreateInput
): Promise<Lead & { activities: LeadActivity[] }> {
  assertPermission(ctx, "LEAD_CREATE");

  // Validate assigned staff belongs to current gym workspace
  if (input.assignedStaffId && input.assignedStaffId.trim()) {
    const staffRole = await db.userGymRole.findFirst({
      where: {
        userId: input.assignedStaffId.trim(),
        gymId: ctx.gymId,
      },
    });
    if (!staffRole) {
      throw new TenantAccessViolationError(input.assignedStaffId.trim(), ctx.gymId);
    }
  }

  // Validate interested plan if supplied
  if (input.interestedPlanId && input.interestedPlanId.trim()) {
    const plan = await db.membershipPlan.findUnique({
      where: { id: input.interestedPlanId.trim() },
      select: { id: true, gymId: true },
    });
    if (plan) {
      assertTenantOwnership(ctx, plan.gymId);
    }
  }

  const trialDate = input.trialDate ? new Date(input.trialDate) : null;
  const followUpDate = input.followUpDate ? new Date(input.followUpDate) : null;

  return await db.$transaction(async (tx) => {
    const lead = await tx.lead.create({
      data: {
        gymId: ctx.gymId,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone.trim(),
        email: input.email?.trim() || null,
        source: input.source || LeadSource.WALK_IN,
        stage: input.stage || LeadStage.NEW,
        interestedPlanId: input.interestedPlanId?.trim() || null,
        assignedStaffId: input.assignedStaffId?.trim() || null,
        trialDate,
        followUpDate,
        followUpNotes: input.followUpNotes?.trim() || null,
        notes: input.notes?.trim() || null,
      },
    });

    // Create initial activity log
    const activity = await tx.leadActivity.create({
      data: {
        gymId: ctx.gymId,
        leadId: lead.id,
        staffUserId: ctx.userId,
        staffName: ctx.userEmail || "Staff Member",
        type: LeadActivityType.VISIT_NOTE,
        notes: `Enquiry created via ${lead.source.replace("_", " ")}.${
          lead.notes ? ` Notes: ${lead.notes}` : ""
        }`,
      },
    });

    return {
      ...lead,
      activities: [activity],
    };
  });
}

// ==============================================================================
// 2. LEAD UPDATE
// ==============================================================================

export async function updateLead(
  ctx: TenantContext,
  input: LeadUpdateInput
): Promise<Lead> {
  assertPermission(ctx, "LEAD_UPDATE");

  const existingLead = await db.lead.findUnique({
    where: { id: input.leadId },
  });

  if (!existingLead) {
    throw new LeadNotFoundError(input.leadId);
  }
  assertTenantOwnership(ctx, existingLead.gymId);

  // Validate assigned staff if modified
  if (input.assignedStaffId && input.assignedStaffId.trim()) {
    const staffRole = await db.userGymRole.findFirst({
      where: {
        userId: input.assignedStaffId.trim(),
        gymId: ctx.gymId,
      },
    });
    if (!staffRole) {
      throw new TenantAccessViolationError(input.assignedStaffId.trim(), ctx.gymId);
    }
  }

  const trialDate = input.trialDate ? new Date(input.trialDate) : null;
  const followUpDate = input.followUpDate ? new Date(input.followUpDate) : null;

  return await db.$transaction(async (tx) => {
    const updated = await tx.lead.update({
      where: { id: input.leadId },
      data: {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone.trim(),
        email: input.email?.trim() || null,
        source: input.source,
        interestedPlanId: input.interestedPlanId?.trim() || null,
        assignedStaffId: input.assignedStaffId?.trim() || null,
        trialDate,
        followUpDate,
        followUpNotes: input.followUpNotes?.trim() || null,
        notes: input.notes?.trim() || null,
      },
    });

    await tx.leadActivity.create({
      data: {
        gymId: ctx.gymId,
        leadId: updated.id,
        staffUserId: ctx.userId,
        staffName: ctx.userEmail || "Staff Member",
        type: LeadActivityType.VISIT_NOTE,
        notes: "Lead contact and preference information updated.",
      },
    });

    return updated;
  });
}

// ==============================================================================
// 3. PIPELINE STAGE CHANGE
// ==============================================================================

export async function changeLeadStatus(
  ctx: TenantContext,
  input: LeadStageChangeInput
): Promise<Lead> {
  assertPermission(ctx, "LEAD_UPDATE");

  const lead = await db.lead.findUnique({
    where: { id: input.leadId },
  });

  if (!lead) {
    throw new LeadNotFoundError(input.leadId);
  }
  assertTenantOwnership(ctx, lead.gymId);

  const previousStage = lead.stage;
  const newStage = input.stage;

  return await db.$transaction(async (tx) => {
    const updated = await tx.lead.update({
      where: { id: input.leadId },
      data: {
        stage: newStage,
        lostReason: newStage === LeadStage.LOST ? input.lostReason?.trim() || null : null,
      },
    });

    const notesSummary = `Stage updated from "${previousStage}" to "${newStage}".${
      input.lostReason ? ` Reason: ${input.lostReason}` : ""
    }${input.notes ? ` Memo: ${input.notes}` : ""}`;

    await tx.leadActivity.create({
      data: {
        gymId: ctx.gymId,
        leadId: lead.id,
        staffUserId: ctx.userId,
        staffName: ctx.userEmail || "Staff Member",
        type: LeadActivityType.STAGE_CHANGE,
        notes: notesSummary,
      },
    });

    return updated;
  });
}

// ==============================================================================
// 4. MANUAL CALL / CONVERSATION LOGGING
// ==============================================================================

export async function logLeadActivity(
  ctx: TenantContext,
  input: LeadActivityLogInput
): Promise<LeadActivity> {
  assertPermission(ctx, "LEAD_UPDATE");

  const lead = await db.lead.findUnique({
    where: { id: input.leadId },
  });

  if (!lead) {
    throw new LeadNotFoundError(input.leadId);
  }
  assertTenantOwnership(ctx, lead.gymId);

  return await db.leadActivity.create({
    data: {
      gymId: ctx.gymId,
      leadId: lead.id,
      staffUserId: ctx.userId,
      staffName: ctx.userEmail || "Staff Member",
      type: input.type,
      notes: input.notes.trim(),
    },
  });
}

// ==============================================================================
// 5. FOLLOW-UP REMINDER SCHEDULING
// ==============================================================================

export async function scheduleFollowUp(
  ctx: TenantContext,
  input: LeadFollowUpInput
): Promise<Lead> {
  assertPermission(ctx, "LEAD_UPDATE");

  const lead = await db.lead.findUnique({
    where: { id: input.leadId },
  });

  if (!lead) {
    throw new LeadNotFoundError(input.leadId);
  }
  assertTenantOwnership(ctx, lead.gymId);

  const followUpDate = new Date(input.followUpDate);

  return await db.$transaction(async (tx) => {
    const updated = await tx.lead.update({
      where: { id: input.leadId },
      data: {
        followUpDate,
        followUpNotes: input.followUpNotes?.trim() || null,
      },
    });

    await tx.leadActivity.create({
      data: {
        gymId: ctx.gymId,
        leadId: lead.id,
        staffUserId: ctx.userId,
        staffName: ctx.userEmail || "Staff Member",
        type: LeadActivityType.FOLLOW_UP_SCHEDULED,
        notes: `Follow-up scheduled for ${followUpDate.toLocaleDateString()}.${
          input.followUpNotes ? ` Reminder memo: ${input.followUpNotes}` : ""
        }`,
      },
    });

    return updated;
  });
}

// ==============================================================================
// 6. CONVERT LEAD TO MEMBER (ANTI-DUPLICATE INTEGRITY)
// ==============================================================================

export interface LeadConversionResult {
  lead: Lead;
  member: any;
  isExistingMember: boolean;
  membershipCreated?: boolean;
}

export async function convertLeadToMember(
  ctx: TenantContext,
  input: LeadConvertInput
): Promise<LeadConversionResult> {
  assertPermission(ctx, "LEAD_CONVERT");

  const lead = await db.lead.findUnique({
    where: { id: input.leadId },
    include: { interestedPlan: true },
  });

  if (!lead) {
    throw new LeadNotFoundError(input.leadId);
  }
  assertTenantOwnership(ctx, lead.gymId);

  if (lead.convertedMemberId) {
    throw new LeadAlreadyConvertedError(lead.id, lead.convertedMemberId);
  }

  // 1. Anti-Duplicate Check: Check if member already exists by phone or email
  const existingMember = await db.member.findFirst({
    where: {
      gymId: ctx.gymId,
      OR: [
        { phone: lead.phone },
        ...(lead.email ? [{ email: lead.email }] : []),
      ],
    },
  });

  const now = new Date();

  // If member already exists, link lead history to existing member record
  if (existingMember) {
    const updatedLead = await db.$transaction(async (tx) => {
      const l = await tx.lead.update({
        where: { id: lead.id },
        data: {
          stage: LeadStage.CONVERTED,
          convertedMemberId: existingMember.id,
          convertedAt: now,
        },
      });

      await tx.leadActivity.create({
        data: {
          gymId: ctx.gymId,
          leadId: lead.id,
          staffUserId: ctx.userId,
          staffName: ctx.userEmail || "Staff Member",
          type: LeadActivityType.CONVERTED,
          notes: `Prospect converted and linked to existing gym member ${existingMember.firstName} ${existingMember.lastName} (${existingMember.memberCode}).`,
        },
      });

      return l;
    });

    return {
      lead: updatedLead,
      member: existingMember,
      isExistingMember: true,
      membershipCreated: false,
    };
  }

  // 2. Otherwise create a fresh member and link
  const memberCode = await generateUniqueMemberCode(ctx.gymId);

  return await db.$transaction(async (tx) => {
    const newMember = await tx.member.create({
      data: {
        gymId: ctx.gymId,
        memberCode,
        firstName: lead.firstName,
        lastName: lead.lastName,
        phone: lead.phone,
        email: lead.email,
        status: MemberStatus.ACTIVE,
        joiningDate: now,
        internalNotes: `Converted from enquiry lead (${lead.source}).${
          lead.notes ? ` Lead notes: ${lead.notes}` : ""
        }`,
      },
    });

    const updatedLead = await tx.lead.update({
      where: { id: lead.id },
      data: {
        stage: LeadStage.CONVERTED,
        convertedMemberId: newMember.id,
        convertedAt: now,
      },
    });

    await tx.leadActivity.create({
      data: {
        gymId: ctx.gymId,
        leadId: lead.id,
        staffUserId: ctx.userId,
        staffName: ctx.userEmail || "Staff Member",
        type: LeadActivityType.CONVERTED,
        notes: `Converted to active gym member (${newMember.memberCode}).`,
      },
    });

    let membershipCreated = false;

    // 3. Optional initial membership assignment
    const targetPlanId = input.planId || lead.interestedPlanId;
    if (input.createMembership && targetPlanId) {
      const plan = await tx.membershipPlan.findUnique({
        where: { id: targetPlanId },
      });

      if (plan && plan.gymId === ctx.gymId) {
        const startDate = input.startDate ? new Date(input.startDate) : now;
        const endDate = new Date(startDate.getTime() + plan.durationDays * 86400000);

        await tx.membership.create({
          data: {
            gymId: ctx.gymId,
            memberId: newMember.id,
            planId: plan.id,
            startDate,
            endDate,
            pricePaid: plan.price,
            admissionFeePaid: plan.admissionFee,
            planNameSnapshot: plan.name,
            assignedByStaffId: ctx.userId,
            assignedByStaffName: ctx.userEmail || "Staff Member",
          },
        });
        membershipCreated = true;
      }
    }

    return {
      lead: updatedLead,
      member: newMember,
      isExistingMember: false,
      membershipCreated,
    };
  });
}

// ==============================================================================
// 7. LIST & FILTER LEADS
// ==============================================================================

export async function getLeadsList(
  ctx: TenantContext,
  params: Partial<LeadFilterParams> = {}
) {
  assertPermission(ctx, "LEAD_READ");

  const {
    stage,
    source,
    assignedStaffId,
    followUpFilter,
    search,
  } = params;

  const pageNum = Number(params.page || 1);
  const limitNum = Number(params.limit || 50);
  const offset = (pageNum - 1) * limitNum;
  const where: any = { gymId: ctx.gymId };

  if (stage && stage !== "ALL") {
    where.stage = stage;
  }

  if (source && source !== "ALL") {
    where.source = source;
  }

  if (assignedStaffId && assignedStaffId !== "ALL") {
    where.assignedStaffId = assignedStaffId;
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (followUpFilter === "OVERDUE") {
    where.followUpDate = { lt: startOfToday };
    where.stage = { notIn: [LeadStage.CONVERTED, LeadStage.LOST] };
  } else if (followUpFilter === "TODAY") {
    where.followUpDate = { gte: startOfToday, lte: endOfToday };
    where.stage = { notIn: [LeadStage.CONVERTED, LeadStage.LOST] };
  } else if (followUpFilter === "UPCOMING") {
    where.followUpDate = { gt: endOfToday };
    where.stage = { notIn: [LeadStage.CONVERTED, LeadStage.LOST] };
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { notes: { contains: q, mode: "insensitive" } },
    ];
  }

  const [leads, total] = await Promise.all([
    db.lead.findMany({
      where,
      orderBy: [{ stage: "asc" }, { createdAt: "desc" }],
      take: limitNum,
      skip: offset,
      include: {
        assignedStaff: { select: { id: true, name: true, email: true } },
        interestedPlan: { select: { id: true, name: true, price: true } },
        activities: {
          orderBy: { performedAt: "desc" },
          take: 5,
        },
      },
    }),
    db.lead.count({ where }),
  ]);

  return {
    leads: leads as LeadWithDetails[],
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    limit: limitNum,
  };
}

// ==============================================================================
// 8. RETRIEVE LEAD DETAILS
// ==============================================================================

export async function getLeadById(ctx: TenantContext, id: string) {
  assertPermission(ctx, "LEAD_READ");

  const lead = await db.lead.findUnique({
    where: { id },
    include: {
      assignedStaff: { select: { id: true, name: true, email: true } },
      interestedPlan: { select: { id: true, name: true, price: true, durationDays: true } },
      activities: {
        orderBy: { performedAt: "desc" },
      },
    },
  });

  if (!lead || lead.gymId !== ctx.gymId) {
    throw new LeadNotFoundError(id);
  }

  return lead;
}

// ==============================================================================
// 9. LEAD CRM METRICS & CONVERSION TRACKING
// ==============================================================================

export interface LeadCrmMetrics {
  totalLeads: number;
  activePipelineLeads: number;
  stageCounts: Record<string, number>;
  sourceCounts: Record<string, number>;
  conversionRate: number;
  followUps: {
    overdue: number;
    today: number;
    upcoming: number;
  };
}

export async function getLeadMetrics(ctx: TenantContext): Promise<LeadCrmMetrics> {
  assertPermission(ctx, "LEAD_READ");

  const gymId = ctx.gymId;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const [
    totalLeads,
    convertedCount,
    stageGroups,
    sourceGroups,
    overdueFollowUps,
    todayFollowUps,
    upcomingFollowUps,
  ] = await Promise.all([
    db.lead.count({ where: { gymId } }),
    db.lead.count({ where: { gymId, stage: LeadStage.CONVERTED } }),
    db.lead.groupBy({
      by: ["stage"],
      where: { gymId },
      _count: { id: true },
    }),
    db.lead.groupBy({
      by: ["source"],
      where: { gymId },
      _count: { id: true },
    }),
    db.lead.count({
      where: {
        gymId,
        followUpDate: { lt: startOfToday },
        stage: { notIn: [LeadStage.CONVERTED, LeadStage.LOST] },
      },
    }),
    db.lead.count({
      where: {
        gymId,
        followUpDate: { gte: startOfToday, lte: endOfToday },
        stage: { notIn: [LeadStage.CONVERTED, LeadStage.LOST] },
      },
    }),
    db.lead.count({
      where: {
        gymId,
        followUpDate: { gt: endOfToday },
        stage: { notIn: [LeadStage.CONVERTED, LeadStage.LOST] },
      },
    }),
  ]);

  const stageCounts: Record<string, number> = {
    NEW: 0,
    CONTACTED: 0,
    INTERESTED: 0,
    TRIAL_SCHEDULED: 0,
    TRIAL_COMPLETED: 0,
    CONVERTED: 0,
    LOST: 0,
  };

  stageGroups.forEach((g) => {
    stageCounts[g.stage] = g._count.id;
  });

  const sourceCounts: Record<string, number> = {
    WALK_IN: 0,
    WEBSITE: 0,
    REFERRAL: 0,
    PHONE: 0,
    SOCIAL_MEDIA: 0,
    OTHER: 0,
  };

  sourceGroups.forEach((g) => {
    sourceCounts[g.source] = g._count.id;
  });

  const activePipelineLeads =
    (stageCounts["NEW"] || 0) +
    (stageCounts["CONTACTED"] || 0) +
    (stageCounts["INTERESTED"] || 0) +
    (stageCounts["TRIAL_SCHEDULED"] || 0);

  const conversionRate = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;

  return {
    totalLeads,
    activePipelineLeads,
    stageCounts,
    sourceCounts,
    conversionRate,
    followUps: {
      overdue: overdueFollowUps,
      today: todayFollowUps,
      upcoming: upcomingFollowUps,
    },
  };
}

