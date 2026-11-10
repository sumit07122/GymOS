import { z } from "zod";
import { ClassStatus } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — Classes & Scheduling Validation Schemas
// ==============================================================================

export const classCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Class name is required")
    .max(80, "Class name cannot exceed 80 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
  defaultCapacity: z.coerce
    .number()
    .int("Capacity must be an integer")
    .positive("Capacity must be at least 1")
    .max(500, "Capacity cannot exceed 500")
    .optional()
    .default(20),
  durationMinutes: z.coerce
    .number()
    .int("Duration must be an integer")
    .positive("Duration must be at least 5 minutes")
    .max(480, "Duration cannot exceed 8 hours")
    .optional()
    .default(60),
});

export const classUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Class name is required")
    .max(80, "Class name cannot exceed 80 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
  defaultCapacity: z.coerce
    .number()
    .int()
    .positive()
    .max(500)
    .optional(),
  durationMinutes: z.coerce
    .number()
    .int()
    .positive()
    .max(480)
    .optional(),
  isActive: z.boolean().optional(),
});

export const classScheduleCreateSchema = z
  .object({
    classId: z.string().min(1, "Class is required"),
    instructorUserId: z.string().optional().or(z.literal("")),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    capacity: z.coerce
      .number()
      .int()
      .positive("Capacity must be at least 1")
      .max(500, "Capacity cannot exceed 500"),
    roomLocation: z
      .string()
      .trim()
      .max(100, "Room location cannot exceed 100 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

export const classScheduleUpdateSchema = z
  .object({
    instructorUserId: z.string().optional().or(z.literal("")),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    capacity: z.coerce.number().int().positive().max(500).optional(),
    roomLocation: z.string().trim().max(100).optional().or(z.literal("")),
    status: z.nativeEnum(ClassStatus).optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);
        return end > start;
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

export const classBookingCreateSchema = z.object({
  scheduleId: z.string().min(1, "Schedule is required"),
  memberId: z.string().min(1, "Member is required"),
});

export const scheduleFilterSchema = z.object({
  classId: z.string().optional(),
  instructorUserId: z.string().optional(),
  status: z.nativeEnum(ClassStatus).or(z.literal("ALL")).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type ClassCreateInput = z.input<typeof classCreateSchema>;
export type ClassUpdateInput = z.input<typeof classUpdateSchema>;
export type ClassScheduleCreateInput = z.input<typeof classScheduleCreateSchema>;
export type ClassScheduleUpdateInput = z.input<typeof classScheduleUpdateSchema>;
export type ClassBookingCreateInput = z.input<typeof classBookingCreateSchema>;
export type ScheduleFilterParams = z.input<typeof scheduleFilterSchema>;
