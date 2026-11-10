/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { requireGymAccess } from "@/lib/auth/guards";
import { GymRole } from "@prisma/client";
import {
  createExercise,
  createWorkoutPlan,
  assignWorkoutPlan,
  updateFitnessProfile,
  logMemberWeight,
  logMemberMeasurement,
  logCompletedWorkout,
} from "@/lib/services/workout.service";
import {
  exerciseCreateSchema,
  workoutPlanCreateSchema,
  workoutAssignmentSchema,
  fitnessProfileUpdateSchema,
  weightLogCreateSchema,
  measurementCreateSchema,
} from "@/lib/validations/workout";

export interface WorkoutActionState {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  data?: any;
}

export async function createExerciseAction(
  _prevState: WorkoutActionState | null,
  formData: FormData
): Promise<WorkoutActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) return { success: false, error: "Missing gym workspace identifier." };

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
      GymRole.TRAINER,
    ]);

    const rawData = {
      name: formData.get("name")?.toString() || "",
      muscleGroup: formData.get("muscleGroup")?.toString() || undefined,
      description: formData.get("description")?.toString() || undefined,
    };

    const parsed = exerciseCreateSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed." };
    }

    const ex = await createExercise(context, parsed.data);
    if (gymSlug) revalidatePath(`/${gymSlug}/workouts`);

    return { success: true, message: `Exercise "${ex.name}" added to library.`, data: ex };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to create exercise." };
  }
}

export async function createWorkoutPlanAction(
  _prevState: WorkoutActionState | null,
  formData: FormData
): Promise<WorkoutActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) return { success: false, error: "Missing gym workspace identifier." };

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
      GymRole.TRAINER,
    ]);

    const entriesJson = formData.get("entries")?.toString() || "[]";
    let entries = [];
    try {
      entries = JSON.parse(entriesJson);
    } catch {
      entries = [];
    }

    const rawData = {
      name: formData.get("name")?.toString() || "",
      description: formData.get("description")?.toString() || undefined,
      entries,
    };

    const parsed = workoutPlanCreateSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed." };
    }

    const plan = await createWorkoutPlan(context, parsed.data);
    if (gymSlug) revalidatePath(`/${gymSlug}/workouts`);

    return { success: true, message: `Workout plan "${plan?.name}" saved.`, data: plan };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to create workout plan." };
  }
}

export async function assignWorkoutPlanAction(
  _prevState: WorkoutActionState | null,
  formData: FormData
): Promise<WorkoutActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) return { success: false, error: "Missing gym workspace identifier." };

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
      GymRole.TRAINER,
    ]);

    const rawData = {
      memberId: formData.get("memberId")?.toString() || "",
      planId: formData.get("planId")?.toString() || "",
      startDate: formData.get("startDate")?.toString() || undefined,
      endDate: formData.get("endDate")?.toString() || undefined,
      notes: formData.get("notes")?.toString() || undefined,
    };

    const parsed = workoutAssignmentSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: "Validation failed." };
    }

    const assignment = await assignWorkoutPlan(context, parsed.data);
    if (gymSlug) revalidatePath(`/${gymSlug}/workouts`);

    return { success: true, message: "Workout plan assigned to member.", data: assignment };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to assign plan." };
  }
}

export async function updateFitnessProfileAction(
  _prevState: WorkoutActionState | null,
  formData: FormData
): Promise<WorkoutActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) return { success: false, error: "Missing gym workspace identifier." };

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
      GymRole.TRAINER,
    ]);

    const rawData = {
      memberId: formData.get("memberId")?.toString() || "",
      heightCm: formData.get("heightCm")?.toString() || undefined,
      fitnessGoals: formData.get("fitnessGoals")?.toString() || undefined,
      fitnessNotes: formData.get("fitnessNotes")?.toString() || undefined,
    };

    const parsed = fitnessProfileUpdateSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: "Invalid profile data." };
    }

    await updateFitnessProfile(context, parsed.data);
    if (gymSlug) revalidatePath(`/${gymSlug}/workouts`);

    return { success: true, message: "Member fitness profile updated." };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to update profile." };
  }
}

export async function logWeightAction(
  _prevState: WorkoutActionState | null,
  formData: FormData
): Promise<WorkoutActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) return { success: false, error: "Missing gym workspace identifier." };

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
      GymRole.TRAINER,
    ]);

    const rawData = {
      memberId: formData.get("memberId")?.toString() || "",
      weightKg: formData.get("weightKg")?.toString() || "0",
      logDate: formData.get("logDate")?.toString() || undefined,
      notes: formData.get("notes")?.toString() || undefined,
    };

    const parsed = weightLogCreateSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid weight entry." };
    }

    const log = await logMemberWeight(context, parsed.data);
    if (gymSlug) revalidatePath(`/${gymSlug}/workouts`);

    return { success: true, message: `Recorded weight: ${log.weightKg} kg`, data: log };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to log weight." };
  }
}

export async function logMeasurementAction(
  _prevState: WorkoutActionState | null,
  formData: FormData
): Promise<WorkoutActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) return { success: false, error: "Missing gym workspace identifier." };

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
      GymRole.TRAINER,
    ]);

    const rawData = {
      memberId: formData.get("memberId")?.toString() || "",
      measureDate: formData.get("measureDate")?.toString() || undefined,
      chestCm: formData.get("chestCm")?.toString() || undefined,
      waistCm: formData.get("waistCm")?.toString() || undefined,
      hipsCm: formData.get("hipsCm")?.toString() || undefined,
      armCm: formData.get("armCm")?.toString() || undefined,
      thighCm: formData.get("thighCm")?.toString() || undefined,
      notes: formData.get("notes")?.toString() || undefined,
    };

    const parsed = measurementCreateSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: "Invalid body measurements." };
    }

    const m = await logMemberMeasurement(context, parsed.data);
    if (gymSlug) revalidatePath(`/${gymSlug}/workouts`);

    return { success: true, message: "Body measurements saved.", data: m };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to log measurements." };
  }
}

export async function logCompletedWorkoutAction(
  _prevState: WorkoutActionState | null,
  formData: FormData
): Promise<WorkoutActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) return { success: false, error: "Missing gym workspace identifier." };

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
      GymRole.TRAINER,
    ]);

    const memberId = formData.get("memberId")?.toString() || "";
    const title = formData.get("title")?.toString() || "";
    const notes = formData.get("notes")?.toString() || undefined;

    if (!memberId || !title.trim()) {
      return { success: false, error: "Member and workout title are required." };
    }

    const record = await logCompletedWorkout(context, memberId, title, notes);
    if (gymSlug) revalidatePath(`/${gymSlug}/workouts`);

    return { success: true, message: "Workout session recorded.", data: record };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to record workout." };
  }
}

