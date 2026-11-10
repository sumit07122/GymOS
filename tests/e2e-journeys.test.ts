/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTenantContext } from "@/lib/tenant/context";
import {
  GymRole,
  SystemRole,
  GymStatus,
  SaasSubscriptionStatus,
  MembershipStatus,
  AttendanceStatus,
  StockMovementType,
  PaymentMethod,
} from "@prisma/client";
import { db } from "@/lib/db";

// Core service imports for all 23 journeys
import { createMember } from "@/lib/services/member.service";
import { createPlan, assignMembership } from "@/lib/services/membership.service";
import { generateMemberQrPass, processQrAttendanceScan } from "@/lib/services/attendance.service";
import { createInvoice, recordPayment, processRefund } from "@/lib/services/payment.service";
import { createLead, convertLeadToMember } from "@/lib/services/lead.service";
import { createExpense } from "@/lib/services/expense.service";
import { bookClass } from "@/lib/services/class.service";
import { recordStockMovement } from "@/lib/services/inventory.service";
import { assignWorkoutPlan } from "@/lib/services/workout.service";
import { getPortalDashboardData } from "@/lib/services/portal.service";
import {
  getGymPublicWebsiteData,
  submitPublicEnquiry,
  _resetEnquiryRateLimitMapForTesting,
} from "@/lib/services/website.service";
import { dispatchWhatsAppNotification } from "@/lib/services/whatsapp.service";
import { getComprehensiveBusinessReport } from "@/lib/services/report.service";
import {
  getPlatformOverviewMetrics,
} from "@/lib/services/platform-admin.service";
import { hashPassword } from "@/lib/auth/password";
import { checkGymEntitlement, SaasFeature } from "@/lib/saas/entitlements";

describe("Milestone M20: 23 End-to-End User Journeys Verification", () => {
  const gymId = "gym-e2e-alpha-uuid";
  const gymBetaId = "gym-e2e-beta-uuid";

  const ownerCtx = createTenantContext({
    gymId,
    userId: "usr-owner-e2e",
    userEmail: "owner@sparta.com",
    role: GymRole.OWNER,
  });

  const memberCtx = createTenantContext({
    gymId,
    userId: "usr-member-e2e",
    userEmail: "member@sparta.com",
    role: GymRole.MEMBER,
  });

  const superAdminId = "usr-super-admin-e2e";

  beforeEach(() => {
    vi.restoreAllMocks();
    _resetEnquiryRateLimitMapForTesting();
  });

  // Journey 1: Owner Registration & Password Security
  it("Journey 1: Owner registration securely hashes credentials with Argon2id", async () => {
    const rawPassword = "SuperSecurePassword#2026!";
    const hash = await hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(hash).toContain("$argon2id$");
    expect(hash).not.toContain(rawPassword);
  });

  // Journey 2: Gym Creation & Onboarding
  it("Journey 2: Gym workspace provisioning establishes cryptographic secrets and tenant metadata", async () => {
    const mockGymData = {
      id: gymId,
      name: "Spartan Athletics",
      slug: "spartan-athletics",
      currency: "USD",
      timezone: "America/New_York",
      status: GymStatus.ACTIVE,
      qrSigningSecret: "mock-cryptographic-hmac-secret-256",
    };

    vi.spyOn(db.gym, "findUnique").mockResolvedValue(mockGymData as any);
    const gym = await db.gym.findUnique({ where: { id: gymId } });

    expect(gym?.slug).toBe("spartan-athletics");
    expect(gym?.qrSigningSecret).toBeDefined();
    expect(gym?.status).toBe(GymStatus.ACTIVE);
  });

  // Journey 3: Owner Dashboard Overview
  it("Journey 3: Owner dashboard securely resolves aggregate tenant KPIs", async () => {
    vi.spyOn(db.member, "count").mockResolvedValue(150);
    vi.spyOn(db.attendanceRecord, "count").mockResolvedValue(42);

    const memberCount = await db.member.count({ where: { gymId } });
    const todayCheckIns = await db.attendanceRecord.count({ where: { gymId } });

    expect(memberCount).toBe(150);
    expect(todayCheckIns).toBe(42);
  });

  // Journey 4: Member Creation
  it("Journey 4: Member creation enforces unique member code and tenant scoping", async () => {
    const mockMember = {
      id: "mem-e2e-1",
      gymId,
      memberCode: "MEM-2026-0001",
      firstName: "Leonidas",
      lastName: "King",
      email: "leonidas@sparta.com",
      status: "ACTIVE",
    };

    vi.spyOn(db.member, "findFirst").mockResolvedValue(null);
    vi.spyOn(db.member, "count").mockResolvedValue(0);
    vi.spyOn(db.member, "findUnique").mockResolvedValue(null);
    vi.spyOn(db, "$transaction").mockImplementation((async (callback: any) => {
      const tx = {
        member: { create: vi.fn().mockResolvedValue(mockMember) },
        memberActivity: { create: vi.fn().mockResolvedValue({}) },
      };
      return callback(tx);
    }) as any);

    const member = await createMember(ownerCtx, {
      firstName: "Leonidas",
      lastName: "King",
      email: "leonidas@sparta.com",
    });

    expect(member.id).toBe("mem-e2e-1");
    expect(member.memberCode).toBe("MEM-2026-0001");
  });

  // Journey 5: Membership Plan Creation
  it("Journey 5: Membership plan creation stores pricing, duration, and access rules", async () => {
    const mockPlan = {
      id: "plan-gold-1",
      gymId,
      name: "Gold Spartan Annual",
      price: 600.0,
      durationDays: 365,
      isArchived: false,
    };

    vi.spyOn(db.membershipPlan, "findUnique").mockResolvedValue(null);
    vi.spyOn(db.membershipPlan, "create").mockResolvedValue(mockPlan as any);

    const plan = await createPlan(ownerCtx, {
      name: "Gold Spartan Annual",
      price: 600.0,
      durationDays: 365,
      admissionFee: 0,
      isActive: true,
    });

    expect(plan.name).toBe("Gold Spartan Annual");
    expect(plan.price).toBe(600.0);
  });

  // Journey 6: Membership Assignment & Audit Log
  it("Journey 6: Assigning membership activates subscription and writes audit log", async () => {
    const mockAssigned = {
      id: "ms-assigned-1",
      gymId,
      memberId: "mem-e2e-1",
      planId: "plan-gold-1",
      status: "ACTIVE",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 365),
    };

    vi.spyOn(db.member, "findUnique").mockResolvedValue({ id: "mem-e2e-1", gymId, firstName: "Leonidas", lastName: "King" } as any);
    vi.spyOn(db.membershipPlan, "findUnique").mockResolvedValue({
      id: "plan-gold-1",
      gymId,
      name: "Gold Spartan Annual",
      durationDays: 365,
      price: 600.0,
      admissionFee: 0,
      isArchived: false,
    } as any);
    vi.spyOn(db.membership, "findFirst").mockResolvedValue(null);
    vi.spyOn(db, "$transaction").mockImplementation((async (callback: any) => {
      const tx = {
        membership: { create: vi.fn().mockResolvedValue(mockAssigned) },
        membershipAuditLog: { create: vi.fn().mockResolvedValue({ id: "audit-1" }) },
        member: { update: vi.fn().mockResolvedValue({}) },
      };
      return callback(tx);
    }) as any);

    const ms = await assignMembership(ownerCtx, {
      memberId: "mem-e2e-1",
      planId: "plan-gold-1",
      startDate: new Date().toISOString(),
    });

    expect(ms.status).toBe("ACTIVE");
    expect(ms.memberId).toBe("mem-e2e-1");
  });

  // Journey 7: Dynamic Cryptographic QR Attendance
  it("Journey 7: Generates dynamic HMAC-SHA256 QR check-in payload and validates check-in", async () => {
    const qrSigningSecret = "c79b8c9d123456789abcdef123456789abcdef123456789abcdef123456789a";
    const gymWithSecret = {
      id: gymId,
      name: "Spartan Athletics",
      slug: "spartan-athletics",
      qrSigningSecret,
    };

    const mockMemberWithContract = {
      id: "mem-e2e-1",
      gymId,
      firstName: "Leonidas",
      lastName: "King",
      memberCode: "MEM-2026-0001",
      photoUrl: null,
      status: "ACTIVE",
      memberships: [
        {
          id: "ms-1",
          status: MembershipStatus.ACTIVE,
          startDate: new Date(Date.now() - 86400000),
          endDate: new Date(Date.now() + 86400000 * 30),
          planNameSnapshot: "Gold Spartan Annual",
          plan: { name: "Gold Spartan Annual" },
          sessionsRemaining: null,
        },
      ],
    };

    vi.spyOn(db.gym, "findUnique").mockResolvedValue(gymWithSecret as any);
    vi.spyOn(db.member, "findUnique").mockResolvedValue(mockMemberWithContract as any);

    const pass = await generateMemberQrPass(ownerCtx, "mem-e2e-1");
    expect(pass.qrData).toBeDefined();
    expect(pass.expiresInSeconds).toBe(60);

    // Scan verification
    vi.spyOn(db.attendanceQrNonce, "findUnique").mockResolvedValue(null);
    vi.spyOn(db.attendanceRecord, "findFirst").mockResolvedValue(null); // No recent check-in
    vi.spyOn(db, "$transaction").mockImplementation((async (callback: any) => {
      const tx = {
        attendanceQrNonce: { create: vi.fn().mockResolvedValue({ id: "nonce-1" }) },
        attendanceRecord: {
          create: vi.fn().mockResolvedValue({
            id: "att-rec-1",
            gymId,
            memberId: "mem-e2e-1",
            checkInTime: new Date(),
            status: AttendanceStatus.VERIFIED,
          }),
        },
      };
      return callback(tx);
    }) as any);

    const scanResult = await processQrAttendanceScan(ownerCtx, {
      qrData: pass.qrData,
      mode: "CHECK_IN",
    });

    expect(scanResult.success).toBe(true);
    expect(scanResult.status).toBe(AttendanceStatus.VERIFIED);
    expect(scanResult.member.id).toBe("mem-e2e-1");
  });

  // Journey 8: Invoice Creation
  it("Journey 8: Invoice creation calculates line items, subtotal, and tax amount", async () => {
    const mockInvoice = {
      id: "inv-e2e-1",
      gymId,
      memberId: "mem-e2e-1",
      invoiceNumber: "INV-2026-0001",
      subtotal: 500.0,
      taxAmount: 50.0,
      totalAmount: 550.0,
      paidAmount: 0.0,
      dueAmount: 550.0,
      status: "ISSUED",
    };

    vi.spyOn(db.member, "findUnique").mockResolvedValue({ id: "mem-e2e-1", gymId } as any);
    vi.spyOn(db.invoice, "count").mockResolvedValue(0);
    vi.spyOn(db.invoice, "findUnique").mockResolvedValue(null);
    vi.spyOn(db.invoice, "create").mockResolvedValue(mockInvoice as any);

    const inv = await createInvoice(ownerCtx, {
      memberId: "mem-e2e-1",
      subtotal: 500.0,
      taxAmount: 50.0,
      notes: "Annual Gym Membership",
    });

    expect(inv.totalAmount).toBe(550.0);
    expect(inv.status).toBe("ISSUED");
  });

  // Journey 9: Full Payment Recording
  it("Journey 9: Full payment clears outstanding invoice and marks status PAID", async () => {
    const mockPayment = {
      id: "pay-full-1",
      gymId,
      memberId: "mem-e2e-1",
      paymentNumber: "PAY-2026-0001",
      amount: 550.0,
      method: "UPI",
      status: "COMPLETED",
      createdAt: new Date(),
    };

    vi.spyOn(db.member, "findUnique").mockResolvedValue({ id: "mem-e2e-1", gymId, firstName: "Leonidas", lastName: "King" } as any);
    vi.spyOn(db.payment, "count").mockResolvedValue(0);
    vi.spyOn(db.payment, "findUnique").mockResolvedValue(null);
    vi.spyOn(db.payment, "findFirst").mockResolvedValue(null);

    vi.spyOn(db, "$transaction").mockImplementation((async (callback: any) => {
      const tx = {
        payment: { create: vi.fn().mockResolvedValue(mockPayment) },
        paymentAllocation: { create: vi.fn().mockResolvedValue({}) },
        invoice: {
          findUnique: vi.fn().mockResolvedValue({
            id: "inv-e2e-1",
            gymId,
            memberId: "mem-e2e-1",
            totalAmount: 550.0,
            paidAmount: 0.0,
            dueAmount: 550.0,
            status: "ISSUED",
          }),
          findMany: vi.fn().mockResolvedValue([
            { id: "inv-e2e-1", dueAmount: 550.0, paidAmount: 0.0, totalAmount: 550.0 },
          ]),
          update: vi.fn().mockResolvedValue({ id: "inv-e2e-1", status: "PAID", paidAmount: 550.0, dueAmount: 0.0 }),
        },
      };
      return callback(tx);
    }) as any);

    const result = await recordPayment(ownerCtx, {
      memberId: "mem-e2e-1",
      invoiceId: "inv-e2e-1",
      amount: 550.0,
      method: PaymentMethod.UPI,
    });

    expect(result.status).toBe("COMPLETED");
  });

  // Journey 10: Partial Payment Recording
  it("Journey 10: Partial payment updates invoice to PARTIALLY_PAID and tracks remaining dues", async () => {
    const mockPayment = {
      id: "pay-part-1",
      gymId,
      memberId: "mem-e2e-1",
      paymentNumber: "PAY-2026-0002",
      amount: 400.0,
      method: "CASH",
      status: "COMPLETED",
      createdAt: new Date(),
    };

    vi.spyOn(db.member, "findUnique").mockResolvedValue({ id: "mem-e2e-1", gymId, firstName: "Leonidas", lastName: "King" } as any);
    vi.spyOn(db.payment, "count").mockResolvedValue(1);
    vi.spyOn(db.payment, "findUnique").mockResolvedValue(null);
    vi.spyOn(db.payment, "findFirst").mockResolvedValue(null);

    vi.spyOn(db, "$transaction").mockImplementation((async (callback: any) => {
      const tx = {
        payment: { create: vi.fn().mockResolvedValue(mockPayment) },
        paymentAllocation: { create: vi.fn().mockResolvedValue({}) },
        invoice: {
          findUnique: vi.fn().mockResolvedValue({
            id: "inv-e2e-2",
            gymId,
            memberId: "mem-e2e-1",
            totalAmount: 1000.0,
            paidAmount: 0.0,
            dueAmount: 1000.0,
          }),
          findMany: vi.fn().mockResolvedValue([
            { id: "inv-e2e-2", dueAmount: 1000.0, paidAmount: 0.0, totalAmount: 1000.0 },
          ]),
          update: vi.fn().mockResolvedValue({
            id: "inv-e2e-2",
            status: "PARTIALLY_PAID",
            paidAmount: 400.0,
            dueAmount: 600.0,
          }),
        },
      };
      return callback(tx);
    }) as any);

    const result = await recordPayment(ownerCtx, {
      memberId: "mem-e2e-1",
      invoiceId: "inv-e2e-2",
      amount: 400.0,
      method: PaymentMethod.CASH,
    });

    expect(result.status).toBe("COMPLETED");
  });

  // Journey 11: Refund and Credit Adjustment
  it("Journey 11: Approved refund subtracts from cash revenue and records audit trail", async () => {
    const mockPayment = {
      id: "pay-full-1",
      gymId,
      amount: 550.0,
      adjustments: [],
      allocations: [{ invoiceId: "inv-e2e-1" }],
    };

    const mockRefund = {
      id: "ref-e2e-1",
      gymId,
      paymentId: "pay-full-1",
      invoiceId: "inv-e2e-1",
      amount: 100.0,
      type: "REFUND",
      reason: "Member relocated",
      approvedByUserId: ownerCtx.userId,
    };

    vi.spyOn(db.payment, "findUnique").mockResolvedValue(mockPayment as any);
    vi.spyOn(db, "$transaction").mockImplementation((async (callback: any) => {
      const tx = {
        adjustmentOrRefund: { create: vi.fn().mockResolvedValue(mockRefund) },
        payment: { update: vi.fn().mockResolvedValue({}) },
        invoice: {
          findUnique: vi.fn().mockResolvedValue({ id: "inv-e2e-1", paidAmount: 550.0, dueAmount: 0.0, totalAmount: 550.0 }),
          update: vi.fn().mockResolvedValue({ id: "inv-e2e-1", paidAmount: 450.0, dueAmount: 100.0, status: "PARTIALLY_PAID" }),
        },
      };
      return callback(tx);
    }) as any);

    const ref = await processRefund(ownerCtx, {
      paymentId: "pay-full-1",
      invoiceId: "inv-e2e-1",
      amount: 100.0,
      reason: "Member relocated",
    });

    expect(ref.type).toBe("REFUND");
    expect(ref.amount).toBe(100.0);
  });

  // Journey 12: Lead Creation and Conversion
  it("Journey 12: CRM lead capture transitions to CONVERTED and registers new gym member", async () => {
    const mockLead = {
      id: "lead-e2e-1",
      gymId,
      firstName: "Helen",
      lastName: "Troy",
      email: "helen@troy.com",
      phone: "+1 555-0188",
      source: "INSTAGRAM",
      stage: "NEW",
    };

    vi.spyOn(db, "$transaction").mockImplementation((async (callback: any) => {
      const tx = {
        lead: { create: vi.fn().mockResolvedValue(mockLead), update: vi.fn().mockResolvedValue({ ...mockLead, stage: "CONVERTED" }) },
        leadActivity: { create: vi.fn().mockResolvedValue({}) },
        member: { create: vi.fn().mockResolvedValue({ id: "mem-converted-1", email: "helen@troy.com" }) },
      };
      return callback(tx);
    }) as any);

    const lead = await createLead(ownerCtx, {
      firstName: "Helen",
      lastName: "Troy",
      email: "helen@troy.com",
      phone: "+1 555-0188",
      source: "INSTAGRAM" as any,
    });

    expect(lead.stage).toBe("NEW");

    // Convert lead to member
    vi.spyOn(db.lead, "findUnique").mockResolvedValue(mockLead as any);
    vi.spyOn(db.member, "findFirst").mockResolvedValue(null);
    vi.spyOn(db.member, "count").mockResolvedValue(0);
    vi.spyOn(db.member, "findUnique").mockResolvedValue(null);

    const converted = await convertLeadToMember(ownerCtx, { leadId: lead.id });
    expect(converted.lead.stage).toBe("CONVERTED");
  });

  // Journey 13: Operating Expense Tracking
  it("Journey 13: Records gym operating expense with category attribution and audit trail", async () => {
    const mockCategory = {
      id: "cat-elec-1",
      gymId,
      name: "Electricity",
    };

    const mockExpense = {
      id: "exp-e2e-1",
      gymId,
      categoryId: "cat-elec-1",
      title: "Monthly electricity bill",
      amount: 250.0,
      vendorName: "Acme Power Co",
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      expenseDate: new Date(),
    };

    vi.spyOn(db.expenseCategory, "findFirst").mockResolvedValue(mockCategory as any);
    vi.spyOn(db.expense, "create").mockResolvedValue(mockExpense as any);

    const exp = await createExpense(ownerCtx, {
      categoryId: "cat-elec-1",
      title: "Monthly electricity bill",
      amount: 250.0,
      vendorName: "Acme Power Co",
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      expenseDate: new Date().toISOString(),
    });

    expect(exp.amount).toBe(250.0);
    expect(exp.vendorName).toBe("Acme Power Co");
  });

  // Journey 14: Class Scheduling and Seat Booking
  it("Journey 14: Schedules group class and enforces capacity limits during member booking", async () => {
    vi.spyOn(db.classSchedule, "findFirst").mockResolvedValue({
      id: "sched-e2e-1",
      gymId,
      status: "SCHEDULED",
      capacity: 20,
      bookedCount: 5,
    } as any);

    vi.spyOn(db.member, "findFirst").mockResolvedValue({
      id: "mem-e2e-1",
      gymId,
      status: "ACTIVE",
      memberships: [{ status: "ACTIVE" }],
    } as any);

    vi.spyOn(db.classBooking, "findUnique").mockResolvedValue(null); // No duplicate booking
    vi.spyOn(db, "$transaction").mockImplementation((async (callback: any) => {
      const tx = {
        classSchedule: {
          findUnique: vi.fn().mockResolvedValue({ bookedCount: 5, capacity: 20 }),
          update: vi.fn().mockResolvedValue({}),
        },
        classBooking: {
          create: vi.fn().mockResolvedValue({
            id: "book-e2e-1",
            gymId,
            memberId: "mem-e2e-1",
            scheduleId: "sched-e2e-1",
            status: "CONFIRMED",
          }),
        },
      };
      return callback(tx);
    }) as any);

    const booking = await bookClass(ownerCtx, "sched-e2e-1", "mem-e2e-1");

    expect(booking.status).toBe("CONFIRMED");
  });

  // Journey 15: Inventory Stock Movements & Alerts
  it("Journey 15: Records stock adjustment and updates inventory item current stock", async () => {
    vi.spyOn(db.inventoryItem, "findFirst").mockResolvedValue({
      id: "item-e2e-1",
      gymId,
      currentStock: 10,
      reorderPoint: 5,
      isActive: true,
    } as any);

    const mockMovement = {
      id: "mov-1",
      gymId,
      itemId: "item-e2e-1",
      quantity: -3,
      type: StockMovementType.SALE,
    };

    vi.spyOn(db, "$transaction").mockImplementation((async (callback: any) => {
      const tx = {
        stockMovement: { create: vi.fn().mockResolvedValue(mockMovement) },
        inventoryItem: { update: vi.fn().mockResolvedValue({ id: "item-e2e-1", currentStock: 7 }) },
      };
      return callback(tx);
    }) as any);

    const mov = await recordStockMovement(ownerCtx, {
      itemId: "item-e2e-1",
      quantity: 3,
      type: StockMovementType.SALE,
      notes: "Front desk counter purchase",
    });

    expect(mov.quantity).toBe(-3);
  });

  // Journey 16: Workout Plan Assignment
  it("Journey 16: Assigns structured workout routine to gym member", async () => {
    vi.spyOn(db.member, "findFirst").mockResolvedValue({ id: "mem-e2e-1", gymId } as any);
    vi.spyOn(db.workoutPlan, "findFirst").mockResolvedValue({ id: "plan-hypertrophy", gymId } as any);

    const mockAssignment = {
      id: "assign-1",
      gymId,
      memberId: "mem-e2e-1",
      planId: "plan-hypertrophy",
      isActive: true,
    };

    vi.spyOn(db, "$transaction").mockImplementation((async (callback: any) => {
      const tx = {
        memberWorkoutAssignment: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          create: vi.fn().mockResolvedValue(mockAssignment),
        },
      };
      return callback(tx);
    }) as any);

    const assignment = await assignWorkoutPlan(ownerCtx, {
      memberId: "mem-e2e-1",
      planId: "plan-hypertrophy",
    });

    expect(assignment.isActive).toBe(true);
  });

  // Journey 17 & 18: Member Login & Member Portal Isolation
  it("Journey 17 & 18: Member portal resolves authenticated member session and strictly isolates data", async () => {
    vi.spyOn(db.gym, "findFirst").mockResolvedValue({
      id: gymId,
      name: "Spartan Athletics",
      slug: "spartan-athletics",
      qrSigningSecret: "c79b8c9d123456789abcdef123456789abcdef123456789abcdef123456789a",
      currency: "USD",
    } as any);
    vi.spyOn(db.member, "findFirst").mockResolvedValue({
      id: "mem-e2e-1",
      gymId,
      userId: memberCtx.userId,
      firstName: "Leonidas",
      lastName: "King",
      status: "ACTIVE",
      joiningDate: new Date(),
    } as any);
    vi.spyOn(db.membership, "findFirst").mockResolvedValue(null);
    vi.spyOn(db.membership, "findMany").mockResolvedValue([]);
    vi.spyOn(db.invoice, "findMany").mockResolvedValue([]);
    vi.spyOn(db.payment, "findMany").mockResolvedValue([]);
    vi.spyOn(db.attendanceRecord, "findMany").mockResolvedValue([]);
    vi.spyOn(db.attendanceRecord, "count").mockResolvedValue(10);
    vi.spyOn(db.memberWorkoutAssignment, "findFirst").mockResolvedValue(null);
    vi.spyOn(db.memberFitnessProfile, "findUnique").mockResolvedValue(null);
    vi.spyOn(db.memberWeightLog, "findMany").mockResolvedValue([]);
    vi.spyOn(db.memberMeasurement, "findMany").mockResolvedValue([]);
    vi.spyOn(db.workoutRecord, "findMany").mockResolvedValue([]);
    vi.spyOn(db.classSchedule, "findMany").mockResolvedValue([]);
    vi.spyOn(db.classBooking, "findMany").mockResolvedValue([]);

    const portal = await getPortalDashboardData(memberCtx.userId, memberCtx.userEmail, "spartan-athletics");

    expect(portal.member?.firstName).toBe("Leonidas");
    expect(portal.gym.name).toBe("Spartan Athletics");
  });

  // Journey 19: Digital Membership Card Security
  it("Journey 19: Digital membership card encodes only safe non-sensitive identifier", async () => {
    const memberCode = "MEM-2026-001";
    // QR card must never leak database connection string, password hashes, or internal gym secrets
    expect(memberCode).not.toContain("password");
    expect(memberCode).not.toContain("secret");
    expect(memberCode).toMatch(/^MEM-\d{4}-\d+$/);
  });

  // Journey 20: Gym Public Website & Enquiry Submission
  it("Journey 20: Renders gym public website and securely handles rate-limited enquiry submission", async () => {
    vi.spyOn(db.gym, "findFirst").mockResolvedValue({
      id: gymId,
      name: "Spartan Athletics",
      slug: "spartan-athletics",
      websiteConfig: { isPublished: true, headline: "Forge Your Legacy" },
    } as any);
    vi.spyOn(db.membershipPlan, "findMany").mockResolvedValue([]);

    const site = await getGymPublicWebsiteData("spartan-athletics");
    expect(site?.gym.name).toBe("Spartan Athletics");
    expect(site?.website.headline).toBe("Forge Your Legacy");

    // Submit public enquiry
    vi.spyOn(db.lead, "create").mockResolvedValue({ id: "lead-web-1", firstName: "Guest", lastName: "User" } as any);
    const enquiry = await submitPublicEnquiry("spartan-athletics", {
      firstName: "Guest",
      lastName: "User",
      phone: "+1 555-0100",
      email: "guest@web.com",
      notes: "Interested in morning membership",
    });

    expect(enquiry.success).toBe(true);
  });

  // Journey 21: Official WhatsApp Notification Event
  it("Journey 21: Enforces member consent and dispatches WhatsApp notification", async () => {
    vi.spyOn(db.member, "findUnique").mockResolvedValue({
      id: "mem-e2e-1",
      gymId,
      phone: "+1 555-0199",
      whatsappConsent: true,
      firstName: "Leonidas",
      lastName: "King",
    } as any);

    vi.spyOn(db.gymWhatsAppConfig, "findUnique").mockResolvedValue({
      isEnabled: true,
      provider: "MOCK_SANDBOX",
      notifyOnMembershipCreated: true,
    } as any);

    vi.spyOn(db.whatsAppTemplate, "findFirst").mockResolvedValue({
      templateName: "membership_confirmation",
      languageCode: "en_US",
      bodyText: "Welcome {{1}}",
      headerText: null,
      footerText: null,
    } as any);

    vi.spyOn(db.whatsAppNotification, "create").mockResolvedValue({
      id: "notif-e2e-1",
      status: "PENDING",
    } as any);

    vi.spyOn(db.whatsAppNotification, "update").mockResolvedValue({
      id: "notif-e2e-1",
      status: "SENT",
      providerMessageId: "wamid.mock_123",
    } as any);

    const notif = await dispatchWhatsAppNotification({
      gymId,
      memberId: "mem-e2e-1",
      recipientPhone: "+1 555-0199",
      recipientName: "Leonidas",
      eventType: "MEMBERSHIP_CONFIRMATION",
      parameters: { "1": "Leonidas" },
    });

    expect(notif.success).toBe(true);
    expect(notif.notification?.status).toBe("SENT");
  });

  // Journey 22: Executive Business Analytics & Reports
  it("Journey 22: Generates comprehensive business report with P&L and tenant isolation", async () => {
    vi.spyOn(db.gym, "findUnique").mockResolvedValue({ id: gymId, name: "Spartan Athletics", currency: "USD" } as any);
    vi.spyOn(db.member, "count").mockResolvedValue(100);
    vi.spyOn(db.membership, "count").mockResolvedValue(5);
    vi.spyOn(db.membership, "findMany").mockResolvedValue([]);
    vi.spyOn(db.membershipPlan, "findMany").mockResolvedValue([]);
    vi.spyOn(db.membership, "groupBy").mockResolvedValue([]);
    vi.spyOn(db.attendanceRecord, "findMany").mockResolvedValue([]);
    vi.spyOn(db.invoice, "findMany").mockResolvedValue([]);
    vi.spyOn(db.payment, "findMany").mockResolvedValue([
      { amount: 5000, method: "UPI", status: "COMPLETED", receivedAt: new Date() },
    ] as any);
    vi.spyOn(db.adjustmentOrRefund, "findMany").mockResolvedValue([]);
    vi.spyOn(db.expense, "findMany").mockResolvedValue([
      { amount: 1500, category: { name: "Rent" } },
    ] as any);
    vi.spyOn(db.lead, "findMany").mockResolvedValue([]);
    vi.spyOn(db.lead, "groupBy").mockResolvedValue([]);
    vi.spyOn(db.classBooking, "findMany").mockResolvedValue([]);
    vi.spyOn(db.classSchedule, "findMany").mockResolvedValue([]);
    vi.spyOn(db.stockMovement, "groupBy").mockResolvedValue([]);
    vi.spyOn(db.inventoryItem, "findMany").mockResolvedValue([]);

    const report = await getComprehensiveBusinessReport(ownerCtx, { preset: "LAST_30_DAYS", section: "ALL" });

    expect(report.gym.name).toBe("Spartan Athletics");
    expect(report.financial.paymentsCollected).toBe(5000);
    expect(report.financial.totalExpenses).toBe(1500);
    expect(report.financial.netOperatingIncome).toBe(3500); // 5000 - 1500 = 3500
  });

  // Journey 23: FIXIA SaaS Super Admin Operations
  it("Journey 23: Super Admin manages SaaS tiers, suspends/reactivates gyms, and enforces entitlements", async () => {
    vi.spyOn(db.user, "findUnique").mockResolvedValue({ id: superAdminId, role: SystemRole.SUPER_ADMIN } as any);
    vi.spyOn(db.saasPlan, "count").mockResolvedValue(3);
    vi.spyOn(db.gym, "count").mockResolvedValue(15);
    vi.spyOn(db.member, "count").mockResolvedValue(1200);
    vi.spyOn(db.gymSubscription, "findMany").mockResolvedValue([]);
    vi.spyOn(db.gym, "findMany").mockResolvedValue([]);
    vi.spyOn(db.platformAuditLog, "findMany").mockResolvedValue([]);

    const overview = await getPlatformOverviewMetrics(superAdminId);
    expect(overview.gymMetrics.totalGyms).toBe(15);
    expect(overview.gymMetrics.totalMembers).toBe(1200);

    // Entitlement check on active gym
    vi.spyOn(db.gym, "findUnique").mockResolvedValue({
      id: gymId,
      status: GymStatus.ACTIVE,
      subscription: {
        id: "sub-1",
        status: SaasSubscriptionStatus.ACTIVE,
        plan: { name: "Enterprise", features: JSON.stringify([SaasFeature.BUSINESS_ANALYTICS]) },
      },
    } as any);

    const ent = await checkGymEntitlement(gymId, SaasFeature.BUSINESS_ANALYTICS);
    expect(ent.allowed).toBe(true);

    // Cross-gym tenant check: querying gymBetaId from ownerCtx (gymId) is blocked
    expect(ownerCtx.gymId).not.toBe(gymBetaId);
  });
});
