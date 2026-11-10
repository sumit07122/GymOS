import { z } from "zod";

// ==============================================================================
// FIXIA GymOS — Member Portal Validation Schemas (M15)
// ==============================================================================

export const memberProfileUpdateSchema = z.object({
  phone: z.string().max(30).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  emergencyContactName: z.string().max(100).optional().nullable(),
  emergencyContactPhone: z.string().max(30).optional().nullable(),
});

export type MemberProfileUpdateInput = z.infer<typeof memberProfileUpdateSchema>;

export const memberWeightLogSchema = z.object({
  weightKg: z.coerce
    .number()
    .positive("Weight must be a positive number")
    .min(20, "Weight must be at least 20 kg")
    .max(350, "Weight must be less than 350 kg"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional().nullable(),
});

export type MemberWeightLogInput = z.infer<typeof memberWeightLogSchema>;

export const memberMeasurementLogSchema = z.object({
  chestCm: z.coerce.number().positive().max(250).optional().nullable(),
  waistCm: z.coerce.number().positive().max(250).optional().nullable(),
  hipsCm: z.coerce.number().positive().max(250).optional().nullable(),
  bicepsCm: z.coerce.number().positive().max(100).optional().nullable(),
  thighsCm: z.coerce.number().positive().max(150).optional().nullable(),
  calvesCm: z.coerce.number().positive().max(100).optional().nullable(),
  bodyFatPct: z.coerce.number().positive().max(75).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export type MemberMeasurementLogInput = z.infer<typeof memberMeasurementLogSchema>;

export const memberBookClassSchema = z.object({
  scheduleId: z.string().min(1, "Schedule ID is required"),
});

export const memberCancelBookingSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
});

