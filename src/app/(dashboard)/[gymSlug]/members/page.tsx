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

  const [membersResult, gym, plans] = await Promise.all([
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

