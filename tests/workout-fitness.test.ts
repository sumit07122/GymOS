/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createExercise,
  listExercises,
  createWorkoutPlan,
  listWorkoutPlans,
  assignWorkoutPlan,
  getMemberActiveWorkout,
  getOrCreateFitnessProfile,
  updateFitnessProfile,
  logMemberWeight,
  logMemberMeasurement,
  logCompletedWorkout,
  DuplicateExerciseError,
  WorkoutPlanNotFoundError,
} from "@/lib/services/workout.service";
import { createTenantContext, TenantAccessViolationError } from "@/lib/tenant/context";
import { InsufficientPermissionError } from "@/lib/tenant/permissions";
import { db } from "@/lib/db";
import { GymRole } from "@prisma/client";

describe("Milestone M14: Workout and Fitness Records", () => {
  const gymAId = "gym-alpha-workouts";
  const gymBId = "gym-beta-workouts";

  const ownerAContext = createTenantContext({
    gymId: gymAId,
    userId: "owner-alpha",
    userEmail: "owner@alpha.com",
    role: GymRole.OWNER,
  });

  const memberAContext = createTenantContext({
    gymId: gymAId,
    userId: "member-alpha",
    userEmail: "member@alpha.com",
    role: GymRole.MEMBER,
  });

  const ownerBContext = createTenantContext({
    gymId: gymBId,
    userId: "owner-beta",
    userEmail: "owner@beta.com",
    role: GymRole.OWNER,
  });

  const mockExercise = {
    id: "ex-001",
    gymId: gymAId,
    name: "Barbell Bench Press",
    muscleGroup: "Chest",
    description: "Horizontal pressing compound",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPlan = {
    id: "plan-001",
    gymId: gymAId,
    name: "Push Hypertrophy",
    description: "Upper push day routine",
    createdByUserId: "owner-alpha",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: { id: "owner-alpha", name: "Gym Owner" },
    entries: [
      {
        id: "entry-001",
        sets: 4,
        reps: 8,
        durationSecs: null,
        restSecs: 90,
        sortOrder: 0,
        notes: null,
        exercise: { id: "ex-001", name: "Barbell Bench Press", muscleGroup: "Chest" },
      },
    ],
  };

  const mockMember = {
    id: "mem-001",
    gymId: gymAId,
    firstName: "John",
    lastName: "Doe",
    memberCode: "MEM-001",
  };

  const mockProfile = {
    id: "prof-001",
    gymId: gymAId,
    memberId: "mem-001",
    heightCm: { toString: () => "180" } as any,
    fitnessGoals: "Build lean muscle",
    fitnessNotes: "No known injuries",
    createdAt: new Date(),
    updatedAt: new Date(),
    weightLogs: [],
    measurements: [],
    member: { id: "mem-001", firstName: "John", lastName: "Doe", memberCode: "MEM-001" },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // 1. EXERCISE LIBRARY
  // ============================================================================
  describe("Exercise Library", () => {
    it("creates an exercise successfully", async () => {
      vi.spyOn(db.exercise, "findFirst").mockResolvedValue(null);
      vi.spyOn(db.exercise, "create").mockResolvedValue(mockExercise);

      const ex = await createExercise(ownerAContext, {
        name: "Barbell Bench Press",
        muscleGroup: "Chest",
        description: "Horizontal pressing compound",
      });

      expect(ex.name).toBe("Barbell Bench Press");
    });

    it("rejects duplicate exercise name within the same gym", async () => {
      vi.spyOn(db.exercise, "findFirst").mockResolvedValue(mockExercise);

      await expect(
        createExercise(ownerAContext, { name: "Barbell Bench Press" })
      ).rejects.toBeInstanceOf(DuplicateExerciseError);
    });

    it("auto-seeds default exercise library if empty", async () => {
      vi.spyOn(db.exercise, "findMany")
        .mockResolvedValueOnce([]) // First list check empty
        .mockResolvedValueOnce([]) // Check existing in seed
        .mockResolvedValueOnce([mockExercise]); // Final return

      vi.spyOn(db.exercise, "createMany").mockResolvedValue({ count: 11 });

      const list = await listExercises(ownerAContext);
      expect(list).toBeDefined();
    });
  });

  // ============================================================================
  // 2. WORKOUT PLANS & ASSIGNMENT
  // ============================================================================
  describe("Workout Plans and Assignments", () => {
    it("creates a workout plan with exercise entries in a transaction", async () => {
      vi.spyOn(db, "$transaction").mockImplementation(async (cb: any) => {
        const tx = {
          workoutPlan: {
            create: vi.fn().mockResolvedValue({ id: "plan-001" }),
            findUnique: vi.fn().mockResolvedValue(mockPlan),
          },
          workoutPlanEntry: {
            createMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
        };
        return cb(tx);
      });

      const plan = await createWorkoutPlan(ownerAContext, {
        name: "Push Hypertrophy",
        description: "Upper push day routine",
        entries: [{ exerciseId: "ex-001", sets: 4, reps: 8, restSecs: 90 }],
      });

      expect(plan.name).toBe("Push Hypertrophy");
      expect(plan.entries).toHaveLength(1);
    });

    it("rejects workout plan creation for member role (insufficient permission)", async () => {
      await expect(
        createWorkoutPlan(memberAContext, { name: "Unauthorized Plan" })
      ).rejects.toBeInstanceOf(InsufficientPermissionError);
    });

    it("lists workout plans for gym", async () => {
      vi.spyOn(db.workoutPlan, "findMany").mockResolvedValue([mockPlan] as any);
      const list = await listWorkoutPlans(ownerAContext);
      expect(list).toHaveLength(1);
    });

    it("assigns workout plan to member and deactivates prior assignment", async () => {
      vi.spyOn(db.member, "findFirst").mockResolvedValue(mockMember as any);
      vi.spyOn(db.workoutPlan, "findFirst").mockResolvedValue(mockPlan as any);

      const updateManyMock = vi.fn().mockResolvedValue({ count: 1 });
      const createMock = vi.fn().mockResolvedValue({
        id: "assign-001",
        memberId: "mem-001",
        planId: "plan-001",
        isActive: true,
      });

      vi.spyOn(db, "$transaction").mockImplementation(async (cb: any) => {
        const tx = {
          memberWorkoutAssignment: {
            updateMany: updateManyMock,
            create: createMock,
          },
        };
        return cb(tx);
      });

      const assignment = await assignWorkoutPlan(ownerAContext, {
        memberId: "mem-001",
        planId: "plan-001",
        notes: "Perform 2x per week",
      });

      expect(updateManyMock).toHaveBeenCalled();
      expect(assignment.isActive).toBe(true);
    });

    it("rejects plan assignment if plan does not belong to gym", async () => {
      vi.spyOn(db.member, "findFirst").mockResolvedValue(mockMember as any);
      vi.spyOn(db.workoutPlan, "findFirst").mockResolvedValue(null);

      await expect(
        assignWorkoutPlan(ownerAContext, {
          memberId: "mem-001",
          planId: "foreign-plan",
        })
      ).rejects.toBeInstanceOf(WorkoutPlanNotFoundError);
    });

    it("retrieves member's active workout routine", async () => {
      vi.spyOn(db.member, "findFirst").mockResolvedValue(mockMember as any);
      vi.spyOn(db.memberWorkoutAssignment, "findFirst").mockResolvedValue({
        id: "assign-001",
        plan: mockPlan,
        isActive: true,
      } as any);

      const active = await getMemberActiveWorkout(ownerAContext, "mem-001");
      expect(active).toBeDefined();
      expect(active.plan.name).toBe("Push Hypertrophy");
    });
  });

  // ============================================================================
  // 3. FITNESS PROFILE, WEIGHT & MEASUREMENTS
  // ============================================================================
  describe("Fitness Profile & Progress Tracking", () => {
    it("gets or creates fitness profile for member", async () => {
      vi.spyOn(db.member, "findFirst").mockResolvedValue(mockMember as any);
      vi.spyOn(db.memberFitnessProfile, "findUnique").mockResolvedValue(mockProfile as any);

      const profile = await getOrCreateFitnessProfile(ownerAContext, "mem-001");
      expect(profile.id).toBe("prof-001");
    });

    it("updates member fitness profile goals and height", async () => {
      vi.spyOn(db.member, "findFirst").mockResolvedValue(mockMember as any);
      vi.spyOn(db.memberFitnessProfile, "findUnique").mockResolvedValue(mockProfile as any);
      vi.spyOn(db.memberFitnessProfile, "update").mockResolvedValue({
        ...mockProfile,
        heightCm: 182 as any,
      });

      const updated = await updateFitnessProfile(ownerAContext, {
        memberId: "mem-001",
        heightCm: 182,
        fitnessGoals: "Bench 120kg",
      });

      expect(updated.heightCm).toBe(182);
    });

    it("logs member weight entry", async () => {
      vi.spyOn(db.member, "findFirst").mockResolvedValue(mockMember as any);
      vi.spyOn(db.memberFitnessProfile, "findUnique").mockResolvedValue(mockProfile as any);
      vi.spyOn(db.memberWeightLog, "create").mockResolvedValue({
        id: "w-001",
        gymId: gymAId,
        memberId: "mem-001",
        profileId: "prof-001",
        weightKg: 78.5 as any,
        logDate: new Date(),
        notes: "Fasted morning weight",
        recordedBy: "owner-alpha",
        createdAt: new Date(),
      });

      const log = await logMemberWeight(ownerAContext, {
        memberId: "mem-001",
        weightKg: 78.5,
      });

      expect(log.weightKg).toBe(78.5);
    });

    it("logs body measurements", async () => {
      vi.spyOn(db.member, "findFirst").mockResolvedValue(mockMember as any);
      vi.spyOn(db.memberFitnessProfile, "findUnique").mockResolvedValue(mockProfile as any);
      vi.spyOn(db.memberMeasurement, "create").mockResolvedValue({
        id: "m-001",
        gymId: gymAId,
        memberId: "mem-001",
        profileId: "prof-001",
        measureDate: new Date(),
        chestCm: 102 as any,
        waistCm: 80 as any,
        hipsCm: null,
        armCm: 39 as any,
        thighCm: null,
        notes: null,
        recordedBy: "owner-alpha",
        createdAt: new Date(),
      });

      const measurement = await logMemberMeasurement(ownerAContext, {
        memberId: "mem-001",
        chestCm: 102,
        waistCm: 80,
        armCm: 39,
      });

      expect(measurement.chestCm).toBe(102);
    });

    it("logs completed workout record for historical audit", async () => {
      vi.spyOn(db.member, "findFirst").mockResolvedValue(mockMember as any);
      vi.spyOn(db.workoutRecord, "create").mockResolvedValue({
        id: "rec-001",
        gymId: gymAId,
        memberId: "mem-001",
        title: "Chest & Shoulders Blast",
        date: new Date(),
        notes: "Completed 5 sets on bench",
        recordedBy: "owner-alpha",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const record = await logCompletedWorkout(
        ownerAContext,
        "mem-001",
        "Chest & Shoulders Blast",
        "Completed 5 sets on bench"
      );

      expect(record.title).toBe("Chest & Shoulders Blast");
    });
  });

  // ============================================================================
  // 4. TENANT ISOLATION
  // ============================================================================
  describe("Tenant Isolation", () => {
    it("gym B cannot assign gym A member", async () => {
      vi.spyOn(db.member, "findFirst").mockResolvedValue(null);
      vi.spyOn(db.workoutPlan, "findFirst").mockResolvedValue(mockPlan as any);

      await expect(
        assignWorkoutPlan(ownerBContext, {
          memberId: "mem-001",
          planId: "plan-001",
        })
      ).rejects.toBeInstanceOf(TenantAccessViolationError);
    });

    it("gym B cannot view gym A member fitness profile", async () => {
      vi.spyOn(db.member, "findFirst").mockResolvedValue(null);

      await expect(
        getOrCreateFitnessProfile(ownerBContext, "mem-001")
      ).rejects.toBeInstanceOf(TenantAccessViolationError);
    });
  });
});
