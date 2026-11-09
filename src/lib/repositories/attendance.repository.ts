import { db } from "@/lib/db";
import {
  TenantContext,
  assertTenantOwnership,
  assertPermission,
} from "@/lib/tenant/context";
import {
  AttendanceRecord,
  AttendanceStatus,
  CheckInMethod,
} from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — Tenant-Scoped Attendance Repository
// ==============================================================================
// Enforces that attendance check-ins, overrides, and logs cannot cross gym borders.
// Records persistent audit trails in AttendanceAuditLog for overrides.
// ==============================================================================

export interface RecordCheckInData {
  memberId: string;
  checkInMethod?: CheckInMethod;
  status?: AttendanceStatus;
  rejectionReason?: string;
  deviceInfo?: string;
}

export interface RecordManualOverrideData {
  memberId: string;
  reason: string;
  ipAddress?: string;
}

export const attendanceRepository = {
  /**
   * Logs a verified check-in.
   * Strictly enforces that the target member belongs to the authorized gym.
   */
  async recordCheckIn(
    ctx: TenantContext,
    data: RecordCheckInData
  ): Promise<AttendanceRecord> {
    assertPermission(ctx, "ATTENDANCE_SCAN");

    const member = await db.member.findUnique({
      where: { id: data.memberId },
    });

    if (!member) {
      throw new Error(`Member with ID "${data.memberId}" does not exist.`);
    }

    assertTenantOwnership(ctx, member.gymId);

    return db.attendanceRecord.create({
      data: {
        gymId: ctx.gymId,
        memberId: data.memberId,
        checkInTime: new Date(),
        checkInMethod: data.checkInMethod || CheckInMethod.QR_SCAN,
        status: data.status || AttendanceStatus.VERIFIED,
        rejectionReason: data.rejectionReason,
        deviceInfo: data.deviceInfo,
      },
    });
  },

  /**
   * Records a manual front-desk attendance override and writes an immutable audit log.
   */
  async recordManualOverride(
    ctx: TenantContext,
    data: RecordManualOverrideData
  ): Promise<AttendanceRecord> {
    assertPermission(ctx, "ATTENDANCE_OVERRIDE");

    const member = await db.member.findUnique({
      where: { id: data.memberId },
    });

    if (!member) {
      throw new Error(`Member with ID "${data.memberId}" does not exist.`);
    }

    assertTenantOwnership(ctx, member.gymId);

    return db.$transaction(async (tx) => {
      // 1. Create the attendance record with MANUAL_OVERRIDE status
      const record = await tx.attendanceRecord.create({
        data: {
          gymId: ctx.gymId,
          memberId: data.memberId,
          checkInTime: new Date(),
          checkInMethod: CheckInMethod.MANUAL_DESK,
          status: AttendanceStatus.MANUAL_OVERRIDE,
        },
      });

      // 2. Create the immutable audit log record
      await tx.attendanceAuditLog.create({
        data: {
          gymId: ctx.gymId,
          memberId: data.memberId,
          staffUserId: ctx.userId,
          action: "MANUAL_CHECKIN_OVERRIDE",
          reason: data.reason,
          ipAddress: data.ipAddress,
        },
      });

      return record;
    });
  },

  /**
   * Lists attendance logs strictly within the authorized tenant.
   * If role is MEMBER, scopes to their own records.
   */
  async findLogs(
    ctx: TenantContext,
    options: {
      memberId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<AttendanceRecord[]> {
    assertPermission(ctx, "ATTENDANCE_READ");

    const { memberId, startDate, endDate, limit = 50, offset = 0 } = options;

    let effectiveMemberId = memberId;
    if (ctx.role === "MEMBER") {
      const linked = await db.member.findFirst({
        where: { gymId: ctx.gymId, userId: ctx.userId },
      });
      effectiveMemberId = linked ? linked.id : "NO_MEMBER_RECORD";
    }

    return db.attendanceRecord.findMany({
      where: {
        gymId: ctx.gymId,
        ...(effectiveMemberId ? { memberId: effectiveMemberId } : {}),
        ...(startDate || endDate
          ? {
              checkInTime: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      },
      orderBy: { checkInTime: "desc" },
      take: limit,
      skip: offset,
    });
  },
};

