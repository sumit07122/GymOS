/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  resolvePortalMember,
  getPortalDashboardData,
  refreshPortalDynamicQr,
  updatePortalMemberProfile,
  portalCancelBooking,
  portalLogMemberWeight,
  PortalSecurityError,
} from "@/lib/services/portal.service";
import { verifyDynamicQrToken } from "@/lib/security/qr-token";
import { db } from "@/lib/db";
import {
  MembershipStatus,
  BookingStatus,
} from "@prisma/client";

describe("Milestone M15: Member Portal and Digital Membership Card", () => {
  const gymA = {
    id: "gym-alpha-portal",
    name: "Alpha Fitness Club",
    slug: "alpha-fitness",
    logoUrl: "https://example.com/logo.png",
    phone: "+1 555-0100",
    email: "contact@alphafitness.com",
    city: "New York",
    address: "123 Gym Ave",
    currency: "USD",
    qrSigningSecret: "secret-key-alpha-32-chars-long!",
  };

  const gymB = {
    id: "gym-beta-portal",
    name: "Beta Performance Gym",
    slug: "beta-gym",
    qrSigningSecret: "secret-key-beta-32-chars-longer!",
  };

  const memberA = {
    id: "mem-001",
    gymId: gymA.id,
    userId: "user-alpha-member",
    memberCode: "MEM-1001",
    firstName: "Jane",
    lastName: "Doe",
    photoUrl: null,
    email: "jane.doe@example.com",
    phone: "+1 555-0199",
    address: "456 Oak Street",
    emergencyContactName: "John Doe",
    emergencyContactPhone: "+1 555-0188",
    joiningDate: new Date("2026-01-01"),
    medicalNotes: null,
    status: "ACTIVE",
  };

  const memberB = {
    id: "mem-002",
    gymId: gymA.id,
    userId: "user-other-member",
    memberCode: "MEM-1002",
    firstName: "Bob",
    lastName: "Smith",
  };

  const mockMembership = {
    id: "mbr-001",
    gymId: gymA.id,
    memberId: memberA.id,
    planId: "plan-001",
    startDate: new Date("2026-01-01"),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days in future
    status: MembershipStatus.ACTIVE,
    sessionsRemaining: 20,
    pricePaid: 150.0,
    admissionFeePaid: 25.0,
    planNameSnapshot: "Gold Annual Pass",
    plan: {
      id: "plan-001",
      name: "Gold Annual Pass",
      durationMonths: 12,
      price: 150.0,
      registrationFee: 25.0,
      benefits: ["Gym Floor Access", "Sauna & Steam", "Free Towel"],
      accessRestrictions: ["24/7 Access"],
    },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // 1. Identity Resolution & Auto-claiming
  // ============================================================================
  describe("Member Identity Resolution", () => {
    it("successfully resolves member linked via userId", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(gymA as any);
      vi.spyOn(db.member, "findFirst").mockResolvedValue(memberA as any);

      const result = await resolvePortalMember(
        memberA.userId,
        memberA.email,
        gymA.slug
      );

      expect(result.gym.id).toBe(gymA.id);
      expect(result.member?.id).toBe(memberA.id);
      expect(result.member?.memberCode).toBe("MEM-1001");
    });

    it("auto-claims profile when email matches unlinked member record", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(gymA as any);
      // First lookup by userId returns null
      vi.spyOn(db.member, "findFirst")
        .mockResolvedValueOnce(null) // by userId
        .mockResolvedValueOnce({
          ...memberA,
          userId: null,
        } as any); // by email

      vi.spyOn(db.member, "update").mockResolvedValue({
        ...memberA,
        userId: "new-user-id",
      } as any);

      const result = await resolvePortalMember(
        "new-user-id",
        "jane.doe@example.com",
        gymA.slug
      );

      expect(result.member?.id).toBe(memberA.id);
      expect(db.member.update).toHaveBeenCalledWith({
        where: { id: memberA.id },
        data: { userId: "new-user-id" },
      });
    });

    it("returns null member when user has no linked member record", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(gymA as any);
      vi.spyOn(db.member, "findFirst").mockResolvedValue(null);

      const result = await resolvePortalMember(
        "unlinked-user",
        "unlinked@example.com",
        gymA.slug
      );

      expect(result.gym.id).toBe(gymA.id);
      expect(result.member).toBeNull();
    });

    it("throws PortalSecurityError if gym workspace not found", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(null);

      await expect(
        resolvePortalMember("user-id", "email", "invalid-gym")
      ).rejects.toThrow(PortalSecurityError);
    });
  });

  // ============================================================================
  // 2. Dynamic QR Pass Generation & Verification
  // ============================================================================
  describe("Digital Membership Card & Dynamic QR", () => {
    it("generates a dynamic HMAC-SHA256 token and high-contrast data URL", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(gymA as any);
      vi.spyOn(db.member, "findFirst").mockResolvedValue(memberA as any);

      const qrResult = await refreshPortalDynamicQr(
        memberA.userId,
        memberA.email,
        gymA.slug
      );

      expect(qrResult.token).toBeDefined();
      expect(qrResult.qrDataUrl).toMatch(/^data:image\/png;base64,/);
      expect(qrResult.expiresInSeconds).toBe(60);

      // Verify the token cryptographically
      const verified = verifyDynamicQrToken(
        qrResult.token,
        gymA.id,
        gymA.qrSigningSecret
      );
      expect(verified.memberId).toBe(memberA.id);
      expect(verified.gymId).toBe(gymA.id);
    });

    it("guarantees zero PII in the dynamic QR token payload", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(gymA as any);
      vi.spyOn(db.member, "findFirst").mockResolvedValue(memberA as any);

      const qrResult = await refreshPortalDynamicQr(
        memberA.userId,
        memberA.email,
        gymA.slug
      );

      const rawJson = Buffer.from(qrResult.token, "base64url").toString("utf-8");
      const parsed = JSON.parse(rawJson);

      // Must only contain non-PII operational fields
      expect(Object.keys(parsed).sort()).toEqual(
        ["gid", "mid", "nonce", "sig", "ts", "v"].sort()
      );
      expect(rawJson).not.toContain(memberA.email);
      expect(rawJson).not.toContain(memberA.phone);
      expect(rawJson).not.toContain(memberA.firstName);
    });

    it("rejects token verified against a different gym workspace", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(gymA as any);
      vi.spyOn(db.member, "findFirst").mockResolvedValue(memberA as any);

      const qrResult = await refreshPortalDynamicQr(
        memberA.userId,
        memberA.email,
        gymA.slug
      );

      // Verify against gymB (different secret/gymId)
      expect(() =>
        verifyDynamicQrToken(qrResult.token, gymB.id, gymB.qrSigningSecret)
      ).toThrow();
    });
  });

  // ============================================================================
  // 3. Portal Data Aggregation (All 10 Sections)
  // ============================================================================
  describe("Portal Data Aggregation", () => {
    it("aggregates membership, attendance, billing, workouts, and classes", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(gymA as any);
      vi.spyOn(db.member, "findFirst").mockResolvedValue(memberA as any);
      vi.spyOn(db.membership, "findMany").mockResolvedValue([mockMembership] as any);
      vi.spyOn(db.attendanceRecord, "count")
        .mockResolvedValueOnce(45) // all time
        .mockResolvedValueOnce(12); // month
      vi.spyOn(db.attendanceRecord, "findMany").mockResolvedValue([
        {
          id: "att-1",
          checkInTime: new Date(),
          checkOutTime: null,
          status: "VERIFIED",
          checkInMethod: "QR_SCAN",
        },
      ] as any);

      vi.spyOn(db.invoice, "findMany").mockResolvedValue([
        {
          id: "inv-1",
          invoiceNumber: "INV-2026-0001",
          issueDate: new Date(),
          dueDate: new Date(),
          subtotal: 150.0,
          taxAmount: 0.0,
          totalAmount: 150.0,
          paidAmount: 150.0,
          dueAmount: 0.0,
          status: "PAID",
          notes: null,
          allocations: [],
        },
      ] as any);

      vi.spyOn(db.payment, "findMany").mockResolvedValue([
        {
          id: "pay-1",
          paymentNumber: "PAY-2026-0001",
          amount: 150.0,
          method: "UPI",
          status: "COMPLETED",
          receivedAt: new Date(),
          isGatewayVerified: false,
          notes: null,
        },
      ] as any);

      vi.spyOn(db.memberWorkoutAssignment, "findFirst").mockResolvedValue({
        id: "assign-1",
        plan: {
          id: "plan-w1",
          name: "Push Pull Legs",
          description: "Hypertrophy routine",
          difficultyLevel: "INTERMEDIATE",
          entries: [
            {
              id: "ent-1",
              dayOfWeek: 1,
              orderIndex: 0,
              exerciseId: "ex-1",
              exercise: { name: "Bench Press", category: "CHEST" },
              sets: 4,
              reps: 8,
              targetWeightKg: 80,
              restSeconds: 90,
              notes: "Focus on form",
            },
          ],
        },
      } as any);

      vi.spyOn(db.memberFitnessProfile, "findUnique").mockResolvedValue({
        id: "fit-1",
        memberId: memberA.id,
        heightCm: 178,
        fitnessGoals: "Muscle gain",
        fitnessNotes: "No shoulder injuries",
      } as any);

      vi.spyOn(db.memberWeightLog, "findMany").mockResolvedValue([
        { id: "w-1", weightKg: 75.5, logDate: new Date(), notes: "Morning fasted" },
      ] as any);

      vi.spyOn(db.memberMeasurement, "findMany").mockResolvedValue([]);
      vi.spyOn(db.workoutRecord, "findMany").mockResolvedValue([]);

      vi.spyOn(db.classSchedule, "findMany").mockResolvedValue([
        {
          id: "sch-1",
          startTime: new Date(Date.now() + 86400000),
          endTime: new Date(Date.now() + 90000000),
          capacity: 20,
          bookedCount: 5,
          roomLocation: "Studio A",
          class: { name: "Zumba Burn", description: "Dance fitness", durationMinutes: 60 },
          instructor: { id: "inst-1", name: "Maria Coach" },
          bookings: [],
        },
      ] as any);

      vi.spyOn(db.classBooking, "findMany").mockResolvedValue([]);

      const data = (await getPortalDashboardData(
        memberA.userId,
        memberA.email,
        gymA.slug
      )) as any;

      expect(data.hasLinkedProfile).toBe(true);
      expect(data.gym.name).toBe("Alpha Fitness Club");
      expect(data.member.fullName).toBe("Jane Doe");

      // Verify active membership & expiry
      expect(data.membership.active?.planName).toBe("Gold Annual Pass");
      expect(data.membership.active?.expiryStatus).toBe("ACTIVE");
      expect(data.membership.active?.benefits).toContain("Gym Floor Access");

      // Verify attendance
      expect(data.attendance.totalCheckIns).toBe(45);
      expect(data.attendance.monthCheckIns).toBe(12);

      // Verify billing
      expect(data.billing.totalInvoiced).toBe(150.0);
      expect(data.billing.totalPaid).toBe(150.0);
      expect(data.billing.outstandingBalance).toBe(0.0);

      // Verify workout plan
      expect(data.workouts.activePlan?.name).toBe("Push Pull Legs");
      expect(data.workouts.activePlan?.entries[0].exerciseName).toBe("Bench Press");

      // Verify classes
      expect(data.classes.upcoming[0].className).toBe("Zumba Burn");
      expect(data.classes.upcoming[0].spotsRemaining).toBe(15);
    });

    it("correctly identifies EXPIRING_SOON status when <= 7 days remain", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(gymA as any);
      vi.spyOn(db.member, "findFirst").mockResolvedValue(memberA as any);
      vi.spyOn(db.membership, "findMany").mockResolvedValue([
        {
          ...mockMembership,
          endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days remaining
        },
      ] as any);

      // Stub others to return empties
      vi.spyOn(db.attendanceRecord, "count").mockResolvedValue(0);
      vi.spyOn(db.attendanceRecord, "findMany").mockResolvedValue([]);
      vi.spyOn(db.invoice, "findMany").mockResolvedValue([]);
      vi.spyOn(db.payment, "findMany").mockResolvedValue([]);
      vi.spyOn(db.memberWorkoutAssignment, "findFirst").mockResolvedValue(null);
      vi.spyOn(db.memberFitnessProfile, "findUnique").mockResolvedValue(null);
      vi.spyOn(db.memberWeightLog, "findMany").mockResolvedValue([]);
      vi.spyOn(db.memberMeasurement, "findMany").mockResolvedValue([]);
      vi.spyOn(db.workoutRecord, "findMany").mockResolvedValue([]);
      vi.spyOn(db.classSchedule, "findMany").mockResolvedValue([]);
      vi.spyOn(db.classBooking, "findMany").mockResolvedValue([]);

      const data = (await getPortalDashboardData(
        memberA.userId,
        memberA.email,
        gymA.slug
      )) as any;

      expect(data.hasLinkedProfile).toBe(true);
      expect(data.membership.active?.expiryStatus).toBe("EXPIRING_SOON");
      expect(data.membership.active?.daysRemaining).toBeLessThanOrEqual(7);
    });
  });

  // ============================================================================
  // 4. Cross-Member Access Denial
  // ============================================================================
  describe("Cross-Member Access Protection", () => {
    it("rejects booking cancellation if booking belongs to another member", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(gymA as any);
      vi.spyOn(db.member, "findFirst").mockResolvedValue(memberA as any); // authenticated as Jane Doe

      // Booking belongs to Bob Smith (memberB)
      vi.spyOn(db.classBooking, "findFirst").mockResolvedValue({
        id: "booking-bob",
        gymId: gymA.id,
        memberId: memberB.id, // NOT Jane Doe
        status: BookingStatus.CONFIRMED,
      } as any);

      await expect(
        portalCancelBooking(
          memberA.userId,
          memberA.email,
          gymA.slug,
          "booking-bob"
        )
      ).rejects.toThrow(PortalSecurityError);
    });
  });

  // ============================================================================
  // 5. Self-Service Actions
  // ============================================================================
  describe("Member Self-Service Actions", () => {
    it("updates contact details strictly for authenticated member", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(gymA as any);
      vi.spyOn(db.member, "findFirst").mockResolvedValue(memberA as any);
      vi.spyOn(db.member, "update").mockResolvedValue({
        ...memberA,
        phone: "+1 555-9999",
        address: "789 Pine Road",
      } as any);

      const result = await updatePortalMemberProfile(
        memberA.userId,
        memberA.email,
        gymA.slug,
        {
          phone: "+1 555-9999",
          address: "789 Pine Road",
          emergencyContactName: "John Doe",
          emergencyContactPhone: "+1 555-0188",
        }
      );

      expect(result.success).toBe(true);
      expect(result.member.phone).toBe("+1 555-9999");
      expect(db.member.update).toHaveBeenCalledWith({
        where: { id: memberA.id, gymId: gymA.id },
        data: expect.objectContaining({
          phone: "+1 555-9999",
          address: "789 Pine Road",
        }),
      });
    });

    it("logs current weight entry for member", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(gymA as any);
      vi.spyOn(db.member, "findFirst").mockResolvedValue(memberA as any);
      vi.spyOn(db.memberFitnessProfile, "findUnique").mockResolvedValue({
        id: "fit-1",
        memberId: memberA.id,
      } as any);

      vi.spyOn(db.memberWeightLog, "create").mockResolvedValue({
        id: "w-new",
        gymId: gymA.id,
        memberId: memberA.id,
        profileId: "fit-1",
        weightKg: 73.2,
        logDate: new Date(),
        notes: "Post-workout",
      } as any);

      const res = await portalLogMemberWeight(
        memberA.userId,
        memberA.email,
        gymA.slug,
        {
          weightKg: 73.2,
          notes: "Post-workout",
        }
      );

      expect(res.weightKg).toBe(73.2);
      expect(db.memberWeightLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          memberId: memberA.id,
          weightKg: 73.2,
          notes: "Post-workout",
        }),
      });
    });
  });
});
