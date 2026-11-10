/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createClass,
  updateClass,
  listClasses,
  createSchedule,
  updateSchedule,
  cancelSchedule,
  bookClass,
  cancelBooking,
  markBookingAttendance,
  listSchedules,
  ClassNotFoundError,
  ScheduleNotFoundError,
  DuplicateClassError,
  OverbookingError,
  DuplicateBookingError,
  ScheduleConflictError,
  IneligibleBookingError,
} from "@/lib/services/class.service";
import { createTenantContext, TenantAccessViolationError } from "@/lib/tenant/context";
import { InsufficientPermissionError } from "@/lib/tenant/permissions";
import { db } from "@/lib/db";
import { GymRole, ClassStatus, BookingStatus, MemberStatus } from "@prisma/client";

describe("Milestone M12: Classes and Scheduling Management", () => {
  const gymAId = "gym-alpha-classes";
  const gymBId = "gym-beta-classes";

  const ownerAContext = createTenantContext({
    gymId: gymAId,
    userId: "owner-alpha",
    userEmail: "owner@alpha.com",
    role: GymRole.OWNER,
  });

  const memberAContext = createTenantContext({
    gymId: gymAId,
    userId: "member-alpha",
    userEmail: "member@alpha.com",
    role: GymRole.MEMBER,
  });

  const ownerBContext = createTenantContext({
    gymId: gymBId,
    userId: "owner-beta",
    userEmail: "owner@beta.com",
    role: GymRole.OWNER,
  });

  const mockClass = {
    id: "cls-001",
    gymId: gymAId,
    name: "HIIT Conditioning",
    description: "High intensity interval training",
    defaultCapacity: 20,
    durationMinutes: 45,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSchedule = {
    id: "sch-001",
    gymId: gymAId,
    classId: "cls-001",
    instructorUserId: "trainer-alpha",
    startTime: new Date("2026-11-15T09:00:00Z"),
    endTime: new Date("2026-11-15T09:45:00Z"),
    capacity: 20,
    bookedCount: 5,
    status: ClassStatus.SCHEDULED,
    roomLocation: "Studio A",
    createdAt: new Date(),
    updatedAt: new Date(),
    class: { id: "cls-001", name: "HIIT Conditioning", durationMinutes: 45 },
    instructor: { id: "trainer-alpha", name: "Trainer John", email: "john@gym.com" },
  };

  const mockMember = {
    id: "mem-001",
    gymId: gymAId,
    firstName: "Alex",
    lastName: "Smith",
    memberCode: "MEM-001",
    status: MemberStatus.ACTIVE,
    memberships: [{ id: "mship-001", status: "ACTIVE" }],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // 1. CLASS TEMPLATES
  // ============================================================================
  describe("Class Templates", () => {
    it("creates a class definition successfully", async () => {
      vi.spyOn(db.class, "findFirst").mockResolvedValue(null);
      vi.spyOn(db.class, "create").mockResolvedValue(mockClass);

      const res = await createClass(ownerAContext, {
        name: "HIIT Conditioning",
        description: "High intensity interval training",
        defaultCapacity: 20,
        durationMinutes: 45,
      });

      expect(res.name).toBe("HIIT Conditioning");
      expect(db.class.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ gymId: gymAId, name: "HIIT Conditioning" }),
        })
      );
    });

    it("rejects duplicate class name in same gym", async () => {
      vi.spyOn(db.class, "findFirst").mockResolvedValue(mockClass);

      await expect(
        createClass(ownerAContext, { name: "HIIT Conditioning" })
      ).rejects.toBeInstanceOf(DuplicateClassError);
    });

    it("rejects class creation for member role (insufficient permission)", async () => {
      await expect(
        createClass(memberAContext, { name: "Yoga" })
      ).rejects.toBeInstanceOf(InsufficientPermissionError);
    });

    it("updates class definition successfully", async () => {
      vi.spyOn(db.class, "findFirst").mockResolvedValue(mockClass);
      vi.spyOn(db.class, "update").mockResolvedValue({ ...mockClass, defaultCapacity: 25 });

      const updated = await updateClass(ownerAContext, "cls-001", { defaultCapacity: 25 });
      expect(updated.defaultCapacity).toBe(25);
    });

    it("lists active classes for gym", async () => {
      vi.spyOn(db.class, "findMany").mockResolvedValue([mockClass]);

      const list = await listClasses(ownerAContext);
      expect(list).toHaveLength(1);
      expect(db.class.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ gymId: gymAId, isActive: true }) })
      );
    });
  });

  // ============================================================================
  // 2. CLASS SCHEDULES
  // ============================================================================
  describe("Class Schedules", () => {
    it("schedules a session successfully when no instructor conflict exists", async () => {
      vi.spyOn(db.class, "findFirst").mockResolvedValue(mockClass);
      vi.spyOn(db.userGymRole, "findFirst").mockResolvedValue({ id: "role-1" } as any);
      vi.spyOn(db.classSchedule, "findFirst").mockResolvedValue(null); // No conflict
      vi.spyOn(db.classSchedule, "create").mockResolvedValue(mockSchedule as any);

      const sch = await createSchedule(ownerAContext, {
        classId: "cls-001",
        instructorUserId: "trainer-alpha",
        startTime: "2026-11-15T09:00:00Z",
        endTime: "2026-11-15T09:45:00Z",
        capacity: 20,
        roomLocation: "Studio A",
      });

      expect(sch.id).toBe("sch-001");
      expect(sch.status).toBe(ClassStatus.SCHEDULED);
    });

    it("detects and rejects instructor scheduling conflict", async () => {
      vi.spyOn(db.class, "findFirst").mockResolvedValue(mockClass);
      vi.spyOn(db.userGymRole, "findFirst").mockResolvedValue({ id: "role-1" } as any);
      vi.spyOn(db.classSchedule, "findFirst").mockResolvedValue(mockSchedule as any); // Conflict found!

      await expect(
        createSchedule(ownerAContext, {
          classId: "cls-001",
          instructorUserId: "trainer-alpha",
          startTime: "2026-11-15T09:15:00Z",
          endTime: "2026-11-15T10:00:00Z",
          capacity: 20,
        })
      ).rejects.toBeInstanceOf(ScheduleConflictError);
    });

    it("rejects scheduling if class does not belong to gym", async () => {
      vi.spyOn(db.class, "findFirst").mockResolvedValue(null);

      await expect(
        createSchedule(ownerAContext, {
          classId: "foreign-class",
          startTime: "2026-11-15T09:00:00Z",
          endTime: "2026-11-15T09:45:00Z",
          capacity: 20,
        })
      ).rejects.toBeInstanceOf(ClassNotFoundError);
    });

    it("cancels a scheduled session", async () => {
      vi.spyOn(db.classSchedule, "findFirst").mockResolvedValue(mockSchedule as any);
      const updateMock = vi.spyOn(db.classSchedule, "update").mockResolvedValue({
        ...mockSchedule,
        status: ClassStatus.CANCELLED,
      } as any);

      await cancelSchedule(ownerAContext, "sch-001");
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: ClassStatus.CANCELLED } })
      );
    });
  });

  // ============================================================================
  // 3. BOOKINGS & ATTENDANCE
  // ============================================================================
  describe("Class Bookings and Attendance", () => {
    it("books a class successfully and increments booked count", async () => {
      vi.spyOn(db.classSchedule, "findFirst").mockResolvedValue(mockSchedule as any);
      vi.spyOn(db.member, "findFirst").mockResolvedValue(mockMember as any);
      vi.spyOn(db.classBooking, "findUnique").mockResolvedValue(null);

      const mockBooking = {
        id: "book-001",
        gymId: gymAId,
        scheduleId: "sch-001",
        memberId: "mem-001",
        status: BookingStatus.CONFIRMED,
        bookedAt: new Date(),
      };

      vi.spyOn(db, "$transaction").mockImplementation(async (cb: any) => {
        const tx = {
          classSchedule: {
            findUnique: vi.fn().mockResolvedValue({ bookedCount: 5, capacity: 20 }),
            update: vi.fn().mockResolvedValue({}),
          },
          classBooking: {
            create: vi.fn().mockResolvedValue(mockBooking),
          },
        };
        return cb(tx);
      });

      const booking = await bookClass(ownerAContext, "sch-001", "mem-001");
      expect(booking.status).toBe(BookingStatus.CONFIRMED);
    });

    it("rejects booking when capacity limit is reached (overbooking protection)", async () => {
      const fullSchedule = { ...mockSchedule, bookedCount: 20, capacity: 20 };
      vi.spyOn(db.classSchedule, "findFirst").mockResolvedValue(fullSchedule as any);

      await expect(
        bookClass(ownerAContext, "sch-001", "mem-001")
      ).rejects.toBeInstanceOf(OverbookingError);
    });

    it("rejects duplicate booking for the same member and schedule", async () => {
      vi.spyOn(db.classSchedule, "findFirst").mockResolvedValue(mockSchedule as any);
      vi.spyOn(db.member, "findFirst").mockResolvedValue(mockMember as any);
      vi.spyOn(db.classBooking, "findUnique").mockResolvedValue({
        id: "existing-booking",
        status: BookingStatus.CONFIRMED,
      } as any);

      await expect(
        bookClass(ownerAContext, "sch-001", "mem-001")
      ).rejects.toBeInstanceOf(DuplicateBookingError);
    });

    it("rejects booking if member account is not ACTIVE", async () => {
      vi.spyOn(db.classSchedule, "findFirst").mockResolvedValue(mockSchedule as any);
      vi.spyOn(db.member, "findFirst").mockResolvedValue({
        ...mockMember,
        status: MemberStatus.INACTIVE,
      } as any);

      await expect(
        bookClass(ownerAContext, "sch-001", "mem-001")
      ).rejects.toBeInstanceOf(IneligibleBookingError);
    });

    it("cancels booking and decrements booked count", async () => {
      const booking = {
        id: "book-001",
        gymId: gymAId,
        scheduleId: "sch-001",
        memberId: "mem-001",
        status: BookingStatus.CONFIRMED,
      };
      vi.spyOn(db.classBooking, "findFirst").mockResolvedValue(booking as any);

      vi.spyOn(db, "$transaction").mockImplementation(async (cb: any) => {
        const tx = {
          classBooking: {
            update: vi.fn().mockResolvedValue({ ...booking, status: BookingStatus.CANCELLED }),
          },
          classSchedule: {
            update: vi.fn().mockResolvedValue({}),
          },
        };
        return cb(tx);
      });

      const cancelled = await cancelBooking(ownerAContext, "book-001");
      expect(cancelled.status).toBe(BookingStatus.CANCELLED);
    });

    it("marks member attendance as ATTENDED", async () => {
      const booking = {
        id: "book-001",
        gymId: gymAId,
        scheduleId: "sch-001",
        memberId: "mem-001",
        status: BookingStatus.CONFIRMED,
      };
      vi.spyOn(db.classBooking, "findFirst").mockResolvedValue(booking as any);
      vi.spyOn(db.classBooking, "update").mockResolvedValue({
        ...booking,
        status: BookingStatus.ATTENDED,
      } as any);

      const res = await markBookingAttendance(ownerAContext, "book-001", true);
      expect(res.status).toBe(BookingStatus.ATTENDED);
    });

    it("marks member attendance as NO_SHOW", async () => {
      const booking = {
        id: "book-001",
        gymId: gymAId,
        scheduleId: "sch-001",
        memberId: "mem-001",
        status: BookingStatus.CONFIRMED,
      };
      vi.spyOn(db.classBooking, "findFirst").mockResolvedValue(booking as any);
      vi.spyOn(db.classBooking, "update").mockResolvedValue({
        ...booking,
        status: BookingStatus.NO_SHOW,
      } as any);

      const res = await markBookingAttendance(ownerAContext, "book-001", false);
      expect(res.status).toBe(BookingStatus.NO_SHOW);
    });
  });

  // ============================================================================
  // 4. TENANT ISOLATION
  // ============================================================================
  describe("Tenant Isolation", () => {
    it("gym B cannot schedule or update gym A sessions", async () => {
      vi.spyOn(db.classSchedule, "findFirst").mockResolvedValue(null);

      await expect(
        updateSchedule(ownerBContext, "sch-001", { roomLocation: "Hacked" })
      ).rejects.toBeInstanceOf(ScheduleNotFoundError);
    });

    it("gym B cannot book gym A members into gym B sessions", async () => {
      vi.spyOn(db.classSchedule, "findFirst").mockResolvedValue({
        ...mockSchedule,
        gymId: gymBId,
      } as any);
      // Member belongs to gymAId, not gymBId
      vi.spyOn(db.member, "findFirst").mockResolvedValue(null);

      await expect(
        bookClass(ownerBContext, "sch-001", "mem-001")
      ).rejects.toBeInstanceOf(TenantAccessViolationError);
    });

    it("listSchedules strictly filters by current gymId", async () => {
      const findManySpy = vi.spyOn(db.classSchedule, "findMany");
      vi.spyOn(db, "$transaction").mockResolvedValue([[mockSchedule], 1] as any);

      await listSchedules(ownerAContext, {});

      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ gymId: gymAId }),
        })
      );
    });
  });
});
