import { z } from "zod";

// ==============================================================================
// FIXIA GymOS — Workout & Fitness Validation Schemas
// ==============================================================================

export const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms (Biceps/Triceps)",
  "Legs (Quads/Hamstrings)",
  "Core & Abs",
  "Cardio & Full Body",
] as const;

export const exerciseCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Exercise name is required")
    .max(100, "Exercise name cannot exceed 100 characters"),
  muscleGroup: z.string().trim().max(60).optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const planEntryInputSchema = z.object({
  exerciseId: z.string().min(1, "Exercise is required"),
  sets: z.coerce.number().int().positive().max(100).optional(),
  reps: z.coerce.number().int().positive().max(500).optional(),
  durationSecs: z.coerce.number().int().positive().max(7200).optional(),
  restSecs: z.coerce.number().int().nonnegative().max(1800).optional(),
  sortOrder: z.coerce.number().int().nonnegative().default(0),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

export const workoutPlanCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Plan name is required")
    .max(100, "Plan name cannot exceed 100 characters"),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  entries: z.array(planEntryInputSchema).optional().default([]),
});

export const workoutAssignmentSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  planId: z.string().min(1, "Workout plan is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const fitnessProfileUpdateSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  heightCm: z.coerce.number().positive().max(300).optional(),
  fitnessGoals: z.string().trim().max(1000).optional().or(z.literal("")),
  fitnessNotes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const weightLogCreateSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  weightKg: z.coerce
    .number()
    .positive("Weight must be greater than zero")
    .max(500, "Weight too large"),
  logDate: z.string().optional(),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

export const measurementCreateSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  measureDate: z.string().optional(),
  chestCm: z.coerce.number().positive().max(250).optional(),
  waistCm: z.coerce.number().positive().max(250).optional(),
  hipsCm: z.coerce.number().positive().max(250).optional(),
  armCm: z.coerce.number().positive().max(100).optional(),
  thighCm: z.coerce.number().positive().max(150).optional(),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

export type ExerciseCreateInput = z.input<typeof exerciseCreateSchema>;
export type WorkoutPlanCreateInput = z.input<typeof workoutPlanCreateSchema>;
export type WorkoutAssignmentInput = z.input<typeof workoutAssignmentSchema>;
export type FitnessProfileUpdateInput = z.input<typeof fitnessProfileUpdateSchema>;
export type WeightLogCreateInput = z.input<typeof weightLogCreateSchema>;
export type MeasurementCreateInput = z.input<typeof measurementCreateSchema>;

