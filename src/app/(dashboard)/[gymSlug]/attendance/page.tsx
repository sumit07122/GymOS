import * as React from "react";
import { Suspense } from "react";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import {
  getTodayAttendanceMetrics,
  getAttendanceHistory,
  getRecentScans,
} from "@/lib/services/attendance.service";
import { db } from "@/lib/db";
import { AttendanceHub } from "@/components/attendance/attendance-hub";
import { Loader2 } from "lucide-react";

interface AttendancePageProps {
  params: Promise<{ gymSlug: string }>;
}

function AttendanceSkeleton() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <span>Loading attendance scanner and ledger...</span>
      </div>
    </div>
  );
}

async function AttendanceContent({ params }: AttendancePageProps) {
  const { gymSlug } = await params;
  const ctx = await resolveTenantContext(gymSlug);

  const [metrics, historyResult, recentScansRaw, membersRaw] =
    await Promise.all([
      getTodayAttendanceMetrics(ctx),
      getAttendanceHistory(ctx, { page: 1, limit: 50 }),
      getRecentScans(ctx, 10),
      db.member.findMany({
        where: {
          gymId: ctx.gymId,
          status: { not: "ARCHIVED" },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          memberCode: true,
          phone: true,
        },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      }),
    ]);

  const membersList = membersRaw.map((m) => ({
    id: m.id,
    fullName: `${m.firstName} ${m.lastName}`,
    memberCode: m.memberCode,
    phone: m.phone,
  }));

  const serializableHistory = historyResult.records.map((r) => ({
    id: r.id,
    checkInTime: r.checkInTime.toISOString(),
    checkOutTime: r.checkOutTime ? r.checkOutTime.toISOString() : null,
    status: r.status,
    checkInMethod: r.checkInMethod,
    rejectionReason: r.rejectionReason,
    deviceInfo: r.deviceInfo,
    member: {
      id: r.member.id,
      firstName: r.member.firstName,
      lastName: r.member.lastName,
      memberCode: r.member.memberCode,
      photoUrl: r.member.photoUrl,
      phone: r.member.phone,
    },
  }));

  const serializableRecent = recentScansRaw.map((r) => ({
    id: r.id,
    checkInTime: r.checkInTime.toISOString(),
    checkOutTime: r.checkOutTime ? r.checkOutTime.toISOString() : null,
    status: r.status,
    checkInMethod: r.checkInMethod,
    rejectionReason: r.rejectionReason,
    deviceInfo: r.deviceInfo,
    member: {
      id: r.member.id,
      firstName: r.member.firstName,
      lastName: r.member.lastName,
      memberCode: r.member.memberCode,
      photoUrl: r.member.photoUrl,
      phone: null,
    },
  }));

  return (
    <AttendanceHub
      gymId={ctx.gymId}
      gymSlug={gymSlug}
      metrics={metrics}
      initialRecords={serializableHistory}
      recentScans={serializableRecent}
      membersList={membersList}
    />
  );
}

export default function AttendancePage(props: AttendancePageProps) {
  return (
    <Suspense fallback={<AttendanceSkeleton />}>
      <AttendanceContent {...props} />
    </Suspense>
  );
}
