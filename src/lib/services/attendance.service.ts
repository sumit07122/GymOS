/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import {
  TenantContext,
  assertPermission,
} from "@/lib/tenant/context";
import {
  AttendanceRecord,
  AttendanceStatus,
  CheckInMethod,
  MembershipStatus,
} from "@prisma/client";
import {
  QrScanInput,
  ManualAttendanceInput,
  AttendanceFilterParams,
} from "@/lib/validations/attendance";
import {
  generateDynamicQrToken,
  verifyDynamicQrToken,
  ReplayScanError,
} from "@/lib/security/qr-token";

// ==============================================================================
// FIXIA GymOS — Attendance Domain Errors
// ==============================================================================

export class AttendanceValidationError extends Error {
  public readonly code: string;
  public readonly memberInfo?: {
    id: string;
    fullName: string;
    memberCode: string;
    photoUrl?: string | null;
  };

  constructor(message: string, code = "VALIDATION_FAILED", memberInfo?: any) {
    super(message);
    this.name = "AttendanceValidationError";
    this.code = code;
    this.memberInfo = memberInfo;
  }
}

export class DuplicateAttendanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateAttendanceError";
  }
}

// ==============================================================================
// 1. DYNAMIC QR TOKEN GENERATION (MEMBER PASS)
// ==============================================================================

/**
 * Generates a dynamic 60-second QR token pass for an enrolled member.
 */
export async function generateMemberQrPass(
  ctx: TenantContext,
  memberId: string
) {
  assertPermission(ctx, "ATTENDANCE_READ");

  const [gym, member] = await Promise.all([
    db.gym.findUnique({
      where: { id: ctx.gymId },
      select: { qrSigningSecret: true, name: true, slug: true },
    }),
    db.member.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        gymId: true,
        firstName: true,
        lastName: true,
        memberCode: true,
        photoUrl: true,
        status: true,
        memberships: {
          where: { status: MembershipStatus.ACTIVE },
          take: 1,
          select: {
            endDate: true,
            planNameSnapshot: true,
            plan: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  if (!gym) {
    throw new Error("Gym workspace not found.");
  }

  if (!member || member.gymId !== ctx.gymId) {
    throw new Error("Member not found in this gym workspace.");
  }

  const token = generateDynamicQrToken({
    gymId: ctx.gymId,
    memberId: member.id,
    qrSigningSecret: gym.qrSigningSecret,
  });

  const activeMembership = member.memberships[0];

  return {
    qrData: token,
    expiresInSeconds: 60,
    generatedAt: new Date().toISOString(),
    member: {
      id: member.id,
      fullName: `${member.firstName} ${member.lastName}`,
      memberCode: member.memberCode,
      photoUrl: member.photoUrl,
      status: member.status,
      activePlan: activeMembership
        ? activeMembership.planNameSnapshot || activeMembership.plan.name
        : null,
      validUntil: activeMembership ? activeMembership.endDate : null,
    },
  };
}

// ==============================================================================
// 2. SECURE QR ATTENDANCE SCANNING & VERIFICATION
// ==============================================================================

export interface ScanResult {
  success: boolean;
  status: AttendanceStatus;
  mode: "CHECK_IN" | "CHECK_OUT";
  message: string;
  attendanceRecord?: AttendanceRecord;
  member: {
    id: string;
    fullName: string;
    memberCode: string;
    photoUrl?: string | null;
    activePlan?: string | null;
    validUntil?: Date | string | null;
  };
}

/**
 * Validates and processes a dynamic QR code scan from front desk or kiosk.
 * Enforces HMAC-SHA256 signature, 60s timestamp validity, UUID nonce replay check,
 * active membership status, duplicate check-in protection, and atomic transaction.
 */
export async function processQrAttendanceScan(
  ctx: TenantContext,
  input: QrScanInput
): Promise<ScanResult> {
  assertPermission(ctx, "ATTENDANCE_SCAN");

  const gym = await db.gym.findUnique({
    where: { id: ctx.gymId },
    select: { qrSigningSecret: true, name: true },
  });

  if (!gym) {
    throw new Error("Gym workspace not found.");
  }

  // 1. Cryptographically verify signature, tenant ownership, and 60s TTL
  const verifiedToken = verifyDynamicQrToken(
    input.qrData,
    ctx.gymId,
    gym.qrSigningSecret
  );

  // 2. Nonce-based replay protection
  const existingNonce = await db.attendanceQrNonce.findUnique({
    where: { nonce: verifiedToken.nonce },
  });

  if (existingNonce) {
    throw new ReplayScanError();
  }

  // 3. Inspect member details & active membership contracts
  const member = await db.member.findUnique({
    where: { id: verifiedToken.memberId },
    include: {
      memberships: {
        where: {
          status: {
            in: [
              MembershipStatus.ACTIVE,
              MembershipStatus.PAUSED,
              MembershipStatus.EXPIRED,
              MembershipStatus.CANCELLED,
            ],
          },
        },
        orderBy: { startDate: "desc" },
        include: { plan: true },
      },
    },
  });

  if (!member || member.gymId !== ctx.gymId) {
    throw new AttendanceValidationError(
      "Member record not found in this gym workspace.",
      "MEMBER_NOT_FOUND"
    );
  }

  const memberSummary = {
    id: member.id,
    fullName: `${member.firstName} ${member.lastName}`,
    memberCode: member.memberCode,
    photoUrl: member.photoUrl,
    activePlan: member.memberships[0]?.planNameSnapshot || member.memberships[0]?.plan.name || null,
    validUntil: member.memberships[0]?.endDate || null,
  };

  const now = new Date();

  // Find currently valid active membership
  const validActiveMembership = member.memberships.find(
    (m) =>
      m.status === MembershipStatus.ACTIVE &&
      m.startDate <= now &&
      m.endDate >= now
  );

  // If no valid active contract found, record rejection in attendance ledger and audit
  if (!validActiveMembership) {
    const latestContract = member.memberships[0];
    let rejectionReason = "No active membership contract.";

    if (latestContract) {
      if (latestContract.status === MembershipStatus.PAUSED) {
        rejectionReason = `Membership is currently paused/frozen (Reason: ${latestContract.pauseReason || "Administrative hold"}).`;
      } else if (latestContract.status === MembershipStatus.CANCELLED) {
        rejectionReason = "Membership has been cancelled.";
      } else if (latestContract.endDate < now) {
        rejectionReason = `Membership expired on ${latestContract.endDate.toLocaleDateString()}. Renewal required.`;
      }
    }

    // Persist rejected scan record for gym security audit
    await db.attendanceRecord.create({
      data: {
        gymId: ctx.gymId,
        memberId: member.id,
        checkInTime: now,
        status: AttendanceStatus.REJECTED,
        checkInMethod: CheckInMethod.QR_SCAN,
        rejectionReason,
        deviceInfo: input.deviceInfo || "QR Scanner",
      },
    });

    throw new AttendanceValidationError(rejectionReason, "MEMBERSHIP_INVALID", memberSummary);
  }

  // Check limited session pack limits if applicable
  if (
    validActiveMembership.sessionsRemaining !== null &&
    validActiveMembership.sessionsRemaining <= 0
  ) {
    const sessionReason = "Session limit reached (0 sessions remaining on pack).";
    await db.attendanceRecord.create({
      data: {
        gymId: ctx.gymId,
        memberId: member.id,
        checkInTime: now,
        status: AttendanceStatus.REJECTED,
        checkInMethod: CheckInMethod.QR_SCAN,
        rejectionReason: sessionReason,
        deviceInfo: input.deviceInfo || "QR Scanner",
      },
    });

    throw new AttendanceValidationError(sessionReason, "SESSION_LIMIT_EXCEEDED", memberSummary);
  }

  // 4. Duplicate scan prevention (15-minute cooldown on check-in)
  if (input.mode === "CHECK_IN") {
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    const recentCheckIn = await db.attendanceRecord.findFirst({
      where: {
        gymId: ctx.gymId,
        memberId: member.id,
        status: AttendanceStatus.VERIFIED,
        checkInTime: { gte: fifteenMinutesAgo },
      },
      orderBy: { checkInTime: "desc" },
    });

    if (recentCheckIn) {
      const timeStr = recentCheckIn.checkInTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      throw new DuplicateAttendanceError(
        `Duplicate scan prevented: ${member.firstName} was already checked in at ${timeStr}. Cooldown is active.`
      );
    }
  }

  // 5. Execute atomic attendance transaction
  return await db.$transaction(async (tx) => {
    // Consume nonce forever
    await tx.attendanceQrNonce.create({
      data: {
        gymId: ctx.gymId,
        memberId: member.id,
        nonce: verifiedToken.nonce,
        expiresAt: new Date(Date.now() + 180 * 1000), // Nonce persistence window
      },
    });

    if (input.mode === "CHECK_OUT") {
      // Find open check-in today
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const openRecord = await tx.attendanceRecord.findFirst({
        where: {
          gymId: ctx.gymId,
          memberId: member.id,
          status: AttendanceStatus.VERIFIED,
          checkOutTime: null,
          checkInTime: { gte: startOfToday },
        },
        orderBy: { checkInTime: "desc" },
      });

      if (openRecord) {
        const updated = await tx.attendanceRecord.update({
          where: { id: openRecord.id },
          data: { checkOutTime: now },
        });

        return {
          success: true,
          status: AttendanceStatus.VERIFIED,
          mode: "CHECK_OUT",
          message: `Check-out recorded for ${member.firstName} ${member.lastName}.`,
          attendanceRecord: updated,
          member: memberSummary,
        };
      }
    }

    // Standard CHECK_IN
    const record = await tx.attendanceRecord.create({
      data: {
        gymId: ctx.gymId,
        memberId: member.id,
        checkInTime: now,
        status: AttendanceStatus.VERIFIED,
        checkInMethod: CheckInMethod.QR_SCAN,
        deviceInfo: input.deviceInfo || "Front Desk Scanner",
      },
    });

    // Deduct session from pack if limited sessions
    if (
      validActiveMembership.sessionsRemaining !== null &&
      validActiveMembership.sessionsRemaining > 0
    ) {
      await tx.membership.update({
        where: { id: validActiveMembership.id },
        data: {
          sessionsRemaining: {
            decrement: 1,
          },
        },
      });
    }

    return {
      success: true,
      status: AttendanceStatus.VERIFIED,
      mode: "CHECK_IN",
      message: `Verified check-in: ${member.firstName} ${member.lastName} (${member.memberCode}).`,
      attendanceRecord: record,
      member: memberSummary,
    };
  });
}

// ==============================================================================
// 3. MANUAL FRONT-DESK ATTENDANCE & AUDIT OVERRIDE
// ==============================================================================

/**
 * Records manual attendance entry with mandatory staff reason and audit trail.
 */
export async function recordManualAttendance(
  ctx: TenantContext,
  input: ManualAttendanceInput
): Promise<ScanResult> {
  assertPermission(ctx, "ATTENDANCE_OVERRIDE");

  const member = await db.member.findUnique({
    where: { id: input.memberId },
    include: {
      memberships: {
        where: { status: MembershipStatus.ACTIVE },
        take: 1,
        include: { plan: true },
      },
    },
  });

  if (!member || member.gymId !== ctx.gymId) {
    throw new Error("Target member not found in this gym workspace.");
  }

  const checkInTime = input.customTime ? new Date(input.customTime) : new Date();

  return await db.$transaction(async (tx) => {
    let record: AttendanceRecord;

    if (input.mode === "CHECK_OUT") {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const openRecord = await tx.attendanceRecord.findFirst({
        where: {
          gymId: ctx.gymId,
          memberId: member.id,
          checkOutTime: null,
          checkInTime: { gte: startOfToday },
        },
        orderBy: { checkInTime: "desc" },
      });

      if (openRecord) {
        record = await tx.attendanceRecord.update({
          where: { id: openRecord.id },
          data: { checkOutTime: checkInTime },
        });
      } else {
        record = await tx.attendanceRecord.create({
          data: {
            gymId: ctx.gymId,
            memberId: member.id,
            checkInTime,
            checkOutTime: checkInTime,
            status: AttendanceStatus.MANUAL_OVERRIDE,
            checkInMethod: CheckInMethod.MANUAL_DESK,
            deviceInfo: `Manual Check-Out Override by Staff #${ctx.userId.slice(0, 8)}`,
          },
        });
      }
    } else {
      record = await tx.attendanceRecord.create({
        data: {
          gymId: ctx.gymId,
          memberId: member.id,
          checkInTime,
          status: AttendanceStatus.MANUAL_OVERRIDE,
          checkInMethod: CheckInMethod.MANUAL_DESK,
          deviceInfo: `Manual Override by Staff #${ctx.userId.slice(0, 8)}`,
        },
      });
    }

    // Persist immutable audit log
    await tx.attendanceAuditLog.create({
      data: {
        gymId: ctx.gymId,
        memberId: member.id,
        staffUserId: ctx.userId,
        action: `MANUAL_${input.mode}_OVERRIDE`,
        reason: input.reason,
        ipAddress: "Front Desk Console",
      },
    });

    const activeMem = member.memberships[0];

    return {
      success: true,
      status: AttendanceStatus.MANUAL_OVERRIDE,
      mode: input.mode,
      message: `Manual ${input.mode.toLowerCase()} logged for ${member.firstName} ${member.lastName}. Reason: ${input.reason}`,
      attendanceRecord: record,
      member: {
        id: member.id,
        fullName: `${member.firstName} ${member.lastName}`,
        memberCode: member.memberCode,
        photoUrl: member.photoUrl,
        activePlan: activeMem?.planNameSnapshot || activeMem?.plan.name || null,
        validUntil: activeMem?.endDate || null,
      },
    };
  });
}

// ==============================================================================
// 4. REPORTING & ANALYTICS QUERIES
// ==============================================================================

/**
 * Returns headline attendance metrics for today.
 */
export async function getTodayAttendanceMetrics(ctx: TenantContext) {
  assertPermission(ctx, "ATTENDANCE_READ");

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [totalCheckIns, currentlyInGym, manualOverrides, rejectedScans] =
    await Promise.all([
      db.attendanceRecord.count({
        where: {
          gymId: ctx.gymId,
          checkInTime: { gte: startOfToday },
          status: { in: [AttendanceStatus.VERIFIED, AttendanceStatus.MANUAL_OVERRIDE] },
        },
      }),
      db.attendanceRecord.count({
        where: {
          gymId: ctx.gymId,
          checkInTime: { gte: startOfToday },
          checkOutTime: null,
          status: { in: [AttendanceStatus.VERIFIED, AttendanceStatus.MANUAL_OVERRIDE] },
        },
      }),
      db.attendanceRecord.count({
        where: {
          gymId: ctx.gymId,
          checkInTime: { gte: startOfToday },
          status: AttendanceStatus.MANUAL_OVERRIDE,
        },
      }),
      db.attendanceRecord.count({
        where: {
          gymId: ctx.gymId,
          checkInTime: { gte: startOfToday },
          status: AttendanceStatus.REJECTED,
        },
      }),
    ]);

  return {
    totalCheckIns,
    currentlyInGym,
    manualOverrides,
    rejectedScans,
  };
}

/**
 * Returns filtered, paginated attendance history log.
 */
export async function getAttendanceHistory(
  ctx: TenantContext,
  params: Partial<AttendanceFilterParams> = {}
) {
  assertPermission(ctx, "ATTENDANCE_READ");

  const { date, status, method, search, page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  const where: any = {
    gymId: ctx.gymId,
  };

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.checkInTime = {
      gte: start,
      lte: end,
    };
  }

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (method && method !== "ALL") {
    where.checkInMethod = method;
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.member = {
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { memberCode: { contains: q, mode: "insensitive" } },
      ],
    };
  }

  const [records, total] = await Promise.all([
    db.attendanceRecord.findMany({
      where,
      orderBy: { checkInTime: "desc" },
      take: limit,
      skip: offset,
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            memberCode: true,
            photoUrl: true,
            phone: true,
          },
        },
      },
    }),
    db.attendanceRecord.count({ where }),
  ]);

  return {
    records,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    limit,
  };
}

/**
 * Retrieves the latest scans for the live scanner activity feed.
 */
export async function getRecentScans(ctx: TenantContext, limit = 10) {
  assertPermission(ctx, "ATTENDANCE_READ");

  return await db.attendanceRecord.findMany({
    where: { gymId: ctx.gymId },
    orderBy: { checkInTime: "desc" },
    take: limit,
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          memberCode: true,
          photoUrl: true,
        },
      },
    },
  });
}
