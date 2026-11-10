/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getMembershipAnalytics,
  getAttendanceAnalytics,
  getFinancialAnalytics,
  getCrmAnalytics,
  getOperationsAnalytics,
  getComprehensiveBusinessReport,
  generateReportCsv,
} from "@/lib/services/report.service";
import { resolveDateRange } from "@/lib/validations/report";
import { createTenantContext } from "@/lib/tenant/context";
import { InsufficientPermissionError } from "@/lib/tenant/permissions";
import { db } from "@/lib/db";
import { GymRole } from "@prisma/client";

describe("Milestone M18: Reports and Business Analytics", () => {
  const gymAlpha = {
    id: "gym-alpha-reports",
    name: "Alpha Power Gym",
    slug: "alpha-power",
    currency: "USD",
    timezone: "America/New_York",
  };

  const gymBeta = {
    id: "gym-beta-reports",
    name: "Beta Fitness Club",
    slug: "beta-fitness",
    currency: "EUR",
    timezone: "Europe/London",
  };

  const ownerAlphaContext = createTenantContext({
    gymId: gymAlpha.id,
    userId: "owner-alpha",
    userEmail: "owner@alphagym.com",
    role: GymRole.OWNER,
  });

  const staffAlphaContext = createTenantContext({
    gymId: gymAlpha.id,
    userId: "staff-alpha",
    userEmail: "staff@alphagym.com",
    role: GymRole.STAFF,
  });

  const memberAlphaContext = createTenantContext({
    gymId: gymAlpha.id,
    userId: "member-alpha",
    userEmail: "member@alphagym.com",
    role: GymRole.MEMBER,
  });

  const fixedReferenceNow = new Date("2026-11-10T12:00:00.000Z");

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // 1. DATE PRESET RESOLUTION & BOUNDARY INTEGRITY
  // ============================================================================
  describe("Date Presets & Boundary Calculation", () => {
    it("resolves TODAY preset to exact day boundaries (00:00:00 to 23:59:59.999)", () => {
      const range = resolveDateRange("TODAY", null, null, fixedReferenceNow);
      expect(range.label).toBe("Today");
      expect(range.start.getHours()).toBe(0);
      expect(range.start.getMinutes()).toBe(0);
      expect(range.start.getSeconds()).toBe(0);
      expect(range.end.getHours()).toBe(23);
      expect(range.end.getMinutes()).toBe(59);
      expect(range.end.getSeconds()).toBe(59);
    });

    it("resolves LAST_7_DAYS correctly spanning exactly 7 days", () => {
      const range = resolveDateRange("LAST_7_DAYS", null, null, fixedReferenceNow);
      expect(range.label).toBe("Last 7 Days");
      const diffMs = range.end.getTime() - range.start.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(7);
    });

    it("resolves LAST_30_DAYS correctly spanning exactly 30 days", () => {
      const range = resolveDateRange("LAST_30_DAYS", null, null, fixedReferenceNow);
      expect(range.label).toBe("Last 30 Days");
      const diffMs = range.end.getTime() - range.start.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(30);
    });

    it("resolves CURRENT_MONTH starting at 1st and ending at last day of the month", () => {
      const range = resolveDateRange("CURRENT_MONTH", null, null, fixedReferenceNow);
      expect(range.start.getDate()).toBe(1);
      expect(range.start.getMonth()).toBe(fixedReferenceNow.getMonth());
      expect(range.end.getMonth()).toBe(fixedReferenceNow.getMonth());
      expect(range.label).toContain("2026");
    });

    it("resolves PREVIOUS_MONTH starting at 1st and ending on last day of previous month", () => {
      const range = resolveDateRange("PREVIOUS_MONTH", null, null, fixedReferenceNow);
      expect(range.start.getDate()).toBe(1);
      expect(range.start.getMonth()).toBe(fixedReferenceNow.getMonth() - 1);
    });

    it("resolves CUSTOM range accurately from input strings", () => {
      const range = resolveDateRange(
        "CUSTOM",
        "2026-05-01",
        "2026-05-15",
        fixedReferenceNow
      );
      expect(range.start.getFullYear()).toBe(2026);
      expect(range.start.getMonth()).toBe(4); // May is index 4
      expect(range.start.getDate()).toBe(1);
      expect(range.end.getDate()).toBe(15);
      expect(range.label).toContain("2026");
    });
  });

  // ============================================================================
  // 2. FINANCIAL INTELLIGENCE & P&L CALCULATIONS
  // ============================================================================
  describe("Financial Intelligence & Profit and Loss", () => {
    it("strictly separates invoiced billings from cash collected and accounts for refunds & expenses", async () => {
      const range = resolveDateRange("LAST_30_DAYS", null, null, fixedReferenceNow);

      // Invoices issued: $5,000 total billings
      vi.spyOn(db.invoice, "findMany").mockImplementation(((args: any) => {
        // Pending invoices for outstanding dues calculation
        if (args.where?.status?.in) {
          return Promise.resolve([
            { totalAmount: 1000, paidAmount: 400 }, // 600 due
            { totalAmount: 500, paidAmount: 0 },    // 500 due
          ] as any);
        }
        return Promise.resolve([
          { id: "inv-1", invoiceNumber: "INV-001", totalAmount: 3000, paidAmount: 3000, status: "PAID" },
          { id: "inv-2", invoiceNumber: "INV-002", totalAmount: 2000, paidAmount: 1500, status: "PARTIALLY_PAID" },
        ] as any);
      }) as any);

      // Payments collected: $4,500 actual cash/UPI
      vi.spyOn(db.payment, "findMany").mockResolvedValue([
        { id: "pay-1", amount: 2500, method: "UPI", receivedAt: new Date() },
        { id: "pay-2", amount: 1200, method: "CASH", receivedAt: new Date() },
        { id: "pay-3", amount: 800, method: "UPI", receivedAt: new Date() },
      ] as any);

      // Approved refunds: $300 refund
      vi.spyOn(db.adjustmentOrRefund, "findMany").mockImplementation(((args: any) => {
        if (args.where?.type === "REFUND") {
          return Promise.resolve([{ id: "ref-1", amount: 300 }] as any);
        }
        return Promise.resolve([{ id: "adj-1", amount: 50 }] as any); // adjustments
      }) as any);

      // Operating expenses: $1,400 expenses
      vi.spyOn(db.expense, "findMany").mockResolvedValue([
        { id: "exp-1", amount: 1000, category: { name: "Rent" } },
        { id: "exp-2", amount: 400, category: { name: "Electricity" } },
      ] as any);

      const fin = await getFinancialAnalytics(ownerAlphaContext, range);

      // 1. Invoiced Amount = 3000 + 2000 = 5000
      expect(fin.invoicedAmount).toBe(5000);

      // 2. Payments Collected = 2500 + 1200 + 800 = 4500
      expect(fin.paymentsCollected).toBe(4500);

      // 3. Refunds = 300
      expect(fin.totalRefunds).toBe(300);

      // 4. Net Revenue = Payments Collected (4500) - Refunds (300) = 4200
      expect(fin.netRevenue).toBe(4200);

      // 5. Total Expenses = 1000 + 400 = 1400
      expect(fin.totalExpenses).toBe(1400);

      // 6. Net Operating Income = Net Revenue (4200) - Expenses (1400) = 2800
      expect(fin.netOperatingIncome).toBe(2800);

      // 7. Outstanding Dues = (1000 - 400) + (500 - 0) = 1100
      expect(fin.totalOutstandingDues).toBe(1100);

      // 8. Payment Method Breakdown
      expect(fin.paymentMethodBreakdown).toEqual([
        { method: "UPI", total: 3300, count: 2 },
        { method: "CASH", total: 1200, count: 1 },
      ]);

      // 9. Expense Category Breakdown
      expect(fin.expenseCategoryBreakdown).toEqual([
        { category: "Rent", amount: 1000 },
        { category: "Electricity", amount: 400 },
      ]);
    });
  });

  // ============================================================================
  // 3. MEMBERSHIP GROWTH & PLAN DISTRIBUTION
  // ============================================================================
  describe("Membership Growth & Retention Analytics", () => {
    it("calculates active, inactive, new member joins, renewals, and plan breakdown", async () => {
      const range = resolveDateRange("LAST_30_DAYS", null, null, fixedReferenceNow);

      vi.spyOn(db.member, "count").mockImplementation(((args: any) => {
        if (args.where?.status === "ACTIVE") return Promise.resolve(45);
        return Promise.resolve(50); // total members
      }) as any);

      vi.spyOn(db.membership, "count").mockResolvedValue(5); // expired

      // Memberships created in period: 2 members (1 new, 1 renewal)
      vi.spyOn(db.membership, "findMany").mockResolvedValue([
        { id: "ms-1", memberId: "mem-new", createdAt: new Date(), planId: "plan-gold" },
        { id: "ms-2", memberId: "mem-returning", createdAt: new Date(), planId: "plan-silver" },
      ] as any);

      vi.spyOn(db.membershipPlan, "findMany").mockResolvedValue([
        { id: "plan-gold", name: "Gold Annual", price: 600 },
        { id: "plan-silver", name: "Silver Monthly", price: 60 },
      ] as any);

      // Group by plan
      vi.spyOn(db.membership, "groupBy").mockImplementation(((args: any) => {
        if (args.by?.[0] === "planId") {
          return Promise.resolve([
            { planId: "plan-gold", _count: { id: 30 } },
            { planId: "plan-silver", _count: { id: 15 } },
          ] as any);
        }
        if (args.by?.[0] === "memberId") {
          return Promise.resolve([
            { memberId: "mem-new", _count: { id: 1 } },
            { memberId: "mem-returning", _count: { id: 3 } }, // previously had 3 memberships -> renewal!
          ] as any);
        }
        return Promise.resolve([]);
      }) as any);

      const mem = await getMembershipAnalytics(ownerAlphaContext, range);

      expect(mem.totalMembers).toBe(50);
      expect(mem.activeMembers).toBe(45);
      expect(mem.inactiveMembers).toBe(5);
      expect(mem.expiredMemberships).toBe(5);
      expect(mem.newMemberships).toBe(1);
      expect(mem.renewals).toBe(1);
      expect(mem.totalJoinedInRange).toBe(2);
      expect(mem.planDistribution).toEqual([
        { planId: "plan-gold", planName: "Gold Annual", activeCount: 30 },
        { planId: "plan-silver", planName: "Silver Monthly", activeCount: 15 },
      ]);
    });
  });

  // ============================================================================
  // 4. ATTENDANCE & TRAFFIC PATTERNS
  // ============================================================================
  describe("Attendance & Peak Hours Analytics", () => {
    it("computes daily trends, unique visitors, hourly distribution, and peak hours", async () => {
      const range = resolveDateRange("LAST_7_DAYS", null, null, fixedReferenceNow);

      const checkIn1 = new Date(fixedReferenceNow);
      checkIn1.setHours(8, 15, 0); // 8 AM

      const checkIn2 = new Date(fixedReferenceNow);
      checkIn2.setHours(8, 45, 0); // 8 AM

      const checkIn3 = new Date(fixedReferenceNow);
      checkIn3.setHours(18, 30, 0); // 6 PM (18:00)

      vi.spyOn(db.attendanceRecord, "findMany").mockResolvedValue([
        { id: "att-1", memberId: "mem-1", checkInTime: checkIn1 },
        { id: "att-2", memberId: "mem-2", checkInTime: checkIn2 },
        { id: "att-3", memberId: "mem-1", checkInTime: checkIn3 }, // mem-1 attended twice
      ] as any);

      const att = await getAttendanceAnalytics(ownerAlphaContext, range);

      expect(att.totalCheckIns).toBe(3);
      expect(att.uniqueAttendees).toBe(2);
      expect(att.attendanceTrends.length).toBeGreaterThanOrEqual(7);

      // Hourly distribution checks
      const hour8 = att.hourlyDistribution.find((h) => h.hour === 8);
      expect(hour8?.checkIns).toBe(2);

      const hour18 = att.hourlyDistribution.find((h) => h.hour === 18);
      expect(hour18?.checkIns).toBe(1);

      // Peak hour should be 08:00
      expect(att.peakHours[0].hour).toBe(8);
      expect(att.peakHours[0].count).toBe(2);

      // Frequency breakdown: 1 member attended once, 1 member attended twice (both in visits1to2)
      expect(att.frequencyBreakdown.visits1to2).toBe(2);
    });
  });

  // ============================================================================
  // 5. CRM & LEADS ANALYTICS
  // ============================================================================
  describe("CRM & Lead Conversion Analytics", () => {
    it("calculates lead conversion rate and source distribution without division-by-zero errors", async () => {
      const range = resolveDateRange("LAST_30_DAYS", null, null, fixedReferenceNow);

      // 4 leads: 2 converted, 1 lost, 1 active
      vi.spyOn(db.lead, "findMany").mockResolvedValue([
        { id: "l-1", source: "INSTAGRAM", stage: "CONVERTED" },
        { id: "l-2", source: "INSTAGRAM", stage: "CONVERTED" },
        { id: "l-3", source: "WEBSITE", stage: "LOST" },
        { id: "l-4", source: "WALK_IN", stage: "CONTACTED" },
      ] as any);

      vi.spyOn(db.lead, "groupBy").mockResolvedValue([
        { stage: "CONVERTED", _count: { id: 10 } },
        { stage: "CONTACTED", _count: { id: 5 } },
        { stage: "LOST", _count: { id: 3 } },
      ] as any);

      const crm = await getCrmAnalytics(ownerAlphaContext, range);

      expect(crm.totalEnquiries).toBe(4);
      expect(crm.convertedLeads).toBe(2);
      expect(crm.lostLeads).toBe(1);
      expect(crm.activeLeads).toBe(1);
      // Conversion rate = 2 / 4 * 100 = 50.0%
      expect(crm.conversionRate).toBe(50);

      // Instagram source: 2 leads, 2 converted -> 100%
      const ig = crm.enquirySources.find((s) => s.source === "INSTAGRAM");
      expect(ig?.count).toBe(2);
      expect(ig?.converted).toBe(2);
      expect(ig?.conversionRate).toBe(100);
    });

    it("handles zero inquiries safely without NaN", async () => {
      const range = resolveDateRange("TODAY", null, null, fixedReferenceNow);

      vi.spyOn(db.lead, "findMany").mockResolvedValue([]);
      vi.spyOn(db.lead, "groupBy").mockResolvedValue([]);

      const crm = await getCrmAnalytics(ownerAlphaContext, range);

      expect(crm.totalEnquiries).toBe(0);
      expect(crm.conversionRate).toBe(0);
      expect(crm.enquirySources).toEqual([]);
    });
  });

  // ============================================================================
  // 6. OPERATIONS & CAPACITY UTILIZATION
  // ============================================================================
  describe("Operations, Classes & Inventory Analytics", () => {
    it("calculates class capacity utilization and flags low-stock items", async () => {
      const range = resolveDateRange("LAST_30_DAYS", null, null, fixedReferenceNow);

      // Class bookings: 3 total (2 attended, 1 cancelled)
      vi.spyOn(db.classBooking, "findMany").mockResolvedValue([
        { id: "b-1", status: "ATTENDED" },
        { id: "b-2", status: "ATTENDED" },
        { id: "b-3", status: "CANCELLED" },
      ] as any);

      // Schedules: total capacity 50, booked 40
      vi.spyOn(db.classSchedule, "findMany").mockResolvedValue([
        { id: "s-1", capacity: 30, bookedCount: 25 },
        { id: "s-2", capacity: 20, bookedCount: 15 },
      ] as any);

      // Stock movements
      vi.spyOn(db.stockMovement, "groupBy").mockResolvedValue([
        { type: "SALE", _sum: { quantity: 15 }, _count: { id: 10 } },
        { type: "PURCHASE", _sum: { quantity: 50 }, _count: { id: 2 } },
      ] as any);

      // Inventory items: 1 below reorder point of 5
      vi.spyOn(db.inventoryItem, "findMany").mockResolvedValue([
        { id: "item-1", name: "Whey Protein", sku: "WHEY-1", currentStock: 2, reorderPoint: 5 },
        { id: "item-2", name: "Creatine", sku: "CREA-1", currentStock: 20, reorderPoint: 5 },
      ] as any);

      const ops = await getOperationsAnalytics(ownerAlphaContext, range);

      expect(ops.totalBookings).toBe(3);
      expect(ops.attendedBookings).toBe(2);
      expect(ops.cancelledBookings).toBe(1);
      expect(ops.totalClassCapacity).toBe(50);
      expect(ops.totalClassBooked).toBe(40);
      // Booking utilization = 40 / 50 * 100 = 80.0%
      expect(ops.bookingUtilization).toBe(80);

      // Stock movements
      expect(ops.stockMovements).toHaveLength(2);

      // Low stock item detection
      expect(ops.lowStockCount).toBe(1);
      expect(ops.lowStockItems[0].sku).toBe("WHEY-1");
    });
  });

  // ============================================================================
  // 7. CSV EXPORT INTEGRITY
  // ============================================================================
  describe("CSV Export Formatting & Security", () => {
    it("generates correct CSV headers and data for FINANCIAL section", async () => {
      vi.spyOn(db.gym, "findUnique").mockResolvedValue(gymAlpha as any);
      vi.spyOn(db.invoice, "findMany").mockResolvedValue([]);
      vi.spyOn(db.payment, "findMany").mockResolvedValue([
        { id: "p-1", amount: 1500, method: "UPI", receivedAt: new Date() },
      ] as any);
      vi.spyOn(db.adjustmentOrRefund, "findMany").mockResolvedValue([]);
      vi.spyOn(db.expense, "findMany").mockResolvedValue([
        { id: "e-1", amount: 500, category: { name: "Marketing" } },
      ] as any);
      vi.spyOn(db.member, "count").mockResolvedValue(0);
      vi.spyOn(db.membership, "count").mockResolvedValue(0);
      vi.spyOn(db.membership, "findMany").mockResolvedValue([]);
      vi.spyOn(db.membershipPlan, "findMany").mockResolvedValue([]);
      vi.spyOn(db.membership, "groupBy").mockResolvedValue([]);
      vi.spyOn(db.attendanceRecord, "findMany").mockResolvedValue([]);
      vi.spyOn(db.lead, "findMany").mockResolvedValue([]);
      vi.spyOn(db.lead, "groupBy").mockResolvedValue([]);
      vi.spyOn(db.classBooking, "findMany").mockResolvedValue([]);
      vi.spyOn(db.classSchedule, "findMany").mockResolvedValue([]);
      vi.spyOn(db.stockMovement, "groupBy").mockResolvedValue([]);
      vi.spyOn(db.inventoryItem, "findMany").mockResolvedValue([]);

      const result = await generateReportCsv(
        ownerAlphaContext,
        { preset: "LAST_30_DAYS", section: "FINANCIAL" },
        "FINANCIAL"
      );

      expect(result.filename).toContain("alpha_power_gym-financial");
      expect(result.filename).toContain(".csv");
      expect(result.content).toContain(`"FIXIA GymOS - Financial Performance Report"`);
      expect(result.content).toContain(`"Gym:","Alpha Power Gym"`);
      expect(result.content).toContain(`"Gross Payments Collected","1500"`);
      expect(result.content).toContain(`"Operating Expenses","500"`);
      expect(result.content).toContain(`"Net Operating Income (P&L)","1000"`);
      expect(result.content).toContain(`"UPI","1500","1"`);
    });

    it("generates comprehensive master report when section is ALL", async () => {
      vi.spyOn(db.gym, "findUnique").mockResolvedValue(gymAlpha as any);
      vi.spyOn(db.invoice, "findMany").mockResolvedValue([]);
      vi.spyOn(db.payment, "findMany").mockResolvedValue([]);
      vi.spyOn(db.adjustmentOrRefund, "findMany").mockResolvedValue([]);
      vi.spyOn(db.expense, "findMany").mockResolvedValue([]);
      vi.spyOn(db.member, "count").mockResolvedValue(10);
      vi.spyOn(db.membership, "count").mockResolvedValue(0);
      vi.spyOn(db.membership, "findMany").mockResolvedValue([]);
      vi.spyOn(db.membershipPlan, "findMany").mockResolvedValue([]);
      vi.spyOn(db.membership, "groupBy").mockResolvedValue([]);
      vi.spyOn(db.attendanceRecord, "findMany").mockResolvedValue([]);
      vi.spyOn(db.lead, "findMany").mockResolvedValue([]);
      vi.spyOn(db.lead, "groupBy").mockResolvedValue([]);
      vi.spyOn(db.classBooking, "findMany").mockResolvedValue([]);
      vi.spyOn(db.classSchedule, "findMany").mockResolvedValue([]);
      vi.spyOn(db.stockMovement, "groupBy").mockResolvedValue([]);
      vi.spyOn(db.inventoryItem, "findMany").mockResolvedValue([]);

      const result = await generateReportCsv(
        staffAlphaContext,
        { preset: "TODAY", section: "ALL" },
        "ALL"
      );

      expect(result.filename).toContain("alpha_power_gym-report");
      expect(result.content).toContain(`"FIXIA GymOS - Comprehensive Executive Business Report"`);
      expect(result.content).toContain(`"SECTION 1: KEY PERFORMANCE INDICATORS"`);
      expect(result.content).toContain(`"SECTION 2: FINANCIAL BREAKDOWN"`);
      expect(result.content).toContain(`"SECTION 3: CRM PIPELINE"`);
      expect(result.content).toContain(`"SECTION 4: OPERATIONS & CLASSES"`);
    });
  });

  // ============================================================================
  // 8. TENANT ISOLATION & PERMISSION GUARDS
  // ============================================================================
  describe("Tenant Isolation & Role Authorization", () => {
    it("guarantees tenant isolation by passing gymId strictly into every Prisma query", async () => {
      const invoiceSpy = vi.spyOn(db.invoice, "findMany").mockResolvedValue([]);
      const paymentSpy = vi.spyOn(db.payment, "findMany").mockResolvedValue([]);
      const expenseSpy = vi.spyOn(db.expense, "findMany").mockResolvedValue([]);
      const refundSpy = vi.spyOn(db.adjustmentOrRefund, "findMany").mockResolvedValue([]);

      const range = resolveDateRange("TODAY", null, null, fixedReferenceNow);
      await getFinancialAnalytics(ownerAlphaContext, range);

      // Verify all where clauses have gymId === gymAlpha.id
      expect(invoiceSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ gymId: gymAlpha.id }),
        })
      );
      expect(paymentSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ gymId: gymAlpha.id }),
        })
      );
      expect(expenseSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ gymId: gymAlpha.id }),
        })
      );
      expect(refundSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ gymId: gymAlpha.id }),
        })
      );
    });

    it("allows STAFF to view reports and export CSV (REPORT_READ and REPORT_EXPORT)", async () => {
      vi.spyOn(db.gym, "findUnique").mockResolvedValue(gymAlpha as any);
      vi.spyOn(db.invoice, "findMany").mockResolvedValue([]);
      vi.spyOn(db.payment, "findMany").mockResolvedValue([]);
      vi.spyOn(db.adjustmentOrRefund, "findMany").mockResolvedValue([]);
      vi.spyOn(db.expense, "findMany").mockResolvedValue([]);
      vi.spyOn(db.member, "count").mockResolvedValue(0);
      vi.spyOn(db.membership, "count").mockResolvedValue(0);
      vi.spyOn(db.membership, "findMany").mockResolvedValue([]);
      vi.spyOn(db.membershipPlan, "findMany").mockResolvedValue([]);
      vi.spyOn(db.membership, "groupBy").mockResolvedValue([]);
      vi.spyOn(db.attendanceRecord, "findMany").mockResolvedValue([]);
      vi.spyOn(db.lead, "findMany").mockResolvedValue([]);
      vi.spyOn(db.lead, "groupBy").mockResolvedValue([]);
      vi.spyOn(db.classBooking, "findMany").mockResolvedValue([]);
      vi.spyOn(db.classSchedule, "findMany").mockResolvedValue([]);
      vi.spyOn(db.stockMovement, "groupBy").mockResolvedValue([]);
      vi.spyOn(db.inventoryItem, "findMany").mockResolvedValue([]);

      const rep = await getComprehensiveBusinessReport(staffAlphaContext, {
        preset: "TODAY",
        section: "ALL",
      });

      expect(rep.gym.name).toBe("Alpha Power Gym");
    });

    it("strictly blocks MEMBER role from reading reports (InsufficientPermissionError)", async () => {
      const range = resolveDateRange("TODAY", null, null, fixedReferenceNow);

      await expect(getFinancialAnalytics(memberAlphaContext, range)).rejects.toThrow(
        InsufficientPermissionError
      );
      await expect(getMembershipAnalytics(memberAlphaContext, range)).rejects.toThrow(
        InsufficientPermissionError
      );
      await expect(getAttendanceAnalytics(memberAlphaContext, range)).rejects.toThrow(
        InsufficientPermissionError
      );
      await expect(getCrmAnalytics(memberAlphaContext, range)).rejects.toThrow(
        InsufficientPermissionError
      );
      await expect(getOperationsAnalytics(memberAlphaContext, range)).rejects.toThrow(
        InsufficientPermissionError
      );
      await expect(
        generateReportCsv(
          memberAlphaContext,
          { preset: "TODAY", section: "ALL" },
          "ALL"
        )
      ).rejects.toThrow(InsufficientPermissionError);
    });
  });

  // ============================================================================
  // 9. EMPTY DATABASE FIXTURES
  // ============================================================================
  describe("Empty Gym Database Fixtures", () => {
    it("handles an entirely blank gym with 0 records without crashing or returning NaN", async () => {
      vi.spyOn(db.gym, "findUnique").mockResolvedValue(gymBeta as any);
      vi.spyOn(db.invoice, "findMany").mockResolvedValue([]);
      vi.spyOn(db.payment, "findMany").mockResolvedValue([]);
      vi.spyOn(db.adjustmentOrRefund, "findMany").mockResolvedValue([]);
      vi.spyOn(db.expense, "findMany").mockResolvedValue([]);
      vi.spyOn(db.member, "count").mockResolvedValue(0);
      vi.spyOn(db.membership, "count").mockResolvedValue(0);
      vi.spyOn(db.membership, "findMany").mockResolvedValue([]);
      vi.spyOn(db.membershipPlan, "findMany").mockResolvedValue([]);
      vi.spyOn(db.membership, "groupBy").mockResolvedValue([]);
      vi.spyOn(db.attendanceRecord, "findMany").mockResolvedValue([]);
      vi.spyOn(db.lead, "findMany").mockResolvedValue([]);
      vi.spyOn(db.lead, "groupBy").mockResolvedValue([]);
      vi.spyOn(db.classBooking, "findMany").mockResolvedValue([]);
      vi.spyOn(db.classSchedule, "findMany").mockResolvedValue([]);
      vi.spyOn(db.stockMovement, "groupBy").mockResolvedValue([]);
      vi.spyOn(db.inventoryItem, "findMany").mockResolvedValue([]);

      const ownerBetaContext = createTenantContext({
        gymId: gymBeta.id,
        userId: "owner-beta",
        userEmail: "owner@betagym.com",
        role: GymRole.OWNER,
      });

      const report = await getComprehensiveBusinessReport(ownerBetaContext, {
        preset: "TODAY",
        section: "ALL",
      });

      expect(report.gym.name).toBe("Beta Fitness Club");
      expect(report.gym.currency).toBe("EUR");
      expect(report.financial.invoicedAmount).toBe(0);
      expect(report.financial.paymentsCollected).toBe(0);
      expect(report.financial.netRevenue).toBe(0);
      expect(report.financial.totalExpenses).toBe(0);
      expect(report.financial.netOperatingIncome).toBe(0);
      expect(report.membership.totalMembers).toBe(0);
      expect(report.membership.activeMembers).toBe(0);
      expect(report.attendance.totalCheckIns).toBe(0);
      expect(report.attendance.averageDailyAttendance).toBe(0);
      expect(report.crm.totalEnquiries).toBe(0);
      expect(report.crm.conversionRate).toBe(0);
      expect(report.operations.totalBookings).toBe(0);
      expect(report.operations.bookingUtilization).toBe(0);
      expect(report.operations.lowStockCount).toBe(0);
    });
  });
});
