/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMember,
  updateMember,
  archiveMember,
  unarchiveMember,
  deleteMember,
  getMemberById,
  importMembersFromCsv,
  exportMembersToCsv,
  DuplicateMemberError,
  MemberIntegrityError,
} from "@/lib/services/member.service";
import { createTenantContext, TenantAccessViolationError } from "@/lib/tenant/context";
import { db } from "@/lib/db";
import { GymRole, MemberStatus } from "@prisma/client";

describe("Milestone M06: Member Management Service & Business Rules", () => {
  const gymAContext = createTenantContext({
    gymId: "gym-alpha-111",
    userId: "staff-alpha",
    role: GymRole.STAFF,
  });

  const gymAOwnerContext = createTenantContext({
    gymId: "gym-alpha-111",
    userId: "owner-alpha",
    role: GymRole.OWNER,
  });

  const gymBContext = createTenantContext({
    gymId: "gym-beta-222",
    userId: "staff-beta",
    role: GymRole.STAFF,
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Member Creation & Unique Code Auto-Generation", () => {
    it("successfully creates a new member with auto-generated code and activity log", async () => {
      vi.spyOn(db.member, "findFirst").mockResolvedValue(null);
      vi.spyOn(db.member, "count").mockResolvedValue(0);
      vi.spyOn(db.member, "findUnique").mockResolvedValue(null);

      const createdMemberObj = {
        id: "mem-new-1",
        gymId: "gym-alpha-111",
        memberCode: "MEM-1001",
        firstName: "Marcus",
        lastName: "Aurelius",
        phone: "+15551234567",
        email: "marcus@rome.com",
        status: MemberStatus.ACTIVE,
        joiningDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        return callback({
          member: {
            create: vi.fn().mockResolvedValue(createdMemberObj),
          },
          memberActivity: {
            create: vi.fn().mockResolvedValue({ id: "act-1" }),
          },
        });
      });

      const member = await createMember(
        gymAContext,
        {
          firstName: "Marcus",
          lastName: "Aurelius",
          phone: "+15551234567",
          email: "marcus@rome.com",
        },
        "Coach Seneca"
      );

      expect(member.id).toBe("mem-new-1");
      expect(member.memberCode).toBe("MEM-1001");
      expect(member.firstName).toBe("Marcus");
    });

    it("prevents duplicate phone numbers within the same gym", async () => {
      vi.spyOn(db.member, "findFirst").mockResolvedValue({
        id: "mem-existing",
        memberCode: "MEM-1001",
      } as any);

      await expect(
        createMember(gymAContext, {
          firstName: "Lucius",
          lastName: "Verus",
          phone: "+15551234567",
        })
      ).rejects.toThrow(DuplicateMemberError);
    });

    it("prevents duplicate email addresses within the same gym", async () => {
      vi.spyOn(db.member as any, "findFirst").mockImplementation(async (args: any) => {
        if (args?.where?.email) {
          return { id: "mem-existing", memberCode: "MEM-1001" } as any;
        }
        return null;
      });

      await expect(
        createMember(gymAContext, {
          firstName: "Lucius",
          lastName: "Verus",
          email: "marcus@rome.com",
        })
      ).rejects.toThrow(DuplicateMemberError);
    });
  });

  describe("Member Profile & Relational Retrieval", () => {
    it("retrieves full member profile and calculates outstanding dues", async () => {
      const mockProfile = {
        id: "mem-123",
        gymId: "gym-alpha-111",
        memberCode: "MEM-1001",
        firstName: "Marcus",
        lastName: "Aurelius",
        gym: { currency: "USD", name: "Alpha Gym", slug: "alpha" },
        memberships: [
          {
            id: "mship-1",
            status: "ACTIVE",
            plan: { name: "Gold Monthly" },
            startDate: new Date(),
            endDate: new Date(),
          },
        ],
        invoices: [
          { status: "ISSUED", dueAmount: 75.0 },
          { status: "PAID", dueAmount: 0.0 },
        ],
        payments: [],
        attendanceRecords: [],
        workoutRecords: [],
        classBookings: [],
        activities: [],
      };

      vi.spyOn(db.member, "findUnique").mockResolvedValue(mockProfile as any);

      const profile = await getMemberById(gymAContext, "mem-123");

      expect(profile.id).toBe("mem-123");
      expect(profile.outstandingDues).toBe(75.0);
      expect(profile.activeMembership?.plan.name).toBe("Gold Monthly");
    });

    it("strictly blocks cross-tenant profile retrieval", async () => {
      // Member belongs to Gym B, but queried with Gym A's context
      vi.spyOn(db.member, "findUnique").mockResolvedValue({
        id: "mem-gym-b",
        gymId: "gym-beta-222",
        gym: { currency: "USD" },
        memberships: [],
        invoices: [],
        payments: [],
        attendanceRecords: [],
        workoutRecords: [],
        classBookings: [],
        activities: [],
      } as any);

      await expect(getMemberById(gymAContext, "mem-gym-b")).rejects.toThrow(
        TenantAccessViolationError
      );
    });
  });

  describe("Member Archiving & Restoration Workflows", () => {
    it("archives a member without destroying records", async () => {
      vi.spyOn(db.member, "findUnique").mockResolvedValue({
        id: "mem-123",
        gymId: "gym-alpha-111",
        memberCode: "MEM-1001",
      } as any);

      const mockArchived = {
        id: "mem-123",
        status: MemberStatus.ARCHIVED,
        archivedReason: "Relocating out of city",
      };

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        return callback({
          member: {
            update: vi.fn().mockResolvedValue(mockArchived),
          },
          memberActivity: {
            create: vi.fn().mockResolvedValue({ id: "act-archived" }),
          },
        });
      });

      const result = await archiveMember(
        gymAContext,
        "mem-123",
        "Relocating out of city"
      );

      expect(result.status).toBe(MemberStatus.ARCHIVED);
    });

    it("restores an archived member to ACTIVE status", async () => {
      vi.spyOn(db.member, "findUnique").mockResolvedValue({
        id: "mem-123",
        gymId: "gym-alpha-111",
      } as any);

      const mockRestored = {
        id: "mem-123",
        status: MemberStatus.ACTIVE,
        archivedAt: null,
      };

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        return callback({
          member: {
            update: vi.fn().mockResolvedValue(mockRestored),
          },
          memberActivity: {
            create: vi.fn().mockResolvedValue({ id: "act-restored" }),
          },
        });
      });

      const result = await unarchiveMember(gymAContext, "mem-123");
      expect(result.status).toBe(MemberStatus.ACTIVE);
    });
  });

  describe("Business Deletion Integrity Check", () => {
    it("rejects permanent deletion when member has existing invoices", async () => {
      vi.spyOn(db.member, "findUnique").mockResolvedValue({
        id: "mem-123",
        gymId: "gym-alpha-111",
        memberCode: "MEM-1001",
      } as any);

      vi.spyOn(db.invoice, "count").mockResolvedValue(2);
      vi.spyOn(db.payment, "count").mockResolvedValue(0);
      vi.spyOn(db.attendanceRecord, "count").mockResolvedValue(0);

      await expect(deleteMember(gymAOwnerContext, "mem-123")).rejects.toThrow(
        MemberIntegrityError
      );
    });

    it("rejects permanent deletion when member has recorded check-ins", async () => {
      vi.spyOn(db.member, "findUnique").mockResolvedValue({
        id: "mem-123",
        gymId: "gym-alpha-111",
        memberCode: "MEM-1001",
      } as any);

      vi.spyOn(db.invoice, "count").mockResolvedValue(0);
      vi.spyOn(db.payment, "count").mockResolvedValue(0);
      vi.spyOn(db.attendanceRecord, "count").mockResolvedValue(5);

      await expect(deleteMember(gymAOwnerContext, "mem-123")).rejects.toThrow(
        MemberIntegrityError
      );
    });

    it("allows permanent deletion if member has 0 invoices, payments, or check-ins", async () => {
      vi.spyOn(db.member, "findUnique").mockResolvedValue({
        id: "mem-clean",
        gymId: "gym-alpha-111",
        memberCode: "MEM-9999",
      } as any);

      vi.spyOn(db.invoice, "count").mockResolvedValue(0);
      vi.spyOn(db.payment, "count").mockResolvedValue(0);
      vi.spyOn(db.attendanceRecord, "count").mockResolvedValue(0);

      const deleteSpy = vi.spyOn(db.member, "delete").mockResolvedValue({
        id: "mem-clean",
      } as any);

      await deleteMember(gymAOwnerContext, "mem-clean");
      expect(deleteSpy).toHaveBeenCalledWith({ where: { id: "mem-clean" } });
    });
  });

  describe("CSV Import & Export", () => {
    it("validates and imports multiple valid rows from CSV text", async () => {
      const csv = `First Name,Last Name,Phone,Email\nAlexander,Great,+15553334444,alex@macedon.com\nPtolemy,Soter,+15554445555,ptolemy@alexandria.com`;

      vi.spyOn(db.member, "findFirst").mockResolvedValue(null);
      vi.spyOn(db.member, "count").mockResolvedValue(0);
      vi.spyOn(db.member, "findUnique").mockResolvedValue(null);

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        return callback({
          member: {
            create: vi.fn().mockResolvedValue({ id: "mem-created" }),
          },
          memberActivity: {
            create: vi.fn().mockResolvedValue({ id: "act-created" }),
          },
        });
      });

      const res = await importMembersFromCsv(gymAContext, csv, "Admin");

      expect(res.totalRows).toBe(2);
      expect(res.imported).toBe(2);
      expect(res.skipped).toBe(0);
      expect(res.errors).toHaveLength(0);
    });

    it("flags missing required headers in CSV text", async () => {
      const invalidCsv = `Phone,Email\n+15553334444,alex@macedon.com`;
      const res = await importMembersFromCsv(gymAContext, invalidCsv);

      expect(res.imported).toBe(0);
      expect(res.errors[0]).toContain("missing required");
    });

    it("exports member list in valid CSV format", async () => {
      vi.spyOn(db.member, "findMany").mockResolvedValue([
        {
          id: "mem-1",
          memberCode: "MEM-1001",
          firstName: "Julius",
          lastName: "Caesar",
          email: "julius@rome.com",
          phone: "+15551112222",
          status: MemberStatus.ACTIVE,
          joiningDate: new Date("2026-01-01"),
          emergencyContactName: "Calpurnia",
          emergencyContactPhone: "+15559998888",
          memberships: [{ plan: { name: "Pro Plan" } }],
          invoices: [{ dueAmount: 50.0 }],
        },
      ] as any);

      vi.spyOn(db.member, "count").mockResolvedValue(1);

      const csvOutput = await exportMembersToCsv(gymAContext);

      expect(csvOutput).toContain("Member Code,First Name,Last Name");
      expect(csvOutput).toContain('"MEM-1001","Julius","Caesar"');
      expect(csvOutput).toContain('"julius@rome.com"');
    });
  });

  describe("Cross-Tenant Isolation Enforcement", () => {
    it("ensures Gym A cannot edit or delete Gym B's members", async () => {
      vi.spyOn(db.member, "findUnique").mockResolvedValue({
        id: "mem-beta",
        gymId: "gym-beta-222",
      } as any);

      await expect(
        updateMember(gymAContext, "mem-beta", { id: "mem-beta", firstName: "Intruder" })
      ).rejects.toThrow(TenantAccessViolationError);

      await expect(deleteMember(gymAOwnerContext, "mem-beta")).rejects.toThrow(
        TenantAccessViolationError
      );

      await expect(archiveMember(gymAContext, "mem-beta")).rejects.toThrow(
        TenantAccessViolationError
      );

      // Verify that Gym B is permitted to access its own member
      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        return callback({
          member: {
            update: vi.fn().mockResolvedValue({ id: "mem-beta", status: MemberStatus.ARCHIVED }),
          },
          memberActivity: {
            create: vi.fn().mockResolvedValue({ id: "act-beta" }),
          },
        });
      });

      const bResult = await archiveMember(gymBContext, "mem-beta");
      expect(bResult.id).toBe("mem-beta");
    });
  });
});
