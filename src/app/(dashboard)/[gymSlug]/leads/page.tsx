import * as React from "react";
import { Suspense } from "react";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import {
  getLeadMetrics,
  getLeadsList,
  LeadWithDetails,
} from "@/lib/services/lead.service";
import { db } from "@/lib/db";
import { LeadsHub } from "@/components/leads/leads-hub";
import { Loader2 } from "lucide-react";
import { GymRole } from "@prisma/client";

interface LeadsPageProps {
  params: Promise<{ gymSlug: string }>;
}

function LeadsSkeleton() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span>Loading prospective leads, CRM pipeline, and follow-ups...</span>
      </div>
    </div>
  );
}

async function LeadsContent({ params }: LeadsPageProps) {
  const { gymSlug } = await params;
  const ctx = await resolveTenantContext(gymSlug);

  const [metrics, leadsResult, staffRoles, plans] = await Promise.all([
    getLeadMetrics(ctx),
    getLeadsList(ctx, { limit: 100 }),
    db.userGymRole.findMany({
      where: {
        gymId: ctx.gymId,
        role: { in: [GymRole.OWNER, GymRole.STAFF] },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    db.membershipPlan.findMany({
      where: {
        gymId: ctx.gymId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        durationDays: true,
      },
      orderBy: { price: "asc" },
    }),
  ]);

  const staffMembers = staffRoles.map((r) => ({
    id: r.user.id,
    name: r.user.name,
    email: r.user.email || "",
  }));

  // Serialize leads, dates, and Decimals for client component boundary
  const serializableLeads = leadsResult.leads.map((l: LeadWithDetails) => ({
    id: l.id,
    gymId: l.gymId,
    firstName: l.firstName,
    lastName: l.lastName,
    phone: l.phone,
    email: l.email,
    source: l.source,
    stage: l.stage,
    interestedPlanId: l.interestedPlanId,
    assignedStaffId: l.assignedStaffId,
    trialDate: l.trialDate ? l.trialDate.toISOString() : null,
    followUpDate: l.followUpDate ? l.followUpDate.toISOString() : null,
    followUpNotes: l.followUpNotes,
    notes: l.notes,
    lostReason: l.lostReason,
    convertedMemberId: l.convertedMemberId,
    convertedAt: l.convertedAt ? l.convertedAt.toISOString() : null,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
    assignedStaff: l.assignedStaff
      ? {
          id: l.assignedStaff.id,
          name: l.assignedStaff.name,
          email: l.assignedStaff.email,
        }
      : null,
    interestedPlan: l.interestedPlan
      ? {
          id: l.interestedPlan.id,
          name: l.interestedPlan.name,
          price: Number(l.interestedPlan.price),
        }
      : null,
    activities: l.activities.map((a) => ({
      id: a.id,
      leadId: a.leadId,
      staffUserId: a.staffUserId,
      staffName: a.staffName,
      type: a.type,
      notes: a.notes,
      performedAt: a.performedAt.toISOString(),
    })),
  }));

  const serializablePlans = plans.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    durationDays: p.durationDays,
  }));

  return (
    <LeadsHub
      gymId={ctx.gymId}
      gymSlug={gymSlug}
      metrics={metrics}
      leads={serializableLeads}
      staffList={staffMembers}
      plansList={serializablePlans}
    />
  );
}

export default async function LeadsPage(props: LeadsPageProps) {
  return (
    <Suspense fallback={<LeadsSkeleton />}>
      <LeadsContent {...props} />
    </Suspense>
  );
}
