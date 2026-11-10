import { describe, it, expect, vi, beforeEach } from "vitest";
import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlatformOverview } from "@/components/admin/platform-overview";
import { GymsManagement } from "@/components/admin/gyms-management";
import { OnboardGymForm } from "@/components/admin/onboard-gym-form";
import { GymDetailView } from "@/components/admin/gym-detail-view";
import { SaasPlansManager } from "@/components/admin/saas-plans-manager";
import { PlatformAuditTable } from "@/components/admin/platform-audit-table";
import { GymStatus, SaasSubscriptionStatus, SaasBillingPeriod } from "@prisma/client";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(() => null),
    toString: () => "",
  }),
  useParams: () => ({
    gymId: "gym-alpha-1",
  }),
  usePathname: () => "/platform-admin",
}));

describe("PHASE 4 — Complete FIXIA Super Admin Frontend", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Platform Overview Hub (/platform-admin)", () => {
    const mockOverviewData = {
      gymMetrics: {
        totalGyms: 12,
        activeGyms: 10,
        suspendedGyms: 1,
        trialGyms: 1,
        inactiveGyms: 0,
        totalMembers: 1420,
      },
      subscriptionMetrics: {
        subscriptionCounts: {
          ACTIVE: 10,
          TRIALING: 1,
          PAST_DUE: 0,
          SUSPENDED: 1,
          CANCELLED: 0,
          UNASSIGNED: 0,
        },
        totalSubscriptions: 12,
        monthlyRecurringRevenue: 49990,
      },
      recentGyms: [
        {
          id: "gym-1",
          name: "Iron Temple Fitness",
          slug: "iron-temple",
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
          memberCount: 250,
          subscriptionPlan: "Commercial Pro",
          subscriptionStatus: "ACTIVE",
        },
      ],
      recentAuditLogs: [
        {
          id: "log-1",
          action: "WORKSPACE_ONBOARDED",
          targetType: "GYM",
          targetId: "gym-1",
          details: "Tenant onboarded with Commercial Pro tier",
          createdAt: new Date().toISOString(),
          adminEmail: "superadmin@fixia.in",
          gymName: "Iron Temple Fitness",
        },
      ],
    };

    it("renders Style A header, MRR/ARR stat cards, and recent workspaces", () => {
      render(<PlatformOverview data={mockOverviewData} />);

      expect(screen.getByText("FIXIA Platform Operations Center")).toBeDefined();
      expect(
        screen.getByText("Centralized multi-tenant supervision, SaaS subscription billing, quota monitoring, and tenant security isolation.")
      ).toBeDefined();

      // StatCards
      expect(screen.getByText("Total Gyms")).toBeDefined();
      expect(screen.getByText("Active Gyms")).toBeDefined();
      expect(screen.getByText("Trial Gyms")).toBeDefined();
      expect(screen.getByText("Suspended")).toBeDefined();
      expect(screen.getByText("Platform Members")).toBeDefined();
      expect(screen.getByText("Estimated MRR")).toBeDefined();
      expect(screen.getByText("₹49,990")).toBeDefined();

      // Recent Gyms
      expect(screen.getByText("Recently Registered Gym Workspaces")).toBeDefined();
      expect(screen.getByText("Iron Temple Fitness")).toBeDefined();
      expect(screen.getByText("250 members")).toBeDefined();

      // Subscription Health
      expect(screen.getByText("SaaS Subscription Health")).toBeDefined();
      expect(screen.getByText("Active Paying")).toBeDefined();
      expect(screen.getByText("In Active Trial")).toBeDefined();
    });
  });

  describe("Gyms Management Directory (/platform-admin/gyms)", () => {
    const mockGyms = [
      {
        id: "gym-alpha",
        name: "Alpha Strength Club",
        slug: "alpha-strength",
        email: "contact@alphastrength.in",
        phone: "+919876500000",
        city: "Mumbai",
        country: "IN",
        currency: "INR",
        timezone: "Asia/Kolkata",
        status: GymStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        memberCount: 180,
        staffCount: 4,
        classesCount: 12,
        owner: {
          id: "usr-1",
          name: "Vikram Rathore",
          email: "vikram@alphastrength.in",
        },
        subscription: {
          id: "sub-1",
          status: "ACTIVE",
          billingPeriod: "MONTHLY",
          planName: "Commercial Pro",
          planCode: "PRO",
          currentPeriodEnd: new Date("2026-12-31").toISOString(),
          trialEndsAt: null,
        },
      },
    ];

    it("renders search bar, status filter tabs, and workspace table", () => {
      render(<GymsManagement initialGyms={mockGyms} totalCount={1} />);

      expect(screen.getByText("Registered Gym Workspaces")).toBeDefined();
      expect(screen.getByText("Total Workspaces")).toBeDefined();
      expect(screen.getByText("Active Tenants")).toBeDefined();

      // Filter tabs
      expect(screen.getByText("ALL")).toBeDefined();
      expect(screen.getByText("SUSPENDED")).toBeDefined();

      // Table row
      expect(screen.getByText("Alpha Strength Club")).toBeDefined();
      expect(screen.getByText("Vikram Rathore")).toBeDefined();
      expect(screen.getByText("vikram@alphastrength.in")).toBeDefined();
      expect(screen.getByText("Commercial Pro")).toBeDefined();
    });

    it("filters workspaces based on search query", () => {
      render(<GymsManagement initialGyms={mockGyms} totalCount={1} />);

      const searchInput = screen.getByPlaceholderText("Search by gym name, slug, or owner email...");
      fireEvent.change(searchInput, { target: { value: "NonExistentGym" } });

      expect(screen.getByText("No gyms match the selected search or status criteria.")).toBeDefined();

      fireEvent.change(searchInput, { target: { value: "Alpha" } });
      expect(screen.getByText("Alpha Strength Club")).toBeDefined();
    });

    it("opens suspend modal on button click", () => {
      render(<GymsManagement initialGyms={mockGyms} totalCount={1} />);

      const suspendBtn = screen.getByText("Suspend");
      fireEvent.click(suspendBtn);

      expect(screen.getByText("Suspend Gym Workspace")).toBeDefined();
      expect(screen.getByText("Mandatory Audit Reason *")).toBeDefined();
      expect(screen.getByText("Cancel")).toBeDefined();
    });
  });

  describe("Five-Step Onboarding Wizard (/platform-admin/gyms/new)", () => {
    const mockPlans = [
      {
        id: "plan-pro",
        name: "Commercial Pro",
        code: "PRO",
        monthlyPrice: 4999,
        quarterlyPrice: 13999,
        yearlyPrice: 49990,
        features: ["CORE_MEMBERS", "ATTENDANCE_QR", "BILLING_INVOICING"],
        maxMembers: 250,
      },
    ];

    it("renders stepper ribbon showing 5 steps", () => {
      render(<OnboardGymForm plans={mockPlans} />);

      expect(screen.getByText("Gym Profile")).toBeDefined();
      expect(screen.getByText("Owner Account")).toBeDefined();
      expect(screen.getByText("SaaS Package")).toBeDefined();
      expect(screen.getByText("Entitlements")).toBeDefined();
      expect(screen.getByText("Review & Provision")).toBeDefined();
      expect(screen.getByText("Step 1: Gym Business Information")).toBeDefined();
    });

    it("validates mandatory fields before allowing step progression", () => {
      render(<OnboardGymForm plans={mockPlans} />);

      const nextButton = screen.getByText("Next Step");
      fireEvent.click(nextButton);

      // Fails validation because name, slug, etc. are empty
      expect(screen.getByText("Validation Error")).toBeDefined();
      expect(screen.getByText("Please fill in all mandatory fields with valid values before proceeding.")).toBeDefined();
    });

    it("advances through steps when valid information is provided", () => {
      render(<OnboardGymForm plans={mockPlans} />);

      // Fill Step 1
      fireEvent.change(screen.getByPlaceholderText("e.g. IronForge Elite Fitness"), {
        target: { value: "IronForge Gym" },
      });
      fireEvent.change(screen.getByPlaceholderText("+91 98765 43210"), {
        target: { value: "+919876543210" },
      });
      fireEvent.change(screen.getByPlaceholderText("contact@ironforge.in"), {
        target: { value: "contact@ironforge.in" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g. Mumbai, Bengaluru"), {
        target: { value: "Mumbai" },
      });

      // Advance to Step 2
      fireEvent.click(screen.getByText("Next Step"));
      expect(screen.getByText("Step 2: Gym Owner Credentials")).toBeDefined();

      // Fill Step 2
      fireEvent.change(screen.getByPlaceholderText("e.g. Rajesh Sharma"), {
        target: { value: "Rajesh Sharma" },
      });
      fireEvent.change(screen.getByPlaceholderText("owner@ironforge.in"), {
        target: { value: "rajesh@ironforge.in" },
      });

      // Advance to Step 3
      fireEvent.click(screen.getByText("Next Step"));
      expect(screen.getByText("Step 3: SaaS Subscription Package & Custom Pricing")).toBeDefined();

      // Advance to Step 4
      fireEvent.click(screen.getByText("Next Step"));
      expect(screen.getByText("Step 4: Feature Entitlement Flags")).toBeDefined();

      // Advance to Step 5
      fireEvent.click(screen.getByText("Next Step"));
      expect(screen.getByText("Step 5: Pre-Flight Review & Workspace Provisioning")).toBeDefined();
      expect(screen.getByText("Execute Provisioning")).toBeDefined();
    });
  });

  describe("Gym Detail Workspace (/platform-admin/gyms/[gymId])", () => {
    const mockGymDetails = {
      gym: {
        id: "gym-101",
        name: "Titan Crossfit Studio",
        slug: "titan-crossfit",
        email: "info@titancrossfit.in",
        phone: "+919988776655",
        addressLine1: "42 Bandra West",
        city: "Mumbai",
        country: "IN",
        currency: "INR",
        timezone: "Asia/Kolkata",
        status: GymStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      counts: {
        members: 140,
        userRoles: 3,
        classes: 8,
        invoices: 180,
        payments: 175,
        inventoryItems: 14,
      },
      users: [
        {
          userId: "usr-1",
          name: "Karan Patel",
          email: "karan@titancrossfit.in",
          gymRole: "OWNER",
          systemRole: "USER",
        },
      ],
      subscription: {
        id: "sub-101",
        status: SaasSubscriptionStatus.ACTIVE,
        billingPeriod: SaasBillingPeriod.MONTHLY,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date("2026-12-31").toISOString(),
        trialEndsAt: null,
        gracePeriodEndsAt: null,
        customFeatureOverrides: null,
        notes: "Corporate onboarding agreement.",
        plan: {
          id: "plan-pro",
          name: "Commercial Pro",
          code: "PRO",
          monthlyPrice: 4999,
          yearlyPrice: 49990,
          maxMembers: 250,
          maxStaff: 5,
          maxClasses: 20,
          features: JSON.stringify(["ATTENDANCE_QR", "BILLING_INVOICING"]),
        },
      },
      availablePlans: [
        {
          id: "plan-pro",
          name: "Commercial Pro",
          code: "PRO",
          monthlyPrice: 4999,
          yearlyPrice: 49990,
          maxMembers: 250,
          features: JSON.stringify(["ATTENDANCE_QR", "BILLING_INVOICING"]),
        },
      ],
      auditHistory: [
        {
          id: "audit-1",
          action: "WORKSPACE_ONBOARDED",
          details: "Tenant provisioned",
          createdAt: new Date().toISOString(),
          adminEmail: "admin@fixia.in",
        },
      ],
    };

    it("renders workspace profile, 6 stats, subscription tier, and support notes", () => {
      render(<GymDetailView data={mockGymDetails} />);

      expect(screen.getAllByText("Titan Crossfit Studio").length).toBeGreaterThan(0);
      expect(screen.getByText("Active Members")).toBeDefined();
      expect(screen.getByText("140")).toBeDefined();
      expect(screen.getByText("Staff & Roles")).toBeDefined();
      expect(screen.getByText("Class Catalog")).toBeDefined();

      // Workspace profile
      expect(screen.getByText("Workspace Profile & Contact")).toBeDefined();
      expect(screen.getByText("info@titancrossfit.in")).toBeDefined();
      expect(screen.getByText("+919988776655")).toBeDefined();

      // Support notes
      expect(screen.getByText("Support & Internal Notes")).toBeDefined();
      expect(screen.getByText("Save Notes")).toBeDefined();

      // Entitlements Matrix
      expect(screen.getByText("Feature Entitlements Matrix")).toBeDefined();
      expect(screen.getByText("Platform Audit Trail for this Workspace")).toBeDefined();
    });
  });

  describe("SaaS Plans Manager (/platform-admin/plans)", () => {
    const mockPlans = [
      {
        id: "plan-pro",
        name: "Commercial Pro",
        code: "PRO",
        description: "Enterprise operating tier",
        monthlyPrice: 4999,
        yearlyPrice: 49990,
        trialDays: 14,
        gracePeriodDays: 7,
        maxMembers: 250,
        maxStaff: 5,
        maxClasses: 20,
        features: ["CORE_MEMBERS", "ATTENDANCE_QR"],
        isActive: true,
        subscriberCount: 8,
        createdAt: new Date().toISOString(),
      },
    ];

    it("renders plans, subscriber metrics, and edit plan button", () => {
      render(<SaasPlansManager initialPlans={mockPlans} />);

      expect(screen.getByText("FIXIA SaaS Subscription Plans")).toBeDefined();
      expect(screen.getByText("Configured Plans")).toBeDefined();
      expect(screen.getByText("Subscribed Gyms")).toBeDefined();
      expect(screen.getByText("8 gyms")).toBeDefined();
      expect(screen.getByText("Commercial Pro")).toBeDefined();
      expect(screen.getByText("₹4,999")).toBeDefined();
      expect(screen.getByText("Edit Plan")).toBeDefined();
    });

    it("opens plan creator modal on 'New SaaS Plan' click", () => {
      render(<SaasPlansManager initialPlans={mockPlans} />);

      fireEvent.click(screen.getByText("New SaaS Plan"));
      expect(screen.getByText("Create New FIXIA SaaS Plan")).toBeDefined();
      expect(screen.getByText("Plan Name *")).toBeDefined();
      expect(screen.getByText("Unique Plan Code *")).toBeDefined();
      expect(screen.getByText("Cancel")).toBeDefined();
    });
  });

  describe("Platform Audit Table (/platform-admin/audit-logs)", () => {
    const mockLogs = [
      {
        id: "log-1",
        action: "GYM_SUSPENDED",
        targetType: "GYM",
        targetId: "gym-1",
        details: "Terms violation non-payment",
        ipAddress: "127.0.0.1",
        createdAt: new Date().toISOString(),
        admin: {
          id: "adm-1",
          name: "Lead Security Auditor",
          email: "auditor@fixia.in",
        },
        gym: {
          id: "gym-1",
          name: "Test Gym",
          slug: "test-gym",
        },
      },
    ];

    it("renders audit table with action badges, admin email, and target workspace", () => {
      render(<PlatformAuditTable initialLogs={mockLogs} />);

      expect(screen.getByText("Platform Administrative Audit Trail")).toBeDefined();
      expect(screen.getByText("GYM_SUSPENDED")).toBeDefined();
      expect(screen.getByText("auditor@fixia.in")).toBeDefined();
      expect(screen.getByText("Test Gym")).toBeDefined();
      expect(screen.getByText("Terms violation non-payment")).toBeDefined();
    });
  });
});
