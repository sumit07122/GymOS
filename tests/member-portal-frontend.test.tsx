import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Components to test
import { PortalHeader } from "@/components/portal/portal-header";
import { PortalBottomNav } from "@/components/portal/portal-bottom-nav";
import { DigitalMembershipCard } from "@/components/portal/digital-membership-card";
import { PortalHomeTab } from "@/components/portal/portal-home-tab";
import { PortalWorkoutsTab } from "@/components/portal/portal-workouts-tab";
import { PortalProgressTab } from "@/components/portal/portal-progress-tab";
import { PortalChallengesTab } from "@/components/portal/portal-challenges-tab";
import { PortalMembershipTab } from "@/components/portal/portal-membership-tab";
import { PortalBillingTab } from "@/components/portal/portal-billing-tab";
import { PortalProfileTab } from "@/components/portal/portal-profile-tab";
import { PortalHub } from "@/components/portal/portal-hub";
import { WebsiteHub } from "@/components/website/website-hub";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/member/home",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock Next.js cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Phase 5: Member Portal & Dynamic Public Gym Websites", () => {
  const mockGym = {
    id: "gym-phoenix-1",
    name: "Phoenix Performance Center",
    slug: "phoenix-gym",
    logoUrl: "https://example.com/logo.png",
    city: "Austin, TX",
    currency: "USD",
    phone: "+1 (555) 234-5678",
    email: "desk@phoenixfit.com",
    addressLine1: "100 South Congress Ave",
  };

  const mockMember = {
    id: "mem-001",
    firstName: "Marcus",
    lastName: "Vance",
    fullName: "Marcus Vance",
    memberCode: "MEM-7788",
    status: "ACTIVE",
    email: "marcus@example.com",
    phone: "+1 555-4321",
    address: "742 Evergreen Terrace",
    emergencyContactName: "Sarah Vance",
    emergencyContactPhone: "+1 555-9876",
    joiningDate: "2025-01-15T00:00:00.000Z",
  };

  const mockMembership = {
    active: {
      id: "sub-001",
      planName: "Elite Performance All-Access",
      startDate: "2026-01-01T00:00:00.000Z",
      endDate: "2026-12-31T00:00:00.000Z",
      status: "ACTIVE",
      sessionsRemaining: null,
      pricePaid: 899.0,
      admissionFeePaid: 50.0,
      durationMonths: 12,
      benefits: ["Sauna & Steam Bath", "24/7 Floor Access", "Olympic Lifting Zone"],
      accessRestrictions: [],
      daysRemaining: 180,
      expiryStatus: "ACTIVE" as const,
    },
    history: [
      {
        id: "hist-001",
        planName: "Monthly Starter",
        startDate: "2025-01-15T00:00:00.000Z",
        endDate: "2025-12-31T00:00:00.000Z",
        status: "COMPLETED",
        pricePaid: 799.0,
      },
    ],
  };

  const mockAttendance = {
    totalCheckIns: 84,
    monthCheckIns: 16,
    lastCheckIn: "2026-11-10T08:30:00.000Z",
    records: [
      {
        id: "att-1",
        checkInTime: "2026-11-10T08:30:00.000Z",
        checkOutTime: "2026-11-10T09:45:00.000Z",
        status: "COMPLETED",
        checkInMethod: "QR_SCAN",
      },
      {
        id: "att-2",
        checkInTime: "2026-11-08T18:15:00.000Z",
        checkOutTime: null,
        status: "COMPLETED",
        checkInMethod: "FRONT_DESK",
      },
    ],
  };

  const mockBilling = {
    totalInvoiced: 899.0,
    totalPaid: 899.0,
    outstandingBalance: 0,
    invoices: [
      {
        id: "inv-001",
        invoiceNumber: "INV-2026-0042",
        issueDate: "2026-01-01T00:00:00.000Z",
        dueDate: "2026-01-15T00:00:00.000Z",
        subtotal: 849.0,
        taxAmount: 50.0,
        totalAmount: 899.0,
        paidAmount: 899.0,
        dueAmount: 0,
        status: "PAID",
        notes: "Annual renewal",
        allocations: [
          {
            id: "alloc-1",
            amount: 899.0,
            paymentNumber: "PAY-9901",
            paymentMethod: "CARD",
            receivedAt: "2026-01-01T10:00:00.000Z",
          },
        ],
      },
    ],
    payments: [
      {
        id: "pay-1",
        paymentNumber: "PAY-9901",
        amount: 899.0,
        method: "CARD",
        status: "COMPLETED",
        receivedAt: "2026-01-01T10:00:00.000Z",
        isGatewayVerified: true,
      },
    ],
  };

  const mockWorkouts = {
    activePlan: {
      id: "plan-1",
      name: "Hypertrophy Push/Pull/Legs",
      description: "Intermediate hypertrophy split targeting progressive overload",
      difficultyLevel: "INTERMEDIATE",
      entries: [
        {
          id: "entry-1",
          dayOfWeek: 1,
          orderIndex: 1,
          exerciseName: "Barbell Bench Press",
          category: "CHEST",
          sets: 4,
          reps: 8,
          targetWeightKg: 85,
          restSeconds: 90,
          notes: "Focus on controlled 3s eccentric",
        },
        {
          id: "entry-2",
          dayOfWeek: 1,
          orderIndex: 2,
          exerciseName: "Incline Dumbbell Flyes",
          category: "CHEST",
          sets: 3,
          reps: 12,
          targetWeightKg: 22,
          restSeconds: 60,
          notes: null,
        },
      ],
    },
    profile: {
      id: "prof-1",
      heightCm: 182,
      fitnessGoals: "Build lean muscle mass and improve 5k pace",
      fitnessNotes: "No known orthopedic injuries",
    },
    weightLogs: [
      {
        id: "wt-1",
        weightKg: 81.5,
        logDate: "2026-11-08T07:00:00.000Z",
        notes: "Post cardio",
      },
      {
        id: "wt-2",
        weightKg: 82.2,
        logDate: "2026-11-01T07:00:00.000Z",
        notes: null,
      },
    ],
    measurements: [
      {
        id: "meas-1",
        measureDate: "2026-11-01T00:00:00.000Z",
        chestCm: 104,
        waistCm: 82,
        hipsCm: 98,
        bicepsCm: 39,
        thighsCm: 60,
      },
    ],
    workoutRecords: [
      {
        id: "rec-1",
        planName: "Push Day Upper",
        durationMinutes: 55,
        completedAt: "2026-11-09T18:00:00.000Z",
        notes: "Crushed all sets on bench",
      },
    ],
  };

  const mockClasses = {
    upcoming: [
      {
        id: "cls-1",
        className: "HIIT Conditioning & Core",
        description: "High intensity functional circuits with kettlebells and rowers",
        durationMinutes: 45,
        instructorName: "Elena Rostova",
        startTime: "2026-11-12T17:30:00.000Z",
        endTime: "2026-11-12T18:15:00.000Z",
        capacity: 20,
        bookedCount: 14,
        spotsRemaining: 6,
        roomLocation: "Studio B",
        isBooked: false,
      },
    ],
    myBookings: [],
  };

  const mockChallenges = [
    {
      id: "chal-1",
      title: "November 20-Day Iron Sprint",
      description: "Log at least 20 check-ins this month to earn the Iron Titan badge",
      startDate: "2026-11-01T00:00:00.000Z",
      endDate: "2026-11-30T00:00:00.000Z",
      rewardBadge: "Iron Titan 2026",
      isJoined: true,
      progress: 80,
      isCompleted: false,
    },
  ];

  const mockQrCard = {
    token: "valid-hmac-sha256-token",
    qrDataUrl: "data:image/png;base64,mockQrCodeDataUrl",
    expiresInSeconds: 60,
  };

  it("1. renders PortalHeader with branding, member code and active badge", () => {
    render(
      <PortalHeader
        gym={mockGym}
        member={mockMember}
        isStaffOrAdmin={true}
      />
    );

    expect(screen.getByText("Phoenix Performance Center")).toBeDefined();
    expect(screen.getByText("MEM-7788")).toBeDefined();
    expect(screen.getByText("Active Member")).toBeDefined();
    expect(screen.getByText("Owner")).toBeDefined();
  });

  it("2. renders PortalBottomNav with all companion tabs", () => {
    render(
      <PortalBottomNav
        activeTab="home"
        hasUnpaidInvoices={false}
      />
    );

    // Desktop navigation
    const homeTabs = screen.getAllByText("Home");
    expect(homeTabs.length).toBeGreaterThan(0);

    const workoutTabs = screen.getAllByText("Workouts");
    expect(workoutTabs.length).toBeGreaterThan(0);

    const progressTabs = screen.getAllByText("Progress");
    expect(progressTabs.length).toBeGreaterThan(0);

    const passTabs = screen.getAllByText("Pass & Plan");
    expect(passTabs.length).toBeGreaterThan(0);

    const challengeTabs = screen.getAllByText("Challenges");
    expect(challengeTabs.length).toBeGreaterThan(0);

    const paymentTabs = screen.getAllByText("Payments");
    expect(paymentTabs.length).toBeGreaterThan(0);
  });

  it("3. renders DigitalMembershipCard with dynamic pass details and refresh timer", () => {
    render(
      <DigitalMembershipCard
        gym={mockGym}
        member={mockMember}
        membership={mockMembership.active}
        initialQr={mockQrCard}
      />
    );

    expect(screen.getByText("Marcus Vance")).toBeDefined();
    expect(screen.getByText("ID: MEM-7788")).toBeDefined();
    expect(screen.getByText("HMAC-SHA256")).toBeDefined();
    expect(screen.getByText(/Refreshes in/)).toBeDefined();
  });

  it("4. renders PortalHomeTab with greeting, streaks, and quick links", () => {
    render(
      <PortalHomeTab
        gym={mockGym}
        member={mockMember}
        membership={mockMembership.active}
        attendance={mockAttendance}
        billing={mockBilling}
        workoutPlanName="Hypertrophy Push/Pull/Legs"
        nextClassBooking={null}
        recentActivity={[]}
        onNavigate={vi.fn()}
      />
    );

    expect(screen.getByText(/Welcome to Phoenix Performance Center/)).toBeDefined();
    expect(screen.getByText("16")).toBeDefined(); // month checkins
    expect(screen.getByText("84")).toBeDefined(); // total checkins
    expect(screen.getByText("Digital Check-in Pass")).toBeDefined();
  });

  it("5. renders PortalWorkoutsTab with assigned exercise split", () => {
    render(
      <PortalWorkoutsTab
        gymSlug="phoenix-gym"
        workouts={mockWorkouts}
      />
    );

    expect(screen.getByText("Hypertrophy Push/Pull/Legs")).toBeDefined();
    expect(screen.getByText("Barbell Bench Press")).toBeDefined();
    expect(screen.getByText("4 sets × 8 reps")).toBeDefined();
    expect(screen.getByText("🎯 85 kg")).toBeDefined();
  });

  it("6. renders PortalProgressTab with attendance metrics and weight log", () => {
    render(
      <PortalProgressTab
        gymSlug="phoenix-gym"
        attendance={mockAttendance}
        workouts={mockWorkouts}
      />
    );

    expect(screen.getByText("Check-In History Ledger")).toBeDefined();
    expect(screen.getByText("Weight & Body Composition")).toBeDefined();
    expect(screen.getAllByText("81.5 kg").length).toBeGreaterThan(0);
    expect(screen.getByText("182 cm")).toBeDefined();
    expect(screen.getByText("Normal Weight")).toBeDefined();
  });

  it("7. renders PortalChallengesTab with active sprint and trophy cabinet", () => {
    render(
      <PortalChallengesTab
        gymName={mockGym.name}
        challenges={mockChallenges}
      />
    );

    expect(screen.getByText("Gym Challenges & Trophies")).toBeDefined();
    expect(screen.getByText("November 20-Day Iron Sprint")).toBeDefined();
    expect(screen.getByText("80%")).toBeDefined();
    expect(screen.getByText("Iron Titan 2026")).toBeDefined();
    expect(screen.getByText("Milestone Badges & Trophy Cabinet")).toBeDefined();
  });

  it("8. renders PortalMembershipTab with plan tier and benefits", () => {
    render(
      <PortalMembershipTab
        gym={mockGym}
        member={mockMember}
        membership={mockMembership}
        qrCard={mockQrCard}
      />
    );

    expect(screen.getAllByText("Elite Performance All-Access").length).toBeGreaterThan(0);
    expect(screen.getByText("Sauna & Steam Bath")).toBeDefined();
    expect(screen.getByText("24/7 Floor Access")).toBeDefined();
    expect(screen.getByText("Membership History")).toBeDefined();
  });

  it("9. renders PortalBillingTab with invoices and payment records", () => {
    render(
      <PortalBillingTab
        gym={mockGym}
        member={mockMember}
        billing={mockBilling}
      />
    );

    expect(screen.getByText("Invoices & Official Receipts")).toBeDefined();
    expect(screen.getByText("INV-2026-0042")).toBeDefined();
    expect(screen.getByText("PAY-9901")).toBeDefined();
    expect(screen.getByText("View Receipt")).toBeDefined();
  });

  it("10. renders PortalProfileTab with contact update form", () => {
    render(
      <PortalProfileTab
        gym={mockGym}
        member={mockMember}
      />
    );

    expect(screen.getByText("Contact & Emergency Details")).toBeDefined();
    expect(screen.getByDisplayValue("+1 555-4321")).toBeDefined();
    expect(screen.getByDisplayValue("Sarah Vance")).toBeDefined();
    expect(screen.getByText("Save Profile")).toBeDefined();
  });

  it("11. renders PortalHub fallback when member profile is not linked", () => {
    render(
      <PortalHub
        initialData={{
          hasLinkedProfile: false,
          gym: mockGym,
          userEmail: "unlinked@example.com",
          classes: mockClasses,
        }}
        isStaffOrAdmin={false}
      />
    );

    expect(screen.getByText("No Member Profile Linked")).toBeDefined();
    expect(screen.getByText("unlinked@example.com")).toBeDefined();
  });

  it("12. renders dynamic public gym website (WebsiteHub)", () => {
    const mockWebsiteData = {
      gym: {
        ...mockGym,
        addressLine2: "Suite 400",
        state: "TX",
        postalCode: "78704",
        country: "USA",
        openingHours: "Mon-Fri: 5am-11pm, Sat-Sun: 7am-9pm",
      },
      website: {
        isPublished: true,
        headline: "Unleash Your Ultimate Human Potential",
        subheadline: "Austin's premier strength, conditioning, and longevity performance center.",
        tagline: "High Performance Fitness",
        heroImageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",
        aboutText: "Founded in 2020 to bring scientific training methodology to everyday athletes.",
        primaryColor: "#0B6B4F",
        secondaryColor: "#047857",
        facilities: ["Olympic Racks", "Infrared Sauna", "Cryotherapy", "Turf Sprint Track"],
        galleryUrls: [],
        featuredTrainers: [
          {
            name: "Coach David Sterling",
            role: "Head Strength Coach",
            bio: "CSCS certified with 10+ years elite athlete coaching.",
          },
        ],
        whatsAppNumber: "+15552345678",
        instagramHandle: "@phoenixperformance",
        googleMapsUrl: "https://maps.google.com",
      },
      plans: [
        {
          id: "plan-pub-1",
          name: "Annual Unlimited Pass",
          description: "Full access to facility, recovery suites, and group training",
          durationDays: 365,
          durationMonths: 12,
          price: 99.0,
          admissionFee: 0,
          benefits: ["24/7 Access", "Recovery Zone", "Guest Passes"],
          accessRestrictions: [],
        },
      ],
    };

    render(<WebsiteHub data={mockWebsiteData} isOwnerOrStaff={false} />);

    expect(screen.getAllByText("Phoenix Performance Center").length).toBeGreaterThan(0);
    expect(screen.getByText("Unleash Your Ultimate Human Potential")).toBeDefined();
    expect(screen.getByText("Austin's premier strength, conditioning, and longevity performance center.")).toBeDefined();
    expect(screen.getAllByText("Annual Unlimited Pass").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Claim Free Pass").length).toBeGreaterThan(0);
    expect(screen.getByText("Coach David Sterling")).toBeDefined();
  });
});
