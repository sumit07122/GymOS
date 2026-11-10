/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  onboardGymTransactional,
  createSubscriptionAddon,
  recordSubscriptionPayment,
  PlatformAuthorizationError,
} from "@/lib/services/platform-admin.service";
import {
  checkUsageLimit,
  assertUsageLimit,
} from "@/lib/saas/entitlements";
import { db } from "@/lib/db";
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
import fs from "fs";
import path from "path";

describe("Milestone 20: Final Multi-Tenant SaaS Architecture & FIXIA Platform Verification", () => {
  const superAdminUser = {
    id: "admin-super-uuid-001",
    name: "FIXIA Platform Administrator",
    email: "superadmin@fixia.in",
    role: SystemRole.SUPER_ADMIN,
  };

  const nonAdminUser = {
    id: "user-owner-uuid-002",
    name: "John Owner",
    email: "john@gym.com",
    role: SystemRole.GYM_OWNER,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("1. FIXIA-Controlled Onboarding Workflow", () => {
    it("should reject gym onboarding if caller is not SUPER_ADMIN", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValueOnce(nonAdminUser as any);

      await expect(
        onboardGymTransactional(nonAdminUser.id, {
          name: "Test Gym",
          slug: "test-gym",
          phone: "+91 98765 43210",
          email: "test@gym.in",
          city: "Mumbai",
          country: "IN",
          currency: "INR",
          timezone: "Asia/Kolkata",
          ownerName: "Owner Name",
          ownerEmail: "owner@gym.in",
          planId: "plan-growth-01",
          billingPeriod: SaasBillingPeriod.MONTHLY,
          trialDays: 14,
        })
      ).rejects.toThrow(PlatformAuthorizationError);
    });

    it("should reject onboarding if slug is already claimed by another tenant", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValueOnce(superAdminUser as any);
      vi.spyOn(db.gym, "findUnique").mockResolvedValueOnce({
        id: "existing-gym-id",
        slug: "ironforge",
      } as any);

      await expect(
        onboardGymTransactional(superAdminUser.id, {
          name: "Ironforge Fitness",
          slug: "ironforge",
          phone: "+91 98765 43210",
          email: "contact@ironforge.in",
          city: "Bengaluru",
          country: "IN",
          currency: "INR",
          timezone: "Asia/Kolkata",
          ownerName: "Raj Sharma",
          ownerEmail: "raj@ironforge.in",
          planId: "plan-growth-01",
          billingPeriod: SaasBillingPeriod.MONTHLY,
          trialDays: 14,
        })
      ).rejects.toThrow(/already registered/i);
    });

    it("should atomically provision Gym, Owner, Subscription, Invoice, Website, WhatsApp, and Audit Log", async () => {
      vi.spyOn(db.user, "findUnique")
        .mockResolvedValueOnce(superAdminUser as any) // assertSuperAdminUser
        .mockResolvedValueOnce(null); // owner email check in tx

      vi.spyOn(db.gym, "findUnique").mockResolvedValueOnce(null); // slug check

      const mockPlan = {
        id: "plan-growth-01",
        name: "Growth Studio",
        monthlyPrice: 99.0,
        yearlyPrice: 990.0,
        features: JSON.stringify(["CORE_MEMBERS", "ATTENDANCE_QR", "BILLING_INVOICING"]),
      };

      vi.spyOn(db.saasPlan, "findFirst").mockResolvedValueOnce(mockPlan as any);

      const mockTx = {
        user: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({
            id: "owner-new-uuid",
            name: "Raj Sharma",
            email: "raj@ironforge.in",
            role: SystemRole.GYM_OWNER,
          }),
        },
        gym: {
          create: vi.fn().mockResolvedValue({
            id: "gym-new-uuid",
            name: "Ironforge Elite",
            slug: "ironforge-elite",
            status: GymStatus.ACTIVE,
            currency: "INR",
          }),
        },
        userGymRole: {
          create: vi.fn().mockResolvedValue({
            id: "role-new-uuid",
            gymId: "gym-new-uuid",
            userId: "owner-new-uuid",
            role: GymRole.OWNER,
          }),
        },
        gymSubscription: {
          create: vi.fn().mockResolvedValue({
            id: "sub-new-uuid",
            gymId: "gym-new-uuid",
            planId: mockPlan.id,
            status: SaasSubscriptionStatus.TRIALING,
            billingPeriod: SaasBillingPeriod.MONTHLY,
            currentPeriodEnd: new Date(),
            plan: mockPlan,
          }),
        },
        subscriptionInvoice: {
          create: vi.fn().mockResolvedValue({
            id: "inv-new-uuid",
            invoiceNumber: "FIXIA-INV-2026-9999",
            totalAmount: 99.0,
            status: InvoiceStatus.ISSUED,
          }),
        },
        gymWebsiteConfig: {
          create: vi.fn().mockResolvedValue({ id: "web-cfg-uuid" }),
        },
        gymWhatsAppConfig: {
          create: vi.fn().mockResolvedValue({ id: "wa-cfg-uuid" }),
        },
        gymUsageRecord: {
          create: vi.fn().mockResolvedValue({ id: "usage-uuid" }),
        },
        gymInvitation: {
          create: vi.fn().mockResolvedValue({
            id: "invitation-uuid",
            token: "invite-token-abc",
          }),
        },
        platformAuditLog: {
          create: vi.fn().mockResolvedValue({ id: "audit-uuid" }),
        },
      };

      vi.spyOn(db, "$transaction").mockImplementation(async (cb: any) => {
        return cb(mockTx);
      });

      const result = await onboardGymTransactional(superAdminUser.id, {
        name: "Ironforge Elite",
        slug: "ironforge-elite",
        phone: "+91 98765 43210",
        email: "contact@ironforge.in",
        city: "Bengaluru",
        country: "IN",
        currency: "INR",
        timezone: "Asia/Kolkata",
        ownerName: "Raj Sharma",
        ownerEmail: "raj@ironforge.in",
        planId: "plan-growth-01",
        billingPeriod: SaasBillingPeriod.MONTHLY,
        trialDays: 14,
        maxMembersOverride: 300,
        notes: "Corporate expansion deal.",
      });

      expect(result).toBeDefined();
      expect(result.gym.name).toBe("Ironforge Elite");
      expect(result.owner.email).toBe("raj@ironforge.in");
      expect(mockTx.gym.create).toHaveBeenCalled();
      expect(mockTx.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: "raj@ironforge.in",
            gymRoles: {
              create: expect.objectContaining({
                role: GymRole.OWNER,
              }),
            },
          }),
        })
      );
      expect(mockTx.gymSubscription.create).toHaveBeenCalled();
      expect(mockTx.platformAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "GYM_ONBOARDED",
          }),
        })
      );
    });
  });

  describe("2. Usage Quotas & Limits Enforcement", () => {
    it("should allow adding members when active count is below plan limit", async () => {
      vi.spyOn(db.gym, "findUnique").mockResolvedValueOnce({
        id: "gym-1",
        status: GymStatus.ACTIVE,
        subscription: {
          status: SaasSubscriptionStatus.ACTIVE,
          maxMembersOverride: 100,
          plan: { maxMembers: 50 },
        },
      } as any);

      vi.spyOn(db.member, "count").mockResolvedValueOnce(45);

      const check = await checkUsageLimit("gym-1", "ACTIVE_MEMBERS");
      expect(check.withinLimit).toBe(true);
      expect(check.current).toBe(45);
      expect(check.limit).toBe(100); // Override took precedence over plan default
    });

    it("should block adding members when quota is exhausted and assertUsageLimit throws", async () => {
      vi.spyOn(db.gym, "findUnique").mockResolvedValueOnce({
        id: "gym-1",
        status: GymStatus.ACTIVE,
        subscription: {
          status: SaasSubscriptionStatus.ACTIVE,
          maxMembersOverride: 50,
          plan: { maxMembers: 50 },
        },
      } as any);

      vi.spyOn(db.member, "count").mockResolvedValueOnce(50);

      await expect(assertUsageLimit("gym-1", "ACTIVE_MEMBERS")).rejects.toThrow(
        /usage limit reached/i
      );
    });
  });

  describe("3. Add-on Catalog & Subscription Payments", () => {
    it("should allow super admin to create a subscription add-on with valid uppercase code", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValueOnce(superAdminUser as any);
      vi.spyOn(db.subscriptionAddon, "findUnique").mockResolvedValueOnce(null);
      vi.spyOn(db.subscriptionAddon, "create").mockResolvedValueOnce({
        id: "addon-wa-10k",
        name: "10,000 WhatsApp Pack",
        code: "ADDON_WA_10K",
        monthlyPrice: 999.0 as any,
        yearlyPrice: 9990.0 as any,
        featureKey: "WHATSAPP_NOTIFICATIONS",
        isActive: true,
      } as any);

      const addon = await createSubscriptionAddon(superAdminUser.id, {
        name: "10,000 WhatsApp Pack",
        code: "ADDON_WA_10K",
        description: "10k monthly WhatsApp message allowance",
        monthlyPrice: 999.0,
        yearlyPrice: 9990.0,
        featureKey: "WHATSAPP_NOTIFICATIONS",
        isActive: true,
      });

      expect(addon.code).toBe("ADDON_WA_10K");
      expect(addon.featureKey).toBe("WHATSAPP_NOTIFICATIONS");
    });

    it("should record verified subscription payment and mark invoice PAID", async () => {
      vi.spyOn(db.user, "findUnique").mockResolvedValueOnce(superAdminUser as any);

      const mockInvoice = {
        id: "inv-001",
        gymId: "gym-001",
        totalAmount: 1499.0 as any,
        status: InvoiceStatus.ISSUED,
        subscriptionId: "sub-001",
        gym: { name: "Test Gym", currency: "INR" },
        subscription: { id: "sub-001" },
      };

      const mockPayment = {
        id: "pay-sub-001",
        gymId: "gym-001",
        invoiceId: "inv-001",
        amount: 1499.0 as any,
        paymentNumber: "FIXIA-PAY-2026-0001",
        method: PaymentMethod.BANK_TRANSFER,
        status: PaymentStatus.COMPLETED,
        receivedAt: new Date(),
      };

      vi.spyOn(db.subscriptionInvoice, "findUnique").mockResolvedValueOnce(mockInvoice as any);

      const mockTx = {
        subscriptionPayment: {
          create: vi.fn().mockResolvedValue(mockPayment),
        },
        subscriptionInvoice: {
          update: vi.fn().mockResolvedValue({
            ...mockInvoice,
            status: InvoiceStatus.PAID,
          }),
        },
        gymSubscription: {
          update: vi.fn().mockResolvedValue({
            id: "sub-001",
            status: SaasSubscriptionStatus.ACTIVE,
          }),
        },
        platformAuditLog: {
          create: vi.fn().mockResolvedValue({ id: "audit-001" }),
        },
      };

      vi.spyOn(db, "$transaction").mockImplementation(async (cb: any) => {
        return cb(mockTx);
      });

      const res = await recordSubscriptionPayment(superAdminUser.id, {
        gymId: "gym-001",
        invoiceId: "inv-001",
        amount: 1499.0,
        method: "BANK_TRANSFER",
        gatewayRef: "UTR987654321",
        notes: "Direct bank wire verified by finance.",
      });

      expect(res.paymentNumber).toBe("FIXIA-PAY-2026-0001");
      expect(mockTx.subscriptionInvoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: InvoiceStatus.PAID,
          }),
        })
      );
    });
  });

  describe("4. PWA Assets & Offline Configuration", () => {
    it("should have a valid web app manifest with standalone display and icons", () => {
      const manifestPath = path.join(process.cwd(), "public", "manifest.json");
      expect(fs.existsSync(manifestPath)).toBe(true);

      const content = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      expect(content.name).toBe("FIXIA GymOS");
      expect(content.short_name).toBe("GymOS");
      expect(content.display).toBe("standalone");
      expect(["#4f46e5", "#0B6B4F"]).toContain(content.theme_color);
      expect(["#0f172a", "#F8FAFC"]).toContain(content.background_color);
      expect(content.icons.length).toBeGreaterThanOrEqual(2);
    });

    it("should have a service worker registered with offline caching rules", () => {
      const swPath = path.join(process.cwd(), "public", "sw.js");
      expect(fs.existsSync(swPath)).toBe(true);

      const swContent = fs.readFileSync(swPath, "utf-8");
      expect(swContent).toContain("gymos-v");
      expect(swContent).toContain("/offline");
      expect(swContent).toContain("/api/"); // Stated network-only protection for sensitive routes
    });
  });
});
