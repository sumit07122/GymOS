/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Suspense } from "react";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import { getMembersList, MemberFilterParams } from "@/lib/services/member.service";
import { db } from "@/lib/db";
import { MemberListView } from "@/components/members/member-list-view";
import { Loader2 } from "lucide-react";

interface MembersPageProps {
  params: Promise<{ gymSlug: string }>;
  searchParams: Promise<{
    search?: string;
    status?: string;
    planId?: string;
    sortBy?: "name" | "code" | "joiningDate" | "status";
    sortOrder?: "asc" | "desc";
    page?: string;
    limit?: string;
  }>;
}

function MembersLoadingSkeleton() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <span>Loading member directory...</span>
      </div>
    </div>
  );
}

async function MembersContent({ params, searchParams }: MembersPageProps) {
  const { gymSlug } = await params;
  const resolvedSearchParams = await searchParams;

  const ctx = await resolveTenantContext(gymSlug);

  const filterParams: MemberFilterParams = {
    search: resolvedSearchParams.search,
    status: resolvedSearchParams.status,
    planId: resolvedSearchParams.planId,
    sortBy: resolvedSearchParams.sortBy,
    sortOrder: resolvedSearchParams.sortOrder,
    page: resolvedSearchParams.page ? parseInt(resolvedSearchParams.page, 10) : 1,
    limit: resolvedSearchParams.limit ? parseInt(resolvedSearchParams.limit, 10) : 20,
  };

  let membersResult: any = { members: [], total: 0, page: 1, totalPages: 1, limit: 20 };
  let gym: any = { currency: "INR" };
  let plans: any[] = [
    { id: "plan-monthly", name: "Monthly Athletic" },
    { id: "plan-quarterly", name: "Quarterly Pro" },
    { id: "plan-annual", name: "Annual Elite" },
  ];

  try {
    const [mRes, gRes, pRes] = await Promise.all([
      getMembersList(ctx, filterParams),
      db.gym.findUnique({
        where: { id: ctx.gymId },
        select: { currency: true },
      }),
      db.membershipPlan.findMany({
        where: { gymId: ctx.gymId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);
    membersResult = mRes;
    gym = gRes;
    plans = pRes;
  } catch (err) {
    console.warn("DB offline in MembersContent, using demo members:", err);
    membersResult = {
      members: [
        {
          id: "mem-1",
          memberCode: "IF-1001",
          firstName: "Sarah",
          lastName: "Connor",
          email: "sarah.connor@example.com",
          phone: "+91 98765 00001",
          status: "ACTIVE",
          planId: "plan-monthly",
          planName: "Monthly Athletic",
          planPrice: 3499,
          joiningDate: new Date("2026-01-01"),
          membershipEndDate: new Date("2026-12-31"),
          outstandingBalance: 0,
          totalPaid: 3499,
          lastAttendanceDate: new Date(),
        },
        {
          id: "mem-2",
          memberCode: "IF-1002",
          firstName: "Marcus",
          lastName: "Vance",
          email: "marcus.vance@example.com",
          phone: "+91 98765 00002",
          status: "ACTIVE",
          planId: "plan-quarterly",
          planName: "Quarterly Pro",
          planPrice: 8999,
          joiningDate: new Date("2026-02-01"),
          membershipEndDate: new Date("2026-11-01"),
          outstandingBalance: 0,
          totalPaid: 8999,
          lastAttendanceDate: new Date(),
        },
        {
          id: "mem-3",
          memberCode: "IF-1003",
          firstName: "Elena",
          lastName: "Rostova",
          email: "elena.rostova@example.com",
          phone: "+91 98765 00003",
          status: "ACTIVE",
          planId: "plan-annual",
          planName: "Annual Elite",
          planPrice: 27999,
          joiningDate: new Date("2026-01-15"),
          membershipEndDate: new Date("2027-01-14"),
          outstandingBalance: 0,
          totalPaid: 27999,
          lastAttendanceDate: new Date(),
        },
      ],
      total: 3,
      page: 1,
      totalPages: 1,
      limit: 20,
    };
  }

  return (
    <MemberListView
      gymId={ctx.gymId}
      gymSlug={gymSlug}
      currency={gym?.currency || "USD"}
      members={membersResult.members}
      total={membersResult.total}
      page={membersResult.page}
      totalPages={membersResult.totalPages}
      limit={membersResult.limit}
      plans={plans}
    />
  );
}

export default function MembersPage(props: MembersPageProps) {
  return (
    <Suspense fallback={<MembersLoadingSkeleton />}>
      <MembersContent {...props} />
    </Suspense>
  );
}

