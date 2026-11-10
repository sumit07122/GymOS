/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import {
  TenantContext,
  assertPermission,
  assertTenantOwnership,
  TenantAccessViolationError,
} from "@/lib/tenant/context";
import {
  Class,
  ClassSchedule,
  ClassBooking,
  ClassStatus,
  BookingStatus,
  MemberStatus,
} from "@prisma/client";
import {
  ClassCreateInput,
  ClassUpdateInput,
  ClassScheduleCreateInput,
  ClassScheduleUpdateInput,
  ScheduleFilterParams,
} from "@/lib/validations/class";

// ==============================================================================
// FIXIA GymOS — Class & Scheduling Domain Errors
// ==============================================================================

export class ClassNotFoundError extends Error {
  constructor(id: string) {
    super(`Class definition "${id}" not found or does not belong to this gym.`);
    this.name = "ClassNotFoundError";
  }
}

export class ScheduleNotFoundError extends Error {
  constructor(id: string) {
    super(`Class schedule "${id}" not found or does not belong to this gym.`);
    this.name = "ScheduleNotFoundError";
  }
}

export class BookingNotFoundError extends Error {
  constructor(id: string) {
    super(`Class booking "${id}" not found or does not belong to this gym.`);
    this.name = "BookingNotFoundError";
  }
}

export class DuplicateClassError extends Error {
  constructor(name: string) {
    super(`A class named "${name}" already exists for this gym.`);
    this.name = "DuplicateClassError";
  }
}

export class OverbookingError extends Error {
  constructor(message = "This class session is fully booked. Maximum capacity reached.") {
    super(message);
    this.name = "OverbookingError";
  }
}

export class DuplicateBookingError extends Error {
  constructor(message = "Member is already booked for this class schedule.") {
    super(message);
    this.name = "DuplicateBookingError";
  }
}

export class ScheduleConflictError extends Error {
  constructor(message = "The selected instructor is already scheduled for another session during this time window.") {
    super(message);
    this.name = "ScheduleConflictError";
  }
}

export class IneligibleBookingError extends Error {
  constructor(message = "Member is not eligible for class bookings. Must have an active membership.") {
    super(message);
    this.name = "IneligibleBookingError";
  }
}

// ==============================================================================
// Types
// ==============================================================================

export type ScheduleWithDetails = ClassSchedule & {
  class: { id: string; name: string; durationMinutes: number };
  instructor: { id: string; name: string | null; email: string | null } | null;
  bookings?: Array<
    ClassBooking & {
      member: {
        id: string;
        firstName: string;
        lastName: string;
        memberCode: string;
        phone: string | null;
      };
    }
  >;
  _count?: { bookings: number };
};

// ==============================================================================
// 1. CLASS DEFINITIONS (TEMPLATES)
// ==============================================================================

export async function createClass(
  ctx: TenantContext,
  input: ClassCreateInput
): Promise<Class> {
  assertPermission(ctx, "CLASS_SCHEDULE");

  const existing = await db.class.findFirst({
    where: { gymId: ctx.gymId, name: input.name.trim() },
  });
  if (existing) {
    throw new DuplicateClassError(input.name.trim());
  }

  return db.class.create({
    data: {
      gymId: ctx.gymId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      defaultCapacity: Number(input.defaultCapacity ?? 20),
      durationMinutes: Number(input.durationMinutes ?? 60),
      isActive: true,
    },
  });
}

export async function updateClass(
  ctx: TenantContext,
  classId: string,
  input: ClassUpdateInput
): Promise<Class> {
  assertPermission(ctx, "CLASS_SCHEDULE");

  const existing = await db.class.findFirst({
    where: { id: classId, gymId: ctx.gymId },
  });
  if (!existing) throw new ClassNotFoundError(classId);
  assertTenantOwnership(ctx, existing.gymId);

  if (input.name && input.name.trim() !== existing.name) {
    const dup = await db.class.findFirst({
      where: { gymId: ctx.gymId, name: input.name.trim(), id: { not: classId } },
    });
    if (dup) throw new DuplicateClassError(input.name.trim());
  }

  return db.class.update({
    where: { id: classId },
    data: {
      name: input.name !== undefined ? input.name.trim() : undefined,
      description: input.description !== undefined ? (input.description.trim() || null) : undefined,
      defaultCapacity: input.defaultCapacity !== undefined ? Number(input.defaultCapacity) : undefined,
      durationMinutes: input.durationMinutes !== undefined ? Number(input.durationMinutes) : undefined,
      isActive: input.isActive,
    },
  });
}

export async function listClasses(
  ctx: TenantContext,
  includeInactive = false
): Promise<Class[]> {
  assertPermission(ctx, "CLASS_SCHEDULE");

  return db.class.findMany({
    where: {
      gymId: ctx.gymId,
      ...(includeInactive ? {} : { isActive: true }),
    },
    orderBy: { name: "asc" },
  });
}

// ==============================================================================
// 2. CLASS SCHEDULES (SESSIONS)
// ==============================================================================

export async function createSchedule(
  ctx: TenantContext,
  input: ClassScheduleCreateInput
): Promise<ScheduleWithDetails> {
  assertPermission(ctx, "CLASS_SCHEDULE");

  const classDef = await db.class.findFirst({
    where: { id: input.classId, gymId: ctx.gymId, isActive: true },
  });
  if (!classDef) throw new ClassNotFoundError(input.classId);

  const start = new Date(input.startTime);
  const end = new Date(input.endTime);

  // Validate instructor belongs to this gym if assigned
  if (input.instructorUserId && input.instructorUserId.trim()) {
    const instructorRole = await db.userGymRole.findFirst({
      where: { userId: input.instructorUserId.trim(), gymId: ctx.gymId },
    });
    if (!instructorRole) {
      throw new TenantAccessViolationError(input.instructorUserId.trim(), ctx.gymId);
    }

    // Check for scheduling conflicts for the instructor
    const conflict = await db.classSchedule.findFirst({
      where: {
        gymId: ctx.gymId,
        instructorUserId: input.instructorUserId.trim(),
        status: { in: [ClassStatus.SCHEDULED, ClassStatus.IN_PROGRESS] },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    if (conflict) {
      throw new ScheduleConflictError();
    }
  }

  const schedule = await db.classSchedule.create({
    data: {
      gymId: ctx.gymId,
      classId: input.classId,
      instructorUserId: input.instructorUserId?.trim() || null,
      startTime: start,
      endTime: end,
      capacity: Number(input.capacity ?? classDef.defaultCapacity),
      bookedCount: 0,
      roomLocation: input.roomLocation?.trim() || null,
      status: ClassStatus.SCHEDULED,
    },
    include: {
      class: { select: { id: true, name: true, durationMinutes: true } },
      instructor: { select: { id: true, name: true, email: true } },
    },
  });

  return schedule as ScheduleWithDetails;
}

export async function updateSchedule(
  ctx: TenantContext,
  scheduleId: string,
  input: ClassScheduleUpdateInput
): Promise<ScheduleWithDetails> {
  assertPermission(ctx, "CLASS_SCHEDULE");

  const existing = await db.classSchedule.findFirst({
    where: { id: scheduleId, gymId: ctx.gymId },
  });
  if (!existing) throw new ScheduleNotFoundError(scheduleId);
  assertTenantOwnership(ctx, existing.gymId);

  const start = input.startTime ? new Date(input.startTime) : existing.startTime;
  const end = input.endTime ? new Date(input.endTime) : existing.endTime;

  const instructorId =
    input.instructorUserId !== undefined
      ? (input.instructorUserId.trim() || null)
      : existing.instructorUserId;

  // Check instructor conflict excluding this session
  if (instructorId) {
    const conflict = await db.classSchedule.findFirst({
      where: {
        gymId: ctx.gymId,
        instructorUserId: instructorId,
        id: { not: scheduleId },
        status: { in: [ClassStatus.SCHEDULED, ClassStatus.IN_PROGRESS] },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    if (conflict) throw new ScheduleConflictError();
  }

  const updated = await db.classSchedule.update({
    where: { id: scheduleId },
    data: {
      instructorUserId: instructorId,
      startTime: start,
      endTime: end,
      capacity: input.capacity !== undefined ? Number(input.capacity) : undefined,
      roomLocation: input.roomLocation !== undefined ? (input.roomLocation.trim() || null) : undefined,
      status: input.status,
    },
    include: {
      class: { select: { id: true, name: true, durationMinutes: true } },
      instructor: { select: { id: true, name: true, email: true } },
    },
  });

  return updated as ScheduleWithDetails;
}

export async function cancelSchedule(
  ctx: TenantContext,
  scheduleId: string
): Promise<void> {
  assertPermission(ctx, "CLASS_SCHEDULE");

  const existing = await db.classSchedule.findFirst({
    where: { id: scheduleId, gymId: ctx.gymId },
  });
  if (!existing) throw new ScheduleNotFoundError(scheduleId);
  assertTenantOwnership(ctx, existing.gymId);

  await db.classSchedule.update({
    where: { id: scheduleId },
    data: { status: ClassStatus.CANCELLED },
  });
}

export async function getScheduleById(
  ctx: TenantContext,
  scheduleId: string
): Promise<ScheduleWithDetails> {
  assertPermission(ctx, "CLASS_SCHEDULE");

  const schedule = await db.classSchedule.findFirst({
    where: { id: scheduleId, gymId: ctx.gymId },
    include: {
      class: { select: { id: true, name: true, durationMinutes: true } },
      instructor: { select: { id: true, name: true, email: true } },
      bookings: {
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              memberCode: true,
              phone: true,
            },
          },
        },
        orderBy: { bookedAt: "asc" },
      },
    },
  });

  if (!schedule) throw new ScheduleNotFoundError(scheduleId);
  assertTenantOwnership(ctx, schedule.gymId);

  return schedule as ScheduleWithDetails;
}

export async function listSchedules(
  ctx: TenantContext,
  params: Partial<ScheduleFilterParams> = {}
): Promise<{ schedules: ScheduleWithDetails[]; total: number }> {
  assertPermission(ctx, "CLASS_SCHEDULE");

  const pageNum = Number(params.page || 1);
  const limitNum = Number(params.limit || 50);
  const skip = (pageNum - 1) * limitNum;

  const where: Record<string, any> = { gymId: ctx.gymId };

  if (params.classId) where.classId = params.classId;
  if (params.instructorUserId) where.instructorUserId = params.instructorUserId;
  if (params.status && params.status !== "ALL") where.status = params.status;

  if (params.dateFrom || params.dateTo) {
    where.startTime = {};
    if (params.dateFrom) where.startTime.gte = new Date(params.dateFrom);
    if (params.dateTo) where.startTime.lte = new Date(params.dateTo);
  }

  const [schedules, total] = await db.$transaction([
    db.classSchedule.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, durationMinutes: true } },
        instructor: { select: { id: true, name: true, email: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { startTime: "asc" },
      skip,
      take: limitNum,
    }),
    db.classSchedule.count({ where }),
  ]);

  return { schedules: schedules as ScheduleWithDetails[], total };
}

// ==============================================================================
// 3. MEMBER BOOKINGS & ATTENDANCE
// ==============================================================================

export async function bookClass(
  ctx: TenantContext,
  scheduleId: string,
  memberId: string
): Promise<ClassBooking> {
  assertPermission(ctx, "CLASS_BOOK");

  // Validate schedule
  const schedule = await db.classSchedule.findFirst({
    where: { id: scheduleId, gymId: ctx.gymId },
  });
  if (!schedule) throw new ScheduleNotFoundError(scheduleId);
  if (schedule.status !== ClassStatus.SCHEDULED) {
    throw new Error(`Cannot book session with status "${schedule.status}".`);
  }

  // Capacity check
  if (schedule.bookedCount >= schedule.capacity) {
    throw new OverbookingError();
  }

  // Validate member belongs to this gym
  const member = await db.member.findFirst({
    where: { id: memberId, gymId: ctx.gymId },
    include: {
      memberships: {
        where: { status: "ACTIVE" },
        take: 1,
      },
    },
  });
  if (!member) {
    throw new TenantAccessViolationError(memberId, ctx.gymId);
  }
  if (member.status !== MemberStatus.ACTIVE) {
    throw new IneligibleBookingError("Member account is not currently active.");
  }

  // Check duplicate booking
  const existingBooking = await db.classBooking.findUnique({
    where: {
      scheduleId_memberId: {
        scheduleId,
        memberId,
      },
    },
  });
  if (existingBooking && existingBooking.status === BookingStatus.CONFIRMED) {
    throw new DuplicateBookingError();
  }

  // Atomic booking + counter increment
  return db.$transaction(async (tx: any) => {
    // Re-verify capacity under lock
    const current = await tx.classSchedule.findUnique({
      where: { id: scheduleId },
      select: { bookedCount: true, capacity: true },
    });
    if (!current || current.bookedCount >= current.capacity) {
      throw new OverbookingError();
    }

    let booking: ClassBooking;
    if (existingBooking) {
      // Re-activate previously cancelled booking
      booking = await tx.classBooking.update({
        where: { id: existingBooking.id },
        data: { status: BookingStatus.CONFIRMED, bookedAt: new Date() },
      });
    } else {
      booking = await tx.classBooking.create({
        data: {
          gymId: ctx.gymId,
          scheduleId,
          memberId,
          status: BookingStatus.CONFIRMED,
        },
      });
    }

    await tx.classSchedule.update({
      where: { id: scheduleId },
      data: { bookedCount: { increment: 1 } },
    });

    return booking;
  });
}

export async function cancelBooking(
  ctx: TenantContext,
  bookingId: string
): Promise<ClassBooking> {
  assertPermission(ctx, "CLASS_BOOK");

  const booking = await db.classBooking.findFirst({
    where: { id: bookingId, gymId: ctx.gymId },
  });
  if (!booking) throw new BookingNotFoundError(bookingId);
  assertTenantOwnership(ctx, booking.gymId);

  if (booking.status === BookingStatus.CANCELLED) {
    return booking;
  }

  return db.$transaction(async (tx: any) => {
    const updated = await tx.classBooking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });

    await tx.classSchedule.update({
      where: { id: booking.scheduleId },
      data: { bookedCount: { decrement: 1 } },
    });

    return updated;
  });
}

export async function markBookingAttendance(
  ctx: TenantContext,
  bookingId: string,
  attended: boolean
): Promise<ClassBooking> {
  assertPermission(ctx, "CLASS_SCHEDULE");

  const booking = await db.classBooking.findFirst({
    where: { id: bookingId, gymId: ctx.gymId },
  });
  if (!booking) throw new BookingNotFoundError(bookingId);
  assertTenantOwnership(ctx, booking.gymId);

  return db.classBooking.update({
    where: { id: bookingId },
    data: {
      status: attended ? BookingStatus.ATTENDED : BookingStatus.NO_SHOW,
    },
  });
}

export async function getMemberBookings(
  ctx: TenantContext,
  memberId: string
): Promise<any[]> {
  assertPermission(ctx, "MEMBER_READ");

  const member = await db.member.findFirst({
    where: { id: memberId, gymId: ctx.gymId },
  });
  if (!member) throw new TenantAccessViolationError(memberId, ctx.gymId);

  return db.classBooking.findMany({
    where: { memberId, gymId: ctx.gymId },
    include: {
      schedule: {
        include: {
          class: { select: { name: true, durationMinutes: true } },
          instructor: { select: { name: true } },
        },
      },
    },
    orderBy: { bookedAt: "desc" },
  });
}
