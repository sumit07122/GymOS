/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import {
  TenantContext,
  assertPermission,
  TenantAccessViolationError,
} from "@/lib/tenant/context";
import {
  Exercise,
  WorkoutPlan,
  MemberFitnessProfile,
  MemberWeightLog,
  MemberMeasurement,
  MemberWorkoutAssignment,
  WorkoutRecord,
} from "@prisma/client";
import {
  ExerciseCreateInput,
  WorkoutPlanCreateInput,
  WorkoutAssignmentInput,
  FitnessProfileUpdateInput,
  WeightLogCreateInput,
  MeasurementCreateInput,
} from "@/lib/validations/workout";

// ==============================================================================
// FIXIA GymOS — Workout & Fitness Domain Errors
// ==============================================================================

export class ExerciseNotFoundError extends Error {
  constructor(id: string) {
    super(`Exercise "${id}" not found or does not belong to this gym.`);
    this.name = "ExerciseNotFoundError";
  }
}

export class WorkoutPlanNotFoundError extends Error {
  constructor(id: string) {
    super(`Workout plan "${id}" not found or does not belong to this gym.`);
    this.name = "WorkoutPlanNotFoundError";
  }
}

export class DuplicateExerciseError extends Error {
  constructor(name: string) {
    super(`An exercise named "${name}" already exists in this gym.`);
    this.name = "DuplicateExerciseError";
  }
}

// ==============================================================================
// Types
// ==============================================================================

export type PlanWithEntries = WorkoutPlan & {
  createdBy: { id: string; name: string | null };
  entries: Array<{
    id: string;
    sets: number | null;
    reps: number | null;
    durationSecs: number | null;
    restSecs: number | null;
    sortOrder: number;
    notes: string | null;
    exercise: { id: string; name: string; muscleGroup: string | null };
  }>;
};

export type FullFitnessProfile = MemberFitnessProfile & {
  weightLogs: MemberWeightLog[];
  measurements: MemberMeasurement[];
  member: { id: string; firstName: string; lastName: string; memberCode: string };
};

// ==============================================================================
// 1. EXERCISE LIBRARY
// ==============================================================================

const DEFAULT_EXERCISES = [
  { name: "Barbell Bench Press", muscleGroup: "Chest", description: "Compound barbell horizontal push" },
  { name: "Incline Dumbbell Press", muscleGroup: "Chest", description: "Upper chest unilateral press" },
  { name: "Barbell Squat", muscleGroup: "Legs (Quads/Hamstrings)", description: "Compound lower body squat" },
  { name: "Romanian Deadlift", muscleGroup: "Legs (Quads/Hamstrings)", description: "Posterior chain hip hinge" },
  { name: "Pull-Up / Lat Pulldown", muscleGroup: "Back", description: "Vertical pulling movement" },
  { name: "Barbell Bent-Over Row", muscleGroup: "Back", description: "Horizontal rowing compound" },
  { name: "Overhead Shoulder Press", muscleGroup: "Shoulders", description: "Vertical pressing movement" },
  { name: "Dumbbell Lateral Raise", muscleGroup: "Shoulders", description: "Lateral deltoid isolation" },
  { name: "Barbell Bicep Curl", muscleGroup: "Arms (Biceps/Triceps)", description: "Biceps brachii curl" },
  { name: "Cable Tricep Pushdown", muscleGroup: "Arms (Biceps/Triceps)", description: "Triceps extension isolation" },
  { name: "Plank Hold", muscleGroup: "Core & Abs", description: "Isometric core stability" },
];

export async function seedDefaultExercises(ctx: TenantContext): Promise<void> {
  assertPermission(ctx, "WORKOUT_WRITE");

  const existing = await db.exercise.findMany({
    where: { gymId: ctx.gymId },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((e) => e.name));

  const toCreate = DEFAULT_EXERCISES.filter((e) => !existingNames.has(e.name));
  if (toCreate.length === 0) return;

  await db.exercise.createMany({
    data: toCreate.map((e) => ({ ...e, gymId: ctx.gymId, isActive: true })),
    skipDuplicates: true,
  });
}

export async function createExercise(
  ctx: TenantContext,
  input: ExerciseCreateInput
): Promise<Exercise> {
  assertPermission(ctx, "WORKOUT_WRITE");

  const existing = await db.exercise.findFirst({
    where: { gymId: ctx.gymId, name: input.name.trim() },
  });
  if (existing) {
    throw new DuplicateExerciseError(input.name.trim());
  }

  return db.exercise.create({
    data: {
      gymId: ctx.gymId,
      name: input.name.trim(),
      muscleGroup: input.muscleGroup?.trim() || null,
      description: input.description?.trim() || null,
      isActive: true,
    },
  });
}

export async function listExercises(ctx: TenantContext): Promise<Exercise[]> {
  assertPermission(ctx, "WORKOUT_READ");

  const list = await db.exercise.findMany({
    where: { gymId: ctx.gymId, isActive: true },
    orderBy: { name: "asc" },
  });

  // Auto-seed defaults if gym has none
  if (list.length === 0) {
    await seedDefaultExercises(ctx);
    return db.exercise.findMany({
      where: { gymId: ctx.gymId, isActive: true },
      orderBy: { name: "asc" },
    });
  }

  return list;
}

// ==============================================================================
// 2. WORKOUT PLANS
// ==============================================================================

export async function createWorkoutPlan(
  ctx: TenantContext,
  input: WorkoutPlanCreateInput
): Promise<PlanWithEntries> {
  assertPermission(ctx, "WORKOUT_WRITE");

  return db.$transaction(async (tx: any) => {
    const plan = await tx.workoutPlan.create({
      data: {
        gymId: ctx.gymId,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        createdByUserId: ctx.userId,
        isActive: true,
      },
    });

    if (input.entries && input.entries.length > 0) {
      await tx.workoutPlanEntry.createMany({
        data: input.entries.map((entry: any, idx: number) => ({
          planId: plan.id,
          exerciseId: entry.exerciseId,
          sets: entry.sets !== undefined ? Number(entry.sets) : null,
          reps: entry.reps !== undefined ? Number(entry.reps) : null,
          durationSecs: entry.durationSecs !== undefined ? Number(entry.durationSecs) : null,
          restSecs: entry.restSecs !== undefined ? Number(entry.restSecs) : null,
          sortOrder: entry.sortOrder ?? idx,
          notes: entry.notes?.trim() || null,
        })),
      });
    }

    return tx.workoutPlan.findUnique({
      where: { id: plan.id },
      include: {
        createdBy: { select: { id: true, name: true } },
        entries: {
          include: {
            exercise: { select: { id: true, name: true, muscleGroup: true } },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  });
}

export async function listWorkoutPlans(ctx: TenantContext): Promise<PlanWithEntries[]> {
  assertPermission(ctx, "WORKOUT_READ");

  return db.workoutPlan.findMany({
    where: { gymId: ctx.gymId, isActive: true },
    include: {
      createdBy: { select: { id: true, name: true } },
      entries: {
        include: {
          exercise: { select: { id: true, name: true, muscleGroup: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  }) as unknown as PlanWithEntries[];
}

export async function assignWorkoutPlan(
  ctx: TenantContext,
  input: WorkoutAssignmentInput
): Promise<MemberWorkoutAssignment> {
  assertPermission(ctx, "WORKOUT_WRITE");

  const [member, plan] = await Promise.all([
    db.member.findFirst({ where: { id: input.memberId, gymId: ctx.gymId } }),
    db.workoutPlan.findFirst({ where: { id: input.planId, gymId: ctx.gymId } }),
  ]);

  if (!member) throw new TenantAccessViolationError(input.memberId, ctx.gymId);
  if (!plan) throw new WorkoutPlanNotFoundError(input.planId);

  return db.$transaction(async (tx: any) => {
    // Deactivate existing active assignments for this member
    await tx.memberWorkoutAssignment.updateMany({
      where: { memberId: input.memberId, gymId: ctx.gymId, isActive: true },
      data: { isActive: false, endDate: new Date() },
    });

    return tx.memberWorkoutAssignment.create({
      data: {
        gymId: ctx.gymId,
        memberId: input.memberId,
        planId: input.planId,
        assignedBy: ctx.userId,
        startDate: input.startDate ? new Date(input.startDate) : new Date(),
        endDate: input.endDate ? new Date(input.endDate) : null,
        notes: input.notes?.trim() || null,
        isActive: true,
      },
      include: {
        plan: {
          include: {
            entries: {
              include: { exercise: true },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });
  });
}

export async function getMemberActiveWorkout(
  ctx: TenantContext,
  memberId: string
): Promise<any | null> {
  assertPermission(ctx, "WORKOUT_READ");

  const member = await db.member.findFirst({
    where: { id: memberId, gymId: ctx.gymId },
  });
  if (!member) throw new TenantAccessViolationError(memberId, ctx.gymId);

  return db.memberWorkoutAssignment.findFirst({
    where: { memberId, gymId: ctx.gymId, isActive: true },
    include: {
      plan: {
        include: {
          entries: {
            include: { exercise: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ==============================================================================
// 3. FITNESS PROFILE, WEIGHT & BODY MEASUREMENTS
// ==============================================================================

export async function getOrCreateFitnessProfile(
  ctx: TenantContext,
  memberId: string
): Promise<FullFitnessProfile> {
  assertPermission(ctx, "WORKOUT_READ");

  const member = await db.member.findFirst({
    where: { id: memberId, gymId: ctx.gymId },
  });
  if (!member) throw new TenantAccessViolationError(memberId, ctx.gymId);

  let profile = await db.memberFitnessProfile.findUnique({
    where: { memberId },
    include: {
      weightLogs: { orderBy: { logDate: "desc" }, take: 50 },
      measurements: { orderBy: { measureDate: "desc" }, take: 50 },
      member: {
        select: { id: true, firstName: true, lastName: true, memberCode: true },
      },
    },
  });

  if (!profile) {
    profile = await db.memberFitnessProfile.create({
      data: {
        gymId: ctx.gymId,
        memberId,
      },
      include: {
        weightLogs: { orderBy: { logDate: "desc" }, take: 50 },
        measurements: { orderBy: { measureDate: "desc" }, take: 50 },
        member: {
          select: { id: true, firstName: true, lastName: true, memberCode: true },
        },
      },
    });
  }

  return profile as unknown as FullFitnessProfile;
}

export async function updateFitnessProfile(
  ctx: TenantContext,
  input: FitnessProfileUpdateInput
): Promise<MemberFitnessProfile> {
  assertPermission(ctx, "WORKOUT_WRITE");

  await getOrCreateFitnessProfile(ctx, input.memberId);

  return db.memberFitnessProfile.update({
    where: { memberId: input.memberId },
    data: {
      heightCm: input.heightCm !== undefined ? Number(input.heightCm) : undefined,
      fitnessGoals: input.fitnessGoals !== undefined ? (input.fitnessGoals.trim() || null) : undefined,
      fitnessNotes: input.fitnessNotes !== undefined ? (input.fitnessNotes.trim() || null) : undefined,
    },
  });
}

export async function logMemberWeight(
  ctx: TenantContext,
  input: WeightLogCreateInput
): Promise<MemberWeightLog> {
  assertPermission(ctx, "WORKOUT_WRITE");

  const profile = await getOrCreateFitnessProfile(ctx, input.memberId);

  return db.memberWeightLog.create({
    data: {
      gymId: ctx.gymId,
      memberId: input.memberId,
      profileId: profile.id,
      weightKg: Number(input.weightKg),
      logDate: input.logDate ? new Date(input.logDate) : new Date(),
      notes: input.notes?.trim() || null,
      recordedBy: ctx.userId,
    },
  });
}

export async function logMemberMeasurement(
  ctx: TenantContext,
  input: MeasurementCreateInput
): Promise<MemberMeasurement> {
  assertPermission(ctx, "WORKOUT_WRITE");

  const profile = await getOrCreateFitnessProfile(ctx, input.memberId);

  return db.memberMeasurement.create({
    data: {
      gymId: ctx.gymId,
      memberId: input.memberId,
      profileId: profile.id,
      measureDate: input.measureDate ? new Date(input.measureDate) : new Date(),
      chestCm: input.chestCm !== undefined ? Number(input.chestCm) : null,
      waistCm: input.waistCm !== undefined ? Number(input.waistCm) : null,
      hipsCm: input.hipsCm !== undefined ? Number(input.hipsCm) : null,
      armCm: input.armCm !== undefined ? Number(input.armCm) : null,
      thighCm: input.thighCm !== undefined ? Number(input.thighCm) : null,
      notes: input.notes?.trim() || null,
      recordedBy: ctx.userId,
    },
  });
}

export async function logCompletedWorkout(
  ctx: TenantContext,
  memberId: string,
  title: string,
  notes?: string
): Promise<WorkoutRecord> {
  assertPermission(ctx, "WORKOUT_WRITE");

  const member = await db.member.findFirst({
    where: { id: memberId, gymId: ctx.gymId },
  });
  if (!member) throw new TenantAccessViolationError(memberId, ctx.gymId);

  return db.workoutRecord.create({
    data: {
      gymId: ctx.gymId,
      memberId,
      title: title.trim(),
      notes: notes?.trim() || null,
      recordedBy: ctx.userId,
    },
  });
}
