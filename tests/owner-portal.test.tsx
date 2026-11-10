/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import OwnerMotivationPage from "@/app/owner/motivation/page";
import SubscriptionPage from "@/app/owner/subscription/page";
import { MemberTable, MemberListItem } from "@/components/members/member-table";
import { PageHeader } from "@/components/design-system/page-header";
import { StatCard } from "@/components/design-system/stat-card";
import { ChartCard } from "@/components/design-system/chart-card";
import { Drawer } from "@/components/design-system/drawer";
import { db } from "@/lib/db";
import { TrendingUp } from "lucide-react";

// Mock auth guards for server components
vi.mock("@/lib/auth/guards", () => ({
  requireOwnerSession: vi.fn(async () => ({
    user: {
      id: "usr-owner-1",
      role: "OWNER",
      email: "owner@fixia.in",
      fullName: "Test Owner",
    },
    gym: {
      id: "gym-1",
      slug: "iron-temple",
      name: "Iron Temple Fitness",
      subscriptionTier: "PRO",
      memberLimit: 250,
      phone: "+919876543210",
      email: "contact@irontemple.in",
      address: "12 Marine Drive, Mumbai",
      currency: "INR",
    },
    session: { id: "sess-1" },
  })),
  requireAuth: vi.fn(async () => ({
    user: { id: "usr-owner-1", role: "OWNER", email: "owner@fixia.in" },
  })),
}));

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
    gymSlug: "iron-temple",
  }),
  usePathname: () => "/owner/dashboard",
}));

describe("PHASE 3 — Complete Gym Owner Frontend", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Owner Motivation Page (/owner/motivation)", () => {
    it("renders Style A header, metrics, and active challenges", async () => {
      vi.spyOn(db.gymChallenge, "findMany").mockResolvedValue([
        {
          id: "chal-1",
          gymId: "gym-1",
          title: "30-Day Summer Shred 2026",
          description: "Attend 20 workout days in June",
          rewardBadge: "CHALLENGE_FINISHER",
          startDate: new Date("2026-06-01"),
          endDate: new Date("2026-06-30"),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          participants: [
            {
              id: "part-1",
              challengeId: "chal-1",
              memberId: "mem-1",
              progress: 10,
              isCompleted: false,
              completedAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
      ] as any);

      vi.spyOn(db.challengeParticipant, "count").mockResolvedValue(1);

      const PageComponent = await OwnerMotivationPage();
      render(PageComponent);

      expect(screen.getByText("Member Motivation & Community Challenges")).toBeDefined();
      expect(
        screen.getByText("Drive member retention, consistency streaks, and healthy community competition with gym-wide fitness milestones.")
      ).toBeDefined();

      // Check Metric cards
      expect(screen.getByText("Active Challenges")).toBeDefined();
      expect(screen.getByText("Total Enrollments")).toBeDefined();
      expect(screen.getByText("Badges Awarded")).toBeDefined();
      expect(screen.getByText("Launch New Member Challenge")).toBeDefined();
      expect(screen.getByText("30-Day Summer Shred 2026")).toBeDefined();
    });
  });

  describe("Owner Subscription & Entitlements (/owner/subscription)", () => {
    it("renders subscription plan tier, quotas, and license entitlements", async () => {
      vi.spyOn(db.gymSubscription, "findUnique").mockResolvedValue({
        id: "sub-1",
        gymId: "gym-1",
        status: "ACTIVE",
        billingPeriod: "MONTHLY",
        customMonthlyPrice: 4999,
        maxMembersOverride: 250,
        currentPeriodStart: new Date("2026-01-01"),
        currentPeriodEnd: new Date("2026-12-31"),
        plan: {
          id: "plan-pro",
          name: "Commercial Pro",
          description: "Enterprise multi-tenant gym operating license",
          monthlyPrice: 4999,
          maxMembers: 250,
        },
        addons: [],
      } as any);

      vi.spyOn(db.member, "count").mockResolvedValue(184);

      vi.spyOn(db.subscriptionInvoice, "findMany").mockResolvedValue([
        {
          id: "inv-1",
          gymId: "gym-1",
          invoiceNumber: "INV-FIXIA-2026-004",
          amount: 4999,
          status: "PAID",
          dueDate: new Date("2026-02-01"),
          paidAt: new Date("2026-02-01"),
          createdAt: new Date("2026-01-01"),
          payments: [],
        },
      ] as any);

      const PageComponent = await SubscriptionPage();
      render(PageComponent);

      expect(screen.getByText("FIXIA SaaS Subscription & Billing")).toBeDefined();
      expect(screen.getByText("LICENSE ACTIVE")).toBeDefined();
      expect(screen.getAllByText("Commercial Pro").length).toBeGreaterThan(0);
      expect(screen.getByText("184 / 250")).toBeDefined();
      expect(screen.getByText("Platform Feature Entitlements")).toBeDefined();
      expect(screen.getByText("HMAC-SHA256 QR Attendance")).toBeDefined();
      expect(screen.getByText("Retail & Supplement Inventory")).toBeDefined();
      expect(screen.getByText("INV-FIXIA-2026-004")).toBeDefined();
    });
  });

  describe("Member Directory & Profile Drawer", () => {
    const mockMembers: MemberListItem[] = [
      {
        id: "mem-01",
        memberCode: "M-001",
        firstName: "Aarav",
        lastName: "Patel",
        photoUrl: null,
        phone: "+919876543210",
        email: "aarav@example.com",
        status: "ACTIVE",
        joiningDate: new Date("2026-01-01"),
        activeMembership: {
          id: "mship-01",
          planName: "Annual All-Access",
          endDate: new Date("2026-12-31"),
        },
        outstandingDues: 0,
      },
    ];

    it("renders member list in table format", () => {
      render(
        <MemberTable
          gymId="gym-1"
          gymSlug="iron-temple"
          currency="INR"
          members={mockMembers}
          total={1}
          page={1}
          totalPages={1}
          limit={10}
        />
      );
      expect(screen.getByText(/Aarav/)).toBeDefined();
      expect(screen.getByText("M-001")).toBeDefined();
      expect(screen.getByText("Annual All-Access")).toBeDefined();
    });

    it("opens member profile drawer with complete details on preview click", () => {
      render(
        <MemberTable
          gymId="gym-1"
          gymSlug="iron-temple"
          currency="INR"
          members={mockMembers}
          total={1}
          page={1}
          totalPages={1}
          limit={10}
        />
      );

      // Find quick preview button (eye icon button)
      const previewButton = screen.getByTitle("Quick Member Drawer");
      expect(previewButton).toBeDefined();

      fireEvent.click(previewButton);

      // Member drawer opens
      expect(screen.getByText("Member Identifier: M-001")).toBeDefined();
      expect(screen.getAllByText("+919876543210").length).toBeGreaterThan(0);
      expect(screen.getAllByText("aarav@example.com").length).toBeGreaterThan(0);
      expect(screen.getByText("Full Ledger & History")).toBeDefined();
      expect(screen.getByText("Archive Member")).toBeDefined();
    });
  });

  describe("Design System Style A Component Compliance", () => {
    it("renders PageHeader with clean title, description and actions", () => {
      render(
        <PageHeader
          title="Gym Members"
          description="Manage active memberships, KYC compliance and billing."
          actions={<button>New Member</button>}
        />
      );
      expect(screen.getByText("Gym Members")).toBeDefined();
      expect(screen.getByText("Manage active memberships, KYC compliance and billing.")).toBeDefined();
      expect(screen.getByText("New Member")).toBeDefined();
    });

    it("renders StatCard with value, positive trend and subtext", () => {
      render(
        <StatCard
          label="Total Revenue"
          value="₹2,45,000"
          icon={TrendingUp}
          trend={{ value: "+14.2% vs last month", isPositive: true }}
          subtext="Net operating income"
        />
      );
      expect(screen.getByText("Total Revenue")).toBeDefined();
      expect(screen.getByText("₹2,45,000")).toBeDefined();
      expect(screen.getByText("+14.2% vs last month")).toBeDefined();
      expect(screen.getByText("Net operating income")).toBeDefined();
    });

    it("renders ChartCard with title, description, and actions", () => {
      render(
        <ChartCard
          title="Attendance Trends"
          description="Hourly peak distribution"
          actions={<span>Live</span>}
        >
          <div>Chart Contents</div>
        </ChartCard>
      );
      expect(screen.getByText("Attendance Trends")).toBeDefined();
      expect(screen.getByText("Hourly peak distribution")).toBeDefined();
      expect(screen.getByText("Live")).toBeDefined();
      expect(screen.getByText("Chart Contents")).toBeDefined();
    });

    it("renders Drawer with header, content and footer actions", () => {
      render(
        <Drawer
          isOpen={true}
          onClose={vi.fn()}
          title="Drawer Title"
          description="Drawer description"
          footer={<button>Confirm</button>}
        >
          <div>Drawer Body</div>
        </Drawer>
      );
      expect(screen.getByText("Drawer Title")).toBeDefined();
      expect(screen.getByText("Drawer description")).toBeDefined();
      expect(screen.getByText("Drawer Body")).toBeDefined();
      expect(screen.getByText("Confirm")).toBeDefined();
    });
  });
});
