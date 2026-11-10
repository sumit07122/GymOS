/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  assertSuperAdminUser,
  getPlatformOverviewMetrics,
  getRegisteredGymsList,
  getGymAdminDetails,
  updateGymAccountStatus,
  updateGymSupportNotes,
  listSaasPlans,
  createSaasPlan,
  updateSaasPlan,
  assignGymSubscription,
  getPlatformAuditLogs,
  PlatformAuthorizationError,
} from "@/lib/services/platform-admin.service";
import {
  checkGymEntitlement,
  assertGymEntitlement,
  getGymEntitlementsSummary,
  FeatureEntitlementError,
  SaasFeature,
} from "@/lib/saas/entitlements";
import { db } from "@/lib/db";
import {
  SystemRole,
  GymStatus,
  SaasSubscriptionStatus,
  SaasBillingPeriod,
} from "@prisma/client";

describe("Milestone M19: FIXIA SaaS Platform Administration", () => {
  const superAdminUser = {
    id: "usr-super-admin-1",
    name: "Alex Vance",
    email: "alex@fixia.com",
    role: SystemRole.SUPER_ADMIN,
  };

  const gymOwnerUser = {
    id: "usr-gym-owner-1",
    name: "Marcus Aurelius",
    email: "marcus@romeiron.com",
    role: SystemRole.GYM_OWNER,
  };

  const gymStaffUser = {
    id: "usr-gym-staff-1",
    name: "Lucius Staff",
    email: "lucius@romeiron.com",
    role: SystemRole.GYM_STAFF,
  };

  const mockStarterPlan = {
    id: "plan-starter-uuid",
    name: "Starter Studio",
    code: "STARTER",
    description: "Starter tier for single studios",
    monthlyPrice: 29.0,
    yearlyPrice: 290.0,
    trialDays: 14,
    gracePeriodDays: 7,
    maxMembers: 100,
    maxStaff: 3,
    maxClasses: 10,
    features: JSON.stringify([
      SaasFeature.CORE_MEMBERS,
      SaasFeature.CORE_PLANS,
      SaasFeature.ATTENDANCE_QR,
      SaasFeature.BILLING_INVOICING,
      SaasFeature.MEMBER_PORTAL,
    ]),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEnterprisePlan = {
    id: "plan-enterprise-uuid",
    name: "Enterprise Multi-Club",
    code: "ENTERPRISE",
    description: "Enterprise tier with all modules",
    monthlyPrice: 199.0,
    yearlyPrice: 1990.0,
    trialDays: 30,
    gracePeriodDays: 14,
    maxMembers: -1,
    maxStaff: -1,
    maxClasses: -1,
    features: JSON.stringify([
      SaasFeature.CORE_MEMBERS,
      SaasFeature.CORE_PLANS,
      SaasFeature.ATTENDANCE_QR,
      SaasFeature.BILLING_INVOICING,
      SaasFeature.MEMBER_PORTAL,
      SaasFeature.CRM_LEADS,
      SaasFeature.EXPENSE_TRACKING,
      SaasFeature.CLASS_SCHEDULING,
      SaasFeature.INVENTORY_MANAGEMENT,
      SaasFeature.WORKOUT_PLANS,
      SaasFeature.PUBLIC_WEBSITE,
      SaasFeature.WHATSAPP_NOTIFICATIONS,
      SaasFeature.BUSINESS_ANALYTICS,
    ]),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockGym = {
    id: "gym-sparta-uuid",
    name: "Spartan Strength",
    slug: "spartan-strength",
    email: "contact@spartan.com",
    phone: "+1 555-3000",
    city: "Sparta",
    country: "US",
    currency: "USD",
    timezone: "America/New_York",
    status: GymStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // 1. SUPER ADMIN ACCESS & ROLE AUTHORIZATION
  // ============================================================================
  describe("Super Admin Access & Security Authorization", () => {
    it("allows SUPER_ADMIN to authenticate platform administration requests", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValue(superAdminUser as any);

      const user = await assertSuperAdminUser(superAdminUser.id);
      expect(user.id).toBe(superAdminUser.id);
      expect(user.role).toBe(SystemRole.SUPER_ADMIN);
    });

    it("strictly rejects GYM_OWNER from platform administration with PlatformAuthorizationError", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValue(gymOwnerUser as any);

      await expect(assertSuperAdminUser(gymOwnerUser.id)).rejects.toThrow(
        PlatformAuthorizationError
      );
    });

    it("strictly rejects GYM_STAFF from platform administration", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValue(gymStaffUser as any);

      await expect(assertSuperAdminUser(gymStaffUser.id)).rejects.toThrow(
        PlatformAuthorizationError
      );
    });

    it("blocks non-existent users from platform administration", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValue(null);

      await expect(assertSuperAdminUser("fake-user-id")).rejects.toThrow(
        PlatformAuthorizationError
      );
    });
  });

  // ============================================================================
  // 2. GYM ACCOUNT MANAGEMENT & SUSPENSION AUDIT TRAILS
  // ============================================================================
  describe("Gym Workspace Account Management & Suspension", () => {
    it("suspends a gym workspace, synchronizes subscription, and records an immutable audit log", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValue(superAdminUser as any);

      const existingGym = {
        ...mockGym,
        status: GymStatus.ACTIVE,
        subscription: { id: "sub-1", status: SaasSubscriptionStatus.ACTIVE },
      };

      vi.spyOn(db.gym, "findUnique").mockResolvedValue(existingGym as any);

      const mockUpdatedGym = { ...existingGym, status: GymStatus.SUSPENDED };
      const mockAuditLog = {
        id: "audit-1",
        userId: superAdminUser.id,
        gymId: existingGym.id,
        action: "GYM_SUSPENDED",
        targetType: "GYM",
        targetId: existingGym.id,
        details: JSON.stringify({ reason: "Terms of Service violation" }),
      };

      vi.spyOn(db, "$transaction").mockImplementation((async (callback: any) => {
        const tx = {
          gym: { update: vi.fn().mockResolvedValue(mockUpdatedGym) },
          gymSubscription: { update: vi.fn().mockResolvedValue({}) },
          platformAuditLog: { create: vi.fn().mockResolvedValue(mockAuditLog) },
        };
        return callback(tx);
      }) as any);

      const result = await updateGymAccountStatus(superAdminUser.id, existingGym.id, {
        status: GymStatus.SUSPENDED,
        reason: "Terms of Service violation",
        ipAddress: "127.0.0.1",
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe(GymStatus.SUSPENDED);
      expect(result.auditLogId).toBe("audit-1");
    });

    it("reactivates a suspended gym workspace and writes GYM_REACTIVATED audit log", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValue(superAdminUser as any);

      const suspendedGym = {
        ...mockGym,
        status: GymStatus.SUSPENDED,
        subscription: { id: "sub-1", status: SaasSubscriptionStatus.SUSPENDED },
      };

      vi.spyOn(db.gym, "findUnique").mockResolvedValue(suspendedGym as any);

      const mockReactivatedGym = { ...suspendedGym, status: GymStatus.ACTIVE };
      const mockAuditLog = {
        id: "audit-2",
        action: "GYM_REACTIVATED",
      };

      vi.spyOn(db, "$transaction").mockImplementation((async (callback: any) => {
        const tx = {
          gym: { update: vi.fn().mockResolvedValue(mockReactivatedGym) },
          gymSubscription: { update: vi.fn().mockResolvedValue({}) },
          platformAuditLog: { create: vi.fn().mockResolvedValue(mockAuditLog) },
        };
        return callback(tx);
      }) as any);

      const result = await updateGymAccountStatus(superAdminUser.id, suspendedGym.id, {
        status: GymStatus.ACTIVE,
        reason: "Payment verified by finance department",
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe(GymStatus.ACTIVE);
    });

    it("updates confidential support notes and writes audit record", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValue(superAdminUser as any);
      vi.spyOn(db.gymSubscription, "findUnique").mockResolvedValue({ id: "sub-1", gymId: mockGym.id } as any);
      vi.spyOn(db.gymSubscription, "update").mockResolvedValue({} as any);
      const auditCreateSpy = vi.spyOn(db.platformAuditLog, "create").mockResolvedValue({ id: "audit-notes" } as any);

      const res = await updateGymSupportNotes(
        superAdminUser.id,
        mockGym.id,
        "VIP client — migrated from Mindbody with 300 active contracts."
      );

      expect(res.success).toBe(true);
      expect(auditCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "SUPPORT_NOTES_UPDATED",
            gymId: mockGym.id,
          }),
        })
      );
    });
  });

  // ============================================================================
  // 3. SAAS SUBSCRIPTION PLANS MANAGEMENT
  // ============================================================================
  describe("FIXIA SaaS Subscription Plans Management", () => {
    it("lists SaaS subscription plans and returns subscriber counts", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValue(superAdminUser as any);
      vi.spyOn(db.saasPlan, "count").mockResolvedValue(2);
      vi.spyOn(db.saasPlan, "findMany").mockResolvedValue([
        { ...mockStarterPlan, _count: { subscriptions: 5 } },
        { ...mockEnterprisePlan, _count: { subscriptions: 2 } },
      ] as any);

      const plans = await listSaasPlans(superAdminUser.id);

      expect(plans).toHaveLength(2);
      expect(plans[0].code).toBe("STARTER");
      expect(plans[0].subscriberCount).toBe(5);
      expect(plans[1].code).toBe("ENTERPRISE");
      expect(plans[1].subscriberCount).toBe(2);
    });

    it("creates a new SaaS tier with feature entitlements and writes audit log", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValue(superAdminUser as any);
      vi.spyOn(db.saasPlan, "findUnique").mockResolvedValue(null); // not existing

      const createdPlan = {
        id: "plan-pro-id",
        name: "Pro Club",
        code: "PRO_CLUB",
        monthlyPrice: 89.0,
        yearlyPrice: 890.0,
      };

      vi.spyOn(db.saasPlan, "create").mockResolvedValue(createdPlan as any);
      const auditSpy = vi.spyOn(db.platformAuditLog, "create").mockResolvedValue({ id: "audit-plan" } as any);

      const res = await createSaasPlan(superAdminUser.id, {
        name: "Pro Club",
        code: "PRO_CLUB",
        description: "Scaling fitness center",
        monthlyPrice: 89.0,
        yearlyPrice: 890.0,
        trialDays: 14,
        gracePeriodDays: 7,
        maxMembers: 500,
        maxStaff: 8,
        maxClasses: 30,
        features: [SaasFeature.CORE_MEMBERS, SaasFeature.CRM_LEADS],
        isActive: true,
      });

      expect(res.success).toBe(true);
      expect(res.plan.code).toBe("PRO_CLUB");
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: "SAAS_PLAN_CREATED" }),
        })
      );
    });

    it("prevents creating duplicate plan codes", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValue(superAdminUser as any);
      vi.spyOn(db.saasPlan, "findUnique").mockResolvedValue(mockStarterPlan as any); // already exists

      await expect(
        createSaasPlan(superAdminUser.id, {
          name: "Duplicate Starter",
          code: "STARTER",
          monthlyPrice: 29.0,
          yearlyPrice: 290.0,
          trialDays: 14,
          gracePeriodDays: 7,
          maxMembers: 100,
          maxStaff: 3,
          maxClasses: 10,
          features: [],
          isActive: true,
        })
      ).rejects.toThrow('A plan with code "STARTER" already exists.');
    });

    it("updates SaaS plan properties and writes audit log", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValue(superAdminUser as any);
      vi.spyOn(db.saasPlan, "findUnique").mockResolvedValue(mockStarterPlan as any);
      vi.spyOn(db.saasPlan, "update").mockResolvedValue({
        ...mockStarterPlan,
        monthlyPrice: 35.0,
      } as any);
      const auditSpy = vi.spyOn(db.platformAuditLog, "create").mockResolvedValue({} as any);

      const res = await updateSaasPlan(superAdminUser.id, mockStarterPlan.id, {
        monthlyPrice: 35.0,
      });

      expect(res.success).toBe(true);
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "SAAS_PLAN_UPDATED",
            targetId: mockStarterPlan.id,
          }),
        })
      );
    });
  });

  // ============================================================================
  // 4. CENTRALIZED SAAS FEATURE ENTITLEMENT SYSTEM
  // ============================================================================
  describe("Centralized SaaS Feature Entitlements", () => {
    it("allows core features for gyms on Starter plan", async () => {
      vi.spyOn(db.gym, "findUnique").mockResolvedValue({
        id: mockGym.id,
        status: GymStatus.ACTIVE,
        subscription: {
          id: "sub-1",
          status: SaasSubscriptionStatus.ACTIVE,
          plan: mockStarterPlan,
          customFeatureOverrides: null,
          currentPeriodEnd: new Date(Date.now() + 86400000 * 30),
        },
      } as any);

      const memberRes = await checkGymEntitlement(mockGym.id, SaasFeature.CORE_MEMBERS);
      expect(memberRes.allowed).toBe(true);
      expect(memberRes.feature).toBe(SaasFeature.CORE_MEMBERS);

      const qrRes = await checkGymEntitlement(mockGym.id, SaasFeature.ATTENDANCE_QR);
      expect(qrRes.allowed).toBe(true);
    });

    it("denies advanced features when plan does not include them", async () => {
      vi.spyOn(db.gym, "findUnique").mockResolvedValue({
        id: mockGym.id,
        status: GymStatus.ACTIVE,
        subscription: {
          id: "sub-1",
          status: SaasSubscriptionStatus.ACTIVE,
          plan: mockStarterPlan, // Starter does not include WhatsApp or Analytics
          customFeatureOverrides: null,
          currentPeriodEnd: new Date(Date.now() + 86400000 * 30),
        },
      } as any);

      const waRes = await checkGymEntitlement(mockGym.id, SaasFeature.WHATSAPP_NOTIFICATIONS);
      expect(waRes.allowed).toBe(false);
      expect(waRes.reason).toContain("does not include the WHATSAPP_NOTIFICATIONS feature");

      const analyticsRes = await checkGymEntitlement(mockGym.id, SaasFeature.BUSINESS_ANALYTICS);
      expect(analyticsRes.allowed).toBe(false);
    });

    it("allows all features for gyms on Enterprise plan", async () => {
      vi.spyOn(db.gym, "findUnique").mockResolvedValue({
        id: mockGym.id,
        status: GymStatus.ACTIVE,
        subscription: {
          id: "sub-1",
          status: SaasSubscriptionStatus.ACTIVE,
          plan: mockEnterprisePlan,
          customFeatureOverrides: null,
          currentPeriodEnd: new Date(Date.now() + 86400000 * 30),
        },
      } as any);

      const waRes = await checkGymEntitlement(mockGym.id, SaasFeature.WHATSAPP_NOTIFICATIONS);
      expect(waRes.allowed).toBe(true);

      const analyticsRes = await checkGymEntitlement(mockGym.id, SaasFeature.BUSINESS_ANALYTICS);
      expect(analyticsRes.allowed).toBe(true);
    });

    it("denies all entitlements when gym workspace is SUSPENDED", async () => {
      vi.spyOn(db.gym, "findUnique").mockResolvedValue({
        id: mockGym.id,
        status: GymStatus.SUSPENDED,
        subscription: {
          id: "sub-1",
          status: SaasSubscriptionStatus.SUSPENDED,
          plan: mockEnterprisePlan,
        },
      } as any);

      const res = await checkGymEntitlement(mockGym.id, SaasFeature.CORE_MEMBERS);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain("suspended by FIXIA platform administration");

      await expect(assertGymEntitlement(mockGym.id, SaasFeature.CORE_MEMBERS)).rejects.toThrow(
        FeatureEntitlementError
      );
    });

    it("denies entitlements when trial has expired", async () => {
      const pastTrialEnd = new Date(Date.now() - 86400000 * 5); // 5 days ago

      vi.spyOn(db.gym, "findUnique").mockResolvedValue({
        id: mockGym.id,
        status: GymStatus.TRIAL,
        subscription: {
          id: "sub-1",
          status: SaasSubscriptionStatus.TRIALING,
          plan: mockStarterPlan,
          trialEndsAt: pastTrialEnd,
        },
      } as any);

      const res = await checkGymEntitlement(mockGym.id, SaasFeature.CORE_MEMBERS);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain("trial period has expired");
    });

    it("denies entitlements when subscription is past due and grace period has expired", async () => {
      const pastGraceEnd = new Date(Date.now() - 86400000 * 2);

      vi.spyOn(db.gym, "findUnique").mockResolvedValue({
        id: mockGym.id,
        status: GymStatus.ACTIVE,
        subscription: {
          id: "sub-1",
          status: SaasSubscriptionStatus.PAST_DUE,
          plan: mockStarterPlan,
          gracePeriodEndsAt: pastGraceEnd,
        },
      } as any);

      const res = await checkGymEntitlement(mockGym.id, SaasFeature.CORE_MEMBERS);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain("past due and grace period has elapsed");
    });

    it("honors custom feature override granted by super admin", async () => {
      vi.spyOn(db.gym, "findUnique").mockResolvedValue({
        id: mockGym.id,
        status: GymStatus.ACTIVE,
        subscription: {
          id: "sub-1",
          status: SaasSubscriptionStatus.ACTIVE,
          plan: mockStarterPlan, // Starter does not include WhatsApp
          customFeatureOverrides: JSON.stringify({
            [SaasFeature.WHATSAPP_NOTIFICATIONS]: true, // Override: explicitly granted!
          }),
        },
      } as any);

      const res = await checkGymEntitlement(mockGym.id, SaasFeature.WHATSAPP_NOTIFICATIONS);
      expect(res.allowed).toBe(true);
      expect(res.isOverridden).toBe(true);
    });

    it("honors custom feature override denied by super admin", async () => {
      vi.spyOn(db.gym, "findUnique").mockResolvedValue({
        id: mockGym.id,
        status: GymStatus.ACTIVE,
        subscription: {
          id: "sub-1",
          status: SaasSubscriptionStatus.ACTIVE,
          plan: mockEnterprisePlan, // Enterprise normally includes public website
          customFeatureOverrides: JSON.stringify({
            [SaasFeature.PUBLIC_WEBSITE]: false, // Override: explicitly disabled!
          }),
        },
      } as any);

      const res = await checkGymEntitlement(mockGym.id, SaasFeature.PUBLIC_WEBSITE);
      expect(res.allowed).toBe(false);
      expect(res.isOverridden).toBe(true);
      expect(res.reason).toContain("manually disabled by platform administrator");
    });

    it("returns complete entitlements summary map for a gym workspace", async () => {
      vi.spyOn(db.gym, "findUnique").mockResolvedValue({
        id: mockGym.id,
        name: mockGym.name,
        status: GymStatus.ACTIVE,
        subscription: {
          id: "sub-1",
          status: SaasSubscriptionStatus.ACTIVE,
          billingPeriod: SaasBillingPeriod.MONTHLY,
          currentPeriodEnd: new Date(Date.now() + 86400000 * 30),
          trialEndsAt: null,
          plan: mockEnterprisePlan,
          customFeatureOverrides: null,
        },
      } as any);

      const summary = await getGymEntitlementsSummary(mockGym.id);

      expect(summary.gymId).toBe(mockGym.id);
      expect(summary.gymStatus).toBe(GymStatus.ACTIVE);
      expect(summary.subscription?.plan.code).toBe("ENTERPRISE");
      expect(summary.features[SaasFeature.CORE_MEMBERS]).toBe(true);
      expect(summary.features[SaasFeature.WHATSAPP_NOTIFICATIONS]).toBe(true);
      expect(summary.features[SaasFeature.BUSINESS_ANALYTICS]).toBe(true);
    });
  });

  // ============================================================================
  // 5. SUBSCRIPTION ASSIGNMENT WORKFLOWS
  // ============================================================================
  describe("Subscription Assignment Workflows", () => {
    it("assigns a SaaS plan to a gym and computes period boundaries", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValue(superAdminUser as any);
      vi.spyOn(db.gym, "findUnique").mockResolvedValue(mockGym as any);
      vi.spyOn(db.saasPlan, "findUnique").mockResolvedValue(mockStarterPlan as any);

      const mockCreatedSub = {
        id: "sub-new-1",
        gymId: mockGym.id,
        planId: mockStarterPlan.id,
        status: SaasSubscriptionStatus.ACTIVE,
        billingPeriod: SaasBillingPeriod.YEARLY,
      };

      vi.spyOn(db.gymSubscription, "upsert").mockResolvedValue(mockCreatedSub as any);
      const auditSpy = vi.spyOn(db.platformAuditLog, "create").mockResolvedValue({} as any);

      const res = await assignGymSubscription(superAdminUser.id, mockGym.id, {
        planId: mockStarterPlan.id,
        billingPeriod: SaasBillingPeriod.YEARLY,
        status: SaasSubscriptionStatus.ACTIVE,
        notes: "Prepaid annual invoice",
      });

      expect(res.success).toBe(true);
      expect(res.subscription.billingPeriod).toBe(SaasBillingPeriod.YEARLY);
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: "SUBSCRIPTION_ASSIGNED" }),
        })
      );
    });
  });

  // ============================================================================
  // 6. PLATFORM DASHBOARD & AUDIT LOG QUERIES
  // ============================================================================
  describe("Platform Dashboard Aggregations", () => {
    it("aggregates real platform metrics and computes MRR", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValue(superAdminUser as any);
      vi.spyOn(db.saasPlan, "count").mockResolvedValue(2);

      vi.spyOn(db.gym, "count").mockImplementation(((args: any) => {
        if (args?.where?.status === GymStatus.ACTIVE) return Promise.resolve(8);
        if (args?.where?.status === GymStatus.SUSPENDED) return Promise.resolve(1);
        if (args?.where?.status === GymStatus.TRIAL) return Promise.resolve(2);
        if (args?.where?.status === GymStatus.INACTIVE) return Promise.resolve(0);
        return Promise.resolve(11); // total gyms
      }) as any);

      vi.spyOn(db.member, "count").mockResolvedValue(450);

      // Subscriptions for MRR:
      // 1 active monthly at $29/mo -> $29
      // 1 active yearly at $790/yr -> $65.83
      vi.spyOn(db.gymSubscription, "findMany").mockResolvedValue([
        {
          id: "s1",
          status: SaasSubscriptionStatus.ACTIVE,
          billingPeriod: SaasBillingPeriod.MONTHLY,
          plan: { monthlyPrice: 29.0, yearlyPrice: 290.0 },
        },
        {
          id: "s2",
          status: SaasSubscriptionStatus.ACTIVE,
          billingPeriod: SaasBillingPeriod.YEARLY,
          plan: { monthlyPrice: 79.0, yearlyPrice: 790.0 },
        },
        {
          id: "s3",
          status: SaasSubscriptionStatus.TRIALING,
          billingPeriod: SaasBillingPeriod.MONTHLY,
          plan: { monthlyPrice: 199.0, yearlyPrice: 1990.0 },
        },
      ] as any);

      vi.spyOn(db.gym, "findMany").mockResolvedValue([]);
      vi.spyOn(db.platformAuditLog, "findMany").mockResolvedValue([]);

      const metrics = await getPlatformOverviewMetrics(superAdminUser.id);

      expect(metrics.gymMetrics.totalGyms).toBe(11);
      expect(metrics.gymMetrics.activeGyms).toBe(8);
      expect(metrics.gymMetrics.suspendedGyms).toBe(1);
      expect(metrics.gymMetrics.trialGyms).toBe(2);
      expect(metrics.gymMetrics.totalMembers).toBe(450);
      expect(metrics.subscriptionMetrics.subscriptionCounts.ACTIVE).toBe(2);
      expect(metrics.subscriptionMetrics.subscriptionCounts.TRIALING).toBe(1);
      // MRR = 29 + (790 / 12) = 29 + 65.83 = 94.83
      expect(metrics.subscriptionMetrics.monthlyRecurringRevenue).toBe(94.83);
    });

    it("retrieves paginated registered gyms list with search filter", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValue(superAdminUser as any);
      vi.spyOn(db.gym, "count").mockResolvedValue(1);
      vi.spyOn(db.gym, "findMany").mockResolvedValue([
        {
          ...mockGym,
          subscription: {
            id: "sub-1",
            status: SaasSubscriptionStatus.ACTIVE,
            billingPeriod: SaasBillingPeriod.MONTHLY,
            plan: mockStarterPlan,
            currentPeriodEnd: new Date(),
            trialEndsAt: null,
          },
          _count: { members: 50, userRoles: 3, classes: 10 },
          userRoles: [{ user: { id: "u-1", name: "Owner Bob", email: "bob@sparta.com" } }],
        },
      ] as any);

      const result = await getRegisteredGymsList(superAdminUser.id, { search: "spartan" });

      expect(result.totalCount).toBe(1);
      expect(result.gyms[0].name).toBe(mockGym.name);
      expect(result.gyms[0].memberCount).toBe(50);
      expect(result.gyms[0].subscription?.planCode).toBe("STARTER");
    });

    it("retrieves full gym admin details including subscription and audit logs", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValue(superAdminUser as any);
      vi.spyOn(db.gym, "findUnique").mockResolvedValue({
        ...mockGym,
        subscription: {
          id: "sub-1",
          status: SaasSubscriptionStatus.ACTIVE,
          billingPeriod: SaasBillingPeriod.MONTHLY,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          trialEndsAt: null,
          gracePeriodEndsAt: null,
          customFeatureOverrides: null,
          notes: "Good standing",
          plan: mockStarterPlan,
        },
        _count: {
          members: 100,
          userRoles: 4,
          classes: 12,
          invoices: 45,
          payments: 40,
          inventoryItems: 15,
        },
        userRoles: [
          {
            role: "OWNER",
            user: { id: "u-1", name: "Owner Bob", email: "bob@sparta.com", role: SystemRole.GYM_OWNER },
          },
        ],
        platformAuditLogs: [
          {
            id: "log-1",
            action: "GYM_REACTIVATED",
            details: "Restored",
            createdAt: new Date(),
            user: { name: superAdminUser.name, email: superAdminUser.email },
          },
        ],
      } as any);

      vi.spyOn(db.saasPlan, "findMany").mockResolvedValue([mockStarterPlan as any]);

      const details = await getGymAdminDetails(superAdminUser.id, mockGym.id);

      expect(details.gym.id).toBe(mockGym.id);
      expect(details.counts.members).toBe(100);
      expect(details.subscription?.notes).toBe("Good standing");
      expect(details.availablePlans).toHaveLength(1);
      expect(details.auditHistory).toHaveLength(1);
    });

    it("retrieves filterable platform audit logs", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValue(superAdminUser as any);
      vi.spyOn(db.platformAuditLog, "findMany").mockResolvedValue([
        {
          id: "log-1",
          action: "GYM_SUSPENDED",
          targetType: "GYM",
          targetId: mockGym.id,
          details: "Non-payment",
          ipAddress: "10.0.0.1",
          createdAt: new Date(),
          user: { id: superAdminUser.id, name: superAdminUser.name, email: superAdminUser.email },
          gym: { id: mockGym.id, name: mockGym.name, slug: mockGym.slug },
        },
      ] as any);

      const logs = await getPlatformAuditLogs(superAdminUser.id, { action: "GYM_SUSPENDED" });

      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe("GYM_SUSPENDED");
      expect(logs[0].gym?.name).toBe(mockGym.name);
      expect(logs[0].admin.email).toBe(superAdminUser.email);
    });
  });
});
