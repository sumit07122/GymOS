import { db } from "@/lib/db";
import crypto from "crypto";
import {
  SystemRole,
  GymRole,
  GymStatus,
  SaasSubscriptionStatus,
  SaasBillingPeriod,
  PaymentMethod,
  InvoiceStatus,
  PaymentStatus,
} from "@prisma/client";
import {
  SaasPlanInput,
  AssignSubscriptionInput,
  OnboardGymInput,
  SubscriptionAddonInput,
  RecordSubscriptionPaymentInput,
} from "@/lib/validations/saas-admin";
import { SaasFeature } from "@/lib/saas/entitlements";
import { hashPassword } from "@/lib/auth/password";

// ==============================================================================
// FIXIA GymOS — Platform Administration Service (M19)
// ==============================================================================
// INVARIANTS:
// 1. Strict SUPER_ADMIN Isolation: All platform administration functions verify
//    that the caller possesses SystemRole.SUPER_ADMIN.
// 2. Comprehensive Audit Trail: Every sensitive platform action (suspending a gym,
//    changing plan pricing, overriding entitlements) creates a PlatformAuditLog.
// 3. Separation of Concerns: FIXIA SaaS subscriptions (what gyms pay FIXIA) are
//    kept completely separate from gym membership plans (what members pay gyms).
// 4. Zero Fabricated Metrics: Platform dashboard aggregates real database rows.
// ==============================================================================

export class PlatformAuthorizationError extends Error {
  constructor(message = "Unauthorized: Platform Super Admin privilege required.") {
    super(message);
    this.name = "PlatformAuthorizationError";
  }
}

/**
 * Ensures caller is SUPER_ADMIN
 */
export async function assertSuperAdminUser(adminUserId: string) {
  const user = await db.user.findUnique({
    where: { id: adminUserId },
    select: { id: true, role: true, email: true },
  });

  if (!user || user.role !== SystemRole.SUPER_ADMIN) {
    throw new PlatformAuthorizationError(
      `Access denied. User "${adminUserId}" does not possess SUPER_ADMIN authority.`
    );
  }

  return user;
}

/**
 * Automatically provisions default FIXIA SaaS subscription tiers if empty.
 */
export async function seedDefaultSaasPlansIfEmpty() {
  const count = await db.saasPlan.count();
  if (count > 0) return;

  const starterFeatures = [
    SaasFeature.CORE_MEMBERS,
    SaasFeature.CORE_PLANS,
    SaasFeature.ATTENDANCE_QR,
    SaasFeature.BILLING_INVOICING,
    SaasFeature.MEMBER_PORTAL,
  ];

  const proFeatures = [
    ...starterFeatures,
    SaasFeature.CRM_LEADS,
    SaasFeature.EXPENSE_TRACKING,
    SaasFeature.CLASS_SCHEDULING,
    SaasFeature.INVENTORY_MANAGEMENT,
    SaasFeature.WORKOUT_PLANS,
    SaasFeature.PUBLIC_WEBSITE,
  ];

  const enterpriseFeatures = [
    ...proFeatures,
    SaasFeature.WHATSAPP_NOTIFICATIONS,
    SaasFeature.BUSINESS_ANALYTICS,
  ];

  await db.saasPlan.createMany({
    data: [
      {
        name: "Starter Studio",
        code: "STARTER",
        description: "Essential gym operations for boutique gyms and single studios.",
        monthlyPrice: 29.0,
        quarterlyPrice: 79.0,
        yearlyPrice: 290.0,
        trialDays: 14,
        gracePeriodDays: 7,
        maxMembers: 100,
        maxStaff: 3,
        maxClasses: 10,
        features: JSON.stringify(starterFeatures),
        isActive: true,
      },
      {
        name: "Growth Athletic",
        code: "GROWTH",
        description: "Scale operations with CRM leads, group classes, inventory, and website.",
        monthlyPrice: 59.0,
        quarterlyPrice: 159.0,
        yearlyPrice: 590.0,
        trialDays: 14,
        gracePeriodDays: 7,
        maxMembers: 300,
        maxStaff: 6,
        maxClasses: 30,
        features: JSON.stringify(proFeatures),
        isActive: true,
      },
      {
        name: "Professional Pro",
        code: "PRO",
        description: "Full-scale fitness management with WhatsApp automation, analytics, and priority.",
        monthlyPrice: 99.0,
        quarterlyPrice: 269.0,
        yearlyPrice: 990.0,
        trialDays: 30,
        gracePeriodDays: 14,
        maxMembers: -1,
        maxStaff: -1,
        maxClasses: -1,
        features: JSON.stringify(enterpriseFeatures),
        isActive: true,
      },
    ],
  });

  const addonCount = await db.subscriptionAddon.count();
  if (addonCount === 0) {
    await db.subscriptionAddon.createMany({
      data: [
        {
          name: "WhatsApp Pro Automation",
          code: "WHATSAPP_PRO",
          description: "Automated WhatsApp payment receipts, renewal reminders, and alerts.",
          monthlyPrice: 19.0,
          yearlyPrice: 190.0,
          featureKey: SaasFeature.WHATSAPP_NOTIFICATIONS,
          isActive: true,
        },
        {
          name: "Advanced Business Analytics",
          code: "ADVANCED_ANALYTICS",
          description: "Executive P&L reporting, churn analytics, and CSV financial exports.",
          monthlyPrice: 25.0,
          yearlyPrice: 250.0,
          featureKey: SaasFeature.BUSINESS_ANALYTICS,
          isActive: true,
        },
        {
          name: "Custom Branded Domain",
          code: "CUSTOM_DOMAIN",
          description: "Host member portal and public site on custom domain e.g. gym.com.",
          monthlyPrice: 15.0,
          yearlyPrice: 150.0,
          featureKey: SaasFeature.PUBLIC_WEBSITE,
          isActive: true,
        },
      ],
    });
  }
}

/**
 * 1. Platform Executive Dashboard Overview
 */
export async function getPlatformOverviewMetrics(adminUserId: string) {
  await assertSuperAdminUser(adminUserId);
  await seedDefaultSaasPlansIfEmpty();

  const [
    totalGyms,
    activeGyms,
    suspendedGyms,
    trialGyms,
    inactiveGyms,
    totalMembers,
    subscriptions,
    recentGyms,
    recentAuditLogs,
  ] = await Promise.all([
    db.gym.count(),
    db.gym.count({ where: { status: GymStatus.ACTIVE } }),
    db.gym.count({ where: { status: GymStatus.SUSPENDED } }),
    db.gym.count({ where: { status: GymStatus.TRIAL } }),
    db.gym.count({ where: { status: GymStatus.INACTIVE } }),
    db.member.count(),
    db.gymSubscription.findMany({
      include: { plan: true },
    }),
    db.gym.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        createdAt: true,
        currency: true,
        subscription: {
          select: {
            status: true,
            billingPeriod: true,
            plan: { select: { name: true, code: true } },
          },
        },
        _count: {
          select: { members: true },
        },
      },
    }),
    db.platformAuditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        gym: { select: { name: true, slug: true } },
      },
    }),
  ]);

  // Aggregate subscription statuses
  const subscriptionCounts = {
    ACTIVE: 0,
    TRIALING: 0,
    PAST_DUE: 0,
    SUSPENDED: 0,
    CANCELLED: 0,
    UNASSIGNED: Math.max(0, totalGyms - subscriptions.length),
  };

  let monthlyRecurringRevenue = 0;

  for (const s of subscriptions) {
    if (s.status in subscriptionCounts) {
      subscriptionCounts[s.status as keyof typeof subscriptionCounts]++;
    }

    // Compute MRR from active paying subscriptions
    if (s.status === SaasSubscriptionStatus.ACTIVE) {
      if (s.billingPeriod === SaasBillingPeriod.MONTHLY) {
        monthlyRecurringRevenue += Number(s.plan.monthlyPrice);
      } else if (s.billingPeriod === SaasBillingPeriod.YEARLY) {
        monthlyRecurringRevenue += Number(s.plan.yearlyPrice) / 12;
      }
    }
  }

  return {
    gymMetrics: {
      totalGyms,
      activeGyms,
      suspendedGyms,
      trialGyms,
      inactiveGyms,
      totalMembers,
    },
    subscriptionMetrics: {
      subscriptionCounts,
      totalSubscriptions: subscriptions.length,
      monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue * 100) / 100,
    },
    recentGyms: recentGyms.map((g) => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      status: g.status,
      createdAt: g.createdAt.toISOString(),
      memberCount: g._count.members,
      subscriptionPlan: g.subscription?.plan?.name || "No Plan",
      subscriptionStatus: g.subscription?.status || "NONE",
    })),
    recentAuditLogs: recentAuditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      details: log.details,
      createdAt: log.createdAt.toISOString(),
      adminEmail: log.user.email || log.user.name || "Super Admin",
      gymName: log.gym?.name || null,
    })),
  };
}

/**
 * 2. Registered Gyms List with Search and Filtering
 */
export async function getRegisteredGymsList(
  adminUserId: string,
  filter?: {
    search?: string;
    status?: GymStatus;
    page?: number;
    limit?: number;
  }
) {
  await assertSuperAdminUser(adminUserId);

  const page = Math.max(1, filter?.page || 1);
  const limit = Math.min(100, Math.max(1, filter?.limit || 25));
  const skip = (page - 1) * limit;

  const whereClause: Record<string, unknown> = {};

  if (filter?.status) {
    whereClause.status = filter.status;
  }

  if (filter?.search && filter.search.trim()) {
    const q = filter.search.trim();
    whereClause.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  const [totalCount, gyms] = await Promise.all([
    db.gym.count({ where: whereClause }),
    db.gym.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
        _count: {
          select: {
            members: true,
            userRoles: true,
            classes: true,
          },
        },
        userRoles: {
          where: { role: "OWNER" },
          take: 1,
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    }),
  ]);

  return {
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    gyms: gyms.map((g) => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      email: g.email,
      phone: g.phone,
      city: g.city,
      country: g.country,
      currency: g.currency,
      timezone: g.timezone,
      status: g.status,
      createdAt: g.createdAt.toISOString(),
      memberCount: g._count.members,
      staffCount: g._count.userRoles,
      classesCount: g._count.classes,
      owner: g.userRoles[0]?.user || null,
      subscription: g.subscription
        ? {
          id: g.subscription.id,
          status: g.subscription.status,
          billingPeriod: g.subscription.billingPeriod,
          planName: g.subscription.plan.name,
          planCode: g.subscription.plan.code,
          currentPeriodEnd: g.subscription.currentPeriodEnd.toISOString(),
          trialEndsAt: g.subscription.trialEndsAt?.toISOString() || null,
        }
        : null,
    })),
  };
}

/**
 * 3. Gym Detail View for Platform Administration
 */
export async function getGymAdminDetails(adminUserId: string, gymId: string) {
  await assertSuperAdminUser(adminUserId);

  const gym = await db.gym.findUnique({
    where: { id: gymId },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
      _count: {
        select: {
          members: true,
          userRoles: true,
          classes: true,
          invoices: true,
          payments: true,
          inventoryItems: true,
        },
      },
      userRoles: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      },
      platformAuditLogs: {
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!gym) {
    throw new Error(`Gym with ID "${gymId}" not found.`);
  }

  const allPlans = await db.saasPlan.findMany({
    where: { isActive: true },
    orderBy: { monthlyPrice: "asc" },
  });

  return {
    gym: {
      id: gym.id,
      name: gym.name,
      slug: gym.slug,
      email: gym.email,
      phone: gym.phone,
      addressLine1: gym.addressLine1,
      city: gym.city,
      country: gym.country,
      currency: gym.currency,
      timezone: gym.timezone,
      status: gym.status,
      createdAt: gym.createdAt.toISOString(),
      updatedAt: gym.updatedAt.toISOString(),
    },
    counts: gym._count,
    users: gym.userRoles.map((ur) => ({
      userId: ur.user.id,
      name: ur.user.name,
      email: ur.user.email,
      gymRole: ur.role,
      systemRole: ur.user.role,
    })),
    subscription: gym.subscription
      ? {
        id: gym.subscription.id,
        status: gym.subscription.status,
        billingPeriod: gym.subscription.billingPeriod,
        currentPeriodStart: gym.subscription.currentPeriodStart.toISOString(),
        currentPeriodEnd: gym.subscription.currentPeriodEnd.toISOString(),
        trialEndsAt: gym.subscription.trialEndsAt?.toISOString() || null,
        gracePeriodEndsAt: gym.subscription.gracePeriodEndsAt?.toISOString() || null,
        customFeatureOverrides: gym.subscription.customFeatureOverrides,
        notes: gym.subscription.notes,
        plan: {
          id: gym.subscription.plan.id,
          name: gym.subscription.plan.name,
          code: gym.subscription.plan.code,
          monthlyPrice: Number(gym.subscription.plan.monthlyPrice),
          yearlyPrice: Number(gym.subscription.plan.yearlyPrice),
          maxMembers: gym.subscription.plan.maxMembers,
          maxStaff: gym.subscription.plan.maxStaff,
          maxClasses: gym.subscription.plan.maxClasses,
          features: gym.subscription.plan.features,
        },
      }
      : null,
    availablePlans: allPlans.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      monthlyPrice: Number(p.monthlyPrice),
      yearlyPrice: Number(p.yearlyPrice),
      maxMembers: p.maxMembers,
      features: p.features,
    })),
    auditHistory: gym.platformAuditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      details: log.details,
      createdAt: log.createdAt.toISOString(),
      adminEmail: log.user.email || log.user.name || "Super Admin",
    })),
  };
}

/**
 * 4. Suspend or Reactivate Gym with Platform Audit Log
 */
export async function updateGymAccountStatus(
  adminUserId: string,
  gymId: string,
  input: {
    status: GymStatus;
    reason: string;
    ipAddress?: string;
  }
) {
  const admin = await assertSuperAdminUser(adminUserId);

  const existingGym = await db.gym.findUnique({
    where: { id: gymId },
    select: { id: true, name: true, status: true, subscription: { select: { id: true, status: true } } },
  });

  if (!existingGym) {
    throw new Error(`Gym with ID "${gymId}" not found.`);
  }

  const previousStatus = existingGym.status;
  const newStatus = input.status;

  // Transaction: Update gym status, synchronize subscription if suspended, write audit log
  const result = await db.$transaction(async (tx) => {
    const updatedGym = await tx.gym.update({
      where: { id: gymId },
      data: { status: newStatus },
    });

    // If gym is suspended, also mark its SaaS subscription as SUSPENDED
    if (newStatus === GymStatus.SUSPENDED && existingGym.subscription) {
      await tx.gymSubscription.update({
        where: { id: existingGym.subscription.id },
        data: { status: SaasSubscriptionStatus.SUSPENDED },
      });
    } else if (
      newStatus === GymStatus.ACTIVE &&
      existingGym.subscription &&
      existingGym.subscription.status === SaasSubscriptionStatus.SUSPENDED
    ) {
      await tx.gymSubscription.update({
        where: { id: existingGym.subscription.id },
        data: { status: SaasSubscriptionStatus.ACTIVE },
      });
    }

    // Write Platform Audit Log
    const action =
      newStatus === GymStatus.SUSPENDED
        ? "GYM_SUSPENDED"
        : newStatus === GymStatus.ACTIVE
          ? "GYM_REACTIVATED"
          : "GYM_STATUS_CHANGED";

    const auditLog = await tx.platformAuditLog.create({
      data: {
        userId: admin.id,
        gymId,
        action,
        targetType: "GYM",
        targetId: gymId,
        details: JSON.stringify({
          previousStatus,
          newStatus,
          reason: input.reason,
          gymName: existingGym.name,
        }),
        ipAddress: input.ipAddress || null,
      },
    });

    return { updatedGym, auditLog };
  });

  return {
    success: true,
    gymId: result.updatedGym.id,
    status: result.updatedGym.status,
    auditLogId: result.auditLog.id,
  };
}

/**
 * 5. Update Support Notes on a Gym
 */
export async function updateGymSupportNotes(
  adminUserId: string,
  gymId: string,
  notes: string,
  ipAddress?: string
) {
  const admin = await assertSuperAdminUser(adminUserId);

  const subscription = await db.gymSubscription.findUnique({
    where: { gymId },
  });

  if (subscription) {
    await db.gymSubscription.update({
      where: { gymId },
      data: { notes },
    });
  }

  await db.platformAuditLog.create({
    data: {
      userId: admin.id,
      gymId,
      action: "SUPPORT_NOTES_UPDATED",
      targetType: "GYM",
      targetId: gymId,
      details: JSON.stringify({ notesLength: notes.length }),
      ipAddress: ipAddress || null,
    },
  });

  return { success: true };
}

/**
 * 6. SaaS Subscription Plans CRUD
 */
export async function listSaasPlans(adminUserId: string, includeInactive = false) {
  await assertSuperAdminUser(adminUserId);
  await seedDefaultSaasPlansIfEmpty();

  const whereClause = includeInactive ? {} : { isActive: true };

  const plans = await db.saasPlan.findMany({
    where: whereClause,
    orderBy: { monthlyPrice: "asc" },
    include: {
      _count: {
        select: { subscriptions: true },
      },
    },
  });

  return plans.map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    description: p.description,
    monthlyPrice: Number(p.monthlyPrice),
    quarterlyPrice: p.quarterlyPrice ? Number(p.quarterlyPrice) : null,
    yearlyPrice: Number(p.yearlyPrice),
    trialDays: p.trialDays,
    gracePeriodDays: p.gracePeriodDays,
    maxMembers: p.maxMembers,
    maxStaff: p.maxStaff,
    maxClasses: p.maxClasses,
    features: JSON.parse(p.features || "[]") as string[],
    isActive: p.isActive,
    subscriberCount: p._count.subscriptions,
    createdAt: p.createdAt.toISOString(),
  }));
}

export async function createSaasPlan(
  adminUserId: string,
  input: SaasPlanInput,
  ipAddress?: string
) {
  const admin = await assertSuperAdminUser(adminUserId);

  const existing = await db.saasPlan.findUnique({
    where: { code: input.code },
  });

  if (existing) {
    throw new Error(`A plan with code "${input.code}" already exists.`);
  }

  const plan = await db.saasPlan.create({
    data: {
      name: input.name,
      code: input.code,
      description: input.description,
      monthlyPrice: input.monthlyPrice,
      yearlyPrice: input.yearlyPrice,
      trialDays: input.trialDays,
      gracePeriodDays: input.gracePeriodDays,
      maxMembers: input.maxMembers,
      maxStaff: input.maxStaff,
      maxClasses: input.maxClasses,
      features: JSON.stringify(input.features),
      isActive: input.isActive,
    },
  });

  await db.platformAuditLog.create({
    data: {
      userId: admin.id,
      action: "SAAS_PLAN_CREATED",
      targetType: "SAAS_PLAN",
      targetId: plan.id,
      details: JSON.stringify({ code: plan.code, name: plan.name, monthlyPrice: plan.monthlyPrice }),
      ipAddress: ipAddress || null,
    },
  });

  return { success: true, plan };
}

export async function updateSaasPlan(
  adminUserId: string,
  planId: string,
  input: Partial<SaasPlanInput>,
  ipAddress?: string
) {
  const admin = await assertSuperAdminUser(adminUserId);

  const existing = await db.saasPlan.findUnique({
    where: { id: planId },
  });

  if (!existing) {
    throw new Error(`SaaS Plan with ID "${planId}" not found.`);
  }

  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.monthlyPrice !== undefined) updateData.monthlyPrice = input.monthlyPrice;
  if (input.yearlyPrice !== undefined) updateData.yearlyPrice = input.yearlyPrice;
  if (input.trialDays !== undefined) updateData.trialDays = input.trialDays;
  if (input.gracePeriodDays !== undefined) updateData.gracePeriodDays = input.gracePeriodDays;
  if (input.maxMembers !== undefined) updateData.maxMembers = input.maxMembers;
  if (input.maxStaff !== undefined) updateData.maxStaff = input.maxStaff;
  if (input.maxClasses !== undefined) updateData.maxClasses = input.maxClasses;
  if (input.features !== undefined) updateData.features = JSON.stringify(input.features);
  if (input.isActive !== undefined) updateData.isActive = input.isActive;

  const updated = await db.saasPlan.update({
    where: { id: planId },
    data: updateData,
  });

  await db.platformAuditLog.create({
    data: {
      userId: admin.id,
      action: "SAAS_PLAN_UPDATED",
      targetType: "SAAS_PLAN",
      targetId: planId,
      details: JSON.stringify(input),
      ipAddress: ipAddress || null,
    },
  });

  return { success: true, plan: updated };
}

/**
 * 7. Assign or Update Gym SaaS Subscription
 */
export async function assignGymSubscription(
  adminUserId: string,
  gymId: string,
  input: AssignSubscriptionInput,
  ipAddress?: string
) {
  const admin = await assertSuperAdminUser(adminUserId);

  const [gym, plan] = await Promise.all([
    db.gym.findUnique({ where: { id: gymId } }),
    db.saasPlan.findUnique({ where: { id: input.planId } }),
  ]);

  if (!gym) throw new Error(`Gym with ID "${gymId}" not found.`);
  if (!plan) throw new Error(`SaaS Plan with ID "${input.planId}" not found.`);

  const now = new Date();
  const periodEnd = new Date(now);
  if (input.billingPeriod === SaasBillingPeriod.YEARLY) {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  let trialEndsAt: Date | null = null;
  if (input.status === SaasSubscriptionStatus.TRIALING) {
    const trialDays = input.trialDays ?? plan.trialDays;
    trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);
  }

  const gracePeriodEndsAt = new Date(periodEnd);
  gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + plan.gracePeriodDays);

  const customFeatureOverridesStr = input.customFeatureOverrides
    ? JSON.stringify(input.customFeatureOverrides)
    : null;

  const subscription = await db.gymSubscription.upsert({
    where: { gymId },
    create: {
      gymId,
      planId: plan.id,
      status: input.status,
      billingPeriod: input.billingPeriod,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      trialEndsAt,
      gracePeriodEndsAt,
      customFeatureOverrides: customFeatureOverridesStr,
      notes: input.notes,
    },
    update: {
      planId: plan.id,
      status: input.status,
      billingPeriod: input.billingPeriod,
      currentPeriodEnd: periodEnd,
      trialEndsAt,
      gracePeriodEndsAt,
      customFeatureOverrides: customFeatureOverridesStr,
      notes: input.notes,
    },
  });

  await db.platformAuditLog.create({
    data: {
      userId: admin.id,
      gymId,
      action: "SUBSCRIPTION_ASSIGNED",
      targetType: "SUBSCRIPTION",
      targetId: subscription.id,
      details: JSON.stringify({
        planCode: plan.code,
        status: input.status,
        billingPeriod: input.billingPeriod,
      }),
      ipAddress: ipAddress || null,
    },
  });

  return { success: true, subscription };
}

/**
 * 8. Platform Audit Logs Query
 */
export async function getPlatformAuditLogs(
  adminUserId: string,
  filter?: { gymId?: string; action?: string; limit?: number }
) {
  await assertSuperAdminUser(adminUserId);

  const limit = Math.min(200, Math.max(1, filter?.limit || 50));
  const whereClause: Record<string, unknown> = {};

  if (filter?.gymId) whereClause.gymId = filter.gymId;
  if (filter?.action) whereClause.action = filter.action;

  const logs = await db.platformAuditLog.findMany({
    where: whereClause,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      gym: { select: { id: true, name: true, slug: true } },
    },
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    targetType: log.targetType,
    targetId: log.targetId,
    details: log.details,
    ipAddress: log.ipAddress,
    createdAt: log.createdAt.toISOString(),
    admin: {
      id: log.user.id,
      name: log.user.name,
      email: log.user.email,
    },
    gym: log.gym
      ? {
        id: log.gym.id,
        name: log.gym.name,
        slug: log.gym.slug,
      }
      : null,
  }));
}

// ==============================================================================
// 9. FIXIA-CONTROLLED ONBOARDING ENGINE (M20)
// ==============================================================================

export async function onboardGymTransactional(
  adminUserId: string,
  input: OnboardGymInput,
  ipAddress?: string
) {
  await assertSuperAdminUser(adminUserId);

  // 1. Slug collision check
  const existingSlug = await db.gym.findUnique({
    where: { slug: input.slug.toLowerCase().trim() },
    select: { id: true },
  });
  if (existingSlug) {
    throw new Error(`Gym slug "${input.slug}" is already registered. Please choose a unique slug.`);
  }

  // 2. Resolve Plan
  const plan = await db.saasPlan.findFirst({
    where: {
      OR: [
        { id: input.planId },
        { code: input.planId.toUpperCase() },
      ],
      isActive: true,
    },
  });
  if (!plan) {
    throw new Error(`Selected SaaS Plan "${input.planId}" does not exist or is inactive.`);
  }

  // 3. Password & Secrets
  const rawPassword = input.ownerPassword || crypto.randomBytes(8).toString("hex") + "#2026!";
  const passwordHash = await hashPassword(rawPassword);
  const qrSigningSecret = crypto.randomBytes(32).toString("hex");
  const invitationToken = crypto.randomUUID();

  // 4. Calculate Billing End Dates
  const now = new Date();
  const trialDays = input.trialDays ?? plan.trialDays;
  const trialEndsAt = trialDays > 0 ? new Date(now.getTime() + trialDays * 86400000) : null;
  const gracePeriodEndsAt = new Date(now.getTime() + plan.gracePeriodDays * 86400000);

  const currentPeriodEnd = new Date(now);
  if (input.billingPeriod === SaasBillingPeriod.YEARLY) {
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 365);
  } else if (input.billingPeriod === SaasBillingPeriod.QUARTERLY) {
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 90);
  } else {
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);
  }

  // Determine effective pricing
  let effectivePrice = Number(plan.monthlyPrice);
  if (input.customPricingOverride !== undefined && input.customPricingOverride !== null) {
    effectivePrice = Number(input.customPricingOverride);
  } else if (input.billingPeriod === SaasBillingPeriod.YEARLY) {
    effectivePrice = Number(plan.yearlyPrice);
  } else if (input.billingPeriod === SaasBillingPeriod.QUARTERLY && plan.quarterlyPrice) {
    effectivePrice = Number(plan.quarterlyPrice);
  }

  // 5. Execute Atomic Provisioning Transaction
  return await db.$transaction(async (tx) => {
    // 5.1 Create Gym Workspace
    const gym = await tx.gym.create({
      data: {
        name: input.name.trim(),
        slug: input.slug.toLowerCase().trim(),
        phone: input.phone.trim(),
        email: input.email.toLowerCase().trim(),
        city: input.city.trim(),
        country: input.country || "IN",
        currency: input.currency || "INR",
        timezone: input.timezone || "Asia/Kolkata",
        openingHours: input.openingHours?.trim() || "Mon - Sat: 06:00 - 22:00 | Sun: 07:00 - 13:00",
        status: GymStatus.ACTIVE,
        qrSigningSecret,
      },
    });

    // 5.2 Create or Resolve Owner User
    let ownerUser = await tx.user.findUnique({
      where: { email: input.ownerEmail.toLowerCase().trim() },
    });

    if (ownerUser) {
      await tx.userGymRole.upsert({
        where: {
          userId_gymId_role: {
            userId: ownerUser.id,
            gymId: gym.id,
            role: GymRole.OWNER,
          },
        },
        create: {
          userId: ownerUser.id,
          gymId: gym.id,
          role: GymRole.OWNER,
          isPrimary: true,
        },
        update: {},
      });
    } else {
      ownerUser = await tx.user.create({
        data: {
          name: input.ownerName.trim(),
          email: input.ownerEmail.toLowerCase().trim(),
          passwordHash,
          role: SystemRole.GYM_OWNER,
          status: "ACTIVE",
          gymRoles: {
            create: {
              gymId: gym.id,
              role: GymRole.OWNER,
              isPrimary: true,
            },
          },
        },
      });
    }

    // 5.3 Provision SaaS Subscription
    const subscription = await tx.gymSubscription.create({
      data: {
        gymId: gym.id,
        planId: plan.id,
        status: trialEndsAt ? SaasSubscriptionStatus.TRIALING : SaasSubscriptionStatus.ACTIVE,
        billingPeriod: input.billingPeriod,
        currentPeriodStart: now,
        currentPeriodEnd,
        trialEndsAt,
        gracePeriodEndsAt,
        customMonthlyPrice: input.customPricingOverride !== undefined && input.customPricingOverride !== null && input.billingPeriod === SaasBillingPeriod.MONTHLY ? input.customPricingOverride : null,
        customQuarterlyPrice: input.customPricingOverride !== undefined && input.customPricingOverride !== null && input.billingPeriod === SaasBillingPeriod.QUARTERLY ? input.customPricingOverride : null,
        customYearlyPrice: input.customPricingOverride !== undefined && input.customPricingOverride !== null && input.billingPeriod === SaasBillingPeriod.YEARLY ? input.customPricingOverride : null,
        customFeatureOverrides: input.featureOverrides ? JSON.stringify(input.featureOverrides) : null,
        maxMembersOverride: input.maxMembersOverride ?? null,
        notes: input.notes?.trim() || `Onboarded manually by FIXIA admin on ${now.toISOString().split("T")[0]}`,
      },
    });

    // 5.4 Initial Subscription Invoice
    const invoiceNumber = `FIXIA-INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoice = await tx.subscriptionInvoice.create({
      data: {
        gymId: gym.id,
        subscriptionId: subscription.id,
        invoiceNumber,
        subtotal: effectivePrice,
        taxAmount: 0.0,
        totalAmount: effectivePrice,
        status: trialEndsAt ? InvoiceStatus.DRAFT : InvoiceStatus.ISSUED,
        billingPeriod: input.billingPeriod,
        periodStart: now,
        periodEnd: currentPeriodEnd,
        dueDate: new Date(now.getTime() + 7 * 86400000),
        notes: `Initial ${plan.name} (${input.billingPeriod}) subscription invoice.`,
      },
    });

    // 5.5 Provision Gym Website Config
    await tx.gymWebsiteConfig.create({
      data: {
        gymId: gym.id,
        isPublished: true,
        headline: `Forge Strength & Peak Vitality at ${gym.name}`,
        subheadline: `Premier fitness and athletic performance facility in ${gym.city}.`,
        tagline: "Built for Consistency. Engineered for Results.",
      },
    });

    // 5.6 Provision Gym WhatsApp Config
    await tx.gymWhatsAppConfig.create({
      data: {
        gymId: gym.id,
        provider: "MOCK_SANDBOX",
        isEnabled: false,
      },
    });

    // 5.7 Initialize Usage Limits
    await tx.gymUsageRecord.create({
      data: {
        gymId: gym.id,
        metricKey: "ACTIVE_MEMBERS",
        currentValue: 0,
        limitValue: input.maxMembersOverride ?? plan.maxMembers,
      },
    });

    // 5.8 Generate Invitation Token
    const invitation = await tx.gymInvitation.create({
      data: {
        gymId: gym.id,
        email: ownerUser.email!,
        role: GymRole.OWNER,
        token: invitationToken,
        expiresAt: new Date(now.getTime() + 14 * 86400000),
        invitedByUserId: adminUserId,
      },
    });

    // 5.9 Audit Log
    await tx.platformAuditLog.create({
      data: {
        userId: adminUserId,
        gymId: gym.id,
        action: "GYM_ONBOARDED",
        targetType: "GYM",
        targetId: gym.id,
        details: JSON.stringify({
          gymName: gym.name,
          slug: gym.slug,
          ownerEmail: ownerUser.email,
          planName: plan.name,
          billingPeriod: input.billingPeriod,
          effectivePrice,
        }),
        ipAddress: ipAddress || null,
      },
    });

    return {
      success: true,
      gym: {
        id: gym.id,
        name: gym.name,
        slug: gym.slug,
        city: gym.city,
      },
      owner: {
        id: ownerUser.id,
        name: ownerUser.name,
        email: ownerUser.email,
        temporaryPassword: rawPassword,
      },
      subscription: {
        id: subscription.id,
        planName: plan.name,
        status: subscription.status,
        billingPeriod: subscription.billingPeriod,
        effectivePrice,
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      },
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: Number(invoice.totalAmount),
      },
      invitationToken: invitation.token,
      loginUrl: `/g/${gym.slug}/login`,
    };
  });
}

// ==============================================================================
// 10. SAAS ADD-ONS & SUBSCRIPTION BILLING (M20)
// ==============================================================================

export async function listSubscriptionAddons(adminUserId: string) {
  await assertSuperAdminUser(adminUserId);
  return db.subscriptionAddon.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { gymAddons: true } },
    },
  });
}

export async function createSubscriptionAddon(
  adminUserId: string,
  input: SubscriptionAddonInput
) {
  await assertSuperAdminUser(adminUserId);
  return db.subscriptionAddon.create({
    data: {
      name: input.name.trim(),
      code: input.code.toUpperCase().trim(),
      description: input.description?.trim() || null,
      monthlyPrice: input.monthlyPrice,
      yearlyPrice: input.yearlyPrice,
      featureKey: input.featureKey.trim(),
      isActive: input.isActive ?? true,
    },
  });
}

export async function listSubscriptionInvoices(adminUserId: string, gymId?: string) {
  await assertSuperAdminUser(adminUserId);
  const where: Record<string, unknown> = {};
  if (gymId) where.gymId = gymId;

  return db.subscriptionInvoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      gym: { select: { id: true, name: true, slug: true } },
      subscription: { include: { plan: { select: { name: true, code: true } } } },
      payments: true,
    },
  });
}

export async function recordSubscriptionPayment(
  adminUserId: string,
  input: RecordSubscriptionPaymentInput,
  ipAddress?: string
) {
  await assertSuperAdminUser(adminUserId);

  const invoice = await db.subscriptionInvoice.findUnique({
    where: { id: input.invoiceId },
    include: { gym: true, subscription: true },
  });

  if (!invoice) {
    throw new Error("Subscription invoice not found.");
  }

  const paymentNumber = `FIXIA-PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return await db.$transaction(async (tx) => {
    const payment = await tx.subscriptionPayment.create({
      data: {
        gymId: invoice.gymId,
        invoiceId: invoice.id,
        paymentNumber,
        amount: input.amount,
        method: (input.method as PaymentMethod) || PaymentMethod.BANK_TRANSFER,
        status: PaymentStatus.COMPLETED,
        gatewayRef: input.gatewayRef?.trim() || null,
        recordedByUserId: adminUserId,
        notes: input.notes?.trim() || null,
      },
    });

    await tx.subscriptionInvoice.update({
      where: { id: invoice.id },
      data: {
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
      },
    });

    // If subscription was past due or trialing, mark ACTIVE
    await tx.gymSubscription.update({
      where: { id: invoice.subscriptionId },
      data: {
        status: SaasSubscriptionStatus.ACTIVE,
      },
    });

    await tx.platformAuditLog.create({
      data: {
        userId: adminUserId,
        gymId: invoice.gymId,
        action: "SUBSCRIPTION_PAYMENT_RECORDED",
        targetType: "SUBSCRIPTION_PAYMENT",
        targetId: payment.id,
        details: JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          amount: input.amount,
          gymName: invoice.gym.name,
        }),
        ipAddress: ipAddress || null,
      },
    });

    return payment;
  });
}

export async function getGymUsageMetrics(adminUserId: string, gymId: string) {
  await assertSuperAdminUser(adminUserId);

  const [activeMembers, totalClasses, records] = await Promise.all([
    db.member.count({ where: { gymId, status: "ACTIVE" } }),
    db.class.count({ where: { gymId } }),
    db.gymUsageRecord.findMany({ where: { gymId } }),
  ]);

  return {
    gymId,
    activeMembers,
    totalClasses,
    usageRecords: records,
  };
}

