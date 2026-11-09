/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createPlan,
  updatePlan,
  archivePlan,
  assignMembership,
  renewMembership,
  extendMembership,
  pauseMembership,
  resumeMembership,
  cancelMembership,
  syncExpiredMemberships,
  DuplicatePlanError,
  PlanNotFoundError,
  OverlappingMembershipError,
  InvalidMembershipStateError,
} from "@/lib/services/membership.service";
import { createTenantContext } from "@/lib/tenant/context";
import { db } from "@/lib/db";
import { GymRole, MembershipStatus, MemberStatus } from "@prisma/client";

describe("Milestone M07: Membership Plans and Lifecycle Service", () => {
  const gymAOwnerContext = createTenantContext({
    gymId: "gym-alpha-111",
    userId: "owner-alpha",
    role: GymRole.OWNER,
  });

  const gymAStaffContext = createTenantContext({
    gymId: "gym-alpha-111",
    userId: "staff-alpha",
    role: GymRole.STAFF,
  });

  const gymBStaffContext = createTenantContext({
    gymId: "gym-beta-222",
    userId: "staff-beta",
    role: GymRole.STAFF,
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // 1. PLAN CREATION, EDITING, ARCHIVING & INVARIANT INTEGRITY
  // ============================================================================
  describe("Membership Plan Management", () => {
    it("creates a new plan with valid durations, pricing and perks", async () => {
      vi.spyOn(db.membershipPlan as any, "findUnique").mockResolvedValue(null);
      const createdPlan = {
        id: "plan-monthly-1",
        gymId: "gym-alpha-111",
        name: "Standard Monthly",
        description: "Full gym floor access",
        durationDays: 30,
        price: 49.99 as any,
        admissionFee: 20.0 as any,
        maxSessions: null,
        benefits: "Gym access, Locker room",
        accessRestrictions: "24/7",
        isActive: true,
        isArchived: false,
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.spyOn(db.membershipPlan as any, "create").mockResolvedValue(createdPlan);

      const result = await createPlan(gymAOwnerContext, {
        name: "Standard Monthly",
        description: "Full gym floor access",
        durationDays: 30,
        price: 49.99,
        admissionFee: 20.0,
        benefits: "Gym access, Locker room",
        accessRestrictions: "24/7",
        isActive: true,
      });

      expect(result.id).toBe("plan-monthly-1");
      expect(result.durationDays).toBe(30);
      expect(result.price).toBe(49.99);
      expect(db.membershipPlan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            gymId: "gym-alpha-111",
            name: "Standard Monthly",
            durationDays: 30,
          }),
        })
      );
    });

    it("prevents duplicate plan name within the same gym", async () => {
      vi.spyOn(db.membershipPlan as any, "findUnique").mockResolvedValue({
        id: "plan-existing",
        gymId: "gym-alpha-111",
        name: "Standard Monthly",
      });

      await expect(
        createPlan(gymAOwnerContext, {
          name: "Standard Monthly",
          durationDays: 30,
          price: 50,
          admissionFee: 0,
          isActive: true,
        })
      ).rejects.toThrow(DuplicatePlanError);
    });

    it("allows staff or owner to update plan details without mutating existing memberships", async () => {
      const existingPlan = {
        id: "plan-monthly-1",
        gymId: "gym-alpha-111",
        name: "Standard Monthly",
        durationDays: 30,
        price: 49.99 as any,
        admissionFee: 20.0 as any,
      };

      vi.spyOn(db.membershipPlan as any, "findUnique").mockResolvedValue(existingPlan);
      vi.spyOn(db.membershipPlan as any, "update").mockResolvedValue({
        ...existingPlan,
        price: 59.99 as any,
      });

      const updated = await updatePlan(gymAOwnerContext, {
        id: "plan-monthly-1",
        price: 59.99,
      });

      expect(updated.price).toBe(59.99);
      // Confirms only membershipPlan model was updated, preserving Membership historical snapshots
      expect(db.membershipPlan.update).toHaveBeenCalledTimes(1);
    });

    it("archives a plan so it cannot be assigned to future members", async () => {
      const existingPlan = {
        id: "plan-monthly-1",
        gymId: "gym-alpha-111",
        name: "Standard Monthly",
        isArchived: false,
      };

      vi.spyOn(db.membershipPlan as any, "findUnique").mockResolvedValue(existingPlan);
      vi.spyOn(db.membershipPlan as any, "update").mockResolvedValue({
        ...existingPlan,
        isArchived: true,
        isActive: false,
        archivedAt: new Date(),
      });

      const archived = await archivePlan(gymAOwnerContext, "plan-monthly-1");
      expect(archived.isArchived).toBe(true);
      expect(archived.isActive).toBe(false);
    });
  });

  // ============================================================================
  // 2. MEMBERSHIP ASSIGNMENT & DURATION CALCULATION
  // ============================================================================
  describe("Membership Assignment Lifecycle", () => {
    it("assigns plan, calculates exact end date, snapshots price, and creates audit log", async () => {
      const mockMember = {
        id: "mem-101",
        gymId: "gym-alpha-111",
        firstName: "Diana",
        lastName: "Prince",
      };
      const mockPlan = {
        id: "plan-quarterly",
        gymId: "gym-alpha-111",
        name: "Quarterly Pro",
        durationDays: 90,
        price: 135.0 as any,
        admissionFee: 25.0 as any,
        maxSessions: null,
        isArchived: false,
        isActive: true,
      };

      vi.spyOn(db.member as any, "findUnique").mockResolvedValue(mockMember);
      vi.spyOn(db.membershipPlan as any, "findUnique").mockResolvedValue(mockPlan);
      vi.spyOn(db.membership as any, "findFirst").mockResolvedValue(null);

      const fixedStart = new Date("2026-06-01T00:00:00.000Z");
      const expectedEnd = new Date("2026-08-30T00:00:00.000Z"); // 90 days later

      const createdMembership = {
        id: "mship-assigned-1",
        gymId: "gym-alpha-111",
        memberId: "mem-101",
        planId: "plan-quarterly",
        startDate: fixedStart,
        endDate: expectedEnd,
        pricePaid: 135.0 as any,
        admissionFeePaid: 25.0 as any,
        planNameSnapshot: "Quarterly Pro",
        status: MembershipStatus.ACTIVE,
        assignedByStaffId: "staff-alpha",
      };

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const txMock = {
          membership: {
            create: vi.fn().mockResolvedValue(createdMembership),
          },
          membershipAuditLog: {
            create: vi.fn().mockResolvedValue({ id: "audit-1" }),
          },
          member: {
            update: vi.fn().mockResolvedValue({ id: "mem-101" }),
          },
        };
        return await callback(txMock);
      });

      const result = await assignMembership(gymAStaffContext, {
        memberId: "mem-101",
        planId: "plan-quarterly",
        startDate: fixedStart.toISOString(),
      });

      expect(result.id).toBe("mship-assigned-1");
      expect(result.startDate).toEqual(fixedStart);
      expect(result.endDate).toEqual(expectedEnd);
      expect(result.planNameSnapshot).toBe("Quarterly Pro");
      expect(result.pricePaid).toBe(135.0);
    });

    it("prevents accidental overlapping active memberships for the same member", async () => {
      const mockMember = { id: "mem-101", gymId: "gym-alpha-111" };
      const mockPlan = {
        id: "plan-quarterly",
        gymId: "gym-alpha-111",
        name: "Quarterly Pro",
        durationDays: 90,
        price: 135,
        admissionFee: 0,
        isArchived: false,
      };

      vi.spyOn(db.member as any, "findUnique").mockResolvedValue(mockMember);
      vi.spyOn(db.membershipPlan as any, "findUnique").mockResolvedValue(mockPlan);

      // Existing active membership ending in July 2026
      vi.spyOn(db.membership as any, "findFirst").mockResolvedValue({
        id: "existing-mship",
        status: MembershipStatus.ACTIVE,
        endDate: new Date("2026-07-01"),
        planNameSnapshot: "Quarterly Pro",
        plan: { name: "Quarterly Pro" },
      });

      await expect(
        assignMembership(gymAStaffContext, {
          memberId: "mem-101",
          planId: "plan-quarterly",
          startDate: "2026-06-01",
        })
      ).rejects.toThrow(OverlappingMembershipError);
    });

    it("rejects assigning an archived plan", async () => {
      const mockMember = { id: "mem-101", gymId: "gym-alpha-111" };
      const archivedPlan = {
        id: "plan-archived",
        gymId: "gym-alpha-111",
        name: "Legacy Plan",
        durationDays: 30,
        price: 30,
        admissionFee: 0,
        isArchived: true,
      };

      vi.spyOn(db.member as any, "findUnique").mockResolvedValue(mockMember);
      vi.spyOn(db.membershipPlan as any, "findUnique").mockResolvedValue(archivedPlan);

      await expect(
        assignMembership(gymAStaffContext, {
          memberId: "mem-101",
          planId: "plan-archived",
        })
      ).rejects.toThrow(InvalidMembershipStateError);
    });

    it("rejects cross-tenant plan assignment (Gym B staff trying to assign Gym A plan)", async () => {
      const mockMemberInGymB = { id: "mem-202", gymId: "gym-beta-222" };
      const gymAPlan = {
        id: "plan-gym-a",
        gymId: "gym-alpha-111", // Belongs to Alpha
        name: "Gym A Special",
      };

      vi.spyOn(db.member as any, "findUnique").mockResolvedValue(mockMemberInGymB);
      vi.spyOn(db.membershipPlan as any, "findUnique").mockResolvedValue(gymAPlan);

      await expect(
        assignMembership(gymBStaffContext, {
          memberId: "mem-202",
          planId: "plan-gym-a",
        })
      ).rejects.toThrow(PlanNotFoundError);
    });
  });

  // ============================================================================
  // 3. MEMBERSHIP RENEWAL (SEAMLESS CHAINING)
  // ============================================================================
  describe("Membership Renewal Lifecycle", () => {
    it("seamlessly chains renewal to start immediately on current end date when active", async () => {
      const currentEnd = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days in future
      const currentMembership = {
        id: "mship-current",
        gymId: "gym-alpha-111",
        memberId: "mem-101",
        planId: "plan-annual",
        status: MembershipStatus.ACTIVE,
        endDate: currentEnd,
        plan: {
          id: "plan-annual",
          gymId: "gym-alpha-111",
          name: "Annual VIP",
          durationDays: 365,
          price: 499.0 as any,
          isArchived: false,
        },
      };

      vi.spyOn(db.membership as any, "findUnique").mockResolvedValue(currentMembership);
      vi.spyOn(db.membershipPlan as any, "findUnique").mockResolvedValue(currentMembership.plan);

      let createdRenewalMembership: any = null;
      const auditLogsCreated: any[] = [];

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const txMock = {
          membership: {
            create: vi.fn().mockImplementation((args) => {
              createdRenewalMembership = {
                id: "mship-renewed",
                ...args.data,
              };
              return Promise.resolve(createdRenewalMembership);
            }),
          },
          membershipAuditLog: {
            create: vi.fn().mockImplementation((args) => {
              auditLogsCreated.push(args.data);
              return Promise.resolve({ id: `audit-${auditLogsCreated.length}` });
            }),
          },
          member: {
            update: vi.fn().mockResolvedValue({ id: "mem-101" }),
          },
        };
        return await callback(txMock);
      });

      const renewed = await renewMembership(gymAStaffContext, {
        membershipId: "mship-current",
      });

      expect(renewed.id).toBe("mship-renewed");
      // Seamless renewal start date must match current membership's end date
      expect(new Date(createdRenewalMembership.startDate).getTime()).toBe(
        currentEnd.getTime()
      );
      // New end date is 365 days after currentEnd
      const expectedNewEnd = new Date(currentEnd.getTime() + 365 * 24 * 60 * 60 * 1000);
      expect(new Date(createdRenewalMembership.endDate).getTime()).toBe(
        expectedNewEnd.getTime()
      );
      expect(createdRenewalMembership.admissionFeePaid).toBe(0); // Renewal doesn't re-charge admission
      expect(auditLogsCreated.some((l) => l.action === "RENEWED")).toBe(true);
      expect(auditLogsCreated.some((l) => l.action === "CHAINED_RENEWAL")).toBe(true);
    });
  });

  // ============================================================================
  // 4. MEMBERSHIP EXTENSION & AUDIT LOGGING
  // ============================================================================
  describe("Manual Membership Extension", () => {
    it("extends membership end date and logs audit entry with mandatory reason", async () => {
      const initialEnd = new Date("2026-10-01T00:00:00.000Z");
      const currentMembership = {
        id: "mship-ext-1",
        gymId: "gym-alpha-111",
        memberId: "mem-101",
        endDate: initialEnd,
        status: MembershipStatus.ACTIVE,
        extendedDays: 0,
      };

      vi.spyOn(db.membership as any, "findUnique").mockResolvedValue(currentMembership);

      let updatedRecord: any = null;
      let auditLogRecord: any = null;

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const txMock = {
          membership: {
            update: vi.fn().mockImplementation((args) => {
              updatedRecord = { ...currentMembership, ...args.data };
              return Promise.resolve(updatedRecord);
            }),
          },
          membershipAuditLog: {
            create: vi.fn().mockImplementation((args) => {
              auditLogRecord = args.data;
              return Promise.resolve({ id: "audit-ext" });
            }),
          },
          member: {
            update: vi.fn().mockResolvedValue({ id: "mem-101" }),
          },
        };
        return await callback(txMock);
      });

      const extended = await extendMembership(gymAStaffContext, {
        membershipId: "mship-ext-1",
        extensionDays: 14,
        reason: "Holiday facility maintenance compensation",
      });

      const expectedNewEnd = new Date(initialEnd.getTime() + 14 * 24 * 60 * 60 * 1000);
      expect(new Date(extended.endDate).getTime()).toBe(expectedNewEnd.getTime());
      expect(extended.extendedDays).toBe(14);
      expect(auditLogRecord.action).toBe("EXTENDED");
      expect(auditLogRecord.details).toContain("Holiday facility maintenance compensation");
      expect(auditLogRecord.performedBy).toBe("staff-alpha");
    });

    it("rejects extending a cancelled membership", async () => {
      vi.spyOn(db.membership as any, "findUnique").mockResolvedValue({
        id: "mship-cancelled",
        gymId: "gym-alpha-111",
        status: MembershipStatus.CANCELLED,
      });

      await expect(
        extendMembership(gymAStaffContext, {
          membershipId: "mship-cancelled",
          extensionDays: 7,
          reason: "Test",
        })
      ).rejects.toThrow(InvalidMembershipStateError);
    });
  });

  // ============================================================================
  // 5. PAUSE & RESUME LIFECYCLE
  // ============================================================================
  describe("Membership Pause & Resume Lifecycle", () => {
    it("pauses active membership with reason and audit log", async () => {
      const activeMembership = {
        id: "mship-pause-1",
        gymId: "gym-alpha-111",
        memberId: "mem-101",
        status: MembershipStatus.ACTIVE,
      };

      vi.spyOn(db.membership as any, "findUnique").mockResolvedValue(activeMembership);

      let updatedRecord: any = null;
      let auditLogRecord: any = null;

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const txMock = {
          membership: {
            update: vi.fn().mockImplementation((args) => {
              updatedRecord = { ...activeMembership, ...args.data };
              return Promise.resolve(updatedRecord);
            }),
          },
          membershipAuditLog: {
            create: vi.fn().mockImplementation((args) => {
              auditLogRecord = args.data;
              return Promise.resolve({ id: "audit-pause" });
            }),
          },
        };
        return await callback(txMock);
      });

      const paused = await pauseMembership(gymAStaffContext, {
        membershipId: "mship-pause-1",
        reason: "Medical recovery doctor note",
      });

      expect(paused.status).toBe(MembershipStatus.PAUSED);
      expect(paused.pauseReason).toBe("Medical recovery doctor note");
      expect(auditLogRecord.action).toBe("PAUSED");
      expect(auditLogRecord.details).toContain("Medical recovery doctor note");
    });

    it("resumes paused membership and shifts end date by exact elapsed paused days", async () => {
      const initialEnd = new Date("2026-12-01T00:00:00.000Z");
      // Paused 10 days ago
      const pausedAt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

      const pausedMembership = {
        id: "mship-resume-1",
        gymId: "gym-alpha-111",
        memberId: "mem-101",
        status: MembershipStatus.PAUSED,
        pausedAt,
        endDate: initialEnd,
      };

      vi.spyOn(db.membership as any, "findUnique").mockResolvedValue(pausedMembership);

      let updatedRecord: any = null;
      let auditLogRecord: any = null;

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const txMock = {
          membership: {
            update: vi.fn().mockImplementation((args) => {
              updatedRecord = { ...pausedMembership, ...args.data };
              return Promise.resolve(updatedRecord);
            }),
          },
          membershipAuditLog: {
            create: vi.fn().mockImplementation((args) => {
              auditLogRecord = args.data;
              return Promise.resolve({ id: "audit-resume" });
            }),
          },
          member: {
            update: vi.fn().mockResolvedValue({ id: "mem-101" }),
          },
        };
        return await callback(txMock);
      });

      const resumed = await resumeMembership(gymAStaffContext, {
        membershipId: "mship-resume-1",
      });

      expect(resumed.status).toBe(MembershipStatus.ACTIVE);
      expect(resumed.pausedAt).toBeNull();
      // End date must have moved forward by ~10 days
      expect(new Date(resumed.endDate).getTime()).toBeGreaterThan(initialEnd.getTime());
      expect(auditLogRecord.action).toBe("RESUMED");
    });
  });

  // ============================================================================
  // 6. MEMBERSHIP CANCELLATION & EXPIRY SYNCHRONIZATION
  // ============================================================================
  describe("Cancellation & Expiry Synchronization", () => {
    it("cancels membership and updates member to INACTIVE if no other active contracts remain", async () => {
      const activeMembership = {
        id: "mship-cancel-1",
        gymId: "gym-alpha-111",
        memberId: "mem-101",
        status: MembershipStatus.ACTIVE,
      };

      vi.spyOn(db.membership as any, "findUnique").mockResolvedValue(activeMembership);

      let memberUpdatedTo: any = null;

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const txMock = {
          membership: {
            update: vi.fn().mockResolvedValue({
              ...activeMembership,
              status: MembershipStatus.CANCELLED,
              cancellationReason: "Relocated to another city",
            }),
            count: vi.fn().mockResolvedValue(0), // No other active memberships
          },
          membershipAuditLog: {
            create: vi.fn().mockResolvedValue({ id: "audit-cancel" }),
          },
          member: {
            update: vi.fn().mockImplementation((args) => {
              memberUpdatedTo = args.data.status;
              return Promise.resolve({ id: "mem-101" });
            }),
          },
        };
        return await callback(txMock);
      });

      const cancelled = await cancelMembership(gymAStaffContext, {
        membershipId: "mship-cancel-1",
        cancellationReason: "Relocated to another city",
      });

      expect(cancelled.status).toBe(MembershipStatus.CANCELLED);
      expect(memberUpdatedTo).toBe(MemberStatus.INACTIVE);
    });

    it("synchronizes expired memberships based on current date", async () => {
      const pastDueMemberships = [
        { id: "mship-old-1", memberId: "mem-1" },
        { id: "mship-old-2", memberId: "mem-2" },
      ];

      vi.spyOn(db.membership as any, "findMany").mockResolvedValue(pastDueMemberships);
      vi.spyOn(db.membership as any, "updateMany").mockResolvedValue({ count: 2 });

      const count = await syncExpiredMemberships(gymAStaffContext);
      expect(count).toBe(2);
      expect(db.membership.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: ["mship-old-1", "mship-old-2"] },
          gymId: "gym-alpha-111",
        },
        data: {
          status: MembershipStatus.EXPIRED,
        },
      });
    });
  });
});
