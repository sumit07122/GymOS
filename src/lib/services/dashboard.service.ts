import { db } from "@/lib/db";
import { TenantContext } from "@/lib/tenant/context";

// ==============================================================================
// FIXIA GymOS — Multi-Tenant Dashboard Metrics Service
// ==============================================================================
// Guarantees:
// 1. Strict Tenant Scoping: All aggregation queries are filtered by ctx.gymId.
// 2. Real Database Data: Zero fake/hardcoded stats. Zero-states handled cleanly.
// 3. Flexible Date Filtering for Revenue and Attendance trends.
// ==============================================================================

export type DateRange = "today" | "7d" | "30d" | "month" | "year";

export interface AttendanceTrendDay {
  date: string; // ISO date string YYYY-MM-DD
  dayLabel: string; // e.g. "Mon", "Tue"
  count: number;
}

export interface RecentPaymentItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  receivedAt: Date;
  memberName: string;
  memberEmail: string;
}

export interface RecentMemberItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  status: string;
  createdAt: Date;
}

export interface DashboardMetrics {
  totalMembers: number;
  activeMembers: number;
  expiringMemberships: number;
  todayAttendance: number;
  pendingDues: number;
  periodRevenue: number;
  currency: string;
  recentPayments: RecentPaymentItem[];
  recentMembers: RecentMemberItem[];
  attendanceTrends: AttendanceTrendDay[];
}

/**
 * Computes the start date based on the chosen filter.
 */
function getFilterStartDate(filter: DateRange): Date {
  const now = new Date();
  switch (filter) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "7d": {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "month": {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    case "year": {
      return new Date(now.getFullYear(), 0, 1);
    }
    case "30d":
    default: {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      return start;
    }
  }
}

/**
 * Fetches real, tenant-scoped operational and financial metrics for the owner dashboard.
 */
export async function getDashboardMetrics(
  ctx: TenantContext,
  range: DateRange = "30d"
): Promise<DashboardMetrics> {
  const gymId = ctx.gymId;
  const now = new Date();

  // 1. Gym Profile & Currency
  const gym = await db.gym.findUnique({
    where: { id: gymId },
    select: { currency: true },
  });
  const currency = gym?.currency || "USD";

  // 2. Member Statistics
  const totalMembersPromise = db.member.count({
    where: { gymId },
  });

  const activeMembersPromise = db.member.count({
    where: { gymId, status: "ACTIVE" },
  });

  // 3. Expiring Memberships (Ending within next 7 days)
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const expiringMembershipsPromise = db.membership.count({
    where: {
      gymId,
      status: "ACTIVE",
      endDate: {
        gte: now,
        lte: in7Days,
      },
    },
  });

  // 4. Today's Attendance Check-Ins
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const todayAttendancePromise = db.attendanceRecord.count({
    where: {
      gymId,
      checkInTime: {
        gte: startOfToday,
      },
      status: {
        in: ["VERIFIED", "MANUAL_OVERRIDE"],
      },
    },
  });

  // 5. Financial Aggregations
  // A. Outstanding pending dues across unpaid / partially paid invoices
  const pendingDuesPromise = db.invoice.aggregate({
    where: {
      gymId,
      status: {
        in: ["ISSUED", "PARTIALLY_PAID", "OVERDUE"],
      },
    },
    _sum: {
      dueAmount: true,
    },
  });

  // B. Revenue collected within the filtered period
  const filterStartDate = getFilterStartDate(range);
  const periodRevenuePromise = db.payment.aggregate({
    where: {
      gymId,
      status: "COMPLETED",
      receivedAt: {
        gte: filterStartDate,
      },
    },
    _sum: {
      amount: true,
    },
  });

  // 6. Recent Activities
  const recentPaymentsPromise = db.payment.findMany({
    where: { gymId },
    orderBy: { receivedAt: "desc" },
    take: 5,
    include: {
      member: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  const recentMembersPromise = db.member.findMany({
    where: { gymId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      createdAt: true,
    },
  });

  // 7. Attendance Trends: Daily counts for the last 7 days
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const trendRecordsPromise = db.attendanceRecord.findMany({
    where: {
      gymId,
      checkInTime: {
        gte: sevenDaysAgo,
      },
      status: {
        in: ["VERIFIED", "MANUAL_OVERRIDE"],
      },
    },
    select: {
      checkInTime: true,
    },
  });

  // Await all parallel tenant queries
  const [
    totalMembers,
    activeMembers,
    expiringMemberships,
    todayAttendance,
    pendingDuesAgg,
    periodRevenueAgg,
    recentPaymentsRaw,
    recentMembers,
    trendRecords,
  ] = await Promise.all([
    totalMembersPromise,
    activeMembersPromise,
    expiringMembershipsPromise,
    todayAttendancePromise,
    pendingDuesPromise,
    periodRevenuePromise,
    recentPaymentsPromise,
    recentMembersPromise,
    trendRecordsPromise,
  ]);

  // Transform 7-day attendance trends into daily buckets
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const attendanceTrends: AttendanceTrendDay[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = daysOfWeek[d.getDay()];

    const count = trendRecords.filter((rec) => {
      const recDate = new Date(rec.checkInTime).toISOString().split("T")[0];
      return recDate === dateStr;
    }).length;

    attendanceTrends.push({
      date: dateStr,
      dayLabel,
      count,
    });
  }

  const recentPayments: RecentPaymentItem[] = recentPaymentsRaw.map((p) => ({
    id: p.id,
    amount: Number(p.amount),
    currency,
    status: p.status,
    paymentMethod: p.method,
    receivedAt: p.receivedAt,
    memberName: p.member ? `${p.member.firstName} ${p.member.lastName}` : "Direct Walk-in",
    memberEmail: p.member?.email || "",
  }));

  return {
    totalMembers,
    activeMembers,
    expiringMemberships,
    todayAttendance,
    pendingDues: Number(pendingDuesAgg._sum.dueAmount || 0),
    periodRevenue: Number(periodRevenueAgg._sum.amount || 0),
    currency,
    recentPayments,
    recentMembers,
    attendanceTrends,
  };
}

