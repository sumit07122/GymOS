import * as React from "react";
import { Suspense } from "react";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import {
  getPlansList,
  getExpiringMemberships,
  syncExpiredMemberships,
} from "@/lib/services/membership.service";
import { db } from "@/lib/db";
import { MembershipStatus } from "@prisma/client";
import { MembershipsHub } from "@/components/memberships/memberships-hub";
import { Loader2 } from "lucide-react";

interface MembershipsPageProps {
  params: Promise<{ gymSlug: string }>;
}

function MembershipsSkeleton() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <span>Loading membership plans and subscriptions...</span>
      </div>
    </div>
  );
}

async function MembershipsContent({ params }: MembershipsPageProps) {
  const { gymSlug } = await params;
  const ctx = await resolveTenantContext(gymSlug);

  // Sync any memberships that have expired by today
  await syncExpiredMemberships(ctx).catch(() => 0);

  const [gym, plans, expiringMemberships, activeCount, rawMembers] =
    await Promise.all([
      db.gym.findUnique({
        where: { id: ctx.gymId },
        select: { currency: true },
      }),
      getPlansList(ctx, { includeArchived: true }),
      getExpiringMemberships(ctx, 14),
      db.membership.count({
        where: {
          gymId: ctx.gymId,
          status: MembershipStatus.ACTIVE,
        },
      }),
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
        },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      }),
    ]);

  const currency = gym?.currency || "USD";

  const memberOptions = rawMembers.map((m) => ({
    id: m.id,
    fullName: `${m.firstName} ${m.lastName}`,
    memberCode: m.memberCode,
  }));

  const serializablePlans = plans.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    durationDays: p.durationDays,
    price: Number(p.price),
    admissionFee: Number(p.admissionFee),
    maxSessions: p.maxSessions,
    benefits: p.benefits,
    accessRestrictions: p.accessRestrictions,
    isActive: p.isActive,
    _count: p._count,
  }));

  const serializableExpiring = expiringMemberships.map((m) => ({
    id: m.id,
    startDate: m.startDate.toISOString(),
    endDate: m.endDate.toISOString(),
    member: {
      id: m.member.id,
      firstName: m.member.firstName,
      lastName: m.member.lastName,
      memberCode: m.member.memberCode,
      phone: m.member.phone,
      email: m.member.email,
    },
    plan: {
      id: m.plan.id,
      name: m.plan.name,
      durationDays: m.plan.durationDays,
      price: Number(m.plan.price),
    },
  }));

  return (
    <MembershipsHub
      gymId={ctx.gymId}
      gymSlug={gymSlug}
      currency={currency}
      userRole={ctx.role}
      plans={serializablePlans}
      expiringMemberships={serializableExpiring}
      activeMembershipsCount={activeCount}
      membersList={memberOptions}
    />
  );
}

export default function MembershipsPage(props: MembershipsPageProps) {
  return (
    <Suspense fallback={<MembershipsSkeleton />}>
      <MembershipsContent {...props} />
    </Suspense>
  );
}
