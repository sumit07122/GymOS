import { db } from "@/lib/db";
import { TenantContext, assertPermission } from "@/lib/tenant/context";
import {
  ReportFilterInput,
  resolveDateRange,
  ResolvedDateRange,
} from "@/lib/validations/report";

// ==============================================================================
// FIXIA GymOS — Reports & Business Analytics Service (M18)
// ==============================================================================
// INVARIANTS:
// 1. Strict Tenant Isolation: All database aggregates are strictly scoped to ctx.gymId.
// 2. Real Database Records: Never return hardcoded or fabricated statistics.
// 3. Financial Integrity:
//    - Invoiced revenue represents billings issued.
//    - Payments collected represents actual cash/UPI/gateway funds received.
//    - Net Revenue = Payments Collected - Approved Refunds.
//    - Net Operating Income (P&L) = Net Revenue - Operating Expenses.
// ==============================================================================

/**
 * 1. Membership Analytics
 */
export async function getMembershipAnalytics(
  ctx: TenantContext,
  range: ResolvedDateRange
) {
  assertPermission(ctx, "REPORT_READ");

  const [
    totalMembers,
    activeMembers,
    expiredMembershipsCount,
    membershipsInRange,
    allPlans,
    planCounts,
  ] = await Promise.all([
    // Total registered members in gym
    db.member.count({
      where: { gymId: ctx.gymId },
    }),

    // Members with status ACTIVE
    db.member.count({
      where: { gymId: ctx.gymId, status: "ACTIVE" },
    }),

    // Expired memberships
    db.membership.count({
      where: {
        gymId: ctx.gymId,
        status: "EXPIRED",
      },
    }),

    // Memberships created / starting in date range
    db.membership.findMany({
      where: {
        gymId: ctx.gymId,
        createdAt: {
          gte: range.start,
          lte: range.end,
        },
      },
      select: {
        id: true,
        memberId: true,
        createdAt: true,
        planId: true,
      },
    }),

    // All active membership plans
    db.membershipPlan.findMany({
      where: { gymId: ctx.gymId, isArchived: false },
      select: { id: true, name: true, price: true },
    }),

    // Group memberships by plan
    db.membership.groupBy({
      by: ["planId"],
      where: {
        gymId: ctx.gymId,
        status: { in: ["ACTIVE", "FROZEN", "PAUSED"] },
      },
      _count: {
        id: true,
      },
    }),
  ]);

  // Identify renewals vs new member joins in date range
  const memberIdsInRange = Array.from(new Set(membershipsInRange.map((m) => m.memberId)));
  
  // Count how many total memberships each member has had
  const memberHistoryCounts = await db.membership.groupBy({
    by: ["memberId"],
    where: {
      gymId: ctx.gymId,
      memberId: { in: memberIdsInRange },
    },
    _count: { id: true },
  });

  const memberHistoryMap = new Map<string, number>();
  memberHistoryCounts.forEach((c) => {
    const count = typeof c._count === "object" && c._count !== null && "id" in c._count ? Number(c._count.id) : 1;
    memberHistoryMap.set(c.memberId, count);
  });

  let newMemberships = 0;
  let renewals = 0;

  for (const m of membershipsInRange) {
    const totalCount = memberHistoryMap.get(m.memberId) || 1;
    if (totalCount > 1) {
      renewals++;
    } else {
      newMemberships++;
    }
  }

  // Plan distribution mapping
  const planMap = new Map(allPlans.map((p) => [p.id, p.name]));
  const planDistribution = planCounts.map((pc) => ({
    planId: pc.planId,
    planName: planMap.get(pc.planId) || "Custom Plan",
    activeCount: typeof pc._count === "object" && pc._count !== null && "id" in pc._count ? Number(pc._count.id) : 0,
  }));

  return {
    totalMembers,
    activeMembers,
    inactiveMembers: Math.max(0, totalMembers - activeMembers),
    expiredMemberships: expiredMembershipsCount,
    newMemberships,
    renewals,
    totalJoinedInRange: membershipsInRange.length,
    planDistribution,
  };
}

/**
 * 2. Attendance Analytics
 */
export async function getAttendanceAnalytics(
  ctx: TenantContext,
  range: ResolvedDateRange
) {
  assertPermission(ctx, "REPORT_READ");

  const records = await db.attendanceRecord.findMany({
    where: {
      gymId: ctx.gymId,
      checkInTime: {
        gte: range.start,
        lte: range.end,
      },
    },
    select: {
      id: true,
      memberId: true,
      checkInTime: true,
    },
    orderBy: { checkInTime: "asc" },
  });

  const totalCheckIns = records.length;
  const uniqueMemberIds = new Set(records.map((r) => r.memberId));
  const uniqueAttendees = uniqueMemberIds.size;

  // Daily aggregate map (YYYY-MM-DD -> { checkIns, members: Set })
  const dailyMap = new Map<string, { checkIns: number; members: Set<string> }>();
  
  // 24-hour distribution (0 to 23)
  const hourlyCounts = new Array(24).fill(0);

  // Member visit count frequency (memberId -> visits)
  const memberVisits = new Map<string, number>();

  for (const r of records) {
    const dateKey = r.checkInTime.toISOString().split("T")[0];
    const existing = dailyMap.get(dateKey) || { checkIns: 0, members: new Set() };
    existing.checkIns++;
    existing.members.add(r.memberId);
    dailyMap.set(dateKey, existing);

    const hour = r.checkInTime.getHours();
    hourlyCounts[hour]++;

    memberVisits.set(r.memberId, (memberVisits.get(r.memberId) || 0) + 1);
  }

  // Continuous day-by-day trend list
  const attendanceTrends: Array<{ date: string; checkIns: number; uniqueMembers: number }> = [];
  const current = new Date(range.start);
  while (current <= range.end) {
    const key = current.toISOString().split("T")[0];
    const item = dailyMap.get(key);
    attendanceTrends.push({
      date: key,
      checkIns: item ? item.checkIns : 0,
      uniqueMembers: item ? item.members.size : 0,
    });
    current.setDate(current.getDate() + 1);
  }

  // Peak attendance period (top 3 peak hours)
  const peakHours = hourlyCounts
    .map((count, hour) => ({ hour, count, label: `${hour.toString().padStart(2, "0")}:00` }))
    .sort((a, b) => b.count - a.count);

  // Frequency brackets
  let visits1to2 = 0;
  let visits3to5 = 0;
  let visits6Plus = 0;

  for (const count of memberVisits.values()) {
    if (count <= 2) visits1to2++;
    else if (count <= 5) visits3to5++;
    else visits6Plus++;
  }

  return {
    totalCheckIns,
    uniqueAttendees,
    averageDailyAttendance:
      attendanceTrends.length > 0
        ? Math.round((totalCheckIns / attendanceTrends.length) * 10) / 10
        : 0,
    attendanceTrends,
    hourlyDistribution: hourlyCounts.map((count, hour) => ({
      hour,
      label: `${hour.toString().padStart(2, "0")}:00`,
      checkIns: count,
    })),
    peakHours: peakHours.slice(0, 3),
    frequencyBreakdown: {
      visits1to2,
      visits3to5,
      visits6Plus,
    },
  };
}

/**
 * 3. Financial Intelligence & P&L Analytics
 */
export async function getFinancialAnalytics(
  ctx: TenantContext,
  range: ResolvedDateRange
) {
  assertPermission(ctx, "REPORT_READ");

  const [invoices, payments, refunds, adjustments, expenses] = await Promise.all([
    // Invoices issued in range
    db.invoice.findMany({
      where: {
        gymId: ctx.gymId,
        createdAt: {
          gte: range.start,
          lte: range.end,
        },
      },
      select: {
        id: true,
        invoiceNumber: true,
        totalAmount: true,
        paidAmount: true,
        status: true,
      },
    }),

    // Payments collected in range
    db.payment.findMany({
      where: {
        gymId: ctx.gymId,
        status: "COMPLETED",
        receivedAt: {
          gte: range.start,
          lte: range.end,
        },
      },
      select: {
        id: true,
        amount: true,
        method: true,
        receivedAt: true,
      },
    }),

    // Refunds approved in range
    db.adjustmentOrRefund.findMany({
      where: {
        gymId: ctx.gymId,
        type: "REFUND",
        createdAt: {
          gte: range.start,
          lte: range.end,
        },
      },
      select: {
        id: true,
        amount: true,
      },
    }),

    // Adjustments / Credit notes in range
    db.adjustmentOrRefund.findMany({
      where: {
        gymId: ctx.gymId,
        type: { not: "REFUND" },
        createdAt: {
          gte: range.start,
          lte: range.end,
        },
      },
      select: {
        id: true,
        amount: true,
      },
    }),

    // Expenses incurred in range
    db.expense.findMany({
      where: {
        gymId: ctx.gymId,
        expenseDate: {
          gte: range.start,
          lte: range.end,
        },
      },
      include: {
        category: { select: { name: true } },
      },
    }),
  ]);

  // Outstanding dues across all unpaid/partially paid invoices for gym
  const allPendingInvoices = await db.invoice.findMany({
    where: {
      gymId: ctx.gymId,
      status: { in: ["ISSUED", "OVERDUE", "PARTIALLY_PAID"] },
    },
    select: {
      totalAmount: true,
      paidAmount: true,
    },
  });

  const totalOutstandingDues = allPendingInvoices.reduce(
    (acc, inv) => acc + Math.max(0, Number(inv.totalAmount) - Number(inv.paidAmount)),
    0
  );

  const invoicedAmount = invoices.reduce((acc, inv) => acc + Number(inv.totalAmount), 0);
  const paymentsCollected = payments.reduce((acc, p) => acc + Number(p.amount), 0);
  const totalRefunds = refunds.reduce((acc, r) => acc + Number(r.amount), 0);
  const totalAdjustments = adjustments.reduce((acc, a) => acc + Number(a.amount), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);

  // Net revenue accounting for refunds
  const netRevenue = Math.max(0, paymentsCollected - totalRefunds);
  // Net Operating Income (P&L)
  const netOperatingIncome = netRevenue - totalExpenses;

  // Breakdown by payment method
  const methodMap = new Map<string, { total: number; count: number }>();
  for (const p of payments) {
    const existing = methodMap.get(p.method) || { total: 0, count: 0 };
    existing.total += Number(p.amount);
    existing.count++;
    methodMap.set(p.method, existing);
  }

  const paymentMethodBreakdown = Array.from(methodMap.entries()).map(([method, data]) => ({
    method,
    total: Math.round(data.total * 100) / 100,
    count: data.count,
  }));

  // Breakdown by expense category
  const categoryMap = new Map<string, number>();
  for (const e of expenses) {
    const catName = e.category?.name || "General Operating";
    categoryMap.set(catName, (categoryMap.get(catName) || 0) + Number(e.amount));
  }

  const expenseCategoryBreakdown = Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category,
    amount: Math.round(amount * 100) / 100,
  }));

  return {
    invoicedAmount: Math.round(invoicedAmount * 100) / 100,
    paymentsCollected: Math.round(paymentsCollected * 100) / 100,
    totalRefunds: Math.round(totalRefunds * 100) / 100,
    totalAdjustments: Math.round(totalAdjustments * 100) / 100,
    netRevenue: Math.round(netRevenue * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netOperatingIncome: Math.round(netOperatingIncome * 100) / 100,
    totalOutstandingDues: Math.round(totalOutstandingDues * 100) / 100,
    paymentMethodBreakdown,
    expenseCategoryBreakdown,
  };
}

/**
 * 4. CRM & Leads Analytics
 */
export async function getCrmAnalytics(
  ctx: TenantContext,
  range: ResolvedDateRange
) {
  assertPermission(ctx, "REPORT_READ");

  const [leadsInRange, allLeads] = await Promise.all([
    db.lead.findMany({
      where: {
        gymId: ctx.gymId,
        createdAt: {
          gte: range.start,
          lte: range.end,
        },
      },
      select: {
        id: true,
        source: true,
        stage: true,
      },
    }),
    db.lead.groupBy({
      by: ["stage"],
      where: { gymId: ctx.gymId },
      _count: { id: true },
    }),
  ]);

  const totalEnquiries = leadsInRange.length;
  const convertedLeads = leadsInRange.filter((l) => l.stage === "CONVERTED").length;
  const lostLeads = leadsInRange.filter((l) => l.stage === "LOST").length;
  const activeLeads = leadsInRange.filter(
    (l) => l.stage !== "CONVERTED" && l.stage !== "LOST"
  ).length;

  const conversionRate =
    totalEnquiries > 0 ? Math.round((convertedLeads / totalEnquiries) * 1000) / 10 : 0;

  // Source breakdown
  const sourceMap = new Map<string, { total: number; converted: number }>();
  for (const l of leadsInRange) {
    const existing = sourceMap.get(l.source) || { total: 0, converted: 0 };
    existing.total++;
    if (l.stage === "CONVERTED") existing.converted++;
    sourceMap.set(l.source, existing);
  }

  const enquirySources = Array.from(sourceMap.entries()).map(([source, data]) => ({
    source,
    count: data.total,
    converted: data.converted,
    conversionRate:
      data.total > 0 ? Math.round((data.converted / data.total) * 1000) / 10 : 0,
  }));

  // Overall pipeline distribution
  const stageDistribution = allLeads.map((s) => ({
    stage: s.stage,
    count: s._count.id,
  }));

  return {
    totalEnquiries,
    convertedLeads,
    lostLeads,
    activeLeads,
    conversionRate,
    enquirySources,
    stageDistribution,
  };
}

/**
 * 5. Operations, Classes & Inventory Analytics
 */
export async function getOperationsAnalytics(
  ctx: TenantContext,
  range: ResolvedDateRange
) {
  assertPermission(ctx, "REPORT_READ");

  const [bookings, schedules, movements, lowStockItems] = await Promise.all([
    // Class bookings in range
    db.classBooking.findMany({
      where: {
        gymId: ctx.gymId,
        bookedAt: {
          gte: range.start,
          lte: range.end,
        },
      },
      select: {
        id: true,
        status: true,
      },
    }),

    // Class schedules in range
    db.classSchedule.findMany({
      where: {
        gymId: ctx.gymId,
        startTime: {
          gte: range.start,
          lte: range.end,
        },
      },
      select: {
        id: true,
        capacity: true,
        bookedCount: true,
      },
    }),

    // Stock movements in range
    db.stockMovement.groupBy({
      by: ["type"],
      where: {
        gymId: ctx.gymId,
        createdAt: {
          gte: range.start,
          lte: range.end,
        },
      },
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
    }),

    // Inventory items at or below reorder threshold
    db.inventoryItem.findMany({
      where: {
        gymId: ctx.gymId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        currentStock: true,
        reorderPoint: true,
      },
    }),
  ]);

  const totalBookings = bookings.length;
  const attendedBookings = bookings.filter((b) => b.status === "ATTENDED").length;
  const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED").length;

  const totalClassCapacity = schedules.reduce((acc, s) => acc + s.capacity, 0);
  const totalClassBooked = schedules.reduce((acc, s) => acc + s.bookedCount, 0);

  const bookingUtilization =
    totalClassCapacity > 0
      ? Math.round((totalClassBooked / totalClassCapacity) * 1000) / 10
      : 0;

  const stockMovements = movements.map((m) => ({
    type: m.type,
    quantity: Math.abs(m._sum.quantity || 0),
    transactions: m._count.id,
  }));

  const lowStockAlerts = lowStockItems.filter(
    (item) => item.reorderPoint !== null && item.currentStock <= item.reorderPoint
  );

  return {
    totalBookings,
    attendedBookings,
    cancelledBookings,
    totalClassCapacity,
    totalClassBooked,
    bookingUtilization,
    stockMovements,
    lowStockCount: lowStockAlerts.length,
    lowStockItems: lowStockAlerts.slice(0, 5),
  };
}

/**
 * Master Comprehensive Business Report
 */
export async function getComprehensiveBusinessReport(
  ctx: TenantContext,
  filter: ReportFilterInput
) {
  assertPermission(ctx, "REPORT_READ");

  const gym = await db.gym.findUnique({
    where: { id: ctx.gymId },
    select: {
      id: true,
      name: true,
      currency: true,
      timezone: true,
    },
  });

  const range = resolveDateRange(
    filter.preset,
    filter.startDate,
    filter.endDate
  );

  const [membership, attendance, financial, crm, operations] = await Promise.all([
    getMembershipAnalytics(ctx, range),
    getAttendanceAnalytics(ctx, range),
    getFinancialAnalytics(ctx, range),
    getCrmAnalytics(ctx, range),
    getOperationsAnalytics(ctx, range),
  ]);

  return {
    gym: {
      name: gym?.name || "Fitness Center",
      currency: gym?.currency || "USD",
      timezone: gym?.timezone || "UTC",
    },
    filter: {
      preset: filter.preset,
      label: range.label,
      startDate: range.start.toISOString(),
      endDate: range.end.toISOString(),
    },
    membership,
    attendance,
    financial,
    crm,
    operations,
  };
}

/**
 * Generates structured CSV string based on selected report section.
 */
export async function generateReportCsv(
  ctx: TenantContext,
  filter: ReportFilterInput,
  section = "ALL"
): Promise<{ filename: string; content: string }> {
  assertPermission(ctx, "REPORT_EXPORT");

  const data = await getComprehensiveBusinessReport(ctx, filter);
  const dateStr = new Date().toISOString().split("T")[0];
  const safeGym = data.gym.name.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();

  let csvRows: string[] = [];
  let filename = `gymos-${safeGym}-report-${dateStr}.csv`;

  if (section === "FINANCIAL") {
    filename = `gymos-${safeGym}-financial-${dateStr}.csv`;
    csvRows = [
      `"FIXIA GymOS - Financial Performance Report"`,
      `"Gym:","${data.gym.name}"`,
      `"Period:","${data.filter.label} (${data.filter.startDate} to ${data.filter.endDate})"`,
      `"Currency:","${data.gym.currency}"`,
      `""`,
      `"Metric","Amount (${data.gym.currency})"`,
      `"Invoiced Revenue","${data.financial.invoicedAmount}"`,
      `"Gross Payments Collected","${data.financial.paymentsCollected}"`,
      `"Approved Refunds","${data.financial.totalRefunds}"`,
      `"Adjustments / Credits","${data.financial.totalAdjustments}"`,
      `"Net Revenue","${data.financial.netRevenue}"`,
      `"Operating Expenses","${data.financial.totalExpenses}"`,
      `"Net Operating Income (P&L)","${data.financial.netOperatingIncome}"`,
      `"Outstanding Member Dues","${data.financial.totalOutstandingDues}"`,
      `""`,
      `"Payment Method Breakdown"`,
      `"Method","Total Collected","Transaction Count"`,
      ...data.financial.paymentMethodBreakdown.map(
        (m) => `"${m.method}","${m.total}","${m.count}"`
      ),
      `""`,
      `"Operating Expense Breakdown"`,
      `"Category","Amount"`,
      ...data.financial.expenseCategoryBreakdown.map(
        (c) => `"${c.category}","${c.amount}"`
      ),
    ];
  } else if (section === "MEMBERSHIP") {
    filename = `gymos-${safeGym}-membership-${dateStr}.csv`;
    csvRows = [
      `"FIXIA GymOS - Membership Report"`,
      `"Gym:","${data.gym.name}"`,
      `"Period:","${data.filter.label}"`,
      `""`,
      `"Metric","Count"`,
      `"Total Registered Members","${data.membership.totalMembers}"`,
      `"Active Members","${data.membership.activeMembers}"`,
      `"Inactive Members","${data.membership.inactiveMembers}"`,
      `"Expired Memberships","${data.membership.expiredMemberships}"`,
      `"New Joins in Period","${data.membership.newMemberships}"`,
      `"Renewals in Period","${data.membership.renewals}"`,
      `""`,
      `"Plan Enrollment Distribution"`,
      `"Plan Name","Enrolled Active Members"`,
      ...data.membership.planDistribution.map(
        (p) => `"${p.planName}","${p.activeCount}"`
      ),
    ];
  } else if (section === "ATTENDANCE") {
    filename = `gymos-${safeGym}-attendance-${dateStr}.csv`;
    csvRows = [
      `"FIXIA GymOS - Attendance & Traffic Report"`,
      `"Gym:","${data.gym.name}"`,
      `"Period:","${data.filter.label}"`,
      `""`,
      `"Summary Metrics","Value"`,
      `"Total Check-Ins","${data.attendance.totalCheckIns}"`,
      `"Unique Attendees","${data.attendance.uniqueAttendees}"`,
      `"Average Daily Attendance","${data.attendance.averageDailyAttendance}"`,
      `""`,
      `"Daily Attendance Breakdown"`,
      `"Date","Total Check-Ins","Unique Members"`,
      ...data.attendance.attendanceTrends.map(
        (t) => `"${t.date}","${t.checkIns}","${t.uniqueMembers}"`
      ),
    ];
  } else {
    // Comprehensive ALL report
    csvRows = [
      `"FIXIA GymOS - Comprehensive Executive Business Report"`,
      `"Gym:","${data.gym.name}"`,
      `"Period:","${data.filter.label}"`,
      `"Generated At:","${new Date().toISOString()}"`,
      `""`,
      `"SECTION 1: KEY PERFORMANCE INDICATORS"`,
      `"Total Active Members","${data.membership.activeMembers}"`,
      `"Total Attendance Check-Ins","${data.attendance.totalCheckIns}"`,
      `"Net Collected Revenue (${data.gym.currency})","${data.financial.netRevenue}"`,
      `"Operating Expenses (${data.gym.currency})","${data.financial.totalExpenses}"`,
      `"Net Operating Income P&L (${data.gym.currency})","${data.financial.netOperatingIncome}"`,
      `"Outstanding Dues (${data.gym.currency})","${data.financial.totalOutstandingDues}"`,
      `"Lead Conversion Rate","${data.crm.conversionRate}%"`,
      `"Class Booking Utilization","${data.operations.bookingUtilization}%"`,
      `""`,
      `"SECTION 2: FINANCIAL BREAKDOWN"`,
      `"Invoiced Total","${data.financial.invoicedAmount}"`,
      `"Payments Collected","${data.financial.paymentsCollected}"`,
      `"Approved Refunds","${data.financial.totalRefunds}"`,
      `"Net Revenue","${data.financial.netRevenue}"`,
      `"Operating Expenses","${data.financial.totalExpenses}"`,
      `"Net Operating Income","${data.financial.netOperatingIncome}"`,
      `""`,
      `"SECTION 3: CRM PIPELINE"`,
      `"Total Enquiries","${data.crm.totalEnquiries}"`,
      `"Converted Leads","${data.crm.convertedLeads}"`,
      `"Lost Leads","${data.crm.lostLeads}"`,
      `"Conversion Rate","${data.crm.conversionRate}%"`,
      `""`,
      `"SECTION 4: OPERATIONS & CLASSES"`,
      `"Total Bookings","${data.operations.totalBookings}"`,
      `"Attended Bookings","${data.operations.attendedBookings}"`,
      `"Class Capacity Utilization","${data.operations.bookingUtilization}%"`,
      `"Low-Stock Inventory Items","${data.operations.lowStockCount}"`,
    ];
  }

  return {
    filename,
    content: csvRows.join("\n"),
  };
}
