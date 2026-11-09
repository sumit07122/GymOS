/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDashboardMetrics } from "@/lib/services/dashboard.service";
import { createTenantContext } from "@/lib/tenant/context";
import { db } from "@/lib/db";
import { GymRole } from "@prisma/client";

describe("Milestone M05: Dashboard Metrics Service", () => {
  const mockTenantContext = createTenantContext({
    gymId: "gym-alpha-123",
    userId: "owner-usr-456",
    role: GymRole.OWNER,
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("handles zero-data state cleanly for newly registered gyms", async () => {
    // Mock gym profile
    vi.spyOn(db.gym, "findUnique").mockResolvedValue({
      id: "gym-alpha-123",
      currency: "USD",
    } as any);

    // Mock counts and aggregations returning 0
    vi.spyOn(db.member, "count").mockResolvedValue(0);
    vi.spyOn(db.membership, "count").mockResolvedValue(0);
    vi.spyOn(db.attendanceRecord, "count").mockResolvedValue(0);

    vi.spyOn(db.invoice, "aggregate").mockResolvedValue({
      _sum: { dueAmount: null },
    } as any);

    vi.spyOn(db.payment, "aggregate").mockResolvedValue({
      _sum: { amount: null },
    } as any);

    vi.spyOn(db.payment, "findMany").mockResolvedValue([]);
    vi.spyOn(db.member, "findMany").mockResolvedValue([]);
    vi.spyOn(db.attendanceRecord, "findMany").mockResolvedValue([]);

    const metrics = await getDashboardMetrics(mockTenantContext, "30d");

    expect(metrics.totalMembers).toBe(0);
    expect(metrics.activeMembers).toBe(0);
    expect(metrics.expiringMemberships).toBe(0);
    expect(metrics.todayAttendance).toBe(0);
    expect(metrics.pendingDues).toBe(0);
    expect(metrics.periodRevenue).toBe(0);
    expect(metrics.currency).toBe("USD");
    expect(metrics.recentPayments).toEqual([]);
    expect(metrics.recentMembers).toEqual([]);
    expect(metrics.attendanceTrends).toHaveLength(7);
    metrics.attendanceTrends.forEach((trend) => {
      expect(trend.count).toBe(0);
    });
  });

  it("accurately returns aggregated operational and financial metrics", async () => {
    vi.spyOn(db.gym, "findUnique").mockResolvedValue({
      id: "gym-alpha-123",
      currency: "EUR",
    } as any);

    // Mock member counts: 150 total, 120 active
    vi.spyOn(db.member as any, "count").mockImplementation(async (args?: any) => {
      if (args?.where?.status === "ACTIVE") return 120;
      return 150;
    });

    // Mock 8 expiring memberships
    vi.spyOn(db.membership, "count").mockResolvedValue(8);

    // Mock 42 check-ins today
    vi.spyOn(db.attendanceRecord, "count").mockResolvedValue(42);

    // Mock financial aggregations: €1,250 dues pending, €9,800 revenue collected
    vi.spyOn(db.invoice, "aggregate").mockResolvedValue({
      _sum: { dueAmount: 1250 },
    } as any);

    vi.spyOn(db.payment, "aggregate").mockResolvedValue({
      _sum: { amount: 9800 },
    } as any);

    const todayStr = new Date().toISOString().split("T")[0];

    // Mock recent payments
    vi.spyOn(db.payment, "findMany").mockResolvedValue([
      {
        id: "pay-1",
        amount: 150,
        currency: "EUR",
        status: "COMPLETED",
        method: "CREDIT_CARD",
        receivedAt: new Date(),
        member: {
          firstName: "Marcus",
          lastName: "Aurelius",
          email: "marcus@rome.com",
        },
      },
    ] as any);

    // Mock recent members
    vi.spyOn(db.member, "findMany").mockResolvedValue([
      {
        id: "mem-1",
        firstName: "Marcus",
        lastName: "Aurelius",
        email: "marcus@rome.com",
        status: "ACTIVE",
        createdAt: new Date(),
      },
    ] as any);

    // Mock attendance trends: 3 check-ins today
    vi.spyOn(db.attendanceRecord, "findMany").mockResolvedValue([
      { checkInTime: new Date() },
      { checkInTime: new Date() },
      { checkInTime: new Date() },
    ] as any);

    const metrics = await getDashboardMetrics(mockTenantContext, "30d");

    expect(metrics.totalMembers).toBe(150);
    expect(metrics.activeMembers).toBe(120);
    expect(metrics.expiringMemberships).toBe(8);
    expect(metrics.todayAttendance).toBe(42);
    expect(metrics.pendingDues).toBe(1250);
    expect(metrics.periodRevenue).toBe(9800);
    expect(metrics.currency).toBe("EUR");

    expect(metrics.recentPayments).toHaveLength(1);
    expect(metrics.recentPayments[0].memberName).toBe("Marcus Aurelius");
    expect(metrics.recentPayments[0].amount).toBe(150);

    expect(metrics.recentMembers).toHaveLength(1);
    expect(metrics.recentMembers[0].firstName).toBe("Marcus");

    // Check that today's trend slot reflects the 3 check-ins
    const todayTrend = metrics.attendanceTrends.find((t) => t.date === todayStr);
    expect(todayTrend?.count).toBe(3);
  });

  it("strictly enforces tenant scoping across all database queries", async () => {
    vi.spyOn(db.gym, "findUnique").mockResolvedValue({
      id: "gym-alpha-123",
      currency: "USD",
    } as any);

    const memberCountSpy = vi.spyOn(db.member, "count").mockResolvedValue(0);
    const membershipCountSpy = vi.spyOn(db.membership, "count").mockResolvedValue(0);
    const attendanceCountSpy = vi.spyOn(db.attendanceRecord, "count").mockResolvedValue(0);
    const invoiceAggSpy = vi.spyOn(db.invoice, "aggregate").mockResolvedValue({ _sum: {} } as any);
    const paymentAggSpy = vi.spyOn(db.payment, "aggregate").mockResolvedValue({ _sum: {} } as any);
    const paymentFindSpy = vi.spyOn(db.payment, "findMany").mockResolvedValue([]);
    const memberFindSpy = vi.spyOn(db.member, "findMany").mockResolvedValue([]);
    const attendanceFindSpy = vi.spyOn(db.attendanceRecord, "findMany").mockResolvedValue([]);

    await getDashboardMetrics(mockTenantContext, "7d");

    // Verify all queries passed gymId: "gym-alpha-123"
    expect(memberCountSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ gymId: "gym-alpha-123" }),
      })
    );

    expect(membershipCountSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ gymId: "gym-alpha-123" }),
      })
    );

    expect(attendanceCountSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ gymId: "gym-alpha-123" }),
      })
    );

    expect(invoiceAggSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ gymId: "gym-alpha-123" }),
      })
    );

    expect(paymentAggSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ gymId: "gym-alpha-123" }),
      })
    );

    expect(paymentFindSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ gymId: "gym-alpha-123" }),
      })
    );

    expect(memberFindSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ gymId: "gym-alpha-123" }),
      })
    );

    expect(attendanceFindSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ gymId: "gym-alpha-123" }),
      })
    );
  });
});

