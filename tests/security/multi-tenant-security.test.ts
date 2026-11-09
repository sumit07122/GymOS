/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import {
  createTenantContext,
  TenantAccessViolationError,
  assertPermission,
} from "@/lib/tenant/context";
import { memberRepository } from "@/lib/repositories/member.repository";
import { membershipRepository } from "@/lib/repositories/membership.repository";
import { invoiceRepository } from "@/lib/repositories/invoice.repository";
import { attendanceRepository } from "@/lib/repositories/attendance.repository";
import { InsufficientPermissionError } from "@/lib/tenant/permissions";
import { GymRole, MemberStatus, InvoiceStatus, AttendanceStatus, CheckInMethod, Prisma } from "@prisma/client";

describe("Milestone M04: Multi-Tenant Security & Authorization Enforcement", () => {
  // Tenant A: IronForge Fitness
  const gymAContext = createTenantContext({
    gymId: "gym-ironforge-001",
    userId: "user-owner-ironforge",
    role: GymRole.OWNER,
    userEmail: "owner@ironforge.dev",
  });

  // Staff at Tenant A
  const gymAStaffContext = createTenantContext({
    gymId: "gym-ironforge-001",
    userId: "user-staff-ironforge",
    role: GymRole.STAFF,
    userEmail: "staff@ironforge.dev",
  });

  // Member 1 at Tenant A
  const gymAMember1Context = createTenantContext({
    gymId: "gym-ironforge-001",
    userId: "user-member-1-ironforge",
    role: GymRole.MEMBER,
    userEmail: "member1@ironforge.dev",
  });

  // Tenant B: Apex Performance
  const gymBContext = createTenantContext({
    gymId: "gym-apex-002",
    userId: "user-owner-apex",
    role: GymRole.OWNER,
    userEmail: "owner@apex.dev",
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ----------------------------------------------------------------------------
  // 1. Cross-Tenant Member Isolation
  // ----------------------------------------------------------------------------
  describe("1. Cross-Tenant Member Isolation", () => {
    it("prevents Gym A from reading a member belonging to Gym B (and vice versa)", async () => {
      // Mock db returning a member that belongs to Gym B
      vi.spyOn(db.member, "findUnique").mockResolvedValue({
        id: "member-b-999",
        gymId: "gym-apex-002",
        userId: "user-b-999",
        memberCode: "MEM-AP-999",
        firstName: "Marcus",
        lastName: "Vance",
        email: "marcus@apex.dev",
        phone: "+15550009999",
        dateOfBirth: null,
        gender: null,
        emergencyContactName: null,
        emergencyContactPhone: null,
        medicalNotes: null,
        status: MemberStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      // Gym A owner attempts to read Gym B's member
      await expect(
        memberRepository.findById(gymAContext, "member-b-999")
      ).rejects.toThrow(TenantAccessViolationError);

      // Gym B owner reading their OWN member succeeds
      const ownMember = await memberRepository.findById(gymBContext, "member-b-999");
      expect(ownMember).toBeDefined();
      expect(ownMember?.id).toBe("member-b-999");
    });

    it("prevents Gym A from updating a member belonging to Gym B", async () => {
      vi.spyOn(db.member, "findUnique").mockResolvedValue({
        id: "member-b-999",
        gymId: "gym-apex-002",
        userId: null,
        memberCode: "MEM-AP-999",
        firstName: "Marcus",
        lastName: "Vance",
        email: null,
        phone: null,
        dateOfBirth: null,
        gender: null,
        emergencyContactName: null,
        emergencyContactPhone: null,
        medicalNotes: null,
        status: MemberStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        memberRepository.update(gymAContext, "member-b-999", {
          firstName: "Tampered Name",
        })
      ).rejects.toThrow(TenantAccessViolationError);
    });

    it("prevents Gym A from deleting a member belonging to Gym B", async () => {
      vi.spyOn(db.member, "findUnique").mockResolvedValue({
        id: "member-b-999",
        gymId: "gym-apex-002",
        userId: null,
        memberCode: "MEM-AP-999",
        firstName: "Marcus",
        lastName: "Vance",
        email: null,
        phone: null,
        dateOfBirth: null,
        gender: null,
        emergencyContactName: null,
        emergencyContactPhone: null,
        medicalNotes: null,
        status: MemberStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        memberRepository.delete(gymAContext, "member-b-999")
      ).rejects.toThrow(TenantAccessViolationError);
    });
  });

  // ----------------------------------------------------------------------------
  // 2. Cross-Tenant Relationship Prevention (Membership & Plans)
  // ----------------------------------------------------------------------------
  describe("2. Cross-Tenant Relationship Prevention", () => {
    it("rejects membership creation if the plan belongs to a different gym", async () => {
      // Member belongs to Gym A
      vi.spyOn(db.member, "findUnique").mockResolvedValue({
        id: "member-a-101",
        gymId: "gym-ironforge-001",
        userId: null,
        memberCode: "MEM-IF-101",
        firstName: "Sarah",
        lastName: "Connor",
        email: null,
        phone: null,
        dateOfBirth: null,
        gender: null,
        emergencyContactName: null,
        emergencyContactPhone: null,
        medicalNotes: null,
        status: MemberStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      // BUT the plan belongs to Gym B!
      vi.spyOn(db.membershipPlan, "findUnique").mockResolvedValue({
        id: "plan-b-vip",
        gymId: "gym-apex-002", // Different gym
        name: "Discounted VIP",
        description: null,
        durationDays: 30,
        price: new Prisma.Decimal(50),
        admissionFee: new Prisma.Decimal(0),
        maxSessions: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        membershipRepository.create(gymAContext, {
          memberId: "member-a-101",
          planId: "plan-b-vip",
          startDate: new Date(),
          endDate: new Date(),
        })
      ).rejects.toThrow(TenantAccessViolationError);
    });
  });

  // ----------------------------------------------------------------------------
  // 3. Cross-Tenant Financial Isolation
  // ----------------------------------------------------------------------------
  describe("3. Cross-Tenant Financial Isolation", () => {
    it("prevents Gym A from accessing Gym B's invoices", async () => {
      vi.spyOn(db.invoice as any, "findUnique").mockImplementation(async () => ({
        id: "invoice-b-001",
        gymId: "gym-apex-002",
        memberId: "member-b-999",
        membershipId: null,
        invoiceNumber: "INV-2026-0001",
        issueDate: new Date(),
        dueDate: new Date(),
        subtotal: new Prisma.Decimal(120),
        taxAmount: new Prisma.Decimal(10),
        totalAmount: new Prisma.Decimal(130),
        paidAmount: new Prisma.Decimal(130),
        dueAmount: new Prisma.Decimal(0),
        status: InvoiceStatus.PAID,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        member: {
          id: "member-b-999",
          userId: "user-b-999",
          gymId: "gym-apex-002",
          memberCode: "MEM-AP-999",
          firstName: "Marcus",
          lastName: "Vance",
          email: null,
          phone: null,
          dateOfBirth: null,
          gender: null,
          emergencyContactName: null,
          emergencyContactPhone: null,
          medicalNotes: null,
          status: MemberStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as unknown as any));

      await expect(
        invoiceRepository.findById(gymAContext, "invoice-b-001")
      ).rejects.toThrow(TenantAccessViolationError);
    });

    it("prevents a member from viewing another member's invoice within the same gym", async () => {
      // Invoice belongs to Gym A, but to user-member-2 (NOT gymAMember1Context.userId)
      vi.spyOn(db.invoice as any, "findUnique").mockImplementation(async () => ({
        id: "invoice-a-other-member",
        gymId: "gym-ironforge-001",
        memberId: "member-a-202",
        membershipId: null,
        invoiceNumber: "INV-2026-0002",
        issueDate: new Date(),
        dueDate: new Date(),
        subtotal: new Prisma.Decimal(100),
        taxAmount: new Prisma.Decimal(0),
        totalAmount: new Prisma.Decimal(100),
        paidAmount: new Prisma.Decimal(0),
        dueAmount: new Prisma.Decimal(100),
        status: InvoiceStatus.ISSUED,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        member: {
          id: "member-a-202",
          userId: "user-different-member-ironforge", // Different user!
          gymId: "gym-ironforge-001",
          memberCode: "MEM-IF-202",
          firstName: "Elena",
          lastName: "Fisher",
          email: null,
          phone: null,
          dateOfBirth: null,
          gender: null,
          emergencyContactName: null,
          emergencyContactPhone: null,
          medicalNotes: null,
          status: MemberStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as unknown as any));

      // Member 1 attempts to view Member 2's invoice
      await expect(
        invoiceRepository.findById(gymAMember1Context, "invoice-a-other-member")
      ).rejects.toThrow(TenantAccessViolationError);
    });
  });

  // ----------------------------------------------------------------------------
  // 4. Cross-Tenant Attendance Isolation
  // ----------------------------------------------------------------------------
  describe("4. Cross-Tenant Attendance Isolation", () => {
    it("prevents Gym A check-in terminal from recording attendance for a Gym B member", async () => {
      // Scanner scans a QR token for Member B
      vi.spyOn(db.member, "findUnique").mockResolvedValue({
        id: "member-b-foreign",
        gymId: "gym-apex-002", // Belongs to Gym B
        userId: null,
        memberCode: "MEM-AP-777",
        firstName: "Foreign",
        lastName: "Visitor",
        email: null,
        phone: null,
        dateOfBirth: null,
        gender: null,
        emergencyContactName: null,
        emergencyContactPhone: null,
        medicalNotes: null,
        status: MemberStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        attendanceRepository.recordCheckIn(gymAContext, {
          memberId: "member-b-foreign",
          checkInMethod: CheckInMethod.QR_SCAN,
          status: AttendanceStatus.VERIFIED,
        })
      ).rejects.toThrow(TenantAccessViolationError);
    });
  });

  // ----------------------------------------------------------------------------
  // 5. Role Permission Enforcement (Staff vs Owner)
  // ----------------------------------------------------------------------------
  describe("5. Role-Based Permission Enforcement", () => {
    it("prevents staff from deleting members (Owner only)", async () => {
      vi.spyOn(db.member, "findUnique").mockResolvedValue({
        id: "member-a-101",
        gymId: "gym-ironforge-001",
        userId: null,
        memberCode: "MEM-IF-101",
        firstName: "Sarah",
        lastName: "Connor",
        email: null,
        phone: null,
        dateOfBirth: null,
        gender: null,
        emergencyContactName: null,
        emergencyContactPhone: null,
        medicalNotes: null,
        status: MemberStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      // Staff does NOT have MEMBER_DELETE permission
      await expect(
        memberRepository.delete(gymAStaffContext, "member-a-101")
      ).rejects.toThrow(InsufficientPermissionError);
    });

    it("prevents staff from processing financial refunds", () => {
      expect(() => {
        assertPermission(gymAStaffContext, "REFUND_PROCESS");
      }).toThrow(InsufficientPermissionError);

      // But Owner can process refunds
      expect(() => {
        assertPermission(gymAContext, "REFUND_PROCESS");
      }).not.toThrow();
    });

    it("prevents members from scanning attendance", () => {
      expect(() => {
        assertPermission(gymAMember1Context, "ATTENDANCE_SCAN");
      }).toThrow(InsufficientPermissionError);
    });
  });

  // ----------------------------------------------------------------------------
  // 6. Payload Tampering & Client GymID Stripping
  // ----------------------------------------------------------------------------
  describe("6. Payload Tampering Protection", () => {
    it("enforces that created members are assigned ctx.gymId regardless of input", async () => {
      const createSpy = vi.spyOn(db.member, "create").mockResolvedValue({
        id: "new-member-id",
        gymId: gymAContext.gymId,
        userId: null,
        memberCode: "MEM-IF-999",
        firstName: "Test",
        lastName: "User",
        email: null,
        phone: null,
        dateOfBirth: null,
        gender: null,
        emergencyContactName: null,
        emergencyContactPhone: null,
        medicalNotes: null,
        status: MemberStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await memberRepository.create(gymAContext, {
        memberCode: "MEM-IF-999",
        firstName: "Test",
        lastName: "User",
      });

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            gymId: "gym-ironforge-001", // Strictly enforced from server context
          }),
        })
      );
    });
  });
});

