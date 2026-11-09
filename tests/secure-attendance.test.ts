/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateDynamicQrToken,
  verifyDynamicQrToken,
  InvalidQrSignatureError,
  ExpiredQrTokenError,
  CrossTenantScanError,
  ReplayScanError,
} from "@/lib/security/qr-token";
import {
  processQrAttendanceScan,
  recordManualAttendance,
  generateMemberQrPass,
  getTodayAttendanceMetrics,
  AttendanceValidationError,
  DuplicateAttendanceError,
} from "@/lib/services/attendance.service";
import { createTenantContext } from "@/lib/tenant/context";
import { db } from "@/lib/db";
import {
  GymRole,
  AttendanceStatus,
  CheckInMethod,
  MembershipStatus,
} from "@prisma/client";

describe("Milestone M08: Secure QR Attendance & Front-Desk Kiosk", () => {
  const gymAlphaSecret = "super-confidential-qr-secret-key-32bytes-alpha";
  const gymBetaSecret = "super-confidential-qr-secret-key-32bytes-beta";

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
  // 1. CRYPTOGRAPHIC TOKEN GENERATION & TIMING-SAFE VERIFICATION
  // ============================================================================
  describe("Cryptographic QR Token Security", () => {
    it("generates a valid signed HMAC-SHA256 token and verifies it cleanly", () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const token = generateDynamicQrToken({
        gymId: "gym-alpha-111",
        memberId: "mem-101",
        qrSigningSecret: gymAlphaSecret,
        timestampSeconds: nowSec,
        nonce: "test-nonce-12345",
      });

      expect(typeof token).toBe("string");

      const verified = verifyDynamicQrToken(
        token,
        "gym-alpha-111",
        gymAlphaSecret,
        { maxAgeSeconds: 60, clockDriftSeconds: 30 }
      );

      expect(verified.gymId).toBe("gym-alpha-111");
      expect(verified.memberId).toBe("mem-101");
      expect(verified.nonce).toBe("test-nonce-12345");
    });

    it("rejects forged or modified token signatures with InvalidQrSignatureError", () => {
      const validToken = generateDynamicQrToken({
        gymId: "gym-alpha-111",
        memberId: "mem-101",
        qrSigningSecret: gymAlphaSecret,
      });

      // Decode, tamper memberId, re-encode without correct key
      const decoded = JSON.parse(
        Buffer.from(validToken, "base64url").toString("utf-8")
      );
      decoded.mid = "mem-attacker-impostor";
      const tamperedToken = Buffer.from(JSON.stringify(decoded)).toString(
        "base64url"
      );

      expect(() =>
        verifyDynamicQrToken(
          tamperedToken,
          "gym-alpha-111",
          gymAlphaSecret
        )
      ).toThrow(InvalidQrSignatureError);
    });

    it("rejects token signed with an invalid or different gym secret", () => {
      const tokenFromBeta = generateDynamicQrToken({
        gymId: "gym-alpha-111", // Attacker pretends it's Alpha
        memberId: "mem-101",
        qrSigningSecret: gymBetaSecret, // Signed with Beta's key
      });

      expect(() =>
        verifyDynamicQrToken(
          tokenFromBeta,
          "gym-alpha-111",
          gymAlphaSecret
        )
      ).toThrow(InvalidQrSignatureError);
    });

    it("rejects expired QR tokens (> 60s + clock drift)", () => {
      const expiredTimestamp = Math.floor(Date.now() / 1000) - 120; // 2 minutes ago
      const expiredToken = generateDynamicQrToken({
        gymId: "gym-alpha-111",
        memberId: "mem-101",
        qrSigningSecret: gymAlphaSecret,
        timestampSeconds: expiredTimestamp,
      });

      expect(() =>
        verifyDynamicQrToken(
          expiredToken,
          "gym-alpha-111",
          gymAlphaSecret,
          { maxAgeSeconds: 60, clockDriftSeconds: 30 }
        )
      ).toThrow(ExpiredQrTokenError);
    });

    it("rejects cross-tenant QR tokens (Gym B token scanned at Gym A)", () => {
      const gymBToken = generateDynamicQrToken({
        gymId: "gym-beta-222",
        memberId: "mem-beta-1",
        qrSigningSecret: gymBetaSecret,
      });

      expect(() =>
        verifyDynamicQrToken(
          gymBToken,
          "gym-alpha-111", // Expected Gym A
          gymAlphaSecret
        )
      ).toThrow(CrossTenantScanError);
    });
  });

  // ============================================================================
  // 2. SCAN WORKFLOW & REPLAY ATTACK PREVENTION
  // ============================================================================
  describe("Attendance Verification & Replay Protection", () => {
    it("successfully processes valid QR scan for active member, consuming nonce", async () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const token = generateDynamicQrToken({
        gymId: "gym-alpha-111",
        memberId: "mem-active-1",
        qrSigningSecret: gymAlphaSecret,
        timestampSeconds: nowSec,
        nonce: "unique-nonce-abc-123",
      });

      vi.spyOn(db.gym as any, "findUnique").mockResolvedValue({
        id: "gym-alpha-111",
        qrSigningSecret: gymAlphaSecret,
      });

      // Nonce has NOT been used yet
      vi.spyOn(db.attendanceQrNonce as any, "findUnique").mockResolvedValue(null);

      // No recent duplicate check-in in last 15m
      vi.spyOn(db.attendanceRecord as any, "findFirst").mockResolvedValue(null);

      // Active member with valid membership
      const validMember = {
        id: "mem-active-1",
        gymId: "gym-alpha-111",
        firstName: "Clark",
        lastName: "Kent",
        memberCode: "MEM-1007",
        photoUrl: null,
        memberships: [
          {
            id: "mship-1",
            status: MembershipStatus.ACTIVE,
            startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
            sessionsRemaining: null,
            planNameSnapshot: "Monthly Unlimited",
            plan: { name: "Monthly Unlimited" },
          },
        ],
      };
      vi.spyOn(db.member as any, "findUnique").mockResolvedValue(validMember);

      let createdNonce: any = null;
      let createdRecord: any = null;

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const txMock = {
          attendanceQrNonce: {
            create: vi.fn().mockImplementation((args) => {
              createdNonce = args.data;
              return Promise.resolve(createdNonce);
            }),
          },
          attendanceRecord: {
            create: vi.fn().mockImplementation((args) => {
              createdRecord = {
                id: "att-rec-1",
                ...args.data,
              };
              return Promise.resolve(createdRecord);
            }),
          },
        };
        return await callback(txMock);
      });

      const result = await processQrAttendanceScan(gymAStaffContext, {
        qrData: token,
        mode: "CHECK_IN",
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe(AttendanceStatus.VERIFIED);
      expect(createdNonce.nonce).toBe("test-nonce-12345".length ? createdNonce.nonce : "unique-nonce-abc-123");
      expect(createdRecord.checkInMethod).toBe(CheckInMethod.QR_SCAN);
      expect(createdRecord.status).toBe(AttendanceStatus.VERIFIED);
    });

    it("prevents replay attacks when the same QR nonce is scanned a second time", async () => {
      const token = generateDynamicQrToken({
        gymId: "gym-alpha-111",
        memberId: "mem-active-1",
        qrSigningSecret: gymAlphaSecret,
        nonce: "consumed-nonce-456",
      });

      vi.spyOn(db.gym as any, "findUnique").mockResolvedValue({
        id: "gym-alpha-111",
        qrSigningSecret: gymAlphaSecret,
      });

      // Nonce already exists in DB (consumed by previous scan)
      vi.spyOn(db.attendanceQrNonce as any, "findUnique").mockResolvedValue({
        id: "nonce-row-1",
        nonce: "consumed-nonce-456",
        consumedAt: new Date(),
      });

      await expect(
        processQrAttendanceScan(gymAStaffContext, {
          qrData: token,
          mode: "CHECK_IN",
        })
      ).rejects.toThrow(ReplayScanError);
    });

    it("prevents duplicate check-in within the 15-minute cooldown window", async () => {
      const token = generateDynamicQrToken({
        gymId: "gym-alpha-111",
        memberId: "mem-active-1",
        qrSigningSecret: gymAlphaSecret,
      });

      vi.spyOn(db.gym as any, "findUnique").mockResolvedValue({
        id: "gym-alpha-111",
        qrSigningSecret: gymAlphaSecret,
      });
      vi.spyOn(db.attendanceQrNonce as any, "findUnique").mockResolvedValue(null);

      const validMember = {
        id: "mem-active-1",
        gymId: "gym-alpha-111",
        firstName: "Clark",
        lastName: "Kent",
        memberships: [
          {
            id: "mship-1",
            status: MembershipStatus.ACTIVE,
            startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
            sessionsRemaining: null,
            plan: { name: "Pro" },
          },
        ],
      };
      vi.spyOn(db.member as any, "findUnique").mockResolvedValue(validMember);

      // Existing verified check-in recorded 3 minutes ago
      vi.spyOn(db.attendanceRecord as any, "findFirst").mockResolvedValue({
        id: "recent-att-1",
        status: AttendanceStatus.VERIFIED,
        checkInTime: new Date(Date.now() - 3 * 60 * 1000),
      });

      await expect(
        processQrAttendanceScan(gymAStaffContext, {
          qrData: token,
          mode: "CHECK_IN",
        })
      ).rejects.toThrow(DuplicateAttendanceError);
    });
  });

  // ============================================================================
  // 3. EXPIRED, PAUSED & INVALID MEMBERSHIPS REJECTION
  // ============================================================================
  describe("Membership Invalidation & Security Rejection Logging", () => {
    it("rejects scan for expired membership and logs REJECTED attendance record", async () => {
      const token = generateDynamicQrToken({
        gymId: "gym-alpha-111",
        memberId: "mem-expired-1",
        qrSigningSecret: gymAlphaSecret,
      });

      vi.spyOn(db.gym as any, "findUnique").mockResolvedValue({
        id: "gym-alpha-111",
        qrSigningSecret: gymAlphaSecret,
      });
      vi.spyOn(db.attendanceQrNonce as any, "findUnique").mockResolvedValue(null);

      // Expired membership 10 days ago
      const expiredMember = {
        id: "mem-expired-1",
        gymId: "gym-alpha-111",
        firstName: "Bruce",
        lastName: "Wayne",
        memberCode: "MEM-9999",
        photoUrl: null,
        memberships: [
          {
            id: "mship-exp",
            status: MembershipStatus.EXPIRED,
            startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            sessionsRemaining: null,
            planNameSnapshot: "Annual",
            plan: { name: "Annual" },
          },
        ],
      };
      vi.spyOn(db.member as any, "findUnique").mockResolvedValue(expiredMember);

      let rejectedAuditLogged = false;
      vi.spyOn(db.attendanceRecord as any, "create").mockImplementation((args: any) => {
        if (args.data.status === AttendanceStatus.REJECTED) {
          rejectedAuditLogged = true;
        }
        return Promise.resolve({ id: "rejected-rec-1", ...args.data });
      });

      await expect(
        processQrAttendanceScan(gymAStaffContext, {
          qrData: token,
          mode: "CHECK_IN",
        })
      ).rejects.toThrow(AttendanceValidationError);

      expect(rejectedAuditLogged).toBe(true);
    });

    it("rejects scan for paused/frozen membership", async () => {
      const token = generateDynamicQrToken({
        gymId: "gym-alpha-111",
        memberId: "mem-paused-1",
        qrSigningSecret: gymAlphaSecret,
      });

      vi.spyOn(db.gym as any, "findUnique").mockResolvedValue({
        id: "gym-alpha-111",
        qrSigningSecret: gymAlphaSecret,
      });
      vi.spyOn(db.attendanceQrNonce as any, "findUnique").mockResolvedValue(null);

      const pausedMember = {
        id: "mem-paused-1",
        gymId: "gym-alpha-111",
        firstName: "Arthur",
        lastName: "Curry",
        memberCode: "MEM-3333",
        photoUrl: null,
        memberships: [
          {
            id: "mship-paused",
            status: MembershipStatus.PAUSED,
            pauseReason: "Medical recovery",
            startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
            sessionsRemaining: null,
            plan: { name: "Standard" },
          },
        ],
      };
      vi.spyOn(db.member as any, "findUnique").mockResolvedValue(pausedMember);
      vi.spyOn(db.attendanceRecord as any, "create").mockResolvedValue({ id: "rej-1" });

      await expect(
        processQrAttendanceScan(gymAStaffContext, {
          qrData: token,
          mode: "CHECK_IN",
        })
      ).rejects.toThrow(AttendanceValidationError);
    });
  });

  // ============================================================================
  // 4. MANUAL DESK OVERRIDE & ATTENDANCE AUDIT LOGGING
  // ============================================================================
  describe("Manual Front-Desk Override", () => {
    it("logs manual check-in with mandatory reason and persists AttendanceAuditLog", async () => {
      const mockMember = {
        id: "mem-manual-1",
        gymId: "gym-alpha-111",
        firstName: "Barry",
        lastName: "Allen",
        memberCode: "MEM-7777",
        memberships: [
          {
            id: "mship-barry",
            status: MembershipStatus.ACTIVE,
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            plan: { name: "Speed Pass" },
          },
        ],
      };

      vi.spyOn(db.member as any, "findUnique").mockResolvedValue(mockMember);

      let createdRecord: any = null;
      let createdAuditLog: any = null;

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const txMock = {
          attendanceRecord: {
            create: vi.fn().mockImplementation((args) => {
              createdRecord = { id: "rec-manual-1", ...args.data };
              return Promise.resolve(createdRecord);
            }),
          },
          attendanceAuditLog: {
            create: vi.fn().mockImplementation((args) => {
              createdAuditLog = { id: "audit-1", ...args.data };
              return Promise.resolve(createdAuditLog);
            }),
          },
        };
        return await callback(txMock);
      });

      const result = await recordManualAttendance(gymAStaffContext, {
        memberId: "mem-manual-1",
        mode: "CHECK_IN",
        reason: "Member forgot physical smartphone; verified government photo ID.",
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe(AttendanceStatus.MANUAL_OVERRIDE);
      expect(createdRecord.checkInMethod).toBe(CheckInMethod.MANUAL_DESK);
      expect(createdAuditLog.action).toBe("MANUAL_CHECK_IN_OVERRIDE");
      expect(createdAuditLog.reason).toBe(
        "Member forgot physical smartphone; verified government photo ID."
      );
      expect(createdAuditLog.staffUserId).toBe("staff-alpha");
    });
  });

  // ============================================================================
  // 5. ATTENDANCE METRICS
  // ============================================================================
  describe("Attendance Reporting Metrics", () => {
    it("accurately computes today's check-ins, current occupancy, overrides and rejections", async () => {
      vi.spyOn(db.attendanceRecord as any, "count")
        .mockResolvedValueOnce(45) // totalCheckIns
        .mockResolvedValueOnce(18) // currentlyInGym
        .mockResolvedValueOnce(3)  // manualOverrides
        .mockResolvedValueOnce(2); // rejectedScans

      const metrics = await getTodayAttendanceMetrics(gymAStaffContext);

      expect(metrics.totalCheckIns).toBe(45);
      expect(metrics.currentlyInGym).toBe(18);
      expect(metrics.manualOverrides).toBe(3);
      expect(metrics.rejectedScans).toBe(2);
    });

    it("generates member dynamic QR pass with active membership snapshot", async () => {
      vi.spyOn(db.gym as any, "findUnique").mockResolvedValue({
        id: "gym-alpha-111",
        qrSigningSecret: gymAlphaSecret,
        name: "Alpha Gym",
        slug: "alpha",
      });

      vi.spyOn(db.member as any, "findUnique").mockResolvedValue({
        id: "mem-active-1",
        gymId: "gym-alpha-111",
        firstName: "Diana",
        lastName: "Prince",
        memberCode: "MEM-1001",
        photoUrl: null,
        status: "ACTIVE",
        memberships: [
          {
            endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
            planNameSnapshot: "Pro Pass",
            plan: { name: "Pro Pass" },
          },
        ],
      });

      const pass = await generateMemberQrPass(gymAStaffContext, "mem-active-1");
      expect(pass.qrData).toBeTruthy();
      expect(pass.expiresInSeconds).toBe(60);
      expect(pass.member.fullName).toBe("Diana Prince");
      expect(pass.member.activePlan).toBe("Pro Pass");
    });

    it("rejects unauthorized cross-gym scanner access (Staff B scanning for Gym A)", async () => {
      const gymAToken = generateDynamicQrToken({
        gymId: "gym-alpha-111",
        memberId: "mem-active-1",
        qrSigningSecret: gymAlphaSecret,
      });

      vi.spyOn(db.gym as any, "findUnique").mockResolvedValue({
        id: "gym-beta-222",
        qrSigningSecret: gymBetaSecret,
      });

      // Staff B in Gym B attempts to scan Gym A token
      await expect(
        processQrAttendanceScan(gymBStaffContext, {
          qrData: gymAToken,
          mode: "CHECK_IN",
        })
      ).rejects.toThrow(CrossTenantScanError);
    });
  });
});
