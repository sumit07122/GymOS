import { z } from "zod";

// ==============================================================================
// FIXIA GymOS — Membership & Plan Validation Schemas
// ==============================================================================

export const planCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Plan name is required")
    .max(100, "Plan name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  durationDays: z.coerce
    .number()
    .int("Duration must be a whole number of days")
    .positive("Duration must be at least 1 day")
    .max(3650, "Duration cannot exceed 10 years (3650 days)"),
  price: z.coerce
    .number()
    .min(0, "Price cannot be negative")
    .max(1000000, "Price cannot exceed 1,000,000"),
  admissionFee: z.coerce
    .number()
    .min(0, "Admission fee cannot be negative")
    .max(1000000, "Admission fee cannot exceed 1,000,000")
    .default(0),
  maxSessions: z.coerce
    .number()
    .int("Max sessions must be an integer")
    .positive("Max sessions must be positive")
    .optional()
    .nullable()
    .or(z.literal("")),
  benefits: z
    .string()
    .trim()
    .max(2000, "Benefits cannot exceed 2000 characters")
    .optional()
    .or(z.literal("")),
  accessRestrictions: z
    .string()
    .trim()
    .max(500, "Access restrictions cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const planUpdateSchema = planCreateSchema.partial().extend({
  id: z.string().uuid("Invalid plan ID"),
});

export const membershipAssignSchema = z.object({
  memberId: z.string().uuid("Invalid member ID"),
  planId: z.string().uuid("Invalid plan ID"),
  startDate: z
    .string()
    .trim()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val);
      return !isNaN(d.getTime());
    }, "Start date must be a valid date"),
  customPrice: z.coerce
    .number()
    .min(0, "Price cannot be negative")
    .optional()
    .nullable()
    .or(z.literal("")),
  customAdmissionFee: z.coerce
    .number()
    .min(0, "Admission fee cannot be negative")
    .optional()
    .nullable()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export const membershipRenewSchema = z.object({
  membershipId: z.string().uuid("Invalid membership ID"),
  planId: z.string().uuid("Invalid plan ID").optional().or(z.literal("")),
  startDate: z
    .string()
    .trim()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val);
      return !isNaN(d.getTime());
    }, "Start date must be a valid date"),
  customPrice: z.coerce
    .number()
    .min(0, "Price cannot be negative")
    .optional()
    .nullable()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export const membershipExtendSchema = z.object({
  membershipId: z.string().uuid("Invalid membership ID"),
  extensionDays: z.coerce
    .number()
    .int("Extension days must be a whole number")
    .positive("Extension must be at least 1 day")
    .max(365, "Extension cannot exceed 365 days"),
  reason: z
    .string()
    .trim()
    .min(2, "Reason must be at least 2 characters")
    .max(255, "Reason cannot exceed 255 characters"),
});

export const membershipPauseSchema = z.object({
  membershipId: z.string().uuid("Invalid membership ID"),
  reason: z
    .string()
    .trim()
    .min(2, "Reason must be at least 2 characters")
    .max(255, "Reason cannot exceed 255 characters"),
});

export const membershipResumeSchema = z.object({
  membershipId: z.string().uuid("Invalid membership ID"),
});

export const membershipCancelSchema = z.object({
  membershipId: z.string().uuid("Invalid membership ID"),
  cancellationReason: z
    .string()
    .trim()
    .min(2, "Cancellation reason must be at least 2 characters")
    .max(255, "Cancellation reason cannot exceed 255 characters"),
});

export type PlanCreateInput = z.infer<typeof planCreateSchema>;
export type PlanUpdateInput = z.infer<typeof planUpdateSchema>;
export type MembershipAssignInput = z.infer<typeof membershipAssignSchema>;
export type MembershipRenewInput = z.infer<typeof membershipRenewSchema>;
export type MembershipExtendInput = z.infer<typeof membershipExtendSchema>;
export type MembershipPauseInput = z.infer<typeof membershipPauseSchema>;
export type MembershipResumeInput = z.infer<typeof membershipResumeSchema>;
export type MembershipCancelInput = z.infer<typeof membershipCancelSchema>;

