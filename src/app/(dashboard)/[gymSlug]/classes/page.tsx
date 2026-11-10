import * as React from "react";
import { Suspense } from "react";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import { listClasses, listSchedules } from "@/lib/services/class.service";
import { ClassesHub } from "@/components/classes/classes-hub";
import { Loader2 } from "lucide-react";
import { GymRole, SystemRole } from "@prisma/client";
import { db } from "@/lib/db";

interface ClassesPageProps {
  params: Promise<{ gymSlug: string }>;
}

function ClassesSkeleton() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span>Loading class schedules and bookings…</span>
      </div>
    </div>
  );
}

async function ClassesContent({ params }: ClassesPageProps) {
  const { gymSlug } = await params;
  const ctx = await resolveTenantContext(gymSlug);

  const [classesList, schedulesResult, instructorRoles, activeMembers] = await Promise.all([
    listClasses(ctx, true),
    listSchedules(ctx, { limit: 100 }),
    db.userGymRole.findMany({
      where: {
        gymId: ctx.gymId,
        role: { in: [GymRole.OWNER, GymRole.STAFF, GymRole.TRAINER] },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    db.member.findMany({
      where: { gymId: ctx.gymId, status: "ACTIVE" },
      select: { id: true, firstName: true, lastName: true, memberCode: true },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      take: 200,
    }),
  ]);

  const instructors = instructorRoles.map((r) => ({
    id: r.user.id,
    name: r.user.name,
    email: r.user.email || "",
  }));

  const canManage =
    ctx.role === GymRole.OWNER ||
    ctx.role === GymRole.STAFF ||
    ctx.role === GymRole.TRAINER ||
    ctx.role === SystemRole.SUPER_ADMIN;

  return (
    <ClassesHub
      classes={classesList}
      schedules={schedulesResult.schedules}
      instructors={instructors}
      members={activeMembers}
      gymId={ctx.gymId}
      gymSlug={gymSlug}
      canManage={canManage}
    />
  );
}

export default function ClassesPage({ params }: ClassesPageProps) {
  return (
    <Suspense fallback={<ClassesSkeleton />}>
      <ClassesContent params={params} />
    </Suspense>
  );
}

