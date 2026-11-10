import * as React from "react";
import { Suspense } from "react";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import {
  listExercises,
  listWorkoutPlans,
} from "@/lib/services/workout.service";
import { WorkoutsHub } from "@/components/workouts/workouts-hub";
import { Loader2 } from "lucide-react";
import { GymRole, SystemRole } from "@prisma/client";
import { db } from "@/lib/db";

interface WorkoutsPageProps {
  params: Promise<{ gymSlug: string }>;
}

function WorkoutsSkeleton() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span>Loading workout library, training routines, and fitness records…</span>
      </div>
    </div>
  );
}

async function WorkoutsContent({ params }: WorkoutsPageProps) {
  const { gymSlug } = await params;
  const ctx = await resolveTenantContext(gymSlug);

  const [exercises, plans, members, activeAssignmentsCount, totalLogsCount] = await Promise.all([
    listExercises(ctx),
    listWorkoutPlans(ctx),
    db.member.findMany({
      where: { gymId: ctx.gymId, status: "ACTIVE" },
      select: { id: true, firstName: true, lastName: true, memberCode: true },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      take: 200,
    }),
    db.memberWorkoutAssignment.count({
      where: { gymId: ctx.gymId, isActive: true },
    }),
    db.memberWeightLog.count({
      where: { gymId: ctx.gymId },
    }),
  ]);

  const canManage =
    ctx.role === GymRole.OWNER ||
    ctx.role === GymRole.STAFF ||
    ctx.role === GymRole.TRAINER ||
    ctx.role === SystemRole.SUPER_ADMIN;

  return (
    <WorkoutsHub
      exercises={exercises}
      plans={plans}
      members={members}
      activeAssignmentsCount={activeAssignmentsCount}
      totalLogsCount={totalLogsCount}
      gymId={ctx.gymId}
      gymSlug={gymSlug}
      canManage={canManage}
    />
  );
}

export default function WorkoutsPage({ params }: WorkoutsPageProps) {
  return (
    <Suspense fallback={<WorkoutsSkeleton />}>
      <WorkoutsContent params={params} />
    </Suspense>
  );
}
